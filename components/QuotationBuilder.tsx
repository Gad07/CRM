'use client';

import React, { useState } from 'react';
import { X, Trash2, Printer, FileText, MessageSquare } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Deal } from '@/types/crm';
import { QuoteLineItem } from '@/types/enterprise';

interface QuotationBuilderProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
}

export function QuotationBuilder({ deal, isOpen, onClose }: QuotationBuilderProps) {
  const { data, products, saveQuotation, formatCurrency } = useCRM();

  const existingQuote = useCRM().quotations.find(q => q.deal_id === deal.id);

  const [quoteNumber, setQuoteNumber] = useState(
    existingQuote?.quote_number || `COT-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(
    existingQuote?.line_items || [
      {
        id: `item-1`,
        product_name: products[0]?.name || 'Servicio Personalizado',
        quantity: 1,
        unit_price: deal.value || products[0]?.unit_price || 1000,
        discount_percent: 0,
        tax_percent: 12,
        subtotal: deal.value || 1000,
        total: (deal.value || 1000) * 1.12
      }
    ]
  );

  const [notes, setNotes] = useState(
    existingQuote?.notes || 'Cotización válida por 30 días. Condiciones de pago: 50% anticipo, 50% contra entrega.'
  );

  if (!isOpen) return null;

  const handleAddItem = (productId?: string) => {
    const prod = products.find(p => p.id === productId);
    const newItem: QuoteLineItem = {
      id: `item-${Date.now()}`,
      product_id: prod?.id,
      product_name: prod ? prod.name : 'Nuevo Producto / Servicio',
      quantity: 1,
      unit_price: prod ? prod.unit_price : 500,
      discount_percent: 0,
      tax_percent: prod ? prod.tax_rate : 12,
      subtotal: prod ? prod.unit_price : 500,
      total: prod ? prod.unit_price * (1 + prod.tax_rate / 100) : 560
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleItemChange = (id: string, field: keyof QuoteLineItem, val: any) => {
    setLineItems(
      lineItems.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        const baseSub = updated.quantity * updated.unit_price;
        const discountAmt = baseSub * (updated.discount_percent / 100);
        const netSub = baseSub - discountAmt;
        const taxAmt = netSub * (updated.tax_percent / 100);
        updated.subtotal = netSub;
        updated.total = netSub + taxAmt;
        return updated;
      })
    );
  };

  const removeItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter(i => i.id !== id));
  };

  const subtotalSum = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const taxSum = lineItems.reduce((s, i) => s + (i.total - i.subtotal), 0);
  const grandTotal = subtotalSum + taxSum;

  const handleSave = () => {
    saveQuotation({
      quote_number: quoteNumber,
      deal_id: deal.id,
      deal_title: deal.title,
      customer_name: deal.contact_name || 'Cliente Principal',
      customer_company: deal.company_name,
      date_issued: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      line_items: lineItems,
      subtotal: subtotalSum,
      tax_total: taxSum,
      discount_total: 0,
      grand_total: grandTotal,
      notes,
      status: 'sent'
    });
    alert('¡Cotización guardada exitosamente y valor del negocio actualizado!');
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const itemsList = lineItems
      .map(i => `• *${i.product_name}* (x${i.quantity}): ${formatCurrency(i.total)}`)
      .join('\n');

    const message = `📋 *COTIZACIÓN OFICIAL: ${quoteNumber}*\n\n*Cliente:* ${deal.contact_name || 'Cliente'}\n*Empresa:* ${deal.company_name || 'N/A'}\n\n*Detalle de Ítems:*\n${itemsList}\n\n*TOTAL:* ${formatCurrency(grandTotal)}\n\n_Notas:_ ${notes}\n\nGracias por su confianza.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in text-slate-900 print:bg-white print:text-black print:p-0">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Generador de Cotización Comercial (Quotes)</h2>
              <p className="text-xs text-slate-500 font-medium">Negocio: <span className="text-indigo-700 font-bold">{deal.title}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Enviar WhatsApp</span>
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg font-bold cursor-pointer">
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Imprimir / PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quotation Document Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1 text-slate-900 print:text-black print:overflow-visible">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-6 print:border-gray-300">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 print:text-black">{data.settings.company_name}</h1>
              <p className="text-xs text-slate-500 font-bold print:text-gray-600">Sistema CRM Empresarial • Cotización Oficial</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-bold block">Número de Cotización</span>
              <input
                type="text"
                value={quoteNumber}
                onChange={e => setQuoteNumber(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-bold text-indigo-700 text-right focus:ring-2 focus:ring-indigo-600 print:border-0 print:bg-transparent print:text-black"
              />
            </div>
          </div>

          {/* Client & Date Information */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-gray-100 print:border-gray-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Cotizado Para (Cliente)</span>
              <p className="font-bold text-slate-900 text-sm print:text-black">{deal.contact_name || 'Cliente Asignado'}</p>
              <p className="text-xs text-slate-600 font-medium print:text-gray-600">{deal.company_name || 'Empresa Particular'}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Fecha de Emisión</span>
              <p className="font-bold text-slate-900 text-xs print:text-black">{new Date().toLocaleDateString('es-ES')}</p>
              <p className="text-xs text-indigo-700 font-bold print:text-gray-600">Validez: 30 Días</p>
            </div>
          </div>

          {/* Add Product Selector */}
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Desglose de Ítems / Productos</h3>
            <div className="flex items-center gap-2">
              <select
                onChange={e => e.target.value && handleAddItem(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-bold cursor-pointer"
              >
                <option value="">+ Agregar del Catálogo de Productos...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.unit_price})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                + Ítem Libre
              </button>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 uppercase font-bold print:border-gray-300 print:text-gray-700">
                  <th className="py-2.5 px-2">Descripción Producto/Servicio</th>
                  <th className="py-2.5 px-2 w-20 text-center">Cant.</th>
                  <th className="py-2.5 px-2 w-28 text-right">P. Unitario</th>
                  <th className="py-2.5 px-2 w-20 text-center">Desc. %</th>
                  <th className="py-2.5 px-2 w-20 text-center">IVA %</th>
                  <th className="py-2.5 px-2 w-28 text-right">Total</th>
                  <th className="py-2.5 px-2 w-10 text-center print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium print:divide-gray-200">
                {lineItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={e => handleItemChange(item.id, 'product_name', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 print:border-0 print:bg-transparent print:text-black"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-900 font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-600 print:border-0 print:bg-transparent print:text-black"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        value={item.unit_price}
                        onChange={e => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs text-slate-900 font-bold text-right focus:outline-none focus:ring-2 focus:ring-indigo-600 print:border-0 print:bg-transparent print:text-black"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount_percent}
                        onChange={e => handleItemChange(item.id, 'discount_percent', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-50 border border-slate-300 rounded px-1 py-1 text-xs text-slate-900 font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-600 print:border-0 print:bg-transparent print:text-black"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.tax_percent}
                        onChange={e => handleItemChange(item.id, 'tax_percent', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-50 border border-slate-300 rounded px-1 py-1 text-xs text-slate-900 font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-600 print:border-0 print:bg-transparent print:text-black"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-black text-emerald-700 print:text-black">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="py-2 px-2 text-center print:hidden">
                      <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-slate-200 print:border-gray-300">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-bold print:text-gray-700">
                <span>Subtotal Neto:</span>
                <span className="font-extrabold text-slate-900 print:text-black">{formatCurrency(subtotalSum)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-bold print:text-gray-700">
                <span>Impuesto IVA (12%):</span>
                <span className="font-extrabold text-slate-900 print:text-black">{formatCurrency(taxSum)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-700 pt-2 border-t border-slate-200 print:border-gray-300 print:text-black">
                <span>GRAN TOTAL:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="space-y-1 pt-4 border-t border-slate-200 print:border-gray-300">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">Términos y Observaciones</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 print:border-0 print:bg-transparent print:text-black"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 print:hidden">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2 rounded-xl shadow-xs"
          >
            Guardar Cotización & Actualizar Negocio
          </button>
        </div>
      </div>
    </div>
  );
}
