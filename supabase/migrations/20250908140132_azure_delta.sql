/*
  # CRM Schema Setup for Webdesign CRM

  1. New Tables
    - `companies` - Company/sender information templates
    - `customers` - Customer management
    - `leads` - Lead management  
    - `projects` - Project management with phases
    - `project_phases` - Individual project phases
    - `project_documents` - Document attachments to projects
    - `documents` - Invoice/quote/letter documents
    - `document_line_items` - Line items for documents
    - `line_item_templates` - Reusable line item templates
    - `company_templates` - Company information templates

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Real-time Features
    - Enable real-time subscriptions for all tables
    - Automatic timestamps and UUIDs
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Company Templates Table
CREATE TABLE IF NOT EXISTS company_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  company_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Line Item Templates Table  
CREATE TABLE IF NOT EXISTS line_item_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Allgemein',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'Deutschland',
  website text,
  industry text,
  contact_person text,
  notes text DEFAULT '',
  total_projects integer DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,
  last_project timestamptz,
  next_follow_up timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text,
  source text NOT NULL DEFAULT 'Website',
  status text NOT NULL DEFAULT 'Neu',
  priority text NOT NULL DEFAULT 'Mittel',
  estimated_value decimal(10,2),
  notes text DEFAULT '',
  last_contact timestamptz,
  next_follow_up timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT leads_source_check CHECK (source IN ('Website', 'Empfehlung', 'Social Media', 'Kaltakquise', 'Event', 'Sonstiges')),
  CONSTRAINT leads_status_check CHECK (status IN ('Neu', 'Kontaktiert', 'Qualifiziert', 'Angebot erstellt', 'Verhandlung', 'Gewonnen', 'Verloren')),
  CONSTRAINT leads_priority_check CHECK (priority IN ('Niedrig', 'Mittel', 'Hoch'))
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Website',
  status text NOT NULL DEFAULT 'Geplant',
  priority text NOT NULL DEFAULT 'Mittel',
  payment_type text NOT NULL DEFAULT 'Einmalzahlung',
  monthly_price decimal(10,2),
  setup_fee decimal(10,2),
  budget decimal(10,2) NOT NULL DEFAULT 0,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  description text DEFAULT '',
  technologies text[] DEFAULT '{}',
  domain text,
  hosting_provider text,
  start_date date NOT NULL,
  end_date date,
  deadline date,
  launch_date date,
  maintenance_included boolean DEFAULT false,
  seo_included boolean DEFAULT false,
  content_management boolean DEFAULT false,
  responsive_design boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT projects_type_check CHECK (type IN ('Website', 'E-Commerce', 'Landing Page', 'Redesign', 'Wartung', 'SEO', 'Branding', 'App', 'Corporate Website', 'Portfolio', 'Blog')),
  CONSTRAINT projects_status_check CHECK (status IN ('Geplant', 'In Bearbeitung', 'Review', 'Abgeschlossen', 'Pausiert', 'Storniert')),
  CONSTRAINT projects_priority_check CHECK (priority IN ('Niedrig', 'Mittel', 'Hoch', 'Dringend')),
  CONSTRAINT projects_payment_type_check CHECK (payment_type IN ('Einmalzahlung', 'Monatliches Abo', 'Jährliches Abo'))
);

-- Project Phases Table
CREATE TABLE IF NOT EXISTS project_phases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'Geplant',
  order_index integer NOT NULL,
  start_date date,
  end_date date,
  estimated_hours decimal(5,2),
  actual_hours decimal(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT project_phases_status_check CHECK (status IN ('Geplant', 'In Bearbeitung', 'Abgeschlossen', 'Übersprungen'))
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  type text NOT NULL,
  document_number text NOT NULL,
  date date NOT NULL,
  due_date date,
  customer_data jsonb NOT NULL,
  company_data jsonb NOT NULL,
  is_small_business boolean DEFAULT false,
  notes text DEFAULT '',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  vat_amount decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  letter_subject text,
  letter_content text,
  letter_greeting text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT documents_type_check CHECK (type IN ('invoice', 'quote', 'letter'))
);

-- Document Line Items Table
CREATE TABLE IF NOT EXISTS document_line_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL,
  description text NOT NULL,
  quantity decimal(10,3) NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Documents Table (for linking external documents to projects)
CREATE TABLE IF NOT EXISTS project_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Sonstiges',
  url text,
  size_bytes bigint,
  notes text,
  uploaded_at timestamptz DEFAULT now(),
  
  CONSTRAINT project_documents_type_check CHECK (type IN ('Angebot', 'Rechnung', 'Vertrag', 'Briefing', 'Design', 'Sonstiges'))
);

-- Enable Row Level Security
ALTER TABLE company_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Company Templates
CREATE POLICY "Users can manage their own company templates"
  ON company_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Line Item Templates
CREATE POLICY "Users can manage their own line item templates"
  ON line_item_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Customers
CREATE POLICY "Users can manage their own customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Leads
CREATE POLICY "Users can manage their own leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Projects
CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Project Phases
CREATE POLICY "Users can manage their own project phases"
  ON project_phases
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Documents
CREATE POLICY "Users can manage their own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Document Line Items
CREATE POLICY "Users can manage their own document line items"
  ON document_line_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Project Documents
CREATE POLICY "Users can manage their own project documents"
  ON project_documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_document_line_items_document_id ON document_line_items(document_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamps
CREATE TRIGGER update_company_templates_updated_at BEFORE UPDATE ON company_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_line_item_templates_updated_at BEFORE UPDATE ON line_item_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON project_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_line_items_updated_at BEFORE UPDATE ON document_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();