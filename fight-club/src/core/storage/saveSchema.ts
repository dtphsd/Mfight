import { z } from "zod";

export const saveSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
  state: z.record(z.string(), z.unknown()),
});

export type SaveFile = z.infer<typeof saveSchema>;

