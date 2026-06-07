import express from 'express';
import { criarTurma, listarTurmas, atualizarTurma, excluirTurma} from "../controllers/TurmaController.js";

const router = express.Router();
router.post('/', criarTurma);
router.get('/', listarTurmas);
router.put('/:id', atualizarTurma);
router.delete('/:id', excluirTurma);

export default router;