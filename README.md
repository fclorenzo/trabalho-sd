# trabalho-sd

# 🏛️ Arquitetura da Solução

A arquitetura deste projeto foi desenhada para ser moderna, robusta e, acima de tudo, modular, permitindo uma comparação de desempenho justa e clara entre as tecnologias de banco de dados SQL e NoSQL. A solução segue o padrão clássico **Arquitetura em 3 Camadas (3-Tier Architecture)**, com cada componente containerizado via Docker para garantir consistência e reprodutibilidade do ambiente.

## Visão Geral

O sistema consiste em duas implementações de back-end funcionalmente idênticas. Ambas expõem uma API REST para operações CRUD (Create, Read, Update, Delete) em uma entidade `Produto`, mas diferem unicamente na camada de persistência de dados:

1. **Stack 1:** API em **Nest.js** conectada a um banco de dados relacional **PostgreSQL**.
2. **Stack 2:** API em **Nest.js** conectada a um banco de dados não-relacional (NoSQL) **MongoDB**.

Essa abordagem de espelhamento arquitetônico permite isolar o banco de dados como a principal variável nos experimentos de desempenho.

## As 3 Camadas

### 1\. Camada de Cliente (Simulada)

Não há uma interface de usuário (front-end) neste projeto. A camada de cliente é simulada pela ferramenta **Apache JMeter**.

* **Responsabilidade:** Gerar cargas de trabalho massivas e simultâneas contra os endpoints da API, simulando o comportamento de centenas de usuários.
* **Justificativa:** JMeter é uma ferramenta padrão da indústria para testes de performance, permitindo a configuração detalhada de cenários de teste, como a proporção de operações de leitura e escrita (50/50, 75/25, 25/75), e a coleta de métricas essenciais como vazão (throughput) e tempo de resposta.

### 2\. Camada de Aplicação (Servidor Web)

O coração da nossa aplicação, responsável por toda a lógica de negócio.

* **Tecnologia:** **Nest.js** (um framework Node.js construído com TypeScript).
* **Responsabilidade:**
  * Expor os endpoints da API REST (`/produtos`).
  * Receber e validar as requisições HTTP do cliente (JMeter).
  * Orquestrar as operações de negócio (que neste caso são as próprias operações CRUD).
  * Comunicar-se com a camada de dados para persistir e recuperar informações.
* **Características Chave:** A API é projetada para ser **stateless**. Isso significa que nenhuma informação de sessão do cliente é mantida no servidor entre as requisições. Cada requisição é tratada de forma independente, uma premissa fundamental para sistemas distribuídos escaláveis e tolerantes a falhas.
* **Justificativa:** Nest.js foi escolhido por sua arquitetura modular e opinativa, que promove um código limpo e organizado. O uso de TypeScript adiciona uma camada de segurança de tipos, reduzindo a probabilidade de erros em tempo de execução, enquanto sua performance em operações I/O-bound (como esperar o banco de dados responder) é excelente para APIs.

### 3\. Camada de Dados (Banco de Dados)

Esta é a camada onde reside a principal variável do nosso experimento.

* **Responsabilidade:** Armazenamento, gerenciamento e recuperação dos dados da aplicação de forma eficiente e confiável.
* **Variação 1 (SQL): PostgreSQL**
  * **Justificativa:** Um dos sistemas de gerenciamento de banco de dados relacional mais avançados e robustos do mundo. Foi escolhido por sua conformidade com o padrão ACID, sua performance consistente em leituras complexas e seu ecossistema maduro. Representa a abordagem tradicional e estruturada para persistência de dados.
* **Variação 2 (NoSQL): MongoDB**
  * **Justificativa:** Um banco de dados orientado a documentos, líder na categoria NoSQL. Foi escolhido por sua flexibilidade de schema, escalabilidade horizontal e alta performance em operações de escrita intensiva. Representa a abordagem moderna e flexível, otimizada para grandes volumes de dados e agilidade no desenvolvimento.

## 📦 Containerização com Docker

Toda a infraestrutura da aplicação (tanto para a stack Postgres quanto para a Mongo) é gerenciada pelo **Docker** e **Docker Compose**.

* **`Dockerfile`:** Cada API possui seu próprio `Dockerfile`, que contém a "receita" para construir uma imagem de contêiner leve e otimizada para produção.
* **`docker-compose.yml`:** Cada stack tem um arquivo de orquestração que, com um único comando (`docker-compose up`), sobe dois serviços interconectados: o contêiner da aplicação Nest.js e o contêiner do respectivo banco de dados (Postgres ou Mongo).
* **Justificativa:** O uso de Docker resolve o clássico problema "na minha máquina funciona". Ele garante que todos os membros da equipe e o ambiente de testes executem a aplicação exatamente da mesma forma, eliminando inconsistências de ambiente e facilitando a configuração e a execução dos experimentos.

## 📊 Diagrama da Arquitetura

O diagrama abaixo ilustra o fluxo de requisições e a estrutura paralela das duas stacks sob teste.

```mermaid
graph TD
    subgraph "Ambiente de Teste"
        JMeter[📊 Apache JMeter]
    end

    subgraph "Stack 1: SQL"
        API_PG[🚀 API Nest.js<br>(Porta 3000)]
        DB_PG[(🗄️ PostgreSQL)]
    end

    subgraph "Stack 2: NoSQL"
        API_MONGO[🚀 API Nest.js<br>(Porta 3001)]
        DB_MONGO[(🍃 MongoDB)]
    end

    JMeter --"Requisições HTTP<br>(Ex: POST /produtos)"--> API_PG
    API_PG <--> DB_PG

    JMeter --"Requisições HTTP<br>(Ex: POST /produtos)"--> API_MONGO
    API_MONGO <--> DB_MONGO
```
# 📚 Guia Rápido - Trabalho de Sistemas Distribuídos

## 🚀 Para Executar o Trabalho (3 comandos)

```powershell
# 1. Subir containers (execute em cada pasta)
cd api-postgres
docker-compose up -d

cd ..\api-mongo  
docker-compose up -d

# 2. Instalar JMeter (se não tiver)
# Baixe: https://jmeter.apache.org/download_jmeter.cgi
# Extraia para: C:\apache-jmeter\

# 3. Executar trabalho completo
cd ..\scripts
.\run-trabalho-completo.ps1
```

**⏱️ Tempo total:** ~50-60 minutos

---

## 📁 Arquivos Criados

### Scripts (`scripts/`)
- **`run-trabalho-completo.ps1`** ⭐ - Script principal do trabalho
  - Popula 50k registros
  - Executa 3 cenários (A, B, C) 
  - Testa com 20k para comparação
  - Gera todos os relatórios

- **`seed-data.ps1`** / **`seed-data.js`** - Popular banco com dados
  - Windows/PowerShell: `.\seed-data.ps1 -ApiUrl "http://localhost:3000" -Count 50000`
  - macOS/Linux/Node.js: `node seed-data.js http://localhost:3000 50000`

- **`quick-test.ps1`** - Teste individual rápido
  - Uso: `.\quick-test.ps1 -Api "postgres" -Scenario "balanced"`

- **`generate-summary.ps1`** - Gera resumo comparativo
  - Chamado automaticamente pelo script principal

- **`demo-report.ps1`** - Demo rápida (30s) para ver como funciona
  - Uso: `.\demo-report.ps1`

### Planos JMeter (`jmeter/`)
- **`test-plan-balanced.jmx`** - Cenário A (50% leitura / 50% escrita)
- **`test-plan-read-heavy.jmx`** - Cenário B (75% leitura / 25% escrita)
- **`test-plan-write-heavy.jmx`** - Cenário C (25% leitura / 75% escrita)

### Documentação
- **`TRABALHO.md`** ⭐ - Guia completo do trabalho
- **`GUIA_JMETER.md`** - Tutorial detalhado do JMeter
- **`README.md`** - Documentação da arquitetura

---

## 📊 O que o Script Faz

1. ✅ Verifica pré-requisitos (JMeter, APIs)
2. 🌱 Popula PostgreSQL com 50.000 produtos
3. 🌱 Popula MongoDB com 50.000 produtos
4. 🚀 Executa **6 testes** (3 cenários × 2 bancos):
   - Cenário A: 50 clientes lendo + 50 escrevendo (5 min)
   - Cenário B: 75 clientes lendo + 25 escrevendo (5 min)
   - Cenário C: 25 clientes lendo + 75 escrevendo (5 min)
5. 🔄 Limpa e repopula com 20.000 registros
6. 🚀 Executa **2 testes** comparativos (Cenário A com 20k)
7. 📈 Gera **8 relatórios HTML** + resumo comparativo

---

## 📂 Resultados Gerados

```
results/
└── trabalho_<timestamp>/
    ├── 50k_postgres_cenario-a-50-50_report/index.html
    ├── 50k_mongo_cenario-a-50-50_report/index.html
    ├── 50k_postgres_cenario-b-75-25_report/index.html
    ├── 50k_mongo_cenario-b-75-25_report/index.html
    ├── 50k_postgres_cenario-c-25-75_report/index.html
    ├── 50k_mongo_cenario-c-25-75_report/index.html
    ├── 20k_postgres_cenario-a-50-50_report/index.html
    ├── 20k_mongo_cenario-a-50-50_report/index.html
    └── RESUMO.txt  ← Comparação de métricas
```

---

## 🎯 Métricas para Analisar

| Métrica | O que é | Melhor |
|---------|---------|--------|
| **Throughput** | Requisições/segundo | ⬆️ MAIOR |
| **Latência Média** | Tempo médio de resposta | ⬇️ MENOR |
| **P95/P99** | 95%/99% das requisições | ⬇️ MENOR |
| **Taxa de Erro** | % de falhas | ⬇️ 0% |

---

## 💡 Dicas Importantes

### Para Teste Rápido (validar funcionamento)
```powershell
.\run-trabalho-completo.ps1 -QuickTest
# Usa apenas 1000 registros e 1 min por teste
```

### Se Já Tiver Dados Populados
```powershell
.\run-trabalho-completo.ps1 -SkipSeed
# Pula etapa de população
```

### JMeter em Local Diferente
```powershell
.\run-trabalho-completo.ps1 -JMeterPath "C:\caminho\jmeter.bat"
```

### Problemas com APIs
```powershell
# Ver status
docker ps

# Reiniciar
cd api-postgres
docker-compose restart

cd ..\api-mongo
docker-compose restart
```

---

## 📝 Perguntas do Trabalho

### 1. Qual banco teve melhor desempenho?
- Compare throughput e latência nos 3 cenários
- Analise os relatórios HTML lado a lado

### 2. Como o dataset afeta o desempenho?
- Compare métricas: 50k vs 20k registros
- Use o arquivo RESUMO.txt

### 3. Quando usar SQL vs NoSQL?
- Baseado nos resultados dos testes
- Considere: consistência, flexibilidade, performance

---

## ✅ Checklist de Execução

- [ ] Docker Desktop rodando
- [ ] JMeter instalado em `C:\apache-jmeter\`
- [ ] APIs Postgres (3000) e Mongo (3001) online
- [ ] Executei `.\run-trabalho-completo.ps1`
- [ ] Aguardei conclusão (~50-60 min)
- [ ] Verifiquei 8 relatórios HTML gerados
- [ ] Li o arquivo RESUMO.txt
- [ ] Analisei os gráficos nos relatórios
- [ ] Documentei conclusões

---

## 🆘 Problemas Comuns

### "JMeter não encontrado"
**Solução:** Baixe em https://jmeter.apache.org e extraia para `C:\apache-jmeter\`

### "API não responde"
**Solução:** `docker-compose up -d` na pasta da API

### "Seed muito lento"
**Normal para 50k!** Use `-QuickTest` primeiro para validar

### "Muitos erros nos testes"
**Soluções:**
- Reduza clientes (ex: 50 ao invés de 100)
- Aumente RAM do Docker (Settings → Resources)
- Use duração maior para estabilizar

---

## 📞 Comandos Úteis

```powershell
# Ver containers rodando
docker ps

# Ver logs
docker logs api-postgres-app-1
docker logs api-mongo-app-1

# Testar API manualmente
Invoke-RestMethod -Uri "http://localhost:3000/produtos"

# Ver resultados
ls ..\results

# Abrir relatório
start ..\results\trabalho_<timestamp>\50k_postgres_cenario-a-50-50_report\index.html

# Limpar tudo
docker-compose down -v  # Execute em cada pasta de API
```

---

## 🎓 Para o Relatório do Trabalho

### Estrutura Sugerida

1. **Introdução**
   - Objetivo: Comparar SQL vs NoSQL
   - Tecnologias: Nest.js, PostgreSQL, MongoDB, JMeter

2. **Metodologia**
   - Arquitetura (3 camadas)
   - Dataset: 50k produtos
   - Cenários: A (50/50), B (75/25), C (25/75)
   - Clientes: 100 simultâneos

3. **Resultados**
   - Tabela comparativa (todas as métricas)
   - Gráficos dos relatórios HTML
   - Comparação 50k vs 20k

4. **Análise**
   - Qual banco foi melhor em cada cenário?
   - Por quê?
   - Impacto do tamanho do dataset

5. **Conclusão**
   - Quando usar cada tecnologia
   - Lições aprendidas

### Evidências para Anexar
- Screenshots dos relatórios HTML (Dashboard)
- Arquivo RESUMO.txt
- Gráficos de Response Time e Throughput
- Tabela comparativa preenchida

---

**🎉 Tudo pronto! Execute `.\run-trabalho-completo.ps1` e aguarde os resultados!**

Leia `TRABALHO.md` para detalhes completos.
