import { prisma } from '@/lib/prisma'
import AddTodoForm from '@/components/AddTodoForm'
import TodoList from '@/components/TodoList'

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
  })

  return (
    <div className="flex min-h-screen items-start justify-center bg-sky-100 font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6 bg-white rounded-xl shadow-md border border-sky-200">
        <h1 className="text-3xl font-semibold text-sky-900">My Todos</h1>
        <AddTodoForm />
        <TodoList todos={todos} />
      </main>
    </div>
  )
}
