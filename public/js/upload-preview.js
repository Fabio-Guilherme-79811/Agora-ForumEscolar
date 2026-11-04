/*
 * upload-preview.js — Pré-visualização do anexo antes do envio (RN-22).
 * Confere no navegador o tipo (imagem ou PDF) e o tamanho (padrão 5 MB) do
 * arquivo. É só conveniência: o servidor (Multer) revalida tudo.
 * Atributos esperados no input de arquivo: data-previa (id do contêiner da
 * prévia) e data-max-mb. O elemento de erro tem id "erro-" + id do input.
 */
(function () {
    'use strict';
  
    const entrada = document.querySelector('input[type="file"][data-previa]');
    if (!entrada) return;
  
    const previa = document.getElementById(entrada.dataset.previa);
    const erro = document.getElementById('erro-' + entrada.id);
    const limite = (Number(entrada.dataset.maxMb) || 5) * 1024 * 1024;
    const TIPOS = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];
    let urlAtual = null;
  
    function formatarTamanho(bytes) {
      return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
    }
  
    function limpar() {
      if (urlAtual) URL.revokeObjectURL(urlAtual);
      urlAtual = null;
      previa.textContent = '';
      previa.hidden = true;
      entrada.value = '';
    }
  
    function mostrarErro(mensagem) {
      erro.textContent = mensagem;
      erro.hidden = false;
      entrada.setAttribute('aria-invalid', 'true');
    }
  
    function limparErro() {
      erro.textContent = '';
      erro.hidden = true;
      entrada.setAttribute('aria-invalid', 'false');
    }
  
    entrada.addEventListener('change', function () {
      limparErro();
      const arquivo = entrada.files && entrada.files[0];
      if (!arquivo) {
        limpar();
        return;
      }
      if (TIPOS.indexOf(arquivo.type) === -1) {
        limpar();
        mostrarErro('Formato não aceito. Envie uma imagem (PNG, JPG, GIF ou WebP) ou um PDF.');
        return;
      }
      if (arquivo.size > limite) {
        limpar();
        mostrarErro('O arquivo tem ' + formatarTamanho(arquivo.size) + ' e passa do limite de 5 MB.');
        return;
      }
  
      previa.textContent = '';
      if (arquivo.type.indexOf('image/') === 0) {
        urlAtual = URL.createObjectURL(arquivo);
        const imagem = document.createElement('img');
        imagem.src = urlAtual;
        imagem.alt = 'Pré-visualização do anexo';
        previa.append(imagem);
      }
      const nome = document.createElement('span');
      nome.textContent = arquivo.name + ' (' + formatarTamanho(arquivo.size) + ')';
      const remover = document.createElement('button');
      remover.type = 'button';
      remover.className = 'btn btn--pequeno btn--contorno';
      remover.textContent = 'Remover anexo';
      remover.addEventListener('click', function () {
        limpar();
        limparErro();
        entrada.focus();
      });
      previa.append(nome, remover);
      previa.hidden = false;
    });
  })();