import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Plus, Trash2, Calendar, Globe, Euro } from 'lucide-react';
import { Project, Customer, ProjectPhase } from '../types/crm';
import { saveSupabaseProject, getSupabaseCustomers, getSupabaseProjectTypeTemplates } from '../utils/supabaseStorage';
import { ProjectTypeTemplate } from '../types/template';

interface ProjectFormProps {
  initialData?: Project | null;
  onSave: () => void;
  onCancel: () => void;
}

const defaultPhases: Omit<ProjectPhase, 'id'>[] = [
  { name: 'Briefing & Konzept', description: 'Anforderungsanalyse und Konzepterstellung', status: 'Geplant', order: 1 },
  { name: 'Design', description: 'Wireframes und visuelles Design', status: 'Geplant', order: 2 },
  { name: 'Entwicklung', description: 'Frontend und Backend Entwicklung', status: 'Geplant', order: 3 },
  { name: 'Content Integration', description: 'Inhalte einpflegen und optimieren', status: 'Geplant', order: 4 },
  { name: 'Testing & QA', description: 'Tests und Qualitätssicherung', status: 'Geplant', order: 5 },
  { name: 'Launch', description: 'Website live schalten', status: 'Geplant', order: 6 },
];

const projectTypeOptions = [
  { value: 'Website', label: 'Website', category: 'Web' },
  { value: 'E-Commerce', label: 'E-Commerce', category: 'Web' },
  { value: 'Landing Page', label: 'Landing Page', category: 'Web' },
  { value: 'Corporate Website', label: 'Corporate Website', category: 'Web' },
  { value: 'Portfolio', label: 'Portfolio', category: 'Web' },
  { value: 'Blog', label: 'Blog', category: 'Web' },
  { value: 'App', label: 'App', category: 'Web' },
  { value: 'Redesign', label: 'Redesign', category: 'Web' },
  { value: 'Logo Design', label: 'Logo Design', category: 'Design' },
  { value: 'Branding', label: 'Branding', category: 'Design' },
  { value: 'Druckmedien', label: 'Druckmedien', category: 'Design' },
  { value: 'Social Media', label: 'Social Media', category: 'Marketing' },
  { value: 'SEO', label: 'SEO', category: 'Marketing' },
  { value: 'Beratung', label: 'Beratung', category: 'Service' },
  { value: 'Wartung', label: 'Wartung', category: 'Service' },
  { value: 'Hosting', label: 'Hosting', category: 'Service' },
  { value: 'Domain', label: 'Domain', category: 'Service' },
  { value: 'Sonstiges', label: 'Sonstiges', category: 'Sonstiges' },
];

export const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSave, onCancel }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projectTypeTemplates, setProjectTypeTemplates] = useState<ProjectTypeTemplate[]>([]);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    customerId: '',
    customerName: '',
    types: ['Website'],
    status: 'Geplant',
    priority: 'Mittel',
    paymentType: 'Einmalzahlung',
    monthlyPrice: undefined,
    setupFee: undefined,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    deadline: '',
    budget: 0,
    description: '',
    technologies: [],
    progress: 0,
    domain: '',
    hostingProvider: '',
    launchDate: '',
    maintenanceIncluded: false,
    seoIncluded: false,
    contentManagement: false,
    responsiveDesign: true,
    documents: [],
    phases: defaultPhases.map(phase => ({
      ...phase,
      id: crypto.randomUUID(),
    })),
  });

  const [newTechnology, setNewTechnology] = useState('');

  useEffect(() => {
    loadCustomers();
    loadProjectTypeTemplates();
    if (initialData) {
      setFormData({
        ...initialData,
        phases: initialData.phases.length > 0 ? initialData.phases : defaultPhases.map((phase, index) => ({
          ...phase,
          id: crypto.randomUUID(),
        })),
      });
    }
  }, [initialData]);

  const loadCustomers = async () => {
    try {
      const data = await getSupabaseCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProjectTypeTemplates = async () => {
    try {
      const data = await getSupabaseProjectTypeTemplates();
      setProjectTypeTemplates(data);
    } catch (error) {
      console.error('Error loading project type templates:', error);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData({
      ...formData,
      customerId,
      customerName: customer ? customer.name : '',
    });
  };

  const handleTypeToggle = (type: string) => {
    const currentTypes = formData.types || [];
    if (currentTypes.includes(type as any)) {
      setFormData({
        ...formData,
        types: currentTypes.filter(t => t !== type) as any[],
      });
    } else {
      setFormData({
        ...formData,
        types: [...currentTypes, type] as any[],
      });
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies?.includes(newTechnology.trim())) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), newTechnology.trim()],
      });
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies?.filter(t => t !== tech) || [],
    });
  };

  const updatePhase = (phaseId: string, updates: Partial<ProjectPhase>) => {
    setFormData({
      ...formData,
      phases: formData.phases?.map(phase =>
        phase.id === phaseId ? { ...phase, ...updates } : phase
      ) || [],
    });
  };

  const addPhase = () => {
    const newPhase: ProjectPhase = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      status: 'Geplant',
      order: (formData.phases?.length || 0) + 1,
    };
    setFormData({
      ...formData,
      phases: [...(formData.phases || []), newPhase],
    });
  };

  const removePhase = (phaseId: string) => {
    setFormData({
      ...formData,
      phases: formData.phases?.filter(phase => phase.id !== phaseId) || [],
    });
  };

  const applyProjectTypeTemplate = (templateId: string) => {
    const template = projectTypeTemplates.find(t => t.id === templateId);
    if (!template) return;

    // Apply template data to form
    setFormData({
      ...formData,
      types: [template.name as any], // Add template name as project type
      budget: template.basePrice,
      technologies: template.technologies,
      responsiveDesign: template.features.responsiveDesign,
      seoIncluded: template.features.seoIncluded,
      contentManagement: template.features.contentManagement,
      maintenanceIncluded: template.features.maintenanceIncluded,
      phases: template.defaultPhases.map(phase => ({
        id: crypto.randomUUID(),
        name: phase.name,
        description: phase.description,
        status: 'Geplant' as const,
        order: phase.order,
        startDate: undefined,
        endDate: undefined,
        estimatedHours: phase.estimatedHours,
        actualHours: undefined,
      })),
    });

    // Calculate estimated end date based on template duration
    if (formData.startDate && template.estimatedDuration) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + template.estimatedDuration);
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.customerId || !formData.budget || !formData.types || formData.types.length === 0) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    const project: Project = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name!,
      customerId: formData.customerId!,
      customerName: formData.customerName!,
      types: formData.types!,
      status: formData.status!,
      priority: formData.priority!,
      paymentType: formData.paymentType!,
      monthlyPrice: formData.monthlyPrice,
      setupFee: formData.setupFee,
      startDate: formData.startDate!,
      endDate: formData.endDate,
      deadline: formData.deadline,
      budget: formData.budget!,
      description: formData.description!,
      technologies: formData.technologies!,
      progress: formData.progress!,
      domain: formData.domain,
      hostingProvider: formData.hostingProvider,
      launchDate: formData.launchDate,
      maintenanceIncluded: formData.maintenanceIncluded!,
      seoIncluded: formData.seoIncluded!,
      contentManagement: formData.contentManagement!,
      responsiveDesign: formData.responsiveDesign!,
      documents: formData.documents!,
      phases: formData.phases!,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSupabaseProject(project);
      onSave();
      alert('Projekt wurde erfolgreich gespeichert!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Fehler beim Speichern des Projekts. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Zurück zur Übersicht
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {initialData ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
        </h1>
        <p className="text-gray-600">
          Erstellen Sie ein neues Webdesign-Projekt mit allen wichtigen Details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Grunddaten</h2>
          
          {/* Project Template Selector */}
          {!initialData && projectTypeTemplates.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-3">🚀 Schnellstart mit Vorlage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectTypeTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyProjectTypeTemplate(template.id)}
                    className="text-left p-3 bg-white border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {template.description}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {template.category}
                      </span>
                      <span className="text-gray-500">
                        {template.estimatedDuration} Tage
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 Klicken Sie auf eine Vorlage, um Projekttyp, Phasen und Einstellungen automatisch zu übernehmen
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projektname *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Neue Website für..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kunde *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Kunde auswählen</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company && `(${customer.company})`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projekttypen *
              </label>
              <div className="space-y-3">
                {['Web', 'Design', 'Marketing', 'Service', 'Sonstiges'].map((category) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {projectTypeOptions
                        .filter(option => option.category === category)
                        .map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.types?.includes(option.value as any)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.types?.includes(option.value as any) || false}
                              onChange={() => handleTypeToggle(option.value)}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              {formData.types && formData.types.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    Ausgewählte Projekttypen ({formData.types.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.types.map((type, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {type}
                        <button
                          type="button"
                          onClick={() => handleTypeToggle(type)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Geplant">Geplant</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Review">Review</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
                <option value="Pausiert">Pausiert</option>
                <option value="Storniert">Storniert</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorität
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Niedrig">Niedrig</option>
                <option value="Mittel">Mittel</option>
                <option value="Hoch">Hoch</option>
                <option value="Dringend">Dringend</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fortschritt (%)
              </label>
              <input
                type="number"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Zahlungsmodell</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zahlungsart
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as Project['paymentType'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Einmalzahlung">Einmalzahlung</option>
                <option value="Monatliches Abo">Monatliches Abo</option>
                <option value="Jährliches Abo">Jährliches Abo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.paymentType === 'Einmalzahlung' ? 'Gesamtbudget (€) *' : 'Setup-Gebühr (€)'}
              </label>
              <input
                type="number"
                value={formData.paymentType === 'Einmalzahlung' ? formData.budget : formData.setupFee || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (formData.paymentType === 'Einmalzahlung') {
                    setFormData({ ...formData, budget: value });
                  } else {
                    setFormData({ ...formData, setupFee: value });
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                required={formData.paymentType === 'Einmalzahlung'}
              />
            </div>
            
            {formData.paymentType !== 'Einmalzahlung' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.paymentType === 'Monatliches Abo' ? 'Monatlicher Preis (€) *' : 'Jährlicher Preis (€) *'}
                </label>
                <input
                  type="number"
                  value={formData.monthlyPrice || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || 0, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Termine</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startdatum *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Launch-Datum
              </label>
              <input
                type="date"
                value={formData.launchDate}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Technische Details</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="www.beispiel.de"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hosting-Anbieter
              </label>
              <input
                type="text"
                value={formData.hostingProvider}
                onChange={(e) => setFormData({ ...formData, hostingProvider: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Strato, 1&1, AWS..."
              />
            </div>
          </div>

          {/* Technologies */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technologien
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. React, WordPress, PHP..."
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
              {formData.technologies?.map((tech, index) => (
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.responsiveDesign}
                onChange={(e) => setFormData({ ...formData, responsiveDesign: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Responsive Design</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.contentManagement}
                onChange={(e) => setFormData({ ...formData, contentManagement: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Content Management</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.seoIncluded}
                onChange={(e) => setFormData({ ...formData, seoIncluded: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">SEO inklusive</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.maintenanceIncluded}
                onChange={(e) => setFormData({ ...formData, maintenanceIncluded: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Wartung inklusive</span>
            </label>
          </div>
        </div>

        {/* Project Phases */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Projektphasen</h2>
            <button
              type="button"
              onClick={addPhase}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus size={18} />
              Phase hinzufügen
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.phases?.map((phase, index) => (
              <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phasenname
                    </label>
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="z.B. Design"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={phase.status}
                      onChange={(e) => updatePhase(phase.id, { status: e.target.value as ProjectPhase['status'] })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Geplant">Geplant</option>
                      <option value="In Bearbeitung">In Bearbeitung</option>
                      <option value="Abgeschlossen">Abgeschlossen</option>
                      <option value="Übersprungen">Übersprungen</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geschätzte Stunden
                    </label>
                    <input
                      type="number"
                      value={phase.estimatedHours || ''}
                      onChange={(e) => updatePhase(phase.id, { estimatedHours: parseFloat(e.target.value) || undefined })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removePhase(phase.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Phase löschen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={phase.description}
                    onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Beschreibung der Phase..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Projektbeschreibung</h2>
          
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detaillierte Beschreibung des Projekts, Ziele, Besonderheiten..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            {initialData ? 'Aktualisieren' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};