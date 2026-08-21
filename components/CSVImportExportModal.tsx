'use client';

import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, X, CheckCircle2, FileText } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

interface CSVImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CSVImportExportModal({ isOpen, onClose }: CSVImportExportModalProps) {
  const { data, importContacts } = useCRM();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('import');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setFileContent(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      alert('El archivo CSV no contiene suficientes líneas (requiere encabezado y al menos 1 fila).');
      return;
    }

    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"(.*)"$/, '$1'));

    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h.toLowerCase()] = values[idx] || '';
      });
      rows.push(rowObj);
    }
    setParsedRows(rows);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    const newContacts = parsedRows.map(row => ({
      name: row['nombre'] || row['name'] || row['contacto'] || 'Contacto Importado',
      email: row['email'] || row['correo'] || `contacto-${Date.now()}@empresa.com`,
      phone: row['telefono'] || row['phone'] || row['celular'] || '',
      company_name: row['empresa'] || row['company'] || '',
      role: row['cargo'] || row['position'] || row['puesto'] || 'Cliente',
      notes: row['notas'] || row['notes'] || '',
      custom_fields: {}
    }));

    importContacts(newContacts);
    setImportSuccessMessage(`¡Se importaron ${newContacts.length} contactos correctamente!`);
    setTimeout(() => {
      setImportSuccessMessage(null);
      onClose();
    }, 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Telefono', 'Empresa', 'Cargo', 'Notas'];
    const csvLines = [headers.join(',')];

    data.contacts.forEach(c => {
      const row = [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${(c.company_name || '').replace(/"/g, '""')}"`,
        `"${(c.role || '').replace(/"/g, '""')}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`
      ];
      csvLines.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvLines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Contactos_CRM_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-in text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Centro de Importación & Exportación CSV</h2>
              <p className="text-xs text-slate-500 font-medium">Gestión masiva de contactos y prospectos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4 text-xs font-bold gap-6">
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'import' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar Contactos (CSV)</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'export' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar Lista Actual (CSV)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {importSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{importSuccessMessage}</span>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center space-y-3 bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                <div>
                  <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all inline-block shadow-xs">
                    Seleccionar Archivo CSV
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <p className="text-[11px] text-slate-500 font-medium mt-2">Columnas recomendadas: Nombre, Email, Telefono, Empresa, Cargo</p>
                </div>
              </div>

              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Vista Previa ({parsedRows.length} registros listos)
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px] text-slate-700">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-2">Nombre</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Empresa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {parsedRows.slice(0, 5).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900">{r['nombre'] || r['name'] || 'Sin nombre'}</td>
                            <td className="p-2">{r['email'] || r['correo'] || '-'}</td>
                            <td className="p-2">{r['empresa'] || r['company'] || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 py-4 text-center">
              <FileText className="w-12 h-12 text-indigo-600 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Exportar Base de Datos de Contactos</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Se generará un archivo CSV compatible con Excel conteniendo tus {data.contacts.length} contactos guardados.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all"
              >
                Descargar Archivo CSV
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">
            Cancelar
          </button>
          {activeTab === 'import' && parsedRows.length > 0 && (
            <button
              onClick={handleExecuteImport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all"
            >
              Confirmar e Importar {parsedRows.length} Contactos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
