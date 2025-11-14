import { prisma } from '@/lib/prisma'
import AddTodoForm from '@/components/AddTodoForm'
import TodoList from '@/components/TodoList'

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
  })

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">My Todos</h1>
        <AddTodoForm />
        <TodoList todos={todos} />
      </main>
    </div>
  )
}
