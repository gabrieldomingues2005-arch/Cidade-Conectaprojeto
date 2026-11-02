# Backup pré-exclusão — Cidade Conecta Supabase

Data: 22/10/2026  
Projeto: `yvmkgpijzewssdxgimit`  
Status no momento do backup: `COMING_UP`

## Recuperado

- metadados do projeto;
- código exato implantado das Edge Functions:
  - `submit-occurrence` v3;
  - `track-occurrence` v1;
  - `admin-occurrences` v2;
- metadados das chaves públicas, sem salvar seus valores;
- schema/recovery/migrations versionados no repositório;
- base territorial de Piracicaba versionada no repositório.

## NÃO recuperado

O Postgres do projeto não aceita conexão enquanto está em `COMING_UP`.
Até o usuário read-only da plataforma recebe falha de autenticação.

Por isso NÃO existe neste backup:

- dump dos registros do banco;
- usuários/sessões reais do Auth;
- objetos reais do Storage;
- conteúdo de tabelas privadas;
- migrations efetivamente registradas no banco além do que está versionado no GitHub.

## Aviso antes de apagar

A documentação oficial do Supabase informa que a exclusão é permanente e remove
banco, Auth, Storage, Edge Functions e backups associados.

Se existirem dados reais no projeto que não estão versionados no GitHub, eles
podem ser perdidos permanentemente ao apagar enquanto o banco continua inacessível.
