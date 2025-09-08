import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Building, Package, Star, Edit3, Briefcase, Clock } from 'lucide-react';
import { CompanyTemplate, LineItemTemplate, ProjectTypeTemplate, ProjectPhaseTemplate } from '../types/template';
import { Company } from '../types/document';
import {
  saveSupabaseCompanyTemplate,
  getSupabaseCompanyTemplates,
  deleteSupabaseCompanyTemplate,
  saveSupabaseLineItemTemplate,
  getSupabaseLineItemTemplates,
  deleteSupabaseLineItemTemplate,
  getSupabaseProjectTypeTemplates,
  saveSupabaseProjectTypeTemplate,
  deleteSupabaseProjectTypeTemplate,
  getSupabaseProjectPhaseTemplates,
  saveSupabaseProjectPhaseTemplate,
  deleteSupabaseProjectPhaseTemplate,
} from '../utils/supabaseStorage';
import { formatCurrency } from '../utils/calculations';

const defaultCompany: Company = {
  name: 'Muster GmbH',
  address: 'Musterstraße 123',
  city: 'Berlin',
  postalCode: '10115',
  country: 'Deutschland',
  phone: '+49 30 12345678',
  email: 'info@muster-gmbh.de',
  taxId: '123/456/78901',
  vatId: 'DE123456789',
  bankName: 'Deutsche Bank AG',
  iban: 'DE89 1001 0000 0123 4567 89',
  bic: 'DEUTDEFF',
  registerCourt: 'Amtsgericht Berlin-Charlottenburg',
  registerNumber: 'HRB 123456',
  manager: 'Max Mustermann',
};

export const TemplateManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'company' | 'items' | 'project-types' | 'phases'>('company');
  const [companyTemplates, setCompanyTemplates] = useState<CompanyTemplate[]>([]);
  const [lineItemTemplates, setLineItemTemplates] = useState<LineItemTemplate[]>([]);
  const [projectTypeTemplates, setProjectTypeTemplates] = useState<ProjectTypeTemplate[]>([]);
  const [projectPhaseTemplates, setProjectPhaseTemplates] = useState<ProjectPhaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Company form state
  const [companyForm, setCompanyForm] = useState<Company>(defaultCompany);
  const [companyTemplateName, setCompanyTemplateName] = useState('');
  const [isDefaultTemplate, setIsDefaultTemplate] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  
  // Line item form state
  const [itemForm, setItemForm] = useState({
    description: '',
    unitPrice: 0,
    category: '',
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Project type form state
  const [projectTypeForm, setProjectTypeForm] = useState<Partial<ProjectTypeTemplate>>({
    name: '',
    description: '',
    category: 'Web',
    estimatedDuration: 30,
    basePrice: 0,
    technologies: [],
    features: {
      responsiveDesign: true,
      seoIncluded: false,
      contentManagement: false,
      maintenanceIncluded: false,
    },
    defaultPhases: [],
    isActive: true,
  });
  const [editingProjectTypeId, setEditingProjectTypeId] = useState<string | null>(null);
  const [newTechnology, setNewTechnology] = useState('');
  
  // Phase form state
  const [phaseForm, setPhaseForm] = useState<Partial<ProjectPhaseTemplate>>({
    name: '',
    description: '',
    order: 1,
    estimatedHours: 8,
    estimatedDays: 1,
    dependencies: [],
    deliverables: [],
    isOptional: false,
  });
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [newDeliverable, setNewDeliverable] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [companyTemplates, lineItemTemplates] = await Promise.all([
        getSupabaseCompanyTemplates(),
        getSupabaseProjectPhaseTemplates(),
      ]);
      setCompanyTemplates(companyTemplates);
      setLineItemTemplates(lineItemTemplates);
      
      // Load project templates separately with error handling
      try {
        const projectTypeTemplates = await getSupabaseProjectTypeTemplates();
        setProjectTypeTemplates(projectTypeTemplates);
      } catch (error) {
        console.warn('Project type templates not available yet:', error);
        setProjectTypeTemplates([]);
      }
      
      try {
        const projectPhaseTemplates = await getSupabaseProjectPhaseTemplates();
        setProjectPhaseTemplates(projectPhaseTemplates);
      } catch (error) {
        console.warn('Project phase templates not available yet:', error);
        setProjectPhaseTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Set empty arrays as fallback
      setCompanyTemplates([]);
      setLineItemTemplates([]);
      setProjectTypeTemplates([]);
      setProjectPhaseTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vorlagen verwalten
          </h1>
          <p className="text-gray-600">
            Speichern Sie Ihre Firmendaten und häufig verwendete Positionen als Vorlagen
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">Vorlagen werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveCompanyTemplate = async () => {
    if (!companyTemplateName.trim()) {
      alert('Bitte geben Sie einen Namen für die Vorlage ein.');
      return;
    }

    const template: CompanyTemplate = {
      id: editingCompanyId || crypto.randomUUID(),
      name: companyTemplateName,
      company: companyForm,
      isDefault: isDefaultTemplate,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveSupabaseCompanyTemplate(template);
      await loadTemplates();
      resetCompanyForm();
      alert('Firmenvorlage wurde erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving company template:', error);
      alert('Fehler beim Speichern der Firmenvorlage. Bitte versuchen Sie es erneut.');
    }
  };

  const handleEditCompanyTemplate = (template: CompanyTemplate) => {
    setCompanyForm(template.company);
    setCompanyTemplateName(template.name);
    setIsDefaultTemplate(template.isDefault);
    setEditingCompanyId(template.id);
  };

  const handleDeleteCompanyTemplate = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Firmenvorlage löschen möchten?')) {
      try {
        await deleteSupabaseCompanyTemplate(id);
        await loadTemplates();
      } catch (error) {
        console.error('Error deleting company template:', error);
        alert('Fehler beim Löschen der Firmenvorlage. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm(defaultCompany);
    setCompanyTemplateName('');
    setIsDefaultTemplate(false);
    setEditingCompanyId(null);
  };

  const handleSaveLineItemTemplate = async () => {
    if (!itemForm.description.trim()) {
      alert('Bitte geben Sie eine Beschreibung ein.');
      return;
    }

    const template: LineItemTemplate = {
      id: editingItemId || crypto.randomUUID(),
      description: itemForm.description,
      unitPrice: itemForm.unitPrice,
      category: itemForm.category || 'Allgemein',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveSupabaseLineItemTemplate(template);
      await loadTemplates();
      resetItemForm();
      alert('Positionsvorlage wurde erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving line item template:', error);
      alert('Fehler beim Speichern der Positionsvorlage. Bitte versuchen Sie es erneut.');
    }
  };

  const handleEditLineItemTemplate = (template: LineItemTemplate) => {
    setItemForm({
      description: template.description,
      unitPrice: template.unitPrice,
      category: template.category,
    });
    setEditingItemId(template.id);
  };

  const handleDeleteLineItemTemplate = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Positionsvorlage löschen möchten?')) {
      try {
        await deleteSupabaseLineItemTemplate(id);
        await loadTemplates();
      } catch (error) {
        console.error('Error deleting line item template:', error);
        alert('Fehler beim Löschen der Positionsvorlage. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const resetItemForm = () => {
    setItemForm({
      description: '',
      unitPrice: 0,
      category: '',
    });
    setEditingItemId(null);
  };
  
  // Project Type Template functions
  const handleSaveProjectTypeTemplate = async () => {
    if (!projectTypeForm.name?.trim()) {
      alert('Bitte geben Sie einen Namen für die Projekttyp-Vorlage ein.');
      return;
    }

    const template: ProjectTypeTemplate = {
      id: editingProjectTypeId || crypto.randomUUID(),
      name: projectTypeForm.name!,
      description: projectTypeForm.description!,
      category: projectTypeForm.category!,
      estimatedDuration: projectTypeForm.estimatedDuration!,
      basePrice: projectTypeForm.basePrice!,
      technologies: projectTypeForm.technologies!,
      features: projectTypeForm.features!,
      defaultPhases: projectTypeForm.defaultPhases!,
      isActive: projectTypeForm.isActive!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSupabaseProjectTypeTemplate(template);
      await loadTemplates();
      resetProjectTypeForm();
      alert('Projekttyp-Vorlage wurde erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving project type template:', error);
      alert('Fehler beim Speichern der Projekttyp-Vorlage. Bitte versuchen Sie es erneut.');
    }
  };

  const handleEditProjectTypeTemplate = (template: ProjectTypeTemplate) => {
    setProjectTypeForm(template);
    setEditingProjectTypeId(template.id);
  };

  const handleDeleteProjectTypeTemplate = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Projekttyp-Vorlage löschen möchten?')) {
      try {
        await deleteSupabaseProjectTypeTemplate(id);
        await loadTemplates();
      } catch (error) {
        console.error('Error deleting project type template:', error);
        alert('Fehler beim Löschen der Projekttyp-Vorlage. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const resetProjectTypeForm = () => {
    setProjectTypeForm({
      name: '',
      description: '',
      category: 'Web',
      estimatedDuration: 30,
      basePrice: 0,
      technologies: [],
      features: {
        responsiveDesign: true,
        seoIncluded: false,
        contentManagement: false,
        maintenanceIncluded: false,
      },
      defaultPhases: [],
      isActive: true,
    });
    setEditingProjectTypeId(null);
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !projectTypeForm.technologies?.includes(newTechnology.trim())) {
      setProjectTypeForm({
        ...projectTypeForm,
        technologies: [...(projectTypeForm.technologies || []), newTechnology.trim()],
      });
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setProjectTypeForm({
      ...projectTypeForm,
      technologies: projectTypeForm.technologies?.filter(t => t !== tech) || [],
    });
  };

  const addPhaseToProjectType = () => {
    const newPhase: ProjectPhaseTemplate = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      order: (projectTypeForm.defaultPhases?.length || 0) + 1,
      estimatedHours: 8,
      estimatedDays: 1,
      dependencies: [],
      deliverables: [],
      isOptional: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjectTypeForm({
      ...projectTypeForm,
      defaultPhases: [...(projectTypeForm.defaultPhases || []), newPhase],
    });
  };

  const updatePhaseInProjectType = (phaseId: string, updates: Partial<ProjectPhaseTemplate>) => {
    setProjectTypeForm({
      ...projectTypeForm,
      defaultPhases: projectTypeForm.defaultPhases?.map(phase =>
        phase.id === phaseId ? { ...phase, ...updates } : phase
      ) || [],
    });
  };

  const removePhaseFromProjectType = (phaseId: string) => {
    setProjectTypeForm({
      ...projectTypeForm,
      defaultPhases: projectTypeForm.defaultPhases?.filter(phase => phase.id !== phaseId) || [],
    });
  };

  // Phase Template functions
  const handleSavePhaseTemplate = async () => {
    if (!phaseForm.name?.trim()) {
      alert('Bitte geben Sie einen Namen für die Phase ein.');
      return;
    }

    const template: ProjectPhaseTemplate = {
      id: editingPhaseId || crypto.randomUUID(),
      name: phaseForm.name!,
      description: phaseForm.description!,
      order: phaseForm.order!,
      estimatedHours: phaseForm.estimatedHours!,
      estimatedDays: phaseForm.estimatedDays!,
      dependencies: phaseForm.dependencies!,
      deliverables: phaseForm.deliverables!,
      isOptional: phaseForm.isOptional!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSupabaseProjectPhaseTemplate(template);
      await loadTemplates();
      resetPhaseForm();
      alert('Phasen-Vorlage wurde erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving phase template:', error);
      alert('Fehler beim Speichern der Phasen-Vorlage. Bitte versuchen Sie es erneut.');
    }
  };

  const handleEditPhaseTemplate = (template: ProjectPhaseTemplate) => {
    setPhaseForm(template);
    setEditingPhaseId(template.id);
  };

  const handleDeletePhaseTemplate = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Phasen-Vorlage löschen möchten?')) {
      try {
        await deleteSupabaseProjectPhaseTemplate(id);
        await loadTemplates();
      } catch (error) {
        console.error('Error deleting phase template:', error);
        alert('Fehler beim Löschen der Phasen-Vorlage. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const resetPhaseForm = () => {
    setPhaseForm({
      name: '',
      description: '',
      order: 1,
      estimatedHours: 8,
      estimatedDays: 1,
      dependencies: [],
      deliverables: [],
      isOptional: false,
    });
    setEditingPhaseId(null);
  };

  const addDeliverable = () => {
    if (newDeliverable.trim() && !phaseForm.deliverables?.includes(newDeliverable.trim())) {
      setPhaseForm({
        ...phaseForm,
        deliverables: [...(phaseForm.deliverables || []), newDeliverable.trim()],
      });
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (deliverable: string) => {
    setPhaseForm({
      ...phaseForm,
      deliverables: phaseForm.deliverables?.filter(d => d !== deliverable) || [],
    });
  };

  const categories = [...new Set(lineItemTemplates.map(t => t.category))];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vorlagen verwalten
        </h1>
        <p className="text-gray-600">
          Speichern Sie Ihre Firmendaten und häufig verwendete Positionen als Vorlagen
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Building size={18} />
          Firmenvorlagen
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'items'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Package size={18} />
          Positionsvorlagen
        </button>
        <button
          onClick={() => setActiveTab('project-types')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'project-types'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Briefcase size={18} />
          Projekttypen
        </button>
        <button
          onClick={() => setActiveTab('phases')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'phases'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Clock size={18} />
          Projektphasen
        </button>
      </div>

      {/* Company Templates Tab */}
      {activeTab === 'company' && (
        <div className="space-y-8">
          {/* Company Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCompanyId ? 'Firmenvorlage bearbeiten' : 'Neue Firmenvorlage erstellen'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorlagenname *
                </label>
                <input
                  type="text"
                  value={companyTemplateName}
                  onChange={(e) => setCompanyTemplateName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Hauptfirma, Zweigstelle Berlin..."
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isDefaultTemplate}
                    onChange={(e) => setIsDefaultTemplate(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Als Standardvorlage verwenden
                  </span>
                </label>
              </div>
            </div>

            {/* Company Details Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Grunddaten</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firmenname *
                  </label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PLZ *
                    </label>
                    <input
                      type="text"
                      value={companyForm.postalCode}
                      onChange={(e) => setCompanyForm({ ...companyForm, postalCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ort *
                    </label>
                    <input
                      type="text"
                      value={companyForm.city}
                      onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Steuer- und Rechtsdaten</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Steuernummer
                  </label>
                  <input
                    type="text"
                    value={companyForm.taxId}
                    onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    USt-IdNr.
                  </label>
                  <input
                    type="text"
                    value={companyForm.vatId}
                    onChange={(e) => setCompanyForm({ ...companyForm, vatId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registergericht
                  </label>
                  <input
                    type="text"
                    value={companyForm.registerCourt}
                    onChange={(e) => setCompanyForm({ ...companyForm, registerCourt: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Handelsregisternummer
                  </label>
                  <input
                    type="text"
                    value={companyForm.registerNumber}
                    onChange={(e) => setCompanyForm({ ...companyForm, registerNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geschäftsführer
                  </label>
                  <input
                    type="text"
                    value={companyForm.manager}
                    onChange={(e) => setCompanyForm({ ...companyForm, manager: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Bankverbindung</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    value={companyForm.bankName}
                    onChange={(e) => setCompanyForm({ ...companyForm, bankName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={companyForm.iban}
                    onChange={(e) => setCompanyForm({ ...companyForm, iban: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BIC
                  </label>
                  <input
                    type="text"
                    value={companyForm.bic}
                    onChange={(e) => setCompanyForm({ ...companyForm, bic: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveCompanyTemplate}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save size={18} />
                {editingCompanyId ? 'Aktualisieren' : 'Speichern'}
              </button>
              
              {editingCompanyId && (
                <button
                  onClick={resetCompanyForm}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
              )}
            </div>
          </div>

          {/* Saved Company Templates */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Gespeicherte Firmenvorlagen ({companyTemplates.length})
            </h2>
            
            {companyTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building size={48} className="mx-auto mb-4 opacity-50" />
                <p>Noch keine Firmenvorlagen vorhanden</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companyTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          {template.isDefault && (
                            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              <Star size={12} />
                              Standard
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{template.company.name}</p>
                        <p className="text-sm text-gray-500">
                          {template.company.address}, {template.company.postalCode} {template.company.city}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCompanyTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCompanyTemplate(template.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Line Item Templates Tab */}
      {activeTab === 'items' && (
        <div className="space-y-8">
          {/* Line Item Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingItemId ? 'Positionsvorlage bearbeiten' : 'Neue Positionsvorlage erstellen'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung *
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Detaillierte Leistungsbeschreibung..."
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Einzelpreis (€)
                  </label>
                  <input
                    type="number"
                    value={itemForm.unitPrice}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <input
                    type="text"
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. Beratung, Entwicklung..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveLineItemTemplate}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save size={18} />
                {editingItemId ? 'Aktualisieren' : 'Speichern'}
              </button>
              
              {editingItemId && (
                <button
                  onClick={resetItemForm}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
              )}
            </div>
          </div>

          {/* Saved Line Item Templates */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Gespeicherte Positionsvorlagen ({lineItemTemplates.length})
            </h2>
            
            {lineItemTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>Noch keine Positionsvorlagen vorhanden</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                    <div className="space-y-2">
                      {lineItemTemplates
                        .filter(t => t.category === category)
                        .map((template) => (
                          <div
                            key={template.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">
                                {template.description}
                              </p>
                              <p className="text-sm font-medium text-blue-600">
                                {formatCurrency(template.unitPrice)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditLineItemTemplate(template)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Bearbeiten"
                              >
                                <Edit3 size={16} />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteLineItemTemplate(template.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Löschen"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Type Templates Tab */}
      {activeTab === 'project-types' && (
        <div className="space-y-8">
          {/* Project Type Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingProjectTypeId ? 'Projekttyp-Vorlage bearbeiten' : 'Neue Projekttyp-Vorlage erstellen'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={projectTypeForm.name}
                  onChange={(e) => setProjectTypeForm({ ...projectTypeForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. E-Commerce Website"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <select
                  value={projectTypeForm.category}
                  onChange={(e) => setProjectTypeForm({ ...projectTypeForm, category: e.target.value as ProjectTypeTemplate['category'] })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Web">Web</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Service">Service</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geschätzte Dauer (Tage)
                </label>
                <input
                  type="number"
                  value={projectTypeForm.estimatedDuration}
                  onChange={(e) => setProjectTypeForm({ ...projectTypeForm, estimatedDuration: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basispreis (€)
                </label>
                <input
                  type="number"
                  value={projectTypeForm.basePrice}
                  onChange={(e) => setProjectTypeForm({ ...projectTypeForm, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={projectTypeForm.description}
                onChange={(e) => setProjectTypeForm({ ...projectTypeForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Beschreibung des Projekttyps..."
              />
            </div>

            {/* Technologies */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard-Technologien
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. React, WordPress..."
                />
                <button
                  type="button"
                  onClick={addTechnology}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectTypeForm.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Standard-Features
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectTypeForm.features?.responsiveDesign}
                    onChange={(e) => setProjectTypeForm({
                      ...projectTypeForm,
                      features: { ...projectTypeForm.features!, responsiveDesign: e.target.checked }
                    })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Responsive Design</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectTypeForm.features?.seoIncluded}
                    onChange={(e) => setProjectTypeForm({
                      ...projectTypeForm,
                      features: { ...projectTypeForm.features!, seoIncluded: e.target.checked }
                    })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">SEO inklusive</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectTypeForm.features?.contentManagement}
                    onChange={(e) => setProjectTypeForm({
                      ...projectTypeForm,
                      features: { ...projectTypeForm.features!, contentManagement: e.target.checked }
                    })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Content Management</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectTypeForm.features?.maintenanceIncluded}
                    onChange={(e) => setProjectTypeForm({
                      ...projectTypeForm,
                      features: { ...projectTypeForm.features!, maintenanceIncluded: e.target.checked }
                    })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Wartung inklusive</span>
                </label>
              </div>
            </div>

            {/* Default Phases */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Standard-Projektphasen
                </label>
                <button
                  type="button"
                  onClick={addPhaseToProjectType}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Phase hinzufügen
                </button>
              </div>
              
              <div className="space-y-3">
                {projectTypeForm.defaultPhases?.map((phase, index) => (
                  <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div>
                        <input
                          type="text"
                          value={phase.name}
                          onChange={(e) => updatePhaseInProjectType(phase.id, { name: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Phasenname"
                        />
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          value={phase.estimatedHours}
                          onChange={(e) => updatePhaseInProjectType(phase.id, { estimatedHours: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Stunden"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          value={phase.estimatedDays}
                          onChange={(e) => updatePhaseInProjectType(phase.id, { estimatedDays: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tage"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={phase.isOptional}
                            onChange={(e) => updatePhaseInProjectType(phase.id, { isOptional: e.target.checked })}
                            className="mr-1 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          Optional
                        </label>
                        <button
                          type="button"
                          onClick={() => removePhaseFromProjectType(phase.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <textarea
                        value={phase.description}
                        onChange={(e) => updatePhaseInProjectType(phase.id, { description: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Beschreibung der Phase..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveProjectTypeTemplate}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save size={18} />
                {editingProjectTypeId ? 'Aktualisieren' : 'Speichern'}
              </button>
              
              {editingProjectTypeId && (
                <button
                  onClick={resetProjectTypeForm}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
              )}
            </div>
          </div>

          {/* Saved Project Type Templates */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Gespeicherte Projekttyp-Vorlagen ({projectTypeTemplates.length})
            </h2>
            
            {projectTypeTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                <p>Noch keine Projekttyp-Vorlagen vorhanden</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {projectTypeTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {template.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {template.estimatedDuration} Tage • {formatCurrency(template.basePrice)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {template.defaultPhases.length} Phasen • {template.technologies.length} Technologien
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProjectTypeTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteProjectTypeTemplate(template.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase Templates Tab */}
      {activeTab === 'phases' && (
        <div className="space-y-8">
          {/* Phase Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingPhaseId ? 'Phasen-Vorlage bearbeiten' : 'Neue Phasen-Vorlage erstellen'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phasenname *
                </label>
                <input
                  type="text"
                  value={phaseForm.name}
                  onChange={(e) => setPhaseForm({ ...phaseForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Design & Konzept"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geschätzte Stunden
                </label>
                <input
                  type="number"
                  value={phaseForm.estimatedHours}
                  onChange={(e) => setPhaseForm({ ...phaseForm, estimatedHours: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geschätzte Tage
                </label>
                <input
                  type="number"
                  value={phaseForm.estimatedDays}
                  onChange={(e) => setPhaseForm({ ...phaseForm, estimatedDays: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={phaseForm.description}
                onChange={(e) => setPhaseForm({ ...phaseForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Beschreibung der Phase..."
              />
            </div>

            {/* Deliverables */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liefergegenstände
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Wireframes, Mockups..."
                />
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {phaseForm.deliverables?.map((deliverable, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {deliverable}
                    <button
                      type="button"
                      onClick={() => removeDeliverable(deliverable)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={phaseForm.isOptional}
                  onChange={(e) => setPhaseForm({ ...phaseForm, isOptional: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Phase ist optional
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSavePhaseTemplate}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save size={18} />
                {editingPhaseId ? 'Aktualisieren' : 'Speichern'}
              </button>
              
              {editingPhaseId && (
                <button
                  onClick={resetPhaseForm}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
              )}
            </div>
          </div>

          {/* Saved Phase Templates */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Gespeicherte Phasen-Vorlagen ({projectPhaseTemplates.length})
            </h2>
            
            {projectPhaseTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>Noch keine Phasen-Vorlagen vorhanden</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projectPhaseTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          {template.isOptional && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{template.estimatedHours}h</span>
                          <span>{template.estimatedDays} Tage</span>
                          <span>{template.deliverables.length} Liefergegenstände</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPhaseTemplate(template)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeletePhaseTemplate(template.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};