import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.toUpperCase().trim();

    if (!code) {
      return NextResponse.json({ error: 'code query param is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Look up the share code
    const { data: share, error: shareError } = await supabase
      .from('shared_projects')
      .select('project_id, permission')
      .eq('share_code', code)
      .single();

    if (shareError || !share) {
      return NextResponse.json({ error: 'Invalid or expired share code' }, { status: 404 });
    }

    // Fetch the full project data
    const { data: arch, error: archError } = await supabase
      .from('architectures')
      .select('id, title, score, nodes, edges, diagram_type, updated_at')
      .eq('id', share.project_id)
      .single();

    if (archError || !arch) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: arch.id,
        title: arch.title,
        score: arch.score,
        nodes: arch.nodes,
        edges: arch.edges,
        diagram_type: arch.diagram_type,
        updated_at: arch.updated_at,
      },
      permission: share.permission,
      code,
    });
  } catch (err) {
    console.error('[/api/join]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
