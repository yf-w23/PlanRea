import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// 扩展 NextAuth 类型
declare module "next-auth" {
  /**
   * 扩展 Session 类型
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * 扩展 User 类型
   */
  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展 JWT 类型
   */
  interface JWT extends DefaultJWT {
    id?: string;
  }
}
