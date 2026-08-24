import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { ArchitectureResponseSchema } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const { nodes, edges, focusedNodeId, instruction } = await req.json();

    // Map React Flow nodes back to the schema format if needed
    // The client sends nodes which have id, data (label, category, description, purpose, bottleneckRisk)
    const formattedNodes = nodes.map((node: any) => ({
      id: node.id,
      label: node.data?.label || '',
      category: node.data?.category || 'backend',
      description: node.data?.description || '',
      icon: node.data?.icon,
      purpose: node.data?.purpose || '',
      bottleneckRisk: node.data?.bottleneckRisk,
    }));

    const formattedEdges = edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.animated !== false,
    }));

    const focusedNode = formattedNodes.find((n: any) => n.id === focusedNodeId);
    const focusedNodeContext = focusedNode
      ? `Focused Component: "${focusedNode.label}" (ID: ${focusedNodeId}, Category: ${focusedNode.category}, Description: ${focusedNode.description})`
      : 'No specific component is focused';

    const systemPrompt = `You are an expert software architect. Your task is to modify the existing system architecture diagram based on the user's refinement instruction and context.

Here is the current state of the architecture:
- Nodes: ${JSON.stringify(formattedNodes, null, 2)}
- Edges: ${JSON.stringify(formattedEdges, null, 2)}

Context of current action:
- ${focusedNodeContext}
- User Refinement Instruction: "${instruction}"

Instructions for modifying the architecture:
1. Modify the properties (label, description, purpose, bottleneckRisk, category) of the focused node if the user is asking to change it.
2. You can add new nodes if the instruction warrants it (e.g. adding a caching layer should create a new Redis/Memcached node and connect it).
3. You can delete or merge existing nodes if instructed.
4. You can add, delete, or update edges to reflect the new data flow or protocols.
5. KEEP unmodified nodes and edges exactly as they are (preserving their IDs, names, and descriptions) so the layout stays stable.
6. Re-evaluate the updated architecture, compute a new overall architectureScore (0-100), and write updated reasoning, strengths, weaknesses, and tradeoffs.
7. Ensure all node and edge IDs are unique strings. All target and source references in edges must point to existing node IDs.`;

    const result = await generateObject({
      model: google('gemini-3.6-flash'),
      schema: ArchitectureResponseSchema,
      prompt: `Apply the instruction: "${instruction}" to the current architecture diagram, focusing on the component: "${focusedNode?.label || 'none'}".`,
      system: systemPrompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Editing Error:', error);
    return Response.json({ error: 'Failed to modify architecture' }, { status: 500 });
  }
}
