/*
 * pergunta-fetch.js — Tela Nova pergunta: sugestão de perguntas parecidas
 * enquanto o título é digitado (RN-23), contador de caracteres, validação
 * visual (RN-21) e publicação sem recarregar a página.
 * Depende de main.js (window.Agora). Rotas usadas:
 *   GET  /perguntas/similares?titulo=...&materia=...  -> { similares: [...] }
 *   POST /perguntas (multipart)  -> { redirect } ou { erros } / { erro }
 * Segurança: textos vindos do servidor entram só com textContent.
 */
(function () {
  'use strict';

  const form = document.getElementById('form-pergunta');
  if (!form) return;

  const Agora = window.Agora;
  const titulo = document.getElementById('titulo');
  const materia = document.getElementById('materia');
  const descricao = document.getElementById('descricao');
  const contador = document.getElementById('contador-titulo');
  const painel = document.getElementById('similares');
  const lista = document.getElementById('similares-lista');
  const confirmacao = document.getElementById('confirma-diferente');
  const botao = form.querySelector('button[type="submit"]');

  const TITULO_MIN = 10;
  const TITULO_MAX = 120;
  const DESCRICAO_MIN = 20;
  const ESPERA_MS = 400;

  let temporizador = null;
  let controlador = null;

  function mostrarErro(campo, mensagem) {
    const alvo = document.getElementById('erro-' + campo);
    const entrada = document.getElementById(campo);
    if (alvo) {
      alvo.textContent = mensagem;
      alvo.hidden = false;
    }
    if (entrada) entrada.setAttribute('aria-invalid', 'true');
  }

  function limparErros() {
    form.querySelectorAll('.campo__erro').forEach(function (el) {
      el.textContent = '';
      el.hidden = true;
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
      el.setAttribute('aria-invalid', 'false');
    });
  }

  function aplicarErros(erros) {
    const campos = Object.keys(erros);
    campos.forEach(function (campo) { mostrarErro(campo, erros[campo]); });
    if (campos.length > 0) {
      const primeiro = document.getElementById(campos[0]);
      if (primeiro) primeiro.focus();
    }
    return campos.length > 0;
  }

  function validarLocal() {
    const erros = {};
    const tamanhoTitulo = titulo.value.trim().length;
    if (tamanhoTitulo < TITULO_MIN || tamanhoTitulo > TITULO_MAX) {
      erros.titulo = 'O título deve ter entre 10 e 120 caracteres.';
    }
    if (!materia.value) erros.materia = 'Escolha a disciplina.';
    if (descricao.value.trim().length < DESCRICAO_MIN) {
      erros.descricao = 'A descrição precisa ter pelo menos 20 caracteres.';
    }
    if (!painel.hidden && !confirmacao.checked) {
      erros['confirma-diferente'] = 'Confirme que a sua dúvida é diferente das perguntas acima.';
    }
    return erros;
  }

  function esconderSimilares() {
    painel.hidden = true;
    lista.textContent = '';
    confirmacao.checked = false;
  }

  function criarItem(item) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '/perguntas/' + encodeURIComponent(item.id);
    link.textContent = item.titulo;
    const meta = document.createElement('span');
    meta.className = 'similares__meta';
    const total = Number(item.totalTambemTenho) || 0;
    meta.textContent = item.materia + ' · ' +
      (total === 1 ? '1 colega também tem' : total + ' colegas também têm') + ' essa dúvida';
    li.append(link, meta);
    return li;
  }

  async function buscarSimilares() {
    const texto = titulo.value.trim();
    if (texto.length < TITULO_MIN) {
      esconderSimilares();
      return;
    }
    if (controlador) controlador.abort();
    controlador = new AbortController();
    painel.setAttribute('aria-busy', 'true');
    try {
      const consulta = '?titulo=' + encodeURIComponent(texto) +
        '&materia=' + encodeURIComponent(materia.value);
      const resposta = await Agora.api(titulo.dataset.similaresUrl + consulta, {
        signal: controlador.signal
      });
      if (!resposta.ok) {
        esconderSimilares();
        return;
      }
      const itens = resposta.dados.similares || [];
      lista.textContent = '';
      itens.forEach(function (item) { lista.append(criarItem(item)); });
      painel.hidden = itens.length === 0;
      if (itens.length === 0) confirmacao.checked = false;
    } catch (erro) {
      // Falha na sugestão nunca bloqueia a publicação
      if (erro.name !== 'AbortError') esconderSimilares();
    } finally {
      painel.removeAttribute('aria-busy');
    }
  }

  titulo.addEventListener('input', function () {
    contador.textContent = titulo.value.length + '/' + TITULO_MAX;
    clearTimeout(temporizador);
    temporizador = setTimeout(buscarSimilares, ESPERA_MS);
  });
  materia.addEventListener('change', buscarSimilares);

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    limparErros();
    if (aplicarErros(validarLocal())) return;

    Agora.carregando(botao, true);
    try {
      const resposta = await Agora.api(form.action, { method: 'POST', body: new FormData(form) });
      if (resposta.ok && resposta.dados.redirect) {
        Agora.toast('Pergunta publicada.', 'sucesso');
        window.location.assign(resposta.dados.redirect);
        return;
      }
      if (resposta.dados.erros) {
        aplicarErros(resposta.dados.erros);
        return;
      }
      Agora.toast(resposta.dados.erro || 'Não foi possível publicar a pergunta.', 'erro');
    } catch (erro) {
      Agora.toast('Sem conexão. Tente novamente.', 'erro');
    } finally {
      Agora.carregando(botao, false);
    }
  });
})();