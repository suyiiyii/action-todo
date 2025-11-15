# Action Todo

一个基于 Next.js App Router 的 Todo 应用，使用 Prisma + Supabase PostgreSQL（连接池）与 Server Actions，实现增删改查与拖拽排序。

## 功能

- 创建、编辑、删除待办事项
- 标记完成/未完成状态
- 拖拽重新排序（持久化顺序）
- Server Actions + 乐观更新
- 响应式 UI（Tailwind）

## 技术栈

- Next.js 16（App Router）
- React 19
- Prisma 6 + `@prisma/adapter-pg` + `pg`
- Supabase PostgreSQL（Session/Transaction Pooler）
- Tailwind CSS 4

## 环境变量

本地开发请在项目根目录创建 `.env.local`（已在 `.gitignore` 忽略），示例：

```
DATABASE_URL="postgresql://postgres.<project_ref>:<PASSWORD>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.<project_ref>:<PASSWORD>@aws-1-<region>.pooler.supabase.com:5432/postgres?sslmode=require"

# 如需使用 Supabase JS（本项目默认不需），可按需配置：
NEXT_PUBLIC_SUPABASE_URL=https://<project_ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
```

说明：

- `DATABASE_URL` 用于运行时查询（连接池）；用户名必须为 `postgres.<project_ref>`，主机名与区域需以控制台显示为准，端口可选 `5432`（Session）或 `6543`（Transaction）。
- `DIRECT_URL` 仅用于迁移/建表等 DDL 操作；如果你的直连主机为 `db.<project_ref>.supabase.co:5432`，也可替换为该地址。
- 线上环境变量请使用 Vercel 的 Environment Variables 管理，切勿将凭据提交到仓库。

## 开发与运行

本地开发：

```
npm run dev
# http://localhost:3000
```

本地生产模式验证：

```
npm run build && PORT=3001 npm run start
# http://localhost:3001
```

## 部署到 Vercel

使用 Vercel CLI 设置环境变量并部署：

```
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel --prod
```

如需强制重部署：

```
vercel --prod --force
```

## 注意事项

- Supabase 连接池的主机名因区域不同可能是 `aws-0-...` 或 `aws-1-...`；必须以控制台显示为准。
- Pooler 识别租户依赖用户名，必须使用 `postgres.<project_ref>`，否则会报错 `FATAL: Tenant or user not found`。
- 如果遇到 TLS 证书校验问题，请在 `pg` 连接中启用 `ssl` 并配置 CA；本项目为兼容性默认开启了宽松校验。生产环境建议改为严格校验并加载 CA。

## 版本

- 当前稳定版本：`v1.0.0`
  - Release: https://github.com/suyiiyii/action-todo/releases/tag/v1.0.0
