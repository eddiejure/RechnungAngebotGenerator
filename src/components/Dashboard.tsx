import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  Euro,
  Calendar,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { Lead, Customer, Project } from '../types/crm';
import { getSupabaseLeads, getSupabaseCustomers, getSupabaseProjects } from '../utils/supabaseStorage';
import { formatCurrency, formatDate } from '../utils/calculations';

export const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsData, customersData, projectsData] = await Promise.all([
        getSupabaseLeads(),
        getSupabaseCustomers(),
        getSupabaseProjects(),
      ]);
      setLeads(leadsData);
      setCustomers(customersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  // Statistics
  const activeProjects = projects.filter(p => p.status === 'In Bearbeitung').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0);
  const hotLeads = leads.filter(l => l.priority === 'Hoch' && l.status !== 'Gewonnen' && l.status !== 'Verloren').length;
  const upcomingDeadlines = projects.filter(p => {
    if (!p.deadline || p.status === 'Abgeschlossen') return false;
    const deadline = new Date(p.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const recentLeads = leads
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Bearbeitung':
      case 'Qualifiziert':
        return 'text-blue-600 bg-blue-100';
      case 'Abgeschlossen':
      case 'Gewonnen':
        return 'text-green-600 bg-green-100';
      case 'Pausiert':
      case 'Verhandlung':
        return 'text-yellow-600 bg-yellow-100';
      case 'Storniert':
      case 'Verloren':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch':
      case 'Dringend':
        return 'text-red-600 bg-red-100';
      case 'Mittel':
        return 'text-yellow-600 bg-yellow-100';
      case 'Niedrig':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Überblick über Ihre Kunden, Projekte und Leads
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Projekte</p>
              <p className="text-3xl font-bold text-gray-900">{activeProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamtumsatz</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Heiße Leads</p>
              <p className="text-3xl font-bold text-gray-900">{hotLeads}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Target className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deadlines (7 Tage)</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingDeadlines}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Aktuelle Projekte</h2>
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p>Noch keine Projekte vorhanden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project.customerName}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(project.budget)}</p>
                    <p className="text-xs text-gray-500">{project.progress}% fertig</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Neueste Leads</h2>
            <UserPlus className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
              <p>Noch keine Leads vorhanden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{lead.name}</h3>
                    {lead.company && (
                      <p className="text-sm text-gray-600 mb-2">{lead.company}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {lead.estimatedValue && (
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(lead.estimatedValue)}</p>
                    )}
                    <p className="text-xs text-gray-500">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Schnellübersicht</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            <p className="text-sm text-gray-600">Kunden</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            <p className="text-sm text-gray-600">Projekte</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            <p className="text-sm text-gray-600">Leads</p>
          </div>
        </div>
      </div>
    </div>
  );
};