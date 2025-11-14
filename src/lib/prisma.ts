import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })

// 首次使用时自动建表（免 migrate deploy）
export async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Todo" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "text" TEXT NOT NULL,
      "completed" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "order" INTEGER NOT NULL DEFAULT 0
    );`
}
