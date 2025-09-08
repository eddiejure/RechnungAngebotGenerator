/*
  # Create project phase templates table

  1. New Tables
    - `project_phase_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `project_type_template_id` (uuid, foreign key to project_type_templates, nullable)
      - `name` (text)
      - `description` (text)
      - `order_index` (integer)
      - `estimated_hours` (numeric)
      - `estimated_days` (integer)
      - `dependencies` (text array)
      - `deliverables` (text array)
      - `is_optional` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `project_phase_templates` table
    - Add policies for authenticated users to manage their own phase templates
*/

CREATE TABLE IF NOT EXISTS project_phase_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_type_template_id uuid REFERENCES project_type_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL,
  estimated_hours numeric(5,2),
  estimated_days integer,
  dependencies text[] DEFAULT '{}' NOT NULL,
  deliverables text[] DEFAULT '{}' NOT NULL,
  is_optional boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE project_phase_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project phase templates"
  ON project_phase_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_project_phase_templates_updated_at
  BEFORE UPDATE ON project_phase_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();