import React from 'react';
import { FileText, Download, Edit, Trash2, Calendar } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DocumentData } from '../types/document';
import { PDFDocument } from './PDFDocument';
import { formatCurrency, formatDate } from '../utils/calculations';
import { deleteDocument } from '../utils/storage';

interface DocumentListProps {
  documents: DocumentData[];
  onEdit: (document: DocumentData) => void;
  onRefresh: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onEdit,
  onRefresh,
}) => {
  const handleDelete = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Dokument löschen möchten?')) {
      deleteDocument(id);
      onRefresh();
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <FileText size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Noch keine Dokumente vorhanden
        </h3>
        <p className="text-gray-600">
          Erstellen Sie Ihr erstes Angebot oder Ihre erste Rechnung
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Gespeicherte Dokumente ({documents.length})
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {documents
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((doc) => (
            <div
              key={doc.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      doc.type === 'invoice' 
                        ? 'bg-blue-100 text-blue-600' 
                        : doc.type === 'quote'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      <FileText size={20} />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {doc.type === 'invoice' ? 'Rechnung' : doc.type === 'quote' ? 'Angebot' : 'Brief'} {doc.documentNumber}
                      </h3>
                      <p className="text-sm text-gray-600">{doc.customer.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(doc.date)}
                    </div>
                    
                    {doc.type !== 'letter' && (
                      <div className="font-medium text-gray-900">
                        {formatCurrency(doc.total)}
                      </div>
                    )}
                    
                    {doc.type !== 'letter' && doc.isSmallBusiness && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        §19 UStG
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(doc)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit size={18} />
                  </button>
                  
                  <PDFDownloadLink
                    document={<PDFDocument data={doc} />}
                    fileName={`${doc.type === 'invoice' ? 'Rechnung' : doc.type === 'quote' ? 'Angebot' : 'Brief'}-${doc.documentNumber}.pdf`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="PDF herunterladen"
                  >
                    <Download size={18} />
                  </PDFDownloadLink>
                  
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Löschen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};