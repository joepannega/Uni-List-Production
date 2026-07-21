-- ============================================================
-- Add manual task ordering
-- ============================================================
-- Adds a `position` column so admins can order tasks explicitly
-- (independent of due dates). Lower position = shown first.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position integer;

-- Backfill existing tasks: number them per university by creation time,
-- so the current order is preserved as a starting point (0, 1, 2, …).
WITH ordered AS (
  SELECT id,
         row_number() OVER (PARTITION BY university_id ORDER BY created_at, id) - 1 AS rn
  FROM tasks
)
UPDATE tasks t
SET position = o.rn
FROM ordered o
WHERE o.id = t.id
  AND t.position IS NULL;

CREATE INDEX IF NOT EXISTS tasks_university_position_idx ON tasks (university_id, position);
