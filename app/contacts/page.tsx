'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useCRM } from '@/context/CRMContext';
import { Contact, Company } from '@/types/crm';
import {
  Users,
  Building2,
  Plus,
  Mail,
  Phone,
  Trash2,
  Edit3,
  Globe,
  FileSpreadsheet,
  Search,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { CSVImportExportModal } from '@/components/CSVImportExportModal';

export default function ContactsPage() {
  const { data, addContact, updateContact, deleteContact, addCompany, updateCompany, deleteCompany } = useCRM();

  const [activeTab, setActiveTab] = useState<'contacts' | 'companies'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  // Contact Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactCompanyId, setContactCompanyId] = useState('');

  // Company Modal state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  const handleOpenContactModal = (c?: Contact) => {
    if (c) {
      setEditingContact(c);
      setContactName(c.name);
      setContactEmail(c.email || '');
      setContactPhone(c.phone || '');
      setContactRole(c.role || '');
      setContactCompanyId(c.company_id || '');
    } else {
      setEditingContact(null);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactRole('');
      setContactCompanyId('');
    }
    setIsContactModalOpen(true);
  };

  const handleOpenCompanyModal = (comp?: Company) => {
    if (comp) {
      setEditingCompany(comp);
      setCompanyName(comp.name);
      setCompanyIndustry(comp.industry || '');
      setCompanyWebsite(comp.website || '');
    } else {
      setEditingCompany(null);
      setCompanyName('');
      setCompanyIndustry('');
      setCompanyWebsite('');
    }
    setIsCompanyModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;

    const company = data.companies.find(comp => comp.id === contactCompanyId);

    if (editingContact) {
      updateContact({
        ...editingContact,
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        role: contactRole.trim(),
        company_id: contactCompanyId || undefined,
        company_name: company?.name
      });
    } else {
      addContact({
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
        role: contactRole.trim(),
        company_id: contactCompanyId || undefined,
        company_name: company?.name,
        custom_fields: {}
      });
    }

    setIsContactModalOpen(false);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    if (editingCompany) {
      updateCompany({
        ...editingCompany,
        name: companyName.trim(),
        industry: companyIndustry.trim(),
        website: companyWebsite.trim()
      });
    } else {
      addCompany({
        name: companyName.trim(),
        industry: companyIndustry.trim(),
        website: companyWebsite.trim(),
        custom_fields: {}
      });
    }

    setCompanyName('');
    setCompanyIndustry('');
    setCompanyWebsite('');
    setIsCompanyModalOpen(false);
  };

  const filteredContacts = data.contacts.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.role && c.role.toLowerCase().includes(q)) ||
      (c.company_name && c.company_name.toLowerCase().includes(q))
    );
  });

  const filteredCompanies = data.companies.filter(comp => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      comp.name.toLowerCase().includes(q) ||
      (comp.industry && comp.industry.toLowerCase().includes(q)) ||
      (comp.website && comp.website.toLowerCase().includes(q))
    );
  });

  const contactsWithPhone = data.contacts.filter(c => c.phone).length;
  const contactsWithCompany = data.contacts.filter(c => c.company_name).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        {/* Stat Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Contactos</span>
              <p className="text-2xl font-black text-slate-900">{data.contacts.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Empresas Registradas</span>
              <p className="text-2xl font-black text-purple-700">{data.companies.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Con Teléfono / WhatsApp</span>
              <p className="text-2xl font-black text-emerald-700">{contactsWithPhone}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Phone className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asociados a Empresa</span>
              <p className="text-2xl font-black text-blue-700">{contactsWithCompany}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Header Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'contacts'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Contactos ({filteredContacts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'companies'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Empresas ({filteredCompanies.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'contacts' ? 'Buscar contactos...' : 'Buscar empresas...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-600 w-52 sm:w-64"
              />
            </div>

            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Importar / Exportar CSV</span>
            </button>

            <button
              onClick={() => (activeTab === 'contacts' ? handleOpenContactModal() : handleOpenCompanyModal())}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'contacts' ? 'Nuevo Contacto' : 'Nueva Empresa'}</span>
            </button>
          </div>
        </div>

        {/* Contacts Directory Grid */}
        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No se encontraron contactos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              filteredContacts.map(c => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3 relative group text-slate-900 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                        <p className="text-xs text-indigo-700 font-bold">{c.role || 'Sin cargo'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenContactModal(c)}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar contacto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar contacto ${c.name}?`)) {
                              deleteContact(c.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar contacto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100 font-medium">
                      {c.email && (
                        <div className="flex items-center gap-2 text-slate-800">
                          <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <a href={`mailto:${c.email}`} className="hover:underline truncate">
                            {c.email}
                          </a>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center justify-between text-slate-800">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                      {c.company_name && (
                        <div className="flex items-center gap-2 text-slate-600 font-bold">
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="truncate">{c.company_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>ID: {c.id.substring(0, 8)}</span>
                    <button
                      onClick={() => handleOpenContactModal(c)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      Ver Ficha →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Companies Directory Grid */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No se encontraron empresas que coincidan con la búsqueda.</p>
              </div>
            ) : (
              filteredCompanies.map(comp => (
                <div
                  key={comp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all space-y-3 relative group text-slate-900 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{comp.name}</h3>
                        <p className="text-xs text-purple-700 font-bold">{comp.industry || 'General / Servicios'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenCompanyModal(comp)}
                          className="text-slate-400 hover:text-purple-600 p-1.5 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar empresa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar empresa ${comp.name}?`)) {
                              deleteCompany(comp.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar empresa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100 font-medium">
                      {comp.website && (
                        <div className="flex items-center gap-2 text-slate-800">
                          <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <a
                            href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline text-indigo-700 font-bold truncate flex items-center gap-1"
                          >
                            <span>{comp.website}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {comp.address && <p className="text-slate-600 text-xs">{comp.address}</p>}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {data.contacts.filter(c => c.company_id === comp.id || c.company_name === comp.name).length} Contactos
                    </span>
                    <button
                      onClick={() => handleOpenCompanyModal(comp)}
                      className="text-purple-600 hover:text-purple-800 font-bold"
                    >
                      Editar Ficha →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-900 animate-fade-in">
            <h2 className="text-base font-bold text-slate-900">
              {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
            </h2>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Lic. Carlos Mendoza"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ej: carlos@empresa.com"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  placeholder="ej: +502 5544 3322"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cargo / Puesto</label>
                <input
                  type="text"
                  placeholder="ej: Director de Compras"
                  value={contactRole}
                  onChange={e => setContactRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Empresa</label>
                <select
                  value={contactCompanyId}
                  onChange={e => setContactCompanyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="">-- Sin Empresa --</option>
                  {data.companies.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-900 animate-fade-in">
            <h2 className="text-base font-bold text-slate-900">
              {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>

            <form onSubmit={handleSaveCompany} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Corporación Alfa S.A."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Industria / Sector</label>
                <input
                  type="text"
                  placeholder="ej: Bienes Raíces, SaaS, Tecnología..."
                  value={companyIndustry}
                  onChange={e => setCompanyIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sitio Web</label>
                <input
                  type="text"
                  placeholder="https://empresa.com"
                  value={companyWebsite}
                  onChange={e => setCompanyWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import/Export Modal */}
      <CSVImportExportModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
      />
    </div>
  );
}
