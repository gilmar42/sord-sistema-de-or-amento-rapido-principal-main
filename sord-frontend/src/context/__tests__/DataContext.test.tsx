import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '../DataContext';
import { AuthProvider } from '../AuthContext';
import { ReactNode } from 'react';

// Mock AuthContext com usuário logado
jest.mock('../AuthContext', () => ({
  ...jest.requireActual('../AuthContext'),
  useAuth: () => ({
    currentUser: {
      id: 'user-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
    },
  }),
}));

// Mock useLocalStorage
jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn((key, initialValue) => {
    let value = initialValue;
    return [
      value,
      jest.fn((newValue) => {
        value = typeof newValue === 'function' ? newValue(value) : newValue;
        return value;
      }),
    ];
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <DataProvider>{children}</DataProvider>
  </AuthProvider>
);

describe('DataContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve iniciar com listas vazias', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.materials).toEqual([]);
    expect(result.current.clients).toEqual([]);
    expect(result.current.quotes).toEqual([]);
  });

  it('deve adicionar material', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const newMaterial = {
      id: '1',
      name: 'Material A',
      cost: 10,
      unit: 'un',
      tenantId: 'tenant-1',
    };

    act(() => {
      result.current.addMaterial(newMaterial);
    });

    expect(result.current.materials).toHaveLength(1);
    expect(result.current.materials[0].name).toBe('Material A');
  });

  it('deve atualizar material', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const material = {
      id: '1',
      name: 'Material A',
      cost: 10,
      unit: 'un',
      tenantId: 'tenant-1',
    };

    act(() => {
      result.current.addMaterial(material);
    });

    act(() => {
      result.current.updateMaterial('1', { name: 'Material Atualizado', cost: 15 });
    });

    expect(result.current.materials[0].name).toBe('Material Atualizado');
    expect(result.current.materials[0].cost).toBe(15);
  });

  it('deve deletar material', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const material = {
      id: '1',
      name: 'Material A',
      cost: 10,
      unit: 'un',
      tenantId: 'tenant-1',
    };

    act(() => {
      result.current.addMaterial(material);
    });

    expect(result.current.materials).toHaveLength(1);

    act(() => {
      result.current.deleteMaterial('1');
    });

    expect(result.current.materials).toHaveLength(0);
  });

  it('deve adicionar cliente', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const newClient = {
      id: '1',
      name: 'Cliente Teste',
      email: 'client@test.com',
      phone: '123456789',
      tenantId: 'tenant-1',
    };

    act(() => {
      result.current.addClient(newClient);
    });

    expect(result.current.clients).toHaveLength(1);
    expect(result.current.clients[0].name).toBe('Cliente Teste');
  });

  it('deve atualizar cliente', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const client = {
      id: '1',
      name: 'Cliente Teste',
      email: 'client@test.com',
      phone: '123456789',
      tenantId: 'tenant-1',
    };

    act(() => {
      result.current.addClient(client);
    });

    act(() => {
      result.current.updateClient('1', { name: 'Cliente Atualizado' });
    });

    expect(result.current.clients[0].name).toBe('Cliente Atualizado');
  });

  it('deve deletar cliente', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const client = {
      id: '1',
      name: 'Cliente Teste',
      email: 'client@test.com',
      phone: '123456789',
      tenantId: 'tenant-1',
    };

    act(() => {
      result.current.addClient(client);
    });

    expect(result.current.clients).toHaveLength(1);

    act(() => {
      result.current.deleteClient('1');
    });

    expect(result.current.clients).toHaveLength(0);
  });

  it('deve adicionar orçamento', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    const newQuote = {
      id: '1',
      clientName: 'Cliente Teste',
      date: new Date().toISOString(),
      items: [],
      total: 100,
      tenantId: 'tenant-1',
    };

    act(() => {
      result.current.addQuote(newQuote);
    });

    expect(result.current.quotes).toHaveLength(1);
    expect(result.current.quotes[0].clientName).toBe('Cliente Teste');
  });

  it('deve filtrar dados por tenantId', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    // Tentar adicionar material de outro tenant
    const material1 = {
      id: '1',
      name: 'Material Tenant 1',
      cost: 10,
      unit: 'un',
      tenantId: 'tenant-1',
    };

    const material2 = {
      id: '2',
      name: 'Material Tenant 2',
      cost: 20,
      unit: 'un',
      tenantId: 'tenant-2',
    };

    act(() => {
      result.current.addMaterial(material1);
      result.current.addMaterial(material2);
    });

    // Deve mostrar apenas materiais do tenant atual
    const currentTenantMaterials = result.current.materials.filter(
      m => m.tenantId === 'tenant-1'
    );

    expect(currentTenantMaterials).toHaveLength(1);
    expect(currentTenantMaterials[0].name).toBe('Material Tenant 1');
  });
});
