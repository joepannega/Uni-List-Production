/**
 * Determines whether a student is eligible to see a given task,
 * based on the task's nationality filters and the university's home country.
 *
 * Filter rules:
 *   - No filters (empty array)  → visible to all students
 *   - filter.nationality = null → visible to all students
 *   - filter.nationality = 'Domestic'      → student.nationality === homeCountry
 *   - filter.nationality = 'International' → student.nationality !== homeCountry (and not null)
 *   - filter.nationality = '<Country>'     → student.nationality === that country
 *
 * A student is eligible if they match ANY of the task's filters.
 */
export function isEligible(
  student: { nationality: string | null },
  filters: { nationality: string | null }[],
  homeCountry: string | null,
): boolean {
  if (filters.length === 0) return true

  for (const f of filters) {
    if (f.nationality === null) return true

    if (f.nationality === 'Domestic') {
      if (homeCountry && student.nationality === homeCountry) return true
    } else if (f.nationality === 'International') {
      if (student.nationality && student.nationality !== homeCountry) return true
    } else {
      if (student.nationality === f.nationality) return true
    }
  }

  return false
}
