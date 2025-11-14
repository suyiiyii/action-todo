import type { Todo } from '@prisma/client'
import TodoItem from '@/components/TodoItem'

export default function TodoList({ todos }: { todos: Todo[] }) {
  if (!todos.length) {
    return <p className="text-zinc-600">暂无待办事项</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
