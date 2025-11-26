import { z } from 'zod';

export const TokenPayloadSchema = z.object({
  email: z.email().optional(),
  companyId: z.string().optional(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
