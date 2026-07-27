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
  url: 'https://zfhyxjwamuxrfcwjeaia.supabase.co',

  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaHl4andhbXV4cmZjd2plYWlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDkzNDQyOCwiZXhwIjoyMTAwNTEwNDI4fQ.WD8V___GWjpo0U9vZPGzsa3wORlyorus_voR09v21k4',

  // Nomes das tabelas no banco de dados
  tables: {
    products: 'products',
    admins: 'admins'
  }
};

