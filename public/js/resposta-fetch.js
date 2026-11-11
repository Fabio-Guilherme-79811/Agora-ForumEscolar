/*
 * resposta-fetch.js — Tela Pergunta aberta: responder, votar "útil" e validar
 * ou retirar a validação, tudo sem recarregar a página (loading state no botão).
 * Depende de main.js (window.Agora). Rotas usadas:
 *   POST   /perguntas/:id/respostas   { conteudo }  (RN-14)
 *   POST   /respostas/:id/util        -> { ativo, total }  (RN-16)
 *   PUT    /respostas/:id/validacao   (Professor ou Monitor — RN-17)
 *   DELETE /respostas/:id/validacao   (só Professor — RN-20)
 * Depois de responder ou mudar a validação, busca a mesma página de novo e
 * troca os blocos #estado-pergunta e #bloco-respostas (HTML já escapado pelo
 * EJS no servidor). O voto "útil" só atualiza o botão.
 */
(function () {
    'use strict';
  
    const Agora = window.Agora;
    const IDS_BLOCOS = ['estado-pergunta', 'bloco-respostas'];
  
    async function atualizarBlocos() {
      const resposta = await fetch(window.location.href, {
        credentials: 'same-origin',
        headers: { Accept: 'text/html' }
      });
      if (!resposta.ok) {
        window.location.reload();
        return;
      }
      const html = await resposta.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      if (!doc.getElementById('bloco-respostas')) {
        window.location.reload();
        return;
      }
      IDS_BLOCOS.forEach(function (id) {
        const novo = doc.getElementById(id);
        const atual = document.getElementById(id);
        if (novo && atual) atual.replaceWith(document.importNode(novo, true));
      });
    }
  
    function atualizarVoto(botao, dados) {
      botao.setAttribute('aria-pressed', dados.ativo ? 'true' : 'false');
      const total = botao.querySelector('.botao-marca__total');
      if (total) total.textContent = dados.total;
    }
  
    const ACOES = {
      'votar-util': {
        metodo: 'POST',
        concluir: async function (botao, dados) { atualizarVoto(botao, dados); }
      },
      'validar': {
        metodo: 'PUT',
        concluir: async function () {
          await atualizarBlocos();
          Agora.toast('Resposta validada.', 'sucesso');
        }
      },
      'retirar-validacao': {
        metodo: 'DELETE',
        concluir: async function () {
          await atualizarBlocos();
          Agora.toast('Validação retirada.', 'sucesso');
        }
      }
    };
  
    document.addEventListener('click', async function (evento) {
      const botao = evento.target.closest('[data-acao]');
      if (!botao || botao.disabled) return;
      const acao = ACOES[botao.dataset.acao];
      if (!acao) return;
  
      Agora.carregando(botao, true);
      try {
        const resposta = await Agora.api(botao.dataset.url, { method: acao.metodo });
        if (!resposta.ok) {
          Agora.toast(resposta.dados.erro || 'Não foi possível concluir a ação.', 'erro');
          return;
        }
        await acao.concluir(botao, resposta.dados);
      } catch (erro) {
        Agora.toast('Sem conexão. Tente novamente.', 'erro');
      } finally {
        if (document.body.contains(botao)) Agora.carregando(botao, false);
      }
    });
  
    const form = document.getElementById('form-resposta');
    if (!form) return;
  
    const campo = document.getElementById('conteudo');
    const aviso = document.getElementById('erro-conteudo');
    const enviar = form.querySelector('button[type="submit"]');
  
    function mostrarErro(mensagem) {
      aviso.textContent = mensagem;
      aviso.hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
    }
  
    function limparErro() {
      aviso.textContent = '';
      aviso.hidden = true;
      campo.setAttribute('aria-invalid', 'false');
    }
  
    form.addEventListener('submit', async function (evento) {
      evento.preventDefault();
      limparErro();
      const texto = campo.value.trim();
      if (!texto) {
        mostrarErro('Escreva sua resposta antes de enviar.');
        return;
      }
  
      Agora.carregando(enviar, true);
      try {
        const resposta = await Agora.api(form.dataset.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conteudo: texto })
        });
        if (resposta.ok) {
          campo.value = '';
          await atualizarBlocos();
          Agora.toast('Resposta publicada.', 'sucesso');
          return;
        }
        if (resposta.dados.erros && resposta.dados.erros.conteudo) {
          mostrarErro(resposta.dados.erros.conteudo);
          return;
        }
        Agora.toast(resposta.dados.erro || 'Não foi possível publicar a resposta.', 'erro');
      } catch (erro) {
        Agora.toast('Sem conexão. Tente novamente.', 'erro');
      } finally {
        Agora.carregando(enviar, false);
      }
    });
  })();