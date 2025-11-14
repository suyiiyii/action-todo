import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const ssl = { rejectUnauthorized: false }
const pool = new Pool({ connectionString, ssl })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })

// 首次使用时自动建表（免 migrate deploy）
export async function ensureTable() {
  const direct = process.env.DIRECT_URL
  if (direct) {
    const poolDirect = new Pool({ connectionString: direct, ssl })
    const adapterDirect = new PrismaPg(poolDirect)
    const prismaDirect = new PrismaClient({ adapter: adapterDirect })
    try {
      await prismaDirect.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Todo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "text" TEXT NOT NULL,
          "completed" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "order" INTEGER NOT NULL DEFAULT 0
        );`
    } finally {
      await prismaDirect.$disconnect()
      await poolDirect.end()
    }
  } else {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Todo" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "text" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "order" INTEGER NOT NULL DEFAULT 0
      );`
  }
}
