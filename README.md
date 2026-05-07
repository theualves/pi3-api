# 📚 Backend API

Backend da aplicação desenvolvido com **Node.js + Express + Prisma ORM + MySQL**, responsável pelo gerenciamento de usuários, autenticação, solicitações, uploads de arquivos e comunicação com o banco de dados.

> Projeto acadêmico desenvolvido em grupo com foco na construção de uma API REST utilizando boas práticas de desenvolvimento backend.

---

# 🚀 Tecnologias Utilizadas

- Node.js
- Express
- Prisma ORM
- MySQL
- JWT Authentication
- Multer
- Bcrypt
- Dotenv
- Swagger

---

# 🧠 Arquitetura do Projeto

O fluxo da aplicação funciona da seguinte forma:

```txt
Frontend → Rotas → Controllers → Prisma ORM → MySQL → Resposta JSON
```

### Fluxo detalhado

- O frontend envia requisições HTTP para a API.
- As rotas recebem essas requisições.
- Os controllers processam os dados e aplicam regras de negócio.
- O Prisma faz a comunicação com o banco MySQL.
- O banco retorna os dados.
- A API devolve a resposta em JSON para o frontend.

---

# ⚙️ Middlewares

A aplicação utiliza middlewares para interceptar requisições e executar funcionalidades como:

- Validação de dados
- Autenticação de usuários
- Upload de arquivos
- Tratamento de erros

---

# 📁 Estrutura de Pastas

```bash
.
├── .vscode
├── backend/
│   └── prisma
├── prisma
├── src
├── tests
├── .gitignore
├── README.md
├── package-lock.json
├── package.json
└── server.js
```

---

# 🔐 Autenticação

A autenticação da API é feita utilizando:

- JWT (JSON Web Token)
- Bcrypt para criptografia de senhas

---

# 📦 Instalação

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
```

Acesse a pasta do projeto:

```bash
cd nome-do-projeto
```

Instale as dependências:

```bash
npm install
```

---

# 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_banco"

JWT_SECRET="sua_chave_secreta"

PORT=3000
```

---

# 🗄️ Configuração do Banco de Dados

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

Gerar Prisma Client:

```bash
npx prisma generate
```

---

# ▶️ Executando o Projeto

Modo desenvolvimento:

```bash
npm run dev
```

Modo produção:

```bash
npm start
```

---

# 📡 Respostas da API

A API retorna dados no formato JSON.

Exemplo:

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {}
}
```

---

# 📂 Uploads

Os uploads de arquivos são gerenciados utilizando o Multer.

Os arquivos enviados ficam armazenados na pasta:

```bash
/uploads
```

---

# 📖 Documentação Swagger

A documentação da API foi desenvolvida utilizando Swagger para facilitar os testes e visualização dos endpoints.

Exemplo de acesso:

```bash
http://localhost:3000/api-docs
```

---

# 🌐 Deploy

A aplicação está hospedada em ambiente cloud para disponibilização e testes da API.

> Deploy realizado utilizando Render.

---

# 🛠️ Prisma ORM

O Prisma é utilizado para:

- Modelagem do banco de dados
- Migrations
- Queries SQL de forma segura
- Integração entre Node.js e MySQL

---

# 🧪 Testes

Os testes da aplicação ficam organizados na pasta:

```bash
/tests
```

---

# 👥 Equipe

Projeto desenvolvido em grupo para fins acadêmicos.

---

# 📌 Melhorias Futuras

- Testes automatizados
- Dockerização
- Logs avançados
- Rate limiting
- Refresh token

---

# 📄 Licença

Este projeto está sob a licença MIT.
