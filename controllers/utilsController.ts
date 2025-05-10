import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

 export const pingHost = (req, res) => {
  const name = req.query.name || 'localhost'
  const command = `cmd /c "ping -n 1 ${name}"`

  exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(error, stdout, stderr)
        console.error(`Błąd: ${error}`)
      return res.status(500).send(`Błąd:\n${stderr}`)
    }
    res.send(`Wynik:\n${stdout}`)
  })
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const getFile = (req, res) => {
  const file = req.query.file;
  const filePath = path.join(__dirname, '../files', file)

console.log(filePath)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('Plik nie istnieje');
    }
    res.send(data);
  });
};