# ✅ TODO - Migração JSON → Supabase

## Etapas do Plano

### 1. Serviço Supabase Dedicado
- [x] Criar `js/supabase-service.js` com todas as operações CRUD e autenticação
- [x] Funções: initSupabase, fetchProducts, addProduct, removeProduct, authenticateAdmin
- [x] Função de seed inicial (seedInitialData) para popular o banco via navegador

### 2. Configuração Simplificada
- [x] Reescrever `js/supabase-config.js` — apenas config + instruções
- [x] Schema SQL separado em `supabase-schema.sql` para facilitar setup

### 3. Script Principal Limpo
- [x] Reescrever `js/script.js` — remover 100% dos fallbacks JSON
- [x] Importar funções do supabase-service.js (via escopo global)
- [x] Simplificar lógica de admin (sem fallback hardcoded, sem fetch de admin.json)

### 4. HTML Atualizado
- [x] Editar `index.html` — adicionar script do supabase-service.js

### 5. Verificação
- [x] Nenhuma referência a JSON nos arquivos .js
- [x] Sistema tenta conectar exclusivamente ao Supabase
