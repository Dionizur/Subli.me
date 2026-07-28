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

// ===== UTILITÁRIOS =====

/**
 * Gera o hash base64 de uma senha (compatível com o schema existente)
 */
function hashPassword(password) {
  return btoa(unescape(encodeURIComponent(password)));
}

/**
 * Diagnóstico completo do Supabase - chame no console: await diagnosticar()
 */
async function diagnosticar() {
  console.log('%c═══════════════════════════════════════════', 'color:#433075');
  console.log('%c       🔍 DIAGNÓSTICO COMPLETO', 'font-size:18px;font-weight:bold;color:#433075');
  console.log('%c═══════════════════════════════════════════', 'color:#433075');

  // 1. Conexão
  try {
    const client = getClient();
    console.log('%c✅ 1. CONEXÃO: Ok!', 'color:green;font-weight:bold');
  } catch (err) {
    console.error('❌ 1. CONEXÃO: Falhou -', err.message);
    console.error('   ⚠️ Verifique a anonKey em supabase-config.js');
    return;
  }

  const client = getClient();

  // 2. Tabela admins
  console.log('\n📋 2. TABELA "admins":');
  try {
    const { data, error } = await client.from('admins').select('*');
    if (error) {
      console.error(`   ❌ ERRO (${error.code}): ${error.message}`);
      console.error('   ⚠️ Execute o supabase-schema.sql no SQL Editor!');
    } else if (!data || data.length === 0) {
      console.warn('   ⚠️ Tabela existe mas está VAZIA!');
      console.warn('   → Execute: INSERT INTO admins (email, senha_hash, nome) VALUES');
      console.warn("     ('teste', 'MTIzNDU2', 'Admin Teste');");
    } else {
      console.log(`   ✅ ${data.length} registro(s) encontrado(s):`);
      data.forEach(a => {
        const hashEsperado = hashPassword('123456');
        const senhaOk = a.senha_hash === hashEsperado;
        console.log(`   👤 Email: "${a.email}"`);
        console.log(`      Hash: "${a.senha_hash}"`);
        console.log(`      Senha "123456" → hash "${hashEsperado}" ${senhaOk ? '✅ CONFERE' : '❌ DIFERENTE'}`);
      });
    }
  } catch (err) {
    console.error('   ❌ Exceção:', err.message);
  }

  // 3. Tabela products
  console.log('\n📋 3. TABELA "products":');
  try {
    const { data, error } = await client.from('products').select('id, nome, preco, ativo').limit(5);
    if (error) {
      console.error(`   ❌ ERRO (${error.code}): ${error.message}`);
      console.error('   ⚠️ Execute o supabase-schema.sql no SQL Editor!');
    } else {
      console.log(`   ✅ ${data.length} produto(s) encontrado(s)`);
      data.forEach(p => console.log(`   📦 ID: ${p.id} | "${p.nome}" | R$ ${p.preco} | Ativo: ${p.ativo}`));
    }
  } catch (err) {
    console.error('   ❌ Exceção:', err.message);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('%c📌 INSTRUÇÕES:', 'font-weight:bold');
  console.log('   Se viu erros acima, faça:');
  console.log('   1. https://supabase.com/dashboard/project/zfhyxjwamuxrfcwjeaia');
  console.log('   2. SQL Editor → New Query');
  console.log('   3. Cole TODO o conteúdo do arquivo supabase-schema.sql');
  console.log('   4. Execute (▶)');
  console.log('═══════════════════════════════════════════\n');
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
    console.log('🗑️ DELETANDO produto ID:', id);

    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao DELETAR produto:', error.message);
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

    // 🔥 FIX: Gera hash base64 da senha digitada para comparar com o banco
    const hash = hashPassword(password);
    console.log('   Senha digitada:', password);
    console.log('   Hash gerado:', hash);
    console.log('   Hash no banco:', data.senha_hash);

    if (hash === data.senha_hash) {
      console.log('✅ Login OK! Hash confere!');
      return { email: data.email, nome: data.nome || 'Admin' };
    }

    console.warn('⚠️ Senha incorreta - hash não confere');
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
