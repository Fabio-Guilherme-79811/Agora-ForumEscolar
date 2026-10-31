/*
 * search-debounce.js — Feed de perguntas: busca e filtros com debounce, sem recarregar a página.
 * O formulário #form-filtros continua sendo um GET comum para /perguntas (funciona sem JavaScript).
 * Com JavaScript, cada alteração busca o mesmo endereço e troca só a lista e o resumo.
 * Atributos do formulário: data-busca-url, data-alvo (id da lista) e data-resumo (id do resumo).
 * Segurança: o HTML recebido já vem escapado pelo EJS; os nós são importados do documento
 * interpretado pelo DOMParser, sem innerHTML.
 */
(function () {
  'use strict';

  const form = document.getElementById('form-filtros');
  if (!form) return;

  const alvo = document.getElementById(form.dataset.alvo || 'lista-perguntas');
  const resumo = document.getElementById(form.dataset.resumo || 'resumo');
  const campoBusca = document.getElementById('q');
  if (!alvo || !resumo || !campoBusca) return;

  const urlBase = form.dataset.buscaUrl || form.getAttribute('action') || '/perguntas';
  const ESPERA_MS = 350;

  let temporizador = null;
  let controlador = null;
  let ultimaConsulta = parametros();

  function parametros() {
    const dados = new URLSearchParams();
    new FormData(form).forEach(function (valor, chave) {
      const texto = typeof valor === 'string' ? valor.trim() : '';
      if (texto) dados.set(chave, texto);
    });
    return dados.toString();
  }

  function enderecoCom(consulta) {
    return consulta ? urlBase + '?' + consulta : urlBase;
  }

  function atualizarLimpar(documentoNovo) {
    const acoes = form.querySelector('.filtros__acoes');
    if (!acoes) return;
    const atual = acoes.querySelector('.filtros__limpar');
    const novo = documentoNovo.querySelector('.filtros__limpar');
    if (atual && !novo) atual.remove();
    if (!atual && novo) acoes.append(document.importNode(novo, true));
  }

  function aplicar(documentoNovo) {
    const novaLista = documentoNovo.getElementById(alvo.id);
    const novoResumo = documentoNovo.getElementById(resumo.id);
    if (!novaLista || !novoResumo) throw new Error('Resposta inesperada');
    alvo.replaceChildren.apply(
      alvo,
      Array.from(novaLista.childNodes).map(function (no) { return document.importNode(no, true); })
    );
    resumo.textContent = novoResumo.textContent.trim();
    atualizarLimpar(documentoNovo);
  }

  async function buscar() {
    clearTimeout(temporizador);
    const consulta = parametros();
    if (consulta === ultimaConsulta) return;

    if (controlador) controlador.abort();
    controlador = new AbortController();
    const atual = controlador;
    alvo.setAttribute('aria-busy', 'true');

    try {
      const resposta = await fetch(enderecoCom(consulta), {
        credentials: 'same-origin',
        headers: { Accept: 'text/html' },
        signal: atual.signal
      });
      if (resposta.redirected && new URL(resposta.url).pathname === '/login') {
        window.location.assign('/login');
        return;
      }
      if (!resposta.ok) throw new Error('Falha ' + resposta.status);
      const html = await resposta.text();
      aplicar(new DOMParser().parseFromString(html, 'text/html'));
      ultimaConsulta = consulta;
      history.replaceState(null, '', enderecoCom(consulta));
    } catch (erro) {
      if (erro.name === 'AbortError') return;
      resumo.textContent = 'Não foi possível atualizar a lista. Tente novamente.';
    } finally {
      if (controlador === atual) {
        alvo.removeAttribute('aria-busy');
        controlador = null;
      }
    }
  }

  campoBusca.addEventListener('input', function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(buscar, ESPERA_MS);
  });

  form.addEventListener('change', function (evento) {
    if (evento.target === campoBusca) return;
    buscar();
  });

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    buscar();
  });
})();