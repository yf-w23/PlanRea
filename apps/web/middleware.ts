import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 配置需要保护的路由
export const config = {
  matcher: [
    // 保护 dashboard 及其子路由
    "/dashboard",
    "/dashboard/:path*",
    // 保护其他需要登录的路由
    "/settings/:path*",
    "/profile/:path*",
    "/projects/:path*",
    "/planner",
    "/planner/:path*",
    "/calendar",
    "/calendar/:path*",
    "/tasks",
    "/tasks/:path*",
    "/focus",
    "/focus/:path*",
    "/recovery",
    "/recovery/:path*",
    "/api/protected/:path*",
  ],
};

// 创建中间件
export default withAuth(
  // 中间件函数
  function middleware(req) {
    // 可以在这里添加额外的逻辑
    // 例如：角色检查、权限验证等

    // 获取 token
    const token = req.nextauth.token;

    // 示例：检查特定路由的权限
    // if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
    //   return NextResponse.redirect(new URL("/unauthorized", req.url));
    // }

    return NextResponse.next();
  },
  {
    // 认证配置
    callbacks: {
      // 控制是否授权访问
      authorized({ req, token }) {
        // 如果有 token，则授权访问
        if (token) return true;

        // 对于 API 路由，返回 401
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return false;
        }

        // 对于页面路由，会重定向到登录页
        return false;
      },
    },
    // 自定义登录页面
    pages: {
      signIn: "/login",
    },
  }
);

// 导出简单的中间件配置（如果不想使用 withAuth）
// export function middleware(req: NextRequest) {
//   // 自定义中间件逻辑
//   return NextResponse.next();
// }
