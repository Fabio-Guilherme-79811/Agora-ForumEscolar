/*
 * tenho-duvida-fetch.js — Botão "Também tenho essa dúvida" (RN-15).
 * Alterna a marcação (1 por usuário e pergunta) e atualiza o contador na hora.
 * O botão não existe para o autor da pergunta (a view não o renderiza).
 * Depende de main.js (window.Agora). Rota usada:
 *   POST /perguntas/:id/tambem-tenho -> { ativo, total }
 * Os contadores são os elementos com o atributo data-total-tambem.
 */
(function () {
    'use strict';
  
    const Agora = window.Agora;
  
    document.addEventListener('click', async function (evento) {
      const botao = evento.target.closest('[data-acao="tambem-tenho"]');
      if (!botao || botao.disabled) return;
  
      Agora.carregando(botao, true);
      try {
        const resposta = await Agora.api(botao.dataset.url, { method: 'POST' });
        if (!resposta.ok) {
          Agora.toast(resposta.dados.erro || 'Não foi possível registrar sua marcação.', 'erro');
          return;
        }
        botao.setAttribute('aria-pressed', resposta.dados.ativo ? 'true' : 'false');
        document.querySelectorAll('[data-total-tambem]').forEach(function (el) {
          el.textContent = resposta.dados.total;
        });
      } catch (erro) {
        Agora.toast('Sem conexão. Tente novamente.', 'erro');
      } finally {
        Agora.carregando(botao, false);
      }
    });
  })();