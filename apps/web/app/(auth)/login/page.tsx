import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight">欢迎回来</h2>
          <p className="text-sm text-muted-foreground mt-1">
            加载中...
          </p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
