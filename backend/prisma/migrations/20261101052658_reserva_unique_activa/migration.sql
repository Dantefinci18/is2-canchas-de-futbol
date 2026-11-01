-- RNF3: la base de datos impide dos reservas activas para la misma cancha,
-- fecha y hora. Se implementa como indice unico parcial: solo se aplica a
-- reservas en estado PENDIENTE_SENA o CONFIRMADA (las canceladas/expiradas
-- no deben bloquear que el turno se vuelva a reservar).
CREATE UNIQUE INDEX "reservas_activa_unica"
ON "reservas" ("canchaId", "fecha", "horaInicio")
WHERE "estado" IN ('PENDIENTE_SENA', 'CONFIRMADA');
