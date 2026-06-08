import express from 'express';
import { criarUsuario, cadastrarAluno, listarUsuarios, contarUsuarios } from '../controllers/UsuarioController.js';
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(autenticarToken);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', listarUsuarios);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cria um novo usuário
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: Maria Silva
 *             email: maria@senac.br
 *             senha: 123456
 *             tipo: COORDENADOR
 *             status: Ativo
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post('/', criarUsuario);

/**
 * @swagger
 * /api/usuarios/aluno:
 *   post:
 *     summary: Cadastra um novo aluno
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: João Silva
 *             email: joao@senac.br
 *             senha: 123456
 *             cpf: 12345678900
 *             cursoId: uuid-do-curso
 *             periodo: 3
 *     responses:
 *       201:
 *         description: Aluno cadastrado
 */
router.post("/aluno", cadastrarAluno);

/**
 * @swagger
 * /api/usuarios/contar:
 *   get:
 *     summary: Retorna quantidade de usuários cadastrados
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quantidade retornada
 */
router.get("/contar", contarUsuarios);

export default router;