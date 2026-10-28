CREATE TABLE denuncia (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  denunciante_id INT NOT NULL,
  pergunta_id  INT NULL,
  resposta_id  INT NULL,
  motivo       VARCHAR(255) NOT NULL,
  situacao     ENUM('pendente', 'revisada', 'descartada') NOT NULL DEFAULT 'pendente',
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (denunciante_id) REFERENCES usuarios(id)  ON DELETE CASCADE,
  FOREIGN KEY (pergunta_id)    REFERENCES perguntas(id) ON DELETE CASCADE,
  FOREIGN KEY (resposta_id)    REFERENCES respostas(id) ON DELETE CASCADE
);