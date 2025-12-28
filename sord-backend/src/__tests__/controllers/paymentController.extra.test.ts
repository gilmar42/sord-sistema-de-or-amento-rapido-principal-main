// Mock paymentService before importing controller (handles .js ESM import)
jest.mock('../../services/paymentService.js', () => ({
  __esModule: true,
  default: {
    processPayment: jest.fn(async () => ({ success: true, data: { id: 'pay_1', status: 'approved' } })),
    getPaymentStatus: jest.fn(async (orderId: string) => ({ success: true, data: { orderId, status: 'approved' } })),
    listPayments: jest.fn(async (_tenant: string, _filters: any) => ({ success: true, data: [] })),
  },
}), { virtual: true });
// Mock logger used by controller ESM imports
jest.mock('../../utils/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}), { virtual: true });

let createPayment: any;
let getPaymentStatus: any;
let listPayments: any;

beforeAll(async () => {
  const mod = await import('../../controllers/paymentController.ts');
  createPayment = mod.createPayment;
  getPaymentStatus = mod.getPaymentStatus;
  listPayments = mod.listPayments;
});

const makeResPayment = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (payload: any) => { (res as any).body = payload; return res; };
  return res;
};

describe('paymentController', () => {
  it('createPayment: 400 on missing required fields', async () => {
    const req: any = { body: { orderId: 'o1' }, ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } }; // missing other required
    const res = makeResPayment();
    await createPayment(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  it('createPayment: 201 on success', async () => {
    const req: any = {
      body: {
        orderId: 'o1', amount: 100, email: 'a@b.com', description: 'desc', token: 'tok', paymentMethodId: 'visa', installments: 1,
      },
      user: { tenantId: 't1' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    };
    const res = makeResPayment();
    await createPayment(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.status).toBe('approved');
  });

  it('getPaymentStatus: 400 when missing orderId', async () => {
    const req: any = { params: {} };
    const res = makeResPayment();
    await getPaymentStatus(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('listPayments: returns success payload', async () => {
    const req: any = { user: { tenantId: 't1' }, query: { status: 'approved', limit: '10', offset: '0' } };
    const res = makeResPayment();
    await listPayments(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
  });
});
