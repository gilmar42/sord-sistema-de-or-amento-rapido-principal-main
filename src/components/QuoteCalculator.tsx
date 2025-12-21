import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Material, QuoteItem, Quote, CalculatedCosts } from '../types';
import { generateQuotePDF } from '../services/pdfGenerator';
import { formatComponentSize } from '../utils/componentUtils';
// Fix: Removed PrinterIcon as it is not exported from Icons.tsx
import { PlusIcon, TrashIcon, DocumentDuplicateIcon, CheckCircleIcon, ArrowDownOnSquareIcon, ShareIcon, DocumentTextIcon, CogIcon } from './Icons';

interface QuoteCalculatorProps {
  quoteToEdit: Quote | null;
  setQuoteToEdit: (quote: Quote | null) => void;
  onNavigateToMaterials?: () => void;
}

import { MaterialSelectionModal } from './MaterialSelectionModal';
import PdfActionModal from './PdfActionModal';


export const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({ quoteToEdit, setQuoteToEdit, onNavigateToMaterials }) => {
    const { materials, quotes, setQuotes, settings, clients } = useData();
    
    // Log de debug para materiais
    useEffect(() => {
      console.log('===== QuoteCalculator montado =====');
      console.log('Materiais disponíveis:', materials);
      console.log('Total de materiais:', materials?.length || 0);
      console.log('Settings:', settings);
    }, [materials, settings]);
  
    // Initialize component state
  
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [freightCost, setFreightCost] = useState(0);
  const [profitMargin, setProfitMargin] = useState(20);
  const [isFreightEnabled, setIsFreightEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  
  // Hora Homem
  const [laborHours, setLaborHours] = useState(0);
  const [laborHourlyRate, setLaborHourlyRate] = useState(0);
  const [numberOfWorkers, setNumberOfWorkers] = useState(1);
  
  // Hora Máquina
  const [machineHours, setMachineHours] = useState(0);
  const [machineHourlyRate, setMachineHourlyRate] = useState(0);
    const [numberOfMachines, setNumberOfMachines] = useState(1);
  
  const [currentQuoteId, setCurrentQuoteId] = useState<string | null>(quoteToEdit?.id || null);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    if (quoteToEdit) {
      setClientName(quoteToEdit.clientName);
      setItems(quoteToEdit.items || []);
      setFreightCost(quoteToEdit.freightCost);
      setProfitMargin(quoteToEdit.profitMargin);
      setIsFreightEnabled(quoteToEdit.isFreightEnabled || false);
      setCurrentQuoteId(quoteToEdit.id);
      setLaborHours(quoteToEdit.laborHours || 0);
      setLaborHourlyRate(quoteToEdit.laborHourlyRate || 0);
      setNumberOfWorkers(quoteToEdit.numberOfWorkers || 1);
      setMachineHours(quoteToEdit.machineHours || 0);
      setMachineHourlyRate(quoteToEdit.machineHourlyRate || 0);
    } else {
        resetForm();
    }
  }, [quoteToEdit]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.client-dropdown-container')) {
        setShowClientDropdown(false);
      }
    };
    
    if (showClientDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showClientDropdown]);

  const resetForm = () => {
    setClientName('');
    setItems([]);
    setFreightCost(0);
    setProfitMargin(20);
    setIsFreightEnabled(false);
    setCurrentQuoteId(null);
    setQuoteToEdit(null);
    setLaborHours(0);
    setLaborHourlyRate(0);
    setNumberOfWorkers(1);
    setMachineHours(0);
    setMachineHourlyRate(0);
        setNumberOfMachines(1);
  };

  const calculated: CalculatedCosts = useMemo(() => {
    // Calcular custo total dos materiais somando o custo de cada componente
    const materialCost = items.reduce((acc, item) => {
      const material = materials && Array.isArray(materials) ? materials.find(m => m.id === item.materialId) : undefined;
      if (!material) return acc;
      
      // Somar o custo de todos os componentes do material
      const componentsCost = material.components.reduce((compAcc, component) => {
        return compAcc + (component.unitCost || 0);
      }, 0);
      
      // Se não houver componentes, usar o unitCost do material
      const materialUnitCost = componentsCost > 0 ? componentsCost : material.unitCost;
      
      return acc + (materialUnitCost * item.quantity);
    }, 0);

    // Custo de fabricação calculado automaticamente: soma de todos os componentes de todos os itens
    const totalManufacturingCost = items.reduce((acc, item) => {
      const material = materials && Array.isArray(materials) ? materials.find(m => m.id === item.materialId) : undefined;
      if (!material) return acc;
      
      const componentsCost = material.components.reduce((compAcc, component) => {
        return compAcc + (component.unitCost || 0);
      }, 0);
      
      return acc + (componentsCost * item.quantity);
    }, 0);
    
    // Calcular custos de hora homem e hora máquina
    const laborCost = laborHours * laborHourlyRate * numberOfWorkers;
    const machineCost = machineHours * machineHourlyRate * numberOfMachines;
    
    const totalProjectCost = materialCost + totalManufacturingCost + laborCost + machineCost + (isFreightEnabled ? freightCost : 0);
    const profitValue = totalProjectCost * (profitMargin / 100);
    const finalValue = totalProjectCost + profitValue;

    const totalWeight = items.reduce((acc, item) => {
      const material = materials && Array.isArray(materials) ? materials.find(m => m.id === item.materialId) : undefined;
      return acc + (material ? material.unitWeight * item.quantity : 0);
    }, 0);

    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      materialCost,
      totalGrossCost: materialCost,
      indirectCosts: totalManufacturingCost,
      freightCost: isFreightEnabled ? freightCost : 0,
      totalProjectCost,
      totalManufacturingCostPerItem: totalManufacturingCost,
      profitValue,
      finalValue,
      totalWeight,
      laborCost,
      machineCost,
    };
    }, [items, freightCost, profitMargin, materials, isFreightEnabled, laborHours, laborHourlyRate, numberOfWorkers, machineHours, machineHourlyRate, numberOfMachines]);

  const handleAddItem = useCallback((material: Material) => {
    console.log('===== handleAddItem chamado =====');
    console.log('Material recebido:', material);
    setIsModalOpen(false);
    setItems(prevItems => {
      console.log('Items anteriores:', prevItems);
      const existingItem = prevItems.find(item => item.materialId === material.id);
      let updatedItems;
      if (existingItem) {
        console.log('Item já existe, incrementando quantidade');
        updatedItems = prevItems.map(item =>
          item.materialId === material.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        console.log('Novo item, adicionando à lista');
        updatedItems = [...prevItems, { materialId: material.id, quantity: 1 }];
      }
      console.log('Items atualizados:', updatedItems);
      return updatedItems;
    });
  }, [setIsModalOpen, setItems]);
  
  const handleUpdateQuantity = (materialId: string, value: string) => {
    const parsedQuantity = parseInt(value);
    const newQuantity = isNaN(parsedQuantity) ? 0 : Math.max(0, parsedQuantity);
    setItems(items.map(item => item.materialId === materialId ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveItem = (materialId: string) => {
    setItems(items.filter(item => item.materialId !== materialId));
  };

  const handleSaveQuote = () => {
    console.log('===== INÍCIO handleSaveQuote =====');
    console.log('Items:', items);
    console.log('Items length:', items.length);
    console.log('ClientName:', clientName);
    console.log('CurrentQuoteId:', currentQuoteId);
    console.log('Quotes atuais:', quotes);
    
    // Permitir salvar orçamentos sem materiais (apenas serviços)
    if (items.length === 0) {
      console.log('Salvando orçamento apenas com serviços (sem materiais)');
    }
    
    const quoteData: Omit<Quote, 'id' | 'date'> = {
        clientName,
        items,
        laborCost: 0,
        freightCost,
        profitMargin,
        isFreightEnabled,
        laborHours,
        laborHourlyRate,
        numberOfWorkers,
        machineHours,
        machineHourlyRate,
        numberOfMachines,
    };
    
    console.log('Quote data preparado:', quoteData);
    
    if (currentQuoteId) {
        // Update existing quote
        const updatedQuote: Quote = { ...quoteData, id: currentQuoteId, date: new Date().toISOString() };
        console.log('Atualizando orçamento:', updatedQuote);
        setQuotes(quotes.map(q => q.id === currentQuoteId ? updatedQuote : q));
    } else {
        // Create new quote
        const newQuote: Quote = { ...quoteData, id: `Q-${Date.now()}`, date: new Date().toISOString() };
        console.log('Criando novo orçamento:', newQuote);
        setQuotes([...quotes, newQuote]);
        setCurrentQuoteId(newQuote.id);
    }

    console.log('Orçamento salvo com sucesso!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    console.log('===== FIM handleSaveQuote =====');
  };
  
  const handleGeneratePDF = () => {
     console.log('===== INÍCIO handleGeneratePDF =====');
     console.log('CurrentQuoteId:', currentQuoteId);
     console.log('Items:', items);
     console.log('Calculated:', calculated);
     console.log('Materials:', materials);
     console.log('Settings:', settings);
     
     if (!currentQuoteId) {
       console.error('Tentativa de gerar PDF sem orçamento salvo!');
       alert('Salve o orçamento antes de gerar o PDF.');
       return;
     }
     
     const quote: Quote = {
        id: currentQuoteId || `Q-${Date.now()}`,
        date: new Date().toISOString(),
        clientName,
        items,
        laborCost: 0,
        freightCost,
        profitMargin,
        isFreightEnabled,
        laborHours,
        laborHourlyRate,
        numberOfWorkers,
        machineHours,
        machineHourlyRate,
    };
    
    console.log('Quote preparado para PDF:', quote);
    
    try {
        console.log('Chamando generateQuotePDF...');
        const pdfResult = generateQuotePDF(quote, materials, settings, calculated);
        console.log('PDF gerado:', pdfResult);
        console.log('Tipo do resultado:', typeof pdfResult);
        
        if (pdfResult instanceof Blob) {
            console.log('Resultado é Blob, abrindo modal...');
            setPdfBlob(pdfResult);
            setIsPdfModalOpen(true);
        } else if (typeof pdfResult === 'string') {
            console.log('Resultado é string, abrindo em nova aba...');
            // fallback for older environments where generator returns data URI
            window.open(pdfResult, '_blank');
        }
        console.log('===== FIM handleGeneratePDF (sucesso) =====');
    } catch (error) {
        console.error('===== ERRO em handleGeneratePDF =====');
        console.error('Erro ao gerar PDF:', error);
        console.error('Stack trace:', (error as Error).stack);
        alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  };

  const handleWhatsAppShare = () => {
    const quote: Quote = {
      id: currentQuoteId || `Q-${Date.now()}`,
      date: new Date().toISOString(),
      clientName,
      items,
      laborCost: 0,
      freightCost,
      profitMargin,
      isFreightEnabled,
      laborHours,
      laborHourlyRate,
      numberOfWorkers,
      machineHours,
      machineHourlyRate,
    };
    const pdfDataUri = generateQuotePDF(quote, materials, settings, calculated);

    const quoteNumber = currentQuoteId || 'Novo';
    const message = `Olá! Segue o orçamento ${quoteNumber} com valor total de R$ ${calculated.finalValue.toFixed(2)} e peso total de ${calculated.totalWeight.toFixed(2)} kg. Você pode visualizar o PDF em anexo. Aguardamos seu contato!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getMaterialById = (id: string) => materials && Array.isArray(materials) ? materials.find(m => m.id === id) : undefined;

  // Filtrar clientes baseado na busca
  const filteredClients = useMemo(() => {
    if (!clients || !Array.isArray(clients)) return [];
    if (!clientSearchTerm) return clients;
    return clients.filter(client => 
      client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clients, clientSearchTerm]);

  const handleClientSelect = (client: any) => {
    setClientName(client.name);
    setClientSearchTerm('');
    setShowClientDropdown(false);
  };

  const handleClientInputChange = (value: string) => {
    setClientName(value);
    setClientSearchTerm(value);
    setShowClientDropdown(true);
  };

    return (
        <div className="container mx-auto" data-testid="quote-calculator-root">
        {isModalOpen && <MaterialSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleAddItem} onNavigateToMaterials={onNavigateToMaterials} />}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-textPrimary dark:text-white">{currentQuoteId || 'Novo Orçamento'}</h2>
            <button onClick={resetForm} className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">Limpar Formulário</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Itens do Orçamento */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover-lift card-hover animate-slide-in-left">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-textPrimary dark:text-white flex items-center">
                            <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                            Itens do Orçamento
                            {items.length > 0 && (
                                <span className="ml-2 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium">
                                    {items.length}
                                </span>
                            )}
                        </h3>
                        {(!materials || materials.length === 0) ? (
                            <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                                    ⚠️ Nenhum material cadastrado
                                </p>
                                {onNavigateToMaterials && (
                                    <button 
                                        onClick={onNavigateToMaterials}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
                                    >
                                        <CogIcon className="w-4 h-4 mr-2"/>
                                        Ir para Cadastro de Materiais
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                            >
                                <PlusIcon className="w-4 h-4 mr-2"/>
                                Adicionar Material
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border dark:border-slate-600">
                        <table className="w-full text-sm text-left text-textSecondary dark:text-slate-300">
                            <thead className="text-xs text-gray-600 dark:text-slate-300 uppercase bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left font-semibold">Descrição</th>
                                    <th scope="col" className="px-6 py-3 w-32 text-center font-semibold">Quantidade</th>
                                    <th scope="col" className="px-6 py-3 text-center font-semibold">Valor Unit.</th>
                                    <th scope="col" className="px-6 py-3 text-center font-semibold">Valor Total</th>
                                    <th scope="col" className="px-6 py-3 w-20 text-center font-semibold">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const material = getMaterialById(item.materialId);
                                    if (!material) return null;
                                    
                                    // Calcular custo unitário somando todos os componentes
                                    const componentsCost = material.components.reduce((acc, component) => {
                                      return acc + (component.unitCost || 0);
                                    }, 0);
                                    const unitCost = componentsCost > 0 ? componentsCost : material.unitCost;
                                    const totalCost = unitCost * item.quantity;
                                    
                                    return (
                                        <tr key={item.materialId} className="border-b border-gray-200 dark:border-slate-600 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-colors duration-150">
                                            <td className="px-6 py-3 font-medium text-textPrimary dark:text-white">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    {material.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => handleUpdateQuantity(item.materialId, e.target.value)}
                                                    className="w-20 px-3 py-1.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-center text-textPrimary dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 text-center font-semibold text-green-600 dark:text-green-400">R$ {unitCost.toFixed(2)}</td>
                                            <td className="px-6 py-3 text-center font-bold text-textPrimary dark:text-white">
                                                <span className="inline-block bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full text-green-800 dark:text-green-300">
                                                    R$ {totalCost.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button 
                                                    onClick={() => handleRemoveItem(item.materialId)} 
                                                    className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remover item"
                                                    type="button"
                                                >
                                                    <TrashIcon className="w-5 h-5"/>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                 {items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                                    <PlusIcon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                                                </div>
                                                <div className="text-gray-500 dark:text-slate-400">
                                                    <p className="font-medium">Nenhum item adicionado</p>
                                                    <p className="text-sm">Clique em "Adicionar Item" para começar</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Custos Adicionais */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover-lift card-hover animate-slide-in-right">
                     <h3 className="text-lg font-semibold text-textPrimary dark:text-white mb-4 flex items-center">
                        <CogIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Custos e Margem
                     </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 client-dropdown-container">
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                                Nome do Cliente
                            </label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={clientName}
                                    onChange={e => handleClientInputChange(e.target.value)}
                                    onFocus={() => setShowClientDropdown(true)}
                                    placeholder="Digite o nome do cliente"
                                    className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                />
                                {showClientDropdown && filteredClients.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredClients.map(client => (
                                            <div
                                                key={client.id}
                                                onClick={() => handleClientSelect(client)}
                                                className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-600 last:border-b-0"
                                            >
                                                <div className="font-semibold text-sm text-textPrimary dark:text-white">{client.name}</div>
                                                {client.email && <div className="text-xs text-gray-500 dark:text-slate-400">{client.email}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                         <div className="space-y-2">
                            <label htmlFor="profitMargin" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                                Margem de Lucro (%)
                            </label>
                            <div className="relative">
                                <input
                                    id="profitMargin"
                                    type="number"
                                    value={profitMargin}
                                    onChange={e => setProfitMargin(parseFloat(e.target.value))}
                                    className="block w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    min="0"
                                    max="100"
                                />
                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">%</span>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label htmlFor="freightCost" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Custo de Frete (R$)</label>
                            <div className="flex gap-3 items-center">
                                <input 
                                    id="freightCost"
                                    type="number"
                                    value={freightCost}
                                    onChange={e => setFreightCost(parseFloat(e.target.value))}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    placeholder="0.00"
                                    disabled={!isFreightEnabled}
                                />
                                <label htmlFor="toggleFreight" className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="toggleFreight"
                                        className="sr-only"
                                        checked={isFreightEnabled}
                                        onChange={() => setIsFreightEnabled(!isFreightEnabled)}
                                    />
                                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isFreightEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 top-0.5 ${isFreightEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${isFreightEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {isFreightEnabled ? '✓ Ativo' : 'Inativo'}
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        {/* Mão de Obra */}
                        <div className="col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Mão de Obra (Hora Homem)
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                                        Qtd. Homens
                                    </label>
                                    <input 
                                        type="number"
                                        value={numberOfWorkers}
                                        onChange={e => setNumberOfWorkers(parseInt(e.target.value) || 1)}
                                        placeholder="1"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm shadow-sm"
                                        min="1"
                                        step="1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                                        Horas
                                    </label>
                                    <input 
                                        type="number"
                                        value={laborHours}
                                        onChange={e => setLaborHours(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm shadow-sm"
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                                        Valor/Hora (R$)
                                    </label>
                                    <input 
                                        type="number"
                                        value={laborHourlyRate}
                                        onChange={e => setLaborHourlyRate(parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm shadow-sm"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Hora Máquina */}
                        <div className="col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                            <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                Hora Máquina
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                                        Qtd. Máquinas
                                    </label>
                                    <input 
                                        type="number"
                                        value={numberOfMachines}
                                        onChange={e => setNumberOfMachines(parseInt(e.target.value) || 1)}
                                        placeholder="1"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow text-sm shadow-sm"
                                        min="1"
                                        step="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                                        Horas
                                    </label>
                                    <input 
                                        type="number"
                                        value={machineHours}
                                        onChange={e => setMachineHours(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow text-sm shadow-sm"
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                                        Valor/Hora (R$)
                                    </label>
                                    <input 
                                        type="number"
                                        value={machineHourlyRate}
                                        onChange={e => setMachineHourlyRate(parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-textPrimary dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow text-sm shadow-sm"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumo e Ações */}
            <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-surface to-white dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 sticky top-8 border border-gray-200 dark:border-slate-600 animate-scale-in">
                    <h3 className="text-lg font-bold text-textPrimary dark:text-white border-b-2 border-blue-500 dark:border-blue-600 pb-2 mb-4 flex items-center">
                        <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Resumo do Orçamento
                    </h3>
                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between items-center py-2 px-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <span className="text-gray-700 dark:text-slate-300 font-medium">Material</span>
                            <span className="font-semibold text-indigo-700 dark:text-indigo-400">R$ {calculated.materialCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-100 dark:border-violet-800">
                            <span className="text-gray-700 dark:text-slate-300 font-medium">Fabricação</span>
                            <span className="font-semibold text-violet-700 dark:text-violet-400">R$ {calculated.totalManufacturingCostPerItem.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                            <span className="text-gray-700 dark:text-slate-300 font-medium">Frete</span>
                            <span className="font-semibold text-amber-700 dark:text-amber-400">R$ {calculated.freightCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div>
                                <span className="text-gray-700 dark:text-slate-300 font-medium">Mão de Obra</span>
                                {numberOfWorkers > 1 && (
                                    <div className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                                        {numberOfWorkers} homens × {laborHours}h × R$ {laborHourlyRate.toFixed(2)}/h
                                    </div>
                                )}
                            </div>
                            <span className="font-semibold text-blue-700 dark:text-blue-400">R$ {calculated.laborCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <div>
                                <span className="text-gray-700 dark:text-slate-300 font-medium">Hora Máquina</span>
                                {(numberOfMachines > 1 || machineHours > 0) && (
                                    <div className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                                        {numberOfMachines} máquinas × {machineHours}h × R$ {machineHourlyRate.toFixed(2)}/h
                                    </div>
                                )}
                            </div>
                            <span className="font-semibold text-purple-700 dark:text-purple-400">R$ {calculated.machineCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3 bg-gray-100 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                            <span className="text-gray-700 dark:text-slate-300 font-medium">Subtotal do Projeto</span>
                            <span className="font-bold text-gray-800 dark:text-white">R$ {calculated.totalProjectCost.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <span className="text-gray-700 dark:text-slate-300 font-medium">Margem de Lucro ({profitMargin}%)</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">R$ {calculated.profitValue.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 px-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                            <span className="text-gray-700 dark:text-slate-300 font-medium">Peso Total</span>
                            <span className="font-semibold text-orange-700 dark:text-orange-400">{calculated.totalWeight.toFixed(2)} kg</span>
                        </div>
                        
                         <div className="flex justify-between items-center py-3 px-4 mt-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-md">
                            <span className="font-bold text-base text-gray-800 dark:text-white">Valor Final</span>
                            <span className="font-bold text-xl text-green-700 dark:text-green-400">R$ {calculated.finalValue.toFixed(2)}</span>
                        </div>
                    </div>
                    {items.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-textPrimary dark:text-white mb-2 border-t border-gray-200 dark:border-slate-600 pt-4">Componentes</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-textSecondary dark:text-slate-300">
                                    <thead className="text-xs text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            <th scope="col" className="px-2 py-1.5 text-left">Material</th>
                                            <th scope="col" className="px-2 py-1.5 text-left">Componente</th>
                                            <th scope="col" className="px-2 py-1.5 text-left">Tam.</th>
                                            <th scope="col" className="px-2 py-1.5 text-right">Peso</th>
                                            <th scope="col" className="px-2 py-1.5 text-right">Custo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => {
                                            const material = getMaterialById(item.materialId);
                                            if (!material || material.components.length === 0) return null;

                                            return material.components.map((component, compIndex) => (
                                                <tr key={`${item.materialId}-${compIndex}`} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-xs">
                                                    {compIndex === 0 && (
                                                        <td rowSpan={material.components.length} className="px-2 py-1.5 font-medium text-textPrimary dark:text-white align-top">
                                                            {material.name}
                                                        </td>
                                                    )}
                                                    <td className="px-2 py-1.5 text-gray-600 dark:text-slate-400">{component.name}</td>
                                                    <td className="px-2 py-1.5 text-gray-600 dark:text-slate-400">{formatComponentSize(component)}</td>
                                                    <td className="px-2 py-1.5 text-right text-gray-600 dark:text-slate-400">{(component.unitWeight || 0).toFixed(2)} {component.unit}</td>
                                                    <td className="px-2 py-1.5 text-right text-green-600 dark:text-green-400">R$ {(component.unitCost || 0).toFixed(2)}</td>
                                                </tr>
                                            ));
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    <div className="mt-6 space-y-3">
                        {items.length === 0 && (laborHours > 0 || machineHours > 0) && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                💡 Orçamento apenas de serviços (sem materiais)
                            </div>
                        )}
                        <button 
                            onClick={handleSaveQuote} 
                            disabled={false} 
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
                            title="Salvar orçamento (materiais e/ou serviços)"
                        >
                            {showSuccess ? <CheckCircleIcon className="w-5 h-5 mr-2"/> : <DocumentDuplicateIcon className="w-5 h-5 mr-2" />}
                            {showSuccess ? 'Salvo com Sucesso!' : (currentQuoteId ? 'Atualizar Orçamento' : 'Salvar Orçamento')}
                        </button>
                        {!currentQuoteId && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                💡 Salve o orçamento antes de gerar o PDF
                            </div>
                        )}
                        <button 
                            onClick={handleGeneratePDF} 
                            disabled={!currentQuoteId} 
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
                            title={!currentQuoteId ? 'Salve o orçamento antes de gerar PDF' : 'Gerar PDF do orçamento'}
                        >
                            <ArrowDownOnSquareIcon className="w-5 h-5 mr-2"/>
                            Gerar PDF
                        </button>
                     </div>
                </div>
            </div>
        </div>
        <PdfActionModal isOpen={isPdfModalOpen} blob={pdfBlob} filename="orcamento.pdf" onClose={() => setIsPdfModalOpen(false)} />
    </div>
  )
};
