  import 'dotenv/config';
  import express from 'express';
  import cors from 'cors';
  import { PrismaClient } from '@prisma/client';

  import cursoRoutes from './src/routes/cursoRoutes.js';
  import usuarioRoutes from './src/routes/usuarioRoutes.js';
  import limiteRoutes from './src/routes/limiteRoutes.js';
  import regraRoutes from './src/routes/regraRoutes.js';
  import authRoutes from './src/routes/authRoutes.js';
  import atividadeRoutes from './src/routes/atividadeRoutes.js';
  import alunoPortalRoutes from './src/routes/alunoPortalRoutes.js';
  import alunoCoordenadorRoutes from './src/routes/alunoCoordenadorRoutes.js';
  import relatorioRoutes from './src/routes/relatorioRoutes.js';
  import turmaRoutes from './src/routes/turmaRoutes.js';
  import fs from 'fs';
  import path from 'path';
  import swaggerUi from 'swagger-ui-express';
  import swaggerSpec from './src/config/swagger.js';


  const app = express();
  const prisma = new PrismaClient();
  const PORT = Number(process.env.PORT) || 3001;

  const uploadDir = path.join(process.cwd(), 'uploads', 'comprovantes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Pasta de uploads criada com sucesso!');
  }

  app.use(cors());
  app.use(express.json());

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use('/api/cursos', cursoRoutes);
  app.use('/api/turmas', turmaRoutes);
  app.use('/api/usuarios', usuarioRoutes);
  app.use('/api/limite', limiteRoutes);
  app.use('/api/regra', regraRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/atividades', atividadeRoutes);
  app.use('/api/aluno-portal', alunoPortalRoutes);
  app.use('/api/aluno-coordenador', alunoCoordenadorRoutes);
  app.use('/api/relatorios', relatorioRoutes);
  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: 'ok', db: 'mysql' });
    } catch {
      res.status(503).json({ status: 'error', db: 'mysql' });
    }
  });
  app.use((_req, res) => {
    res.status(404).json({ error: "Rota não encontrada." });
  });

  app.use((err, _req, res, _next) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "JSON inválido." });
    }

    console.error(err);
    return res.status(500).json({ error: "Erro interno do servidor." });
  });

  const startServer = async () => {
    try {
      await prisma.$connect();
      app.listen(PORT, () => {
        console.log(`API rodando no http://localhost:${PORT} (MySQL conectado)`);
      });
    } catch (error) {
      console.error(' Erro ao conectar no MySQL:', error);
      process.exit(1);
    }
  };

  const shutdown = async () => {
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  startServer();
