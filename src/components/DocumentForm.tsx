import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus, FileText, Download, Eye, Save, Building, Package } from 'lucide-react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { LineItemForm } from './LineItemForm';
import { RichTextEditor } from './RichTextEditor';
import { PDFDocument } from './PDFDocument';
import { DocumentData, LineItem, Customer, Company } from '../types/document';
import { LineItemTemplate, CompanyTemplate } from '../types/template';
import { calculateSubtotal, calculateVat, calculateTotal, formatCurrency } from '../utils/calculations';
import { saveDocument } from '../utils/storage';
import { getDefaultCompanyTemplate, getLineItemTemplates, getCompanyTemplates } from '../utils/templateStorage';

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

interface DocumentFormProps {
  initialData?: DocumentData | null;
  onSave?: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({ initialData, onSave }) => {
  const [documentType, setDocumentType] = useState<'invoice' | 'quote' | 'letter'>('invoice');
  const [documentNumber, setDocumentNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [isSmallBusiness, setIsSmallBusiness] = useState(false);
  const [notes, setNotes] = useState('');
  const [letterSubject, setLetterSubject] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [letterGreeting, setLetterGreeting] = useState('Sehr geehrte Damen und Herren,');
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [lineItemTemplates, setLineItemTemplates] = useState<LineItemTemplate[]>([]);
  const [companyTemplates, setCompanyTemplates] = useState<CompanyTemplate[]>([]);
  const [selectedCompanyTemplate, setSelectedCompanyTemplate] = useState<string>('');
  
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Deutschland',
  });
  
  const [company, setCompany] = useState<Company>(defaultCompany);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    // Load default company template
    const defaultTemplate = getDefaultCompanyTemplate();
    const allCompanyTemplates = getCompanyTemplates();
    setCompanyTemplates(allCompanyTemplates);
    
    if (defaultTemplate && !initialData) {
      setCompany(defaultTemplate.company);
      setSelectedCompanyTemplate(defaultTemplate.id);
    }
    
    // Load line item templates
    setLineItemTemplates(getLineItemTemplates());
    
    if (initialData) {
      setDocumentType(initialData.type);
      setDocumentNumber(initialData.documentNumber);
      setDate(initialData.date);
      setDueDate(initialData.dueDate || '');
      setIsSmallBusiness(initialData.isSmallBusiness);
      setNotes(initialData.notes);
      setCustomer(initialData.customer);
      setCompany(initialData.company);
      setLineItems(initialData.lineItems);
      if (initialData.type === 'letter') {
        setLetterSubject(initialData.letterSubject || '');
        setLetterContent(initialData.letterContent || '');
        setLetterGreeting(initialData.letterGreeting || 'Sehr geehrte Damen und Herren,');
      }
    } else {
      // Auto-generate document number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getTime()).slice(-6);
      const prefix = documentType === 'invoice' ? 'R' : documentType === 'quote' ? 'A' : 'B';
      setDocumentNumber(`${prefix}-${year}${month}${day}-${time}`);
    }
  }, [initialData, documentType]);

  const handleCompanyTemplateChange = (templateId: string) => {
    setSelectedCompanyTemplate(templateId);
    if (templateId) {
      const template = companyTemplates.find(t => t.id === templateId);
      if (template) {
        setCompany(template.company);
      }
    } else {
      setCompany(defaultCompany);
    }
  };
  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      position: lineItems.length + 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const addLineItemFromTemplate = (template: LineItemTemplate) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      position: lineItems.length + 1,
      description: template.description,
      quantity: 1,
      unitPrice: template.unitPrice,
      total: template.unitPrice,
    };
    setLineItems([...lineItems, newItem]);
    setShowTemplateSelector(false);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(items =>
      items.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteLineItem = (id: string) => {
    setLineItems(items => {
      const filtered = items.filter(item => item.id !== id);
      return filtered.map((item, index) => ({ ...item, position: index + 1 }));
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lineItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedItems = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setLineItems(reorderedItems);
  };

  const subtotal = calculateSubtotal(lineItems);
  const vatAmount = calculateVat(subtotal, isSmallBusiness);
  const total = calculateTotal(subtotal, vatAmount);

  const documentData: DocumentData = {
    id: initialData?.id || `doc-${Date.now()}`,
    type: documentType,
    documentNumber,
    date,
    dueDate: documentType === 'invoice' ? dueDate : undefined,
    customer,
    company,
    lineItems,
    isSmallBusiness,
    notes,
    letterSubject: documentType === 'letter' ? letterSubject : undefined,
    letterContent: documentType === 'letter' ? letterContent : undefined,
    letterGreeting: documentType === 'letter' ? letterGreeting : undefined,
    subtotal,
    vatAmount,
    total,
    createdAt: initialData?.createdAt || new Date().toISOString(),
  };

  const handleSave = () => {
    saveDocument(documentData);
    onSave?.();
    alert('Dokument wurde erfolgreich gespeichert!');
  };

  const categories = [...new Set(lineItemTemplates.map(t => t.category))];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {documentType === 'invoice' ? 'Rechnung' : documentType === 'quote' ? 'Angebot' : 'Freier Brief'} erstellen
        </h1>
        <p className="text-gray-600">
          Erstellen Sie professionelle {documentType === 'invoice' ? 'Rechnungen' : documentType === 'quote' ? 'Angebote' : 'Geschäftsbriefe'} {documentType !== 'letter' ? 'mit Drag-and-Drop-Funktionalität' : 'für allgemeine Korrespondenz'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Document Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Dokument-Einstellungen</h2>
          </div>
          
          {/* Quick Document Type Buttons */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dokumenttyp auswählen
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDocumentType('invoice')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  documentType === 'invoice'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-sm'
                }`}
              >
                <FileText size={20} />
                <span>Rechnung</span>
              </button>
              
              <button
                type="button"
                onClick={() => setDocumentType('quote')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  documentType === 'quote'
                    ? 'bg-green-600 text-white shadow-md transform scale-105'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm'
                }`}
              >
                <FileText size={20} />
                <span>Angebot</span>
              </button>
              
              <button
                type="button"
                onClick={() => setDocumentType('letter')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  documentType === 'letter'
                    ? 'bg-purple-600 text-white shadow-md transform scale-105'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow-sm'
                }`}
              >
                <FileText size={20} />
                <span>Freier Brief</span>
              </button>
            </div>
          </div>
          
          {/* Company Template Selection */}
          {companyTemplates.length > 0 && !initialData && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firmenvorlage auswählen
              </label>
              <select
                value={selectedCompanyTemplate}
                onChange={(e) => handleCompanyTemplateChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Keine Vorlage (Standarddaten verwenden)</option>
                {companyTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.isDefault ? '(Standard)' : ''}
                  </option>
                ))}
              </select>
              {selectedCompanyTemplate && (
                <p className="text-xs text-blue-600 mt-1">
                  Firmendaten wurden aus der Vorlage geladen
                </p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dokumentnummer
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {documentType === 'invoice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fälligkeitsdatum
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
          
          {documentType !== 'letter' && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSmallBusiness}
                  onChange={(e) => setIsSmallBusiness(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Kleinunternehmerregelung nach §19 UStG
                </span>
              </label>
              {isSmallBusiness && (
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Bei Aktivierung wird keine Umsatzsteuer berechnet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Letter-specific fields */}
        {documentType === 'letter' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Empfängerdaten</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name / Firma
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Max Mustermann"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Musterstraße 123"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Berlin"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information for invoices/quotes */}
        {documentType !== 'letter' && (
          /* Customer Information for invoices/quotes */
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Kundendaten</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firmenname / Name
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Max Mustermann GmbH"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Kundenstraße 456"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="München"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Line Items - only for invoices and quotes */}
      {documentType !== 'letter' && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Positionen</h2>
            <div className="flex gap-2">
              {lineItemTemplates.length > 0 && (
                <button
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <Package size={18} />
                  Aus Vorlage
                </button>
              )}
              <button
                onClick={addLineItem}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Position hinzufügen
              </button>
            </div>
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-3">Position aus Vorlage hinzufügen</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {lineItemTemplates
                        .filter(t => t.category === category)
                        .map((template) => (
                          <button
                            key={template.id}
                            onClick={() => addLineItemFromTemplate(template)}
                            className="text-left p-3 bg-white border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            <div className="font-medium text-gray-900 text-sm mb-1">
                              {template.description.length > 50 
                                ? template.description.substring(0, 50) + '...'
                                : template.description
                              }
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              {formatCurrency(template.unitPrice)}
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="mt-3 text-sm text-gray-600 hover:text-gray-800"
              >
                Schließen
              </button>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="line-items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {lineItems.map((item, index) => (
                    <LineItemForm
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={updateLineItem}
                      onDelete={deleteLineItem}
                    />
                  ))}
                  {provided.placeholder}
                  
                  {lineItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Noch keine Positionen vorhanden</p>
                      <p className="text-sm">
                        Klicken Sie auf "Position hinzufügen" oder "Aus Vorlage", um zu beginnen
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Totals */}
          {lineItems.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Zwischensumme:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {!isSmallBusiness && (
                    <div className="flex justify-between py-2">
                      <span>19% MwSt.:</span>
                      <span>{formatCurrency(vatAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-3 border-t-2 border-gray-300">
                    <span className="text-lg font-bold">Gesamtbetrag:</span>
                    <span className="text-lg font-bold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Letter Content - only for letters */}
      {documentType === 'letter' && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Brief-Inhalt</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Betreff
              </label>
              <input
                type="text"
                value={letterSubject}
                onChange={(e) => setLetterSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Betreff des Briefes..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anrede
              </label>
              <input
                type="text"
                value={letterGreeting}
                onChange={(e) => setLetterGreeting(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sehr geehrte Damen und Herren,"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brief-Text
              </label>
              <RichTextEditor
                value={letterContent}
                onChange={(value) => setLetterContent(value)}
                placeholder="Hier können Sie den Inhalt Ihres Briefes eingeben..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes - different label for letters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {documentType === 'letter' ? 'Zusätzliche Anmerkungen' : 'Anmerkungen'}
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={documentType === 'letter' ? 'Zusätzliche Informationen oder Anhänge...' : 'Zusätzliche Informationen oder Zahlungsbedingungen...'}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
        >
          <Save size={18} />
          Speichern
        </button>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
        >
          <Eye size={18} />
          {showPreview ? 'Vorschau schließen' : 'PDF Vorschau'}
        </button>

        <PDFDownloadLink
          document={<PDFDocument data={documentData} />}
          fileName={`${documentType === 'invoice' ? 'Rechnung' : documentType === 'quote' ? 'Angebot' : 'Brief'}-${documentNumber}.pdf`}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download size={18} />
          PDF Download
        </PDFDownloadLink>
      </div>

      {/* PDF Preview */}
      {showPreview && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">PDF Vorschau</h2>
            <div className="h-[80vh] min-h-[600px] border border-gray-300 rounded-lg overflow-hidden">
              <PDFViewer
                width="100%"
                height="100%"
                className="border-none"
              >
                <PDFDocument data={documentData} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};