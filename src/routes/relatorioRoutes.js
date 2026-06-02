import express from 'express';
import { gerarRelatorio, gerarRelatorioPdf, baixarComprovante } from "../controllers/RelatorioController.js";

const router = express.Router();

router.get('/', gerarRelatorio );
router.get('/pdf', gerarRelatorioPdf);
router.get('/atividade/:id/comprovante', baixarComprovante)

export default router;