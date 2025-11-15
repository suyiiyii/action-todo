import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

function getSslConfig() {
  const isProd = process.env.NODE_ENV === 'production'
  const verifySwitch = process.env.PG_SSL_VERIFY
  const caB64 = process.env.PG_SSL_CA_B64
  const caText = process.env.PG_SSL_CA
  const cert = process.env.PG_SSL_CERT
  const key = process.env.PG_SSL_KEY
  
  // For Supabase, we need to handle SSL properly
  const ca = caB64 ? Buffer.from(caB64, 'base64').toString('utf8') : caText
  
  // Default SSL configuration for Supabase
  let ssl: any = { rejectUnauthorized: false } // Default to permissive for Supabase
  
  // Override with environment settings if provided
  if (verifySwitch === 'true') {
    ssl.rejectUnauthorized = true
  } else if (verifySwitch === 'false') {
    ssl.rejectUnauthorized = false
  }
  
  // Add CA certificate if provided
  if (ca) {
    ssl.ca = ca
    ssl.rejectUnauthorized = true // Enable verification if CA is provided
  }
  
  if (cert) ssl.cert = cert
  if (key) ssl.key = key
  
  console.log(`🔒 SSL Config: rejectUnauthorized=${ssl.rejectUnauthorized}, CA=${ca ? 'provided' : 'not provided'}`)
  
  return ssl
}

const ssl = getSslConfig()
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
          "order" INTEGER NOT NULL DEFAULT 0,
          "detailMarkdown" TEXT
        );`
    } catch (e: any) {
      const msg = String(e?.message || '')
      const host = (() => {
        try {
          const u = new URL(direct)
          return u.host
        } catch {
          return ''
        }
      })()
      if (msg.includes('self-signed certificate') || msg.includes('TLS')) {
        throw new Error(`TLS validation failed for ${host}. Provide PG_SSL_CA or PG_SSL_CA_B64 to trust the server certificate.`)
      }
      throw e
    } finally {
      await prismaDirect.$disconnect()
      await poolDirect.end()
    }
  } else {
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Todo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "text" TEXT NOT NULL,
          "completed" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "order" INTEGER NOT NULL DEFAULT 0,
          "detailMarkdown" TEXT
        );`
    } catch (e: any) {
      const msg = String(e?.message || '')
      const host = (() => {
        try {
          const u = new URL(connectionString || '')
          return u.host
        } catch {
          return ''
        }
      })()
      if (msg.includes('self-signed certificate') || msg.includes('TLS')) {
        throw new Error(`TLS validation failed for ${host}. Provide PG_SSL_CA or PG_SSL_CA_B64 to trust the server certificate.`)
      }
      throw e
    }
  }
}
