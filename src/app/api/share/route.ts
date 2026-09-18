import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 7; i++) {
    if (i === 3) { code += '-'; continue; }
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. "ARC-7K9P"
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, permission = 'view' } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify the requesting user owns this project
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: arch, error: archError } = await supabase
      .from('architectures')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (archError || !arch) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    // Check if a share code already exists for this project
    const { data: existing } = await supabase
      .from('shared_projects')
      .select('share_code, permission')
      .eq('project_id', projectId)
      .single();

    if (existing) {
      // Update permission if changed
      if (existing.permission !== permission) {
        await supabase
          .from('shared_projects')
          .update({ permission })
          .eq('project_id', projectId);
      }
      return NextResponse.json({ code: existing.share_code, permission });
    }

    // Generate a unique code (retry on collision)
    let code = '';
    let attempts = 0;
    while (attempts < 10) {
      const candidate = generateShareCode();
      const { data: collision } = await supabase
        .from('shared_projects')
        .select('id')
        .eq('share_code', candidate)
        .single();
      if (!collision) { code = candidate; break; }
      attempts++;
    }

    if (!code) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from('shared_projects')
      .insert({ project_id: projectId, share_code: code, permission });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ code, permission });
  } catch (err) {
    console.error('[/api/share]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
