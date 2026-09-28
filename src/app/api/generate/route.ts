import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { DIAGRAM_SCHEMAS, type DiagramTypeKey } from '@/lib/schema';

const SYSTEM_PROMPTS: Record<DiagramTypeKey, string> = {
  architecture: `You are an expert software architect. Analyze the user's prompt and design a scalable, robust system architecture. 
Break down the system into distinct nodes with clear categories: 'frontend', 'backend', 'database', 'ai', or 'infrastructure'.
Connect these nodes logically via edges, using the source and target node IDs.
Critically evaluate the architecture, provide a score from 0 to 100 indicating its quality, scalability, and robustness, and write a detailed reasoning for the score. 
Identify potential bottlenecks and note them in the bottleneckRisk field for each node.
Ensure all node and edge IDs are unique strings. Ensure all target and source references in edges refer to existing node IDs.`,

  flowchart: `You are an expert process designer. Create a detailed flowchart based on the user's prompt.
Use these shapes correctly:
- 'terminal' for Start and End nodes (every flowchart must have exactly one Start and one End)
- 'process' for action/processing steps
- 'decision' for conditional branching points (must have at least two outgoing edges, labeled 'Yes'/'No' or similar)
- 'io' for input/output operations (user input, file read/write, API calls, display output)
Connect nodes in logical flow order. For decision nodes, always label the outgoing edges with the conditions.
Generate 8-15 nodes for a comprehensive flowchart. Ensure all node and edge IDs are unique strings.`,

  er: `You are an expert database designer. Create a detailed Database Schema diagram based on the user's prompt.
For each entity (table), include 4-8 realistic attributes with proper SQL data types.
Mark primary keys (isPrimaryKey: true) and foreign keys (isForeignKey: true) correctly.
Use proper relationship labels on edges: '1:1', '1:N', 'N:M', 'has_many', 'belongs_to'.
Follow normalization best practices (at least 3NF). Include timestamps (created_at, updated_at) where appropriate.
Generate 4-8 entities with proper relationships between them. Ensure all node and edge IDs are unique strings.`,

  sequence: `You are an expert systems interaction designer. Create a detailed sequence diagram based on the user's prompt.
Identify all participants and classify them:
- 'actor' for human users or client applications
- 'service' for backend services, APIs, or microservices
- 'database' for data stores (SQL, NoSQL, caches)
- 'external' for third-party services or external APIs
Show the complete message flow between participants. Label edges with specific actions (e.g., 'POST /api/login', 'SELECT * FROM users', 'JWT token').
Use animated=false for synchronous request-response and animated=true for async events/callbacks.
Generate 4-8 participants with 8-15 interaction edges. Ensure all node and edge IDs are unique strings.`,

  bpmn: `You are an expert business process modeler. Create a detailed BPMN (Business Process Model and Notation) diagram based on the user's prompt.
Use these element types correctly:
- Events (shape: 'event'): Always include a Start event (eventType: 'start') and End event (eventType: 'end'). Use 'intermediate' for timer waits, message catches, etc.
- Tasks (shape: 'task'): For work activities. Set taskType to 'user' for manual tasks, 'service' for automated/API tasks, 'script' for computation tasks.
- Gateways (shape: 'gateway'): For branching. Set gatewayType to 'exclusive' for XOR (one path), 'parallel' for AND (all paths), 'inclusive' for OR (one or more paths).
Every BPMN diagram must start with a Start event and end with an End event.
Generate 8-15 elements with proper flow connections. Ensure all node and edge IDs are unique strings.`,

  erd: `You are an expert database architect specializing in conceptual modeling using Chen's Entity-Relationship (ER) notation.
Create a conventional, academic ER diagram based on the user's prompt.

Use these node types exactly:
- 'entity': Strong Entity — a real-world object with independent existence (e.g. Student, Course, Employee)
- 'weak_entity': Weak Entity — an entity that depends on a strong entity for its existence (e.g. Dependent of Employee)
- 'relationship': Relationship diamond — connects two or more entities (e.g. Enrolls, Works_In, Manages)
- 'identifying_relationship': Identifying relationship diamond — connects a strong entity to its weak entity
- 'attribute': Regular attribute oval — a property of an entity or relationship
- 'key_attribute': Key attribute oval — the primary identifier of an entity (underlined in textbooks)
- 'multivalued_attribute': Multivalued attribute (double oval) — can have multiple values (e.g. PhoneNumbers)
- 'derived_attribute': Derived attribute (dashed oval) — computed from other attributes (e.g. Age from DateOfBirth)

Strict Rules:
1. Entities are NEVER directly connected to each other. They MUST connect through a relationship node.
2. Every attribute node must be connected via an edge to its parent entity or relationship node.
3. Every entity should have at least one key_attribute (primary key).
4. Edges between entities and relationships must include cardinality labels: '1', 'N', 'M', or structural like '(1,1)', '(0,N)', 'total', 'partial'.
5. Generate at least 4 strong entities, their key attributes, 2-3 regular attributes each, and 3+ relationships between them.
6. Ensure all node IDs and edge IDs are unique strings. All edge source/target IDs must reference existing node IDs.
7. Set animated: false for all edges.`,
};

// Map from diagram type to the React Flow node type string
const NODE_TYPE_MAP: Record<DiagramTypeKey, string> = {
  architecture: 'customArch',
  flowchart: 'flowchart',
  er: 'erEntity',
  sequence: 'sequence',
  bpmn: 'bpmn',
  erd: 'erdNode',
};

export async function POST(req: Request) {
  try {
    const { prompt, diagramType = 'architecture' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'A valid text prompt is required.' }, { status: 400 });
    }

    const typeKey = (diagramType in DIAGRAM_SCHEMAS ? diagramType : 'architecture') as DiagramTypeKey;
    const schema = DIAGRAM_SCHEMAS[typeKey];
    const systemPrompt = SYSTEM_PROMPTS[typeKey];
    const nodeType = NODE_TYPE_MAP[typeKey];

    // Fallback model list in order of preference
    const modelsToTry = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-pro-latest',
    ];

    let result = null;
    let lastError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        result = await generateObject({
          model: google(modelName),
          schema,
          prompt,
          system: systemPrompt,
        });
        if (result?.object) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model '${modelName}' failed during generation: ${err?.message || 'Unknown error'}, trying next model fallback...`);
      }
    }

    if (!result?.object) {
      const errMessage = lastError instanceof Error ? lastError.message : String(lastError);
      console.error('All Gemini model generation attempts failed:', errMessage);
      return Response.json(
        { error: `Generation failed: ${errMessage || 'Unable to connect to Google Gemini AI.'}` },
        { status: 500 }
      );
    }

    // Attach the nodeType so the client knows which React Flow node component to use
    return Response.json({
      ...result.object,
      _nodeType: nodeType,
      _diagramType: typeKey,
    });
  } catch (error: any) {
    console.error('Generation Endpoint Error:', error);
    const msg = error?.message || 'An unexpected server error occurred.';
    return Response.json({ error: `Failed to generate diagram: ${msg}` }, { status: 500 });
  }
}
