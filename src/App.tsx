import React, { useState, useEffect } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Briefcase, 
  FileText, 
  Plus, 
  Settings,
  Target
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { LeadsList } from './components/LeadsList';
import { LeadForm } from './components/LeadForm';
import { CustomersList } from './components/CustomersList';
import { CustomerForm } from './components/CustomerForm';
import { ProjectsList } from './components/ProjectsList';
import { ProjectForm } from './components/ProjectForm';
import { ProjectDetails } from './components/ProjectDetails';
import { DocumentForm } from './components/DocumentForm';
import { DocumentList } from './components/DocumentList';
import { TemplateManager } from './components/TemplateManager';
import { DocumentData } from './types/document';
import { Lead, Customer, Project } from './types/crm';
import { 
  getSupabaseDocuments, 
  getSupabaseLeads, 
  getSupabaseCustomers, 
  getSupabaseProjects,
  subscribeToCustomers,
  subscribeToLeads,
  subscribeToProjects,
  subscribeToDocuments
} from './utils/supabaseStorage';

type View = 'dashboard' | 'leads' | 'customers' | 'projects' | 'documents' | 'create-lead' | 'edit-lead' | 'create-customer' | 'edit-customer' | 'create-project' | 'edit-project' | 'view-project' | 'create-document' | 'edit-document' | 'templates';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadAllData();
    setupSubscriptions();
  }, []);

  const loadAllData = async () => {
    try {
      const [documentsData, leadsData, customersData, projectsData] = await Promise.all([
        getSupabaseDocuments(),
        getSupabaseLeads(),
        getSupabaseCustomers(),
        getSupabaseProjects(),
      ]);
      
      setDocuments(documentsData);
      setLeads(leadsData);
      setCustomers(customersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const setupSubscriptions = () => {
    const customersSub = subscribeToCustomers(setCustomers);
    const leadsSub = subscribeToLeads(setLeads);
    const projectsSub = subscribeToProjects(setProjects);
    const documentsSub = subscribeToDocuments(setDocuments);

    return () => {
      customersSub.unsubscribe();
      leadsSub.unsubscribe();
      projectsSub.unsubscribe();
      documentsSub.unsubscribe();
    };
  };

  const loadDocuments = async () => {
    try {
      const data = await getSupabaseDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadLeads = async () => {
    try {
      const data = await getSupabaseLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await getSupabaseCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await getSupabaseProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleCreateNew = () => {
    setEditingDocument(null);
    setCurrentView('create-document');
  };

  const handleEdit = (document: DocumentData) => {
    setEditingDocument(document);
    setCurrentView('edit-document');
  };

  const handleSave = () => {
    loadDocuments();
    setCurrentView('documents');
    setEditingDocument(null);
  };

  const handleCreateNewLead = () => {
    setEditingLead(null);
    setCurrentView('create-lead');
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setCurrentView('edit-lead');
  };

  const handleSaveLead = () => {
    loadLeads();
    loadCustomers();
    setCurrentView('leads');
    setEditingLead(null);
  };

  const handleCreateNewCustomer = () => {
    setEditingCustomer(null);
    setCurrentView('create-customer');
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCurrentView('edit-customer');
  };

  const handleSaveCustomer = () => {
    loadCustomers();
    setCurrentView('customers');
    setEditingCustomer(null);
  };

  const handleCreateNewProject = () => {
    setEditingProject(null);
    setCurrentView('create-project');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setCurrentView('edit-project');
  };

  const handleViewProject = (project: Project) => {
    setViewingProject(project);
    setCurrentView('view-project');
  };

  const handleSaveProject = () => {
    loadProjects();
    setCurrentView('projects');
    setEditingProject(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setEditingDocument(null);
    setEditingLead(null);
    setEditingCustomer(null);
    setEditingProject(null);
    setViewingProject(null);
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'Leads';
      case 'customers':
        return 'Kunden';
      case 'projects':
        return 'Projekte';
      case 'documents':
        return 'Dokumente';
      case 'templates':
        return 'Vorlagen';
      default:
        return 'Webdesign CRM';
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                <Target size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Webdesign CRM
                </h1>
                <p className="text-sm text-gray-600">
                  Kunden, Leads und Projekte professionell verwalten
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              {currentView === 'leads' && (
                <button
                  onClick={handleCreateNewLead}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <UserPlus size={18} />
                  Neuer Lead
                </button>
              )}
              
              {currentView === 'customers' && (
                <button
                  onClick={handleCreateNewCustomer}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <Users size={18} />
                  Neuer Kunde
                </button>
              )}
              
              {currentView === 'projects' && (
                <button
                  onClick={handleCreateNewProject}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <Briefcase size={18} />
                  Neues Projekt
                </button>
              )}
              
              {currentView === 'documents' && (
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Neues Dokument
                </button>
              )}
              
              {['templates', 'create-lead', 'edit-lead', 'create-customer', 'edit-customer', 'create-project', 'edit-project', 'view-project', 'create-document', 'edit-document'].includes(currentView) && (
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('leads')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'leads' || currentView === 'create-lead' || currentView === 'edit-lead'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserPlus size={18} />
              Leads
              {leads.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {leads.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setCurrentView('customers')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'customers' || currentView === 'create-customer' || currentView === 'edit-customer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={18} />
              Kunden
              {customers.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {customers.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setCurrentView('projects')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'projects' || currentView === 'create-project' || currentView === 'edit-project' || currentView === 'view-project'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Briefcase size={18} />
              Projekte
              {projects.length > 0 && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {projects.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setCurrentView('documents')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'documents' || currentView === 'create-document' || currentView === 'edit-document'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={18} />
              Dokumente
            </button>
            
            <button
              onClick={() => setCurrentView('templates')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={18} />
              Vorlagen
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        
        {currentView === 'leads' && (
          <LeadsList
            onEdit={handleEditLead}
            onCreateNew={handleCreateNewLead}
            onRefresh={loadLeads}
          />
        )}
        
        {currentView === 'customers' && (
          <CustomersList
            onEdit={handleEditCustomer}
            onCreateNew={handleCreateNewCustomer}
            onRefresh={loadCustomers}
          />
        )}
        
        {currentView === 'projects' && (
          <ProjectsList
            onEdit={handleEditProject}
            onCreateNew={handleCreateNewProject}
            onRefresh={loadProjects}
            onViewDetails={handleViewProject}
          />
        )}
        
        {currentView === 'documents' && (
          <DocumentList
            documents={documents}
            onEdit={handleEdit}
            onRefresh={loadDocuments}
          />
        )}
        
        {currentView === 'create-lead' && (
          <LeadForm
            onSave={handleSaveLead}
            onCancel={() => setCurrentView('leads')}
          />
        )}
        
        {currentView === 'edit-lead' && (
          <LeadForm
            initialData={editingLead}
            onSave={handleSaveLead}
            onCancel={() => setCurrentView('leads')}
          />
        )}
        
        {currentView === 'create-customer' && (
          <CustomerForm
            onSave={handleSaveCustomer}
            onCancel={() => setCurrentView('customers')}
          />
        )}
        
        {currentView === 'edit-customer' && (
          <CustomerForm
            initialData={editingCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => setCurrentView('customers')}
          />
        )}
        
        {currentView === 'create-project' && (
          <ProjectForm
            onSave={handleSaveProject}
            onCancel={() => setCurrentView('projects')}
          />
        )}
        
        {currentView === 'edit-project' && (
          <ProjectForm
            initialData={editingProject}
            onSave={handleSaveProject}
            onCancel={() => setCurrentView('projects')}
          />
        )}
        
        {currentView === 'view-project' && viewingProject && (
          <ProjectDetails
            project={viewingProject}
            onEdit={handleEditProject}
            onBack={() => setCurrentView('projects')}
            onRefresh={async () => {
              await loadProjects();
              // Update the viewing project with fresh data
              const updatedProjects = await getSupabaseProjects();
              const updatedProject = updatedProjects.find(p => p.id === viewingProject.id);
              if (updatedProject) {
                setViewingProject(updatedProject);
              }
            }}
          />
        )}
        
        {currentView === 'templates' && <TemplateManager />}
        
        {(currentView === 'create-document' || currentView === 'edit-document') && (
          <DocumentForm
            initialData={editingDocument}
            onSave={handleSave}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Webdesign CRM - Professionelle Kunden- und Projektverwaltung
            </p>
            <p>
              Mit integrierter Dokumentenerstellung und rechtskomplanten Templates
            </p>
          </div>
        </div>
      </footer>
      </div>
    </AuthWrapper>
  );
}

export default App;