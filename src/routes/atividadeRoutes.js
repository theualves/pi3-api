import express from 'express';
import { criarAtividade, listarAtividades, validarAtividade, baixarComprovante } from '../controllers/AtividadeController.js';
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(autenticarToken);

router.post('/', criarAtividade);
router.get('/', listarAtividades);
router.put('/:id/validar', validarAtividade);
router.get('/:id/comprovante/download', baixarComprovante);

export default router;