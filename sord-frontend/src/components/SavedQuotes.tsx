import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Quote } from '../types';
import { PencilIcon, TrashIcon, EyeIcon } from './Icons';
import { generateQuotePDF } from '../services/pdfGenerator';
import PdfActionModal from './PdfActionModal';

interface SavedQuotesProps {
  onEditQuote: (quote: Quote) => void;
}

export const SavedQuotes: React.FC<SavedQuotesProps> = ({ onEditQuote }) => {
  const { quotes, setQuotes, materials, settings } = useData();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [currentPdfFilename, setCurrentPdfFilename] = useState('orcamento.pdf');

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este orçamento?")) {
      setQuotes(quotes.filter(q => q.id !== id));
    }
  };
  
  const calculateQuoteValue = (quote: Quote) => {
    const materialCost = quote.items.reduce((acc, item) => {
        const material = materials.find(m => m.id === item.materialId);
        return acc + (material ? material.unitCost * item.quantity : 0);
    }, 0);
    const manCount = quote.manCount ?? 1;
    const machineCount = quote.machineCount ?? 1;
    const manCost = (quote.manHours || 0) * (quote.manHourRate || 0) * manCount;
    const machineCost = (quote.machineHours || 0) * (quote.machineHourRate || 0) * machineCount;
    const indirectCosts = quote.laborCost + manCost + machineCost + (quote.freightCost || 0);
    const totalProjectCost = materialCost + indirectCosts;
    const profitValue = totalProjectCost * (quote.profitMargin / 100);
    return totalProjectCost + profitValue;
  }

  const handlePreviewPDF = (quote: Quote) => {
    // This is a simplified recalculation for preview.
    // A more robust implementation might store calculated values with the quote.
     const materialCost = quote.items.reduce((acc, item) => {
        const material = materials.find(m => m.id === item.materialId);
        return acc + (material ? material.unitCost * item.quantity : 0);
    }, 0);
    const manCount = quote.manCount ?? 1;
    const machineCount = quote.machineCount ?? 1;
    const manCost = (quote.manHours || 0) * (quote.manHourRate || 0) * manCount;
    const machineCost = (quote.machineHours || 0) * (quote.machineHourRate || 0) * machineCount;
    const indirectCosts = quote.laborCost + manCost + machineCost + (quote.freightCost || 0);
    const totalProjectCost = materialCost + indirectCosts;
    const profitValue = totalProjectCost * (quote.profitMargin / 100);
    const totalWeight = quote.items.reduce((acc, item) => {
      const material = materials.find(m => m.id === item.materialId);
      return acc + (material ? material.unitWeight * item.quantity : 0);
    }, 0);

    const totalQuantity = quote.items.reduce((acc, item) => acc + item.quantity, 0);
    const calculated = {
      materialCost,
      totalGrossCost: materialCost,
      indirectCosts,
      freightCost: quote.freightCost || 0,
      totalProjectCost,
      totalManufacturingCostPerItem: quote.laborCost * totalQuantity,
      profitValue,
      finalValue: totalProjectCost + profitValue,
      totalWeight,
    };
    
    try {
      const pdfResult = generateQuotePDF(quote, materials, settings, calculated);
      if (pdfResult instanceof Blob) {
        setPdfBlob(pdfResult);
        setCurrentPdfFilename(`orcamento_${quote.id}.pdf`);
        setIsPdfModalOpen(true);
      } else if (typeof pdfResult === 'string') {
        window.open(pdfResult, '_blank');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold text-textPrimary mb-6">Orçamentos Salvos</h2>
      <div className="bg-surface p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-textSecondary">
            <thead className="text-xs text-gray-300 uppercase bg-surface-light">
              <tr>
                <th scope="col" className="px-6 py-3">Nº Orçamento</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3">Valor Total</th>
                <th scope="col" className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length > 0 ? quotes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(quote => (
                <tr key={quote.id} className="border-b border-gray-700 hover:bg-surface-light">
                  <td className="px-6 py-4 font-medium text-textPrimary">{quote.id}</td>
                  <td className="px-6 py-4">{quote.clientName || 'N/A'}</td>
                  <td className="px-6 py-4">{new Date(quote.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">R$ {calculateQuoteValue(quote).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handlePreviewPDF(quote)} className="text-gray-400 hover:text-gray-300 p-1" title="Visualizar PDF">
                      <EyeIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => onEditQuote(quote)} className="text-blue-400 hover:text-blue-300 p-1" title="Reabrir/Editar">
                      <PencilIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => handleDelete(quote.id)} className="text-red-500 hover:text-red-400 p-1" title="Remover">
                      <TrashIcon className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-textSecondary">Nenhum orçamento salvo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PdfActionModal 
        isOpen={isPdfModalOpen} 
        blob={pdfBlob} 
        filename={currentPdfFilename} 
        onClose={() => setIsPdfModalOpen(false)} 
      />
    </div>
  );
};