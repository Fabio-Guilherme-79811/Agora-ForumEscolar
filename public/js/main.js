/*
 * main.js — Interface básica da Ágora: avisos (toasts), estado de carregamento
 * dos botões e o helper de requisição usado pelos demais *-fetch.js.
 * Autenticação: o JWT fica em cookie httpOnly e vai junto de cada fetch
 * (credentials: 'same-origin'), então nenhum script lê nem anexa o token.
 * Segurança: textos entram no DOM só com textContent, nunca com innerHTML.
 */
(function () {
    'use strict';
  
    const ICONES = { sucesso: '✔', erro: '✖', aviso: '⏱', info: 'ℹ' };
    const DURACAO_MS = 6000;
  
    function toast(mensagem, tipo) {
      const area = document.getElementById('toasts');
      if (!area) return;
      const nivel = ICONES[tipo] ? tipo : 'info';
      const item = document.createElement('p');
      item.className = 'toast toast--' + nivel;
      if (nivel === 'erro') item.setAttribute('role', 'alert');
      const icone = document.createElement('span');
      icone.setAttribute('aria-hidden', 'true');
      icone.textContent = ICONES[nivel];
      const texto = document.createElement('span');
      texto.textContent = mensagem;
      item.append(icone, texto);
      area.append(item);
      setTimeout(function () { item.remove(); }, DURACAO_MS);
    }
  
    function carregando(botao, ativo) {
      if (!botao) return;
      botao.disabled = ativo;
      if (ativo) botao.setAttribute('aria-busy', 'true');
      else botao.removeAttribute('aria-busy');
    }
  
    // Devolve { ok, status, dados }. Sessão expirada (401) leva ao login.
    async function api(url, opcoes) {
      const config = Object.assign({ credentials: 'same-origin' }, opcoes || {});
      config.headers = Object.assign({ Accept: 'application/json' }, config.headers || {});
      const resposta = await fetch(url, config);
      if (resposta.status === 401) {
        window.location.assign('/login');
        return { ok: false, status: 401, dados: {} };
      }
      let dados = {};
      try {
        dados = await resposta.json();
      } catch (e) {
        dados = {};
      }
      return { ok: resposta.ok, status: resposta.status, dados: dados };
    }
  
    // Avisos já renderizados pelo servidor também somem sozinhos
    document.querySelectorAll('#toasts .toast').forEach(function (item) {
      setTimeout(function () { item.remove(); }, DURACAO_MS);
    });
  
    window.Agora = { toast: toast, carregando: carregando, api: api };
  })();