/*
 * menu-landing.js — Gaveta de navegação em tela cheia da landing (mobile).
 * O botão com data-menu abre; data-menu-fechar, a tecla Esc ou um clique em
 * link fecham. Ao abrir, o foco vai para "Fechar"; ao fechar, volta ao Menu.
 * Atributos: aria-expanded no botão e a classe gaveta--aberta na gaveta.
 */
(function () {
  'use strict';

  const botao = document.querySelector('[data-menu]');
  const gaveta = document.getElementById('gaveta');
  if (!botao || !gaveta) return;
  const fechar = gaveta.querySelector('[data-menu-fechar]');

  function definir(aberta) {
    gaveta.classList.toggle('gaveta--aberta', aberta);
    botao.setAttribute('aria-expanded', aberta ? 'true' : 'false');
    document.body.style.overflow = aberta ? 'hidden' : '';
    (aberta ? fechar : botao).focus();
  }

  botao.addEventListener('click', function () { definir(true); });
  fechar.addEventListener('click', function () { definir(false); });
  gaveta.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) definir(false);
  });
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && gaveta.classList.contains('gaveta--aberta')) definir(false);
  });
})();