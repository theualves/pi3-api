import express from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import {
  obterDashboardAluno,
  listarMeusCursos,
  listarMinhasSolicitacoes,
  listarHistoricoAluno,
  criarNovaSolicitacaoAluno,
  editarSolicitacaoAluno,
  excluirSolicitacaoAluno,
  obterDetalhesSolicitacao,
} from "../controllers/AlunoPortalController.js";
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
const DIRETORIO_UPLOADS = path.resolve(process.cwd(), "uploads", "comprovantes");
const TIPOS_PERMITIDOS = new Set(["application/pdf", "image/jpeg", "image/png"]);

fs.mkdirSync(DIRETORIO_UPLOADS, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIRETORIO_UPLOADS),
  filename: (_req, file, cb) => {
    const sufixo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${sufixo}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Ajustado para 5MB conforme sua mensagem de erro
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      return cb(new Error("Formato inválido. Envie PDF, JPG ou PNG."));
    }
    return cb(null, true);
  },
});

const uploadComprovante = (req, res, next) => {
  upload.single("comprovante")(req, res, (erro) => {
    if (!erro) {
      return next();
    }
    if (erro instanceof multer.MulterError && erro.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "O comprovante deve ter no máximo 5MB." });
    }
    return res.status(400).json({ error: erro.message || "Erro ao processar arquivo enviado." });
  });
};


router.use(autenticarToken);


router.get("/dashboard", obterDashboardAluno);
router.get("/cursos", listarMeusCursos);
router.get("/solicitacoes", listarMinhasSolicitacoes);
router.get("/historico", listarHistoricoAluno);
router.post("/solicitacoes", uploadComprovante, criarNovaSolicitacaoAluno);
router.put("/solicitacoes/:atividadeId", uploadComprovante, editarSolicitacaoAluno);
router.delete("/solicitacoes/:atividadeId", excluirSolicitacaoAluno);
router.get("/solicitacoes/:atividadeId", obterDetalhesSolicitacao);

export default router;