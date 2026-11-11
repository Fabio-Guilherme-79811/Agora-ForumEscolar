/*
 * rodape-landing.js — Entrada suave do texto "Ágora" gigante do rodapé.
 * Substitui o whileInView do motion/react: o texto começa levemente menor e
 * transparente e aparece quando entra na tela (IntersectionObserver).
 * Sem JavaScript, ou com prefers-reduced-motion, o texto já fica visível.
 */
(function () {
  'use strict';

  const alvo = document.querySelector('[data-vidro]');
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!alvo || reduzir || !('IntersectionObserver' in window)) return;

  alvo.classList.add('rodape-camadas__vidro--oculto');

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.remove('rodape-camadas__vidro--oculto');
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.2 });

  observador.observe(alvo);
})();
