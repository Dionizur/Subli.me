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
 * @param {string} email - Email ou usuário do admin
 * @param {string} password - Senha em texto puro
 * @returns {Promise<Object|null>} { email, nome } ou null
 */
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
      console.error('❌ Erro SQL ao buscar admin:', error.message, error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ Admin não encontrado no banco:', email);
      console.warn('   → Verifique se o SQL foi executado no Supabase SQL Editor');
      console.warn('   → Verifique se a tabela "admins" existe e tem o registro');
      return null;
    }

    console.log('✅ Admin encontrado no banco:', data.email);

    // Verifica senha com hash base64 (compatível com o schema existente)
    const hash = btoa(unescape(encodeURIComponent(password)));
    console.log('   Hash esperado:', data.senha_hash);
    console.log('   Hash gerado: ', hash);

    if (hash === data.senha_hash) {
      console.log('✅ Senha correta!');
      return { email: data.email, nome: data.nome || 'Admin' };
    }

    console.warn('⚠️ Senha incorreta para:', email);
    return null;
  } catch (err) {
    console.error('❌ Erro na autenticação:', err);
    return null;
  }
}

// ===== NORMALIZAÇÃO =====

/**
 * Normaliza um produto do banco para o formato usado no frontend.
 * Garante que 'imagens' seja sempre um array.
 */
function normalizeProduct(p) {
  return {
    ...p,
    imagens: Array.isArray(p.imagens) && p.imagens.length > 0
      ? p.imagens
      : (p.imagem ? [p.imagem] : [])
  };
}

/**
 * Retorna o placeholder padrão quando não há imagem.
 */
function getPlaceholder() {
  return 'images/placeholder.svg';
}

// ===== SEED INICIAL (OPCIONAL) =====
// Use esta função UMA VEZ para popular o banco com dados iniciais.
// Execute no console do navegador: seedInitialData()

async function seedInitialData() {
  const products = [
    {
      nome: 'Camiseta Street Art',
      descricao: 'Camiseta oversized com estampa artística exclusiva. Produzida em algodão premium 30.1, costura reforçada e acabamento de alta qualidade. Ideal para looks urbanos e despojados.',
      preco: 79.90,
      categoria: 'Masculina',
      tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
      imagens: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
      ativo: true
    },
    {
      nome: 'Camiseta Minimalista',
      descricao: 'Camiseta básica de corte reto com design minimalista. Tecido leve e confortável, perfeita para o dia a dia. Disponível em diversas cores.',
      preco: 69.90,
      categoria: 'Feminina',
      tamanhos: ['P', 'M', 'G', 'GG'],
      imagens: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop'],
      ativo: true
    },
    {
      nome: 'Camiseta Vintage',
      descricao: 'Camiseta com estampa inspirada nos anos 80/90. Modelo casual com gola careca e mangas curtas. Toque macio e caimento perfeito.',
      preco: 89.90,
      categoria: 'Unissex',
      tamanhos: ['P', 'M', 'G', 'GG', 'XGG'],
      imagens: ['https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=400&fit=crop'],
      ativo: true
    },
    {
      nome: 'Camiseta Geométrica',
      descricao: 'Camiseta estilosa com padrão geométrico moderno. Confortável e respirável, produzida com material de alta durabilidade.',
      preco: 74.90,
      categoria: 'Masculina',
      tamanhos: ['PP', 'P', 'M', 'G'],
      imagens: ['https://images.unsplash.com/photo-1586339949916-3e5457d58f6a?w=400&h=400&fit=crop'],
      ativo: true
    },
    {
      nome: 'Camiseta Floral',
      descricao: 'Camiseta com estampa floral delicada. Modelo ajustado ao corpo, decote redondo. Perfeita para um visual romântico e moderno.',
      preco: 79.90,
      categoria: 'Feminina',
      tamanhos: ['P', 'M', 'G', 'GG'],
      imagens: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop'],
      ativo: true
    },
    {
      nome: 'Camiseta Esportiva',
      descricao: 'Camiseta dry-fit para atividades esportivas. Leve, respirável e com proteção UV. Estampa reflectiva para segurança noturna.',
      preco: 94.90,
      categoria: 'Unissex',
      tamanhos: ['P', 'M', 'G', 'GG', 'XGG'],
      imagens: ['https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&h=400&fit=crop'],
      ativo: true
    }
  ];

  try {
    const client = getClient();
    const { data, error } = await client.from('products').insert(products).select();

    if (error) {
      console.error('❌ Erro ao executar seed:', error.message);
      return;
    }

    console.log(`✅ Seed concluído! ${data.length} produtos inseridos.`);
    return data;
  } catch (err) {
    console.error('❌ Erro no seed:', err);
  }
}

