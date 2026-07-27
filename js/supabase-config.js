// ========================================================
// SUBLI.ME — Configuração do Supabase
// ========================================================
// ⚠️ ATENÇÃO: Use SOMENTE a "anon public key"!
//    A chave "service_role" NÃO funciona no navegador.
//
// Instruções:
// 1. Acesse https://supabase.com/dashboard/project/zfhyxjwamuxrfcwjeaia
// 2. Vá em: ⚙️ Settings (engrenagem) → API
// 3. Na seção "Project API keys", copie a chave "anon public"
//    (ela começa com "eyJ..." e tem "role":"anon" no meio)
// 4. Cole no campo "anonKey" abaixo
// 5. Execute o arquivo supabase-schema.sql no SQL Editor
// 6. Recarregue o site
// ========================================================

const SUPABASE_CONFIG = {
  // URL do projeto (já está correta)
  url: 'https://zfhyxjwamuxrfcwjeaia.supabase.co',

  // 👇 COLE AQUI a "anon public key" (NÃO a service_role!)
  anonKey: '',  // <-- COLE A ANON KEY AQUI!

  // Nomes das tabelas no banco de dados
  tables: {
    products: 'products',
    admins: 'admins'
  }
};

