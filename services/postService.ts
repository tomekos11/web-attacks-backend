import { dbService } from './dbService';

const getAllPosts = async () => {
  const db = await dbService
  return db.all('SELECT * FROM posts ORDER BY createdAt DESC')
}

const createPost = async (userId, userName, userNumber, title, content) => {
  const createdAt = new Date().toISOString()

  const db = await dbService

  const result = await db.run(
    'INSERT INTO posts (userId, userName, userNumber, title, content, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, userName, userNumber, title, content, createdAt],
  )

  console.log(result)

  const postId = result.lastID;

  return {
    id: postId,
    title,
    content,
    userName,
    userNumber,
    createdAt,
  }
}

const deletePost = async (id) => {
  const db = await dbService

  const post = await db.get('SELECT * FROM posts WHERE id = ?', [id])
  if (!post) return false

  await db.run('DELETE FROM posts WHERE id = ?', [id])
  return true
}

export const postService = {
  getAllPosts,
  createPost,
  deletePost,
}
