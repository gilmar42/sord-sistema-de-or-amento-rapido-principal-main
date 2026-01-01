const paymentSaveMock = jest.fn();
const paymentFindOneMock = jest.fn();
const paymentFindMock = jest.fn();
const paymentCountMock = jest.fn();

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}), { virtual: true });

jest.mock('../../db/models.js', () => {
  const Payment: any = jest.fn().mockImplementation((data: any) => ({
    ...data,
    save: paymentSaveMock,
  }));
  Payment.findOne = paymentFindOneMock;
  Payment.find = paymentFindMock;
  Payment.countDocuments = paymentCountMock;

  return { __esModule: true, Payment };
}, { virtual: true });

jest.mock('../../utils/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}), { virtual: true });

describe('PaymentService', () => {
  let paymentService: any;

  const baseRequest = {
    orderId: 'order-1',
    amount: 150,
    email: 'customer@test.com',
    description: 'Plano Mensal',
    tenantId: 'tenant-1',
    token: 'tok_123',
    paymentMethodId: 'credit_card',
    installments: 1,
    ipAddress: '127.0.0.1',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import('../../services/paymentService');
    paymentService = mod.default;
  });

  it('processPayment: cria pagamento e retorna dados mínimos', async () => {
    const saveSpy = paymentSaveMock.mockResolvedValue(undefined);

    const result = await paymentService.processPayment(baseRequest);

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('mock-uuid');
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(paymentFindMock).not.toHaveBeenCalled();
  });

  it('processPayment: retorna erro de validação quando request é inválido', async () => {
    const invalidRequest = { ...baseRequest, token: '' };

    const result = await paymentService.processPayment(invalidRequest);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/token é obrigatório/i);
    expect(paymentSaveMock).not.toHaveBeenCalled();
  });

  it('getPaymentStatus: retorna erro quando pagamento não existe', async () => {
    paymentFindOneMock.mockResolvedValue(null);

    const result = await paymentService.getPaymentStatus('pay-404', 'tenant-1');

    expect(paymentFindOneMock).toHaveBeenCalledWith({ paymentId: 'pay-404', tenantId: 'tenant-1' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Pagamento não encontrado/);
  });

  it('listPayments: retorna lista paginada com filtros', async () => {
    const paymentDocs = [{ paymentId: 'pay-1', orderId: 'order-1', status: 'approved', amount: 10, description: 'desc', createdAt: new Date() }];
    paymentFindMock.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValue(paymentDocs),
    });
    paymentCountMock.mockResolvedValue(1);

    const result = await paymentService.listPayments('tenant-1', { status: 'approved', limit: 5, offset: 0 });

    expect(result.success).toBe(true);
    expect(result.data.payments).toHaveLength(1);
    expect(result.data.pagination.total).toBe(1);
    expect(paymentFindMock).toHaveBeenCalledWith({ tenantId: 'tenant-1', status: 'approved' });
  });

  it('handleWebhook: atualiza status quando pagamento é encontrado', async () => {
    const paymentDoc: any = { paymentId: 'pay-1', orderId: 'order-1', status: 'pending', metadata: {}, save: jest.fn().mockResolvedValue(undefined) };
    paymentFindOneMock.mockResolvedValue(paymentDoc);

    await paymentService.handleWebhook({ type: 'payment', data: { id: 'pay-1', status: 'approved' } });

    expect(paymentDoc.status).toBe('approved');
    expect(paymentDoc.save).toHaveBeenCalled();
  });

  it('handleWebhook: ignora evento quando pagamento não existe', async () => {
    paymentFindOneMock.mockResolvedValue(null);

    await expect(paymentService.handleWebhook({ type: 'payment', data: { id: 'pay-x', status: 'rejected' } })).resolves.toBeUndefined();
    expect(paymentFindOneMock).toHaveBeenCalled();
  });
});
