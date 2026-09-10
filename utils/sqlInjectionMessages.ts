export const SQL_INJECTION_MECHANISMS = {
  'sql-injection-parameterized': 'parametryzacja zapytań SQL (placeholdery ? zamiast konkatenacji)',
  'sql-injection-input-validation': 'walidacja wejścia (regex loginu i hasła, ID tylko cyfry, limit długości)',
  'sql-injection-least-privilege': 'symulacja least privilege',
  'sql-injection-error-handling': 'obsługa błędów bez wycieków (generyczny komunikat zamiast treści błędu SQLite)',
  'sql-injection-orm': 'ORM Drizzle (zapytania budowane przez ORM zamiast surowego SQL)',
} as const

export type SqlInjectionMechanism = keyof typeof SQL_INJECTION_MECHANISMS

export const blockMessage = (mechanism: SqlInjectionMechanism, reason: string): string =>
  `${reason} Ochrona: ${mechanism} (${SQL_INJECTION_MECHANISMS[mechanism]}).`
