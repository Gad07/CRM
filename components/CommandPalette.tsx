'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Briefcase, User, Package, ArrowRight, Command } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useRouter } from 'next/navigation';
import { Deal } from '@/types/crm';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeal?: (deal: Deal) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectDeal }: CommandPaletteProps) {
  const { data, products, formatCurrency } = useCRM();
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingDeals = q
    ? data.deals.filter(
        d =>
          d.title.toLowerCase().includes(q) ||
          d.contact_name?.toLowerCase().includes(q) ||
          d.company_name?.toLowerCase().includes(q) ||
          d.tags?.some(t => t.toLowerCase().includes(q))
      )
    : data.deals.slice(0, 4);

  const matchingContacts = q
    ? data.contacts.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company_name?.toLowerCase().includes(q)
      )
    : data.contacts.slice(0, 3);

  const matchingProducts = q
    ? products.filter(
        p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      )
    : products.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por negocio, cliente o producto (Ctrl+K)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-bold"
          />
          <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-1 rounded border border-slate-300 font-bold shrink-0">
            ESC
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto text-slate-900">
          {/* Section: Negocios / Deals */}
          {matchingDeals.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 px-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Negocios ({matchingDeals.length})</span>
              </span>
              <div className="space-y-1">
                {matchingDeals.map(deal => (
                  <button
                    key={deal.id}
                    onClick={() => {
                      if (onSelectDeal) onSelectDeal(deal);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {deal.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {deal.contact_name || 'Cliente'} {deal.company_name ? `• ${deal.company_name}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-700 block">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Contactos */}
          {matchingContacts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 px-2">
                <User className="w-3.5 h-3.5" />
                <span>Contactos ({matchingContacts.length})</span>
              </span>
              <div className="space-y-1">
                {matchingContacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      router.push('/contacts');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{c.email} • {c.company_name || 'Particular'}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Productos */}
          {matchingProducts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 px-2">
                <Package className="w-3.5 h-3.5" />
                <span>Productos ({matchingProducts.length})</span>
              </span>
              <div className="space-y-1">
                {matchingProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      router.push('/products');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">SKU: {p.sku || 'N/A'} • {p.category || 'General'}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">{formatCurrency(p.unit_price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-semibold flex justify-between items-center px-4">
          <span>Búsqueda rápida CRM</span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3 text-indigo-600" /> + K para buscar
          </span>
        </div>
      </div>
    </div>
  );
}
