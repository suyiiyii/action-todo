import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { updateTodoDetailFromFormAction } from '@/app/actions'

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
              {todo.detailMarkdown ? (
                <div className="prose prose-sm max-w-none text-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                    {todo.detailMarkdown}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">还没有详情内容</p>
              )}
            </div>

            <form action={updateTodoDetailFromFormAction} className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-800 flex flex-col gap-3">
              <input type="hidden" name="id" value={id} />
              <label className="text-sm font-medium">编辑详情（支持 Markdown）</label>
              <textarea name="detail" defaultValue={todo.detailMarkdown || ''} className="border border-sky-300 rounded px-3 py-2 w-full min-h-40 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"></textarea>
              <button type="submit" className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-500 w-fit">保存详情</button>
            </form>
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