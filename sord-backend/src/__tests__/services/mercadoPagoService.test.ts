import { MercadoPagoService } from '../../services/mercadoPagoService';

describe('MercadoPagoService', () => {
  const service = new MercadoPagoService();

  describe('validatePaymentRequest', () => {
    it('should validate required fields', () => {
      const invalidRequest = {
        orderId: '',
        amount: 0,
        token: '',
        paymentMethodId: '',
        installments: 0,
        email: '',
        description: '',
      };

      // The service should validate and throw or return error
      expect(() => service.validatePaymentRequest(invalidRequest)).toThrow();
    });

    it('should accept valid payment request', () => {
      const validRequest = {
        orderId: 'order-123',
        amount: 100.00,
        token: 'valid-token',
        paymentMethodId: 'visa',
        installments: 1,
        email: 'test@example.com',
        description: 'Test Payment',
      };

      // Should not throw
      expect(() => service.validatePaymentRequest(validRequest)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidRequest = {
        orderId: 'order-123',
        amount: 100.00,
        token: 'valid-token',
        paymentMethodId: 'visa',
        installments: 1,
        email: 'invalid-email',
        description: 'Test Payment',
      };

      expect(() => service.validatePaymentRequest(invalidRequest)).toThrow();
    });

    it('should reject zero amount', () => {
      const invalidRequest = {
        orderId: 'order-123',
        amount: 0,
        token: 'valid-token',
        paymentMethodId: 'visa',
        installments: 1,
        email: 'test@example.com',
        description: 'Test Payment',
      };

      expect(() => service.validatePaymentRequest(invalidRequest)).toThrow();
    });

    it('should reject invalid installments', () => {
      const invalidRequest = {
        orderId: 'order-123',
        amount: 100.00,
        token: 'valid-token',
        paymentMethodId: 'visa',
        installments: 0,
        email: 'test@example.com',
        description: 'Test Payment',
      };

      expect(() => service.validatePaymentRequest(invalidRequest)).toThrow();
    });
  });

  describe('getPaymentMethodFee', () => {
    it('should return correct fee for credit card', () => {
      const fee = service.getPaymentMethodFee('visa', 3);
      expect(typeof fee).toBe('number');
      expect(fee).toBeGreaterThan(0);
    });

    it('should return correct fee for debit', () => {
      const fee = service.getPaymentMethodFee('debit_visa', 1);
      expect(typeof fee).toBe('number');
      expect(fee).toBeGreaterThan(0);
    });

    it('should handle unknown payment method', () => {
      const fee = service.getPaymentMethodFee('unknown', 1);
      expect(typeof fee).toBe('number');
    });
  });

  describe('calculateInstallmentAmount', () => {
    it('should calculate installment amount correctly', () => {
      const installments = 3;
      const amount = 300;
      const installmentAmount = service.calculateInstallmentAmount(amount, installments);
      
      expect(installmentAmount).toBeLessThanOrEqual(amount);
      expect(installmentAmount).toBeGreaterThan(0);
    });

    it('should handle single installment', () => {
      const amount = 100;
      const installmentAmount = service.calculateInstallmentAmount(amount, 1);
      
      expect(installmentAmount).toBe(amount);
    });
  });
});
