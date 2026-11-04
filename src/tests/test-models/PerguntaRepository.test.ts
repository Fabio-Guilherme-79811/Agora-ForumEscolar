import { PerguntaRepository } from '../../entities/models/PerguntaRepository';
import { run, select, selectOne } from '../../entities/models/Dbconnection';

jest.mock('../../entities/models/Dbconnection', () => ({
  run: jest.fn(),
  select: jest.fn(),
  selectOne: jest.fn(),
}));

const runMock = run as jest.Mock;
const selectMock = select as jest.Mock;
const selectOneMock = selectOne as jest.Mock;

/** Linha "crua" do feed (sem status), com defaults de pergunta aberta. */
const feedRow = (over: Record<string, unknown> = {}) => ({
  id: 1,
  titulo: 'Como resolver derivadas?',
  descricao: 'Não entendi a regra da cadeia',
  materia_id: 1,
  turma_id: 1,
  autor_id: 1,
  autor_nome: 'Ana',
  materia_nome: 'Cálculo',
  total_respostas: 0,
  total_tambem_tenho: 0,
  tem_validada: 0,
  ...over,
});

/** Retorna [sql, params] da última chamada de um mock. */
const ultimaChamada = (mock: jest.Mock): [string, unknown[]] => {
  const calls = mock.mock.calls;
  return calls[calls.length - 1] as [string, unknown[]];
};

describe('PerguntaRepository', () => {
  let repo: PerguntaRepository;

  beforeEach(() => {
    jest.resetAllMocks();
    repo = new PerguntaRepository();
  });

  describe('criar', () => {
    const dados = {
      titulo: 'Dúvida',
      descricao: 'Descrição',
      materia_id: 2,
      turma_id: 3,
      autor_id: 4,
    };

    it('deve inserir a pergunta e retornar o insertId', async () => {
      runMock.mockResolvedValue({ insertId: 10 });

      const id = await repo.criar({ ...dados, anexo: 'arquivo.png' });

      const [sql, params] = ultimaChamada(runMock);
      expect(sql).toContain('INSERT INTO perguntas');
      expect(params).toEqual(['Dúvida', 'Descrição', 2, 3, 4, 'arquivo.png']);
      expect(id).toBe(10);
    });

    it('deve gravar anexo como null quando não informado', async () => {
      runMock.mockResolvedValue({ insertId: 11 });

      await repo.criar(dados);

      const [, params] = ultimaChamada(runMock);
      expect(params[5]).toBeNull();
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar null quando não encontrar', async () => {
      selectOneMock.mockResolvedValue(undefined);

      await expect(repo.buscarPorId(99)).resolves.toBeNull();

      const [sql, params] = ultimaChamada(selectOneMock);
      expect(sql).toContain('WHERE p.id = ?');
      expect(params).toEqual([99]);
    });

    it('deve derivar status "aberta" quando não há respostas', async () => {
      selectOneMock.mockResolvedValue(feedRow());

      const r = await repo.buscarPorId(1);

      expect(r?.status).toBe('aberta');
    });

    it('deve derivar status "respondida" quando há respostas sem validada', async () => {
      selectOneMock.mockResolvedValue(feedRow({ total_respostas: 2 }));

      const r = await repo.buscarPorId(1);

      expect(r?.status).toBe('respondida');
    });

    it('deve derivar status "validada" quando há resposta validada', async () => {
      selectOneMock.mockResolvedValue(
        feedRow({ total_respostas: 2, tem_validada: 1 }),
      );

      const r = await repo.buscarPorId(1);

      expect(r?.status).toBe('validada');
    });

    it('validada tem prioridade sobre o total de respostas', async () => {
      selectOneMock.mockResolvedValue(
        feedRow({ total_respostas: 0, tem_validada: 1 }),
      );

      const r = await repo.buscarPorId(1);

      expect(r?.status).toBe('validada');
    });
  });

  describe('listar', () => {
    beforeEach(() => {
      selectMock.mockResolvedValue([]);
    });

    it('deve usar filtros padrão: turmas, não ocultas, limite 20 e offset 0', async () => {
      await repo.listar({ turmaIds: [1, 2] });

      const [sql, params] = ultimaChamada(selectMock);
      expect(sql).toContain('x.turma_id IN (?)');
      expect(sql).toContain('x.oculta = 0');
      expect(sql).toContain(
        'ORDER BY x.tem_validada ASC, x.criado_em DESC LIMIT ? OFFSET ?',
      );
      expect(params).toEqual([[1, 2], 20, 0]);
    });

    it('deve usar [0] quando turmaIds estiver vazio (evita IN () inválido)', async () => {
      await repo.listar({ turmaIds: [] });

      const [, params] = ultimaChamada(selectMock);
      expect(params[0]).toEqual([0]);
    });

    it('não deve filtrar ocultas quando incluirOcultas for true', async () => {
      await repo.listar({ turmaIds: [1], incluirOcultas: true });

      const [sql] = ultimaChamada(selectMock);
      expect(sql).not.toContain('x.oculta = 0');
    });

    it('deve filtrar por matéria e autor', async () => {
      await repo.listar({ turmaIds: [1], materiaId: 5, autorId: 7 });

      const [sql, params] = ultimaChamada(selectMock);
      expect(sql).toContain('x.materia_id = ?');
      expect(sql).toContain('x.autor_id = ?');
      expect(params).toEqual([[1], 5, 7, 20, 0]);
    });

    it('deve buscar por título/descrição com trim e LIKE', async () => {
      await repo.listar({ turmaIds: [1], busca: '  derivada  ' });

      const [sql, params] = ultimaChamada(selectMock);
      expect(sql).toContain('(x.titulo LIKE ? OR x.descricao LIKE ?)');
      expect(params).toEqual([[1], '%derivada%', '%derivada%', 20, 0]);
    });

    it('deve escapar %, _ e \\ na busca', async () => {
      await repo.listar({ turmaIds: [1], busca: '50%_a\\' });

      const [, params] = ultimaChamada(selectMock);
      expect(params[1]).toBe('%50\\%\\_a\\\\%');
      expect(params[2]).toBe('%50\\%\\_a\\\\%');
    });

    it('deve ignorar busca vazia ou só com espaços', async () => {
      await repo.listar({ turmaIds: [1], busca: '   ' });

      const [sql, params] = ultimaChamada(selectMock);
      expect(sql).not.toContain('LIKE');
      expect(params).toEqual([[1], 20, 0]);
    });

    it('deve filtrar status "validada"', async () => {
      await repo.listar({ turmaIds: [1], status: 'validada' });

      expect(ultimaChamada(selectMock)[0]).toContain('x.tem_validada = 1');
    });

    it('deve filtrar status "respondida"', async () => {
      await repo.listar({ turmaIds: [1], status: 'respondida' });

      expect(ultimaChamada(selectMock)[0]).toContain(
        'x.tem_validada = 0 AND x.total_respostas > 0',
      );
    });

    it('deve filtrar status "aberta"', async () => {
      await repo.listar({ turmaIds: [1], status: 'aberta' });

      expect(ultimaChamada(selectMock)[0]).toContain('x.total_respostas = 0');
    });

    it.each([
      [0, 1],
      [-5, 1],
      [500, 100],
      [30, 30],
    ])('deve limitar o "limite" %i para %i', async (entrada, esperado) => {
      await repo.listar({ turmaIds: [1], limite: entrada });

      const [, params] = ultimaChamada(selectMock);
      expect(params[params.length - 2]).toBe(esperado);
    });

    it('deve usar offset informado e corrigir offset negativo para 0', async () => {
      await repo.listar({ turmaIds: [1], offset: 40 });
      expect(ultimaChamada(selectMock)[1].slice(-1)[0]).toBe(40);

      await repo.listar({ turmaIds: [1], offset: -10 });
      expect(ultimaChamada(selectMock)[1].slice(-1)[0]).toBe(0);
    });

    it('deve mapear o status de cada linha retornada', async () => {
      selectMock.mockResolvedValue([
        feedRow({ id: 1 }),
        feedRow({ id: 2, total_respostas: 1 }),
        feedRow({ id: 3, total_respostas: 1, tem_validada: 1 }),
      ]);

      const r = await repo.listar({ turmaIds: [1] });

      expect(r.map((p) => p.status)).toEqual([
        'aberta',
        'respondida',
        'validada',
      ]);
    });
  });

  describe('buscarSimilares', () => {
    it('deve retornar [] sem consultar o banco quando não houver palavras relevantes', async () => {
      const r = await repo.buscarSimilares(1, 'a de um se');

      expect(r).toEqual([]);
      expect(selectMock).not.toHaveBeenCalled();
    });

    it('deve consultar com LIKE por palavra, turma e limite padrão 5', async () => {
      selectMock.mockResolvedValue([]);

      await repo.buscarSimilares(3, 'Duvida sobre derivada');

      const [sql, params] = ultimaChamada(selectMock);
      expect(sql).toContain('(x.titulo LIKE ?) + (x.titulo LIKE ?) + (x.titulo LIKE ?)');
      expect(sql).toContain('x.turma_id = ? AND x.oculta = 0 HAVING score > 0');
      expect(params).toEqual(['%duvida%', '%sobre%', '%derivada%', 3, 5]);
    });

    it('deve ignorar palavras com 3 letras ou menos', async () => {
      selectMock.mockResolvedValue([]);

      await repo.buscarSimilares(1, 'Como é a derivada');

      const [, params] = ultimaChamada(selectMock);
      expect(params).toEqual(['%como%', '%derivada%', 1, 5]);
    });

    it('deve remover palavras repetidas', async () => {
      selectMock.mockResolvedValue([]);

      await repo.buscarSimilares(1, 'derivada DERIVADA integral');

      const [, params] = ultimaChamada(selectMock);
      expect(params).toEqual(['%derivada%', '%integral%', 1, 5]);
    });

    it('deve usar no máximo 6 palavras', async () => {
      selectMock.mockResolvedValue([]);

      await repo.buscarSimilares(
        1,
        'alpha bravo charlie delta echoo foxtrot golfe hotel',
      );

      const [, params] = ultimaChamada(selectMock);
      // 6 likes + turmaId + limite
      expect(params).toHaveLength(8);
      expect(params).not.toContain('%golfe%');
      expect(params).not.toContain('%hotel%');
    });

    it('deve escapar curingas nas palavras', async () => {
      selectMock.mockResolvedValue([]);

      await repo.buscarSimilares(1, '100%_teste');

      const [, params] = ultimaChamada(selectMock);
      expect(params).toContain('%\\_teste%');
    });

    it('deve respeitar o limite informado e mapear o status', async () => {
      selectMock.mockResolvedValue([feedRow({ total_respostas: 3 })]);

      const r = await repo.buscarSimilares(1, 'derivada', 2);

      expect(ultimaChamada(selectMock)[1].slice(-1)[0]).toBe(2);
      expect(r[0]!.status).toBe('respondida');
    });
  });

  describe('contarPublicadasHoje', () => {
    it('deve retornar o total do banco', async () => {
      selectOneMock.mockResolvedValue({ total: 3 });

      await expect(repo.contarPublicadasHoje(8)).resolves.toBe(3);

      const [sql, params] = ultimaChamada(selectOneMock);
      expect(sql).toContain('criado_em >= CURDATE()');
      expect(params).toEqual([8]);
    });

    it('deve retornar 0 quando não houver resultado', async () => {
      selectOneMock.mockResolvedValue(undefined);

      await expect(repo.contarPublicadasHoje(8)).resolves.toBe(0);
    });
  });

  describe('atualizar', () => {
    it('deve enviar os campos informados', async () => {
      runMock.mockResolvedValue({});

      await repo.atualizar(5, {
        titulo: 'Novo',
        descricao: 'Nova desc',
        materia_id: 2,
        anexo: 'x.pdf',
      });

      const [sql, params] = ultimaChamada(runMock);
      expect(sql).toContain('UPDATE perguntas SET');
      expect(params).toEqual(['Novo', 'Nova desc', 2, 'x.pdf', 5]);
    });

    it('deve enviar null nos campos não informados (COALESCE mantém o valor atual)', async () => {
      runMock.mockResolvedValue({});

      await repo.atualizar(5, { titulo: 'Só título' });

      const [sql, params] = ultimaChamada(runMock);
      expect(sql).toContain('COALESCE(?, titulo)');
      expect(params).toEqual(['Só título', null, null, null, 5]);
    });
  });

  describe('excluir', () => {
    it('deve deletar a pergunta pelo id', async () => {
      runMock.mockResolvedValue({});

      await repo.excluir(9);

      expect(runMock).toHaveBeenCalledWith(
        'DELETE FROM perguntas WHERE id = ?',
        [9],
      );
    });
  });

  describe('marcarResolvida', () => {
    it.each([
      [true, 1],
      [false, 0],
    ])('resolvida=%s deve gravar %i', async (flag, valor) => {
      runMock.mockResolvedValue({});

      await repo.marcarResolvida(4, flag);

      expect(runMock).toHaveBeenCalledWith(
        'UPDATE perguntas SET resolvida = ? WHERE id = ?',
        [valor, 4],
      );
    });
  });

  describe('definirOculta', () => {
    it.each([
      [true, 1],
      [false, 0],
    ])('oculta=%s deve gravar %i', async (flag, valor) => {
      runMock.mockResolvedValue({});

      await repo.definirOculta(4, flag);

      expect(runMock).toHaveBeenCalledWith(
        'UPDATE perguntas SET oculta = ? WHERE id = ?',
        [valor, 4],
      );
    });
  });

  describe('filaSemValidacao', () => {
    it('deve consultar com turmas e limite padrão 50', async () => {
      selectMock.mockResolvedValue([]);

      await repo.filaSemValidacao([1, 2]);

      const [sql, params] = ultimaChamada(selectMock);
      expect(sql).toContain('x.tem_validada = 0');
      expect(sql).toContain('ORDER BY x.total_tambem_tenho DESC, x.criado_em ASC');
      expect(params).toEqual([[1, 2], 50]);
    });

    it('deve usar [0] quando não houver turmas e respeitar o limite informado', async () => {
      selectMock.mockResolvedValue([]);

      await repo.filaSemValidacao([], 10);

      expect(ultimaChamada(selectMock)[1]).toEqual([[0], 10]);
    });

    it('deve mapear o status das linhas', async () => {
      selectMock.mockResolvedValue([
        feedRow({ id: 1 }),
        feedRow({ id: 2, total_respostas: 2 }),
      ]);

      const r = await repo.filaSemValidacao([1]);

      expect(r.map((p) => p.status)).toEqual(['aberta', 'respondida']);
    });
  });

  describe('temperaturaPorMateria', () => {
    const desde = new Date('2026-10-01T00:00:00Z');

    it('deve repetir turmas e data nos parâmetros e retornar as linhas do banco', async () => {
      const linhas = [
        { materia_id: 1, materia_nome: 'Cálculo', perguntas: 4, tambem_tenho: 9 },
      ];
      selectMock.mockResolvedValue(linhas);

      const r = await repo.temperaturaPorMateria([1, 2], desde);

      const [sql, params] = ultimaChamada(selectMock);
      expect(sql).toContain('ORDER BY m.nome');
      expect(params).toEqual([[1, 2], desde, [1, 2], desde]);
      expect(r).toEqual(linhas);
    });

    it('deve usar [0] quando não houver turmas', async () => {
      selectMock.mockResolvedValue([]);

      await repo.temperaturaPorMateria([], desde);

      expect(ultimaChamada(selectMock)[1]).toEqual([[0], desde, [0], desde]);
    });
  });

  describe('tempoMedioAteValidacaoMin', () => {
    const desde = new Date('2026-10-01T00:00:00Z');

    it('deve converter a média (string) para número', async () => {
      selectOneMock.mockResolvedValue({ media: '12.5' });

      await expect(repo.tempoMedioAteValidacaoMin([1], desde)).resolves.toBe(12.5);

      const [sql, params] = ultimaChamada(selectOneMock);
      expect(sql).toContain('TIMESTAMPDIFF(MINUTE');
      expect(params).toEqual([[1], desde]);
    });

    it('deve retornar 0 quando a média for "0"', async () => {
      selectOneMock.mockResolvedValue({ media: '0' });

      await expect(repo.tempoMedioAteValidacaoMin([1], desde)).resolves.toBe(0);
    });

    it('deve retornar null quando a média for null', async () => {
      selectOneMock.mockResolvedValue({ media: null });

      await expect(repo.tempoMedioAteValidacaoMin([1], desde)).resolves.toBeNull();
    });

    it('deve retornar null quando não houver linha', async () => {
      selectOneMock.mockResolvedValue(undefined);

      await expect(repo.tempoMedioAteValidacaoMin([1], desde)).resolves.toBeNull();
    });

    it('deve usar [0] quando não houver turmas', async () => {
      selectOneMock.mockResolvedValue({ media: null });

      await repo.tempoMedioAteValidacaoMin([], desde);

      expect(ultimaChamada(selectOneMock)[1]).toEqual([[0], desde]);
    });
  });
});