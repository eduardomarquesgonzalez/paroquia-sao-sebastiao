const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@paroquiasaosebastiao.com.br";
  const password = process.env.ADMIN_PASSWORD || "Admin@123456";
  const name = process.env.ADMIN_NAME || "Administrador";

  console.log("🌱 Iniciando seed do banco de dados...");

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("✅ Usuário admin já existe!");
    console.log("📧 Email:", email);
    return;
  }

  console.log("🔐 Criando hash da senha...");
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("👤 Criando usuário admin...");
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "ADMIN",
    },
  });

  console.log("\n✅ Usuário admin criado com sucesso!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email:", email);
  console.log("🔑 Senha:", password);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar usuário admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
