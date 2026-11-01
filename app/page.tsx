import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/config';
import type { Post, PublicState, Winner } from '@/lib/types';
import MoApp from '@/components/MoApp';

export const dynamic = 'force-dynamic';

async function load() {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  try {
    const [st, posts, winners] = await Promise.all([
      sb.rpc('mo_public_state'),
      sb.from('mo_posts').select('id, short_id, image_url, caption, x_handle, created_at').order('created_at', { ascending: false }).limit(300),
      sb.from('mo_winners').select('*', { count: 'exact' }).order('round_id', { ascending: false }).range(0, 7),
    ]);
    const state = (st.data as PublicState) || null;
    let counts: Record<number, number> = {};
    if (state?.round?.id) {
      const { data } = await sb.from('mo_vote_counts').select('post_id, votes').eq('round_id', state.round.id);
      (data || []).forEach((r: any) => (counts[r.post_id] = r.votes));
    }
    return {
      state,
      posts: (posts.data as Post[]) || [],
      winners: (winners.data as Winner[]) || [],
      winnersTotal: winners.count || 0,
      counts,
    };
  } catch {
    return { state: null, posts: [], winners: [], winnersTotal: 0, counts: {} };
  }
}

export default async function Page() {
  const data = await load();
  return <MoApp initial={data} />;
}
