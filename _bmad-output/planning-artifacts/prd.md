---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-03-success", "step-04-journeys", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-complete"]
inputDocuments: ["diio-reference.md"]
workflowType: 'prd'
lastStep: 11
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
completedAt: "2025-12-30"
status: "complete"
---

# Product Requirements Document - DealMind

**Author:** Erick
**Date:** 2025-12-30
**Status:** COMPLETE ✅

## Product Reference

This PRD is based on analysis of Diio (https://diio.com/br) - an AI assistant for sales that analyzes customer conversations to help teams sell more effectively.

---

## Executive Summary

DealMind é um assistente de inteligência artificial para times de vendas que analisa conversas com clientes e transforma cada interação em insights acionáveis. Ao democratizar o acesso a tecnologias de IA para vendas, DealMind atende pequenas e médias empresas brasileiras que antes não podiam contar com soluções enterprise como o Diio.

A plataforma analisa videochamadas, chamadas telefônicas e mensagens (WhatsApp), detectando automaticamente interesses, objeções, compromissos assumidos e sinais de progresso ou risco em cada negociação. O sistema atualiza o CRM com dados estruturados, sugere próximas ações e permite que times colaborem revisando e comentando conversas.

**Problema que resolve:** Times de vendas de PMEs brasileiras perdem horas manualmente registrando interações no CRM, perdem insights valiosos das conversas e não conseguem padronizar processos de vendas. Soluções existentes custam a partir de R$ 150-200/mês por usuário, tornando-se inacessíveis para equipes com orçamento limitado.

**Solução:** DealMind oferece funcionalidades similares às soluções enterprise a um preço acessível, com foco específico no mercado brasileiro e integrações com Fireflies e WhatsApp.

### What Makes This Special

**DealMind representa uma nova mentalidade para vendas.**

O nome não é acidental - significa transformar a forma como empresas brasileiras abordam vendas através da inteligência artificial. O que torna DealMind único:

1. **Democratização da IA em Vendas**: Pela primeira vez, pequenas e médias empresas brasileiras têm acesso a inteligência de conversas antes restrita a grandes empresas com orçamentos elevados

2. **Foco no Mercado Brasileiro**: Interface em português, entendimento de contexto de vendas no Brasil, e modelo de precificação em Real adequado à realidade local

3. **Simplicidade Primeiro**: Integrações essenciais (Fireflies + WhatsApp) sem complexidade desnecessária, ideal para equipes que estão começando a estruturar seus processos de vendas

4. **Preço Acessível**: Modelos de planos competitivos em relação ao Diio (Starter $28-35 USD), permitindo que PMEs adotem a tecnologia sem comprometer o orçamento

**O momento em que o usuário percebe o valor:** Quando um vendedor recebe uma notificação do DealMind destacando um sinal de risco em uma negociação que ele não percebeu - e pode agir antes de perder o negócio.

## Project Classification

**Technical Type:** SaaS B2B
**Domain:** General
**Complexity:** Low
**Project Context:** Greenfield - new project

**Rationale:**
- **SaaS B2B**: Plataforma multi-tenant para times de vendas, com modelo de assinatura, controle de acesso por usuário e integrações com CRMs
- **Domain General**: Não é setorial regulado (não é healthcare, fintech, govtech) - foco em processos de vendas universais
- **Complexity Low**: Software de negócios padrão sem requisitos regulatórios especiais ou desafios técnicos de nicho
- **Greenfield**: Novo produto sendo desenvolvido do zero, sem código legado a integrar

**Target Users:**
- Vendedores (closers)
- SDRs (representantes de desenvolvimento de vendas)
- Customer Success Managers

**Target Companies:**
- Pequenas e médias empresas brasileiras
- Equipes de 2-20 vendedores inicialmente
- Setores diversos (agências, consultorias, SaaS B2B, serviços)

**Initial Integrations:**
- Fireflies (análise de videochamadas)
- WhatsApp (análise de mensagens)
- CRM (fase futura: Pipedrive, HubSpot, Salesforce)

---

## Success Criteria

### User Success

**O momento de sucesso:** Quando um vendedor recebe orientações claras e acionáveis extraídas de transcrições (inseridas manualmente ou via integração com Fireflies/WhatsApp) que o levam a melhores resultados comerciais.

**Indicadores específicos:**
- Usuário economiza tempo no preenchimento do CRM (orientações automáticas)
- Usuário recebe alertas sobre negociações em risco que ele não percebeu
- Usuário identifica padrões de sucesso em suas conversas
- Usuário consegue agir com base em insights específicos (não apenas dados brutos)

**Momento "aha!":** Quando o DealMind destaca um sinal de risco em uma negociação que o vendedor não percebeu, permitindo ação antes de perder o negócio.

### Business Success

**Métricas de 3 meses (Validação):**
- 2 empresas piloto usando o sistema
- Feedback positivo e validação do produto

**Métricas de 12 meses (Lançamento):**
- 5+ empresas ativas
- R$ 25.000 MRR (Monthly Recurring Revenue)
- 100 usuários ativos
- Taxa de retenção: 80%+ (usuários ativos após 3 meses)
- NPS: 70+ (excelente satisfação)

**Indicador-chave de sucesso:** Quando os primeiros clientes renovam espontaneamente e recomendam para outras empresas.

### Technical Success

**Arquitetura:**
- Transcrições via Fireflies (integração webhook)
- Processamento via N8N + agente de IA com prompt específico
- Disponibilidade 24/7

**Requisitos técnicos MVP:**
- Integração funcional com Fireflies (webhook para receber transcrições)
- Integração funcional com WhatsApp
- Agente de IA capaz de gerar orientações comerciais acionáveis
- Interface web para visualização de insights
- Sistema de autenticação e controle de acesso por empresa

**Métricas técnicas:**
- Tempo de processamento: orientações disponíveis em até 5 minutos após transcrição recebida
- Uptime: 99%+ (disponibilidade 24/7)
- Taxa de sucesso na geração de insights: > 95%

### Measurable Outcomes

**Resultados esperados para o cliente final:**
- Economia de 2+ horas semanais por vendedor em preenchimento de CRM
- Aumento de 10-20% na taxa de conversão (baseado em benchmarks do setor)
- Melhor visibilidade do pipeline: negociações em risco identificadas automaticamente
- Padronização do discurso de vendas através de insights compartilhados

## Product Scope

### MVP - Minimum Viable Product

**Funcionalidades baseadas no Diio:**

1. **Análise de Conversas**
   - Receber transcrições do Fireflies (webhook)
   - Receber transcrições do WhatsApp
   - Permitir inserção manual de transcrições
   - Processar via N8N + agente IA para extrair:
     - Interesses detectados
     - Objeções levantadas
     - Compromissos assumidos
     - Sinais de progresso
     - Sinais de risco
     - Próximas ações sugeridas

2. **Interface Web**
   - Dashboard de conversas analisadas
   - Visualização de insights por conversa
   - Lista de conversas com indicadores de risco/progresso
   - Busca e filtros básicos

3. **Colaboração em Equipe**
   - Compartilhamento de conversas
   - Comentários em conversas
   - Visibilidade entre membros da equipe

4. **Integrações**
   - Fireflies (webhook para receber transcrições)
   - WhatsApp (integração para receber mensagens)
   - Autenticação multi-tenant (por empresa)

5. **Gestão de Conta**
   - Cadastro de empresas
   - Gestão de usuários por empresa
   - Controle de acesso básico

**O que NÃO está no MVP:**
- Integração nativa com CRM (Pipedrive, HubSpot, Salesforce)
- Análise de chamadas telefônicas
- Relatórios avançados e analytics
- Busca conversacional em todas as conversas
- Integração com LinkedIn
- Classificação avançada de tipos de reunião

### Growth Features (Post-MVP)

Funcionalidades para expandir após validação do MVP:

1. **Relatórios Avançados e Dashboards**
   - Dashboards de performance de vendas
   - Análise de tendências de conversas
   - Métricas de equipe e individuais
   - Relatórios de objeções mais comuns
   - Taxa de conversão por estágio

2. **Busca Conversacional Inteligente**
   - "Pergunte ao DealMind" - busca em todas as conversas
   - Perguntas como: "Quais clientes mencionaram orçamento acima de R$ 10k?"
   - Busca por contexto, não apenas palavras-chave
   - Sugestão de conversas similares

**O que permanece futuro:**
- Integração com CRMs
- Análise de chamadas telefônicas
- Integração com LinkedIn

### Vision (Future)

**Versão completa baseada no Diio:**
- Todas as funcionalidades do Diio disponíveis
- Integrações com múltiplos CRMs (Pipedrive, HubSpot, Salesforce, Zoho)
- Análise de videochamadas (Zoom, Meet, Teams)
- Análise de chamadas telefônicas
- Análise de mensagens no LinkedIn
- Relatórios avançados e dashboards
- Classificação personalizada de tipos de reunião
- Controles de acesso avançados (líderes vs executivos)
- Compliance SOC 2/GDPR

---

## User Journeys

### Journey 1: Rafael Moreira - O SDR Superado pelo Volume

**Persona:** Rafael Moreira, SDR Pleno B2B SaaS

**História:** Rafael passa o dia falando com muitos leads pelo WhatsApp, LinkedIn e telefone, agenda reuniões para o time de vendas, mas sofre com excesso de volume e pouco controle da informação. Rafael está sempre "apagando incêndio", precisa lembrar manualmente o que cada lead disse, e perde contexto entre uma conversa e outra.

**A Jornada:**

Rafael chega ao escritório às 8h30, já mentalmente preparado para mais um dia de batalha. Enquanto toma café, abre o WhatsApp e vê 15 mensagens de leads que responderam durante a noite. Algumas são simples: "manda proposta", outras exigem contexto que ele mal lembra: "aquele ponto que você levantou ontem sobre integração..."

O dia avança como um tsunami. 3-6 reuniões, 30-50 mensagens no WhatsApp, dezenas de comentários no LinkedIn. Rafael anota tudo no CRM de forma rápida: "Lead interessado", "Orçamento R$ 5k", "Falar em 2 semanas". Mas ele SENTE que está perdendo ouro - detalhes importantes, objeções que poderiam ser tratadas melhor, sinais de urgência que ele não capturou.

Quarta-feira à tarde, Rafael entrega um lead para o time de vendas. Na sexta, o vendedor volta frustrado: "Esse lead nem sabia o que vendemos". Rafael morre de vergonha internamente. Ele QUALIFICOU mal. E o pior: não tem CLAREZA do que errou porque não consegue revisitar as conversas de forma eficiente.

Então Rafael descobre o DealMind.

Na segunda-feira seguinte, após sua primeira reunião do dia, Rafael abre o DealMind e vê algo que o deixa impressionado: o sistema já analisou a transcrição do Fireflies e destacou em vermelho: "**SINAL DE RISCO**: Lead mencionou concorrente 3 vezes, parece estar em estágio avançado com eles".

Rafael pensa: "Uau, eu não percebi isso na call". Ele ajusta a abordagem no próximo follow-up, focando em diferenciais que o concorrente não tem.

Naquela semana, Rafael usa DealMind para:
- Identificar leads que realmente orçaram vs os que só estão "sonhando"
- Descobrir que a objeção "preço alto" sempre aparece após a terceira menção de ROI
- Ver que seus leads de segunda-feira convertem 3x mais que os de sexta (padrão que ele nunca percebeu)

**O clímax:** Rafael passa de um SDR que "entrega lead bom" para "o SDR que entende o cliente". Em uma reunião mensal, o líder de vendas elogia: "Os leads do Rafael estão vindo com muito mais contexto, as calls estão rendendo mais".

**Resolução:** Três meses depois, Rafael bate consistentemente sua meta de reuniões qualificadas. Ele é promovido a Vendedor Júnior - exatamente o crescimento que queria. O DealMind se tornou seu "segundo cérebro" para vendas.

---

### Journey 2: Bruno Costa - O Vendedor Que Quer Errar Menos

**Persona:** Bruno Costa, Vendedor Sênior B2B, focado em vendas complexas com ticket médio alto

**História:** Bruno é experiente, conhece bem o produto, mas carrega um fantasma: perder negócios que estavam "na mão" por detalhes que ele não percebeu a tempo. O pior não é perder para preço ou concorrência - é perder porque esqueceu um detalhe crítico, não viu um sinal de hesitação, ou fez um follow-up genérico quando precisava de precisão.

**A Jornada:**

Bruno abre o pipeline na segunda-feira pela manhã. 15 deals abertos, 4 em estágio avançado. Parece saudável. Mas algo o incomoda: aquele deal com a "TechCorp" que parecia certo... simplesmente parou de responder. Bruno revê mentalmente a última reunião e pensa: "Ele tinha falado algo importante... o que foi?"

O dia de Bruno é uma maratona de 3-6 reuniões, cada uma de 30-90 minutos. Ele anota no CRM: "Cliente interessado", "Objeção: prazo", "Proposta enviada". Mas Bruno SENTE que está perdendo informação valiosa - padrões de objeção, sinais de decisão, o tom real do cliente.

Quinta-feira, más notícias: TechCorp escolheu o concorrente. Bruno liga para entender o porquê. O cliente diz: "Bem, vocês pareciam fortes em integração, mas eu não tinha certeza sobre suporte... e o outro fabricante me mostrou casos de uso iguais ao nosso, então acabou sendo mais fácil".

Bruno engole em seco. O cliente HAVIA mencionado suporte como crítico na segunda reunião. Bruno não lembrou. Não abordou. Perdeu.

A frustração vem em camadas: frustração silenciosa, autocrítica pesada ("eu devia ter conduzido melhor"), sensação de desperdício. Tempo, energia, expectativa de comissão - tudo sumiu porque um DETALHE.

Então Bruno começa a usar o DealMind.

Na primeira semana, após uma reunião com um novo prospecto, ele abre o DealMind e vê um alerta: "**SINAL DE RISCO**: Cliente mencionou 2x que precisa de aprovação jurídica, mas você não definiu próximos passos com o jurídico".

Bruno pensa: "Caralho, eu quase esqueci disso". Ele ajusta o follow-up: prepara material específico para jurídico e agenda reunião com o decisor.

Naquele mês, Bruno usa DealMind para:
- Identificar que clientes que mencionam "integração" no primeiro call convertem 40% mais
- Descobrir que a objeção "preço" vem sempre após a terceira menção de ROI sem resposta
- Ver que deals onde ele fala sobre "suporte" na primeira reunião fecham 25% mais rápido

**O clímax:** Bruno fecha um deal de R$ 80k que, sem DealMind, ele teria perdido. O cliente menciona "integração" 3 vezes na call. DealMind destaca em amarelo: "Padrão detectado: integração é crítica - reforçar casos de sucesso". Bruno muda a apresentação na hora, foca 5 minutos em casos de uso similares. Cliente: "Puts, é exatamente isso que eu preciso". Fechado em 2 semanas.

**Resolução:** Três meses depois, a conversão do Bruno sobe 18%. Ele não está trabalhando mais, está decidindo melhor. O pipeline tem menos deals "zumbis". Bruno vira referência no time - o cara que "sabe exatamente por que ganha e por que perde".

---

### Journey 3: Ana Rodrigues - Governança sem Atrito

**Persona:** Ana Rodrigues, Gerente de Operações/Head de RevOps

**História:** Ana não vende - ela garante que quem vende tenha estrutura para vender. Ela responde por ferramentas, integrações, governança de dados e adoção do time. O medo dela é simples: "virar mais uma ferramenta bonita que ninguém usa direito".

**A Jornada:**

Ana chega à empresa e encontra um cenário caótico: 5 ferramentas diferentes que não conversam, planilhas paralelas, vendedores que anotam em cadernos, dados que se perdem. O CEO contrata o DealMind e diz: "Ana, organiza isso pra gente".

O primeiro desafio aparece: configurar o DealMind. Ana precisa conectar o Fireflies, integrar o WhatsApp, cadastrar 12 vendedores e SDRs, definir quem vê o quê. Ela olha para a interface técnica e pensa: "Não sou de TI... e se eu quebrar algo?"

Ana configura a primeira integração com Fireflies. Webhook configurado... nada acontece. Ela perde 30 minutos debugando. Consegue fazer funcionar, mas o processo foi tenso. Agora precisa replicar para WhatsApp, depois para cada vendedor. A curva de aprendizado é íngreme.

Duas semanas depois, Ana descobre que 3 vendedores não estão usando o sistema. Quando questionada, a resposta é: "É mais work anotar no CRM direto". Ana fica frustrada: ela configurou tudo certo, mas a adoção não está acontecendo. Como ela medirá se está funcionando se ninguém usa?

Então Ana percebe que o DealMind tem recursos que facilitam a vida dela. Dashboard de adoção por usuário, tutorial guiado para novos vendedores, relatórios de quem está ativo.

**O clímax:** Três meses depois, Ana abre o dashboard de adoção. 10 de 12 vendedores usando ativamente. Os 2 que restantes receberam treinamento específico. As integrações funcionam de forma transparente - transcrições chegam automaticamente, insights aparecem sem intervenção manual. Ana consegue ver em um relatório: "Os vendedores que usam DealMind convertem 22% mais que os que não usam".

**Resolução:** Ana deixa de ser "a pessoa que configura ferramentas" e vira "a pessoa que trouxe inteligência para vendas". O CEO elogia: "O time está mais produtivo, e isso veio da operação". O DealMind se provou como ferramenta que adota fácil - não vira mais um software abandonado.

---

### Journey 4: Ricardo Mendes - Visibilidade Real do Pipeline

**Persona:** Ricardo Mendes, Líder de Vendas de equipe com 5 vendedores

**História:** O CRM mostra o "o quê" (estágio do deal, valor, fechamento previsto) mas não mostra o "por quê" (por que travou, por que avançou, o que foi dito). Ricardo vive no escuro, dependendo do relato subjetivo dos vendedores sobre o que está acontecendo em cada negociação.

**A Jornada:**

Ricardo abre o CRM segunda-feira de manhã. Pipeline de R$ 500k, 30 deals abertos. Parece bem. Mas ele SENTE que está vendo a ponta do iceberg. Quando pergunta ao vendedor "por que esse deal travou?", a resposta é vaga: "Cliente ficou em dúvida", "Acho que é preço", "Não retornou".

O problema: Ricardo está gerenciando baseado em resultado, não em processo. Ele só sabe que o deal parou - não sabe POR QUÊ. Não consegue coachar com precisão, não consegue prever riscos, não consegue replicar sucessos.

Quinta-feira, surpresa negativa: um deal de R$ 50k que parecia certo... simplesmente some. O cliente para de responder. Ricardo pergunta ao vendedor: "O que aconteceu?" Resposta: "Acho que ele escolheu outro... nem sei porquê certo". Ricardo fica impaciente: "Como a gente não sabe? Tivemos 5 reuniões!"

Ricardo percebe: ele está gerenciando cego. Tem 30 deals no pipeline, mas não tem VISIBILIDADE do que está sendo dito nas conversas. Ele sabe o resultado final, mas não sabe a CAUSA.

Então Ricardo começa a usar o DealMind para revisar conversas da equipe.

Na primeira semana, ele descobre coisas que o deixam impressionado:
- Um vendedor excelente perde deals sempre que aparece "integração" na conversa (ele não se sente confiante nesse tema)
- Outro vendedor tem taxa de fechamento de 70% quando usa a palavra "ROI" na primeira reunião
- A equipe toda perde deals quando follow-up acontece 5+ dias depois da conversa

Ricardo usa essas informações para mudar sua abordagem de liderança. Em vez de "venda mais", ele diz: "Carlos, percebi que você trava quando o cliente pergunta sobre integração. Vamos trabalhar isso juntos. Usa esse script que o João usa, funciona bem."

**O clímax:** Ricardo antecipa a perda de um deal de R$ 80k. Ao revisar a conversa no DealMind, ele vê: o cliente mencionou "aprovação jurídica" 3 vezes, mas o vendedor não definiu próximos passos com jurídico. Ricardo liga PARA o vendedor: "Fala com jurídico hoje. Esse deal fecha se você cobrir isso". Deal salvo.

**Resolução:** Três meses depois, a conversão do time sobe 15%. Ricardo deixa de "apagar incêndio" e entra em modo de direção estratégica. Ele sabe o que está acontecendo - não só o resultado. O coaching deixa de ser subjetivo e vira baseado em dados reais das conversas.

---

### Journey Requirements Summary

**As jornadas revelam requisitos para:**

**Camada de Usuário Final (SDR/Vendedor):**
- Onboarding intuitivo e rápido
- Visualização clara de insights por conversa
- Alertas de risco e oportunidades em destaque
- Busca e filtros por conversas
- Compartilhamento e comentários
- Dashboard pessoal de conversas analisadas

**Camada de Liderança (Ricardo):**
- Dashboard de conversas da equipe
- Visibilidade de todas as conversas (não só próprias)
- Relatórios de padrões (argumentos, objeções, timing)
- Comparativos entre vendedores
- Análise de deals ganhos vs perdidos
- Coaching baseado em dados reais

**Camada de Operações/Admin (Ana):**
- Configuração de integrações (Fireflies, WhatsApp)
- Gestão de usuários por empresa
- Dashboard de adoção e uso
- Relatórios de who's active
- Onboarding guiado para novos usuários
- Monitoramento de saúde do sistema

**Camada Técnica:**
- Webhooks para receber transcrições (Fireflies, WhatsApp)
- Processamento assíncrono via N8N + IA
- Multi-tenancy (isolamento por empresa)
- Controle de acesso por tipo de usuário
- Sistema de notificações (alertas de risco)
- Inserção manual de transcrições

---

## SaaS B2B Specific Requirements

### Project-Type Overview

DealMind é uma plataforma SaaS B2B multi-tenant que oferece inteligência artificial para análise de conversas de vendas. O sistema precisa escalar de PMEs para empresas maiores, mantendo isolamento completo de dados entre tenants enquanto oferece flexibilidade de permissões dentro de cada organização.

### Technical Architecture Considerations

**Arquitetura Multi-tenant:**

**Abordagem MVP:** Schema compartilhado + tenant_id + Row Level Security (RLS)

- Todas as tabelas incluem `tenant_id NOT NULL`
- Row Level Security (RLS) no PostgreSQL/Supabase filtra automaticamente por tenant
- JWT inclui claims: `tenant_id`, `role`, `team_id`
- API server-side valida tenant_id em operações admin

**Abordagem Enterprise (futuro):** Schema isolado por tenant ou banco dedicado como opção "segurança avançada"

**Checklist de Isolamento:**
- `tenant_id` em todas as tabelas de dados do cliente
- Índices compostos: `(tenant_id, id)`, `(tenant_id, created_at)`
- Foreign Keys incluem `tenant_id` (ou validação por trigger)
- Storage também segregado por tenant

### Multi-Tenant Model

**Isolamento Lógico:**

- Cada empresa (tenant) tem dados completamente separados logicamente
- `tenant_id` presente em TODAS as tabelas: conversations, insights, users, comments
- Storage segregado: arquivos de transcrição organizados por `tenant_id`
- 3 camadas de proteção:
  1. RLS no banco (toda query filtrada por tenant_id)
  2. JWT com claims de tenant/role
  3. API server-side valida tenant_id em operações admin

**Escala:**
- **MVP:** Schema compartilhado com tenant_id (simples, barato, fácil de evoluir)
- **Enterprise:** Isolamento reforçado (schema por tenant ou banco dedicado) para clientes com requisitos de segurança avançados

### Permission Model (RBAC Matrix)

**3 Perfis de Usuário:**

| Perfil | Permissões | Visibilidade |
|--------|------------|--------------|
| **Vendedor/SDR** | Ver próprias conversas, adicionar comentários, compartilhar | Apenas conversas próprias |
| **Líder de Vendas** | Ver todas conversas da equipe, dashboards de métricas, coaching | Todas conversas do time |
| **Admin** | Gerenciar usuários, configurar integrações, ver métricas de adoção | Toda configuração da empresa |

**Controles de Acesso:**
- RBAC baseado em roles no JWT
- Validação em API level para cada endpoint
- Filtros automáticos por tenant + user role

### Subscription Tiers

**Abordagem MVP:** 1 plano único

- Preço acessível para PMEs brasileiras
- Todas as funcionalidades core disponíveis
- Modelo simples: preço por usuário/mês

**Abordagem Futura:** Múltiplos planos (inspirado no Diio)

| Plano | Foco | Diferenciais |
|-------|------|--------------|
| **Starter** | Equipes pequenas | Visibilidade total, tipos de reunião predefinidos |
| **Business** | Equipes estruturadas | Controles de acesso avançados, funções diferenciadas |
| **Enterprise** | Grandes organizações | Segurança avançada, personalizações, compliance SOC 2 |

### Integration List

**Prioridade MVP:**

1. **Fireflies (webhook)** - Recebe transcrições de videochamadas automaticamente
2. **WhatsApp** - Integração para receber mensagens (atenção: depende de provedor oficial)

**Roadmap Prioritária:**

- **CRM (escolher 1 primeiro):** HubSpot OU Pipedrive
- **Video nativo:** Google Meet / Zoom / Teams
- **Diferencial para líderes:** Integração com calendário (Google/Outlook) para correlacionar reuniões → pipeline
- **Fase 2:** LinkedIn (via extensão/browser ou parceiros)

### Compliance Requirements

**MVP - "Pronto para Enterprise no Futuro":**

**LGPD (Brasil):**
- Base legal/consentimento para gravações e análise
- Política de retenção configurável (90/180/365 dias por tenant)
- Direitos do titular: exportar/excluir dados quando solicitado

**Criptografia:**
- Em trânsito: TLS (HTTPS/WSS)
- Em repouso: Criptografia padrão cloud (AES-256)
- Enterprise: Chaves gerenciadas (KMS) por tenant

**Logs de Auditoria (CRÍTICO):**
- Login/logout
- Mudança de permissões
- Exportações de dados
- Integrações conectadas/desconectadas
- Downloads de transcrições
- "Quem viu o quê" - trilha completa

**Segurança Operacional:**
- Segregação de ambientes (dev/staging/prod)
- Backups automatizados
- Least privilege access
- Rotação de chaves/credentials

**SOC 2 (Futuro):**
- Já desenhar controles: acesso, auditoria, políticas, evidências
- Facilita caminho para certificação quando necessário

### Implementation Considerations

**Prioridades Técnicas:**

1. **Multi-tenancy first:** Tenant_id em tudo desde dia 1
2. **RLS no banco:** Camada fundamental de segurança
3. **Audit trail:** Logs desde início - difícil de adicionar depois
4. **API-first:** Integrações via webhook são core do produto

**Riscos Mitigados:**
- Vazamento de dados entre tenants (RLS + validação)
- Escalabilidade (índices compostos por tenant)
- Compliance futuro (logs + auditoria desde início)

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP
**Filosofia:** Resolver o problema core (análise de conversas com IA) com features mínimas essenciais
**Objetivo:** Validar com 2 empresas piloto que a solução resolve o problema antes de expandir

**Resource Requirements:**
- 1 Desenvolvedor Full-stack
- 1 Desenvolvedor Backend/IA (N8N)
- Equipe mínima viável para MVP em 2-3 meses

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Rafael (SDR) - Qualificar leads com insights
- Bruno (Vendedor) - Fechar com inteligência
- Ana (Admin) - Configurar e gerenciar
- Ricardo (Líder) - Visibilidade da equipe

**Must-Have Capabilities:**

1. **Ingestão de Transcrições**
   - Webhook Fireflies
   - Integração WhatsApp
   - Inserção manual de texto

2. **Análise por IA (N8N + Agente IA)**
   - Extrair: interesses, objeções, compromissos
   - Detectar: sinais de progresso, sinais de risco
   - Sugerir: próximas ações

3. **Interface Web**
   - Lista de conversas com indicadores visuais (risco/progresso)
   - Visualização de insights por conversa
   - Filtros básicos (data, tipo, status)

4. **Multi-tenant + Autenticação**
   - Registro/login por empresa
   - JWT com tenant_id + role
   - Isolamento completo por tenant_id

5. **Gestão de Usuários (Admin)**
   - Adicionar/remover usuários
   - Atribuir roles (Vendedor, Líder, Admin)

6. **Visibilidade por Role**
   - Vendedor/SDR: apenas próprias conversas
   - Líder de Vendas: todas conversas da equipe
   - Admin: configuração completa da empresa

**O que NÃO está no MVP:**
- Comentários em conversas
- Busca avançada
- Dashboards analíticos
- Integração com CRM
- Integração com calendário

### Post-MVP Features

**Phase 2 (Growth) - Após validação com pilotos:**

- Comentários e compartilhamento de conversas
- Busca avançada em todas as conversas
- Dashboards de performance de vendas
- Relatórios de objeções mais comuns
- Análise de tendências de conversas
- Taxa de conversão por estágio

**Phase 3 (Expansion) - Escala e maturidade:**

- Integração com CRM (Pipedrive/HubSpot/Salesforce)
- Integração com calendário (Google/Outlook)
- "Pergunte ao DealMind" - busca conversacional
- Integrações nativas video (Zoom, Meet, Teams)
- LinkedIn
- Planos múltiplos (Starter, Business, Enterprise)
- Compliance SOC 2

### Risk Mitigation Strategy

**Technical Risks:**
- **Risco:** Integrações Fireflies/WhatsApp não funcionarem como esperado
- **Mitigação:** Testar com 2 empresas piloto antes do lançamento geral; ter processo manual de fallback

**Market Risks:**
- **Risco:** Baixa adoção dos usuários (ver jornada da Ana)
- **Mitigação:** Dashboard de adoção para monitorar; onboarding guiado; foco extremo em usabilidade; feedback constante com pilotos

**Resource Risks:**
- **Risco:** Recursos menores que o planejado
- **Mitigação:** Reduzir escopo para 1 integração apenas (Fireflies); features "nice-to-have" são removidas sem impacto no core value
- **Mínimo viável:** 1 desenvolvedor full-stack pode entregar MVP em 3-4 meses

---

## Functional Requirements

### Authentication & User Management

- **FR1:** Admin can create a new company account with organization name and basic information
- **FR2:** Admin can add new users to their company with email and role assignment
- **FR3:** Admin can remove users from their company
- **FR4:** Admin can assign one of three roles (Vendedor, Líder, Admin) to each user
- **FR5:** Users can log in with email and password
- **FR6:** System validates user access based on tenant_id and role

### Conversation Ingestion

- **FR7:** System can receive transcription data from Fireflies via webhook
- **FR8:** System can receive WhatsApp messages via integration
- **FR9:** Users can manually paste transcription text for analysis
- **FR10:** System stores all transcriptions with associated metadata (date, source, participants)

### AI Analysis & Insights

- **FR11:** System can extract detected interests from conversation text
- **FR12:** System can extract objections raised from conversation text
- **FR13:** System can extract commitments made from conversation text
- **FR14:** System can detect progress signals from conversation text
- **FR15:** System can detect risk signals from conversation text
- **FR16:** System can suggest next actions based on conversation analysis
- **FR17:** System can process transcription asynchronously via N8N + AI agent

### Conversation Viewing & Discovery

- **FR18:** Users can view a list of their analyzed conversations
- **FR19:** Users can view detailed insights for a specific conversation
- **FR20:** Vendedores can view only their own conversations
- **FR21:** Líderes can view all conversations from their team
- **FR22:** System displays visual indicators for risk/progress signals in conversation list
- **FR23:** Users can filter conversations by date
- **FR24:** Users can filter conversations by source (Fireflies, WhatsApp, Manual)
- **FR25:** Users can filter conversations by risk/progress status

### Admin & Configuration

- **FR26:** Admin can configure Fireflies webhook integration
- **FR27:** Admin can configure WhatsApp integration
- **FR28:** Admin can view adoption metrics showing active users count
- **FR29:** Admin can view which users have used the system in a time period
- **FR30:** System isolates all data by tenant_id to prevent cross-tenant access

### Data & Compliance

- **FR31:** System maintains audit logs of user login/logout events
- **FR32:** System maintains audit logs of permission changes
- **FR33:** System maintains audit logs of integration configuration changes
- **FR34:** Users can request deletion of their data per LGPD requirements
- **FR35:** Admin can configure data retention period for transcriptions

---

## Non-Functional Requirements

### Performance

- **NFR1:** System processes transcriptions and generates insights within 5 minutes of receipt
- **NFR2:** Web interface pages load within 3 seconds on standard broadband connection
- **NFR3:** Conversation list loads within 2 seconds for up to 100 conversations
- **NFR4:** System supports concurrent processing of 10 transcriptions without significant performance degradation

### Security

- **NFR5:** All data is encrypted in transit using TLS 1.3 or higher
- **NFR6:** All data is encrypted at rest using AES-256 or equivalent
- **NFR7:** System enforces complete tenant isolation via Row Level Security (RLS) at database level
- **NFR8:** User access is validated via JWT with tenant_id and role claims on every request
- **NFR9:** System maintains immutable audit logs for all security-relevant events
- **NFR10:** System supports LGPD data subject rights (export, deletion)

### Scalability

- **NFR11:** System architecture supports 10x user growth (10 to 100 users) with <10% performance degradation
- **NFR12:** Multi-tenant architecture enables horizontal scaling without database re-architecture
- **NFR13:** System can handle burst processing of 50 transcriptions in a 1-hour period

### Accessibility

- **NFR14:** Interface meets WCAG 2.1 Level A requirements for basic accessibility
- **NFR15:** Interface supports keyboard navigation for all core functions
- **NFR16:** Interface provides sufficient color contrast for readability (WCAG AA minimum)

### Integration

- **NFR17:** Fireflies webhook integration achieves >95% successful message receipt
- **NFR18:** WhatsApp integration handles message delivery with automatic retry on failure
- **NFR19:** Async processing via N8N includes queue management and automatic retry logic

### Reliability

- **NFR20:** System maintains 99%+ uptime availability (24/7 operation)
- **NFR21:** System automatically recovers from transient failures without data loss
- **NFR22:** Critical data (transcriptions, insights) is backed up daily with 30-day retention
