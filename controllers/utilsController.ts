import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { commandInjectionSecurityEnabled } from 'controllers/securityController';
import { shouldBlockOverwrite, validateFilePath, getOverwriteBlockedMessage } from 'utils/pathTraversalValidation.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FILES_DIR = path.join(__dirname, '../files')

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

const getMimeType = (filePath: string): string | null => {
  const extension = path.extname(filePath).toLowerCase()
  return IMAGE_MIME_TYPES[extension] ?? null
}

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

  const validation = validateFilePath(file, FILES_DIR)

  if (!validation.valid) {
    return res.status(400).send(validation.error)
  }

  const mimeType = getMimeType(validation.resolvedPath)

  if (mimeType) {
    fs.readFile(validation.resolvedPath, (err, data) => {
      if (err) {
        return res.status(404).send('Plik nie istnieje')
      }

      res.setHeader('Content-Type', mimeType)
      res.send(data)
    })
    return
  }

  fs.readFile(validation.resolvedPath, 'utf8', (err, data) => {
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

  const validation = validateFilePath(filename, FILES_DIR);

  if (!validation.valid) {
    return res.status(400).send(validation.error);
  }

  if (shouldBlockOverwrite(validation.resolvedPath)) {
    return res.status(400).send(getOverwriteBlockedMessage());
  }

  fs.writeFile(validation.resolvedPath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).send('Błąd zapisu pliku.');
    }
    res.send('Plik zapisany.');
  });
};
