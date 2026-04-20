export type Role = 'student' | 'admin' | 'super_admin'

export type Database = {
  public: {
    Tables: {
      universities: {
        Row: { id: string; name: string; slug: string; created_at: string }
        Insert: { id?: string; name: string; slug: string; created_at?: string }
        Update: { name?: string; slug?: string }
      }
      users: {
        Row: {
          id: string
          university_id: string | null
          role: Role
          email: string
          nationality: string | null
          intake: string | null
          created_at: string
        }
        Insert: {
          id: string
          university_id?: string | null
          role: Role
          email: string
          nationality?: string | null
          intake?: string | null
          created_at?: string
        }
        Update: {
          university_id?: string | null
          role?: Role
          email?: string
          nationality?: string | null
          intake?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          university_id: string
          title: string
          description: string | null
          due_date: string | null
          category: string | null
          url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          university_id: string
          title: string
          description?: string | null
          due_date?: string | null
          category?: string | null
          url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: { title?: string; description?: string | null; due_date?: string | null; category?: string | null; url?: string | null }
      }
      task_filters: {
        Row: { id: string; task_id: string; nationality: string | null; intake: string | null }
        Insert: { id?: string; task_id: string; nationality?: string | null; intake?: string | null }
        Update: { nationality?: string | null; intake?: string | null }
      }
      task_completions: {
        Row: { id: string; task_id: string; user_id: string; completed_at: string }
        Insert: { id?: string; task_id: string; user_id: string; completed_at?: string }
        Update: never
      }
    }
  }
}
