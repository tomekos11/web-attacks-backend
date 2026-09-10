import { initDb, webAttacks } from '../config/db.js'

const db = await initDb()

for (const { name, description } of webAttacks.filter((item) => item.name.startsWith('path-traversal'))) {
  await db.run('INSERT OR IGNORE INTO security_settings (name, description) VALUES (?, ?)', [name, description])

  const groupRow = await db.get('SELECT id FROM security_groups WHERE name = ?', ['path-traversal'])
  const settingRow = await db.get('SELECT id FROM security_settings WHERE name = ?', [name])

  if (groupRow && settingRow) {
    await db.run(
      'INSERT OR IGNORE INTO security_groups_settings (securityGroupId, securitySettingId) VALUES (?, ?)',
      [groupRow.id, settingRow.id],
    )
  }
}

const rows = await db.all(
  "SELECT name, isActive FROM security_settings WHERE name LIKE 'path-traversal%' ORDER BY name",
)

console.log(rows)
await db.close()
