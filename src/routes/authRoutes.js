import express from "express";
import {
  login,
  solicitarRecuperacao,
  validarToken,
  redefinirSenha
} from "../controllers/AuthController.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realiza autenticação do usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               message: Login realizado com sucesso!
 *               token: eyJhbGciOi...
 *               usuario:
 *                 id: 1
 *                 nome: João Silva
 *                 tipo: ALUNO
 *                 idAluno: 15
 *       401:
 *         description: E-mail ou senha inválidos
 *       500:
 *         description: Erro interno
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/recuperar:
 *   post:
 *     summary: Solicita recuperação de senha
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: aluno@senac.br
 *     responses:
 *       200:
 *         description: Link enviado para o e-mail
 *       404:
 *         description: Usuário não encontrado
 */
// solicitar link
router.post("/recuperar", solicitarRecuperacao);

/**
 * @swagger
 * /api/auth/validar-token:
 *   get:
 *     summary: Valida token de recuperação
 *     tags:
 *       - Autenticação
 *     responses:
 *       200:
 *         description: Token válido
 */
// validar token
router.get("/validar-token", validarToken);

/**
 * @swagger
 * /api/auth/redefinir:
 *   post:
 *     summary: Redefine a senha do usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             token: abc123
 *             novaSenha: NovaSenha@123
 *     responses:
 *       200:
 *         description: Senha redefinida
 *       400:
 *         description: Token inválido ou expirado
 */
// nova senha
router.post("/redefinir", redefinirSenha);

export default router;

