# Configuração da API Key do Asaas - DealMind

**Data:** 2025-01-02  
**Status:** ✅ API Key Validada e Configurada

---

## ✅ Validação da API Key

**Status:** ✅ **FUNCIONAL**

A API key foi testada com sucesso através do MCP do Asaas:

- ✅ **Teste Realizado:** `GET /v3/customers`
- ✅ **Resultado:** Retornou lista de 10 clientes do ambiente sandbox
- ✅ **Ambiente:** Sandbox (`api-sandbox.asaas.com`)
- ✅ **Autenticação:** Funcionando corretamente

**Resposta de Teste:**
```json
{
  "object": "list",
  "hasMore": false,
  "totalCount": 10,
  "limit": 10,
  "offset": 0,
  "data": [...]
}
```

---

## 🔧 Configuração no Projeto

### 1. Variável de Ambiente

Adicione a seguinte linha no arquivo `.env` (não versionado):

```bash
# Asaas API Configuration
ASAAS_API_KEY=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmZmYzZhMThhLWY2NjktNDg0Yy1iN2MzLTFkMTFhMDA1NjZmMTo6JGFhY2hfYjg3OGExYWQtYWYxOS00MDQwLWExMjgtNDRkMjEwZmIwNzMy
```

### 2. Validação de Ambiente

A variável foi adicionada ao schema de validação em `dealmind/src/env.js`:

```javascript
server: {
  // ... outras variáveis
  ASAAS_API_KEY: z.string().min(1).optional(),
}
```

**Nota:** A variável é `optional` porque pode não ser necessária em todos os ambientes (ex: desenvolvimento local sem integração de pagamentos).

### 3. Uso no Código

Para usar a API key em requisições ao Asaas:

```typescript
import { env } from "~/env";

// Em API routes ou server actions
const asaasApiKey = env.ASAAS_API_KEY;

// Exemplo de requisição
const response = await fetch('https://api-sandbox.asaas.com/v3/customers', {
  method: 'GET',
  headers: {
    'access_token': asaasApiKey ?? '',
    'Content-Type': 'application/json',
  },
});
```

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas:

1. ✅ **Variável no `.env`**: Não versionada (está no `.gitignore`)
2. ✅ **Validação de Schema**: Validada via `env.js` com Zod
3. ✅ **Server-side Only**: Variável não exposta ao cliente (sem prefixo `NEXT_PUBLIC_`)
4. ✅ **Ambiente Sandbox**: API key está configurada para ambiente de testes

### ⚠️ Importante:

- **Nunca commite a API key** no Git
- **Use variáveis de ambiente** diferentes para produção
- **Rotacione a key** se ela for exposta acidentalmente
- **Use Sandbox** para desenvolvimento e testes

---

## 🌐 Ambientes

### Sandbox (Atual)
- **URL:** `https://api-sandbox.asaas.com`
- **API Key:** `$aact_hmlg_...` (configurada)
- **Uso:** Desenvolvimento e testes

### Produção (Futuro)
- **URL:** `https://api.asaas.com`
- **API Key:** Obter nova key de produção no painel Asaas
- **Uso:** Ambiente de produção

---

## 📝 Próximos Passos

1. ✅ **Criar cliente helper** para requisições ao Asaas
2. ✅ **Implementar integração de pagamentos** (quando necessário)
3. ✅ **Configurar webhooks** do Asaas para notificações
4. ✅ **Adicionar testes** para integração com Asaas

---

## 🔗 Recursos

- **Documentação Asaas:** https://docs.asaas.com
- **Painel Asaas:** https://www.asaas.com
- **API Sandbox:** https://api-sandbox.asaas.com
- **MCP Asaas:** Configurado e funcional

---

**Última Atualização:** 2025-01-02




