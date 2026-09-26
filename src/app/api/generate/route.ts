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

  document: `You are an expert technical writer and documentation architect. Create a structured document outline based on the user's prompt.
Organize the document into a clear hierarchy:
- Level 1: Main sections (high-level topics)
- Level 2: Sub-sections (detailed topics within a section)
- Level 3: Detail items (specific content blocks)
Connect sections with edges showing their relationship: 'contains' for hierarchy, 'references' for cross-references, 'depends on' for prerequisites.
Include 8-12 sections with a mix of all three levels. Ensure all node and edge IDs are unique strings.`,
};

// Map from diagram type to the React Flow node type string
const NODE_TYPE_MAP: Record<DiagramTypeKey, string> = {
  architecture: 'customArch',
  flowchart: 'flowchart',
  er: 'erEntity',
  sequence: 'sequence',
  bpmn: 'bpmn',
  document: 'document',
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
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
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
      } catch (err) {
        lastError = err;
        console.warn(`Model '${modelName}' failed during generation, trying next model fallback...`, err);
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
