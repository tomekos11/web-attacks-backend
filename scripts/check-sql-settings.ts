import { initDb } from '../config/db.js'

const db = await initDb()
const rows = await db.all("SELECT name, isActive FROM security_settings WHERE name LIKE '%sql%' ORDER BY name")
console.log(rows)
await db.close()
