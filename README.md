# Beira Mar Pescados

[![CI](https://github.com/LuKeTempestt/beiramar_pescados/actions/workflows/ci.yml/badge.svg)](https://github.com/LuKeTempestt/beiramar_pescados/actions/workflows/ci.yml)
[![Demonstração](https://img.shields.io/badge/demonstra%C3%A7%C3%A3o-online-0A66C2)](https://luketempestt.github.io/beiramar_pescados/)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green)](LICENSE)

Protótipo front-end de um sistema administrativo para uma distribuidora de pescados. A aplicação reúne telas para estoque, produção, pedidos, entregas, clientes, funcionários, histórico e comunicação interna.

**Demonstração online:** [luketempestt.github.io/beiramar_pescados](https://luketempestt.github.io/beiramar_pescados/)

## Sobre o projeto

O objetivo é demonstrar a organização de diferentes rotinas operacionais em uma única interface, com navegação adaptada ao perfil do usuário.

O projeto foi construído com HTML, CSS e JavaScript puro. Os dados de usuários e a sessão são simulados no navegador por meio do `localStorage`.

## Funcionalidades

- painel administrativo;
- controle de estoque e produção;
- gestão de pedidos e entregas;
- cadastro de clientes e funcionários;
- histórico de operações;
- área de comunicação;
- menu dinâmico conforme o perfil;
- fluxo demonstrativo de login e logout.

## Perfis demonstrativos

A interface possui permissões diferentes para:

- administrador;
- motorista;
- estoquista;
- auxiliar de produção;
- vendedor.

As credenciais usadas para testar esses perfis são fictícias e estão documentadas em [CREDENCIAIS_ACESSO.md](CREDENCIAIS_ACESSO.md).

## Tecnologias

- HTML5
- CSS3
- JavaScript
- LocalStorage
- Font Awesome

## Como executar

Para uma avaliação rápida, abra a [demonstração online](https://luketempestt.github.io/beiramar_pescados/) e use um dos perfis fictícios descritos em [CREDENCIAIS_ACESSO.md](CREDENCIAIS_ACESSO.md).

Para executar localmente:

1. Clone o repositório:

```bash
git clone https://github.com/LuKeTempestt/beiramar_pescados.git
```

2. Entre na pasta:

```bash
cd beiramar_pescados
```

3. Abra o arquivo `index.html` no navegador.

Para evitar limitações do navegador ao abrir arquivos locais, você também pode servir a pasta com uma extensão como Live Server.

## Estrutura principal

```text
.
├── assets/              # Imagens e recursos visuais
├── components/          # Sidebar e componentes compartilhados
├── pages/               # Módulos do sistema
├── auth.js              # Perfis e login demonstrativo
├── authGuard.js         # Navegação conforme o perfil
├── global.css           # Estilos globais
├── index.html           # Tela de entrada
└── script.js            # Interações da tela de login
```

## Limitações e segurança

Este repositório é um protótipo de interface, não um sistema de produção.

A autenticação acontece somente no navegador. As credenciais são públicas, a sessão fica no `localStorage` e não existe backend ou banco de dados conectado. Portanto, o controle de acesso demonstra o comportamento da interface, mas não protege dados reais.

Uma versão de produção exigiria autenticação no servidor, senhas com hash, banco de dados, validação de permissões no backend, cookies seguros e auditoria.

## Próximas evoluções

- criar uma API para usuários, pedidos, estoque e entregas;
- integrar um banco de dados;
- migrar a autenticação para o backend;
- adicionar testes automatizados;
- persistir as operações em banco de dados;
- transformar os módulos em uma aplicação full stack.

## Licença

Distribuído sob a [licença MIT](LICENSE).
