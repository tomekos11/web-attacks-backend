const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

class DBService {
  constructor() {
    this.db = null
  }

  // Inicjalizacja bazy danych
  async connect() {
    if (this.db) return this.db // Jeśli połączenie już istnieje, zwróć je

    this.db = await open({
      filename: './database.db', // Ścieżka do bazy danych
      driver: sqlite3.Database,
    })

    return this.db
  }

  // Pobranie wszystkich danych z tabeli
  async all(query, params = []) {
    const db = await this.connect()
    return db.all(query, params)
  }

  // Pobranie jednego rekordu
  async get(query, params = []) {
    const db = await this.connect()
    return db.get(query, params)
  }

  // Wstawienie danych do tabeli
  async run(query, params = []) {
    const db = await this.connect()
    return db.run(query, params)
  }

  // Wykonanie zapytania typu "select"
  async exec(query) {
    const db = await this.connect()
    return db.exec(query)
  }

  // Zamknięcie połączenia z bazą danych
  async close() {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }
}

module.exports = new DBService()
