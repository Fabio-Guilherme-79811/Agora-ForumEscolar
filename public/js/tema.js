/*
 * tema.js — Alternador de tema claro/escuro com um único botão.
 * Qualquer elemento com o atributo data-alternar-tema funciona como botão.
 * O tema escolhido vira o atributo data-theme no <html> (lido pelo global.css)
 * e fica salvo no localStorage. Enquanto ninguém escolher, vale o tema do
 * sistema (prefers-color-scheme).
 * Carregar no <head>, sem defer, para o tema valer antes da página pintar.
 */
(function () {
    'use strict';
  
    const CHAVE = 'agora-tema';
    const raiz = document.documentElement;
    const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');
  
    function lerSalvo() {
      try {
        const salvo = localStorage.getItem(CHAVE);
        return salvo === 'light' || salvo === 'dark' ? salvo : null;
      } catch (e) {
        return null;
      }
    }
  
    function salvar(tema) {
      try {
        localStorage.setItem(CHAVE, tema);
      } catch (e) {
        // Sem localStorage, o tema vale só até recarregar a página
      }
    }
  
    // Tema que está aparecendo agora, escolhido ou vindo do sistema
    function temaAtual() {
      const definido = raiz.getAttribute('data-theme');
      if (definido === 'light' || definido === 'dark') return definido;
      return sistemaEscuro.matches ? 'dark' : 'light';
    }
  
    // aria-pressed="true" significa modo escuro ligado
    function marcarBotoes() {
      const escuro = temaAtual() === 'dark';
      document.querySelectorAll('[data-alternar-tema]').forEach(function (botao) {
        botao.setAttribute('aria-pressed', escuro ? 'true' : 'false');
      });
    }
  
    const salvo = lerSalvo();
    if (salvo) raiz.setAttribute('data-theme', salvo);
  
    document.addEventListener('click', function (evento) {
      const botao = evento.target.closest('[data-alternar-tema]');
      if (!botao) return;
      const proximo = temaAtual() === 'dark' ? 'light' : 'dark';
      raiz.setAttribute('data-theme', proximo);
      salvar(proximo);
      marcarBotoes();
    });
  
    // Sem escolha salva, acompanha a mudança do tema do sistema
    sistemaEscuro.addEventListener('change', marcarBotoes);
    document.addEventListener('DOMContentLoaded', marcarBotoes);
  })();