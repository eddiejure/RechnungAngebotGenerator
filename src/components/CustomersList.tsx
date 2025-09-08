import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Phone, Mail, MapPin, Plus, Building, Euro } from 'lucide-react';
import { Customer } from '../types/crm';
import { getCustomers, deleteCustomer } from '../utils/crmStorage';
import { formatCurrency, formatDate } from '../utils/calculations';

interface CustomersListProps {
  onEdit: (customer: Customer) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const CustomersList: React.FC<CustomersListProps> = ({ onEdit, onCreateNew, onRefresh }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'revenue' | 'projects'>('created');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(getCustomers());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten?')) {
      deleteCustomer(id);
      loadCustomers();
      onRefresh();
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (filter === 'all') return true;
    if (filter === 'active') return customer.totalProjects > 0;
    if (filter === 'high-value') return customer.totalRevenue > 10000;
    return true;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'projects':
        return b.totalProjects - a.totalProjects;
      default:
        return 0;
    }
  });

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Users size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Noch keine Kunden vorhanden
        </h3>
        <p className="text-gray-600 mb-6">
          Erstellen Sie Ihren ersten Kunden oder konvertieren Sie einen Lead
        </p>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors mx-auto"
        >
          <Plus size={18} />
          Ersten Kunden erstellen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Kunden ({sortedCustomers.length})
            </h2>
            <p className="text-sm text-gray-600">
              Verwalten Sie Ihre Kundendatenbank
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Kunden</option>
              <option value="active">Aktive Kunden</option>
              <option value="high-value">Hochwertige Kunden</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created">Nach Erstellung</option>
              <option value="name">Nach Name</option>
              <option value="revenue">Nach Umsatz</option>
              <option value="projects">Nach Projekten</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{customer.name}</h3>
                {customer.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building size={14} />
                    <span>{customer.company}</span>
                  </div>
                )}
                {customer.industry && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
                    {customer.industry}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(customer)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Bearbeiten"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} />
                <span className="truncate">{customer.email}</span>
              </div>
              
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{customer.phone}</span>
                </div>
              )}
              
              {customer.city && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{customer.city}, {customer.country}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{customer.totalProjects}</p>
                <p className="text-xs text-gray-600">Projekte</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">{formatCurrency(customer.totalRevenue)}</p>
                <p className="text-xs text-gray-600">Umsatz</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Kunde seit: {formatDate(customer.createdAt)}</span>
                {customer.lastProject && (
                  <span>Letztes Projekt: {formatDate(customer.lastProject)}</span>
                )}
              </div>
            </div>

            {customer.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700 line-clamp-2">{customer.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};