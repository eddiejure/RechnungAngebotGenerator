/*
  # Create project type templates table

  1. New Tables
    - `project_type_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `estimated_duration` (integer, days)
      - `base_price` (numeric)
      - `technologies` (text array)
      - `features` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `project_type_templates` table
    - Add policies for authenticated users to manage their own templates
*/

CREATE TABLE IF NOT EXISTS project_type_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  estimated_duration integer DEFAULT 0 NOT NULL,
  base_price numeric(10,2) DEFAULT 0 NOT NULL,
  technologies text[] DEFAULT '{}' NOT NULL,
  features jsonb DEFAULT '{}' NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE project_type_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project type templates"
  ON project_type_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_project_type_templates_updated_at
  BEFORE UPDATE ON project_type_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();