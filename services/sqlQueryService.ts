import {
  sqlInjectionErrorHandlingEnabled,
  sqlInjectionOrmEnabled,
  sqlInjectionParameterizedEnabled,
} from 'controllers/securityController.js'
import { checkLeastPrivilege } from 'services/dbPrivilegesService.js'
import { ormGetPostById, ormGetUserByUsername } from 'services/ormService.js'
import { dbService } from 'services/dbService.js'
import { blockMessage, type SqlInjectionMechanism } from 'utils/sqlInjectionMessages.js'

export const GENERIC_SQL_ERROR = 'Błąd serwera'

export type SqlQueryResult<T> =
  | { ok: true; row: T | undefined; skipPasswordCheck?: boolean }
  | { ok: false; status: number; error: string; blockedBy?: SqlInjectionMechanism; leakedError?: string }

const formatDbError = (err: Error): SqlQueryResult<never> => {
  if (sqlInjectionErrorHandlingEnabled) {
    console.error('SQL error (hidden from client):', err.message)
    return {
      ok: false,
      status: 500,
      error: blockMessage('sql-injection-error-handling', GENERIC_SQL_ERROR),
      blockedBy: 'sql-injection-error-handling',
      leakedError: err.message,
    }
  }

  return { ok: false, status: 500, error: err.message, leakedError: err.message }
}

const runRawGet = async <T>(query: string, params: unknown[] = []): Promise<SqlQueryResult<T>> => {
  const privilegeCheck = checkLeastPrivilege(query)
  if (privilegeCheck.allowed === false) {
    if (sqlInjectionErrorHandlingEnabled) {
      return {
        ok: false,
        status: 403,
        error: blockMessage(
          'sql-injection-error-handling',
          `${GENERIC_SQL_ERROR} (zapytanie zablokowane przez least privilege).`,
        ),
        blockedBy: 'sql-injection-error-handling',
      }
    }
    return {
      ok: false,
      status: 403,
      error: privilegeCheck.reason,
      blockedBy: privilegeCheck.blockedBy,
    }
  }

  try {
    const row = await dbService.get(query, params)
    return { ok: true, row: row as T | undefined }
  } catch (err) {
    return formatDbError(err as Error)
  }
}

export const isVulnerableSqlMode = () =>
  !sqlInjectionOrmEnabled && !sqlInjectionParameterizedEnabled

export const fetchPostById = async (id: string): Promise<SqlQueryResult<Record<string, unknown>>> => {
  if (sqlInjectionOrmEnabled) {
    try {
      const numericId = Number(id)
      if (Number.isNaN(numericId)) {
        return {
          ok: false,
          status: 400,
          error: blockMessage(
            'sql-injection-orm',
            'Nieprawidłowe ID — ORM akceptuje wyłącznie wartość numeryczną.',
          ),
          blockedBy: 'sql-injection-orm',
        }
      }

      const row = ormGetPostById(numericId)
      return { ok: true, row: row as Record<string, unknown> | undefined }
    } catch (err) {
      return formatDbError(err as Error)
    }
  }

  if (sqlInjectionParameterizedEnabled) {
    const query = 'SELECT * FROM posts WHERE id = ?'
    console.log('secure query', query, 'params:', id)
    return runRawGet(query, [id])
  }

  const query = `SELECT * FROM posts WHERE id = ${id}`
  console.log('vulnerable query', query)
  return runRawGet(query)
}

export const fetchUserForLogin = async (
  username: string,
  password: string,
): Promise<SqlQueryResult<Record<string, unknown>>> => {
  if (sqlInjectionOrmEnabled) {
    try {
      const row = ormGetUserByUsername(username)
      return { ok: true, row: row as Record<string, unknown> | undefined, skipPasswordCheck: false }
    } catch (err) {
      return formatDbError(err as Error)
    }
  }

  if (sqlInjectionParameterizedEnabled) {
    const query = 'SELECT * FROM users WHERE username = ?'
    console.log('secure login query', query, 'params:', username)
    const result = await runRawGet<Record<string, unknown>>(query, [username])
    if (result.ok) {
      return { ...result, skipPasswordCheck: false }
    }
    return result
  }

  const vulnerableQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
  console.log('vulnerable login query', vulnerableQuery)

  const injectionResult = await runRawGet<Record<string, unknown>>(vulnerableQuery)
  if (injectionResult.ok === false) {
    return injectionResult
  }

  if (injectionResult.row) {
    return { ...injectionResult, skipPasswordCheck: true }
  }

  const fallbackQuery = `SELECT * FROM users WHERE username = '${username}'`
  console.log('vulnerable login fallback query', fallbackQuery)
  const fallbackResult = await runRawGet<Record<string, unknown>>(fallbackQuery)
  if (fallbackResult.ok) {
    return { ...fallbackResult, skipPasswordCheck: false }
  }
  return fallbackResult
}
