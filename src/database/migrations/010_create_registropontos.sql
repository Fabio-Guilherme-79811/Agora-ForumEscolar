CREATE TABLE registropontos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  pontos      INT NOT NULL,
  motivo      ENUM('resposta', 'voto_util', 'validacao') NOT NULL,
  resposta_id INT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
  -- apagar a resposta apaga também os pontos que ela gerou (resposta, votos úteis e validação)
  FOREIGN KEY (resposta_id) REFERENCES respostas(id) ON DELETE CASCADE,
  INDEX idx_pontos_evento (usuario_id, motivo, resposta_id),
  CHECK (pontos >= 0)
);