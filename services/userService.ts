// services/userService.ts
const bcrypt = require('bcryptjs')
const db = require('./dbService.ts') // Upewnij się, że importujesz odpowiednią instancję bazy danych

class UserService {
  // Rejestracja nowego użytkownika
  static async register(username, password) {
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username])
    if (existingUser) {
      throw new Error('Użytkownik o tym username już istnieje')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Dodanie nowego użytkownika
    await db.run('INSERT INTO users (username, password, role, userNumber) VALUES (?, ?, ?, ?)', [
      username,
      hashedPassword,
      'user', // Domyślna rola to 'user'
      '1', // Możesz dodać logikę przypisania odpowiedniego numeru użytkownika
    ])
  }

  // Logowanie użytkownika
  static async login(username, password) {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username])

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Nieprawidłowe dane logowania')
    }

    return user // Zwraca dane użytkownika
  }

  // Pobranie użytkownika po ID
  static async getUserById(userId) {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) {
      throw new Error('Użytkownik nie istnieje')
    }

    return user
  }

  // Pobranie użytkownika po username
  static async getUserByUsername(username) {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username])
    if (!user) {
      throw new Error('Użytkownik o tym username nie istnieje')
    }

    return user
  }

  // Sprawdzenie, czy użytkownik ma rolę administratora
  static async isAdmin(userId) {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) {
      throw new Error('Użytkownik nie istnieje')
    }

    return user.role === 'admin' // Zwraca true, jeśli użytkownik jest administratorem
  }
}

module.exports = UserService
