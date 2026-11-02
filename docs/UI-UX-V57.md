# Cidade Conecta UI/UX v5.7

Data: 15/10/2026

Branch: `feature/cidade-conecta-auth-admin-20261008`

## Objetivo

Aplicar melhorias incrementais de UX e layout a partir da auditoria visual independente, sem alterar banco, Supabase, Auth, RLS, Storage ou a branch `main`.

## Melhorias aplicadas

- navegação inferior mobile com estado ativo por rota, ícones SVG e item “Mais”;
- cabeçalhos internos compactos, com escala tipográfica e entrelinha consistentes;
- Home com CTA acima da dobra e fallback explícito quando o mapa externo não carrega;
- status “Dados ao vivo indisponíveis” em vez de sugerir indisponibilidade total do site;
- Registrar com progresso em “campos obrigatórios”, botão de envio contextual/desabilitado até completar o necessário e ação “Limpar” com menor peso;
- Mapa com estado de erro explícito e ação de nova tentativa;
- Dashboard com linguagem orientada ao cidadão, contexto de amostra e resolução mostrada como contagem + percentual;
- Rede Municipal com seletor de problema antes da explicação e fluxo “Como funciona” recolhível;
- Admin com login mais compacto, mostrar/ocultar senha, papéis em português e estados distintos para offline, timeout, indisponibilidade e acesso negado;
- Service Worker e assets versionados como UI v5.7.

## QA

O smoke de navegador passa a:
- redefinir conectividade entre cenários para evitar vazamento de estado offline;
- usar reduced motion para capturas estáveis;
- gerar screenshots de página inteira, limitadas a 5000 px de altura.

Gates obrigatórios antes de merge:
- 282 verificações estáticas;
- 46 testes de Auth/Edge/PWA;
- 28 cenários Chrome;
- aviso territorial conhecido de Guamium continua não bloqueante;
- autenticação real e RLS continuam pendentes até o Supabase voltar a `ACTIVE_HEALTHY`.

## Fora de escopo

- SQL, schema ou migrations;
- mudanças de RLS/Auth/Storage;
- merge do PR #5;
- alterações na `main`;
- escrita administrativa;
- redefinição de regiões sem fonte vetorial validada.
