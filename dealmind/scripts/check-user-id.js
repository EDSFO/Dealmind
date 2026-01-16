import { createClient } from '../lib/supabase/server.js';

(async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    console.log('=== DADOS DO USUÁRIO SUPABASE ===');
    console.log('ID:', session.user.id);
    console.log('Email:', session.user.email);
    console.log('Nome:', session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'N/A');
  } else {
    console.log('Nenhum usuário logado');
  }
})();
