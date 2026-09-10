import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const postsTable = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId'),
  userName: text('userName'),
  userNumber: text('userNumber'),
  title: text('title'),
  content: text('content'),
  createdAt: text('createdAt'),
})

const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  password: text('password').notNull(),
  userNumber: text('userNumber'),
  role: text('role').notNull(),
})

let ormDb: ReturnType<typeof drizzle> | null = null

const getOrm = () => {
  if (!ormDb) {
    const sqlite = new Database('./database.db', { readonly: true })
    ormDb = drizzle(sqlite)
  }
  return ormDb
}

export const ormGetPostById = (id: number) => {
  const db = getOrm()
  return db.select().from(postsTable).where(eq(postsTable.id, id)).get()
}

export const ormGetUserByUsername = (username: string) => {
  const db = getOrm()
  return db.select().from(usersTable).where(eq(usersTable.username, username)).get()
}
