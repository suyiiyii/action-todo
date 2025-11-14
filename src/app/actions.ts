'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTodoAction(formData: FormData) {
  const text = formData.get('text')?.toString().trim()
  if (!text) return

  await prisma.todo.create({
    data: { text }
  })

  revalidatePath('/')
}

export async function toggleTodoAction(id: string, completed: boolean) {
  await prisma.todo.update({
    where: { id },
    data: { completed }
  })

  revalidatePath('/')
}

export async function deleteTodoAction(id: string) {
  await prisma.todo.delete({
    where: { id }
  })

  revalidatePath('/')
}
