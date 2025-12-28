import {
  registerUser,
  loginUser,
  getProfile,
  getPlans,
  createPayment,
  getPayments,
} from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    it('deve registrar usuário com sucesso', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@test.com', name: 'Test User' },
        token: 'mock-token',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await registerUser({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        companyName: 'Test Company',
        planName: 'STARTER',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });

    it('deve lançar erro ao falhar registro', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Email já existe' }),
      });

      await expect(
        registerUser({
          name: 'Test',
          email: 'test@test.com',
          password: 'pass',
          companyName: 'Company',
          planName: 'STARTER',
        })
      ).rejects.toThrow('Email já existe');
    });
  });

  describe('loginUser', () => {
    it('deve fazer login com sucesso', async () => {
      const mockResponse = {
        user: { id: '1', email: 'test@test.com' },
        token: 'mock-token',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await loginUser({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro com credenciais inválidas', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Credenciais inválidas' }),
      });

      await expect(
        loginUser({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Credenciais inválidas');
    });
  });

  describe('getProfile', () => {
    it('deve obter perfil do usuário autenticado', async () => {
      localStorage.setItem('token', 'valid-token');

      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await getProfile();

      expect(result).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/profile'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    it('deve lançar erro se não autenticado', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Não autorizado' }),
      });

      await expect(getProfile()).rejects.toThrow();
    });
  });

  describe('getPlans', () => {
    it('deve buscar lista de planos', async () => {
      const mockPlans = [
        { id: '1', name: 'Plano Mensal', price: 100 },
        { id: '2', name: 'Plano Anual', price: 1100 },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPlans,
      });

      const result = await getPlans();

      expect(result).toEqual(mockPlans);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/plans'),
        expect.any(Object)
      );
    });
  });

  describe('createPayment', () => {
    it('deve criar pagamento com sucesso', async () => {
      localStorage.setItem('token', 'valid-token');

      const mockPayment = {
        id: 'payment-1',
        status: 'approved',
        amount: 100,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPayment,
      });

      const paymentData = {
        planId: 'plan-1',
        amount: 100,
        cardToken: 'card-token',
      };

      const result = await createPayment(paymentData);

      expect(result).toEqual(mockPayment);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/payments'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(paymentData),
        })
      );
    });

    it('deve enviar token de autenticação', async () => {
      localStorage.setItem('token', 'auth-token');

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await createPayment({ planId: 'plan-1', amount: 100, cardToken: 'token' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
          }),
        })
      );
    });
  });

  describe('getPayments', () => {
    it('deve buscar lista de pagamentos do usuário', async () => {
      localStorage.setItem('token', 'valid-token');

      const mockPayments = [
        { id: '1', amount: 100, status: 'approved' },
        { id: '2', amount: 200, status: 'pending' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPayments,
      });

      const result = await getPayments();

      expect(result).toEqual(mockPayments);
    });
  });

  describe('Error Handling', () => {
    it('deve lidar com erro de rede', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getPlans()).rejects.toThrow('Network error');
    });

    it('deve usar mensagem de erro padrão quando não fornecida', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(getPlans()).rejects.toThrow('Erro 500');
    });
  });
});
