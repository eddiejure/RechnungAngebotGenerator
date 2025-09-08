import React, { useState, useEffect } from 'react';
import { Briefcase, Edit, Trash2, Plus, Calendar, Euro, Clock, Globe, User, Filter, Search } from 'lucide-react';
import { Project, Customer } from '../types/crm';
import { getProjects, deleteProject, getCustomers } from '../utils/crmStorage';
import { formatCurrency, formatDate } from '../utils/calculations';

interface ProjectsListProps {
  onEdit: (project: Project) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
  onViewDetails: (project: Project) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ 
  onEdit, 
  onCreateNew, 
  onRefresh, 
  onViewDetails 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'deadline' | 'budget' | 'progress'>('created');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
    loadCustomers();
  }, []);

  const loadProjects = () => {
    setProjects(getProjects());
  };

  const loadCustomers = () => {
    setCustomers(getCustomers());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Projekt löschen möchten?')) {
      deleteProject(id);
      loadProjects();
      onRefresh();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Dringend':
        return 'text-red-600 bg-red-100';
      case 'Hoch':
        return 'text-orange-600 bg-orange-100';
      case 'Mittel':
        return 'text-yellow-600 bg-yellow-100';
      case 'Niedrig':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentTypeColor = (paymentType: string) => {
    switch (paymentType) {
      case 'Einmalzahlung':
        return 'text-blue-600 bg-blue-100';
      case 'Monatliches Abo':
        return 'text-green-600 bg-green-100';
      case 'Jährliches Abo':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'active') return ['Geplant', 'In Bearbeitung', 'Review'].includes(project.status);
    if (filter === 'subscription') return project.paymentType.includes('Abo');
    if (filter === 'onetime') return project.paymentType === 'Einmalzahlung';
    return project.status === filter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'deadline':
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'budget':
        return b.budget - a.budget;
      case 'progress':
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Briefcase size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Noch keine Projekte vorhanden
        </h3>
        <p className="text-gray-600 mb-6">
          Erstellen Sie Ihr erstes Webdesign-Projekt und beginnen Sie mit der Verwaltung
        </p>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors mx-auto"
        >
          <Plus size={18} />
          Erstes Projekt erstellen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Projekte ({sortedProjects.length})
            </h2>
            <p className="text-sm text-gray-600">
              Verwalten Sie Ihre Webdesign-Projekte
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Projekte durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Projekte</option>
              <option value="active">Aktive Projekte</option>
              <option value="subscription">Abo-Projekte</option>
              <option value="onetime">Einmalzahlung</option>
              <option value="Geplant">Geplant</option>
              <option value="In Bearbeitung">In Bearbeitung</option>
              <option value="Review">Review</option>
              <option value="Abgeschlossen">Abgeschlossen</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created">Nach Erstellung</option>
              <option value="name">Nach Name</option>
              <option value="deadline">Nach Deadline</option>
              <option value="budget">Nach Budget</option>
              <option value="progress">Nach Fortschritt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewDetails(project)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User size={14} />
                  <span>{project.customerName}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentTypeColor(project.paymentType)}`}>
                    {project.paymentType === 'Einmalzahlung' ? 'Einmal' : 'Abo'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(project)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Bearbeiten"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Project Type and Technologies */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Globe size={14} />
                <span>{project.type}</span>
              </div>
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map((tech, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="text-xs text-gray-500">+{project.technologies.length - 3} mehr</span>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Fortschritt</span>
                <span className="font-medium text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Budget and Payment Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Budget</span>
                <span className="font-medium text-gray-900">{formatCurrency(project.budget)}</span>
              </div>
              {project.paymentType !== 'Einmalzahlung' && project.monthlyPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {project.paymentType === 'Monatliches Abo' ? 'Monatlich' : 'Jährlich'}
                  </span>
                  <span className="font-medium text-green-600">{formatCurrency(project.monthlyPrice)}</span>
                </div>
              )}
            </div>

            {/* Dates and Documents */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Start: {formatDate(project.startDate)}</span>
                </div>
                {project.deadline && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Clock size={12} />
                    <span>Deadline: {formatDate(project.deadline)}</span>
                  </div>
                )}
              </div>
              
              {project.documents && project.documents.length > 0 && (
                <div className="text-xs text-blue-600">
                  {project.documents.length} Dokument{project.documents.length !== 1 ? 'e' : ''}
                </div>
              )}
            </div>

            {project.description && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700 line-clamp-2">{project.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};