import express from "express";
import {
  login,
  solicitarRecuperacao,
  validarToken,
  redefinirSenha
} from "../controllers/AuthController.js";

const router = express.Router();

router.post("/login", login);

// solicitar link
router.post("/recuperar", solicitarRecuperacao);

// validar token
router.get("/validar-token", validarToken);

// nova senha
router.post("/redefinir", redefinirSenha);

export default router;

