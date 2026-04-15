# PlanRea

PlanRea 是一个 AI 驱动的项目规划原型，目标是把「目标 + 截止时间」转成可执行任务，并在仪表盘、任务、日历、专注等页面中进行管理与执行。

当前仓库是 **Monorepo（npm workspaces）**，已优先打通 Web 原型可运行链路。

## 当前状态

- Web 原型可本地启动（Next.js）
- 已包含核心页面：Dashboard / Tasks / Planner / Calendar / Focus / Recovery
- 部分能力仍是原型实现（含 mock 数据与待完善逻辑）

## 技术栈

- 前端：Next.js 14 + React 18 + TypeScript
- UI：Tailwind CSS + shadcn/ui
- 状态与数据：TanStack Query
- 动画与图表：Framer Motion + Recharts
- Monorepo：npm workspaces + Turborepo

## 项目结构

```text
PlanRea/
├─ apps/
│  └─ web/                 # Next.js Web 原型
├─ packages/
│  ├─ ai-core/             # AI 相关逻辑（进行中）
│  └─ shared/              # 共享类型/工具（进行中）
├─ prototype.md            # 产品与架构原型文档
├─ package.json            # 根脚本（已对齐可运行原型）
└─ turbo.json              # Turborepo 任务配置
```

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 启动 Web 原型

```bash
npm run dev
```

默认访问地址：

- `http://localhost:3005`

如果 3005 端口被占用，可改端口启动：

```bash
npm run dev -w web -- -p 3006
```

## 常用命令

```bash
# 构建 web
npm run build

# lint web
npm run lint

# 对 web 做类型检查
npm run type-check
```

## 说明

- 根目录脚本当前聚焦在 **web 原型可跑** 的目标。
- `packages/ai-core` 与部分高级功能仍在迭代中，后续会逐步补齐完整构建与发布链路。
