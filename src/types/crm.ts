export interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  source: 'Website' | 'Empfehlung' | 'Social Media' | 'Kaltakquise' | 'Event' | 'Sonstiges';
  status: 'Neu' | 'Kontaktiert' | 'Qualifiziert' | 'Angebot erstellt' | 'Verhandlung' | 'Gewonnen' | 'Verloren';
  priority: 'Niedrig' | 'Mittel' | 'Hoch';
  estimatedValue?: number;
  notes: string;
  createdAt: string;
  lastContact?: string;
  nextFollowUp?: string;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  website?: string;
  industry?: string;
  contactPerson?: string;
  notes: string;
  createdAt: string;
  totalProjects: number;
  totalRevenue: number;
  lastProject?: string;
  nextFollowUp?: string;
}

export interface Project {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  type: 'Website' | 'E-Commerce' | 'Landing Page' | 'Redesign' | 'Wartung' | 'SEO' | 'Branding' | 'App' | 'Corporate Website' | 'Portfolio' | 'Blog';
  status: 'Geplant' | 'In Bearbeitung' | 'Review' | 'Abgeschlossen' | 'Pausiert' | 'Storniert';
  priority: 'Niedrig' | 'Mittel' | 'Hoch' | 'Dringend';
  paymentType: 'Einmalzahlung' | 'Monatliches Abo' | 'Jährliches Abo';
  monthlyPrice?: number;
  setupFee?: number;
  startDate: string;
  endDate?: string;
  deadline?: string;
  budget: number;
  description: string;
  technologies: string[];
  progress: number; // 0-100
  domain?: string;
  hostingProvider?: string;
  launchDate?: string;
  maintenanceIncluded: boolean;
  seoIncluded: boolean;
  contentManagement: boolean;
  responsiveDesign: boolean;
  documents: ProjectDocument[];
  phases: ProjectPhase[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'Angebot' | 'Rechnung' | 'Vertrag' | 'Briefing' | 'Design' | 'Sonstiges';
  documentId?: string; // Reference to DocumentData if created in app
  url?: string;
  uploadedAt: string;
  size?: number;
  notes?: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: 'Geplant' | 'In Bearbeitung' | 'Abgeschlossen' | 'Übersprungen';
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  order: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'Offen' | 'In Bearbeitung' | 'Review' | 'Erledigt';
  priority: 'Niedrig' | 'Mittel' | 'Hoch';
  estimatedHours?: number;
  actualHours?: number;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string;
  description: string;
  hours: number;
  date: string;
  hourlyRate?: number;
  billable: boolean;
  createdAt: string;
}