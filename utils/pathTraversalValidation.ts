import fs from 'fs'
import path from 'path'

import {
  getPathTraversalMode,
  pathTraversalBlockOverwriteEnabled,
} from 'controllers/securityController.js'

export type PathTraversalMode = 'none' | 'normalize' | 'resolve' | 'whitelist' | 'blacklist' | 'realpath'

export interface PathValidationResult {
  valid: boolean
  resolvedPath: string
  error?: string
}

const MECHANISM_LABELS: Record<
  Exclude<PathTraversalMode, 'none'>,
  { setting: string; description: string }
> = {
  normalize: {
    setting: 'path-traversal-normalize',
    description: 'path.normalize() oraz sprawdzenie prefiksu katalogu bazowego',
  },
  resolve: {
    setting: 'path-traversal-resolve',
    description: 'path.resolve() z wymuszeniem separatora po katalogu bazowym',
  },
  whitelist: {
    setting: 'path-traversal-whitelist',
    description: 'dozwolone są wyłącznie litery, cyfry, kropka, podkreślenie i myślnik',
  },
  blacklist: {
    setting: 'path-traversal-blacklist',
    description: 'odrzucono podejrzaną sekwencję (.., ukośniki, backslashe, %2e, %2f, %5c)',
  },
  realpath: {
    setting: 'path-traversal-realpath',
    description: 'fs.realpath() – kanoniczna ścieżka poza katalogiem bazowym',
  },
}

const blockMessage = (
  mode: Exclude<PathTraversalMode, 'none'>,
  reason: string,
): string => {
  const { setting, description } = MECHANISM_LABELS[mode]
  return `${reason} Ochrona: ${setting} (${description}).`
}

export const getOverwriteBlockedMessage = (): string =>
  'Plik już istnieje – nie można nadpisać. Ochrona: path-traversal-block-overwrite (blokada nadpisywania istniejących plików).'

const BLACKLISTED_PATTERNS = [
  /\.\./,
  /[\\/]/,
  /\0/,
  /%2e/i,
  /%2f/i,
  /%5c/i,
]

const containsBlacklistedPattern = (userInput: string): boolean => {
  return BLACKLISTED_PATTERNS.some((pattern) => pattern.test(userInput))
}

const isInsideBaseDir = (targetPath: string, baseDir: string): boolean => {
  const resolvedBase = path.resolve(baseDir)
  const resolvedTarget = path.resolve(targetPath)
  const baseWithSep = resolvedBase + path.sep

  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(baseWithSep)
}

export const validateFilePath = (
  userInput: string,
  baseDir: string,
  mode: PathTraversalMode = getPathTraversalMode(),
): PathValidationResult => {
  const filePath = path.join(baseDir, userInput)

  switch (mode) {
    case 'none':
      return { valid: true, resolvedPath: filePath }

    case 'normalize': {
      const normalizedPath = path.normalize(filePath)

      if (!normalizedPath.startsWith(baseDir)) {
        return {
          valid: false,
          resolvedPath: normalizedPath,
          error: blockMessage('normalize', 'Nieprawidłowa ścieżka.'),
        }
      }

      return { valid: true, resolvedPath: normalizedPath }
    }

    case 'resolve': {
      const resolvedPath = path.resolve(filePath)

      if (!isInsideBaseDir(resolvedPath, baseDir)) {
        return {
          valid: false,
          resolvedPath,
          error: blockMessage('resolve', 'Nieprawidłowa ścieżka.'),
        }
      }

      return { valid: true, resolvedPath }
    }

    case 'whitelist': {
      const safePattern = /^[a-zA-Z0-9._-]+$/

      if (!safePattern.test(userInput)) {
        return {
          valid: false,
          resolvedPath: filePath,
          error: blockMessage('whitelist', 'Nieprawidłowa nazwa pliku.'),
        }
      }

      const resolvedPath = path.resolve(baseDir, userInput)

      if (!isInsideBaseDir(resolvedPath, baseDir)) {
        return {
          valid: false,
          resolvedPath,
          error: blockMessage('whitelist', 'Nieprawidłowa ścieżka.'),
        }
      }

      return { valid: true, resolvedPath }
    }

    case 'blacklist': {
      if (containsBlacklistedPattern(userInput)) {
        return {
          valid: false,
          resolvedPath: filePath,
          error: blockMessage('blacklist', 'Nieprawidłowa nazwa pliku.'),
        }
      }

      const resolvedPath = path.resolve(baseDir, userInput)

      return { valid: true, resolvedPath }
    }

    case 'realpath': {
      const resolvedPath = path.resolve(baseDir, userInput)

      try {
        const realBaseDir = fs.realpathSync(baseDir)
        const realParentDir = fs.realpathSync(path.dirname(resolvedPath))
        const baseWithSep = realBaseDir + path.sep

        if (realParentDir !== realBaseDir && !realParentDir.startsWith(baseWithSep)) {
          return {
            valid: false,
            resolvedPath,
            error: blockMessage('realpath', 'Nieprawidłowa ścieżka.'),
          }
        }

        return { valid: true, resolvedPath }
      } catch {
        if (!isInsideBaseDir(resolvedPath, baseDir)) {
          return {
            valid: false,
            resolvedPath,
            error: blockMessage('realpath', 'Nieprawidłowa ścieżka.'),
          }
        }

        return { valid: true, resolvedPath }
      }
    }

    default:
      return { valid: true, resolvedPath: filePath }
  }
}

export const shouldBlockOverwrite = (targetPath: string): boolean => {
  return pathTraversalBlockOverwriteEnabled && fs.existsSync(targetPath)
}
