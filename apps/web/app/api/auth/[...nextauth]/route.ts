import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// 创建 NextAuth handler
const handler = NextAuth(authOptions);

// 导出 GET 和 POST 处理器
export { handler as GET, handler as POST };
