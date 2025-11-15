import { z } from 'zod'

// 统一的 Action 返回值类型
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Todo 相关类型
export interface TodoData {
  id: string
  text: string
  completed: boolean
  order: number
  detailMarkdown?: string | null
  createdAt: Date
}

// Zod 验证 Schemas
export const CreateTodoSchema = z.object({
  text: z
    .string()
    .min(1, 'Todo text is required')
    .max(500, 'Todo text must be less than 500 characters')
    .trim()
})

export const UpdateTodoTextSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
  text: z
    .string()
    .min(1, 'Todo text is required')
    .max(500, 'Todo text must be less than 500 characters')
    .trim()
})

export const UpdateTodoDetailSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
  detailMarkdown: z
    .string()
    .max(10000, 'Todo detail must be less than 10,000 characters')
    .optional()
    .default('')
})

export const ToggleTodoSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
  completed: z.boolean()
})

export const DeleteTodoSchema = z.object({
  id: z.string().uuid('Invalid todo ID format')
})

export const ReorderTodosSchema = z.object({
  orderedIds: z
    .array(z.string().uuid('Invalid todo ID format'))
    .min(1, 'At least one todo ID is required')
    .max(1000, 'Too many todos to reorder at once')
})

// 导出类型推导
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>
export type UpdateTodoTextInput = z.infer<typeof UpdateTodoTextSchema>
export type UpdateTodoDetailInput = z.infer<typeof UpdateTodoDetailSchema>
export type ToggleTodoInput = z.infer<typeof ToggleTodoSchema>
export type DeleteTodoInput = z.infer<typeof DeleteTodoSchema>
export type ReorderTodosInput = z.infer<typeof ReorderTodosSchema>