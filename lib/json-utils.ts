// Utility functions for safely handling JSON fields in Prisma models

export function parseJsonField<T>(jsonString: string | null | undefined): T | null {
  if (!jsonString) return null
  try {
    return JSON.parse(jsonString) as T
  } catch {
    return null
  }
}

export function stringifyJsonField<T>(data: T | null | undefined): string | null {
  if (data === null || data === undefined) return null
  try {
    return JSON.stringify(data)
  } catch {
    return null
  }
}
