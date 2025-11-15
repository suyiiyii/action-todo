'use client'

import { toggleTodoAction, deleteTodoAction, updateTodoTextAction } from '@/app/actions'
import { useState, useTransition } from 'react'
import type { Todo } from '@prisma/client'

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
  const [error, setError] = useState<string | null>(null)

  const handleToggle = () => {
    if (isPending) return

    setError(null)
    startTransition(async () => {
      const result = await toggleTodoAction(todo.id, !todo.completed)
      if (!result.success) {
        setError(result.error || 'Failed to toggle todo')
        return
      }
      onToggle?.(todo.id, !todo.completed)
    })
  }

  const handleDelete = () => {
    if (isPending) return

    if (!confirm('确定要删除这个待办事项吗？')) {
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await deleteTodoAction(todo.id)
      if (!result.success) {
        setError(result.error || 'Failed to delete todo')
        return
      }
      onDelete?.(todo.id)
    })
  }

  const handleStartEdit = () => {
    setValue(todo.text)
    setEditing(true)
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setValue(todo.text)
    setError(null)
  }

  const handleSaveEdit = () => {
    if (isPending) return

    const next = value.trim()
    if (!next) {
      setError('Todo text is required')
      return
    }
    if (next === todo.text) {
      handleCancelEdit()
      return
    }

    setEditing(false)
    setError(null)
    startTransition(async () => {
      const result = await updateTodoTextAction(todo.id, next)
      if (!result.success) {
        setError(result.error || 'Failed to update todo')
        // 回滚状态
        setValue(todo.text)
        setEditing(true)
        return
      }
      onEdit?.(todo.id, next)
    })
  }

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3" style={{ opacity: isPending ? 0.5 : 1 }}>
        {/* 复选框 - 添加可访问性属性 */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={isPending}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          className="w-4 h-4"
        />

        {/* 文本内容或编辑输入框 */}
        {editing ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            className="border border-sky-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            aria-label="Edit todo text"
            autoFocus
          />
        ) : (
          <span
            className={`flex-1 ${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
            role="text"
          >
            {todo.text}
          </span>
        )}

        {/* 操作按钮 */}
        {editing ? (
          <div className="ml-auto flex gap-2" role="group" aria-label="Edit actions">
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="text-sky-600 hover:text-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Save changes"
            >
              保存
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-slate-500 hover:text-slate-400"
              aria-label="Cancel editing"
            >
              取消
            </button>
          </div>
        ) : (
          <div className="ml-auto flex gap-3" role="group" aria-label="Todo actions">
            <button
              onClick={handleStartEdit}
              disabled={isPending}
              className="text-sky-600 hover:text-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Edit "${todo.text}"`}
            >
              编辑
            </button>
            <a
              href={`/todo/${todo.id}`}
              className="text-slate-600 hover:text-slate-500"
              aria-label={`View details of "${todo.text}"`}
            >
              详情
            </a>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-rose-500 hover:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Delete "${todo.text}"`}
            >
              删除
            </button>
          </div>
        )}
      </div>

      {/* 错误信息显示 */}
      {error && (
        <div
          className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-2 py-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  )
}
