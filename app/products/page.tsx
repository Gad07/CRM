'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useCRM } from '@/context/CRMContext';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const { products, addProduct, deleteProduct, formatCurrency } = useCRM();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(1000);
  const [category, setCategory] = useState('Software');
  const [taxRate, setTaxRate] = useState<number>(12);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProduct({
      name: name.trim(),
      sku: sku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
      unit_price: Number(unitPrice),
      category: category.trim(),
      tax_rate: Number(taxRate)
    });

    setName('');
    setSku('');
    setUnitPrice(1000);
    setIsFormOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <div className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" /> Catálogo de Productos y Servicios
            </h1>
            <p className="text-xs text-slate-500 font-medium">Gestiona los productos e ítems para cotizar en tus negocios.</p>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? 'Cancelar' : 'Nuevo Producto / Servicio'}</span>
          </button>
        </div>

        {/* Collapsible Form */}
        {isFormOpen && (
          <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-fade-in text-slate-900">
            <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Crear Producto / Servicio</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Licencia Anual Enterprise..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Código SKU</label>
                <input
                  type="text"
                  placeholder="ej: PROD-001"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Precio Unitario ($)</label>
                <input
                  type="number"
                  step="any"
                  value={unitPrice}
                  onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Categoría</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tasa de IVA / Impuesto (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl"
              >
                + Guardar Producto
              </button>
            </div>
          </form>
        )}

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-indigo-700 font-bold">SKU: {p.sku}</p>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="text-slate-400 hover:text-red-600 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                <span className="text-lg font-black text-emerald-700">{formatCurrency(p.unit_price)}</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {p.category} • IVA {p.tax_rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
