import { sqlInjectionInputValidationEnabled } from 'controllers/securityController.js'
import { blockMessage } from 'utils/sqlInjectionMessages.js'

export const MAX_USERNAME_LENGTH = 64
export const MAX_PASSWORD_LENGTH = 128
export const MAX_INPUT_LENGTH = 128

const LOGIN_FIELD_REGEX = /^[a-zA-Z0-9@._-]+$/
const PASSWORD_FIELD_REGEX = /^[a-zA-Z0-9@._-]*$/

export type SqlInputValidationResult =
  | { valid: true }
  | { valid: false; error: string; blockedBy: 'sql-injection-input-validation' }

export const validateNumericId = (id: unknown): SqlInputValidationResult => {
  if (!sqlInjectionInputValidationEnabled) {
    return { valid: true }
  }

  if (id === undefined || id === null || id === '') {
    return {
      valid: false,
      error: blockMessage('sql-injection-input-validation', 'Brak parametru ID.'),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  const value = String(id)

  if (value.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      error: blockMessage(
        'sql-injection-input-validation',
        `ID przekracza maksymalną długość (${MAX_INPUT_LENGTH} znaków).`,
      ),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  if (!/^\d+$/.test(value)) {
    return {
      valid: false,
      error: blockMessage(
        'sql-injection-input-validation',
        'ID musi składać się wyłącznie z cyfr.',
      ),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  return { valid: true }
}

export const validateUsername = (username: unknown): SqlInputValidationResult => {
  if (!sqlInjectionInputValidationEnabled) {
    return { valid: true }
  }

  if (username === undefined || username === null || username === '') {
    return {
      valid: false,
      error: blockMessage('sql-injection-input-validation', 'Brak nazwy użytkownika.'),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  const value = String(username)

  if (value.length > MAX_USERNAME_LENGTH) {
    return {
      valid: false,
      error: blockMessage(
        'sql-injection-input-validation',
        `Login przekracza maksymalną długość (${MAX_USERNAME_LENGTH} znaków).`,
      ),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  if (!LOGIN_FIELD_REGEX.test(value)) {
    return {
      valid: false,
      error: blockMessage(
        'sql-injection-input-validation',
        'Login może zawierać tylko litery, cyfry oraz znaki @ . _ -.',
      ),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  return { valid: true }
}

export const validatePassword = (password: unknown): SqlInputValidationResult => {
  if (!sqlInjectionInputValidationEnabled) {
    return { valid: true }
  }

  if (password === undefined || password === null) {
    return {
      valid: false,
      error: blockMessage('sql-injection-input-validation', 'Brak hasła.'),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  const value = String(password)

  if (value.length > MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: blockMessage(
        'sql-injection-input-validation',
        `Hasło przekracza maksymalną długość (${MAX_PASSWORD_LENGTH} znaków).`,
      ),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  if (!PASSWORD_FIELD_REGEX.test(value)) {
    return {
      valid: false,
      error: blockMessage(
        'sql-injection-input-validation',
        'Hasło może zawierać tylko litery, cyfry oraz znaki @ . _ -.',
      ),
      blockedBy: 'sql-injection-input-validation',
    }
  }

  return { valid: true }
}
