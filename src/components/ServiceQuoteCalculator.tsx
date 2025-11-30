import React, { useState, useMemo } from 'react';
import { ServiceQuote, ServiceLine } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateServiceQuotePDF } from '../services/pdfGenerator';
import { DocumentDuplicateIcon, PlusIcon, TrashIcon, ArrowDownOnSquareIcon, CheckCircleIcon } from './Icons';

// Util para cálculo de uma linha de serviço
function calculateServiceLine(line: ServiceLine) {
  const base = (line.hours * line.hourlyRate) + line.externalCosts;
  const marginValue = base * (line.marginPercent / 100);
  const taxable = base + marginValue;
  const taxValue = taxable * (line.taxPercent / 100);
  const total = base + marginValue + taxValue;
  return { base, marginValue, taxValue, total };
}

export const ServiceQuoteCalculator: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [lines, setLines] = useState<ServiceLine[]>([]);
  const [notes, setNotes] = useState('');
  const [serviceQuotes, setServiceQuotes] = useLocalStorage<ServiceQuote[]>('serviceQuotes', []);
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const totals = useMemo(() => {
    return lines.reduce((acc, line) => {
      const c = calculateServiceLine(line);
      acc.base += c.base;
      acc.margin += c.marginValue;
      acc.tax += c.taxValue;
      acc.total += c.total;
      return acc;
    }, { base: 0, margin: 0, tax: 0, total: 0 });
  }, [lines]);

  const addLine = () => {
    setLines(prev => [...prev, {
      id: 'SL-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
      title: '',
      description: '',
      category: '',
      hours: 1,
      hourlyRate: 100,
      externalCosts: 0,
      marginPercent: 0,
      taxPercent: 0
    }]);
  };

  const updateLine = (id: string, field: keyof ServiceLine, value: string) => {
    const stringFields: (keyof ServiceLine)[] = ['description','title','category'];
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: stringFields.includes(field) ? value : Number(value) } : l));
  };

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  const resetForm = () => {
    setClientName('');
    setLines([]);
    setNotes('');
    setCurrentQuoteId(null);
    setShowSuccess(false);
  };
  // Função de validação por linha
  const validateLine = (line: ServiceLine): Record<string,string> => {
    const errors: Record<string,string> = {};
    if (!line.title || line.title.trim().length === 0) {
      errors.title = 'Título obrigatório';
    }
    if (line.hours <= 0) {
      errors.hours = 'Horas deve ser > 0';
    }
    if (line.hourlyRate <= 0) {
      errors.hourlyRate = 'Valor hora deve ser > 0';
    }
    if (line.externalCosts < 0) {
      errors.externalCosts = 'Custos extra não pode ser negativo';
    }
    if (!line.description && !line.title) {
      errors.description = 'Informe título ou descrição';
    }
    return errors;
  };

  const saveQuote = () => {
    setShowValidation(true);
    setGlobalError(null);
    const lineErrors = lines.map(validateLine);
    const hasErrors = lineErrors.some(errs => Object.keys(errs).length > 0);
    if (lines.length === 0) {
      setGlobalError('Adicione ao menos uma linha de serviço.');
      return;
    }
    if (hasErrors) {
      setGlobalError('Corrija os erros antes de salvar.');
      return;
    }
    const baseQuote: Omit<ServiceQuote, 'id' | 'date'> = { clientName, lines, notes };
    if (currentQuoteId) {
      const updated: ServiceQuote = { ...baseQuote, id: currentQuoteId, date: new Date().toISOString() };
      setServiceQuotes(serviceQuotes.map(q => q.id === currentQuoteId ? updated : q));
    } else {
      const newQuote: ServiceQuote = { ...baseQuote, id: 'SQ-' + Date.now(), date: new Date().toISOString() };
      setServiceQuotes([...serviceQuotes, newQuote]);
      setCurrentQuoteId(newQuote.id);
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleGeneratePDF = () => {
    const quote: ServiceQuote = {
      id: currentQuoteId || 'SQ-' + Date.now(),
      date: new Date().toISOString(),
      clientName,
      lines,
      notes
    };
    try {
      const blob = generateServiceQuotePDF(quote);
      if (blob instanceof Blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else if (typeof blob === 'string') {
        window.open(blob, '_blank');
      }
    } catch (e) {
      console.error('Erro ao gerar PDF de serviços:', e);
    }
  };

  return (
    <div className="container mx-auto" data-testid="service-quote-calculator-root">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-white">{currentQuoteId ? `Editar Orçamento de Serviço: ${currentQuoteId}` : 'Novo Orçamento de Serviço'}</h2>
        <button onClick={resetForm} className="text-sm text-blue-500 dark:text-blue-300 hover:underline">Limpar</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-textPrimary dark:text-white flex items-center">
                <DocumentDuplicateIcon className="w-6 h-6 mr-2 text-primary" />
                Linhas de Serviço
                {lines.length > 0 && <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">{lines.length}</span>}
              </h3>
              <button onClick={addLine} className="modern-gradient-accent flex items-center px-5 py-3 rounded-lg hover:scale-105 transition-all font-medium tracking-wide">
                <PlusIcon className="w-5 h-5 mr-2" />Adicionar Linha
              </button>
            </div>
            <div className="space-y-6">
              {lines.map(line => {
                const c = calculateServiceLine(line);
                const errors = showValidation ? validateLine(line) : {};
                return (
                  <div key={line.id} className={`border ${Object.keys(errors).length ? 'border-red-400 dark:border-red-500' : 'border-border dark:border-slate-600'} rounded-lg p-4 bg-white dark:bg-slate-700 shadow-sm`}
                    aria-invalid={Object.keys(errors).length > 0}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 mr-4 space-y-2">
                        <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">Título do Serviço</label>
                        <input
                          type="text"
                          value={line.title}
                          onChange={e => updateLine(line.id, 'title', e.target.value)}
                          placeholder="Ex: Instalação de Rede"
                          className="w-full p-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm"
                        />
                        {errors.title && <p className="text-xs text-red-600 dark:text-red-400">{errors.title}</p>}
                      </div>
                      <button onClick={() => removeLine(line.id)} className="text-red-500 hover:text-red-400 mt-6" title="Remover"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">Categoria</label>
                        <input
                          type="text"
                          value={line.category || ''}
                          onChange={e => updateLine(line.id, 'category', e.target.value)}
                          placeholder="Ex: Consultoria"
                          className="w-full p-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">Descrição Detalhada</label>
                        <textarea
                          value={line.description}
                          onChange={e => updateLine(line.id, 'description', e.target.value)}
                          rows={3}
                          placeholder="Detalhes específicos do serviço"
                          className="w-full p-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm"
                        />
                        {errors.description && <p className="text-xs text-red-600 dark:text-red-400">{errors.description}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">Horas</label>
                        <input
                          type="number"
                          value={line.hours}
                          min={0}
                          onChange={e => updateLine(line.id, 'hours', e.target.value)}
                          className="w-full p-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm text-center"
                        />
                        {errors.hours && <p className="text-xs text-red-600 dark:text-red-400">{errors.hours}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">R$/Hora</label>
                        <input
                          type="number"
                          value={line.hourlyRate}
                          min={0}
                          onChange={e => updateLine(line.id, 'hourlyRate', e.target.value)}
                          className="w-full p-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm text-center"
                        />
                        {errors.hourlyRate && <p className="text-xs text-red-600 dark:text-red-400">{errors.hourlyRate}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">Custos Extra (R$)</label>
                        <input
                          type="number"
                          value={line.externalCosts}
                          min={0}
                          onChange={e => updateLine(line.id, 'externalCosts', e.target.value)}
                          className="w-full p-2 rounded-md bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-sm text-center"
                        />
                        {errors.externalCosts && <p className="text-xs text-red-600 dark:text-red-400">{errors.externalCosts}</p>}
                      </div>
                      <div className="space-y-1 md:col-span-2 flex flex-col justify-end">
                        <div className="text-xs font-semibold text-textSecondary dark:text-slate-300">Total Estimado</div>
                        <div className="p-2 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-600 text-sm font-semibold text-green-700 dark:text-green-400 text-center">R$ {c.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {lines.length === 0 && (
                <div className="text-center py-10 text-textSecondary dark:text-slate-400 border border-dashed border-border dark:border-slate-600 rounded-lg">Nenhuma linha adicionada. Clique em "Adicionar Linha".</div>
              )}
            </div>
            {globalError && <div className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">{globalError}</div>}
          </div>

          <div className="bg-surface dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-4">Dados Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary dark:text-slate-300">Cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full p-3 rounded-md bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary dark:text-slate-300">Notas / Observações</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Observações adicionais"
                  className="w-full p-3 rounded-md bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-surface to-white dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl shadow-xl sticky top-8">
            <h3 className="text-xl font-bold text-textPrimary dark:text-white mb-4 flex items-center">
              <DocumentDuplicateIcon className="w-6 h-6 mr-2 text-primary" />Resumo
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <span className="font-medium">Base</span>
                <span className="font-bold">R$ {totals.base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
                <span className="font-medium">Margem</span>
                <span className="font-bold">R$ {totals.margin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <span className="font-medium">Impostos</span>
                <span className="font-bold">R$ {totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border-2 border-green-300 dark:border-green-600">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-green-700 dark:text-green-400">R$ {totals.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={saveQuote} disabled={lines.length === 0} className="modern-gradient-accent w-full flex items-center justify-center px-5 py-3 rounded-md font-medium tracking-wide disabled:opacity-40">
                {showSuccess ? <CheckCircleIcon className="w-5 h-5 mr-2"/> : <DocumentDuplicateIcon className="w-5 h-5 mr-2" />}
                {showSuccess ? 'Salvo!' : (currentQuoteId ? 'Atualizar Orçamento' : 'Salvar Orçamento')}
              </button>
              <button onClick={handleGeneratePDF} disabled={lines.length === 0} className="modern-outline-btn w-full flex items-center justify-center px-5 py-3 rounded-md font-medium tracking-wide disabled:opacity-40">
                <ArrowDownOnSquareIcon className="w-5 h-5 mr-2" />Gerar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
