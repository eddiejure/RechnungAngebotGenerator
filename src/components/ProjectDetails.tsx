import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Euro, 
  Globe, 
  User, 
  Clock, 
  CheckCircle, 
  Circle, 
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Project, Customer, ProjectDocument } from '../types/crm';
import { getSupabaseCustomers, saveSupabaseProject, getSupabaseDocuments } from '../utils/supabaseStorage';
import { DocumentData } from '../types/document';
import { PDFDocument } from './PDFDocument';
import { formatCurrency, formatDate } from '../utils/calculations';

interface ProjectDetailsProps {
  project: Project;
  onEdit: (project: Project) => void;
  onBack: () => void;
  onRefresh: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  project, 
  onEdit, 
  onBack, 
  onRefresh 
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [availableDocuments, setAvailableDocuments] = useState<DocumentData[]>([]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [previewDocument, setPreviewDocument] = useState<DocumentData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadCustomer();
    loadAvailableDocuments();
  }, [project.customerId]);

  const loadCustomer = async () => {
    try {
      const customers = await getSupabaseCustomers();
      const customerData = customers.find(c => c.id === project.customerId);
      setCustomer(customerData || null);
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  const loadAvailableDocuments = async () => {
    try {
      const allDocuments = await getSupabaseDocuments();
      // Filter documents that belong to this customer
      const customerDocuments = allDocuments.filter(doc => 
        doc.linkedCustomerId === project.customerId ||
        doc.customer.name === project.customerName ||
        doc.customer.name.toLowerCase().includes(project.customerName.toLowerCase())
      );
      setAvailableDocuments(customerDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Geplant':
        return 'text-blue-600 bg-blue-100';
      case 'In Bearbeitung':
        return 'text-orange-600 bg-orange-100';
      case 'Review':
        return 'text-purple-600 bg-purple-100';
      case 'Abgeschlossen':
        return 'text-green-600 bg-green-100';
      case 'Pausiert':
        return 'text-yellow-600 bg-yellow-100';
      case 'Storniert':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseStatusIcon = (status: string) => {
    switch (status) {
      case 'Abgeschlossen':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'In Bearbeitung':
        return <Clock size={20} className="text-orange-600" />;
      default:
        return <Circle size={20} className="text-gray-400" />;
    }
  };

  const updateProgress = async (newProgress: number) => {
    const updatedProject = { ...project, progress: newProgress, updatedAt: new Date().toISOString() };
    try {
      await saveSupabaseProject(updatedProject);
      onRefresh();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Fehler beim Aktualisieren des Fortschritts. Bitte versuchen Sie es erneut.');
    }
  };

  const addDocumentToProject = async () => {
    if (!selectedDocumentId) return;
    
    const document = availableDocuments.find(doc => doc.id === selectedDocumentId);
    if (!document) return;

    const newProjectDocument: ProjectDocument = {
      id: crypto.randomUUID(),
      name: `${document.type === 'invoice' ? 'Rechnung' : document.type === 'quote' ? 'Angebot' : 'Brief'} ${document.documentNumber}`,
      type: document.type === 'invoice' ? 'Rechnung' : document.type === 'quote' ? 'Angebot' : 'Sonstiges',
      documentId: document.id,
      uploadedAt: new Date().toISOString(),
    };

    const updatedProject = {
      ...project,
      documents: [...project.documents, newProjectDocument],
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveSupabaseProject(updatedProject);
      setShowAddDocument(false);
      setSelectedDocumentId('');
      onRefresh();
    } catch (error) {
      console.error('Error adding document to project:', error);
      alert('Fehler beim Hinzufügen des Dokuments. Bitte versuchen Sie es erneut.');
    }
  };

  const removeDocumentFromProject = async (documentId: string) => {
    if (window.confirm('Möchten Sie dieses Dokument aus dem Projekt entfernen?')) {
      try {
        const updatedProject = {
          ...project,
          documents: project.documents.filter(doc => doc.id !== documentId),
          updatedAt: new Date().toISOString(),
        };
        await saveSupabaseProject(updatedProject);
        onRefresh();
      } catch (error) {
        console.error('Error removing document from project:', error);
        alert('Fehler beim Entfernen des Dokuments. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const handlePreviewDocument = (documentId: string) => {
    const document = availableDocuments.find(doc => doc.id === documentId);
    if (document) {
      setPreviewDocument(document);
      setShowPreview(true);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewDocument(null);
  };

  const completedPhases = project.phases.filter(phase => phase.status === 'Abgeschlossen').length;
  const totalPhases = project.phases.length;
  const phaseProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Zurück zur Projektübersicht
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{project.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={18} />
                <span>{project.type}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => onEdit(project)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Bearbeiten
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6">Projektübersicht</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Fortschritt</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">{project.progress}%</span>
                </div>
                <div className="mt-2 flex gap-2">
                  {[0, 25, 50, 75, 100].map((value) => (
                    <button
                      key={value}
                      onClick={() => updateProgress(value)}
                      className={`px-2 py-1 text-xs rounded ${
                        project.progress === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Phasen-Fortschritt</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${phaseProgress}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-medium text-gray-900">{completedPhases}/{totalPhases}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {completedPhases} von {totalPhases} Phasen abgeschlossen
                </p>
              </div>
            </div>

            {project.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Beschreibung</h3>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>
            )}
          </div>

          {/* Project Phases */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6">Projektphasen</h2>
            
            <div className="space-y-4">
              {project.phases
                .sort((a, b) => a.order - b.order)
                .map((phase) => (
                  <div
                    key={phase.id}
                    className={`border rounded-lg p-4 ${
                      phase.status === 'Abgeschlossen' ? 'bg-green-50 border-green-200' :
                      phase.status === 'In Bearbeitung' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getPhaseStatusIcon(phase.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{phase.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            phase.status === 'Abgeschlossen' ? 'text-green-600 bg-green-100' :
                            phase.status === 'In Bearbeitung' ? 'text-orange-600 bg-orange-100' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                            {phase.status}
                          </span>
                        </div>
                        {phase.description && (
                          <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                        )}
                        {phase.estimatedHours && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>Geschätzt: {phase.estimatedHours}h</span>
                            {phase.actualHours && (
                              <span>• Tatsächlich: {phase.actualHours}h</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Projektdokumente</h2>
              <button
                onClick={() => setShowAddDocument(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                Dokument hinzufügen
              </button>
            </div>

            {showAddDocument && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-gray-900 mb-3">Dokument aus App hinzufügen</h3>
                <div className="flex gap-3">
                  <select
                    value={selectedDocumentId}
                    onChange={(e) => setSelectedDocumentId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Dokument auswählen</option>
                    {availableDocuments
                      .filter(doc => !project.documents.some(pd => pd.documentId === doc.id))
                      .map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.type === 'invoice' ? 'Rechnung' : doc.type === 'quote' ? 'Angebot' : 'Brief'} {doc.documentNumber} - {formatDate(doc.date)}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={addDocumentToProject}
                    disabled={!selectedDocumentId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Hinzufügen
                  </button>
                  <button
                    onClick={() => setShowAddDocument(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
            
            {project.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>Noch keine Dokumente vorhanden</p>
                <p className="text-sm">Fügen Sie Angebote, Rechnungen oder andere Dokumente hinzu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        doc.type === 'Rechnung' ? 'bg-blue-100 text-blue-600' :
                        doc.type === 'Angebot' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <p className="text-sm text-gray-600">
                          {doc.type} • {formatDate(doc.uploadedAt)}
                        </p>
                        {doc.notes && (
                          <p className="text-sm text-gray-500 mt-1">{doc.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {doc.documentId && (
                        <>
                          <button
                            onClick={() => handlePreviewDocument(doc.documentId!)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="PDF Vorschau"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {(() => {
                            const document = availableDocuments.find(d => d.id === doc.documentId);
                            return document ? (
                              <PDFDownloadLink
                                document={<PDFDocument data={document} />}
                                fileName={`${document.type === 'invoice' ? 'Rechnung' : document.type === 'quote' ? 'Angebot' : 'Brief'}-${document.documentNumber}.pdf`}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="PDF herunterladen"
                              >
                                <Download size={16} />
                              </PDFDownloadLink>
                            ) : null;
                          })()}
                        </>
                      )}
                      
                      <button
                        onClick={() => removeDocumentFromProject(doc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Aus Projekt entfernen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Projektdetails</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Priorität</label>
                <p className={`text-sm px-2 py-1 rounded-full inline-block mt-1 ${
                  project.priority === 'Dringend' ? 'text-red-600 bg-red-100' :
                  project.priority === 'Hoch' ? 'text-orange-600 bg-orange-100' :
                  project.priority === 'Mittel' ? 'text-yellow-600 bg-yellow-100' :
                  'text-green-600 bg-green-100'
                }`}>
                  {project.priority}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Zahlungsmodell</label>
                <p className="text-sm text-gray-900 mt-1">{project.paymentType}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Budget</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(project.budget)}</p>
                {project.paymentType !== 'Einmalzahlung' && project.monthlyPrice && (
                  <p className="text-sm text-green-600">
                    {project.paymentType === 'Monatliches Abo' ? 'Monatlich' : 'Jährlich'}: {formatCurrency(project.monthlyPrice)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Termine</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-600">Start:</span>
                <span className="font-medium">{formatDate(project.startDate)}</span>
              </div>
              
              {project.deadline && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium text-orange-600">{formatDate(project.deadline)}</span>
                </div>
              )}
              
              {project.launchDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={16} className="text-green-500" />
                  <span className="text-gray-600">Launch:</span>
                  <span className="font-medium text-green-600">{formatDate(project.launchDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Technische Details</h3>
            
            <div className="space-y-3">
              {project.domain && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Domain</label>
                  <p className="text-sm text-gray-900 mt-1">{project.domain}</p>
                </div>
              )}
              
              {project.hostingProvider && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Hosting</label>
                  <p className="text-sm text-gray-900 mt-1">{project.hostingProvider}</p>
                </div>
              )}
              
              {project.technologies.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Technologien</label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${project.responsiveDesign ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle size={14} />
                    <span>Responsive</span>
                  </div>
                  <div className={`flex items-center gap-1 ${project.seoIncluded ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle size={14} />
                    <span>SEO</span>
                  </div>
                  <div className={`flex items-center gap-1 ${project.contentManagement ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle size={14} />
                    <span>CMS</span>
                  </div>
                  <div className={`flex items-center gap-1 ${project.maintenanceIncluded ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle size={14} />
                    <span>Wartung</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {customer && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Kundeninformationen</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  {customer.company && (
                    <p className="text-sm text-gray-600">{customer.company}</p>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>{customer.email}</p>
                  {customer.phone && <p>{customer.phone}</p>}
                </div>
                
                <div className="pt-3 border-t text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projekte:</span>
                    <span className="font-medium">{customer.totalProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Umsatz:</span>
                    <span className="font-medium">{formatCurrency(customer.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  PDF Vorschau: {previewDocument.type === 'invoice' ? 'Rechnung' : previewDocument.type === 'quote' ? 'Angebot' : 'Brief'} {previewDocument.documentNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  {previewDocument.customer.name} • {formatDate(previewDocument.date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PDFDownloadLink
                  document={<PDFDocument data={previewDocument} />}
                  fileName={`${previewDocument.type === 'invoice' ? 'Rechnung' : previewDocument.type === 'quote' ? 'Angebot' : 'Brief'}-${previewDocument.documentNumber}.pdf`}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download
                </PDFDownloadLink>
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Schließen"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <div className="w-full h-full">
                <PDFViewer
                  width="100%"
                  height="100%"
                  className="border-none"
                >
                  <PDFDocument data={previewDocument} />
                </PDFViewer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};