CREATE TABLE denuncia (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  denunciante_id INT NOT NULL,
  alvo_tipo      ENUM('pergunta', 'resposta') NOT NULL,
  alvo_id        INT NOT NULL,
  motivo         VARCHAR(500) NOT NULL,
  status         ENUM('pendente', 'revisada') NOT NULL DEFAULT 'pendente',
  decisao        ENUM('mantida', 'removida') NULL,   -- só preenchida quando status = 'revisada'
  revisada_por   INT NULL,
  revisada_em    DATETIME NULL,
  criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (denunciante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (revisada_por)   REFERENCES usuarios(id) ON DELETE SET NULL,
  UNIQUE (denunciante_id, alvo_tipo, alvo_id),         -- 1 denúncia por usuário/conteúdo
  INDEX idx_denuncia_alvo (alvo_tipo, alvo_id, status),
  CHECK ((status = 'pendente' AND decisao IS NULL) OR (status = 'revisada' AND decisao IS NOT NULL))
);