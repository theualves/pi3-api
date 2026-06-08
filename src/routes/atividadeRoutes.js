import express from 'express';
import { criarAtividade, listarAtividades, validarAtividade, baixarComprovante } from '../controllers/AtividadeController.js';
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(autenticarToken);


/**
 * @swagger
 * /api/atividades:
 *   post:
 *     summary: Cria uma atividade complementar
 *     tags:
 *       - Atividades
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             titulo: Curso de React
 *             categoria: Cursos
 *             horasSolicitadas: 20
 *             comprovante: https://arquivo.pdf
 *             alunoId: uuid-do-aluno
 *     responses:
 *       201:
 *         description: Atividade criada
 */
router.post('/', criarAtividade);

/**
 * @swagger
 * /api/atividades:
 *   get:
 *     summary: Lista atividades
 *     tags:
 *       - Atividades
 */
router.get('/', listarAtividades);

/**
 * @swagger
 * /api/atividades/{id}/validar:
 *   put:
 *     summary: Valida atividade complementar
 *     tags:
 *       - Atividades
 */
router.put('/:id/validar', validarAtividade);


router.get('/:id/comprovante/download', baixarComprovante);

export default router;