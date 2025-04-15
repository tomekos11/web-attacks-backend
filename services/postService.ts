const dbService = require('../services/dbService.ts') // Importujemy dbService

const getAllPosts = async () => {
  // Zwrócenie wszystkich postów z bazy danych
  const db = await dbService // Otrzymujemy dostęp do bazy danych
  return db.all('SELECT * FROM posts ORDER BY createdAt DESC')
}

const createPost = async (userId, userName, userNumber, title, content) => {
  const createdAt = new Date().toISOString()

  const db = await dbService // Otrzymujemy dostęp do bazy danych

  const result = await db.run(
    'INSERT INTO posts (userId, userName, userNumber, title, content, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, userName, userNumber, title, content, createdAt],
  )

  return {
    id: result.lastID,
    title,
    content,
    userName,
    userNumber,
    createdAt,
  }
}

const deletePost = async (id) => {
  const db = await dbService // Otrzymujemy dostęp do bazy danych

  const post = await db.get('SELECT * FROM posts WHERE id = ?', [id])
  if (!post) return false

  await db.run('DELETE FROM posts WHERE id = ?', [id])
  return true
}

module.exports = {
  getAllPosts,
  createPost,
  deletePost,
}
