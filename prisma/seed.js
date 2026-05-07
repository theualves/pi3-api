import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Gerando o hash real
  const senhaHash = await bcrypt.hash("admin123", 10);

  const gestor = await prisma.usuario.upsert({
    where: { email: "admin@senac.com" },
    update: { senha: senhaHash }, // Garante que vai atualizar se já existir
    create: {
      nome: "Administrador Sistema",
      email: "admin@senac.com",
      senha: senhaHash,
      tipo: "GESTOR", // Use exatamente como está no seu Enum
      status: "Ativo",
    },
  });
  console.log("✅ Gestor atualizado com Hash!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
