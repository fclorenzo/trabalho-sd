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
