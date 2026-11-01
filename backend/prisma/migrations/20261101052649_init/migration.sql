-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('JUGADOR', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "TipoCancha" AS ENUM ('FUTBOL_5', 'FUTBOL_7', 'FUTBOL_11');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE_SENA', 'CONFIRMADA', 'CANCELADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('SENA', 'SALDO', 'DEVOLUCION');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complejos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "horaApertura" INTEGER NOT NULL,
    "horaCierre" INTEGER NOT NULL,
    "administradorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complejos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canchas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCancha" NOT NULL,
    "precioHora" DECIMAL(10,2) NOT NULL,
    "techada" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "complejoId" TEXT NOT NULL,
    "recargoNocturnoPct" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "recargoFinDeSemanaPct" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canchas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "canchaId" TEXT NOT NULL,
    "jugadorId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "horaInicio" INTEGER NOT NULL,
    "horaFin" INTEGER NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE_SENA',
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "montoSena" DECIMAL(10,2) NOT NULL,
    "fechaExpiracion" TIMESTAMP(3),
    "canceladaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'CONFIRMADO',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "complejos_administradorId_key" ON "complejos"("administradorId");

-- CreateIndex
CREATE INDEX "complejos_zona_idx" ON "complejos"("zona");

-- CreateIndex
CREATE INDEX "canchas_complejoId_idx" ON "canchas"("complejoId");

-- CreateIndex
CREATE INDEX "reservas_canchaId_fecha_idx" ON "reservas"("canchaId", "fecha");

-- CreateIndex
CREATE INDEX "reservas_jugadorId_idx" ON "reservas"("jugadorId");

-- CreateIndex
CREATE INDEX "pagos_reservaId_idx" ON "pagos"("reservaId");

-- AddForeignKey
ALTER TABLE "complejos" ADD CONSTRAINT "complejos_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canchas" ADD CONSTRAINT "canchas_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "complejos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "canchas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
