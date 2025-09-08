import { Lead, Customer, Project, ProjectTask, TimeEntry } from '../types/crm';

const LEADS_KEY = 'crm-leads';
const CUSTOMERS_KEY = 'crm-customers';
const PROJECTS_KEY = 'crm-projects';
const TASKS_KEY = 'crm-tasks';
const TIME_ENTRIES_KEY = 'crm-time-entries';

// Leads
export const saveLeads = (leads: Lead[]): void => {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
};

export const getLeads = (): Lead[] => {
  const stored = localStorage.getItem(LEADS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveLead = (lead: Lead): void => {
  const leads = getLeads();
  const updatedLeads = leads.filter(l => l.id !== lead.id);
  updatedLeads.push(lead);
  saveLeads(updatedLeads);
};

export const deleteLead = (id: string): void => {
  const leads = getLeads().filter(l => l.id !== id);
  saveLeads(leads);
};

// Customers
export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const getCustomers = (): Customer[] => {
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const updatedCustomers = customers.filter(c => c.id !== customer.id);
  updatedCustomers.push(customer);
  saveCustomers(updatedCustomers);
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
};

export const getCustomer = (id: string): Customer | null => {
  const customers = getCustomers();
  return customers.find(c => c.id === id) || null;
};

// Projects
export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getProjects = (): Project[] => {
  const stored = localStorage.getItem(PROJECTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const updatedProjects = projects.filter(p => p.id !== project.id);
  updatedProjects.push(project);
  saveProjects(updatedProjects);
};

export const deleteProject = (id: string): void => {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
};

export const getProject = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
};

export const getProjectsByCustomer = (customerId: string): Project[] => {
  return getProjects().filter(p => p.customerId === customerId);
};

export const getProjectsCount = (): number => {
  return getProjects().length;
};

// Tasks
export const saveTasks = (tasks: ProjectTask[]): void => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getTasks = (): ProjectTask[] => {
  const stored = localStorage.getItem(TASKS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTask = (task: ProjectTask): void => {
  const tasks = getTasks();
  const updatedTasks = tasks.filter(t => t.id !== task.id);
  updatedTasks.push(task);
  saveTasks(updatedTasks);
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
};

export const getTasksByProject = (projectId: string): ProjectTask[] => {
  return getTasks().filter(t => t.projectId === projectId);
};

// Time Entries
export const saveTimeEntries = (entries: TimeEntry[]): void => {
  localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(entries));
};

export const getTimeEntries = (): TimeEntry[] => {
  const stored = localStorage.getItem(TIME_ENTRIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTimeEntry = (entry: TimeEntry): void => {
  const entries = getTimeEntries();
  const updatedEntries = entries.filter(e => e.id !== entry.id);
  updatedEntries.push(entry);
  saveTimeEntries(updatedEntries);
};

export const deleteTimeEntry = (id: string): void => {
  const entries = getTimeEntries().filter(e => e.id !== id);
  saveTimeEntries(entries);
};

export const getTimeEntriesByProject = (projectId: string): TimeEntry[] => {
  return getTimeEntries().filter(e => e.projectId === projectId);
};