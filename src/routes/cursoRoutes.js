import express from 'express';
import { listarCursos, criarCurso, editarCurso, excluirCurso, opcoesFiltros } from "../controllers/CursoController.js";

const router = express.Router();

/**
 * @swagger
 * /api/cursos:
 *   get:
 *     summary: Lista todos os cursos
 *     tags:
 *       - Cursos
 */
router.get('/', listarCursos);


router.get('/opcoes-filtros', opcoesFiltros);

/**
 * @swagger
 * /api/cursos:
 *   post:
 *     summary: Cria um curso
 *     tags:
 *       - Cursos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nome: Análise e Desenvolvimento de Sistemas
 *             tipoFormacao: Superior
 *             metaHoras: 100
 *             statusInicial: Ativo
 *     responses:
 *       201:
 *         description: Curso criado
 */
router.post('/', criarCurso);

/**
 * @swagger
 * /api/cursos/{id}:
 *   put:
 *     summary: Edita um curso
 *     tags:
 *       - Cursos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.put('/:id', editarCurso);

/**
 * @swagger
 * /api/cursos/{id}:
 *   delete:
 *     summary: Exclui um curso
 *     tags:
 *       - Cursos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/:id', excluirCurso);

export default router;