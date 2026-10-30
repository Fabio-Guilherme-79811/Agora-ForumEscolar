jest.mock('../../entities/models/Dbconnection', () => ({
    run: jest.fn(),
    select: jest.fn(),
    selectOne: jest.fn(),
    isDuplicateError: jest.fn(),
  }));
  
  import { DenunciaRepository } from '../../entities/models/DenunciarRepository';
  import { isDuplicateError, run, select, selectOne } from '../../entities/models/Dbconnection';
  
  const runMock = run as jest.Mock;
  const selectMock = select as jest.Mock;
  const selectOneMock = selectOne as jest.Mock;
  const isDuplicateErrorMock = isDuplicateError as jest.Mock;
  
  describe('DenunciaRepository', () => {
    let repo: DenunciaRepository;
  
    beforeEach(() => {
      jest.clearAllMocks();
      repo = new DenunciaRepository();
    });
  
    describe('criar', () => {
      it('insere a denúncia e retorna true', async () => {
        runMock.mockResolvedValue({ affectedRows: 1 });
  
        const resultado = await repo.criar(1, 'pergunta', 10, 'spam');
  
        expect(resultado).toBe(true);
        expect(runMock).toHaveBeenCalledTimes(1);
        expect(runMock).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO denuncia'),
          [1, 'pergunta', 10, 'spam'],
        );
      });
  
      it('retorna false quando a denúncia já existe (duplicada)', async () => {
        const erroDuplicado = { code: 'ER_DUP_ENTRY' };
        runMock.mockRejectedValue(erroDuplicado);
        isDuplicateErrorMock.mockReturnValue(true);
  
        const resultado = await repo.criar(1, 'pergunta', 10, 'spam');
  
        expect(resultado).toBe(false);
        expect(isDuplicateErrorMock).toHaveBeenCalledWith(erroDuplicado);
      });
  
      it('relança qualquer outro erro', async () => {
        const erro = new Error('conexão perdida');
        runMock.mockRejectedValue(erro);
        isDuplicateErrorMock.mockReturnValue(false);
  
        await expect(repo.criar(1, 'resposta', 5, 'ofensivo')).rejects.toBe(erro);
      });
    });
  
    describe('contarPendentesPorAlvo', () => {
      it('retorna o total vindo do banco', async () => {
        selectOneMock.mockResolvedValue({ total: 3 });
  
        const total = await repo.contarPendentesPorAlvo('pergunta', 10);
  
        expect(total).toBe(3);
        expect(selectOneMock).toHaveBeenCalledWith(
          expect.stringContaining('COUNT(*)'),
          ['pergunta', 10],
        );
      });
  
      it('retorna 0 quando a consulta não devolve linha', async () => {
        selectOneMock.mockResolvedValue(null);
  
        const total = await repo.contarPendentesPorAlvo('resposta', 99);
  
        expect(total).toBe(0);
      });
    });
  
    describe('listarPendentes', () => {
      it('filtra pelas turmas informadas e retorna as linhas', async () => {
        const linhas = [{ id: 1 }, { id: 2 }];
        selectMock.mockResolvedValue(linhas);
  
        const resultado = await repo.listarPendentes([4, 7]);
  
        expect(resultado).toBe(linhas);
        expect(selectMock).toHaveBeenCalledWith(
          expect.stringContaining("d.status = 'pendente'"),
          [[4, 7]],
        );
      });
  
      it('usa [0] quando o professor não tem turmas (evita IN () vazio)', async () => {
        selectMock.mockResolvedValue([]);
  
        const resultado = await repo.listarPendentes([]);
  
        expect(resultado).toEqual([]);
        expect(selectMock).toHaveBeenCalledWith(expect.any(String), [[0]]);
      });
    });
  
    describe('resolver', () => {
      it.each(['mantida', 'removida'] as const)('atualiza o status para %s', async (status) => {
        runMock.mockResolvedValue({ affectedRows: 1 });
  
        await repo.resolver(42, status);
  
        expect(runMock).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE denuncia SET status'),
          [status, 42],
        );
      });
    });
  });