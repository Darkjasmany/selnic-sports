# 1. Asegúrate de tener el .env con DATABASE_URL válida

# 2. Genera el cliente

pnpm prisma generate

# pnpm db:generate

# 3. Crea las tablas en la BD

pnpm db:migrate

# nombre de la migración: init_schema

# 4. Arranca el servidor

pnpm dev
