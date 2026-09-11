# Supabase — Cidade Conecta

O Cidade Conecta deve usar um projeto Supabase próprio, separado de qualquer outro projeto da equipe, inclusive Raiz Carbon / Carbon Track.

## Estado atual

O front-end continua em `dataMode: local` enquanto o projeto Supabase específico do Cidade Conecta não estiver acessível e validado nesta integração. Isso evita qualquer risco de escrever no banco errado.

A configuração pública fica em `assets/runtime-config.js`.

## Regra de segurança

No navegador podem existir somente:

- URL pública do projeto Supabase;
- chave `publishable`/`anon` apropriada para cliente;
- configurações não secretas.

Nunca colocar no GitHub ou no JavaScript público:

- `service_role`;
- senha do banco PostgreSQL;
- tokens administrativos;
- chaves privadas;
- credenciais de outro projeto.

## Estrutura planejada

O arquivo `schema.sql` já descreve a estrutura futura com:

- município;
- regiões administrativas;
- bairros;
- categorias;
- ocorrências;
- localização pública aproximada;
- localização exata privada;
- histórico;
- anexos;
- perfis;
- auditoria.

## Próximo passo para conectar

1. Confirmar que o projeto Supabase correto é o projeto exclusivo do Cidade Conecta.
2. Obter o `project ref`, URL pública e chave publishable desse projeto.
3. Aplicar/validar o schema no projeto correto.
4. Configurar RLS e políticas antes de permitir escrita pelo navegador.
5. Conectar primeiro leitura de dados públicos.
6. Depois conectar criação de ocorrência por uma API/Edge Function controlada.
7. Somente por último ativar funções administrativas autenticadas.

## Princípio

Se houver qualquer dúvida sobre qual projeto Supabase está selecionado, nenhuma alteração de banco deve ser executada. O projeto Raiz Carbon não deve ser usado pelo Cidade Conecta.
