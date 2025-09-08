export interface LineItemTemplate {
  id: string;
  description: string;
  unitPrice: number;
  category: string;
  createdAt: string;
}

export interface CompanyTemplate {
  id: string;
  name: string;
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    taxId: string;
    vatId: string;
    bankName: string;
    iban: string;
    bic: string;
    registerCourt: string;
    registerNumber: string;
    manager: string;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface ProjectTypeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Web' | 'Design' | 'Marketing' | 'Service' | 'Sonstiges';
  defaultPhases: ProjectPhaseTemplate[];
  estimatedDuration: number; // in days
  basePrice: number;
  technologies: string[];
  features: {
    responsiveDesign: boolean;
    seoIncluded: boolean;
    contentManagement: boolean;
    maintenanceIncluded: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPhaseTemplate {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedHours: number;
  estimatedDays: number;
  dependencies: string[]; // IDs of phases that must be completed first
  deliverables: string[];
  isOptional: boolean;
  createdAt: string;
  updatedAt: string;
}