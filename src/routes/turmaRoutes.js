import express from 'express';
import { criarTurma, listarTurmas } from "../controllers/TurmaController.js";

const router = express.Router();
router.post('/', criarTurma);
router.get('/', listarTurmas);

export default router;