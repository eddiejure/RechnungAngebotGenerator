import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Phone, Mail, Calendar, Target, Plus, Users } from 'lucide-react';
import { Lead } from '../types/crm';
import { 
  getSupabaseLeads, 
  deleteSupabaseLead, 
  saveSupabaseCustomer, 
  getSupabaseCustomers 
} from '../utils/supabaseStorage';
import { Customer } from '../types/crm';
import { formatCurrency, formatDate } from '../utils/calculations';

interface LeadsListProps {
  onEdit: (lead: Lead) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({ onEdit, onCreateNew, onRefresh }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'value' | 'priority'>('created');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getSupabaseLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Leads werden geladen...</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Lead löschen möchten?')) {
      try {
        await deleteSupabaseLead(id);
        await loadLeads();
        onRefresh();
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Fehler beim Löschen des Leads. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const handleConvertToCustomer = async (lead: Lead) => {
    if (window.confirm(`Möchten Sie den Lead "${lead.name}" in einen Kunden konvertieren?`)) {
      try {
        // Check if customer with same email already exists
        const existingCustomers = await getSupabaseCustomers();
        const existingCustomer = existingCustomers.find(c => c.email === lead.email);
        
        if (existingCustomer) {
          alert('Ein Kunde mit dieser E-Mail-Adresse existiert bereits.');
          return;
        }
        
        // Create new customer from lead data
        const newCustomer: Customer = {
          id: `customer-${Date.now()}`,
          name: lead.name,
          company: lead.company,
          email: lead.email,
          phone: lead.phone,
          address: '',
          city: '',
          postalCode: '',
          country: 'Deutschland',
          website: '',
          industry: '',
          contactPerson: lead.name,
          notes: `Konvertiert von Lead am ${formatDate(new Date().toISOString())}.\n\nUrsprüngliche Lead-Notizen:\n${lead.notes}${lead.nextFollowUp ? `\n\nUrsprünglicher Follow-up Termin: ${formatDate(lead.nextFollowUp)}` : ''}`,
          createdAt: new Date().toISOString(),
          totalProjects: 0,
          totalRevenue: lead.estimatedValue || 0,
          lastProject: undefined,
          nextFollowUp: lead.nextFollowUp,
        };
        
        // Save customer and delete lead
        await saveSupabaseCustomer(newCustomer);
        await deleteSupabaseLead(lead.id);
        await loadLeads();
        onRefresh();
        alert(`Lead "${lead.name}" wurde erfolgreich zu einem Kunden konvertiert und aus der Lead-Liste entfernt!`);
      } catch (error) {
        console.error('Error converting lead to customer:', error);
        alert('Fehler beim Konvertieren des Leads. Bitte versuchen Sie es erneut.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Neu':
        return 'text-blue-600 bg-blue-100';
      case 'Kontaktiert':
        return 'text-purple-600 bg-purple-100';
      case 'Qualifiziert':
        return 'text-indigo-600 bg-indigo-100';
      case 'Angebot erstellt':
        return 'text-orange-600 bg-orange-100';
      case 'Verhandlung':
        return 'text-yellow-600 bg-yellow-100';
      case 'Gewonnen':
        return 'text-green-600 bg-green-100';
      case 'Verloren':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch':
        return 'text-red-600 bg-red-100';
      case 'Mittel':
        return 'text-yellow-600 bg-yellow-100';
      case 'Niedrig':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['Gewonnen', 'Verloren'].includes(lead.status);
    if (filter === 'hot') return lead.priority === 'Hoch';
    return lead.status === filter;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'value':
        return (b.estimatedValue || 0) - (a.estimatedValue || 0);
      case 'priority':
        const priorityOrder = { 'Hoch': 3, 'Mittel': 2, 'Niedrig': 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      default:
        return 0;
    }
  });

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <UserPlus size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Noch keine Leads vorhanden
        </h3>
        <p className="text-gray-600 mb-6">
          Erstellen Sie Ihren ersten Lead und beginnen Sie mit der Kundenakquise
        </p>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors mx-auto"
        >
          <Plus size={18} />
          Ersten Lead erstellen
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
              Leads ({sortedLeads.length})
            </h2>
            <p className="text-sm text-gray-600">
              Verwalten Sie Ihre potenziellen Kunden
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Leads</option>
              <option value="active">Aktive Leads</option>
              <option value="hot">Heiße Leads</option>
              <option value="Neu">Neue Leads</option>
              <option value="Qualifiziert">Qualifizierte Leads</option>
              <option value="Verhandlung">In Verhandlung</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created">Nach Erstellung</option>
              <option value="name">Nach Name</option>
              <option value="value">Nach Wert</option>
              <option value="priority">Nach Priorität</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{lead.name}</h3>
                {lead.company && (
                  <p className="text-sm text-gray-600 mb-2">{lead.company}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(lead)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Bearbeiten"
                >
                  <Edit size={16} />
                </button>
                
                <button
                  onClick={() => handleConvertToCustomer(lead)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Zu Kunde konvertieren"
                >
                  <Users size={16} />
                </button>
                
                <button
                  onClick={() => handleDelete(lead.id)}
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
                <span>{lead.email}</span>
              </div>
              
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{lead.phone}</span>
                </div>
              )}
              
              {lead.estimatedValue && (
                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                  <Target size={14} />
                  <span>{formatCurrency(lead.estimatedValue)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Quelle: {lead.source}</span>
                <span>{formatDate(lead.createdAt)}</span>
              </div>
              
              {lead.nextFollowUp && (
                <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                  <Calendar size={12} />
                  <span>Follow-up: {formatDate(lead.nextFollowUp)}</span>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700 line-clamp-2">{lead.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};