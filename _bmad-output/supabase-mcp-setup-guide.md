# Guia de Configuração do MCP do Supabase - DealMind

**Data:** 2025-01-02  
**Status:** ⚠️ Requer Configuração de Autenticação

---

## 📋 Situação Atual

### Configuração Atual

**Arquivo:** `~/.cursor/mcp.json`

```json
{
  "supabase": {
    "url": "https://mcp.supabase.com/mcp",
    "headers": {}
  }
}
```

### ⚠️ Problema Identificado

O MCP do Supabase está configurado, mas **não está funcional** porque:

1. ❌ **Sem autenticação**: O campo `headers` está vazio
2. ❌ **Sem credenciais**: Não há informações de projeto Supabase configuradas
3. ⚠️ **Não testado**: Não há funções MCP específicas do Supabase disponíveis nas ferramentas

---

## 🔍 O Que o MCP do Supabase Oferece

Baseado na documentação do Supabase sobre MCP, o servidor MCP provavelmente oferece:

- ✅ **Consulta de Schema**: Visualizar estrutura do banco de dados
- ✅ **Execução de Queries SQL**: Executar queries diretamente
- ✅ **Gestão de Tabelas**: Criar, modificar, deletar tabelas
- ✅ **Políticas RLS**: Gerenciar Row Level Security policies
- ✅ **Operações de Auth**: Gerenciar usuários e autenticação
- ✅ **Storage**: Operações com arquivos e buckets
- ✅ **Edge Functions**: Gerenciar funções serverless

---

## 🔧 Configuração Necessária

### Opção 1: Autenticação via Headers (Recomendado)

Adicione as credenciais do Supabase no arquivo `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ACCESS_TOKEN",
        "apikey": "YOUR_SUPABASE_SERVICE_ROLE_KEY",
        "x-supabase-url": "https://YOUR_PROJECT_REF.supabase.co"
      }
    }
  }
}
```

**Onde obter as credenciais:**

1. **Supabase URL**: Já configurado em `.env` como `NEXT_PUBLIC_SUPABASE_URL`
   - Formato: `https://njkqdqpixklghnptolmj.supabase.co`

2. **Service Role Key**: Já configurado em `.env` como `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **CUIDADO**: Esta key tem acesso total ao banco (bypassa RLS)
   - Use apenas em ambientes seguros

3. **Access Token**: Pode ser necessário um token OAuth 2.1
   - Ver seção "Autenticação OAuth 2.1" abaixo

### Opção 2: Autenticação OAuth 2.1 (Mais Seguro)

O Supabase suporta OAuth 2.1 para autenticação de agentes de IA via MCP.

#### Passos para Configurar:

1. **Habilitar OAuth Server no Supabase:**
   - Acesse o painel do Supabase: https://supabase.com/dashboard
   - Navegue até **Authentication → OAuth Server**
   - Ative o servidor OAuth 2.1

2. **Configurar Endpoint de Autorização:**
   - Crie um endpoint que permita aprovar acesso do agente
   - O endpoint deve redirecionar para o fluxo de autorização do Supabase

3. **Registrar Cliente OAuth (Opcional):**
   - Se preferir registro manual, registre um cliente OAuth
   - Ou habilite registro dinâmico na seção "OAuth Server"

4. **Configurar MCP:**
   ```json
   {
     "supabase": {
       "url": "https://mcp.supabase.com/mcp",
       "headers": {
         "Authorization": "Bearer OAUTH_ACCESS_TOKEN",
         "x-supabase-url": "https://YOUR_PROJECT_REF.supabase.co"
       }
     }
   }
   ```

**Documentação Oficial:**
- https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication

---

## 📝 Informações do Projeto DealMind

### Credenciais Já Configuradas (em `.env`):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://njkqdqpixklghnptolmj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.njkqdqpixklghnptolmj:Novasenha2024%40@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

**Project Reference:** `njkqdqpixklghnptolmj`  
**Region:** `us-east-1`  
**Pooler:** Session Pooler (IPv4-compatible)

---

## 🎯 Passos para Configurar

### Passo 1: Verificar Credenciais

Certifique-se de que você tem acesso às seguintes informações:

- ✅ **Supabase URL**: `https://njkqdqpixklghnptolmj.supabase.co`
- ✅ **Service Role Key**: Disponível em `.env` como `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ **Access Token**: Pode precisar gerar via OAuth 2.1

### Passo 2: Atualizar Configuração MCP

Edite o arquivo `~/.cursor/mcp.json` e adicione as credenciais:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "apikey": "SUA_SERVICE_ROLE_KEY_AQUI",
        "x-supabase-url": "https://njkqdqpixklghnptolmj.supabase.co"
      }
    }
  }
}
```

**⚠️ IMPORTANTE:**
- Substitua `SUA_SERVICE_ROLE_KEY_AQUI` pela chave real do `.env`
- Não commite este arquivo com credenciais reais
- Use variáveis de ambiente se possível

### Passo 3: Reiniciar Cursor

Após atualizar a configuração:

1. Feche completamente o Cursor
2. Reabra o Cursor
3. O MCP do Supabase deve estar disponível

### Passo 4: Testar Funcionalidade

Após reiniciar, tente usar o MCP do Supabase para:

- Listar tabelas do banco
- Executar uma query simples
- Verificar políticas RLS

---

## 🔒 Segurança

### ⚠️ Avisos Importantes:

1. **Service Role Key é Sensível:**
   - Tem acesso total ao banco (bypassa RLS)
   - Não exponha em código público
   - Use apenas em ambientes seguros

2. **Headers no MCP:**
   - O arquivo `mcp.json` pode conter credenciais
   - Não commite este arquivo no Git
   - Considere usar variáveis de ambiente

3. **OAuth 2.1 (Recomendado):**
   - Mais seguro que Service Role Key direta
   - Permite controle de permissões
   - Requer configuração adicional

---

## ✅ Alternativa: Usar Supabase Diretamente

**Status Atual:** ✅ **Já Funcionando**

O projeto já usa Supabase diretamente via `@supabase/ssr`:

- ✅ `dealmind/src/lib/supabase/server.ts` - Cliente server-side
- ✅ `dealmind/src/lib/supabase/client.ts` - Cliente client-side
- ✅ Middleware de autenticação implementado
- ✅ Variáveis de ambiente configuradas

**Vantagens:**
- ✅ Já está funcionando
- ✅ Mais controle sobre as operações
- ✅ Type-safe com TypeScript
- ✅ Integrado com Next.js App Router

**Desvantagens:**
- ❌ Não tem acesso direto via MCP tools
- ❌ Requer código customizado para cada operação

---

## 🎯 Recomendação

### Para Desenvolvimento Atual:

**Use a integração direta** (`@supabase/ssr`) que já está funcionando:

- ✅ Já configurada e testada
- ✅ Type-safe
- ✅ Integrada com Next.js
- ✅ Suporta todas as funcionalidades necessárias

### Para Usar MCP do Supabase:

**Configure apenas se precisar de:**
- Consultas SQL interativas via MCP
- Gestão de schema via ferramentas MCP
- Operações administrativas via chat

**Passos:**
1. Configure OAuth 2.1 no Supabase (mais seguro)
2. Ou adicione Service Role Key no `mcp.json` (menos seguro)
3. Reinicie o Cursor
4. Teste funcionalidades

---

## 📚 Recursos

- **Documentação Supabase MCP:** https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication
- **Painel Supabase:** https://supabase.com/dashboard
- **Projeto DealMind:** `njkqdqpixklghnptolmj` (us-east-1)

---

## 🔄 Próximos Passos

1. ⚠️ **Decidir se precisa do MCP**: Avaliar se a integração direta é suficiente
2. 🔧 **Se precisar do MCP**: Configurar OAuth 2.1 ou adicionar Service Role Key
3. ✅ **Testar**: Verificar se o MCP está funcionando após configuração
4. 📝 **Documentar**: Atualizar este guia com resultados dos testes

---

**Última Atualização:** 2025-01-02




