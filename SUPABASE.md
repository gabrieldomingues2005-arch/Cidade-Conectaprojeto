# Supabase — Cidade Conecta

O Cidade Conecta usa projeto Supabase próprio, separado de Raiz Carbon / Carbon Track.

## Projeto oficial

- Nome: `Cidade Conecta`
- Project ref: `yvmkgpijzewssdxgimit`
- Região: `sa-east-1`
- URL pública: `https://yvmkgpijzewssdxgimit.supabase.co`

**Nunca usar o projeto RAIZ CARBON `htzigdvatjpvvkwswjof`.**

## Estado atual

O backend foi provisionado em 17/09/2026 e está saudável.

Já foram aplicadas migrations para:

- PostgreSQL base;
- PostGIS;
- município de Piracicaba;
- 9 regiões administrativas em estado `metadata-only`;
- bairros e vínculo N:N com regiões;
- categorias;
- perfis ligados ao Supabase Auth;
- ocorrências;
- localização pública e localização exata privada;
- histórico;
- anexos;
- auditoria;
- RLS;
- índices geográficos e relacionais;
- bucket privado `occurrence-attachments`.

O Security Advisor não apresentou alertas após a configuração. O Performance Advisor só aponta índices ainda não utilizados, esperado enquanto o banco está praticamente vazio.

## Integração do frontend

A configuração pública fica em `assets/runtime-config.js` e a leitura técnica em `assets/supabase-bridge.js`.

O site está em `dataMode: hybrid-read`: o navegador confirma leitura do Supabase, mas a criação/edição de ocorrências continua local até a próxima etapa de migração segura.

No navegador podem existir somente:

- URL pública do projeto Supabase;
- `project_ref` público;
- chave `publishable` do cliente;
- configurações não secretas.

Nunca colocar no GitHub ou JavaScript público:

- `service_role`;
- `sb_secret_*`;
- senha do PostgreSQL;
- tokens administrativos;
- chaves privadas;
- credenciais de outro projeto.

## Segurança

Todas as tabelas expostas têm RLS. Dados territoriais/categorias têm leitura pública controlada. Ocorrências públicas exigem `public_visible = true` e moderação aprovada. Dados privados exigem usuário proprietário ou perfil interno autorizado. Alteração de `role` não é permitida ao próprio usuário pelo cliente.

O bucket de anexos é privado e permite upload/leitura do próprio usuário autenticado; equipe autorizada poderá acessar conforme RLS.

## Próximas etapas

1. Manter leitura do backend validada no preview.
2. Criar fluxo seguro de escrita de ocorrências.
3. Migrar gradualmente os registros do `localStorage`.
4. Conectar Auth à interface.
5. Conectar Storage às fotos.
6. Substituir o Admin demonstrativo por autorização real.
7. Somente depois habilitar integrações externas.

## Princípio

Se houver dúvida sobre qual projeto Supabase está selecionado, nenhuma alteração deve ser executada. Cidade Conecta e Raiz Carbon permanecem totalmente separados.
