// ========================================================
// SUBLI.ME — Supabase Service
// ========================================================
// Serviço dedicado para todas as operações com o Supabase.
// Nenhum fallback para JSON — tudo vem do banco.
// ========================================================

// ===== INICIALIZAÇÃO =====
let _supabase = null;
let _initialized = false;

/**
 * Inicializa a conexão com o Supabase.
 * Retorna true se conectou, false caso contrário.
 */
function initSupabase() {
  try {
    const { url, anonKey } = SUPABASE_CONFIG;

    // Verificações de configuração
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

    // Verifica se parece service_role (não deve ser usada no frontend)
    if (anonKey.includes('service_role')) {
      showDiagnostic('❌', 'Você usou a chave "service_role"! Use a "anon public key". Veja as instruções no supabase-config.js.');
      console.error('❌ SUPABASE: Chave service_role detectada. Use a anon public key.');
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

/**
 * Mostra um diagnóstico visual na página.
 */
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

  // Auto remove após 15s
  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.5s';
    setTimeout(() => div.remove(), 600);
  }, 15000);
}

/**
 * Retorna o cliente Supabase já inicializado.
 */
function getClient() {
  if (!_supabase) throw new Error('Supabase não foi inicializado. Chame initSupabase() primeiro.');
  return _supabase;
}

// ===== PRODUTOS =====

/**
 * Busca todos os produtos ativos do banco.
 * @returns {Promise<Array>} Lista de produtos normalizados
 */
async function fetchProducts() {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('ativo', true)
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

/**
 * Adiciona um novo produto no banco.
 * @param {Object} product - Dados do produto (sem id, created_at)
 * @returns {Promise<Object|null>} Produto criado ou null
 */
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

/**
 * Remove um produto (soft delete — marca como inativo).
 * @param {string|number} id - ID do produto
 * @returns {Promise<boolean>} true se removeu com sucesso
 */
async function removeProduct(id) {
  try {
    const client = getClient();
    const { error } = await client
      .from('products')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao remover produto:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Erro ao remover produto:', err);
    return false;
  }
}

// ===== ADMIN / AUTENTICAÇÃO =====

/**
 * Autentica um administrador.
 * Aceita tanto senha em hash (MTIzNDU2) quanto texto puro (123456).
 * @param {string} email - Email ou usuário do admin
 * @param {string} password - Senha em texto puro
 * @returns {Promise<Object|null>} { email, nome } ou null
 */
async function authenticateAdmin(email, password) {
  try {
    const client = getClient();

    console.log('🔍 Buscando admin:', `"${email}"`);

    const { data, error } = await client
      .from('admins')
      .select('email, senha_hash, nome')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro SQL ao buscar admin:', error.message);
      return null;
    }

    if (!data) {
      console.warn(`⚠️ Admin "${email}" não encontrado no banco.`);
      console.warn('   O admin padrão é: email="teste", senha="123456"');
      return null;
    }

    console.log('✅ Admin encontrado:', data.email);

    // ===== VERIFICAÇÃO INTELIGENTE =====
    // Aceita tanto HASH (MTIzNDU2) quanto TEXTO PURO (123456)
    const senhaNoBanco = data.senha_hash;
    const hashDaDigitada = btoa(unescape(encodeURIComponent(password)));

    console.log('   🔐 Comparando:');
    console.log('      - Hash digitado:', hashDaDigitada);
    console.log('      - No banco:', senhaNoBanco);

    // Aceita se: hash bate OU texto puro bate
    if (hashDaDigitada === senhaNoBanco || password === senhaNoBanco) {
      console.log('✅ Senha correta! Login autorizado.');
      return { email: data.email, nome: data.nome || 'Admin' };
    }

    console.warn(`⚠️ Senha incorreta para "${email}"`);
    return null;
  } catch (err) {
    console.error('❌ Erro na autenticação:', err.message);
    return null;
  }
}

/**
 * CORREÇÃO RÁPIDA: Atualiza o hash da senha do admin no banco.
 * Execute no console do navegador: await fixAdminHash()
 */
async function fixAdminHash() {
  try {
    const client = getClient();

    const hashCorreto = btoa(unescape(encodeURIComponent('123456')));
    console.log('🔧 Hash correto para senha 123456:', hashCorreto);

    const { data: adminAtual, error: selectError } = await client
      .from('admins')
      .select('*')
      .eq('email', 'teste')
      .maybeSingle();

    if (selectError) {
      console.error('❌ Erro ao buscar admin:', selectError.message);
      return;
    }

    if (!adminAtual) {
      console.error('❌ Admin "teste" não encontrado.');
      return;
    }

    console.log('📋 Admin atual:', adminAtual);
    console.log('   Hash atual no banco:', adminAtual.senha_hash);
    console.log('   Hash que deveria ser:', hashCorreto);

    if (adminAtual.senha_hash === hashCorreto) {
      console.log('✅ Hash já está correto!');
      return;
    }

    const { error: updateError } = await client
      .from('admins')
      .update({ senha_hash: hashCorreto })
      .eq('email', 'teste');

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError.message);
      return;
    }

    console.log('✅ Hash atualizado! Tente logar: teste / 123456');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

/**
 * Testa a conexão e as tabelas do Supabase.
 * Chame no console: await testSupabaseConnection()
 */
async function testSupabaseConnection() {
  console.log('========================================');
  console.log('🔍 DIAGNÓSTICO SUPABASE');
  console.log('========================================');

  try {
    const client = getClient();
    console.log('✅ Cliente Supabase inicializado');
  } catch (err) {
    console.error('❌ Cliente NÃO inicializado:', err.message);
    return;
  }

  const client = getClient();

  console.log('\n📋 Testando tabela "admins"...');
  try {
    const { data, error } = await client.from('admins').select('*');
    if (error) {
      console.error('❌ Erro:', error.message, 'Código:', error.code);
    } else {
      console.log(`✅ Existe! ${data.length} registro(s):`);
      data.forEach(a => console.log(`   - "${a.email}" hash="${a.senha_hash}" nome="${a.nome}"`));
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message);
  }

  console.log('\n📋 Testando tabela "products"...');
  try {
    const { data, error } = await client.from('products').select('*').limit(3);
    if (error) {
      console.error('❌ Erro:', error.message, 'Código:', error.code);
    } else {
      console.log(`✅ Existe! ${data.length} registro(s).`);
    }
  } catch (err) {
    console.error('❌ Exceção:', err.message);
  }

  console.log('\n========================================');
  console.log('📌 Acesse: https://supabase.com/dashboard/project/zfhyxjwamuxrfcwjeaia');
  console.log('   SQL Editor → New Query → Cole supabase-schema.sql → Run');
  console.log('========================================');
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

// ===== SEED INICIAL (OPCIONAL) =====
// Execute no console: await seedInitialData()

async function seedInitialData() {
  const products = [
    { nome: 'Camiseta Street Art', descricao: 'Camiseta oversized com estampa artística exclusiva.', preco: 79.90, categoria: 'Masculina', tamanhos: ['PP','P','M','G','GG'], imagens: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'], ativo: true },
    { nome: 'Camiseta Minimalista', descricao: 'Camiseta básica de corte reto com design minimalista.', preco: 69.90, categoria: 'Feminina', tamanhos: ['P','M','G','GG'], imagens: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop'], ativo: true },
    { nome: 'Camiseta Vintage', descricao: 'Camiseta com estampa inspirada nos anos 80/90.', preco: 89.90, categoria: 'Unissex', tamanhos: ['P','M','G','GG','XGG'], imagens: ['https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=400&fit=crop'], ativo: true },
    { nome: 'Camiseta Geométrica', descricao: 'Camiseta estilosa com padrão geométrico moderno.', preco: 74.90, categoria: 'Masculina', tamanhos: ['PP','P','M','G'], imagens: ['https://images.unsplash.com/photo-1586339949916-3e5457d58f6a?w=400&h=400&fit=crop'], ativo: true },
    { nome: 'Camiseta Floral', descricao: 'Camiseta com estampa floral delicada.', preco: 79.90, categoria: 'Feminina', tamanhos: ['P','M','G','GG'], imagens: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop'], ativo: true },
    { nome: 'Camiseta Esportiva', descricao: 'Camiseta dry-fit para atividades esportivas.', preco: 94.90, categoria: 'Unissex', tamanhos: ['P','M','G','GG','XGG'], imagens: ['https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&h=400&fit=crop'], ativo: true }
  ];

  try {
    const client = getClient();
    const { data, error } = await client.from('products').insert(products).select();
    if (error) {
      console.error('❌ Erro no seed:', error.message);
      return;
    }
    console.log(`✅ Seed concluído! ${data.length} produtos inseridos.`);
    return data;
  } catch (err) {
    console.error('❌ Erro no seed:', err);
  }
}
</｜｜DSML｜｜parameter>
</create_file>
