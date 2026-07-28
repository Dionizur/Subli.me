// ========================================================
// SUBLI.ME — Supabase Service
// ========================================================
// Serviço dedicado para todas as operações com o Supabase.
// Nenhum fallback para JSON — tudo vem do banco.
// ========================================================

// ===== INICIALIZAÇÃO =====
let _supabase = null;
let _initialized = false;

function initSupabase() {
  try {
    const { url, anonKey } = SUPABASE_CONFIG;

    if (!anonKey || anonKey.trim() === '') {
      showDiagnostic('❌', 'anonKey está vazia! Copie a chave "anon public" do Supabase.');
      console.error('❌ SUPABASE: anonKey está vazia.');
      return false;
    }

    if (!url || url.includes('SEU_PROJETO')) {
      showDiagnostic('❌', 'URL do projeto não configurada.');
      console.error('❌ SUPABASE: URL não configurada.');
      return false;
    }

    if (anonKey.includes('service_role')) {
      showDiagnostic('❌', 'Você usou a chave "service_role"! Use a "anon public key".');
      console.error('❌ SUPABASE: Chave service_role detectada.');
      return false;
    }

    _supabase = supabase.createClient(url, anonKey);
    _initialized = true;
    showDiagnostic('✅', 'Conexão com Supabase estabelecida!');
    console.log('✅ Supabase conectado!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar Supabase:', err);
    showDiagnostic('❌', 'Erro ao conectar: ' + err.message);
    return false;
  }
}

function showDiagnostic(icon, message) {
  const existing = document.getElementById('supabase-diagnostic');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.id = 'supabase-diagnostic';
  div.style.cssText = `
    position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
    z-index: 99999; background: #1a1a2e; color: #fff;
    padding: 20px 28px; border-radius: 12px; font-size: 1rem;
    max-width: 600px; text-align: center; line-height: 1.6;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    border: 2px solid ${icon === '✅' ? '#27ae60' : '#e74c3c'};
    font-family: 'Segoe UI', sans-serif;
  `;
  div.innerHTML = `
    <div style="font-size: 2rem; margin-bottom: 8px;">${icon}</div>
    <div>${message}</div>
    <div style="margin-top: 12px; font-size: 0.85rem; opacity: 0.7;">
      Abra o console (F12) para mais detalhes
    </div>
  `;
  document.body.prepend(div);

  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.5s';
    setTimeout(() => div.remove(), 600);
  }, 15000);
}

function getClient() {
  if (!_supabase) throw new Error('Supabase não foi inicializado. Chame initSupabase() primeiro.');
  return _supabase;
}

// ===== PRODUTOS =====

async function fetchProducts() {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error.message);
      return [];
    }

    return (data || []).map(normalizeProduct);
  } catch (err) {
    console.error('❌ Erro ao buscar produtos:', err);
    return [];
  }
}

async function addProduct(product) {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('products')
      .insert([product])
      .select();

    if (error) {
      console.error('❌ Erro ao adicionar produto:', error.message);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('❌ Erro ao adicionar produto:', err);
    return null;
  }
}

async function removeProduct(id) {
  try {
    const client = getClient();
    console.log('🗑️ Deletando produto ID:', id);

    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar produto:', error.message);
      console.error('   Código:', error.code);
      console.error('   Detalhes:', error.details);
      return false;
    }

    console.log('✅ Produto DELETADO do banco com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao deletar produto (exceção):', err);
    return false;
  }
}

// ===== ADMIN / AUTENTICAÇÃO =====

async function authenticateAdmin(email, password) {
  try {
    const client = getClient();
    console.log('🔍 Buscando admin:', email);

    const { data, error } = await client
      .from('admins')
      .select('email, senha_hash, nome')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro SQL:', error.message);
      return null;
    }

    if (!data) {
      console.warn('⚠️ Admin não encontrado:', email);
      return null;
    }

    console.log('✅ Admin encontrado!');
    if (password === data.senha_hash) {
      console.log('✅ Login OK!');
      return { email: data.email, nome: data.nome || 'Admin' };
    }

    console.warn('⚠️ Senha incorreta');
    return null;
  } catch (err) {
    console.error('❌ Erro:', err.message);
    return null;
  }
}

// ===== NORMALIZAÇÃO =====

function normalizeProduct(p) {
  return {
    ...p,
    imagens: Array.isArray(p.imagens) && p.imagens.length > 0
      ? p.imagens
      : (p.imagem ? [p.imagem] : [])
  };
}

function getPlaceholder() {
  return 'images/placeholder.svg';
}
