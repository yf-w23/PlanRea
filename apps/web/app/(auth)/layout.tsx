import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "认证 - PlanRea",
  description: "登录或注册 PlanRea 账号",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo 区域 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PlanRea</h1>
          <p className="text-muted-foreground mt-1">智能排程与资源管理平台</p>
        </div>
        
        {/* 内容区域 */}
        <div className="bg-card border rounded-2xl shadow-lg p-6 sm:p-8">
          {children}
        </div>
        
        {/* 底部信息 */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          继续使用即表示您同意我们的{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            服务条款
          </a>{" "}
          和{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            隐私政策
          </a>
        </p>
      </div>
    </div>
  );
}
