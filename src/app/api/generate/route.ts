import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { ArchitectureResponseSchema } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await generateObject({
      model: google('gemini-3.6-flash'),
      schema: ArchitectureResponseSchema,
      prompt,
      system: `You are an expert software architect. Analyze the user's prompt and design a scalable, robust system architecture. 
Break down the system into distinct nodes with clear categories: 'frontend', 'backend', 'database', 'ai', or 'infrastructure'.
Connect these nodes logically via edges, using the source and target node IDs.
Critically evaluate the architecture, provide a score from 0 to 100 indicating its quality, scalability, and robustness, and write a detailed reasoning for the score. 
Identify potential bottlenecks and note them in the bottleneckRisk field for each node.
Ensure all node and edge IDs are unique strings. Ensure all target and source references in edges refer to existing node IDs.`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Generation Error:', error);
    return Response.json({ error: 'Failed to generate architecture' }, { status: 500 });
  }
}
