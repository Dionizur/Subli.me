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

// ===== PRODUTOS =====

async function fetchProducts() {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Erro ao buscar produtos:', error.message);
      return [];
    }
    return (data || []).map(normalizeProduct);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
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
      console.error('Erro ao adicionar produto:', error.message);
      return null;
    }
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Erro ao adicionar produto:', err);
    return null;
  }
}

async function removeProduct(id) {
  try {
    const client = getClient();
    console.log('Deletando produto ID:', id);
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Erro ao deletar:', error.message);
      return false;
    }
    console.log('Produto deletado!');
    return true;
  } catch (err) {
    console.error('Erro ao deletar:', err);
    return false;
  }
}

// ===== ADMIN / AUTENTICACAO =====

// Admin padrao: teste / 123456
const ADMIN_PADRAO = {
  email: 'teste',
  senha_hash: 'MTIzNDU2', // hash base64 de "123456"
  nome: 'Admin'
};

async function authenticateAdmin(email, password) {
  console.log('========== LOGIN ATTEMPT ==========');
  console.log('Email digitado:', JSON.stringify(email));
  console.log('Senha digitada:', JSON.stringify(password));
  console.log('Admin padrao local email:', JSON.stringify(ADMIN_PADRAO.email));
  console.log('Hash esperado local:', ADMIN_PADRAO.senha_hash);
  console.log('Hash gerado de "' + password + '":', btoa(unescape(encodeURIComponent(password))));

  // 1. Tenta autenticar pelo Supabase
  try {
    const client = getClient();
    console.log('Consultando tabela admins no Supabase...');
    const { data, error } = await client
      .from('admins')
      .select('email, senha_hash, nome')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.log('Erro na consulta Supabase:', error.message, '(usando fallback local)');
    } else if (data) {
      console.log('Admin encontrado no Supabase:', data.email);
      const hash = btoa(unescape(encodeURIComponent(password)));
      console.log('Hash BD:', data.senha_hash, '| Hash gerado:', hash);
      if (hash === data.senha_hash) {
        console.log('Login via Supabase OK');
        return { email: data.email, nome: data.nome || 'Admin' };
      }
    } else {
      console.log('Nenhum admin encontrado no Supabase para:', email);
    }
  } catch (e) {
    console.log('Excecao ao consultar Supabase:', e.message, '(usando fallback local)');
  }

  // 2. Fallback: compara com o admin padrao local
  console.log('--- Tentando fallback local ---');
  console.log('Comparando emails:', JSON.stringify(email), '===', JSON.stringify(ADMIN_PADRAO.email), '?');

  if (email === ADMIN_PADRAO.email) {
    const hash = btoa(unescape(encodeURIComponent(password)));
    console.log('Hash esperado local:', ADMIN_PADRAO.senha_hash);
    console.log('Hash gerado local:', hash);
    if (hash === ADMIN_PADRAO.senha_hash) {
      console.log('Login via fallback local OK');
      return { email: ADMIN_PADRAO.email, nome: ADMIN_PADRAO.nome };
    }
    console.log('Senha nao confere no fallback local');
    console.log('Dica: O hash de "123456" em base64 eh:', btoa(unescape(encodeURIComponent('123456'))));
  } else {
    console.log('Email nao confere com admin padrao. Use email="teste" (sem espacos)');
  }

  console.log('LOGIN FALHOU');
  console.log('==================================');
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
