import { z } from 'zod';

export const NodeCategorySchema = z.enum([
  'frontend',
  'backend',
  'database',
  'ai',
  'infrastructure',
]);

export const ArchitectureNodeSchema = z.object({
  id: z.string(),
  label: z.string().describe("Clear name of the component, e.g. 'Redis Cache Cluster'"),
  category: NodeCategorySchema,
  description: z.string().describe("1-2 sentence overview of what this service handles"),
  icon: z.enum(['Layout', 'Server', 'Bot', 'Database', 'Sparkles']).optional(),
  purpose: z.string().describe("Why this technology/pattern was chosen in this architecture"),
  bottleneckRisk: z.string().optional().describe(
    "Only include if this node is a genuine Single Point of Failure (SPOF), severe throughput bottleneck, or rate-limit vulnerability. Do NOT invent trivial risks for standard clients or simple services."
  ),
});

export const ArchitectureEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional().describe("Protocol or action, e.g., 'gRPC', 'HTTPS', 'Pub/Sub'"),
  animated: z.boolean().describe("True for dynamic/streaming/async events; False for direct synchronous links"),
}).describe("Do not create multiple edges between the exact same source and target nodes. If multiple protocols or data flows exist between two nodes, combine them into a single edge and combine the labels (e.g., 'HTTPS & WSS').");

export const ArchitectureResponseSchema = z.object({
  architectureScore: z.number().min(0).max(100).describe("Overall system design score from 0 to 100"),
  scoreReasoning: z.string().describe("High-level architectural evaluation summary"),
  strengths: z.array(z.string()).describe("2-3 key architectural strengths of this design"),
  weaknesses: z.array(z.string()).describe("1-3 key architectural vulnerabilities or missing components"),
  tradeoffs: z.array(z.string()).describe("1-2 key engineering trade-offs made (e.g. consistency vs latency)"),
  nodes: z.array(ArchitectureNodeSchema),
  edges: z.array(ArchitectureEdgeSchema),
});
