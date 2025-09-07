import React, { useState, useEffect } from 'react';
import { FileText, Plus, FolderOpen, Settings } from 'lucide-react';
import { DocumentForm } from './components/DocumentForm';
import { DocumentList } from './components/DocumentList';
import { TemplateManager } from './components/TemplateManager';
import { DocumentData } from './types/document';
import { getDocuments } from './utils/storage';

type View = 'list' | 'create' | 'edit' | 'templates';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setDocuments(getDocuments());
  };

  const handleCreateNew = () => {
    setEditingDocument(null);
    setCurrentView('create');
  };

  const handleEdit = (document: DocumentData) => {
    setEditingDocument(document);
    setCurrentView('edit');
  };

  const handleSave = () => {
    loadDocuments();
    setCurrentView('list');
    setEditingDocument(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingDocument(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Rechnungs- und Angebots-Generator
                </h1>
                <p className="text-sm text-gray-600">
                  Professionelle deutsche Geschäftsdokumente erstellen
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentView === 'templates' && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FolderOpen size={18} />
                  Zur Übersicht
                </button>
              )}
              
              {(currentView === 'create' || currentView === 'edit') && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FolderOpen size={18} />
                  Zur Übersicht
                </button>
              )}
              
              {currentView === 'list' && (
                <button
                  onClick={() => setCurrentView('templates')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Settings size={18} />
                  Vorlagen
                </button>
              )}
              
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Neues Dokument
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'list' && (
          <DocumentList
            documents={documents}
            onEdit={handleEdit}
            onRefresh={loadDocuments}
          />
        )}
        
        {currentView === 'templates' && <TemplateManager />}
        
        {(currentView === 'create' || currentView === 'edit') && (
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
              Deutsche Rechnungs- und Angebots-App mit rechtskomplanten Templates
            </p>
            <p>
              Unterstützt Kleinunternehmerregelung nach §19 UStG und alle Pflichtangaben
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;