/*
  # Create Project Templates System

  1. New Tables
    - `project_type_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `estimated_duration` (integer, days)
      - `base_price` (numeric)
      - `technologies` (text array)
      - `features` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `project_phase_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `project_type_template_id` (uuid, nullable, references project_type_templates)
      - `name` (text)
      - `description` (text)
      - `order_index` (integer)
      - `estimated_hours` (numeric)
      - `estimated_days` (numeric)
      - `dependencies` (text array)
      - `deliverables` (text array)
      - `is_optional` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own templates
*/

-- Create project_type_templates table
CREATE TABLE IF NOT EXISTS project_type_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Web',
  estimated_duration integer NOT NULL DEFAULT 30,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  technologies text[] NOT NULL DEFAULT '{}',
  features jsonb NOT NULL DEFAULT '{"responsiveDesign": true, "seoIncluded": false, "contentManagement": false, "maintenanceIncluded": false}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_phase_templates table
CREATE TABLE IF NOT EXISTS project_phase_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_type_template_id uuid REFERENCES project_type_templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 1,
  estimated_hours numeric(5,2) DEFAULT 0,
  estimated_days numeric(5,2) DEFAULT 0,
  dependencies text[] NOT NULL DEFAULT '{}',
  deliverables text[] NOT NULL DEFAULT '{}',
  is_optional boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE project_type_templates ADD CONSTRAINT project_type_templates_category_check 
  CHECK (category = ANY (ARRAY['Web'::text, 'Design'::text, 'Marketing'::text, 'Service'::text, 'Sonstiges'::text]));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_type_templates_user_id ON project_type_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_type_templates_category ON project_type_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_type_templates_is_active ON project_type_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_project_phase_templates_user_id ON project_phase_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_phase_templates_project_type ON project_phase_templates(project_type_template_id);
CREATE INDEX IF NOT EXISTS idx_project_phase_templates_order ON project_phase_templates(order_index);

-- Enable Row Level Security
ALTER TABLE project_type_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phase_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_type_templates
CREATE POLICY "Users can manage their own project type templates"
  ON project_type_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for project_phase_templates
CREATE POLICY "Users can manage their own project phase templates"
  ON project_phase_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_project_type_templates_updated_at
  BEFORE UPDATE ON project_type_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_phase_templates_updated_at
  BEFORE UPDATE ON project_phase_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();