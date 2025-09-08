import { supabase, requireAuth } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { Lead, Customer, Project, ProjectPhase } from '../types/crm';
import { DocumentData, LineItem } from '../types/document';
import { CompanyTemplate, LineItemTemplate, ProjectTypeTemplate, ProjectPhaseTemplate } from '../types/template';

// Type aliases for Supabase types
type SupabaseCustomer = Database['public']['Tables']['customers']['Row'];
type SupabaseLead = Database['public']['Tables']['leads']['Row'];
type SupabaseProject = Database['public']['Tables']['projects']['Row'];
type SupabaseDocument = Database['public']['Tables']['documents']['Row'];
type SupabaseProjectTypeTemplate = Database['public']['Tables']['project_type_templates']['Row'];
type SupabaseProjectPhaseTemplate = Database['public']['Tables']['project_phase_templates']['Row'];

// Utility functions to convert between app types and Supabase types
const convertSupabaseCustomer = (customer: SupabaseCustomer): Customer => ({
  id: customer.id,
  name: customer.name,
  company: customer.company || undefined,
  email: customer.email,
  phone: customer.phone || undefined,
  address: customer.address || undefined,
  city: customer.city || undefined,
  postalCode: customer.postal_code || undefined,
  country: customer.country,
  website: customer.website || undefined,
  industry: customer.industry || undefined,
  contactPerson: customer.contact_person || undefined,
  notes: customer.notes,
  totalProjects: customer.total_projects,
  totalRevenue: customer.total_revenue,
  lastProject: customer.last_project || undefined,
  nextFollowUp: customer.next_follow_up || undefined,
  createdAt: customer.created_at,
});

const convertSupabaseLead = (lead: SupabaseLead): Lead => ({
  id: lead.id,
  name: lead.name,
  company: lead.company || undefined,
  email: lead.email,
  phone: lead.phone || undefined,
  source: lead.source as Lead['source'],
  status: lead.status as Lead['status'],
  priority: lead.priority as Lead['priority'],
  estimatedValue: lead.estimated_value || undefined,
  notes: lead.notes,
  lastContact: lead.last_contact || undefined,
  nextFollowUp: lead.next_follow_up || undefined,
  createdAt: lead.created_at,
});

const convertSupabaseProject = async (project: SupabaseProject): Promise<Project> => {
  // Get customer name
  const { data: customer } = await supabase
    .from('customers')
    .select('name')
    .eq('id', project.customer_id)
    .single();

  // Get project phases
  const { data: phases } = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', project.id)
    .order('order_index');

  // Get project documents
  const { data: documents } = await supabase
    .from('project_documents')
    .select('*')
    .eq('project_id', project.id);

  return {
    id: project.id,
    customerId: project.customer_id,
    customerName: customer?.name || 'Unknown Customer',
    name: project.name,
    type: project.type as Project['type'],
    status: project.status as Project['status'],
    priority: project.priority as Project['priority'],
    paymentType: project.payment_type as Project['paymentType'],
    monthlyPrice: project.monthly_price || undefined,
    setupFee: project.setup_fee || undefined,
    budget: project.budget,
    progress: project.progress,
    description: project.description,
    technologies: project.technologies,
    domain: project.domain || undefined,
    hostingProvider: project.hosting_provider || undefined,
    startDate: project.start_date,
    endDate: project.end_date || undefined,
    deadline: project.deadline || undefined,
    launchDate: project.launch_date || undefined,
    maintenanceIncluded: project.maintenance_included,
    seoIncluded: project.seo_included,
    contentManagement: project.content_management,
    responsiveDesign: project.responsive_design,
    phases: phases?.map(phase => ({
      id: phase.id,
      name: phase.name,
      description: phase.description,
      status: phase.status as ProjectPhase['status'],
      order: phase.order_index,
      startDate: phase.start_date || undefined,
      endDate: phase.end_date || undefined,
      estimatedHours: phase.estimated_hours || undefined,
      actualHours: phase.actual_hours || undefined,
    })) || [],
    documents: documents?.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type as any,
      documentId: doc.document_id || undefined,
      url: doc.url || undefined,
      uploadedAt: doc.uploaded_at,
      size: doc.size_bytes || undefined,
      notes: doc.notes || undefined,
    })) || [],
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };
};

// Customer functions
export const getSupabaseCustomers = async (): Promise<Customer[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(convertSupabaseCustomer);
};

export const saveSupabaseCustomer = async (customer: Customer): Promise<void> => {
  const userId = await requireAuth();
  
  const customerData = {
    id: customer.id,
    user_id: userId,
    name: customer.name,
    company: customer.company || null,
    email: customer.email,
    phone: customer.phone || null,
    address: customer.address || null,
    city: customer.city || null,
    postal_code: customer.postalCode || null,
    country: customer.country,
    website: customer.website || null,
    industry: customer.industry || null,
    contact_person: customer.contactPerson || null,
    notes: customer.notes,
    total_projects: customer.totalProjects,
    total_revenue: customer.totalRevenue,
    last_project: customer.lastProject || null,
    next_follow_up: customer.nextFollowUp || null,
  };

  const { error } = await supabase
    .from('customers')
    .upsert(customerData);

  if (error) throw error;
};

export const deleteSupabaseCustomer = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Lead functions
export const getSupabaseLeads = async (): Promise<Lead[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(convertSupabaseLead);
};

export const saveSupabaseLead = async (lead: Lead): Promise<void> => {
  const userId = await requireAuth();
  
  const leadData = {
    id: lead.id,
    user_id: userId,
    name: lead.name,
    company: lead.company || null,
    email: lead.email,
    phone: lead.phone || null,
    source: lead.source,
    status: lead.status,
    priority: lead.priority,
    estimated_value: lead.estimatedValue || null,
    notes: lead.notes,
    last_contact: lead.lastContact || null,
    next_follow_up: lead.nextFollowUp || null,
  };

  const { error } = await supabase
    .from('leads')
    .upsert(leadData);

  if (error) throw error;
};

export const deleteSupabaseLead = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Project functions
export const getSupabaseProjects = async (): Promise<Project[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const projects = await Promise.all(data.map(convertSupabaseProject));
  return projects;
};

export const saveSupabaseProject = async (project: Project): Promise<void> => {
  const userId = await requireAuth();
  
  const projectData = {
    id: project.id,
    user_id: userId,
    customer_id: project.customerId,
    name: project.name,
    type: project.type,
    status: project.status,
    priority: project.priority,
    payment_type: project.paymentType,
    monthly_price: project.monthlyPrice || null,
    setup_fee: project.setupFee || null,
    budget: project.budget,
    progress: project.progress,
    description: project.description,
    technologies: project.technologies,
    domain: project.domain || null,
    hosting_provider: project.hostingProvider || null,
    start_date: project.startDate,
    end_date: project.endDate || null,
    deadline: project.deadline || null,
    launch_date: project.launchDate || null,
    maintenance_included: project.maintenanceIncluded,
    seo_included: project.seoIncluded,
    content_management: project.contentManagement,
    responsive_design: project.responsiveDesign,
  };

  const { error: projectError } = await supabase
    .from('projects')
    .upsert(projectData);

  if (projectError) throw projectError;

  // Save project phases
  if (project.phases && project.phases.length > 0) {
    const phasesData = project.phases.map(phase => ({
      id: phase.id,
      user_id: userId,
      project_id: project.id,
      name: phase.name,
      description: phase.description,
      status: phase.status,
      order_index: phase.order,
      start_date: phase.startDate || null,
      end_date: phase.endDate || null,
      estimated_hours: phase.estimatedHours || null,
      actual_hours: phase.actualHours || null,
    }));

    const { error: phasesError } = await supabase
      .from('project_phases')
      .upsert(phasesData);

    if (phasesError) throw phasesError;
  }

  // Save project documents
  if (project.documents && project.documents.length > 0) {
    const documentsData = project.documents.map(doc => ({
      id: doc.id,
      user_id: userId,
      project_id: project.id,
      document_id: doc.documentId || null,
      name: doc.name,
      type: doc.type,
      url: doc.url || null,
      size_bytes: doc.size || null,
      notes: doc.notes || null,
      uploaded_at: doc.uploadedAt,
    }));

    const { error: documentsError } = await supabase
      .from('project_documents')
      .upsert(documentsData);

    if (documentsError) throw documentsError;
  }
};

export const deleteSupabaseProject = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Document functions
export const getSupabaseDocuments = async (): Promise<DocumentData[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_line_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(doc => ({
    id: doc.id,
    type: doc.type as DocumentData['type'],
    documentNumber: doc.document_number,
    date: doc.date,
    dueDate: doc.due_date || undefined,
    customer: doc.customer_data as any,
    company: doc.company_data as any,
    lineItems: (doc.document_line_items as any[]).map(item => ({
      id: item.id,
      position: item.position,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    })),
    isSmallBusiness: doc.is_small_business,
    notes: doc.notes,
    subtotal: doc.subtotal,
    vatAmount: doc.vat_amount,
    total: doc.total,
    letterSubject: doc.letter_subject || undefined,
    letterContent: doc.letter_content || undefined,
    letterGreeting: doc.letter_greeting || undefined,
    linkedCustomerId: doc.customer_id || undefined,
    linkedProjectId: doc.project_id || undefined,
    createdAt: doc.created_at,
  }));
};

export const saveSupabaseDocument = async (document: DocumentData): Promise<void> => {
  const userId = await requireAuth();
  
  const documentData = {
    id: document.id,
    user_id: userId,
    customer_id: document.linkedCustomerId || null,
    project_id: document.linkedProjectId || null,
    type: document.type,
    document_number: document.documentNumber,
    date: document.date,
    due_date: document.dueDate || null,
    customer_data: document.customer,
    company_data: document.company,
    is_small_business: document.isSmallBusiness,
    notes: document.notes,
    subtotal: document.subtotal,
    vat_amount: document.vatAmount,
    total: document.total,
    letter_subject: document.letterSubject || null,
    letter_content: document.letterContent || null,
    letter_greeting: document.letterGreeting || null,
  };

  const { error: docError } = await supabase
    .from('documents')
    .upsert(documentData);

  if (docError) throw docError;

  // Delete existing line items
  await supabase
    .from('document_line_items')
    .delete()
    .eq('document_id', document.id);

  // Save line items
  if (document.lineItems && document.lineItems.length > 0) {
    const lineItemsData = document.lineItems.map(item => ({
      id: item.id,
      user_id: userId,
      document_id: document.id,
      position: item.position,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from('document_line_items')
      .upsert(lineItemsData);

    if (itemsError) throw itemsError;
  }
};

export const deleteSupabaseDocument = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Template functions
export const getSupabaseCompanyTemplates = async (): Promise<CompanyTemplate[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('company_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(template => ({
    id: template.id,
    name: template.name,
    company: template.company_data as any,
    isDefault: template.is_default,
    createdAt: template.created_at,
  }));
};

export const saveSupabaseCompanyTemplate = async (template: CompanyTemplate): Promise<void> => {
  const userId = await requireAuth();
  
  const templateData = {
    id: template.id,
    user_id: userId,
    name: template.name,
    is_default: template.isDefault,
    company_data: template.company,
  };

  const { error } = await supabase
    .from('company_templates')
    .upsert(templateData);

  if (error) throw error;
};

export const getSupabaseLineItemTemplates = async (): Promise<LineItemTemplate[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('line_item_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(template => ({
    id: template.id,
    description: template.description,
    unitPrice: template.unit_price,
    category: template.category,
    createdAt: template.created_at,
  }));
};

export const saveSupabaseLineItemTemplate = async (template: LineItemTemplate): Promise<void> => {
  const userId = await requireAuth();
  
  const templateData = {
    id: template.id,
    user_id: userId,
    description: template.description,
    unit_price: template.unitPrice,
    category: template.category,
  };

  const { error } = await supabase
    .from('line_item_templates')
    .upsert(templateData);

  if (error) throw error;
};

// Template delete functions (to be implemented)
export const deleteSupabaseCompanyTemplate = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('company_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

export const deleteSupabaseLineItemTemplate = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('line_item_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getSupabaseDefaultCompanyTemplate = async (): Promise<CompanyTemplate | null> => {
  const templates = await getSupabaseCompanyTemplates();
  return templates.find(t => t.isDefault) || null;
};

// Project Type Template functions
export const getSupabaseProjectTypeTemplates = async (): Promise<ProjectTypeTemplate[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('project_type_templates')
    .select(`
      *,
      project_phase_templates (*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category as ProjectTypeTemplate['category'],
    defaultPhases: (template.project_phase_templates as any[])
      .sort((a, b) => a.order_index - b.order_index)
      .map(phase => ({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        order: phase.order_index,
        estimatedHours: phase.estimated_hours,
        estimatedDays: phase.estimated_days,
        dependencies: phase.dependencies,
        deliverables: phase.deliverables,
        isOptional: phase.is_optional,
        createdAt: phase.created_at,
        updatedAt: phase.updated_at,
      })),
    estimatedDuration: template.estimated_duration,
    basePrice: template.base_price,
    technologies: template.technologies,
    features: template.features as any,
    isActive: template.is_active,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
  }));
};

export const saveSupabaseProjectTypeTemplate = async (template: ProjectTypeTemplate): Promise<void> => {
  const userId = await requireAuth();
  
  const templateData = {
    id: template.id,
    user_id: userId,
    name: template.name,
    description: template.description,
    category: template.category,
    estimated_duration: template.estimatedDuration,
    base_price: template.basePrice,
    technologies: template.technologies,
    features: template.features,
    is_active: template.isActive,
  };

  const { error: templateError } = await supabase
    .from('project_type_templates')
    .upsert(templateData);

  if (templateError) throw templateError;

  // Delete existing phases for this template
  await supabase
    .from('project_phase_templates')
    .delete()
    .eq('project_type_template_id', template.id);

  // Save phases
  if (template.defaultPhases && template.defaultPhases.length > 0) {
    const phasesData = template.defaultPhases.map(phase => ({
      id: phase.id,
      user_id: userId,
      project_type_template_id: template.id,
      name: phase.name,
      description: phase.description,
      order_index: phase.order,
      estimated_hours: phase.estimatedHours,
      estimated_days: phase.estimatedDays,
      dependencies: phase.dependencies,
      deliverables: phase.deliverables,
      is_optional: phase.isOptional,
    }));

    const { error: phasesError } = await supabase
      .from('project_phase_templates')
      .upsert(phasesData);

    if (phasesError) throw phasesError;
  }
};

export const deleteSupabaseProjectTypeTemplate = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('project_type_templates')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Project Phase Template functions
export const getSupabaseProjectPhaseTemplates = async (): Promise<ProjectPhaseTemplate[]> => {
  const userId = await requireAuth();
  const { data, error } = await supabase
    .from('project_phase_templates')
    .select('*')
    .eq('user_id', userId)
    .is('project_type_template_id', null) // Only standalone phases
    .order('order_index');

  if (error) throw error;

  return data.map(phase => ({
    id: phase.id,
    name: phase.name,
    description: phase.description,
    order: phase.order_index,
    estimatedHours: phase.estimated_hours,
    estimatedDays: phase.estimated_days,
    dependencies: phase.dependencies,
    deliverables: phase.deliverables,
    isOptional: phase.is_optional,
    createdAt: phase.created_at,
    updatedAt: phase.updated_at,
  }));
};

export const saveSupabaseProjectPhaseTemplate = async (phase: ProjectPhaseTemplate): Promise<void> => {
  const userId = await requireAuth();
  
  const phaseData = {
    id: phase.id,
    user_id: userId,
    project_type_template_id: null, // Standalone phase
    name: phase.name,
    description: phase.description,
    order_index: phase.order,
    estimated_hours: phase.estimatedHours,
    estimated_days: phase.estimatedDays,
    dependencies: phase.dependencies,
    deliverables: phase.deliverables,
    is_optional: phase.isOptional,
  };

  const { error } = await supabase
    .from('project_phase_templates')
    .upsert(phaseData);

  if (error) throw error;
};

export const deleteSupabaseProjectPhaseTemplate = async (id: string): Promise<void> => {
  const userId = await requireAuth();
  const { error } = await supabase
    .from('project_phase_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Real-time subscriptions
export const subscribeToCustomers = (callback: (customers: Customer[]) => void) => {
  return supabase
    .channel('customers')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'customers' },
      () => {
        getSupabaseCustomers().then(callback);
      }
    )
    .subscribe();
};

export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
  return supabase
    .channel('leads')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'leads' },
      () => {
        getSupabaseLeads().then(callback);
      }
    )
    .subscribe();
};

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  return supabase
    .channel('projects')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'projects' },
      () => {
        getSupabaseProjects().then(callback);
      }
    )
    .subscribe();
};

export const subscribeToDocuments = (callback: (documents: DocumentData[]) => void) => {
  return supabase
    .channel('documents')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'documents' },
      () => {
        getSupabaseDocuments().then(callback);
      }
    )
    .subscribe();
};