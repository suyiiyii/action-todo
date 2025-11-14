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
        className="border px-3 py-2 rounded w-full"
      />
      <button type="submit" className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black">
        添加
      </button>
    </form>
  )
}
