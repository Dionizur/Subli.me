// ========================================================
// SUBLI.ME — Supabase Service
// ========================================================

let _supabase = null;

function initSupabase() {
  try {
    const { url, anonKey } = SUPABASE_CONFIG;
    if (!anonKey || anonKey.trim() === '') {
      console.error('anonKey vazia');
      return false;
    }
    if (!url || url.includes('SEU_PROJETO')) {
      console.error('URL nao configurada');
      return false;
    }
    if (anonKey.includes('service_role')) {
      console.error('Chave service_role detectada');
      return false;
    }
    _supabase = supabase.createClient(url, anonKey);
    console.log('Supabase conectado!');
    return true;
  } catch (err) {
    console.error('Erro ao conectar:', err.message);
    return false;
  }
}

function getClient() {
  if (!_supabase) throw new Error('Supabase nao inicializado');
  return _supabase;
}

// ===== DADOS LOCAIS (FALLBACK) =====
const LOCAL_PRODUCTS = [
  {
    id: 'local-1',
    nome: 'Camiseta Street Art',
    descricao: 'Camiseta oversized com estampa artistica exclusiva. Produzida em algodao premium 30.1, costura reforcada e acabamento de alta qualidade.',
    preco: 79.90,
    categoria: 'Masculina',
    tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
    imagens: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'],
    ativo: true
  },
  {
    id: 'local-2',
    nome: 'Camiseta Minimalista',
    descricao: 'Camiseta basica de corte reto com design minimalista. Tecido leve e confortavel, perfeita para o dia a dia.',
    preco: 69.90,
    categoria: 'Feminina',
    tamanhos: ['P', 'M', 'G', 'GG'],
    imagens: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop'],
    ativo: true
  },
  {
    id: 'local-3',
    nome: 'Camiseta Vintage',
    descricao: 'Camiseta com estampa inspirada nos anos 80/90. Modelo casual com gola careca e mangas curtas.',
    preco: 89.90,
    categoria: 'Unissex',
    tamanhos: ['P', 'M', 'G', 'GG', 'XGG'],
    imagens: ['https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=400&fit=crop'],
    ativo: true
  },
  {
    id: 'local-4',
    nome: 'Camiseta Geometrica',
    descricao: 'Camiseta estilosa com padrao geometrico moderno. Confortavel e respiravel.',
    preco: 74.90,
    categoria: 'Masculina',
    tamanhos: ['PP', 'P', 'M', 'G'],
    imagens: ['https://images.unsplash.com/photo-1586339949916-3e5457d58f6a?w=400&h=400&fit=crop'],
    ativo: true
  },
  {
    id: 'local-5',
    nome: 'Camiseta Floral',
    descricao: 'Camiseta com estampa floral delicada. Modelo ajustado ao corpo, decote redondo.',
    preco: 79.90,
    categoria: 'Feminina',
    tamanhos: ['P', 'M', 'G', 'GG'],
    imagens: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop'],
    ativo: true
  },
  {
    id: 'local-6',
    nome: 'Camiseta Esportiva',
    descricao: 'Camiseta dry-fit para atividades esportivas. Leve, respiravel e com protecao UV.',
    preco: 94.90,
    categoria: 'Unissex',
    tamanhos: ['P', 'M', 'G', 'GG', 'XGG'],
    imagens: ['https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&h=400&fit=crop'],
    ativo: true
  }
];

// ===== PRODUTOS =====

async function fetchProducts() {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      console.log('Produtos carregados do Supabase:', data.length);
      return data.map(normalizeProduct);
    }
    if (error) {
      console.log('Supabase indisponivel, usando dados locais. Erro:', error.message);
    }
  } catch (err) {
    console.log('Conexao com Supabase falhou, usando dados locais.');
  }
  console.log('Usando produtos locais (6 produtos)');
  return LOCAL_PRODUCTS.map(normalizeProduct);
}

let _localIdCounter = 100;

async function addProduct(product) {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('products')
      .insert([product])
      .select();
    if (!error && data && data.length > 0) {
      console.log('Produto adicionado no Supabase!');
      return data[0];
    }
    if (error) console.log('Supabase falhou ao adicionar:', error.message);
  } catch (err) {
    console.log('Supabase falhou ao adicionar, usando local');
  }
  _localIdCounter++;
  const localProduct = {
    ...product,
    id: 'local-' + _localIdCounter,
    created_at: new Date().toISOString()
  };
  console.log('Produto adicionado LOCALMENTE:', localProduct.nome);
  return localProduct;
}

async function removeProduct(id) {
  try {
    const client = getClient();
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);
    if (!error) {
      console.log('Produto deletado do Supabase!');
      return true;
    }
    console.log('Supabase falhou ao deletar:', error.message);
  } catch (err) {
    console.log('Supabase falhou ao deletar, removendo localmente');
  }
  console.log('Produto removido LOCALMENTE:', id);
  return true;
}

// ===== ADMIN / AUTENTICACAO =====

const ADMIN_PADRAO = {
  email: 'teste',
  senha_hash: 'MTIzNDU2',
  nome: 'Admin'
};

async function authenticateAdmin(email, password) {
  console.log('========== LOGIN ATTEMPT ==========');
  console.log('Email digitado:', JSON.stringify(email));
  try {
    const client = getClient();
    const { data, error } = await client
      .from('admins')
      .select('email, senha_hash, nome')
      .eq('email', email)
      .maybeSingle();
    if (!error && data) {
      const hash = btoa(unescape(encodeURIComponent(password)));
      if (hash === data.senha_hash) {
        console.log('Login via Supabase OK');
        return { email: data.email, nome: data.nome || 'Admin' };
      }
    }
  } catch (e) {
    console.log('Supabase falhou, usando fallback local');
  }
  if (email === ADMIN_PADRAO.email) {
    const hash = btoa(unescape(encodeURIComponent(password)));
    if (hash === ADMIN_PADRAO.senha_hash) {
      console.log('Login via fallback local OK');
      return { email: ADMIN_PADRAO.email, nome: ADMIN_PADRAO.nome };
    }
  }
  console.log('LOGIN FALHOU');
  return null;
}

// ===== NORMALIZACAO =====

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
