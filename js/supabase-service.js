// ========================================================
// SUBLI.ME — Supabase Service
// ========================================================
// SEM fallback local — TUDO vem do banco de dados.
// Se o Supabase falhar, retorna erro. Sem dados locais.
// ========================================================

let _supabase = null;

function initSupabase() {
  try {
    const { url, anonKey } = SUPABASE_CONFIG;
    if (!anonKey || anonKey.trim() === '') {
      console.error('❌ SUPABASE: anonKey está vazia!');
      return false;
    }
    if (!url || url.includes('SEU_PROJETO')) {
      console.error('❌ SUPABASE: URL não configurada.');
      return false;
    }
    if (anonKey.includes('service_role')) {
      console.error('❌ SUPABASE: Chave service_role detectada. Use a anon public key.');
      return false;
    }
    _supabase = supabase.createClient(url, anonKey);
    console.log('✅ Supabase conectado!');
    return true;
  } catch (err) {
    console.error('❌ SUPABASE: Erro ao conectar:', err.message);
    return false;
  }
}

function getClient() {
  if (!_supabase) throw new Error('Supabase não foi inicializado.');
  return _supabase;
}

// ===== DIAGNÓSTICO =====
async function testarConexao() {
  console.log('========== DIAGNÓSTICO SUPABASE ==========');
  try {
    const client = getClient();
    console.log('✅ Cliente OK');
    console.log('\n📋 Testando tabela "admins"...');
    const a = await client.from('admins').select('count');
    console.log('   Resposta:', JSON.stringify(a));
    console.log('\n📋 Testando tabela "products"...');
    const p = await client.from('products').select('count');
    console.log('   Resposta:', JSON.stringify(p));
  } catch (err) {
    console.error('❌ Erro no diagnóstico:', err.message);
  }
  console.log('=========================================');
}

// ===== PRODUTOS =====

async function fetchProducts() {
  const client = getClient();
  console.log('🔍 Buscando produtos no banco...');
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ ERRO ao buscar products:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalhes:', error.details);
    console.error('   Hint:', error.hint);
    console.error('   ⚠️ A tabela "products" pode não existir ou a RLS policy pode estar bloqueando.');
    console.error('   → Execute o arquivo supabase-schema.sql no SQL Editor do Supabase');
    return [];
  }

  if (!data || data.length === 0) {
    console.log('⚠️ Tabela products está vazia — nenhum produto encontrado.');
    return [];
  }

  console.log('✅ Produtos carregados do banco:', data.length);
  return data.map(normalizeProduct);
}

async function addProduct(product) {
  const client = getClient();
  console.log('📝 Adicionando produto no banco...');
  const { data, error } = await client
    .from('products')
    .insert([product])
    .select();

  if (error) {
    console.error('❌ ERRO ao adicionar produto:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalhes:', error.details);
    return null;
  }

  if (!data || data.length === 0) {
    console.error('❌ ERRO: produto não retornado após insert.');
    return null;
  }

  console.log('✅ Produto adicionado! ID:', data[0].id);
  return data[0];
}

async function removeProduct(id) {
  const client = getClient();
  console.log('🗑️ Removendo produto ID:', id);
  const { error } = await client
    .from('products')
    .update({ ativo: false })
    .eq('id', id);

  if (error) {
    console.error('❌ ERRO ao remover produto:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalhes:', error.details);
    return false;
  }

  console.log('✅ Produto removido (soft delete) ID:', id);
  return true;
}

// ===== ADMIN / AUTENTICAÇÃO =====
// SEM fallback local — autentica SOMENTE via banco

async function authenticateAdmin(email, password) {
  const client = getClient();
  console.log('🔍 Buscando admin no banco:', `"${email}"`);

  const { data, error } = await client
    .from('admins')
    .select('email, senha_hash, nome')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('❌ ERRO ao buscar admin:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalhes:', error.details);
    console.error('   ⚠️ A tabela "admins" pode não existir!');
    console.error('   → Execute o arquivo supabase-schema.sql no SQL Editor do Supabase');
    return null;
  }

  if (!data) {
    console.warn(`⚠️ Admin "${email}" NÃO encontrado no banco.`);
    console.warn('   → Execute o SQL: INSERT INTO admins (email, senha_hash, nome)');
    console.warn("   → Valores: 'teste', 'MTIzNDU2', 'Admin Teste'");
    console.warn('   → Ou use: email="teste" senha="123456"');
    return null;
  }

  console.log('✅ Admin encontrado:', data.email);

  // Verifica senha
  const hash = btoa(unescape(encodeURIComponent(password)));
  console.log('   Hash no banco:', data.senha_hash);
  console.log('   Hash gerado: ', hash);

  if (hash === data.senha_hash) {
    console.log('✅ Senha correta! Login autorizado.');
    return { email: data.email, nome: data.nome || 'Admin' };
  }

  console.warn('⚠️ Senha incorreta.');
  return null;
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
