# 部署到 Vercel 的说明

## 1. 环境变量
在 Vercel 控制台添加环境变量：
- `DATABASE_URL` 设置为 `file:./prisma/dev.db`（或 SQLite 文件路径）

## 2. 数据库
- 首次部署后，在 Vercel 的「Functions」中运行：
```bash
npx prisma migrate deploy
```
- 或使用 Vercel CLI：
```bash
vercel --prod
```

## 3. 构建命令
- 自动使用 `npm run build`，无需额外配置

## 4. 文件说明
- `vercel.json`：指定构建命令与输出目录
- `.env.local`：本地开发环境变量（已忽略上传）
- `prisma/migrations/`：数据库迁移脚本