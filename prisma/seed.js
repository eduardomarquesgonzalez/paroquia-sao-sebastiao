const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    || "admin@paroquiasaosebastiao.com.br";
  const password = process.env.ADMIN_PASSWORD || "Admin@123456";
  const name     = process.env.ADMIN_NAME     || "Administrador";

  console.log("🌱 Iniciando seed do banco de dados — Paróquia São Sebastião");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // ── Usuário admin ────────────────────────────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("✅ Usuário admin já existe:", email);

    // Garante que o role seja ADMIN (compatibilidade com schema antigo)
    if (existing.role !== "ADMIN" && existing.role !== "SUPER_ADMIN") {
      await prisma.user.update({
        where: { email },
        data:  { role: "ADMIN", status: "ACTIVE" },
      });
      console.log("🔄 Role atualizado para ADMIN");
    }
  } else {
    console.log("🔐 Criando hash da senha...");
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log("👤 Criando usuário admin...");
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role:   "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log("\n✅ Usuário admin criado com sucesso!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email :", email);
    console.log("🔑 Senha :", password);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n");
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
