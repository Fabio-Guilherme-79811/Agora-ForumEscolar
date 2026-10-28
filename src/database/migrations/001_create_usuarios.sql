CREATE TABLE usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(120)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  senha_hash    VARCHAR(255)  NOT NULL,
  perfil        ENUM('aluno', 'monitor', 'professor', 'admin') NOT NULL DEFAULT 'aluno',
  tentativas_login INT NOT NULL DEFAULT 0,
  bloqueado_até DATETIME NULL,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);