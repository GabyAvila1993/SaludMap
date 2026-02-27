import { z } from 'zod';

export const ChatMessageSchema = z.object({
  message: z.union([
    z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'El mensaje es demasiado largo'),
    z.array(z.string()).min(1, 'Debe proporcionar al menos un mensaje').transform(msgs => msgs.join(' '))
  ]),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

export type ChatMessageDto = z.infer<typeof ChatMessageSchema>;

export function validateChatMessage(data: unknown): ChatMessageDto {
  return ChatMessageSchema.parse(data);
}