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
  type: 'Website' | 'E-Commerce' | 'Landing Page' | 'Redesign' | 'Wartung' | 'SEO' | 'Branding' | 'App';
  status: 'Geplant' | 'In Bearbeitung' | 'Review' | 'Abgeschlossen' | 'Pausiert' | 'Storniert';
  priority: 'Niedrig' | 'Mittel' | 'Hoch' | 'Dringend';
  startDate: string;
  endDate?: string;
  deadline?: string;
  budget: number;
  description: string;
  technologies: string[];
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
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