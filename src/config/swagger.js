import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API Sistema de Controle de Horas Complementares",
      version: "1.0.0",
      description: "Documentação da API do Projeto Integrador"
    },

    tags: [
      {
        name: "Autenticação",
        description: "Login, recuperação e redefinição de senha"
      },
      {
        name: "Usuários",
        description: "Gerenciamento de usuários do sistema"
      },
      {
        name: "Cursos",
        description: "Gerenciamento de cursos"
      },
      {
        name: "Turmas",
        description: "Gerenciamento de turmas"
      },
      {
        name: "Atividades",
        description: "Controle e validação de atividades complementares"
      },
      {
        name: "Portal do Aluno",
        description: "Funcionalidades disponíveis para o aluno"
      },
      {
        name: "Coordenação",
        description: "Gerenciamento de alunos pela coordenação"
      },
      {
        name: "Relatórios",
        description: "Geração de relatórios e comprovantes"
      },
      {
        name: "Regras",
        description: "Configuração das regras de horas complementares"
      },
      {
        name: "Limites",
        description: "Configuração dos limites de horas complementares"
      }
    ],

    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor Local"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },

      schemas: {
        LoginRequest: {
            type: "object",
            required: ["email", "senha"],
            properties: {
                email: {
                    type: "string",
                    example: "aluno@senac.br"
                },
                senha: {
                    type: "string",
                    example: "123456"
                }
            }
        },

        Usuario: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "uuid"
                },
                nome: {
                    type: "string"
                },
                email: {
                    type: "string"
                },
                tipo: {
                    type: "string",
                    example: "ALUNO"
                }
            }
        },

        Curso: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "uuid"
                },
                nome: {
                    type: "string"
                },
                metaHoras: {
                    type: "integer"
                },
                tipoCurso: {
                    type: "string"
             }
            }
        },

        Turma: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "uuid"
                },
                nome: {
                    type: "string"
                },
                periodo: {
                    type: "integer"
                },
            }
        },

        Atividade: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    format: "uuid"
                },
                titulo: {
                    type: "string"
                },
                categoria: {
                    type: "string"
                },
                horasSolicitadas: {
                    type: "integer"
                },
                status: {
                    type: "string"
                }
            }
        }
      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [
    "./src/routes/*.js"
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;