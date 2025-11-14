'use client'

import { createTodoAction } from '@/app/actions'
import { useRef } from 'react'

export default function AddTodoForm() {
  const formRef = useRef<HTMLFormElement | null>(null)

  return (
    <form
      action={async (formData: FormData) => {
        await createTodoAction(formData)
        formRef.current?.reset()
      }}
      ref={formRef}
      className="flex gap-2"
    >
      <input
        type="text"
        name="text"
        placeholder="输入待办事项"
        className="border border-sky-300 px-3 py-2 rounded w-full bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 placeholder-slate-400"
      />
      <button type="submit" className="px-4 py-2 rounded bg-sky-500 text-white hover:bg-sky-400 shadow">
        添加
      </button>
    </form>
  )
}
