// Mock planService before importing controller (handles .js ESM import)
jest.mock('../../services/planService.js', () => ({
  __esModule: true,
  default: {
    getActivePlans: jest.fn(async () => ({ success: true, data: [{ _id: '1' }] })),
    getPlanById: jest.fn(async (id: string) => ({ success: true, data: { _id: id } })),
    initializeDefaultPlans: jest.fn(async () => ({ success: true, data: 2 })),
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

let listPlans: any;
let getPlan: any;
let initializePlans: any;

beforeAll(async () => {
  const mod = await import('../../controllers/planController.ts');
  listPlans = mod.listPlans;
  getPlan = mod.getPlan;
  initializePlans = mod.initializePlans;
});

const makeResPlan = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (payload: any) => { (res as any).body = payload; return res; };
  return res;
};

describe('planController', () => {
  it('listPlans: returns active plans', async () => {
    const req: any = {};
    const res = makeResPlan();
    await listPlans(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
  });

  it('getPlan: 400 when missing planId', async () => {
    const req: any = { params: {} };
    const res = makeResPlan();
    await getPlan(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  it('initializePlans: 403 when not admin', async () => {
    const req: any = { user: { role: 'user' } };
    const res = makeResPlan();
    await initializePlans(req, res);
    expect(res.statusCode).toBe(403);
  });
});
