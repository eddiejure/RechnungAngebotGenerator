import { DocumentData } from '../types/document';

const STORAGE_KEY = 'invoice-documents';

export const saveDocument = (document: DocumentData): void => {
  const existingDocs = getDocuments();
  const updatedDocs = existingDocs.filter(doc => doc.id !== document.id);
  updatedDocs.push(document);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
};

export const getDocuments = (): DocumentData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteDocument = (id: string): void => {
  const existingDocs = getDocuments();
  const filteredDocs = existingDocs.filter(doc => doc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocs));
};

export const getDocument = (id: string): DocumentData | null => {
  const docs = getDocuments();
  return docs.find(doc => doc.id === id) || null;
};