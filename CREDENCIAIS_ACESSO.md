# Acesso de demonstração

> Estas credenciais são fictícias, públicas e existem apenas para testar o protótipo no navegador. Não correspondem a pessoas, contas ou sistemas reais.

## Perfis disponíveis

| Perfil | ID | Senha |
| --- | --- | --- |
| Administrador | `adm` | `admin123` |
| Motorista | `moto` | `motorista123` |
| Estoquista | `estoque` | `estoque123` |
| Auxiliar de produção | `producao` | `producao123` |
| Vendedor | `vendedor` | `vendedor123` |

## Como testar

1. Abra o arquivo [index.html](index.html) no navegador.
2. Use um dos perfis acima.
3. Observe que o menu e o redirecionamento mudam conforme a função escolhida.
4. Use a opção de saída para encerrar a sessão demonstrativa.

## O que o protótipo demonstra

- validação de ID e senha no front-end;
- sessão armazenada no `localStorage`;
- menu adaptado ao perfil;
- redirecionamento para a área principal de cada função;
- bloqueio visual de páginas fora do perfil.

## Limitação de segurança

Este projeto não possui autenticação real no servidor.

Os usuários e as senhas estão no arquivo [auth.js](auth.js), portanto qualquer pessoa pode visualizá-los. O bloqueio de páginas ocorre apenas no navegador e não deve ser usado para proteger informações reais.

Para uso em produção, seria necessário implementar:

- backend com autenticação e autorização;
- senhas armazenadas com hash;
- banco de dados;
- sessões ou tokens protegidos;
- validação de permissões no servidor;
- expiração de sessão e auditoria.
