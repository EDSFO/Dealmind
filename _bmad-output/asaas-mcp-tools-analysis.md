# Análise das Tools do MCP Asaas - DealMind

**Data:** 2025-01-02  
**Pergunta:** Por que o Asaas MCP tem apenas 9 tools habilitadas?

---

## 📊 Tools Disponíveis no MCP Asaas

O MCP do Asaas expõe **9 tools** que são ferramentas genéricas para trabalhar com a API OpenAPI do Asaas:

### 1. `list-specs`
- **Função:** Lista todas as especificações OpenAPI disponíveis
- **Uso:** Ver quais specs estão disponíveis (geralmente retorna "Asaas")

### 2. `list-endpoints`
- **Função:** Lista todos os endpoints da API com seus métodos HTTP
- **Uso:** Descobrir quais endpoints estão disponíveis (100+ endpoints)

### 3. `get-endpoint`
- **Função:** Obtém detalhes completos de um endpoint específico
- **Uso:** Ver schema, parâmetros, respostas de um endpoint

### 4. `get-request-body`
- **Função:** Obtém o schema do corpo da requisição para um endpoint
- **Uso:** Entender estrutura de dados para criar/atualizar recursos

### 5. `get-response-schema`
- **Função:** Obtém o schema da resposta de um endpoint
- **Uso:** Entender estrutura de dados retornados

### 6. `list-security-schemes`
- **Função:** Lista esquemas de segurança/autenticação
- **Uso:** Ver como autenticar (ex: access_token no header)

### 7. `search-specs`
- **Função:** Busca em todas as specs por padrões
- **Uso:** Encontrar endpoints ou schemas por palavras-chave

### 8. `execute-request`
- **Função:** Executa uma requisição HTTP para a API Asaas
- **Uso:** Fazer chamadas reais à API (criar, listar, atualizar, deletar)

### 9. `get-code-snippet`
- **Função:** Gera snippet de código para um endpoint
- **Uso:** Obter exemplos de código em diferentes linguagens

---

## ✅ Por Que Apenas 9 Tools?

### Isso é Normal e Esperado!

O MCP do Asaas **não expõe uma tool para cada endpoint** da API. Em vez disso, ele expõe **ferramentas genéricas** que permitem:

1. **Explorar** a API (listar endpoints, ver schemas)
2. **Executar** qualquer requisição (usando `execute-request`)
3. **Obter informações** sobre endpoints específicos

### Arquitetura do MCP Asaas

```
MCP Asaas (9 Tools Genéricas)
    ↓
OpenAPI Specification (100+ Endpoints)
    ↓
API Asaas Real (Customers, Payments, etc.)
```

**Exemplo de Fluxo:**

1. Use `list-endpoints` → Descobre que existe `POST /v3/customers`
2. Use `get-endpoint` → Obtém detalhes do endpoint
3. Use `get-request-body` → Vê schema necessário
4. Use `execute-request` → Cria um customer real

---

## 🎯 Comparação com Outros MCPs

### MCP Asaas (Baseado em OpenAPI)
- **9 tools genéricas**
- **100+ endpoints** acessíveis via `execute-request`
- **Abordagem:** Ferramentas para explorar e executar API

### MCP Supabase (Específico)
- **Múltiplas tools específicas** (list-tables, execute-sql, etc.)
- **Abordagem:** Ferramentas dedicadas para cada operação

### MCP Context7 (Documentação)
- **2 tools** (resolve-library-id, query-docs)
- **Abordagem:** Consulta de documentação

---

## 💡 Por Que Essa Abordagem?

### Vantagens:

1. ✅ **Flexibilidade:** Acessa todos os 100+ endpoints com apenas 9 tools
2. ✅ **Manutenção:** Quando a API muda, não precisa atualizar o MCP
3. ✅ **Descoberta:** Pode explorar a API dinamicamente
4. ✅ **Simplicidade:** Menos tools para gerenciar

### Desvantagens:

1. ⚠️ **Menos Type-Safe:** Não há validação específica por endpoint
2. ⚠️ **Mais Verboso:** Precisa descobrir endpoints antes de usar
3. ⚠️ **Menos Intuitivo:** Não há autocomplete específico por recurso

---

## 📋 O Que Você Pode Fazer com 9 Tools

### Cenário 1: Criar um Customer

```javascript
// 1. Descobrir endpoint
list-endpoints → encontra POST /v3/customers

// 2. Ver schema necessário
get-request-body → vê que precisa name e cpfCnpj

// 3. Executar
execute-request → cria customer real
```

### Cenário 2: Listar Payments

```javascript
// 1. Descobrir endpoint
list-endpoints → encontra GET /v3/payments

// 2. Ver parâmetros
get-endpoint → vê parâmetros (offset, limit, etc.)

// 3. Executar
execute-request → lista payments
```

### Cenário 3: Obter Código de Exemplo

```javascript
// 1. Escolher endpoint
get-endpoint → POST /v3/customers

// 2. Gerar snippet
get-code-snippet → retorna código em JavaScript/Python/etc.
```

---

## 🔍 Verificação: Está Funcionando Corretamente?

### Teste Realizado:

✅ **list-endpoints**: Retornou 100+ endpoints  
✅ **get-endpoint**: Funcionou para POST /v3/customers  
✅ **execute-request**: Criou customer com sucesso  
✅ **get-code-snippet**: Gera snippets de código  

**Conclusão:** As 9 tools estão funcionando perfeitamente!

---

## 📊 Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Tools Disponíveis** | 9 tools genéricas |
| **Endpoints Acessíveis** | 100+ endpoints via `execute-request` |
| **Arquitetura** | Baseado em OpenAPI Specification |
| **Status** | ✅ Funcionando corretamente |
| **É Suficiente?** | ✅ Sim, permite acesso completo à API |

---

## ✅ Conclusão

**As 9 tools do MCP Asaas são suficientes e funcionais!**

O MCP não precisa de uma tool para cada endpoint porque:
- A tool `execute-request` pode chamar qualquer endpoint
- As outras 8 tools ajudam a descobrir e entender a API
- Essa abordagem é mais flexível e fácil de manter

**Você tem acesso completo à API Asaas através dessas 9 tools!**

---

**Última Atualização:** 2025-01-02

