import express from 'express';
import { criarTurma, listarTurmas, atualizarTurma, excluirTurma} from "../controllers/TurmaController.js";
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/turmas:
 *   post:
 *     summary: Cria uma nova turma
 *     tags:
 *       - Turmas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: ADS 2025.1
 *             periodo: 3
 *             cursoId: uuid-do-curso
 *     responses:
 *       201:
 *         description: Turma criada
 *       400:
 *         description: Dados inválidos
 */
router.post('/', criarTurma);


router.get('/', listarTurmas);


router.put('/:id', atualizarTurma);


router.delete('/:id', excluirTurma);

export default router;