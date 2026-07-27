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
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaHl4andhbXV4cmZjd2plYWlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDkzNDQyOCwiZXhwIjoyMTAwNTEwNDI4fQ.WD8V___GWjpo0U9vZPGzsa3wORlyorus_voR09v21k4',  // <-- COLE A ANON KEY AQUI!

  // Nomes das tabelas no banco de dados
  tables: {
    products: 'products',
    admins: 'admins'
  }
};

