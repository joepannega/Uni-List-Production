-- ============================================================
-- Concierge MVP — Initial Schema
-- ============================================================

-- 1. TABLES

CREATE TABLE universities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  university_id uuid REFERENCES universities(id) ON DELETE SET NULL,
  role          text NOT NULL CHECK (role IN ('student', 'admin', 'super_admin')),
  email         text NOT NULL,
  nationality   text,
  intake        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  due_date      date,
  created_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE task_filters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  nationality text,   -- NULL means any nationality
  intake      text    -- NULL means any intake
);

CREATE TABLE task_completions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, user_id)
);

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE universities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_filters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- universities: any authenticated user can read (needed for slug resolution)
CREATE POLICY "authenticated_read_universities" ON universities
  FOR SELECT TO authenticated USING (true);

-- users: authenticated users can read their own row
CREATE POLICY "users_read_own" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- users: newly authenticated user can insert their own row (student registration)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- tasks: authenticated users can read tasks belonging to their university
CREATE POLICY "university_members_read_tasks" ON tasks
  FOR SELECT TO authenticated
  USING (
    university_id = (
      SELECT university_id FROM users WHERE id = auth.uid()
    )
  );

-- task_filters: readable if the related task is readable
CREATE POLICY "read_task_filters" ON task_filters
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks
      WHERE university_id = (
        SELECT university_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- task_completions: students manage their own completions
CREATE POLICY "own_completions_select" ON task_completions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "own_completions_insert" ON task_completions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_completions_delete" ON task_completions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 3. USEFUL INDEXES
-- ============================================================

CREATE INDEX ON users (university_id);
CREATE INDEX ON tasks (university_id);
CREATE INDEX ON task_filters (task_id);
CREATE INDEX ON task_completions (user_id);
CREATE INDEX ON task_completions (task_id);

-- ============================================================
-- 4. HELPER: task filtering query (for reference)
-- ============================================================
-- SELECT DISTINCT t.*
-- FROM tasks t
-- JOIN task_filters tf ON tf.task_id = t.id
-- WHERE t.university_id = $university_id
--   AND (tf.nationality IS NULL OR tf.nationality = $student_nationality)
--   AND (tf.intake IS NULL OR tf.intake = $student_intake)
-- ORDER BY t.due_date ASC NULLS LAST;
