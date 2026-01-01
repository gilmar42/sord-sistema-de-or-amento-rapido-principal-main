// Mocks compartilhados para o modelo Plan e logger
const planFindMock = jest.fn();
const planFindByIdMock = jest.fn();
const planFindOneMock = jest.fn();
const planCountMock = jest.fn();
const planInsertManyMock = jest.fn();

jest.mock('../../db/models.js', () => {
  const Plan: any = jest.fn();
  Plan.find = planFindMock;
  Plan.findById = planFindByIdMock;
  Plan.findOne = planFindOneMock;
  Plan.countDocuments = planCountMock;
  Plan.insertMany = planInsertManyMock;

  return { __esModule: true, Plan };
}, { virtual: true });

jest.mock('../../utils/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}), { virtual: true });

describe('PlanService', () => {
  let planService: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import('../../services/planService');
    planService = mod.default;
  });

  it('getActivePlans: retorna planos ativos ordenados por preço', async () => {
    const fakePlans = [{ displayName: 'A', price: 10 }, { displayName: 'B', price: 20 }];
    planFindMock.mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakePlans),
    });

    const result = await planService.getActivePlans();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(fakePlans);
    expect(planFindMock).toHaveBeenCalledWith({ active: true });
  });

  it('getActivePlans: retorna erro quando consulta falha', async () => {
    planFindMock.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('db down')),
    });

    const result = await planService.getActivePlans();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao obter planos');
  });

  it('getPlanById: retorna erro quando plano não existe', async () => {
    planFindByIdMock.mockResolvedValue(null);

    const result = await planService.getPlanById('missing');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Plano não encontrado');
  });

  it('getPlanByName: retorna plano ativo pelo nome', async () => {
    const planDoc = { _id: '1', name: 'STANDARD' };
    planFindOneMock.mockResolvedValue(planDoc);

    const result = await planService.getPlanByName('STANDARD');

    expect(planFindOneMock).toHaveBeenCalledWith({ name: 'STANDARD', active: true });
    expect(result.success).toBe(true);
    expect(result.data).toBe(planDoc);
  });

  it('initializeDefaultPlans: evita duplicar quando já existem planos', async () => {
    planCountMock.mockResolvedValue(2);

    const result = await planService.initializeDefaultPlans();

    expect(result).toEqual({ success: true, message: 'Planos já existem' });
    expect(planInsertManyMock).not.toHaveBeenCalled();
  });

  it('initializeDefaultPlans: cria dois planos padrão quando base está vazia', async () => {
    planCountMock.mockResolvedValue(0);
    planInsertManyMock.mockResolvedValue(undefined);

    const result = await planService.initializeDefaultPlans();

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
    expect(planInsertManyMock).toHaveBeenCalledTimes(1);
    const plansArg = planInsertManyMock.mock.calls[0][0];
    expect(plansArg).toHaveLength(2);
    expect(plansArg.every((p: any) => p.name === 'STANDARD')).toBe(true);
  });

  it('getPlanById: retorna erro genérico ao lançar exceção', async () => {
    planFindByIdMock.mockRejectedValue(new Error('db offline'));

    const result = await planService.getPlanById('123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro ao obter plano');
  });
});

