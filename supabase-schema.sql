-- ========================================================
-- SUBLI.ME — Schema do Banco de Dados Supabase
-- ========================================================
-- Instruções:
-- 1. Acesse o Dashboard do Supabase
-- 2. Vá em SQL Editor > New Query
-- 3. Cole TODO este arquivo e execute
-- 4. Pronto! As tabelas e dados iniciais serão criados
-- ========================================================

-- ===== TABELA: products =====
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  categoria TEXT DEFAULT 'Geral',
  tamanhos TEXT[] DEFAULT '{}',
  imagens TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true
);

-- ===== TABELA: admins =====
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT DEFAULT 'Admin'
);

-- ===== INSERT ADMIN PADRÃO =====
-- Login simples (sem hash): compara email e senha exatamente como digitados
-- Email: teste
-- Senha: 123
INSERT INTO admins (email, senha_hash, nome)
VALUES ('teste', '123', 'Admin Teste')
ON CONFLICT (email) DO UPDATE
SET senha_hash = EXCLUDED.senha_hash,
    nome = EXCLUDED.nome;

-- ===== INSERT PRODUTOS INICIAIS =====
INSERT INTO products (nome, descricao, preco, categoria, tamanhos, imagens) VALUES
('Camiseta Street Art', 'Camiseta oversized com estampa artística exclusiva. Produzida em algodão premium 30.1, costura reforçada e acabamento de alta qualidade.', 79.90, 'Masculina', ARRAY['PP','P','M','G','GG'], ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop']),
('Camiseta Minimalista', 'Camiseta básica de corte reto com design minimalista. Tecido leve e confortável, perfeita para o dia a dia.', 69.90, 'Feminina', ARRAY['P','M','G','GG'], ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop']),
('Camiseta Vintage', 'Camiseta com estampa inspirada nos anos 80/90. Modelo casual com gola careca e mangas curtas.', 89.90, 'Unissex', ARRAY['P','M','G','GG','XGG'], ARRAY['https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=400&fit=crop']),
('Camiseta Geométrica', 'Camiseta estilosa com padrão geométrico moderno. Confortável e respirável.', 74.90, 'Masculina', ARRAY['PP','P','M','G'], ARRAY['https://images.unsplash.com/photo-1586339949916-3e5457d58f6a?w=400&h=400&fit=crop']),
('Camiseta Floral', 'Camiseta com estampa floral delicada. Modelo ajustado ao corpo, decote redondo.', 79.90, 'Feminina', ARRAY['P','M','G','GG'], ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop']),
('Camiseta Esportiva', 'Camiseta dry-fit para atividades esportivas. Leve, respirável e com proteção UV.', 94.90, 'Unissex', ARRAY['P','M','G','GG','XGG'], ARRAY['https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&h=400&fit=crop'])
ON CONFLICT DO NOTHING;

-- ===== POLÍTICAS DE SEGURANÇA (RLS) =====
-- Habilita RLS nas tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas (se houver) para evitar conflito
DROP POLICY IF EXISTS "Produtos visíveis para todos" ON products;
DROP POLICY IF EXISTS "Admins visível para autenticação" ON admins;
DROP POLICY IF EXISTS "Produtos inseríveis por anon" ON products;
DROP POLICY IF EXISTS "Produtos atualizáveis por anon" ON products;
DROP POLICY IF EXISTS "Produtos deletáveis por anon" ON products;

-- Produtos: qualquer um pode ler (anon)
CREATE POLICY "Produtos visíveis para todos"
ON products FOR SELECT USING (true);

-- Produtos: qualquer um pode inserir (via anon key)
CREATE POLICY "Produtos inseríveis por anon"
ON products FOR INSERT WITH CHECK (true);

-- Produtos: qualquer um pode atualizar (via anon key)
CREATE POLICY "Produtos atualizáveis por anon"
ON products FOR UPDATE USING (true) WITH CHECK (true);

-- Produtos: qualquer um pode DELETAR (via anon key)
CREATE POLICY "Produtos deletáveis por anon"
ON products FOR DELETE USING (true);

-- Admins: permitir SELECT para autenticação via anon key
CREATE POLICY "Admins visível para autenticação"
ON admins FOR SELECT USING (true);
