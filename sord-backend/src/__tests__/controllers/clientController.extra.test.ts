// Mock Client model before importing controller (handles .js ESM import)
const saveMock = jest.fn(async () => undefined);

// Chainable mocks for find/sort/select
const selectMock = jest.fn(async () => [{ _id: '1', name: 'Client A' }]);
const sortMock = jest.fn(() => ({ select: selectMock }));
const findMock = jest.fn(() => ({ sort: sortMock }));
const findOneMock = jest.fn(async () => null);

jest.mock('../../db/models.js', () => ({
  Client: jest.fn().mockImplementation((data: any) => ({ ...data, save: saveMock })),
}), { virtual: true });

// Override static methods on the mocked Client
const { Client } = jest.requireMock('../../db/models.js');
(Client as any).find = findMock;
(Client as any).findOne = findOneMock;

let createClient: any;
let listClients: any;
let getClient: any;

beforeAll(async () => {
  const mod = await import('../../controllers/clientController.ts');
  createClient = mod.createClient;
  listClients = mod.listClients;
  getClient = mod.getClient;
});

const makeResClient = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (payload: any) => { (res as any).body = payload; return res; };
  return res;
};

describe('clientController', () => {
  beforeEach(() => {
    saveMock.mockClear();
    selectMock.mockClear();
    sortMock.mockClear();
    findMock.mockClear();
    findOneMock.mockClear();
  });

  it('createClient: 400 on validation error', async () => {
    const req: any = { body: { email: 'x@y.com', phone: '123' }, user: { tenantId: 't1' } }; // missing name
    const res = makeResClient();
    await createClient(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBe(false);
  });

  it('createClient: 201 on success', async () => {
    const req: any = { body: { name: 'John', email: 'x@y.com', phone: '123' }, user: { tenantId: 't1' } };
    const res = makeResClient();
    await createClient(req, res);
    expect(saveMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body?.success).toBe(true);
  });

  it('listClients: returns sorted list', async () => {
    const req: any = { user: { tenantId: 't1' }, query: {} };
    const res = makeResClient();
    await listClients(req, res);
    expect(findMock).toHaveBeenCalled();
    expect(sortMock).toHaveBeenCalled();
    expect(selectMock).toHaveBeenCalled();
    expect(res.body?.success).toBe(true);
    expect(Array.isArray(res.body?.data)).toBe(true);
  });

  it('getClient: 404 when not found', async () => {
    findOneMock.mockResolvedValueOnce(null);
    const req: any = { params: { id: 'c1' }, user: { tenantId: 't1' } };
    const res = makeResClient();
    await getClient(req, res);
    expect(findOneMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(404);
  });
});
