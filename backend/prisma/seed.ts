import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../generated/prisma/client";
import { logger } from "../src/logger";

// Este script se ejecuta para bootstrapear el primer usuario administrador del sistema.
// DATABASE_URL es obligatoria porque Prisma necesita una conexion real para leer/escribir datos.
// Se usa trim() para evitar errores por espacios accidentales en variables de entorno.
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });
const seedLogger = logger.child({ component: "seed" });

// Helper reutilizable para validar variables de entorno requeridas.
// Si falta una variable critica, el proceso falla al inicio (fail fast) para evitar
// ejecuciones parciales o estados inconsistentes en la base de datos.
function getEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  // Datos minimos para crear el admin inicial.
  // El email se normaliza a minusculas para que la unicidad sea consistente
  // aunque alguien escriba mayusculas en el archivo .env.
  const adminEmail = getEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = getEnv("ADMIN_PASSWORD");
  const adminName = getEnv("ADMIN_NAME");

  // BCRYPT_ROUNDS controla el costo computacional del hash.
  // Si no se define, se usa 12 como valor por defecto razonable para entorno local/MVP.
  // Se restringe el rango permitido para evitar dos extremos peligrosos:
  // - valores muy bajos: reducen la seguridad frente a ataques de fuerza bruta.
  // - valores muy altos: pueden degradar el rendimiento sin beneficio proporcional.
  const bcryptRoundsRaw = process.env.BCRYPT_ROUNDS?.trim() ?? "12";
  const bcryptRounds = Number.parseInt(bcryptRoundsRaw, 10);

  if (Number.isNaN(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 15) {
    throw new Error("BCRYPT_ROUNDS must be a number between 10 and 15");
  }

  // Nunca se guarda la contrasena en texto plano.
  // Solo persistimos su hash para cumplir una practica minima de seguridad.
  const passwordHash = await bcrypt.hash(adminPassword, bcryptRounds);

  // Idempotencia robusta ante concurrencia:
  // upsert evita la ventana de carrera de findUnique + create.
  // Si el usuario ya existe, update vacio lo deja intacto.
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  seedLogger.info({ action: "create-admin", result: "ensured", adminEmail, bcryptRounds }, "Seed completed");
}

main()
  // Si ocurre cualquier error, se registra y se marca salida con codigo de fallo.
  .catch((error: unknown) => {
    seedLogger.error({ action: "seed", result: "failed", err: error }, "Seed failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    seedLogger.flush();

    // Se libera la conexion de Prisma siempre, tanto en exito como en error,
    // para evitar conexiones colgadas en procesos locales o pipelines.
    await prisma.$disconnect();
  });
