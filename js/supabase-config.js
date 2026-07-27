// ========================================================
// SUBLI.ME — Configuração do Supabase
// ========================================================
// Instruções rápidas:
// 1. Crie uma conta grátis em https://supabase.com
// 2. Crie um novo projeto
// 3. Vá em Project Settings > API
// 4. Copie a "Project URL" e a "anon public key"
// 5. Cole nos campos abaixo
// 6. Execute o arquivo supabase-schema.sql no SQL Editor
// 7. Pronto! Recarregue o site.
// ========================================================

const SUPABASE_CONFIG = {
  // 👇 URL do seu projeto Supabase
  url: 'https://SEU_PROJETO.supabase.co',

  // 👇 Anon Key (pública) do seu projeto
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUA_CHAVE_ANON_AQUI',

  // Nomes das tabelas no banco de dados
  tables: {
    products: 'products',
    admins: 'admins'
  }
};

