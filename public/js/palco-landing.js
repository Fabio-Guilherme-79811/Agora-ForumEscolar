/*
 * palco-landing.js — Números do cartão do professor na landing.
 * Ao passar o mouse, tocar ou focar o cartão, perguntas e "também tenho"
 * variam em quadros. A temperatura é a soma dos dois (RN-26) e a faixa segue
 * a RN-27: Frio (0–4), Morno (5–14), Quente (15 ou mais). Ao sair, volta
 * ao último quadro, que é o valor inicial escrito no HTML.
 * Sem animação para quem pede menos movimento (prefers-reduced-motion).
 */
(function () {
  'use strict';

  const cartao = document.querySelector('.cartao--professor');
  if (!cartao) return;

  const perguntas = cartao.querySelector('[data-valor="perguntas"]');
  const tambem = cartao.querySelector('[data-valor="tambem"]');
  const temperatura = cartao.querySelector('[data-valor="temp"]');
  const faixa = cartao.querySelector('[data-faixa]');
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

  // [perguntas, também tenho]; o último quadro é o valor inicial
  const quadros = [[2, 1], [3, 3], [5, 4], [4, 0], [7, 5], [9, 6], [8, 7], [12, 6]];
  let temporizador = null;
  let indice = 0;

  function classificar(total) {
    if (total >= 15) return 'Quente';
    if (total >= 5) return 'Morno';
    return 'Frio';
  }

  function desenhar(quadro) {
    const total = quadro[0] + quadro[1];
    perguntas.textContent = quadro[0];
    tambem.textContent = quadro[1];
    temperatura.textContent = total;
    faixa.textContent = classificar(total);
  }

  function iniciar() {
    if (temporizador || reduzir.matches) return;
    indice = 0;
    desenhar(quadros[0]);
    temporizador = setInterval(function () {
      indice = (indice + 1) % quadros.length;
      desenhar(quadros[indice]);
    }, 105);
  }

  function parar() {
    clearInterval(temporizador);
    temporizador = null;
    desenhar(quadros[quadros.length - 1]);
  }

  cartao.addEventListener('pointerenter', iniciar);
  cartao.addEventListener('focus', iniciar);
  cartao.addEventListener('pointerleave', parar);
  cartao.addEventListener('blur', parar);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) parar();
  });
})();