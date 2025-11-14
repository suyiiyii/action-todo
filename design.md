
### 📅 需求文档 (RD): 简单的 Todo 应用

#### 1\. 项目愿景

构建一个极快、响应灵敏的单页待办事项列表，该列表的数据在服务器上持久化，并且在添加、更新或删除条目时**无需整页刷新**即可立即更新。

#### 2\. 核心功能 (MVP)

  * **F1 (创建):** 用户必须能够添加一个新的 Todo 项。
      * **U1.1:** 页面顶部应有一个输入框和一个“添加”按钮。
      * **U1.2:** 用户在输入框中输入文本，点击“添加”。
      * **U1.3:** 该新条目应立即出现在列表中（无需手动刷新）。
      * **U1.4:** 添加后，输入框应被清空。
  * **F2 (读取):** 用户必须能够在页面加载时看到所有现有的 Todo 项。
      * **U2.1:** 页面应进行服务器端渲染 (SSR)，以便在首次加载时立即显示所有 Todo。
      * **U2.2:** Todo 列表应按创建时间倒序排列（最新的在最上面）。
  * **F3 (更新):** 用户必须能够将 Todo 项标记为“已完成”或“未完成”。
      * **U3.1:** 每个 Todo 项旁边都有一个复选框 (Checkbox)。
      * **U3.2:** 点击复选框应立即切换该项的完成状态。
      * **U3.3:** 已完成的项应有视觉上的区分（例如，划掉的文本）。
  * **F4 (删除):** 用户必须能够删除一个 Todo 项。
      * **U4.1:** 每个 Todo 项旁边都有一个“删除”按钮。
      * **U4.2:** 点击“删除”应立即将该项从列表中移除。

#### 3\. 范围外 (Out of Scope for V1)

  * 用户认证（这是一个全局 Todo 列表）。
  * 编辑 Todo 项的文本。
  * 拖放排序。
  * 按（全部/已完成/未完成）过滤。

-----

### 📐 设计方案 (Technical Design)

本方案将**严格遵循**最新的 Next.js App Router 范式。我们将**不会**为 C/U/D 操作编写任何 API 路由 (`/api/*`)。

#### 1\. 技术栈

  * **框架:** Next.js 14+ (App Router)
  * **数据库:** **Prisma** (ORM) + **SQLite** (数据库)
      * *选择理由：* Prisma 提供了出色的类型安全；SQLite 是一个基于文件的数据库，无需安装或配置，非常适合快速原型开发。
  * **核心技术:**
      * **React Server Components (RSC):** 用于 SSR 数据读取 (F2)。
      * **Server Actions:** 用于所有 C/U/D 操作 (F1, F3, F4)。
      * **Client Components (`"use client"`):** 用于提供交互性（按钮、复选框）。

#### 2\. 数据模型 (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db" // 简单的 SQLite 文件
}

model Todo {
  id          String   @id @default(uuid())
  text        String
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

#### 3\. 架构与组件设计

**核心原则：** “页面”是**服务器组件 (RSC)**，负责读取数据。“交互”是**客户端组件 (`"use client"`)**，负责调用 Server Actions。

```
/app
|
|-- page.js             <-- (服务器组件 - SSR) 负责 F2 (读取)
|-- actions.js          <-- (服务器文件) 包含所有 Server Actions (F1, F3, F4)
|
|-- /components
    |-- AddTodoForm.js  <-- (客户端组件) 负责 F1 (创建)
    |-- TodoList.js     <-- (服务器或客户端组件) 负责渲染列表
    |-- TodoItem.js     <-- (客户端组件) 负责 F3 (更新) 和 F4 (删除)
```

-----

#### 4\. 功能实现细节

**F2 (读取): `app/page.js` (RSC)**

这是您的第一个思维转变：不再 `useEffect`。

```javascript
// app/page.js
import { prisma } from '@/lib/prisma'; // 假设 Prisma 客户端在这里
import TodoList from '@/components/TodoList';
import AddTodoForm from '@/components/AddTodoForm';

// 这是一个“异步服务器组件”
export default async function Home() {
  // 1. (F2 - 读取)
  //    直接在组件中 await 数据库调用
  //    这在服务器上运行，浏览器永远看不到
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // 2. 将服务器数据作为 props 传递
  return (
    <div>
      <h1>My Todos</h1>
      <AddTodoForm />
      <TodoList todos={todos} />
    </div>
  );
}
```

**F1, F3, F4: `app/actions.js` (Server Actions)**

这是您所有“写入”逻辑的归宿。

```javascript
// app/actions.js
'use server'; // 关键！将此文件标记为服务器动作

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache'; // 刷新 UI 的“魔法”

// (F1 - 创建)
export async function createTodoAction(formData) {
  const text = formData.get('text');
  if (!text) return;

  await prisma.todo.create({
    data: { text },
  });

  revalidatePath('/'); // 关键！刷新根页面的数据
}

// (F3 - 更新)
export async function toggleTodoAction(id, completed) {
  await prisma.todo.update({
    where: { id },
    data: { completed },
  });

  revalidatePath('/');
}

// (F4 - 删除)
export async function deleteTodoAction(id) {
  await prisma.todo.delete({
    where: { id },
  });

  revalidatePath('/');
}
```

**交互层: 客户端组件**

**F1 (创建): `components/AddTodoForm.js`**

  * 我们将使用 `<form action={...}>`，这是最原生的方式。

<!-- end list -->

```javascript
// components/AddTodoForm.js
'use client'; // 客户端组件
import { createTodoAction } from '@/app/actions';
import { useRef } from 'react';

export default function AddTodoForm() {
  const formRef = useRef(null);

  return (
    // 1. 将 Server Action 直接传递给表单
    // 2. Next.js 会自动处理这个表单提交，
    //    并调用 `createTodoAction`
    <form
      action={async (formData) => {
        await createTodoAction(formData);
        formRef.current?.reset(); // 2. 重置表单
      }}
      ref={formRef}
    >
      <input type="text" name="text" />
      <button type="submit">添加</button>
    </form>
  );
}
```

**F3 & F4 (更新/删除): `components/TodoItem.js`**

  * 这是最能体现 Server Action 优雅之处的地方。

<!-- end list -->

```javascript
// components/TodoItem.js
'use client';

import { toggleTodoAction, deleteTodoAction } from '@/app/actions';
import { useTransition } from 'react';

// `todo` 对象从 SSR 页面 (page.js) 传递下来
export default function TodoItem({ todo }) {
  // useTransition 提供了乐观更新的 loading 状态
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // 2. 使用 startTransition 包裹 Server Action
    //    UI 会保持可交互，'isPending' 会变为 true
    startTransition(() => {
      // 3. 直接调用服务器函数
      toggleTodoAction(todo.id, !todo.completed);
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteTodoAction(todo.id);
    });
  };

  return (
    <li style={{ opacity: isPending ? 0.5 : 1 }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isPending}
      />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      <button onClick={handleDelete} disabled={isPending}>
        删除
      </button>
    </li>
  );
}
```
