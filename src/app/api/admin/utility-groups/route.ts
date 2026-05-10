import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { requirePermission } from '@/lib/auth';
import { Permissions } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission(req, Permissions.UTILITIES_VIEW);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    
    const { data: groups, error } = await supabase
      .from('utility_groups')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, groups: groups || [] });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, Permissions.UTILITY_EDIT);
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from('utility_groups')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, group: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
