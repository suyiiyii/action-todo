import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function TodoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 简单测试数据库连接
  let testResult = 'Unknown'
  try {
    const count = await prisma.todo.count()
    testResult = `✅ 数据库连接正常，共 ${count} 条记录`
  } catch (e) {
    testResult = `❌ 数据库连接失败: ${String(e)}`
  }

  let todo: Awaited<ReturnType<typeof prisma.todo.findUnique>> | null = null
  let loadError: Error | null = null
  try {
    todo = await prisma.todo.findUnique({ where: { id } })
  } catch (e) {
    loadError = e instanceof Error ? e : new Error(String(e))
    console.error('加载待办详情失败', e)
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-sky-100 font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6 bg-white rounded-xl shadow-md border border-sky-200">

        {/* 显示数据库测试结果 */}
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-800">
          <p className="font-medium">数据库连接测试:</p>
          <p className="text-sm">{testResult}</p>
        </div>

        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">查询待办失败</p>
            <p className="text-sm mt-1">错误: {loadError.message}</p>
          </div>
        ) : todo ? (
          <>
            <h1 className="text-2xl font-semibold text-sky-900">{todo.text}</h1>
            <div className="text-sm text-slate-600">
              状态：{todo.completed ? '已完成' : '未完成'} ·
              创建于 {new Date(todo.createdAt).toLocaleString()} ·
              ID: {todo.id}
            </div>

            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-800">
              <p className="font-medium mb-2">详情内容:</p>
              <p className="text-sm">
                {todo.detailMarkdown ? todo.detailMarkdown : '还没有详情内容'}
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-sky-900">Todo 未找到</h1>
            <p className="text-slate-600">ID: {id}</p>
          </>
        )}

        <a href="/" className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-500 w-fit">
          返回首页
        </a>
      </main>
    </div>
  )
}