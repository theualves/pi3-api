import express from 'express';
import { criarUsuario, cadastrarAluno, listarUsuarios, contarUsuarios } from '../controllers/UsuarioController.js';
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(autenticarToken);

router.get('/', listarUsuarios);
router.post('/', criarUsuario);
router.post("/aluno", cadastrarAluno);
router.get("/contar", contarUsuarios);

export default router;