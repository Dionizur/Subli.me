# SUBLI.ME

Catálogo público de camisetas, formulário de encomendas e painel administrativo com Supabase.

## Executar

Configure `js/supabase-config.js` com a URL e a chave pública anon do projeto (nunca use a chave service role no navegador). Sirva os arquivos por HTTP, por exemplo com `python -m http.server 8080`.

## Banco e administradores

- Projeto novo: execute `supabase-schema.sql` no SQL Editor do Supabase. Ele já inclui pedidos e políticas de acesso.
- Banco existente: execute apenas `supabase-orders.sql`. A migração preserva produtos e bloqueia o antigo acesso público à tabela de senhas.
- Em Authentication > Users, crie a conta da administradora com email e senha. Copie seu UUID e execute, substituindo o exemplo:

```sql
insert into public.admin_users (user_id)
values ('UUID-DA-CONTA-EM-AUTHENTICATION')
on conflict do nothing;
```

A criação da conta e a inclusão na lista de administradores são necessárias. O antigo login de teste deixa de funcionar. A área Admin exige Supabase Auth e verifica a permissão no banco. Não basta alterar variáveis JavaScript para ler pedidos. A tabela `admin_users` não permite que visitantes se promovam a administrador. Para revogar o acesso, remova a associação no SQL Editor.

## Encomendas

A aba Fazer pedido permite combinar peças de diferentes linhas/modelos, com tamanho, cor, estampa e quantidade, e registrar nome, WhatsApp, recebimento, pagamento e personalização. Encomendar no catálogo abre esse formulário com o produto anotado.

O guia de referência contém 32 opções e preços que foram transcritos do [Canva da loja](https://canva.link/9gsm1wiwk6t4fc0), consultado em 21/10/2026. O guia continua disponível no formulário para consultar medidas e cartelas. As cores são informadas pelo cliente conforme a cartela e confirmadas pela loja; não são uma lista de estoque. Manga longa premium usa a grade padrão como referência, sujeita à confirmação com a loja.

O desconto de 18% vale para mais de 10 peças (11 ou mais), somando os itens. O prazo informado é de 7 a 15 dias úteis após aprovação da arte. Retirada mediante agendamento ou Uber Moto com frete por conta do cliente. Os valores são estimativas: quantidade e tamanho de estampas podem alterar o orçamento final. Não há cobrança automática ou envio automático de mensagem.

`submit_product_order` valida as opções e calcula preços, desconto e totais no banco. Visitantes podem registrar pedidos pela função, mas não consultar ou atualizar dados de clientes. Reenvios usam um identificador para evitar duplicação. As informações dos clientes não são salvas no armazenamento local do navegador.

## Dashboard

Após login como administradora, o painel mostra total de pedidos, pedidos em andamento, peças e valor estimado (excluindo cancelados), busca por cliente/telefone/código e filtro de status. Cada pedido detalha as escolhas e permite acompanhar Novo, Em aprovação, Em produção, Pronto, Entregue ou Cancelado. Atualizar pedidos recarrega os dados do banco. O painel limpa os dados ao sair da sessão.

Os scripts SQL devem ser aplicados antes de usar as novas funções. O código local não executa migrações remotamente. Mantenha as políticas RLS ativas. Para publicação com tráfego elevado, adicione proteção contra abuso/rate limiting ao endpoint público de pedidos.

## Validação

Execute `node --test tests/orders.test.cjs` e `node --check js/orders.js`. Os testes locais cobrem seleção/carrinho, desconto no limite de 10/11 peças, validação, envio, reenvio e limpeza de dados privados. A validação real de RLS exige aplicar a migração em um projeto Supabase de teste e verificar visitantes, conta comum, administradora e administradora revogada.

## Banco atual

Conexão atualizada para o projeto Supabase `ppibnojdcoelryflpbwn` (sublime), usando somente a chave publicável. O catálogo começa vazio. Produtos ilustrativos previamente criados foram desativados; o administrador cadastra nome, descrição, preço, fotos, cores e tamanhos, e pode editar as opções depois. As encomendas usam exclusivamente os produtos ativos e validam suas cores e tamanhos no banco. O banco antigo não foi alterado; não foi possível exportar seu conteúdo pela conexão disponível.

O email indicado para administração é `lianbraiammendes@gmail.com`. A conta precisa estar associada a `admin_users`; nunca grave a senha no código ou em SQL versionado.
