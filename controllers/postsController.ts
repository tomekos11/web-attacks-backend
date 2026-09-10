import { postService } from "services/postService.js"
import { webSocketManager } from "services/webSocketManager.js"
import { fetchPostById } from 'services/sqlQueryService.js'
import { validateNumericId } from 'utils/sqlInjectionValidation.js'

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


export const getPostById = async (req, res) => {
  const { id } = req.query

  const validation = validateNumericId(id)
  if (validation.valid === false) {
    return res.status(400).json({ error: validation.error, blockedBy: validation.blockedBy })
  }

  const result = await fetchPostById(String(id))

  if (result.ok === false) {
    return res.status(result.status).json({
      error: result.error,
      ...(result.blockedBy ? { blockedBy: result.blockedBy } : {}),
      ...(result.leakedError ? { sqlError: true } : {}),
    })
  }

  if (!result.row) {
    return res.status(404).json({ error: 'Post nie został znaleziony', found: false })
  }

  return res.json(result.row)
}
