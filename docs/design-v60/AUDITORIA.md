# Auditoria e direção de produto — 02/11/2026

Base: 37c161eb63dc15935cbaf4b7b4e1672d82e8778d. Trabalho incremental na branch feature/cidade-conecta-design-system-20261102. Backend aprovado permanece fora do escopo de alteração.

Captura direta no navegador da prévia local, viewport de aproximadamente 1366 px. Capturas antes em artifacts/design-audit/before. Screenshots representam a aplicação real; dados demonstrativos não são ocorrências reais. O OpenStreetMap exibiu um aviso de bloqueio de tiles neste navegador, registrado como limite de cartografia, sem contornar o bloqueio.

| Passo | Tela / evidência | Avaliação inicial | Correção proposta |
|---|---|---|---|
| 1 | Home / 01-home | Marca reconhecível; cabeçalho esconde navegação em desktop; hero e avisos competem | Navegação principal visível, hierarquia entre apresentação e ação, rótulo de origem do conjunto |
| 2 | Registrar / 02-registrar | Progressão e privacidade claras; escala irregular entre títulos, etapas e campos | Tipografia, controles, espaços e prévia consistentes; manter formulário único |
| 3 | Mapa / 03-mapa | Lista e regiões funcionais; controles muito densos e texto pequeno | Painéis uniformes, filtros legíveis, estados claros e alvos de toque; preservar Leaflet e território |
| 4 | Indicadores / 04-indicadores | Valores textuais disponíveis; cabeçalho grande e contraste/pesos desiguais | KPIs tabulares, hierarquia de painéis, escala mínima de textos e estado vazio explícito |
| 5 | Rede / 05-rede | Competências e canais bem separados; categorias cortadas horizontalmente | Categorias em grade/quebra de linhas, links e canais externos identificáveis |
| 6 | Admin anônimo / 06-admin | Proteção de acesso clara; espaços excessivos e botão isolado | Cartão de entrada compacto, botão com largura consistente, sem alterar autenticação |
| 7 | Acompanhar / 07-acompanhar | Ação compreensível; grandes vazios e ausência de orientação inicial | Campo de protocolo legível e pequeno guia de uso; preservar consulta segura |

A inspeção visual não prova conformidade WCAG. Teclado, foco da busca modal, nomes acessíveis, contraste dos tokens e responsividade serão verificados na implementação e no CI. Sem teste com leitor de tela real ou aparelho físico nesta auditoria.

Direção: interface cívica editorial, verde profundo, acento lima restrito à ação/seleção, superfícies de papel claras, bordas precisas e poucos níveis de sombra. Marca e ícones existentes preservados. Sem fontes/CDNs novos, efeitos sem função ou migração de tecnologia.
