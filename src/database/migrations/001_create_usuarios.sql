CREATE TABLE usuarios (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nome             VARCHAR(120) NOT NULL,
  email            VARCHAR(150) NOT NULL UNIQUE,
  senha_hash       VARCHAR(255) NOT NULL,
  perfil           ENUM('aluno', 'monitor', 'professor') NOT NULL DEFAULT 'aluno',
  turma_id         INT NULL,                -- NULL para professor (que usa professor_turma); FK criada na migration 011
  foto             VARCHAR(255) NULL,
  tentativas_login INT NOT NULL DEFAULT 0,
  bloqueado_ate    DATETIME NULL,
  criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);