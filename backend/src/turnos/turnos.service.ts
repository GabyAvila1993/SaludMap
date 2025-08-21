import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class TurnosService {
  private turnos: any[] = [];

  createTurno(payload: any) {
    const t = {
      id: randomUUID(),
      user: payload.user ?? 'usuario',
      professionalId: payload.professionalId ?? null,
      professionalName: payload.professionalName ?? 'Profesional',
      professionalType: payload.professionalType ?? 'default',
      datetime: payload.datetime,
      notes: payload.notes ?? '',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    this.turnos.push(t);
    return t;
  }

  listTurnos(user?: string) {
    const base = user ? this.turnos.filter((t) => t.user === user) : this.turnos;
    // por defecto no devolver turnos cancelados
    return base.filter((t) => t.status !== 'cancelled');
  }

  updateTurno(id: string, body: any) {
    const idx = this.turnos.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundException('Turno no encontrado');
    const turno = this.turnos[idx];
    if (body.action === 'cancel') {
      turno.status = 'cancelled';
    } else if (body.datetime) {
      turno.datetime = body.datetime;
    }
    this.turnos[idx] = turno;
    return turno;
  }
}