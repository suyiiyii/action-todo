'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  ActionResult,
  TodoData,
  CreateTodoSchema,
  UpdateTodoTextSchema,
  UpdateTodoDetailSchema,
  ToggleTodoSchema
} from '@/types/actions'

export async function createTodoAction(formData: FormData): Promise<ActionResult<TodoData>> {
  try {
    // 提取文本内容
    let text = formData.get('text')?.toString().trim()
    if (!text) {
      for (const [key, value] of formData.entries()) {
        if (key.endsWith('_text')) {
          text = String(value).trim()
          break
        }
      }
    }

    // 使用 zod 验证输入
    const validatedInput = CreateTodoSchema.parse({ text })

    // 获取下一个 order 值
    const maxOrder = await prisma.todo.aggregate({ _max: { order: true } })
    const nextOrder = (maxOrder._max.order ?? -1) + 1

    // 创建 todo
    const todo = await prisma.todo.create({
      data: { text: validatedInput.text, order: nextOrder }
    })

    // 重新验证首页缓存
    revalidatePath('/')

    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to create todo:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data' }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create todo'
    }
  }
}

export async function toggleTodoAction(id: string, completed: boolean): Promise<ActionResult<TodoData>> {
  try {
    // 使用 zod 验证输入
    const validatedInput = ToggleTodoSchema.parse({ id, completed })

    // 更新 todo 状态
    const todo = await prisma.todo.update({
      where: { id: validatedInput.id },
      data: { completed: validatedInput.completed }
    })

    revalidatePath('/')

    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to toggle todo:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data' }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle todo'
    }
  }
}

export async function deleteTodoAction(id: string): Promise<ActionResult> {
  try {
    // 输入验证
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Valid todo ID is required' }
    }

    await prisma.todo.delete({
      where: { id }
    })

    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete todo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete todo'
    }
  }
}

export async function reorderTodosAction(orderedIds: string[]): Promise<ActionResult> {
  try {
    if (!orderedIds || !Array.isArray(orderedIds) || orderedIds.length === 0) {
      return { success: false, error: 'Valid ordered IDs array is required' }
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.todo.update({
          where: { id },
          data: { order: index }
        })
      )
    )

    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Failed to reorder todos:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder todos'
    }
  }
}

export async function updateTodoTextAction(id: string, text: string): Promise<ActionResult<TodoData>> {
  try {
    // 使用 zod 验证输入
    const validatedInput = UpdateTodoTextSchema.parse({ id, text: text.trim() })

    const todo = await prisma.todo.update({
      where: { id: validatedInput.id },
      data: { text: validatedInput.text }
    })

    revalidatePath('/')

    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to update todo text:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Invalid input data' }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update todo text'
    }
  }
}

export async function updateTodoDetailAction(id: string, md: string): Promise<ActionResult<TodoData>> {
  try {
    const next = md?.trim() ?? ''

    // 输入验证
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Valid todo ID is required' }
    }
    if (next.length > 10000) {
      return { success: false, error: 'Todo detail must be less than 10,000 characters' }
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: { detailMarkdown: next }
    })

    revalidatePath('/')
    revalidatePath(`/todo/${id}`)

    return { success: true, data: todo }
  } catch (error) {
    console.error('Failed to update todo detail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update todo detail'
    }
  }
}

// 为 Next.js 表单设计的 wrapper，返回 void
export async function updateTodoDetailFromFormAction(formData: FormData): Promise<void> {
  try {
    const id = String(formData.get('id') ?? '')
    const md = String(formData.get('detail') ?? '')

    // 输入验证
    if (!id) {
      throw new Error('Todo ID is required')
    }

    const result = await updateTodoDetailAction(id, md)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update todo detail')
    }
  } catch (error) {
    console.error('Failed to update todo detail from form:', error)
    throw error
  }
}
