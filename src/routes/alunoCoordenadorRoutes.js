import express from 'express';
import { criarAluno, listarAlunos, gerarSenhaAutomatica, atualizarAluno, excluirAluno} from "../controllers/AlunoCoordenadorController.js";
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(autenticarToken);

router.post('/', criarAluno);
router.get('/', listarAlunos);
router.put('/alunos/:id', atualizarAluno);
router.delete('/alunos/:id', excluirAluno);
router.get('/senha/automatica', gerarSenhaAutomatica);

export default router;