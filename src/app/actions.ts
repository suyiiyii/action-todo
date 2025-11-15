'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTodoAction(formData: FormData) {
  let text = formData.get('text')?.toString().trim()
  if (!text) {
    for (const [key, value] of formData.entries()) {
      if (key.endsWith('_text')) {
        text = String(value).trim()
        break
      }
    }
  }
  if (!text) return

  const maxOrder = await prisma.todo.aggregate({ _max: { order: true } })
  const nextOrder = (maxOrder._max.order ?? -1) + 1

  await prisma.todo.create({
    data: { text, order: nextOrder }
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

export async function reorderTodosAction(orderedIds: string[]) {
  if (!orderedIds?.length) return
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.todo.update({ where: { id }, data: { order: index } })
    )
  )
  revalidatePath('/')
}

export async function updateTodoTextAction(id: string, text: string) {
  const next = text?.trim()
  if (!next) return
  await prisma.todo.update({
    where: { id },
    data: { text: next }
  })
  revalidatePath('/')
}

export async function updateTodoDetailAction(id: string, md: string) {
  const next = md?.trim() ?? ''
  await prisma.todo.update({
    where: { id },
    data: { detailMarkdown: next }
  })
  revalidatePath('/')
  revalidatePath(`/todo/${id}`)
}

export async function updateTodoDetailFromFormAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const md = String(formData.get('detail') ?? '')
  if (!id) return
  await updateTodoDetailAction(id, md)
}
