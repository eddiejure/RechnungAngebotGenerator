import { LineItemTemplate, CompanyTemplate } from '../types/template';

const COMPANY_TEMPLATES_KEY = 'company-templates';
const LINE_ITEM_TEMPLATES_KEY = 'line-item-templates';

// Company Templates
export const saveCompanyTemplate = (template: CompanyTemplate): void => {
  const existingTemplates = getCompanyTemplates();
  
  // If this is set as default, remove default from others
  if (template.isDefault) {
    existingTemplates.forEach(t => t.isDefault = false);
  }
  
  const updatedTemplates = existingTemplates.filter(t => t.id !== template.id);
  updatedTemplates.push(template);
  localStorage.setItem(COMPANY_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
};

export const getCompanyTemplates = (): CompanyTemplate[] => {
  const stored = localStorage.getItem(COMPANY_TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteCompanyTemplate = (id: string): void => {
  const existingTemplates = getCompanyTemplates();
  const filteredTemplates = existingTemplates.filter(t => t.id !== id);
  localStorage.setItem(COMPANY_TEMPLATES_KEY, JSON.stringify(filteredTemplates));
};

export const getDefaultCompanyTemplate = (): CompanyTemplate | null => {
  const templates = getCompanyTemplates();
  return templates.find(t => t.isDefault) || null;
};

// Line Item Templates
export const saveLineItemTemplate = (template: LineItemTemplate): void => {
  const existingTemplates = getLineItemTemplates();
  const updatedTemplates = existingTemplates.filter(t => t.id !== template.id);
  updatedTemplates.push(template);
  localStorage.setItem(LINE_ITEM_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
};

export const getLineItemTemplates = (): LineItemTemplate[] => {
  const stored = localStorage.getItem(LINE_ITEM_TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteLineItemTemplate = (id: string): void => {
  const existingTemplates = getLineItemTemplates();
  const filteredTemplates = existingTemplates.filter(t => t.id !== id);
  localStorage.setItem(LINE_ITEM_TEMPLATES_KEY, JSON.stringify(filteredTemplates));
};

export const getLineItemTemplatesByCategory = (category?: string): LineItemTemplate[] => {
  const templates = getLineItemTemplates();
  return category ? templates.filter(t => t.category === category) : templates;
};