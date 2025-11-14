import { prisma } from '@/lib/prisma'
import AddTodoForm from '@/components/AddTodoForm'
import TodoList from '@/components/TodoList'

export const dynamic = 'force-dynamic' // 强制动态渲染，不尝试静态生成

import { ensureTable } from '@/lib/prisma'

export default async function Home() {
  let todos: Awaited<ReturnType<typeof prisma.todo.findMany>> = []
  try {
    await ensureTable()
    todos = await prisma.todo.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    })
  } catch (e) {
    console.error('加载待办失败', e)
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-sky-100 font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6 bg-white rounded-xl shadow-md border border-sky-200">
        <h1 className="text-3xl font-semibold text-sky-900">My Todos</h1>
        {todos.length === 0 ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-800">
            <p className="font-medium">数据库连接失败或暂无数据</p>
            <p className="text-sm mt-1">请检查 Vercel 的 `DATABASE_URL` 是否配置为 Supabase Pooler 格式：`postgres.<project_ref>@aws-*-<region>.pooler.supabase.com:<5432|6543>/postgres`</p>
          </div>
        ) : null}
        <AddTodoForm />
        <TodoList todos={todos} />
      </main>
    </div>
  )
}
