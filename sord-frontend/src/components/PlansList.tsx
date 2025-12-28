import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/env';

export interface Plan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingCycle: string;
  features: {
    maxClients: number;
    maxQuotes: number;
    maxUsers: number;
    apiAccess: boolean;
    customBranding: boolean;
    advancedReports: boolean;
    webhooks: boolean;
    supportPriority: string;
  };
}

interface PlansListProps {
  onSelectPlan?: (plan: Plan) => void;
}

export const PlansList: React.FC<PlansListProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const apiUrl = API_URL;
        const response = await fetch(`${apiUrl}/plans`);
        
        if (!response.ok) {
          throw new Error('Erro ao carregar planos');
        }

        const data = await response.json();
        setPlans(data.success ? data.data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando planos...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto py-8">
      {plans.map(plan => {
        const billingLabel = plan.billingCycle === 'yearly' ? 'por ano' : 'por mês';
        const billingShort = plan.billingCycle === 'yearly' ? '/ano' : '/mês';
        const savings = plan.billingCycle === 'yearly' ? ' (8% de economia!)' : '';
        
        return (
        <div
          key={plan._id}
          className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${
            plan.billingCycle === 'yearly' ? 'ring-2 ring-green-500 bg-green-50' : ''
          }`}
        >
          <h3 className="text-2xl font-bold mb-2">{plan.displayName}</h3>
          <p className="text-gray-600 mb-4 text-sm">
            {plan.billingCycle === 'yearly' 
              ? 'Melhor Economia' 
              : 'Flexibilidade Mensal'}
          </p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold">
              R$ {plan.price.toLocaleString('pt-BR')}
            </span>
            <span className="text-gray-600 ml-2 text-lg">{billingShort}</span>
            {savings && <div className="text-green-600 text-sm font-semibold mt-1">{savings}</div>}
          </div>

          <ul className="space-y-2 mb-6 text-sm">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Até {plan.features.maxClients} clientes</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Até {plan.features.maxQuotes} orçamentos</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Até {plan.features.maxUsers} usuários</span>
            </li>
            {plan.features.customBranding && (
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Branding customizado</span>
              </li>
            )}
            {plan.features.advancedReports && (
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Relatórios avançados</span>
              </li>
            )}
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              <span>Suporte {plan.features.supportPriority}</span>
            </li>
          </ul>

          <button
            onClick={() => onSelectPlan?.(plan)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {plan.billingCycle === 'yearly' ? 'Assinar Anualmente' : 'Assinar Mensalmente'}
          </button>
        </div>
        );
      })}
    </div>
  );
};
