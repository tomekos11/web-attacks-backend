import { sqlInjectionLeastPrivilegeEnabled } from 'controllers/securityController.js'
import { blockMessage } from 'utils/sqlInjectionMessages.js'

const FORBIDDEN_TABLES = ['secrets', 'security_settings', 'security_groups', 'security_groups_settings']
const FORBIDDEN_COLUMNS = ['password', 'creditcard', 'credit_card', 'pin', 'secretnote', 'secret_note']

export type LeastPrivilegeCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; blockedBy: 'sql-injection-least-privilege' }

const normalizeQuery = (query: string) => query.toLowerCase().replace(/\s+/g, ' ').trim()

export const checkLeastPrivilege = (query: string): LeastPrivilegeCheckResult => {
  if (!sqlInjectionLeastPrivilegeEnabled) {
    return { allowed: true }
  }

  const normalized = normalizeQuery(query)

  for (const table of FORBIDDEN_TABLES) {
    const tablePattern = new RegExp(`\\b(from|join|into|update|delete\\s+from)\\s+${table}\\b`, 'i')
    if (tablePattern.test(normalized)) {
      return {
        allowed: false,
        reason: blockMessage(
          'sql-injection-least-privilege',
          `Dostęp do tabeli "${table}" jest zablokowany.`,
        ),
        blockedBy: 'sql-injection-least-privilege',
      }
    }
  }

  for (const column of FORBIDDEN_COLUMNS) {
    if (new RegExp(`\\b${column}\\b`, 'i').test(normalized)) {
      return {
        allowed: false,
        reason: blockMessage(
          'sql-injection-least-privilege',
          `Dostęp do kolumny "${column}" jest zablokowany.`,
        ),
        blockedBy: 'sql-injection-least-privilege',
      }
    }
  }

  if (/\b(attach|detach|pragma|sqlite_master|sqlite_schema)\b/i.test(normalized)) {
    return {
      allowed: false,
      reason: blockMessage(
        'sql-injection-least-privilege',
        'Operacje administracyjne SQLite są zablokowane.',
      ),
      blockedBy: 'sql-injection-least-privilege',
    }
  }

  return { allowed: true }
}
