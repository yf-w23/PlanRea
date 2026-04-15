import { NextAuthOptions } from "next-auth";
import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";

// 用户类型定义
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// 模拟用户数据库（实际项目中应使用真实数据库）
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", // 实际项目中应使用哈希密码
    image: null,
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider - 邮箱密码登录
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email", placeholder: "your@email.com" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 验证用户凭证（实际项目中应查询数据库）
        const user = users.find((u) => u.email === credentials.email);

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  // 使用 JWT session strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  // 回调函数
  callbacks: {
    // JWT 回调 - 在 token 创建和更新时调用
    async jwt({ token, user, account, profile }) {
      // 初始登录时，将用户信息添加到 token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    // Session 回调 - 在 session 被访问时调用
    async session({ session, token }) {
      // 将 token 中的信息添加到 session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
    // 登录回调 - 控制重定向
    async redirect({ url, baseUrl }) {
      // 允许相对路径的重定向
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 允许同一来源的重定向
      if (url.startsWith(baseUrl)) return url;
      // 默认重定向到 dashboard
      return `${baseUrl}/dashboard`;
    },
    // 登录回调 - 控制用户是否可以登录
    async signIn({ user, account, profile }) {
      // 可以在这里添加额外的验证逻辑
      // 例如：检查用户是否被禁用，或者记录登录日志
      return true;
    },
  },
  // 页面配置
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // 错误页面
    newUser: "/dashboard", // 新用户注册后跳转
  },
  // 调试模式（开发环境开启）
  debug: process.env.NODE_ENV === "development",
  // 密钥（用于加密 JWT）
  secret: process.env.NEXTAUTH_SECRET,
};

// 获取服务端 session 的封装
export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

// 要求登录的辅助函数 - 用于 Server Components
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

// 获取当前用户 - 用于 Server Components
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession();
  return session?.user as User | null;
}

// 检查用户是否已登录 - 用于 Server Components
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return !!session;
}
