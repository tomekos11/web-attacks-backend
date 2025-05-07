// const postService = require('../services/postService.ts')
// const webSocketManager = require('../services/webSocketManager.ts')

import { postService } from "services/postService.js"
import { webSocketManager } from "services/webSocketManager.js"

export const getAllPosts = async (req, res) => {
  try {
    const posts = await postService.getAllPosts()

    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania postów' })
  }
}

export const addPost = async (req, res) => {
  if (!req.session.userId) {
    return res.status(403).json({ error: 'Brak sesji użytkownika' })
  }

  console.log(req.params);

  console.log(req.body);

  console.log(req.query);

  const { title, content } = req.body
  if (!title || !content) {
    return res.status(400).json({ error: 'Tytuł i treść są wymagane' })
  }

  try {
    const newPost = await postService.createPost(
      req.session.userId,
      req.session.username,
      req.session.userNumber,
      title,
      content,
    )

    webSocketManager.broadcastNewPost(newPost);

    res.json({ message: 'Post dodany!' })
  } catch (err) {
    res.status(500).json({ error: 'Błąd dodawania posta' })
  }
}

export const deletePost = async (req, res) => {
  const { id } = req.params

  try {
    const deleted = await postService.deletePost(id)
    if (!deleted) {
      return res.status(404).json({ error: 'Post nie został znaleziony' })
    }

    res.json({ message: 'Post został usunięty' })
  } catch (err) {
    res.status(500).json({ error: 'Błąd usuwania posta' })
  }
}

// module.exports = {
//   getAllPosts,
//   addPost,
//   deletePost,
// }