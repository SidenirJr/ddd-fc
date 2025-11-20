# Documentação de Arquitetura - Domain-Driven Design (DDD)

Este documento descreve a estrutura e organização arquitetural do projeto baseado nos princípios de **Domain-Driven Design (DDD)**, explicando cada camada, pasta e padrão aplicado.

---

## Estrutura Geral

```
src/
├── domain/           # Camada de Domínio (Regras de Negócio)
│   ├── @shared/      # Componentes compartilhados entre domínios
│   ├── customer/     # Bounded Context de Cliente
│   ├── product/      # Bounded Context de Produto
│   └── checkout/     # Bounded Context de Checkout
└── infrastructure/   # Camada de Infraestrutura (Detalhes Técnicos)
    ├── customer/
    ├── product/
    └── order/
```

---

# DOMAIN (Camada de Domínio)

## FUNÇÃO
A camada de domínio contém toda a lógica de negócio da aplicação. É o coração do sistema, onde residem as regras, validações e comportamentos que refletem o conhecimento do negócio. Esta camada é **independente de frameworks, bancos de dados e tecnologias externas**.

## MOTIVO
No DDD, o domínio é a razão de existir da aplicação. Esta separação garante que:
- As regras de negócio permaneçam isoladas de detalhes técnicos
- O código reflita a linguagem ubíqua (Ubiquitous Language) do negócio
- Seja possível testar a lógica de negócio sem dependências externas
- O sistema seja flexível a mudanças tecnológicas

## CONCLUSÃO
Em sistemas maiores, mantenha a camada de domínio completamente isolada. Nunca permita que conceitos de infraestrutura (como ORMs, HTTP, filas) vazem para o domínio. Use inversão de dependência através de interfaces para que o domínio defina contratos e a infraestrutura os implemente.

---

# @SHARED

## FUNÇÃO
Contém componentes e abstrações que são compartilhados entre **todos os bounded contexts** (domínios). Inclui interfaces genéricas, event handlers base, e padrões comuns reutilizáveis.

## MOTIVO
No DDD, diferentes bounded contexts podem compartilhar abstrações comuns sem criar acoplamento direto entre eles. O `@shared` atua como um **kernel compartilhado** que define:
- Contratos genéricos (interfaces)
- Padrões de infraestrutura agnósticos ao domínio
- Mecanismos de eventos de domínio

O prefixo `@` é uma convenção para indicar que este não é um domínio de negócio, mas sim uma camada de suporte.

## CONCLUSÃO
Use `@shared` apenas para abstrações verdadeiramente genéricas. Evite criar dependências entre bounded contexts através desta pasta. Se algo é específico de um domínio, mesmo que usado por outros, avalie se não seria melhor duplicar ou criar uma biblioteca separada. Em sistemas distribuídos, o `@shared` pode se tornar uma biblioteca NPM separada.

---

# @SHARED/EVENT

## FUNÇÃO
Define o sistema de **Domain Events** (Eventos de Domínio) através de interfaces e implementações base. Contém:
- `event.interface.ts` - Contrato base para eventos
- `event-handler.interface.ts` - Contrato para manipuladores de eventos
- `event-dispatcher.interface.ts` - Contrato para o despachante de eventos
- `event-dispatcher.ts` - Implementação do despachante

## MOTIVO
Domain Events são um padrão fundamental no DDD que permite:
- **Desacoplamento**: Diferentes partes do sistema reagem a mudanças sem conhecimento direto
- **Rastreabilidade**: Captura de fatos importantes que ocorreram no domínio
- **Integração**: Comunicação entre bounded contexts de forma assíncrona

Eventos representam algo que **já aconteceu** no passado (ex: `CustomerCreatedEvent`, `CustomerAddressChangedEvent`).

## CONCLUSÃO
Em sistemas maiores, eventos de domínio são essenciais para:
- Implementar CQRS (Command Query Responsibility Segregation)
- Event Sourcing
- Integração entre microsserviços
- Auditoria e rastreamento de mudanças
- Triggers para processos assíncronos (ex: enviar email quando cliente é criado)

Sempre nomeie eventos no passado e torne-os imutáveis.

---

# @SHARED/REPOSITORY

## FUNÇÃO
Define a interface genérica `RepositoryInterface<T>` que estabelece o contrato padrão para todos os repositórios do sistema:
```typescript
create(entity: T): Promise<void>
update(entity: T): Promise<void>
find(id: string): Promise<T>
findAll(): Promise<T[]>
```

## MOTIVO
O padrão **Repository** no DDD age como uma coleção em memória de agregados. Ele:
- Abstrai a persistência de dados do domínio
- Permite que a lógica de negócio trabalhe com objetos sem conhecer detalhes de armazenamento
- Facilita testes através de mock/stub
- Aplica o princípio de **Inversão de Dependência** (SOLID)

Interfaces de repositório ficam no domínio, mas suas **implementações concretas** ficam na camada de infraestrutura.

## CONCLUSÃO
Em sistemas maiores:
- Crie repositórios específicos por agregado, não por entidade
- Repositórios devem trabalhar com agregados completos, não com partes
- Evite criar repositórios genéricos que aceitam queries arbitrárias
- Use especificações (Specification Pattern) para queries complexas
- Em microsserviços, cada serviço deve ter seus próprios repositórios

---

# CUSTOMER (Bounded Context)

## FUNÇÃO
Representa o **contexto delimitado** (Bounded Context) de Cliente, contendo todas as regras, entidades, valores e operações relacionadas ao conceito de Cliente no negócio.

## MOTIVO
Bounded Contexts são a essência do DDD. Eles:
- Estabelecem fronteiras explícitas onde um modelo de domínio é válido
- Permitem que a mesma palavra tenha significados diferentes em contextos diferentes
- Facilitam o trabalho de times autônomos
- Reduzem a complexidade dividindo o domínio em partes gerenciáveis

No contexto de Customer, "cliente" tem regras específicas que podem diferir de como "cliente" é visto no contexto de Marketing ou Suporte.

## CONCLUSÃO
Em sistemas maiores:
- Cada bounded context pode se tornar um microsserviço
- Defina um Context Map para mapear relacionamentos entre contexts
- Use padrões como Shared Kernel, Customer-Supplier, Anti-corruption Layer
- Mantenha comunicação entre contexts apenas via eventos ou APIs bem definidas
- Cada context deve ter seu próprio banco de dados (database per service)

---

# ENTITY

## FUNÇÃO
Contém as **Entidades** do domínio - objetos que possuem identidade única e continuidade ao longo do tempo. Por exemplo, `Customer` é uma entidade porque um cliente específico é rastreável por seu ID, mesmo que seus atributos mudem.

## MOTIVO
No DDD, Entidades são objetos de domínio definidos por sua **identidade**, não por seus atributos:
- Dois clientes com mesmo nome são diferentes se têm IDs diferentes
- Entidades encapsulam regras de negócio e comportamentos
- Possuem ciclo de vida e podem sofrer mutações
- Garantem consistência através de validações e invariantes

Entidades diferem de Value Objects, que são definidos apenas por seus valores.

## CONCLUSÃO
Em sistemas maiores:
- Entidades devem ser ricas em comportamento (Rich Domain Model), não anêmicas
- Sempre valide invariantes no construtor e em métodos que modificam estado
- Use getters/setters privados para controlar mudanças de estado
- Entidades agregadas (Aggregates) definem fronteiras transacionais
- Nunca exponha coleções mutáveis diretamente
- Prefira métodos de negócio (ex: `activate()`, `addRewardPoints()`) ao invés de setters genéricos

---

# VALUE-OBJECT

## FUNÇÃO
Contém **Value Objects** (Objetos de Valor) - objetos imutáveis definidos apenas por seus atributos, sem identidade própria. Exemplo: `Address` é um value object porque dois endereços idênticos são intercambiáveis.

## MOTIVO
Value Objects no DDD:
- Representam conceitos descritivos do domínio
- São **imutáveis** - qualquer "mudança" cria uma nova instância
- São comparados por valor, não por referência
- Encapsulam validações e comportamentos relacionados
- Tornam o código mais expressivo e type-safe

Um `Address` não precisa de ID porque o que importa são seus valores (rua, número, CEP, cidade).

## CONCLUSÃO
Em sistemas maiores:
- Use value objects extensivamente para evitar "primitive obsession"
- Prefira `Money` ao invés de `number`, `Email` ao invés de `string`
- Value objects podem conter lógica de negócio (ex: `Money.add(otherMoney)`)
- São excelentes para compartilhar entre bounded contexts
- Facilitam validações centralizadas
- Tornam refatorações mais seguras (compile-time safety)

---

# FACTORY

## FUNÇÃO
Contém **Factories** - classes responsáveis por encapsular a lógica complexa de criação de objetos de domínio. Exemplo: `CustomerFactory` cria instâncias de `Customer` com regras específicas.

## MOTIVO
Factories no DDD servem para:
- Centralizar lógica complexa de construção
- Esconder detalhes de inicialização
- Garantir que objetos sejam criados em estado válido
- Facilitar criação de objetos com múltiplas variações
- Gerar IDs únicos automaticamente (usando UUID, por exemplo)

Quando um construtor se torna muito complexo ou há múltiplas formas de criar um objeto, use uma Factory.

## CONCLUSÃO
Em sistemas maiores:
- Use factories para criação de agregados complexos
- Factories podem receber DTOs e transformá-los em entidades
- Úteis em testes para criar objetos válidos rapidamente (Test Data Builders)
- Podem conter lógica de negócio sobre "como" criar objetos
- Em sistemas distribuídos, factories podem consultar serviços externos para obter dados necessários à criação

---

# REPOSITORY (Interface)

## FUNÇÃO
Define contratos específicos de repositório para cada agregado do bounded context. Exemplo: `CustomerRepositoryInterface` herda de `RepositoryInterface<Customer>` e pode adicionar métodos específicos como `findByEmail(email: string)`.

## MOTIVO
No DDD:
- Cada agregado deve ter **no máximo um repositório**
- Repositórios específicos podem estender o contrato base com queries de negócio
- A interface fica no domínio para manter a inversão de dependência
- Permite diferentes implementações (SQL, NoSQL, in-memory para testes)

## CONCLUSÃO
Em sistemas maiores:
- Repositórios devem retornar agregados completos, não queries parciais
- Use repositórios para queries complexas de negócio (findActiveCustomersWithOrders)
- Não transforme repositórios em query builders genéricos
- Em CQRS, separe repositórios de write (comandos) de read models (queries)
- Repositories são a fronteira entre domínio e infraestrutura

---

# SERVICE (Domain Service)

## FUNÇÃO
Contém **Serviços de Domínio** - operações de negócio que não pertencem naturalmente a uma entidade ou value object específico. Exemplo: `ProductService.increasePrice()` opera sobre múltiplos produtos.

## MOTIVO
Domain Services no DDD são usados quando:
- A operação envolve múltiplas entidades ou agregados
- A lógica não é responsabilidade natural de uma entidade
- Existe um processo ou transformação importante no domínio
- A operação é **stateless** (não mantém estado)

Diferente de Application Services (orquestração/casos de uso), Domain Services contêm **lógica de negócio pura**.

## CONCLUSÃO
Em sistemas maiores:
- Use domain services com moderação - prefira lógica dentro de entidades
- Domain services devem ter nomes que reflitam conceitos do negócio
- Não confunda com application services (camada de aplicação)
- Em microsserviços, domain services podem orquestrar chamadas entre agregados do mesmo contexto
- Mantenha stateless - não armazene estado entre chamadas

---

# EVENT (Domain Events)

## FUNÇÃO
Contém eventos específicos do bounded context. Exemplo: `CustomerCreatedEvent`, `CustomerAddressChangedEvent` - representam fatos que ocorreram no domínio de Customer.

## MOTIVO
Domain Events específicos:
- Capturam conhecimento do negócio ("quando um cliente muda de endereço, algo aconteceu")
- Permitem reações assíncronas a mudanças
- Servem como integração entre bounded contexts
- Mantêm histórico de mudanças importantes
- Facilitam implementação de Event Sourcing

## CONCLUSÃO
Em sistemas maiores:
- Use eventos para comunicação entre bounded contexts (Context Integration)
- Eventos podem ser persistidos para auditoria e replay
- Em arquiteturas de microsserviços, eventos são publicados em message brokers (RabbitMQ, Kafka)
- Nomeie eventos de forma que façam sentido para o negócio
- Eventos devem ser imutáveis e conter todas as informações necessárias

---

# EVENT/HANDLER

## FUNÇÃO
Contém **Event Handlers** - classes que reagem a eventos específicos do domínio. Exemplo: `SendConsoleLog1Handler` reage ao evento `CustomerCreatedEvent` executando uma ação (log no console).

## MOTIVO
Event Handlers no DDD:
- Implementam o padrão Observer para eventos de domínio
- Permitem side effects sem acoplar lógica na entidade
- Cada handler tem uma responsabilidade única (Single Responsibility Principle)
- Podem ser registrados/desregistrados dinamicamente
- Facilitam testes de comportamentos reativos

## CONCLUSÃO
Em sistemas maiores:
- Handlers podem disparar integrações (enviar email, publicar em fila)
- Use múltiplos handlers para um mesmo evento (separação de responsabilidades)
- Handlers devem ser idempotentes quando possível
- Em produção, handlers podem falhar - implemente retry e dead letter queues
- Considere usar libs como MediatR ou sistemas de mensageria

---

# PRODUCT (Bounded Context)

## FUNÇÃO
Contexto delimitado responsável por todo o conhecimento e regras relacionadas a Produtos no sistema.

## MOTIVO
Similar ao contexto de Customer, Product representa um bounded context independente onde:
- "Produto" tem significado específico neste contexto
- As regras de produto podem diferir de como produtos são vistos em Catálogo ou Estoque
- Permite que times trabalhem independentemente
- Isola mudanças em um contexto específico

## CONCLUSÃO
Em sistemas maiores:
- Product pode ter sua própria base de dados
- Pode evoluir para um microsserviço independente
- Comunicação com outros contexts via eventos ou APIs
- Pode ter seu próprio ciclo de deploy
- Times podem ter autonomia total sobre este contexto

---

# CHECKOUT (Bounded Context)

## FUNÇÃO
Contexto delimitado responsável pelo processo de finalização de compra, contendo agregados como `Order` e `OrderItem`.

## MOTIVO
Checkout representa um processo de negócio distinto:
- Orquestra informações de Customer e Product, mas mantém seu próprio modelo
- Um "Order" no contexto de Checkout pode diferir de "Pedido" em Logística
- Encapsula regras específicas de criação e validação de pedidos
- Isolamento permite otimizações específicas (ex: leitura intensiva vs escrita)

## CONCLUSÃO
Em sistemas maiores:
- Checkout pode ser um serviço separado de alta disponibilidade
- Pode usar CQRS (comando para criar ordem, query otimizada para visualização)
- Event-driven: publica OrderCreatedEvent para outros contextos reagirem
- Pode ter diferentes estratégias de persistência (cache, sharding)
- Anti-corruption Layer pode traduzir modelos de outros contexts

---

# INFRASTRUCTURE (Camada de Infraestrutura)

## FUNÇÃO
Camada responsável por **detalhes técnicos de implementação**: persistência de dados, frameworks, bibliotecas externas, APIs, filas de mensagens, etc. Esta camada **implementa as interfaces definidas no domínio**.

## MOTIVO
No DDD, a separação entre domínio e infraestrutura é fundamental:
- **Inversão de Dependência**: Infraestrutura depende do domínio, nunca o contrário
- Permite trocar tecnologias sem impactar regras de negócio
- Facilita testes isolados da lógica de negócio
- Frameworks e bibliotecas são detalhes substituíveis
- O domínio permanece agnóstico a tecnologia

## CONCLUSÃO
Em sistemas maiores:
- Infraestrutura pode ter múltiplas implementações (SQL, NoSQL, cache)
- Use padrões como Adapter, Gateway para isolar dependências externas
- Configurações, conexões, ORMs ficam aqui
- Em Clean Architecture, esta é a camada mais externa
- Mudanças aqui não devem impactar testes de domínio

---

# INFRASTRUCTURE/REPOSITORY/SEQUELIZE

## FUNÇÃO
Contém **implementações concretas** dos repositórios usando Sequelize ORM. Exemplo: `CustomerRepository` implementa `CustomerRepositoryInterface` usando models do Sequelize.

## MOTIVO
Esta estrutura demonstra:
- **Dependency Inversion Principle**: O domínio define a interface, a infraestrutura implementa
- Permite múltiplas implementações (Sequelize, TypeORM, Prisma, in-memory)
- Models do Sequelize (`CustomerModel`) são detalhes de persistência
- Mapeamento entre entidades de domínio e models de banco
- Isolamento de concerns: domínio não conhece SQL

## CONCLUSÃO
Em sistemas maiores:
- Repositories fazem tradução (mapping) entre domain entities e persistence models
- Considere usar Data Mapper ao invés de Active Record
- Pode haver múltiplas pastas (sequelize, typeorm, mongodb) com diferentes implementações
- Em testes, injete repositórios in-memory
- Use transações para garantir consistência de agregados
- Repositories podem usar Unit of Work pattern para gerenciar transações

---

# BOAS PRÁTICAS E PADRÕES APLICADOS

## Separação de Camadas
- **Domínio**: Puro, sem dependências externas
- **Infraestrutura**: Implementa interfaces do domínio

## Inversão de Dependência
- Interfaces no domínio, implementações na infraestrutura
- Facilita testes e troca de tecnologias

## Bounded Contexts
- Customer, Product, Checkout são contexts independentes
- Comunicação via eventos de domínio

## Rich Domain Model
- Entidades com comportamento, não apenas dados
- Validações e invariantes nas próprias entidades

## Value Objects
- Imutáveis, comparados por valor
- Encapsulam validações (Address)

## Factories
- Centralizam criação complexa
- Garantem objetos em estado válido

## Domain Events
- Desacoplamento entre módulos
- Captura de fatos do negócio

## Repository Pattern
- Abstração de persistência
- Interface no domínio, implementação na infraestrutura

## COMO USAR EM SISTEMAS MAIORES

### 1. Microsserviços
Cada bounded context pode evoluir para um microsserviço:
```
customer-service/
  ├── src/domain/customer/
  └── src/infrastructure/

product-service/
  ├── src/domain/product/
  └── src/infrastructure/

checkout-service/
  ├── src/domain/checkout/
  └── src/infrastructure/
```

### 2. Comunicação Entre Contexts
- **Eventos**: Publish/Subscribe via message broker
- **APIs**: REST/gRPC para comunicação síncrona
- **Anti-corruption Layer**: Tradução de modelos entre contexts

### 3. Evolução
- Inicie com monolito modular (bounded contexts bem definidos)
- Extraia microsserviços conforme necessário
- Mantenha independência dos contexts

### 4. Testes
- **Domínio**: Testes unitários puros, sem mocks de infra
- **Infraestrutura**: Testes de integração com banco real ou containers
- **E2E**: Testes através de casos de uso

### 5. CQRS e Event Sourcing
- Separe models de leitura e escrita
- Use eventos como source of truth
- Read models otimizados por caso de uso

---

## CONCLUSÃO FINAL

Esta arquitetura demonstra DDD aplicado de forma prática e escalável. Os princípios aqui aplicados garantem:

- **Manutenibilidade**: Código organizado por conceitos de negócio
- **Testabilidade**: Domínio isolado e testável
- **Escalabilidade**: Bounded contexts podem crescer independentemente
- **Flexibilidade**: Troca de tecnologias sem impactar negócio
- **Colaboração**: Times podem trabalhar em contexts diferentes
- **Evolução**: De monolito para microsserviços sem reescrita

O DDD não é sobre código, é sobre **entender profundamente o negócio** e refletir esse conhecimento na arquitetura do software.
