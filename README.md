# SUBLI.ME — Documentação Técnica (Versão Pública)

## 1. Visão Geral

O **SUBLI.ME** é uma aplicação web para vitrine e gestão de produtos (camisetas), com:

- catálogo público de produtos;
- painel administrativo para autenticação;
- cadastro e remoção de produtos;
- persistência de dados no **Supabase** (PostgreSQL + API).

> Este README foi escrito para uso público e acadêmico.  
> Nenhuma credencial real, chave de API ou identificador sensível é exposto aqui.

---

## 2. Objetivo do Projeto

Este projeto demonstra, de forma prática, conceitos de:

- desenvolvimento frontend com JavaScript puro;
- integração com Backend as a Service (Supabase);
- modelagem de dados relacional;
- operações CRUD;
- autenticação simples para área administrativa;
- documentação técnica de software.

---

## 3. Arquitetura da Solução

### 3.1 Camadas

1. **Apresentação (UI)**
   - `index.html`
   - `css/style.css`
   - `js/script.js`

2. **Serviço de Dados**
   - `js/supabase-service.js`
   - Responsável por conectar no Supabase e executar operações de dados:
     - buscar produtos;
     - inserir produtos;
     - remover produtos;
     - autenticar administrador.

3. **Configuração**
   - `js/supabase-config.js`
   - Armazena URL do projeto e chave pública (anon key) em ambiente de desenvolvimento.

4. **Banco de Dados**
   - `supabase-schema.sql`
   - Define tabelas, políticas RLS e dados iniciais.

---

## 4. Estrutura de Pastas

```txt
.
├── index.html
├── README.md
├── supabase-schema.sql
├── TODO.md
├── css/
│   └── style.css
├── data/
│   ├── admin.json
│   └── products.json
├── images/
│   └── ...arquivos de imagem...
└── js/
    ├── script.js
    ├── supabase-config.js
    └── supabase-service.js
```

---

## 5. Fluxo Funcional

### 5.1 Catálogo Público
- Ao iniciar, o sistema conecta no Supabase.
- Busca produtos na tabela `products`.
- Renderiza cards de produtos na interface.
- Modal exibe detalhes, galeria e botão de encomenda via WhatsApp.

### 5.2 Login Administrativo
- Usuário informa email/usuário e senha na seção Admin.
- O frontend chama `authenticateAdmin(email, password)`.
- O serviço consulta tabela `admins` e faz comparação simples:
  - email exato;
  - senha exata.
- Se válido, exibe painel administrativo.

### 5.3 Cadastro de Produto
- Admin preenche formulário (nome, descrição, preço, categoria, tamanhos, imagens).
- O sistema envia para `addProduct(...)`.
- Produto é inserido no Supabase e refletido na interface.

### 5.4 Remoção de Produto
- O botão remover chama `removeProduct(id)`.
- A remoção é **física** no banco (`DELETE`), não apenas lógica.
- Produtos com `ativo = false` também são limpos no carregamento.

---

## 6. Modelagem de Dados (Resumo)

## 6.1 Tabela `products`
Campos principais:
- `id` (UUID, PK)
- `created_at` (timestamp)
- `nome` (texto)
- `descricao` (texto)
- `preco` (numérico)
- `categoria` (texto)
- `tamanhos` (array texto)
- `imagens` (array texto)
- `ativo` (boolean)

## 6.2 Tabela `admins`
Campos principais:
- `id` (UUID, PK)
- `created_at` (timestamp)
- `email` (texto único)
- `senha_hash` (texto)  
- `nome` (texto)

> Observação acadêmica: o campo `senha_hash` está sendo usado em comparação simples no cenário atual do projeto.

---

## 7. Segurança e Boas Práticas (Importante)

Mesmo sendo funcional para estudo, há pontos essenciais para produção:

1. **Não expor credenciais reais**
   - Nunca publicar `anonKey` real em repositório público.
   - Usar variáveis de ambiente sempre que possível.

2. **Senha de admin**
   - Evitar comparação simples em produção.
   - Usar hash seguro (ex.: bcrypt/argon2) + fluxo de autenticação robusto.

3. **RLS (Row Level Security)**
   - Revisar políticas para restringir operações sensíveis.
   - Evitar permissões amplas de escrita/deleção para usuários anônimos.

4. **Validação de entrada**
   - Sanitizar e validar campos no frontend e backend.
   - Implementar regras de integridade adicionais.

---

## 8. Configuração do Ambiente (Setup)

### 8.1 Pré-requisitos
- Navegador moderno
- Conta Supabase
- Projeto Supabase criado

### 8.2 Passo a Passo

1. Clone/baixe o projeto.
2. No Supabase, abra **SQL Editor** e execute `supabase-schema.sql`.
3. Configure `js/supabase-config.js` com valores do seu projeto:
   - `url`: URL do projeto Supabase
   - `anonKey`: chave pública (anon)
4. Abra o `index.html` (ou rode via servidor local simples).
5. Teste o fluxo público e administrativo.

---

## 9. Como Executar Localmente

Como é um frontend estático, você pode:

- abrir `index.html` diretamente; ou
- usar um servidor local (recomendado para evitar restrições de navegador).

Exemplo (VS Code + extensão Live Server):
- clique em “Go Live” e abra a URL local.

---

## 10. Pontos Técnicos Relevantes no Código

### 10.1 `js/supabase-service.js`
Responsável por:
- `initSupabase()`: inicializa cliente;
- `fetchProducts()`: busca produtos e normaliza dados;
- `addProduct(product)`: insere produto;
- `removeProduct(id)`: remove produto no banco com `DELETE`;
- `authenticateAdmin(email, password)`: autenticação admin por comparação simples.

### 10.2 `js/script.js`
Responsável por:
- renderização de UI;
- navegação entre seções;
- login/logout admin;
- formulário de cadastro;
- integração com funções do serviço Supabase.

### 10.3 `supabase-schema.sql`
Responsável por:
- criação de tabelas;
- seed inicial;
- políticas RLS.

---

## 11. Troubleshooting

1. **“Supabase não foi inicializado”**
   - Verifique `url` e `anonKey` em `js/supabase-config.js`.

2. **Produtos não aparecem**
   - Confirme execução de `supabase-schema.sql`.
   - Verifique políticas RLS e erros no console (F12).

3. **Erro ao autenticar admin**
   - Confirme se o registro existe em `admins`.
   - Verifique valores digitados e comparação esperada.

4. **Produto não remove**
   - Verifique política de `DELETE` na tabela `products`.
   - Inspecione erro retornado no console do navegador.

---

## 12. Limitações Atuais

- autenticação administrativa simplificada;
- ausência de backend próprio (lógica no cliente);
- sem trilha de auditoria de operações;
- sem testes automatizados (unitários/e2e).

---

## 13. Melhorias Futuras (Roadmap)

- autenticação com Supabase Auth;
- hash de senha robusto (bcrypt/argon2);
- painel com controle de perfil/permissões;
- upload de imagens em bucket com URL assinada;
- testes automatizados (unit + integração + e2e);
- pipeline CI/CD;
- observabilidade (logs estruturados e monitoramento).

---

## 14. Uso Acadêmico

Este projeto pode ser usado como estudo de caso para disciplinas como:

- Engenharia de Software;
- Banco de Dados;
- Desenvolvimento Web;
- Segurança da Informação (análise de riscos e melhorias);
- Qualidade de Software e documentação técnica.

Sugestão de abordagem em relatório:
1. Contexto e problema;
2. Arquitetura proposta;
3. Modelagem de dados;
4. Implementação;
5. Resultados e limitações;
6. Plano de evolução.

---

## 15. Licença e Publicação

Antes de publicar:
- revise se não há credenciais reais em arquivos versionados;
- substitua quaisquer URLs/chaves reais por placeholders;
- valide políticas de segurança do banco.
