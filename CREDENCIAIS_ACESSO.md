# Credenciais de Acesso - Sistema Beira Mar Pescados

## Sistema de Autenticação Implementado

O sistema agora possui autenticação real com controle de acesso baseado em funções (RBAC).

## Usuários Cadastrados

### 1. Administrador (Acesso Total)
- **ID:** adm
- **Senha:** admin123
- **Nome:** Administrador
- **Permissões:** Acesso completo a todas as páginas e funcionalidades do sistema

### 2. Motorista
- **ID:** moto
- **Senha:** motorista123
- **Nome:** João Motorista
- **Permissões:** Gestão de Entregas, Comunicação

### 3. Estoquista
- **ID:** estoque
- **Senha:** estoque123
- **Nome:** Maria Estoquista
- **Permissões:** Controle de Estoque, Controle de Produção, Comunicação

### 4. Auxiliar de Produção
- **ID:** producao
- **Senha:** producao123
- **Nome:** Carlos Auxiliar
- **Permissões:** Controle de Produção, Comunicação

### 5. Vendedor
- **ID:** vendedor
- **Senha:** vendedor123
- **Nome:** Ana Vendedora
- **Permissões:** Cadastro de Clientes, Gestão de Pedidos, Gestão de Entregas, Comunicação

## Recursos Implementados

### ✅ Autenticação Real
- Validação de credenciais (ID e senha)
- Mensagens de erro personalizadas
- Feedback visual durante o login
- Redirecionamento automático após login

### ✅ Controle de Acesso
- Cada usuário vê apenas as páginas permitidas no menu
- Tentativa de acessar páginas não autorizadas redireciona para o painel
- Usuários não autenticados são redirecionados para a tela de login

### ✅ Sessão de Usuário
- Sessão armazenada no localStorage
- Informações do usuário exibidas no header das páginas
- Logout seguro com confirmação

### ✅ Sidebar Dinâmico
- Menu se adapta conforme as permissões do usuário
- Administrador vê todas as opções
- Outros usuários veem apenas suas áreas

## Como Testar

1. Abra o arquivo [index.html](index.html) no navegador
2. Faça login com uma das credenciais acima
3. Observe que:
   - O menu lateral mostra apenas as páginas permitidas
   - O nome e função do usuário aparecem no header
   - Não é possível acessar páginas não autorizadas

### Exemplos de Teste:

**Motorista (ID: 002)**
- Verá apenas: Início, Gestão de Entregas, Comunicação
- Não consegue acessar: Estoque, Produção, Pedidos, Cadastros, etc.

**Vendedor (ID: 005)**
- Verá: Início, Cadastro de Clientes, Gestão de Pedidos, Gestão de Entregas, Comunicação
- Tem acesso completo ao ciclo de vendas

**Estoquista (ID: 003)**
- Verá: Início, Controle de Estoque, Controle de Produção, Comunicação
- Gerencia estoque e acompanha produção

**Auxiliar de Produção (ID: 004)**
- Verá apenas: Início, Controle de Produção, Comunicação
- Acesso restrito apenas à área de produção

## Segurança

- Senhas são validadas no login (em produção, devem estar em um backend seguro)
- Páginas protegidas verificam autenticação antes de carregar
- Sistema de permissões granular por função
- Logout limpa completamente a sessão

## Como Adicionar Novos Usuários

Edite o arquivo [auth.js](auth.js) e adicione novos usuários no objeto `USERS_DB`:

```javascript
'006': {
    id: '006',
    senha: 'sua_senha_aqui',
    nome: 'Nome do Funcionário',
    role: ROLES.VENDEDOR // pode ser: ADMIN, MOTORISTA, ESTOQUISTA, AUX_PRODUCAO, VENDEDOR
}
```

## Como Modificar Permissões

Para alterar as permissões de uma função, edite o objeto `PERMISSIONS` ou `MENU_PERMISSIONS` no arquivo [auth.js](auth.js).

## Estrutura de Arquivos Criados/Modificados

- **auth.js** - Sistema principal de autenticação
- **authGuard.js** - Proteção de páginas
- **script.js** - Login com validação real
- **index.html** - Tela de login atualizada
- **components/sidebar.js** - Menu dinâmico baseado em permissões
- **Todas as páginas HTML** - Proteção de acesso adicionada

## Próximos Passos Recomendados

1. Integrar com backend real para armazenar usuários em banco de dados
2. Implementar hash de senhas (bcrypt)
3. Adicionar autenticação JWT ou sessões no servidor
4. Implementar recuperação de senha
5. Adicionar logs de auditoria de login
6. Implementar expiração de sessão automática
