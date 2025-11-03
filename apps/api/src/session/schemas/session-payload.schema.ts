import { z } from 'zod';

export const SessionPayloadSchema = z.object({
  sid: z.string(),
  userId: z.string(),
  ua: z.string(),
  ip: z.string(),
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;
