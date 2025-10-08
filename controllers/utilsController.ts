import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { pathTraversalSecurityEnabled, commandInjectionSecurityEnabled } from 'controllers/securityController';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export const pingHost = (req, res) => {
  let name = req.query.name || 'localhost'
  if (commandInjectionSecurityEnabled) {
    const safePattern = /^[a-zA-Z0-9\.\-]+$/
    if (!safePattern.test(name)) {
      return res.status(400).send('Nieprawidłowy host.')
    }
  }

  const command = `cmd /c "ping -n 1 ${name}"`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Błąd: ${error}`)
      return res.status(500).send(`Błąd:\n${stderr}`)
    }
    res.send(`Wynik:\n${stdout}`)
  })
}

export const getFile = (req, res) => {
  const file = req.query.file

  if (!file) {
    return res.status(400).send('Brak nazwy pliku.')
  }

  const baseDir = path.join(__dirname, '../files')

  const filePath = path.join(baseDir, file)

  if (pathTraversalSecurityEnabled) {
    const normalizedPath = path.normalize(filePath)

    if (!normalizedPath.startsWith(baseDir)) {
      return res.status(400).send('Nieprawidłowa ścieżka.')
    }
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('Plik nie istnieje')
    }
    res.send(data)
  })
}

export const uploadFile = (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).send('Brakuje danych.');
  }

  const baseDir = path.join(__dirname, '../files');
  const filePath = path.join(baseDir, filename);

  if (pathTraversalSecurityEnabled) {
    const normalizedPath = path.normalize(filePath);

    // Blokuj path traversal
    if (!normalizedPath.startsWith(baseDir)) {
      return res.status(400).send('Nieprawidłowa ścieżka.');
    }

    // Blokuj nadpisywanie istniejących plików
    if (fs.existsSync(normalizedPath)) {
      return res.status(400).send('Plik już istnieje – nie można nadpisać.');
    }
  }

  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).send('Błąd zapisu pliku.');
    }
    res.send('Plik zapisany.');
  });
};