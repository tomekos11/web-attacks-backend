export const adminMiddleware = (req, res, next) => {
  if (req.session.isAdmin) {
    return next() // Jeśli użytkownik jest administratorem, pozwalamy przejść do kolejnego middleware
  }

  return res.status(403).json({ error: 'Brak uprawnień administratora' }) // W przeciwnym razie 403 - Forbidden
}