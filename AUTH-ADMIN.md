# Cidade Conecta — autenticação e painel interno

## Objetivo

Substituir o antigo modo administrativo local por uma área interna autenticada, sem alterar o fluxo público de registro e acompanhamento do cidadão.

## Projeto Supabase

- Projeto: `Cidade Conecta`
- Project ref: `yvmkgpijzewssdxgimit`
- Região: `sa-east-1`

Nunca usar credenciais, banco ou funções do Raiz Carbon.

## Papéis

O schema já prevê:

- `citizen`: usuário comum;
- `triage`: equipe de triagem;
- `agency`: futuro usuário vinculado a órgão/setor;
- `admin`: administração geral.

### Autorização da fase 1

Somente `triage` e `admin` acessam o painel interno.

`citizen` é negado.

`agency` também é negado nesta fase porque ainda não existe um vínculo confiável usuário → órgão/setor. Liberar `agency` sem esse vínculo criaria acesso amplo demais.

## Fluxo de autenticação

1. Usuário abre `#/admin`.
2. O navegador autentica e-mail/senha pelo Supabase Auth.
3. O navegador valida o usuário em `/auth/v1/user`.
4. A Edge Function `admin-occurrences` recebe o JWT.
5. A função valida novamente o JWT com Supabase Auth.
6. A função busca o papel em `users_profile`.
7. Somente `triage` ou `admin` recebem resposta autorizada.
8. A sessão administrativa fica no `sessionStorage` da aba atual; a senha nunca é persistida.

A interface não toma decisão de autorização com `user_metadata` nem com valores enviados pelo usuário.

## Edge Function `admin-occurrences`

Nesta fase a função é somente leitura.

Ações:

- `session`: valida sessão e papel;
- `list`: lista a fila administrativa sem contato ou localização exata;
- `detail`: retorna detalhe e histórico sem dados privados de contato/localização.

A função usa `service_role` somente no backend e nunca devolve a chave ao navegador.

## Dados que NÃO saem nesta fase

- nome de contato do cidadão;
- e-mail;
- telefone;
- endereço exato;
- latitude/longitude exatas privadas;
- token de acompanhamento;
- hashes de rate limit;
- segredos administrativos.

## Escrita administrativa

Atualização de status, setor, moderação e histórico permanece bloqueada nesta fase.

Antes de liberar escrita:

1. criar operação transacional;
2. validar papel no servidor;
3. atualizar ocorrência e inserir auditoria na mesma transação;
4. usar princípio do menor privilégio;
5. testar RLS/grants;
6. testar rollback;
7. executar Security Advisor;
8. só então liberar controles de edição na UI.

Não implementar atualização administrativa como duas chamadas independentes (por exemplo, PATCH e depois INSERT de auditoria), pois isso pode deixar estado sem trilha de auditoria em caso de falha parcial.

## Regras de segurança

- nunca autorizar por `user_metadata`;
- nunca expor `service_role` ou `sb_secret_*` no frontend;
- nunca confiar apenas em `TO authenticated` como autorização;
- manter autopromoção de `users_profile.role` bloqueada;
- manter cidadão sem necessidade de login para o fluxo público atual;
- não habilitar `agency` até existir associação de escopo;
- qualquer acesso a dados privados deve ter necessidade funcional explícita.

## QA mínimo

- login inválido não entra;
- usuário sem perfil interno não entra;
- `citizen` não entra;
- `agency` não entra;
- `triage` entra;
- `admin` entra;
- fechar a aba remove a sessão persistida localmente;
- logout limpa a sessão;
- fila interna não contém contato/localização exata;
- requests sem JWT recebem 401;
- JWT válido com papel inadequado recebe 403;
- nenhuma tela pública exige autenticação;
- Service Worker inclui `assets/auth.js`;
- smoke test renderiza `#/admin` no estado anônimo.

## Próximo estágio

Depois da validação desta fase, implementar escrita administrativa transacional e auditada. Somente depois avaliar o papel `agency` com escopo por órgão/setor.
