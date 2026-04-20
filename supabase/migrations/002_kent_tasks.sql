DO $$
DECLARE
  uni_id uuid;
  t_id   uuid;
BEGIN
  SELECT id INTO uni_id FROM universities WHERE slug = 'universityofkent';

  -- ── Getting Started ──────────────────────────────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Accept your offer', 'Accept your offer to study at Kent via UCAS or the applicant portal. Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Complete online enrolment', 'Finish the online enrolment process before arrival. Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  -- ── IT Setup ─────────────────────────────────────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Set up Kent IT account', 'Activate your university IT account and login credentials. Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Set up Multi-Factor Authentication (MFA)', 'Enable MFA to securely access university systems. Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Connect to Eduroam Wi-Fi', 'Set up Eduroam to access Wi-Fi on campus. Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Access Microsoft 365', 'Log into your Kent Microsoft 365 account (email, Teams, etc.). Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  -- ── Accommodation ────────────────────────────────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Review accommodation options', 'Explore university and private accommodation choices. Visit: https://www.kent.ac.uk/accommodation')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Apply for accommodation', 'Submit your accommodation application via the portal. Visit: https://www.kent.ac.uk/accommodation/apply')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Arrange private accommodation (if needed)', 'Secure private housing if not staying in university accommodation. Visit: https://www.kent.ac.uk/accommodation')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Arrange accommodation insurance', 'Ensure your belongings are covered by insurance. Visit: https://www.kent.ac.uk/accommodation')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Check accommodation fees', 'Review costs and payment deadlines for housing. Visit: https://www.kent.ac.uk/accommodation')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  -- ── Visa & Immigration (International only) ───────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Receive your CAS', 'Obtain your Confirmation of Acceptance for Studies (CAS). Visit: https://www.kent.ac.uk/student/immigration')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, 'International');

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Apply for a student visa', 'Submit your visa application using your CAS. Visit: https://www.kent.ac.uk/student/immigration')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, 'International');

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Prepare visa supporting documents', 'Gather required documents (passport, finances, etc.). Visit: https://www.kent.ac.uk/student/immigration')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, 'International');

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Complete TB test (if required)', 'Take a tuberculosis test if your country requires it. Visit: https://www.kent.ac.uk/student/immigration')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, 'International');

  -- ── Student Life ──────────────────────────────────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Complete Expect Respect module', 'Finish the university''s mandatory behaviour and values module. Visit: https://www.kent.ac.uk/welcome')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Explore Welcome Week events', 'Check out orientation and welcome activities. Visit: https://www.kent.ac.uk/welcome')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Join student societies', 'Browse and join clubs and societies. Visit: https://www.kent.ac.uk/welcome')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Follow university social channels', 'Stay updated via official social media accounts. Visit: https://www.kent.ac.uk/welcome')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Join student community groups', 'Connect with other students via groups and forums. Visit: https://www.kent.ac.uk/welcome')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  -- ── Settling In ───────────────────────────────────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Explore campus facilities', 'Familiarise yourself with key buildings and services. Visit: https://www.kent.ac.uk/locations')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Explore local area', 'Learn about the city, shops, and amenities nearby. Visit: https://www.kent.ac.uk/locations')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Plan transport options', 'Understand how to travel to and around campus. Visit: https://www.kent.ac.uk/locations')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  -- ── Academic Preparation ──────────────────────────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Register for exam adjustments', 'Apply for support if you have a disability or condition. Visit: https://www.kent.ac.uk/library')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Review reading lists', 'Check required reading for your course. Visit: https://www.kent.ac.uk/library')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Access library resources', 'Use digital and physical library materials. Visit: https://www.kent.ac.uk/library')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Avoid buying unnecessary books', 'Use library access instead of purchasing books upfront. Visit: https://www.kent.ac.uk/library')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  -- ── Documents ─────────────────────────────────────────────────────────────────

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Prepare physical documents', 'Bring printed copies of important documents. Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

  INSERT INTO tasks (university_id, title, description)
    VALUES (uni_id, 'Prepare digital document copies', 'Keep secure digital backups of key documents. Visit: https://www.kent.ac.uk/welcome/checklist')
    RETURNING id INTO t_id;
  INSERT INTO task_filters (task_id, nationality) VALUES (t_id, NULL);

END $$;
