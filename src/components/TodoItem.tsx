'use client'

import { toggleTodoAction, deleteTodoAction } from '@/app/actions'
import { useState, useTransition } from 'react'
import type { Todo } from '@prisma/client'
import { updateTodoTextAction } from '@/app/actions'

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit
}: {
  todo: Todo
  onToggle?: (id: string, nextCompleted: boolean) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, nextText: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(todo.text)

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

  const handleStartEdit = () => {
    setValue(todo.text)
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setValue(todo.text)
  }

  const handleSaveEdit = () => {
    const next = value.trim()
    if (!next || next === todo.text) {
      setEditing(false)
      return
    }
    startTransition(() => {
      updateTodoTextAction(todo.id, next)
    })
    onEdit?.(todo.id, next)
    setEditing(false)
  }

  return (
    <li className="flex items-center gap-3" style={{ opacity: isPending ? 0.5 : 1 }}>
      <input type="checkbox" checked={todo.completed} onChange={handleToggle} disabled={isPending} />
      {editing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border border-sky-300 rounded px-2 py-1 w-full"
        />
      ) : (
        <span className={todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}>{todo.text}</span>
      )}
      {editing ? (
        <div className="ml-auto flex gap-2">
          <button onClick={handleSaveEdit} disabled={isPending} className="text-sky-600 hover:text-sky-500">
            保存
          </button>
          <button onClick={handleCancelEdit} className="text-slate-500 hover:text-slate-400">
            取消
          </button>
        </div>
      ) : (
        <div className="ml-auto flex gap-3">
          <button onClick={handleStartEdit} className="text-sky-600 hover:text-sky-500">
            编辑
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-rose-500 hover:text-rose-400">
            删除
          </button>
        </div>
      )}
    </li>
  )
}
