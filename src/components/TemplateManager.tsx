import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Building, Package, Star, Edit3 } from 'lucide-react';
import { CompanyTemplate, LineItemTemplate } from '../types/template';
import { Company } from '../types/document';
import {
  saveCompanyTemplate,
  getCompanyTemplates,
  deleteCompanyTemplate,
  saveLineItemTemplate,
  getLineItemTemplates,
  deleteLineItemTemplate,
} from '../utils/templateStorage';
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
  const [activeTab, setActiveTab] = useState<'company' | 'items'>('company');
  const [companyTemplates, setCompanyTemplates] = useState<CompanyTemplate[]>([]);
  const [lineItemTemplates, setLineItemTemplates] = useState<LineItemTemplate[]>([]);
  
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

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setCompanyTemplates(getCompanyTemplates());
    setLineItemTemplates(getLineItemTemplates());
  };

  const handleSaveCompanyTemplate = () => {
    if (!companyTemplateName.trim()) {
      alert('Bitte geben Sie einen Namen für die Vorlage ein.');
      return;
    }

    const template: CompanyTemplate = {
      id: editingCompanyId || `company-${Date.now()}`,
      name: companyTemplateName,
      company: companyForm,
      isDefault: isDefaultTemplate,
      createdAt: new Date().toISOString(),
    };

    saveCompanyTemplate(template);
    loadTemplates();
    resetCompanyForm();
    alert('Firmenvorlage wurde erfolgreich gespeichert!');
  };

  const handleEditCompanyTemplate = (template: CompanyTemplate) => {
    setCompanyForm(template.company);
    setCompanyTemplateName(template.name);
    setIsDefaultTemplate(template.isDefault);
    setEditingCompanyId(template.id);
  };

  const handleDeleteCompanyTemplate = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Firmenvorlage löschen möchten?')) {
      deleteCompanyTemplate(id);
      loadTemplates();
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm(defaultCompany);
    setCompanyTemplateName('');
    setIsDefaultTemplate(false);
    setEditingCompanyId(null);
  };

  const handleSaveLineItemTemplate = () => {
    if (!itemForm.description.trim()) {
      alert('Bitte geben Sie eine Beschreibung ein.');
      return;
    }

    const template: LineItemTemplate = {
      id: editingItemId || `item-${Date.now()}`,
      description: itemForm.description,
      unitPrice: itemForm.unitPrice,
      category: itemForm.category || 'Allgemein',
      createdAt: new Date().toISOString(),
    };

    saveLineItemTemplate(template);
    loadTemplates();
    resetItemForm();
    alert('Positionsvorlage wurde erfolgreich gespeichert!');
  };

  const handleEditLineItemTemplate = (template: LineItemTemplate) => {
    setItemForm({
      description: template.description,
      unitPrice: template.unitPrice,
      category: template.category,
    });
    setEditingItemId(template.id);
  };

  const handleDeleteLineItemTemplate = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Positionsvorlage löschen möchten?')) {
      deleteLineItemTemplate(id);
      loadTemplates();
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
    </div>
  );
};