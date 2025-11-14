'use client'

import { toggleTodoAction, deleteTodoAction } from '@/app/actions'
import { useTransition } from 'react'
import type { Todo } from '@prisma/client'

export default function TodoItem({
  todo,
  onToggle,
  onDelete
}: {
  todo: Todo
  onToggle?: (id: string, nextCompleted: boolean) => void
  onDelete?: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(() => {
      toggleTodoAction(todo.id, !todo.completed)
    })
    onToggle?.(todo.id, !todo.completed)
  }

  const handleDelete = () => {
    startTransition(() => {
      deleteTodoAction(todo.id)
    })
    onDelete?.(todo.id)
  }

  return (
    <li className="flex items-center gap-3" style={{ opacity: isPending ? 0.5 : 1 }}>
      <input type="checkbox" checked={todo.completed} onChange={handleToggle} disabled={isPending} />
      <span className={todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}>{todo.text}</span>
      <button onClick={handleDelete} disabled={isPending} className="ml-auto text-rose-500 hover:text-rose-400">
        删除
      </button>
    </li>
  )
}
