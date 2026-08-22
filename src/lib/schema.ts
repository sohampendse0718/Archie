import { z } from 'zod';

export const NodeDataSchema = z.object({
  label: z.string(),
  category: z.enum(['frontend', 'backend', 'database', 'ai', 'infrastructure']),
  description: z.string(),
  purpose: z.string(),
  bottleneckRisk: z.string(),
});

export const NodeSchema = z.object({
  id: z.string(),
  type: z.literal('customArch'),
  position: z.object({
    x: z.number().default(0),
    y: z.number().default(0),
  }).default({ x: 0, y: 0 }),
  data: NodeDataSchema,
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().default(true),
});

export const ArchitectureResponseSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  architectureScore: z.number().min(0).max(100),
  scoreReasoning: z.string(),
});
