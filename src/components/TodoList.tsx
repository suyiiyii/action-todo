"use client"

import type { Todo } from '@prisma/client'
import TodoItem from '@/components/TodoItem'
import { useState } from 'react'
import { reorderTodosAction } from '@/app/actions'

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [items, setItems] = useState(todos)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  if (!items.length) {
    return <p className="text-zinc-600">暂无待办事项</p>
  }

  const handleDragStart = (id: string) => (e: React.DragEvent<HTMLLIElement>) => {
    setDraggingId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (id: string) => (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (targetId: string) => async (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetId) return

    const sourceIndex = items.findIndex((t) => t.id === sourceId)
    const targetIndex = items.findIndex((t) => t.id === targetId)
    if (sourceIndex === -1 || targetIndex === -1) return

    const next = [...items]
    const [moved] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, moved)
    setItems(next)

    const orderedIds = next.map((t) => t.id)
    await reorderTodosAction(orderedIds)
    setDraggingId(null)
  }

  const handleDragEnd = () => setDraggingId(null)

  return (
    <ul className="flex flex-col gap-2">
      {items.map((todo) => (
        <li
          key={todo.id}
          draggable
          onDragStart={handleDragStart(todo.id)}
          onDragOver={handleDragOver(todo.id)}
          onDrop={handleDrop(todo.id)}
          onDragEnd={handleDragEnd}
          className={
            'rounded border border-sky-200 hover:border-sky-400 p-2 cursor-move bg-white shadow-sm' +
            (draggingId === todo.id ? ' opacity-60 bg-sky-100' : '')
          }
        >
          <TodoItem todo={todo} />
        </li>
      ))}
    </ul>
  )
}
