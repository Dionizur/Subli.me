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

-- Leitura pública do catálogo. As demais permissões são definidas abaixo.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Produtos visíveis para todos" ON products;
CREATE POLICY "Produtos visíveis para todos" ON products FOR SELECT USING (true);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Execute após supabase-schema.sql. Migração de pedidos e autenticação real.
begin;
create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer
set search_path = public as $$
 select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
-- Remove autenticação antiga que expunha senhas e escrita anônima.
drop policy if exists "Admins visível para autenticação" on public.admins;
revoke all on public.admins from anon, authenticated;
drop policy if exists "Produtos inseríveis por anon" on public.products;
drop policy if exists "Produtos atualizáveis por anon" on public.products;
drop policy if exists "Produtos deletáveis por anon" on public.products;
drop policy if exists "Admin insere produtos" on public.products;
drop policy if exists "Admin atualiza produtos" on public.products;
drop policy if exists "Admin remove produtos" on public.products;
create policy "Admin insere produtos" on public.products for insert to authenticated with check (public.is_admin());
create policy "Admin atualiza produtos" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin remove produtos" on public.products for delete to authenticated using (public.is_admin());
create table if not exists public.order_options (
 id text primary key, tecido text not null, modelo text not null,
 preco numeric(10,2) not null check (preco >= 0), tamanhos text[] not null
);
alter table public.order_options enable row level security;
revoke all on public.order_options from anon, authenticated;
grant select on public.order_options to anon, authenticated;
drop policy if exists "Catalogo de opcoes publico" on public.order_options;
create policy "Catalogo de opcoes publico" on public.order_options for select using (true);
insert into public.order_options (id,tecido,modelo,preco,tamanhos) values
('opcao-1','Algodão','Unissex',69.3,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-2','Algodão','Baby look',66.7,ARRAY['P','M','G','GG','XG','XGG','XGGG']),
('opcao-3','Algodão','Manga longa',81.7,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-4','Algodão premium','Unissex',73.7,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-5','Algodão premium','Feminina',73.7,ARRAY['P','M','G','GG','XG','XGG','XGGG']),
('opcao-6','Algodão premium','Manga longa',80.7,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-7','Algodão estonada','Unissex',83.7,ARRAY['PP','P','M','G','GG','G1','G2','G3']),
('opcao-8','Algodão estonada','Feminina',83.7,ARRAY['P','M','G','GG','G1']),
('opcao-9','Algodão estonada','Manga longa',90.7,ARRAY['P','M','G','GG','G1']),
('opcao-10','Oversized','Algodão suedine',82.8,ARRAY['P','M','G','GG']),
('opcao-11','Oversized','Estonada',97.7,ARRAY['PP','P','M','G','GG','G1','G2']),
('opcao-12','Poliéster','Unissex branca',60.3,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-13','Poliéster','Baby look branca',60.3,ARRAY['P','M','G','GG','XG','XGG','XGGG']),
('opcao-14','Poliéster','Unissex colorida',61.3,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-15','Poliéster','Baby look colorida',61.3,ARRAY['P','M','G','GG','XG','XGG','XGGG']),
('opcao-16','Poliéster','Manga longa',70.8,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-17','Poliviscose','Unissex',66,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-18','Polo','Unissex',79.5,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-19','Infantil','Algodão',53.8,ARRAY['1','2','4','6','8','10','12','14']),
('opcao-20','Infantil','Algodão premium',56.5,ARRAY['1','2','4','6','8','10','12','14']),
('opcao-21','Infantil','Algodão estonada',59.5,ARRAY['1','2','4','6','8','10','12','14']),
('opcao-22','Infantil','Poliéster',49.5,ARRAY['1','2','4','6','8','10','12','14']),
('opcao-23','Infantil','Poliviscose',52.5,ARRAY['1','2','4','6','8','10','12','14']),
('opcao-24','Infantil','Dryfit',53.6,ARRAY['1','2','4','6','8','10','12','14']),
('opcao-25','Moletom','Peluciado',139.5,ARRAY['P','M','G','GG','G1','G2','G3']),
('opcao-26','Moletom','Careca - 2 cabos',121.9,ARRAY['P','M','G','GG','G1','G2','G3']),
('opcao-27','Moletom','Careca - 3 cabos',161.5,ARRAY['P','M','G','GG','G1','G2','G3']),
('opcao-28','Moletom','Canguru estonado',160.5,ARRAY['P','M','G','GG','G1','G2','G3']),
('opcao-29','Moletom','Canguru - 2 cabos',167.5,ARRAY['P','M','G','GG']),
('opcao-30','Moletom','Canguru - 3 cabos',194.5,ARRAY['P','M','G','GG']),
('opcao-31','Dryfit','Unissex',69.3,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG']),
('opcao-32','Dryfit','Manga longa',77.5,ARRAY['PP','P','M','G','GG','XG','XGG','XGGG'])
on conflict (id) do update set tecido=excluded.tecido, modelo=excluded.modelo, preco=excluded.preco, tamanhos=excluded.tamanhos;
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique,
 created_at timestamptz not null default now(),
 customer_name text not null, phone text not null,
 delivery text not null, payment text not null, notes text not null default '',
 items jsonb not null, quantity integer not null,
 subtotal numeric(12,2) not null, discount numeric(12,2) not null, total numeric(12,2) not null,
 status text not null default 'Novo' check (status in ('Novo','Em aprovação','Em produção','Pronto','Entregue','Cancelado'))
);
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
grant update(status) on public.orders to authenticated;
drop policy if exists "Somente admins leem pedidos" on public.orders;
drop policy if exists "Somente admins atualizam pedidos" on public.orders;
create policy "Somente admins leem pedidos" on public.orders for select to authenticated using (public.is_admin());
create policy "Somente admins atualizam pedidos" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- O cliente envia apenas escolhas. Preços, descontos e totais são calculados no banco.
create or replace function public.submit_order(payload jsonb) returns uuid language plpgsql security definer
set search_path = public as $$
declare
 entry jsonb; opt public.order_options%rowtype; qty integer; count_pieces integer := 0;
 subtotal_value numeric := 0; discount_value numeric := 0; saved_items jsonb := '[]';
 order_id uuid; request_key uuid; name_value text; phone_value text;
begin
 request_key := (payload->>'request_id')::uuid;
 if request_key is null then raise exception 'Identificador obrigatório'; end if;
 name_value := trim(coalesce(payload->>'customer_name',''));
 phone_value := regexp_replace(coalesce(payload->>'phone',''), '[^0-9]', '', 'g');
 if length(name_value) not between 2 and 120 or length(phone_value) not between 10 and 15
 or length(coalesce(payload->>'notes','')) > 2000
 or coalesce(payload->>'delivery','') not in ('Retirada agendada','Uber Moto por conta do cliente')
 or coalesce(payload->>'payment','') not in ('Pix','Cartão de crédito') then
 raise exception 'Dados do pedido inválidos'; end if;
 if jsonb_typeof(payload->'items') is distinct from 'array' then raise exception 'Itens inválidos'; end if;
 if jsonb_array_length(payload->'items') not between 1 and 50 then raise exception 'Informe entre 1 e 50 itens'; end if;
 for entry in select value from jsonb_array_elements(payload->'items') loop
  select * into opt from public.order_options where id=entry->>'option_id';
  if not found then raise exception 'Opção inválida'; end if;
  if coalesce(entry->>'quantity','') !~ '^[0-9]{1,3}$' then raise exception 'Quantidade inválida'; end if;
  qty := (entry->>'quantity')::integer;
  if qty not between 1 and 500 or not coalesce((entry->>'size') = any(opt.tamanhos),false)
   or length(trim(coalesce(entry->>'color',''))) not between 1 and 80
   or coalesce(entry->>'print','') not in ('8 × 8 cm','30 × 30 cm','8 × 8 cm + 30 × 30 cm')
   or (opt.modelo like '%branca' and lower(trim(entry->>'color')) not in ('branca','branco')) then
   raise exception 'Escolhas inválidas'; end if;
  count_pieces := count_pieces + qty;
  subtotal_value := subtotal_value + opt.preco * qty;
  saved_items := saved_items || jsonb_build_array(jsonb_build_object(
   'option_id',opt.id,'fabric',opt.tecido,'model',opt.modelo,'size',entry->>'size',
   'color',trim(entry->>'color'),'print',entry->>'print','quantity',qty,'unit_price',opt.preco));
 end loop;
 if count_pieces > 500 then raise exception 'Limite de 500 peças por pedido'; end if;
 discount_value := case when count_pieces > 10 then round(subtotal_value * 0.18,2) else 0 end;
 insert into public.orders(request_id,customer_name,phone,delivery,payment,notes,items,quantity,subtotal,discount,total)
 values(request_key,name_value,phone_value,payload->>'delivery',payload->>'payment',coalesce(payload->>'notes',''),saved_items,count_pieces,subtotal_value,discount_value,subtotal_value-discount_value)
 on conflict (request_id) do nothing returning id into order_id;
 -- Reenvios recebem o mesmo código, sem expor os dados do pedido anterior.
 if order_id is null then select id into order_id from public.orders where request_id=request_key; end if;
 return order_id;
end;
$$;
revoke all on function public.submit_order(jsonb) from public;
grant execute on function public.submit_order(jsonb) to anon, authenticated;
commit;

-- Catálogo real do Canva; IDs determinísticos evitam duplicação em reexecuções.
INSERT INTO public.products(id,nome,descricao,preco,categoria,tamanhos,imagens,ativo)
SELECT md5('sublime-'||id)::uuid, tecido||' · '||modelo,
'Peça personalizada com estampa em DTF. Consulte medidas e cores no guia. Orçamento e arte sujeitos à confirmação.',
preco,tecido,tamanhos,ARRAY['images/placeholder.svg'],true FROM public.order_options
ON CONFLICT(id) DO UPDATE SET nome=excluded.nome,descricao=excluded.descricao,
preco=excluded.preco,categoria=excluded.categoria,tamanhos=excluded.tamanhos;
