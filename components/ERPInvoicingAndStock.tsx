'use client';

import React, { useState } from 'react';
import { FileCheck, PackageCheck, AlertTriangle, ArrowUpRight, CheckCircle2, Clock, DollarSign, Plus, Trash2, ShieldCheck, Printer, RefreshCw } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { ERPInvoice } from '@/types/enterprise';

export function ERPInvoicingAndStock() {
  const {
    products,
    updateProductStock,
    quotations,
    invoices,
    createInvoiceFromQuote,
    updateInvoiceStatus,
    deleteInvoice,
    formatCurrency
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'invoices' | 'stock'>('invoices');

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.grand_total, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + inv.grand_total, 0);
  const totalPending = invoices.filter(inv => inv.status === 'pending').reduce((acc, inv) => acc + inv.grand_total, 0);
  const lowStockProducts = products.filter(p => (p.stock_quantity ?? 50) <= (p.min_stock_alert ?? 10));

  const getStatusBadge = (status: ERPInvoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAGADA
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" /> PENDIENTE
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-red-600" /> VENCIDA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ANULADA
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 text-slate-900">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" /> Módulo ERP: Facturación Electrónica & Control de Stock
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Gestión contable de cobros, emisión de facturas y control de niveles de existencias
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Facturación ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'stock'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Inventario ERP</span>
            {lowStockProducts.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                {lowStockProducts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Facturado</span>
          <span className="text-lg font-extrabold text-slate-900 block">{formatCurrency(totalInvoiced)}</span>
          <span className="text-[10px] text-slate-500 font-medium">{invoices.length} facturas generadas</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Recaudado (Pagado)</span>
          <span className="text-lg font-extrabold text-emerald-700 block">{formatCurrency(totalPaid)}</span>
          <span className="text-[10px] text-emerald-700 font-medium">Cobro confirmado en banco</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pendiente por Cobrar</span>
          <span className="text-lg font-extrabold text-amber-700 block">{formatCurrency(totalPending)}</span>
          <span className="text-[10px] text-amber-700 font-medium">Facturas activas en cartera</span>
        </div>
      </div>

      {/* TAB 1: FACTURACIÓN */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Libro de Facturas Emitidas ({invoices.length})
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">No. Factura</th>
                  <th className="p-3">Cliente / Empresa</th>
                  <th className="p-3">Proyecto / Oferta</th>
                  <th className="p-3">Fecha Emisión</th>
                  <th className="p-3">Monto Total</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-indigo-700">{inv.invoice_number}</td>
                    <td className="p-3">
                      <div className="font-bold">{inv.customer_name}</div>
                      <div className="text-[10px] text-slate-500">{inv.customer_company}</div>
                    </td>
                    <td className="p-3">{inv.deal_title}</td>
                    <td className="p-3">{inv.date_issued}</td>
                    <td className="p-3 font-extrabold text-slate-900">{formatCurrency(inv.grand_total)}</td>
                    <td className="p-3">{getStatusBadge(inv.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status === 'pending' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                            title="Marcar como pagada"
                          >
                            Marcar Pagada
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          className="text-slate-500 hover:text-slate-900 p-1"
                          title="Imprimir Factura"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteInvoice(inv.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTARIO & STOCK */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Control de Stock y Márgenes de Ganancia ({products.length} productos)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(prod => {
              const costPrice = prod.cost_price ?? Math.round(prod.unit_price * 0.4);
              const stockQty = prod.stock_quantity ?? 50;
              const minStock = prod.min_stock_alert ?? 10;
              const margin = prod.unit_price > 0 ? (((prod.unit_price - costPrice) / prod.unit_price) * 100).toFixed(1) : '0';
              const isLowStock = stockQty <= minStock;

              return (
                <div key={prod.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{prod.sku} • {prod.category}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{prod.name}</h4>
                    </div>

                    {isLowStock ? (
                      <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" /> STOCK BAJO
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        NORMAL
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">Precio Venta</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(prod.unit_price)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">Costo ERP</span>
                      <span className="font-extrabold text-slate-700">{formatCurrency(costPrice)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">Margen Bruto</span>
                      <span className="font-extrabold text-emerald-700">+{margin}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700">
                      Unidades Disponibles: <strong className="text-indigo-700 text-sm">{stockQty}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateProductStock(prod.id, stockQty - 1)}
                        className="w-7 h-7 bg-white border border-slate-300 rounded-lg flex items-center justify-center font-bold hover:bg-slate-100 text-slate-700"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateProductStock(prod.id, stockQty + 1)}
                        className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold hover:bg-indigo-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
