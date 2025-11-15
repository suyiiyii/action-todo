-- 为 Todo 表增加详情字段（Markdown 文本）
ALTER TABLE "Todo" ADD COLUMN IF NOT EXISTS "detailMarkdown" TEXT;