'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useCRM } from '@/context/CRMContext';
import { Contact } from '@/types/crm';
import { Users, Building2, Plus, Mail, Phone, Trash2, Edit3, Globe, FileSpreadsheet } from 'lucide-react';
import { CSVImportExportModal } from '@/components/CSVImportExportModal';

export default function ContactsPage() {
  const { data, addContact, updateContact, deleteContact, addCompany, deleteCompany } = useCRM();

  const [activeTab, setActiveTab] = useState<'contacts' | 'companies'>('contacts');
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

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;

    const company = data.companies.find(comp => comp.id === contactCompanyId);

    if (editingContact) {
      updateContact({
        ...editingContact,
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        role: contactRole,
        company_id: contactCompanyId || undefined,
        company_name: company?.name
      });
    } else {
      addContact({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        role: contactRole,
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

    addCompany({
      name: companyName,
      industry: companyIndustry,
      website: companyWebsite,
      custom_fields: {}
    });

    setCompanyName('');
    setCompanyIndustry('');
    setCompanyWebsite('');
    setIsCompanyModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        {/* Header Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'contacts'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Directorio de Contactos ({data.contacts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'companies'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Directorio de Empresas ({data.companies.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCSVModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar / Exportar CSV</span>
            </button>

            <button
              onClick={() => (activeTab === 'contacts' ? handleOpenContactModal() : setIsCompanyModalOpen(true))}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'contacts' ? 'Nuevo Contacto' : 'Nueva Empresa'}</span>
            </button>
          </div>
        </div>

        {/* Contacts Directory */}
        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.contacts.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group text-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <p className="text-xs text-indigo-700 font-bold">{c.role || 'Sin cargo'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenContactModal(c)} className="text-slate-400 hover:text-indigo-600 p-1">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteContact(c.id)} className="text-slate-400 hover:text-red-600 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100 font-medium">
                  {c.email && (
                    <div className="flex items-center gap-2 text-slate-800">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.company_name && (
                    <div className="flex items-center gap-2 text-slate-600 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      <span>{c.company_name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Companies Directory */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.companies.map(comp => (
              <div key={comp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group text-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{comp.name}</h3>
                    <p className="text-xs text-purple-700 font-bold">{comp.industry || 'General'}</p>
                  </div>
                  <button onClick={() => deleteCompany(comp.id)} className="text-slate-400 hover:text-red-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100 font-medium">
                  {comp.website && (
                    <div className="flex items-center gap-2 text-slate-800">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <a href={comp.website} target="_blank" rel="noreferrer" className="hover:underline text-indigo-700 font-bold">
                        {comp.website}
                      </a>
                    </div>
                  )}
                  {comp.address && <p className="text-slate-600">{comp.address}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-900">
            <h2 className="text-base font-bold text-slate-900">
              {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
            </h2>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cargo / Puesto</label>
                <input
                  type="text"
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-slate-900">
            <h2 className="text-base font-bold text-slate-900">Nueva Empresa</h2>

            <form onSubmit={handleSaveCompany} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Empresa *</label>
                <input
                  type="text"
                  required
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
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
