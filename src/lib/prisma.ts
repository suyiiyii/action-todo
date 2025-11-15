import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 获取数据库连接配置
function getDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  // 简化的 SSL 配置
  const isProduction = process.env.NODE_ENV === 'production'
  const ssl = process.env.PG_SSL_VERIFY === 'true' || (!process.env.PG_SSL_VERIFY && isProduction)

  return {
    connectionString: databaseUrl,
    ssl: ssl ? { rejectUnauthorized: true } : { rejectUnauthorized: false }
  }
}

// 创建连接池和适配器
const dbConfig = getDatabaseConfig()
const pool = new Pool(dbConfig)
const adapter = new PrismaPg(pool)

// 创建 Prisma 客户端实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// 数据库健康检查
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { success: true, message: 'Database connection healthy' }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

// 确保表存在（简化版本）
export async function ensureTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Todo" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "text" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "order" INTEGER NOT NULL DEFAULT 0,
        "detailMarkdown" TEXT
      );
    `
    console.log('✅ Todo table ensured')
  } catch (error) {
    console.error('Failed to ensure Todo table:', error)
    throw new Error(
      `Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
