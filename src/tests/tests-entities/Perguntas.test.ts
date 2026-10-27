import {Pergunta,PerguntaProps,TITULO_MIN,TITULO_MAX,DESCRICAO_MIN,LIMITE_PERGUNTAS_POR_DIA,LIMITE_TAMBEM_TENHO_DESTAQUE,} from '../../entities/Perguntas';
  import { ErroDePermissao, ErroDeValidacao } from '../../entities/erros';

  const propsValidas = (extra: Partial<PerguntaProps> = {}): PerguntaProps => ({
    titulo: 'Como resolver equações do 2º grau?',
    descricao: 'Preciso de ajuda para entender o passo da fórmula de Bhaskara.',
    materiaId: 1,
    turmaId: 2,
    autorId: 3,
    ...extra,
  });

  const criarPergunta = (extra: Partial<PerguntaProps> = {}): Pergunta =>
    new Pergunta(propsValidas(extra));

  describe('constantes', () => {
    it('deve expor os limites das regras de negócio', () => {
      expect(TITULO_MIN).toBe(10);
      expect(TITULO_MAX).toBe(120);
      expect(DESCRICAO_MIN).toBe(20);
      expect(LIMITE_PERGUNTAS_POR_DIA).toBe(5);
      expect(LIMITE_TAMBEM_TENHO_DESTAQUE).toBe(5);
    });
  });

  describe('Pergunta', () => {
    describe('constructor', () => {
      it('deve atribuir os campos obrigatórios', () => {
        const p = criarPergunta();

        expect(p.titulo).toBe('Como resolver equações do 2º grau?');
        expect(p.descricao).toBe('Preciso de ajuda para entender o passo da fórmula de Bhaskara.');
        expect(p.materiaId).toBe(1);
        expect(p.turmaId).toBe(2);
        expect(p.autorId).toBe(3);
      });

      it('deve deixar id indefinido quando não informado', () => {
        expect(criarPergunta().id).toBeUndefined();
      });

      it('deve atribuir id quando informado', () => {
        expect(criarPergunta({ id: 10 }).id).toBe(10);
      });

      it('deve aplicar trim em título e descrição', () => {
        const p = criarPergunta({
          titulo: '   Título com espaços   ',
          descricao: '   Descrição com espaços   ',
        });

        expect(p.titulo).toBe('Título com espaços');
        expect(p.descricao).toBe('Descrição com espaços');
      });

      it('deve transformar título e descrição nulos em string vazia', () => {
        const p = criarPergunta({
          titulo: undefined as unknown as string,
          descricao: undefined as unknown as string,
        });

        expect(p.titulo).toBe('');
        expect(p.descricao).toBe('');
      });

      it('deve usar valores padrão para os campos opcionais', () => {
        const p = criarPergunta();

        expect(p.anexoUrl).toBeNull();
        expect(p.resolvidaPeloAutor).toBe(false);
        expect(p.oculta).toBe(false);
        expect(p.totalRespostas).toBe(0);
        expect(p.totalDuvidaCompartilhada).toBe(0);
        expect(p.temRespostaValidada).toBe(false);
      });

      it('deve atribuir os campos opcionais quando informados', () => {
        const p = criarPergunta({
          anexoUrl: 'https://exemplo.com/arquivo.pdf',
          resolvidaPeloAutor: true,
          oculta: true,
          totalRespostas: 4,
          totalDuvidaCompartilhada: 2,
          temRespostaValidada: true,
        });

        expect(p.anexoUrl).toBe('https://exemplo.com/arquivo.pdf');
        expect(p.resolvidaPeloAutor).toBe(true);
        expect(p.oculta).toBe(true);
        expect(p.totalRespostas).toBe(4);
        expect(p.totalDuvidaCompartilhada).toBe(2);
        expect(p.temRespostaValidada).toBe(true);
      });

      it('deve transformar anexoUrl nulo em null', () => {
        expect(criarPergunta({ anexoUrl: null }).anexoUrl).toBeNull();
      });

      it('deve usar a data atual quando criadoEm não é informado', () => {
        const antes = new Date();
        const p = criarPergunta();
        const depois = new Date();

        expect(p.criadoEm).toBeInstanceOf(Date);
        expect(p.criadoEm.getTime()).toBeGreaterThanOrEqual(antes.getTime());
        expect(p.criadoEm.getTime()).toBeLessThanOrEqual(depois.getTime());
      });

      it('deve manter criadoEm quando recebe um Date', () => {
        const data = new Date('2026-01-15T10:00:00.000Z');
        const p = criarPergunta({ criadoEm: data });

        expect(p.criadoEm.getTime()).toBe(data.getTime());
      });

      it('deve converter criadoEm e atualizadoEm quando recebe strings', () => {
        const p = criarPergunta({
          criadoEm: '2026-01-15T10:00:00.000Z',
          atualizadoEm: '2026-02-20T08:30:00.000Z',
        });

        expect(p.criadoEm).toBeInstanceOf(Date);
        expect(p.criadoEm.toISOString()).toBe('2026-01-15T10:00:00.000Z');
        expect(p.atualizadoEm).toBeInstanceOf(Date);
        expect(p.atualizadoEm.toISOString()).toBe('2026-02-20T08:30:00.000Z');
      });

      it('deve usar criadoEm como atualizadoEm quando este não é informado', () => {
        const data = new Date('2026-01-15T10:00:00.000Z');
        const p = criarPergunta({ criadoEm: data });

        expect(p.atualizadoEm.getTime()).toBe(data.getTime());
      });
    });

    describe('getters e setters', () => {
      it('deve permitir definir e limpar o id', () => {
        const p = criarPergunta();

        p.id = 99;
        expect(p.id).toBe(99);

        p.id = undefined;
        expect(p.id).toBeUndefined();
      });

      it('deve aplicar trim ao alterar o título', () => {
        const p = criarPergunta();

        p.titulo = '   Novo título da pergunta   ';

        expect(p.titulo).toBe('Novo título da pergunta');
      });

      it('deve transformar título nulo em string vazia ao alterar', () => {
        const p = criarPergunta();

        p.titulo = undefined as unknown as string;

        expect(p.titulo).toBe('');
      });

      it('deve aplicar trim ao alterar a descrição', () => {
        const p = criarPergunta();

        p.descricao = '   Nova descrição bem detalhada   ';

        expect(p.descricao).toBe('Nova descrição bem detalhada');
      });

      it('deve transformar descrição nula em string vazia ao alterar', () => {
        const p = criarPergunta();

        p.descricao = undefined as unknown as string;

        expect(p.descricao).toBe('');
      });

      it('deve permitir alterar a matéria', () => {
        const p = criarPergunta();

        p.materiaId = 8;

        expect(p.materiaId).toBe(8);
      });

      it('deve permitir alterar e limpar o anexo', () => {
        const p = criarPergunta();

        p.anexoUrl = 'https://exemplo.com/img.png';
        expect(p.anexoUrl).toBe('https://exemplo.com/img.png');

        p.anexoUrl = null;
        expect(p.anexoUrl).toBeNull();
      });

      it('deve permitir alterar os agregados', () => {
        const p = criarPergunta();

        p.totalRespostas = 3;
        p.totalDuvidaCompartilhada = 6;
        p.temRespostaValidada = true;

        expect(p.totalRespostas).toBe(3);
        expect(p.totalDuvidaCompartilhada).toBe(6);
        expect(p.temRespostaValidada).toBe(true);
      });
    });

    describe('status', () => {
      it('deve ser "aberta" quando não há respostas', () => {
        expect(criarPergunta().status).toBe('aberta');
      });

      it('deve ser "respondida" quando há respostas e nenhuma validada', () => {
        expect(criarPergunta({ totalRespostas: 2 }).status).toBe('respondida');
      });

      it('deve ser "validada" quando há resposta validada', () => {
        expect(criarPergunta({ totalRespostas: 2, temRespostaValidada: true }).status).toBe(
          'validada',
        );
      });

      it('deve priorizar "validada" sobre "respondida"', () => {
        const p = criarPergunta({ totalRespostas: 1 });
        expect(p.status).toBe('respondida');

        p.temRespostaValidada = true;
        expect(p.status).toBe('validada');
      });

      it('deve atualizar o status quando os agregados mudam', () => {
        const p = criarPergunta();
        expect(p.status).toBe('aberta');

        p.totalRespostas = 1;
        expect(p.status).toBe('respondida');
      });

      it('não deve considerar "resolvida pelo autor" como validação (RN-19)', () => {
        const p = criarPergunta({ autorId: 3, totalRespostas: 1 });

        p.marcarComoResolvida(3);

        expect(p.resolvidaPeloAutor).toBe(true);
        expect(p.status).toBe('respondida');
      });
    });

    describe('precisaDestaque', () => {
      it('deve ser false sem "também tenho"', () => {
        expect(criarPergunta().precisaDestaque()).toBe(false);
      });

      it('deve ser false logo abaixo do limite', () => {
        const p = criarPergunta({ totalDuvidaCompartilhada: LIMITE_TAMBEM_TENHO_DESTAQUE - 1 });

        expect(p.precisaDestaque()).toBe(false);
      });

      it('deve ser true exatamente no limite', () => {
        const p = criarPergunta({ totalDuvidaCompartilhada: LIMITE_TAMBEM_TENHO_DESTAQUE });

        expect(p.precisaDestaque()).toBe(true);
      });

      it('deve ser true acima do limite', () => {
        const p = criarPergunta({ totalDuvidaCompartilhada: LIMITE_TAMBEM_TENHO_DESTAQUE + 10 });

        expect(p.precisaDestaque()).toBe(true);
      });

      it('deve ser false quando já existe resposta validada', () => {
        const p = criarPergunta({
          totalDuvidaCompartilhada: LIMITE_TAMBEM_TENHO_DESTAQUE + 3,
          temRespostaValidada: true,
        });

        expect(p.precisaDestaque()).toBe(false);
      });
    });

    describe('podeSerEditadaPor', () => {
      it('deve permitir ao autor quando não há respostas', () => {
        expect(criarPergunta({ autorId: 3 }).podeSerEditadaPor(3)).toBe(true);
      });

      it('não deve permitir ao autor quando já há respostas', () => {
        expect(criarPergunta({ autorId: 3, totalRespostas: 1 }).podeSerEditadaPor(3)).toBe(false);
      });

      it('não deve permitir a quem não é o autor', () => {
        expect(criarPergunta({ autorId: 3 }).podeSerEditadaPor(4)).toBe(false);
      });

      it('não deve permitir a quem não é o autor mesmo com respostas', () => {
        expect(criarPergunta({ autorId: 3, totalRespostas: 2 }).podeSerEditadaPor(4)).toBe(false);
      });
    });

    describe('marcarComoResolvida', () => {
      it('deve marcar como resolvida quando o usuário é o autor', () => {
        const p = criarPergunta({ autorId: 3 });

        p.marcarComoResolvida(3);

        expect(p.resolvidaPeloAutor).toBe(true);
      });

      it('deve lançar ErroDePermissao quando o usuário não é o autor', () => {
        const p = criarPergunta({ autorId: 3 });

        expect(() => p.marcarComoResolvida(4)).toThrow(ErroDePermissao);
        expect(() => p.marcarComoResolvida(4)).toThrow(/Somente o autor/);
      });

      it('não deve alterar o estado quando o usuário não é o autor', () => {
        const p = criarPergunta({ autorId: 3 });

        try {
          p.marcarComoResolvida(4);
        } catch {
          // esperado
        }

        expect(p.resolvidaPeloAutor).toBe(false);
      });
    });

    describe('ocultar e reexibir', () => {
      it('deve ocultar a pergunta', () => {
        const p = criarPergunta();

        p.ocultar();

        expect(p.oculta).toBe(true);
      });

      it('deve reexibir a pergunta oculta', () => {
        const p = criarPergunta({ oculta: true });

        p.reexibir();

        expect(p.oculta).toBe(false);
      });

      it('deve ser idempotente ao ocultar duas vezes', () => {
        const p = criarPergunta();

        p.ocultar();
        p.ocultar();

        expect(p.oculta).toBe(true);
      });
    });

    describe('validar', () => {
      it('não deve lançar erro para dados válidos', () => {
        expect(() => criarPergunta().validar()).not.toThrow();
      });

      it('deve aceitar título com exatamente o tamanho mínimo', () => {
        expect(() => criarPergunta({ titulo: 'a'.repeat(TITULO_MIN) }).validar()).not.toThrow();
      });

      it('deve aceitar título com exatamente o tamanho máximo', () => {
        expect(() => criarPergunta({ titulo: 'a'.repeat(TITULO_MAX) }).validar()).not.toThrow();
      });

      it('deve aceitar descrição com exatamente o tamanho mínimo', () => {
        expect(() =>
          criarPergunta({ descricao: 'a'.repeat(DESCRICAO_MIN) }).validar(),
        ).not.toThrow();
      });

      it('deve lançar ErroDeValidacao quando o título é curto demais', () => {
        const p = criarPergunta({ titulo: 'a'.repeat(TITULO_MIN - 1) });

        expect(() => p.validar()).toThrow(ErroDeValidacao);
        expect(() => p.validar()).toThrow(/título deve ter entre 10 e 120 caracteres/);
      });

      it('deve lançar ErroDeValidacao quando o título é longo demais', () => {
        const p = criarPergunta({ titulo: 'a'.repeat(TITULO_MAX + 1) });

        expect(() => p.validar()).toThrow(ErroDeValidacao);
        expect(() => p.validar()).toThrow(/título deve ter entre 10 e 120 caracteres/);
      });

      it('deve lançar ErroDeValidacao quando o título só tem espaços', () => {
        expect(() => criarPergunta({ titulo: '            ' }).validar()).toThrow(ErroDeValidacao);
      });

      it('deve lançar ErroDeValidacao quando a descrição é curta demais', () => {
        const p = criarPergunta({ descricao: 'a'.repeat(DESCRICAO_MIN - 1) });

        expect(() => p.validar()).toThrow(ErroDeValidacao);
        expect(() => p.validar()).toThrow(/descrição deve ter no mínimo 20 caracteres/);
      });

      it('deve lançar ErroDeValidacao quando a matéria não é informada', () => {
        const p = criarPergunta({ materiaId: 0 });

        expect(() => p.validar()).toThrow(ErroDeValidacao);
        expect(() => p.validar()).toThrow(/matéria é obrigatória/);
      });

      it('deve lançar ErroDeValidacao quando a turma não é informada', () => {
        const p = criarPergunta({ turmaId: 0 });

        expect(() => p.validar()).toThrow(ErroDeValidacao);
        expect(() => p.validar()).toThrow(/turma é obrigatória/);
      });

      it('deve lançar ErroDeValidacao quando o autor não é informado', () => {
        const p = criarPergunta({ autorId: 0 });

        expect(() => p.validar()).toThrow(ErroDeValidacao);
        expect(() => p.validar()).toThrow(/autor é obrigatório/);
      });

      it('deve acumular todos os erros em uma única exceção', () => {
        const p = criarPergunta({
          titulo: 'curto',
          descricao: 'curta',
          materiaId: 0,
          turmaId: 0,
          autorId: 0,
        });

        try {
          p.validar();
          throw new Error('Deveria ter lançado ErroDeValidacao');
        } catch (e) {
          expect(e).toBeInstanceOf(ErroDeValidacao);
          expect((e as ErroDeValidacao).erros).toEqual([
            'O título deve ter entre 10 e 120 caracteres.',
            'A descrição deve ter no mínimo 20 caracteres.',
            'A matéria é obrigatória.',
            'A turma é obrigatória.',
            'O autor é obrigatório.',
          ]);
        }
      });
    });

    describe('fromJSON', () => {
      it('deve reconstruir a entity a partir de um JSON', () => {
        const p = Pergunta.fromJSON(
          propsValidas({
            id: 7,
            anexoUrl: 'https://exemplo.com/a.pdf',
            resolvidaPeloAutor: true,
            oculta: true,
            criadoEm: '2026-03-01T12:00:00.000Z',
            atualizadoEm: '2026-03-02T12:00:00.000Z',
            totalRespostas: 2,
            totalDuvidaCompartilhada: 6,
            temRespostaValidada: false,
          }),
        );

        expect(p).toBeInstanceOf(Pergunta);
        expect(p.id).toBe(7);
        expect(p.anexoUrl).toBe('https://exemplo.com/a.pdf');
        expect(p.resolvidaPeloAutor).toBe(true);
        expect(p.oculta).toBe(true);
        expect(p.criadoEm.toISOString()).toBe('2026-03-01T12:00:00.000Z');
        expect(p.atualizadoEm.toISOString()).toBe('2026-03-02T12:00:00.000Z');
        expect(p.totalRespostas).toBe(2);
        expect(p.totalDuvidaCompartilhada).toBe(6);
      });

      it('deve aceitar JSON apenas com os campos obrigatórios', () => {
        const p = Pergunta.fromJSON(propsValidas());

        expect(p.id).toBeUndefined();
        expect(p.status).toBe('aberta');
        expect(p.criadoEm).toBeInstanceOf(Date);
      });
    });

    describe('toJSON', () => {
      it('deve serializar todos os campos, incluindo status e destaque', () => {
        const criado = new Date('2026-03-01T12:00:00.000Z');
        const atualizado = new Date('2026-03-02T12:00:00.000Z');
        const p = criarPergunta({
          id: 7,
          anexoUrl: 'https://exemplo.com/a.pdf',
          resolvidaPeloAutor: true,
          oculta: false,
          criadoEm: criado,
          atualizadoEm: atualizado,
          totalRespostas: 2,
          totalDuvidaCompartilhada: 6,
        });

        expect(p.toJSON()).toEqual({
          id: 7,
          titulo: 'Como resolver equações do 2º grau?',
          descricao: 'Preciso de ajuda para entender o passo da fórmula de Bhaskara.',
          materiaId: 1,
          turmaId: 2,
          autorId: 3,
          anexoUrl: 'https://exemplo.com/a.pdf',
          resolvidaPeloAutor: true,
          oculta: false,
          criadoEm: criado,
          atualizadoEm: atualizado,
          totalRespostas: 2,
          totalDuvidaCompartilhada: 6,
          status: 'respondida',
          destaque: true,
        });
      });

      it('deve serializar id como undefined quando não definido', () => {
        expect(criarPergunta().toJSON().id).toBeUndefined();
      });

      it('deve refletir status "validada" e destaque false', () => {
        const json = criarPergunta({
          totalRespostas: 1,
          totalDuvidaCompartilhada: 10,
          temRespostaValidada: true,
        }).toJSON();

        expect(json.status).toBe('validada');
        expect(json.destaque).toBe(false);
      });

      it('deve ser compatível com JSON.stringify', () => {
        const criado = new Date('2026-03-01T12:00:00.000Z');
        const p = criarPergunta({ id: 7, criadoEm: criado, atualizadoEm: criado });

        const obj = JSON.parse(JSON.stringify(p));

        expect(obj.id).toBe(7);
        expect(obj.criadoEm).toBe('2026-03-01T12:00:00.000Z');
        expect(obj.status).toBe('aberta');
        expect(obj.destaque).toBe(false);
      });

      it('deve fazer round-trip com fromJSON preservando os campos persistidos', () => {
        const original = criarPergunta({
          id: 3,
          anexoUrl: 'https://exemplo.com/a.pdf',
          totalRespostas: 1,
          totalDuvidaCompartilhada: 2,
        });

        const copia = Pergunta.fromJSON(original.toJSON());

        expect(copia.toJSON()).toEqual(original.toJSON());
      });
    });
  });
