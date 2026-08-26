import { z } from 'zod';

// ═══════════════════════════════════════════════
// Architecture Diagram Schema (original)
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// Flowchart Schema
// ═══════════════════════════════════════════════

export const FlowchartNodeSchema = z.object({
  id: z.string(),
  label: z.string().describe("Short descriptive name for this step"),
  description: z.string().optional().describe("Brief explanation of what happens at this step"),
  shape: z.enum(['process', 'decision', 'terminal', 'io']).describe(
    "Shape of the node: 'terminal' for Start/End, 'process' for action steps, 'decision' for conditional branching (Yes/No), 'io' for input/output operations"
  ),
});

export const FlowchartEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional().describe("Condition or path label, e.g. 'Yes', 'No', 'Error', 'Success'"),
  animated: z.boolean().describe("True for the primary/happy path; false for alternate/error paths"),
});

export const FlowchartResponseSchema = z.object({
  architectureScore: z.number().min(0).max(100).describe("Overall flow design quality score"),
  scoreReasoning: z.string().describe("Evaluation of the flowchart completeness and clarity"),
  strengths: z.array(z.string()).describe("2-3 strengths of this flow design"),
  weaknesses: z.array(z.string()).describe("1-3 weaknesses or missing paths"),
  tradeoffs: z.array(z.string()).describe("1-2 trade-offs in the flow"),
  nodes: z.array(FlowchartNodeSchema),
  edges: z.array(FlowchartEdgeSchema),
});

// ═══════════════════════════════════════════════
// Entity-Relationship Schema
// ═══════════════════════════════════════════════

export const ERAttributeSchema = z.object({
  name: z.string().describe("Column/field name"),
  type: z.string().describe("Data type, e.g. 'UUID', 'VARCHAR(255)', 'INT', 'TIMESTAMP'"),
  isPrimaryKey: z.boolean().optional().describe("True if this is a primary key"),
  isForeignKey: z.boolean().optional().describe("True if this is a foreign key referencing another entity"),
});

export const ERNodeSchema = z.object({
  id: z.string(),
  label: z.string().describe("Entity/table name, e.g. 'users', 'orders'"),
  description: z.string().optional().describe("Brief purpose of this entity"),
  attributes: z.array(ERAttributeSchema).describe("List of columns/fields for this entity. Include 4-8 realistic attributes with proper types."),
});

export const EREdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional().describe("Relationship type, e.g. '1:N', 'N:M', '1:1', 'has_many', 'belongs_to'"),
  animated: z.boolean().describe("True for cascading/dependent relationships; false for reference-only"),
});

export const ERResponseSchema = z.object({
  architectureScore: z.number().min(0).max(100).describe("Database design quality score"),
  scoreReasoning: z.string().describe("Evaluation of normalization, indexing strategy, and relationships"),
  strengths: z.array(z.string()).describe("2-3 strengths of this schema design"),
  weaknesses: z.array(z.string()).describe("1-3 missing indexes, normalization issues, or design weaknesses"),
  tradeoffs: z.array(z.string()).describe("1-2 trade-offs (e.g. normalization vs performance)"),
  nodes: z.array(ERNodeSchema),
  edges: z.array(EREdgeSchema),
});

// ═══════════════════════════════════════════════
// Sequence Diagram Schema
// ═══════════════════════════════════════════════

export const SequenceNodeSchema = z.object({
  id: z.string(),
  label: z.string().describe("Participant name, e.g. 'User', 'API Gateway', 'Database'"),
  description: z.string().optional().describe("Role of this participant in the flow"),
  participantType: z.enum(['actor', 'service', 'database', 'external']).describe(
    "'actor' for human users/clients, 'service' for backend services/APIs, 'database' for data stores, 'external' for third-party systems"
  ),
});

export const SequenceEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional().describe("Message/action label, e.g. 'POST /login', 'SELECT query', 'JWT token'"),
  animated: z.boolean().describe("True for async messages; false for synchronous request-response"),
});

export const SequenceResponseSchema = z.object({
  architectureScore: z.number().min(0).max(100).describe("Sequence flow quality score"),
  scoreReasoning: z.string().describe("Evaluation of the interaction flow clarity and completeness"),
  strengths: z.array(z.string()).describe("2-3 strengths of this interaction design"),
  weaknesses: z.array(z.string()).describe("1-3 missing error paths or incomplete flows"),
  tradeoffs: z.array(z.string()).describe("1-2 design trade-offs"),
  nodes: z.array(SequenceNodeSchema),
  edges: z.array(SequenceEdgeSchema),
});

// ═══════════════════════════════════════════════
// BPMN Schema
// ═══════════════════════════════════════════════

export const BPMNNodeSchema = z.object({
  id: z.string(),
  label: z.string().describe("Name of this BPMN element"),
  description: z.string().optional().describe("What happens at this step"),
  shape: z.enum(['task', 'event', 'gateway']).describe(
    "'event' for start/end/intermediate events, 'task' for activities/work items, 'gateway' for branching/merging decisions"
  ),
  taskType: z.enum(['user', 'service', 'script']).optional().describe("Required when shape is 'task'"),
  eventType: z.enum(['start', 'end', 'intermediate']).optional().describe("Required when shape is 'event'"),
  gatewayType: z.enum(['exclusive', 'parallel', 'inclusive']).optional().describe("Required when shape is 'gateway'"),
});

export const BPMNEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional().describe("Transition condition or flow label"),
  animated: z.boolean().describe("True for the primary flow; false for exception/alternative flows"),
});

export const BPMNResponseSchema = z.object({
  architectureScore: z.number().min(0).max(100).describe("Business process quality score"),
  scoreReasoning: z.string().describe("Evaluation of process completeness and BPMN correctness"),
  strengths: z.array(z.string()).describe("2-3 strengths of this process design"),
  weaknesses: z.array(z.string()).describe("1-3 missing steps or process gaps"),
  tradeoffs: z.array(z.string()).describe("1-2 process trade-offs"),
  nodes: z.array(BPMNNodeSchema),
  edges: z.array(BPMNEdgeSchema),
});

// ═══════════════════════════════════════════════
// Document Schema
// ═══════════════════════════════════════════════

export const DocumentNodeSchema = z.object({
  id: z.string(),
  label: z.string().describe("Section heading"),
  description: z.string().optional().describe("Content summary or key points for this section"),
  level: z.number().min(1).max(3).describe("Heading level: 1 for top sections, 2 for sub-sections, 3 for detail sections"),
});

export const DocumentEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional().describe("Relationship between sections, e.g. 'contains', 'references', 'depends on'"),
  animated: z.boolean().describe("True for primary hierarchy; false for cross-references"),
});

export const DocumentResponseSchema = z.object({
  architectureScore: z.number().min(0).max(100).describe("Document structure quality score"),
  scoreReasoning: z.string().describe("Evaluation of document organization and completeness"),
  strengths: z.array(z.string()).describe("2-3 strengths of this document structure"),
  weaknesses: z.array(z.string()).describe("1-3 missing sections or structural issues"),
  tradeoffs: z.array(z.string()).describe("1-2 structural trade-offs"),
  nodes: z.array(DocumentNodeSchema),
  edges: z.array(DocumentEdgeSchema),
});

// ═══════════════════════════════════════════════
// Schema registry — lookup by diagram type
// ═══════════════════════════════════════════════

export const DIAGRAM_SCHEMAS = {
  architecture: ArchitectureResponseSchema,
  flowchart: FlowchartResponseSchema,
  er: ERResponseSchema,
  sequence: SequenceResponseSchema,
  bpmn: BPMNResponseSchema,
  document: DocumentResponseSchema,
} as const;

export type DiagramTypeKey = keyof typeof DIAGRAM_SCHEMAS;
