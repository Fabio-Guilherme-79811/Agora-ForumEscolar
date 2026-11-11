/**
 * Ponto de entrada da aplicação.
 *
 * Este arquivo é responsável por iniciar o servidor HTTP
 * utilizando a aplicação Express configurada no arquivo app.ts.
 *
 * A porta do servidor pode ser definida através da variável
 * de ambiente PORT. Caso ela não exista, será utilizada a porta 3000.
 */

import app from './app';

/**
 * Porta onde o servidor será executado.
 *
 * Prioriza a variável de ambiente PORT e utiliza 3000 como padrão.
 */
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

/**
 * Inicializa o servidor e começa a aceitar requisições HTTP.
 */
app.listen(PORT, () => {
  console.log(`Server rodando na porta http://localhost:${PORT}`);
});