# Auditoria e direção de produto — 02/11/2026

Base: 37c161eb63dc15935cbaf4b7b4e1672d82e8778d. Trabalho incremental na branch feature/cidade-conecta-design-system-20261102. Backend aprovado permanece fora do escopo de alteração.

Inspeção direta no navegador da prévia local, viewport de aproximadamente 1366 px. Capturas preservadas em [evidence/before](evidence/before) e [evidence/after](evidence/after). Screenshots representam a aplicação real; dados demonstrativos não são ocorrências reais. O OpenStreetMap exibiu um aviso de bloqueio de tiles neste navegador, registrado como limite de cartografia, sem contornar o bloqueio.

| Passo | Tela / evidência | Avaliação inicial | Correção proposta |
|---|---|---|---|
| 1 | [Home](evidence/before/01-home.jpg) | Marca reconhecível; cabeçalho esconde navegação em desktop; hero e avisos competem | Navegação principal visível, hierarquia entre apresentação e ação, rótulo de origem do conjunto |
| 2 | [Registrar](evidence/before/02-registrar.jpg) | Progressão e privacidade claras; escala irregular entre títulos, etapas e campos | Tipografia, controles, espaços e prévia consistentes; manter formulário único |
| 3 | Mapa / inspeção interativa¹ | Lista e regiões funcionais; controles muito densos e texto pequeno | Painéis uniformes, filtros legíveis, estados claros e alvos de toque; preservar Leaflet e território |
| 4 | [Indicadores](evidence/before/04-indicadores.jpg) | Valores textuais disponíveis; cabeçalho grande e contraste/pesos desiguais | KPIs tabulares, hierarquia de painéis, escala mínima de textos e estado vazio explícito |
| 5 | [Rede](evidence/before/05-rede.jpg) | Competências e canais bem separados; categorias cortadas horizontalmente | Categorias em grade/quebra de linhas, links e canais externos identificáveis |
| 6 | [Admin anônimo](evidence/before/06-admin.jpg) | Proteção de acesso clara; espaços excessivos e botão isolado | Cartão de entrada compacto, botão com largura consistente, sem alterar autenticação |
| 7 | [Acompanhar](evidence/before/07-acompanhar.jpg) | Ação compreensível; grandes vazios e ausência de orientação inicial | Campo de protocolo legível e pequeno guia de uso; preservar consulta segura |

¹ A captura inicial do mapa foi revisada na sessão, mas seu arquivo não foi preservado. As evidências finais de Mapa/Lista/Regiões estão no CI; não se apresenta uma reconstrução como captura inicial.

A inspeção visual não prova conformidade WCAG. Teclado, foco da busca modal, nomes acessíveis, contraste dos tokens e responsividade são verificados na implementação e no CI, conforme [ENTREGA.md](ENTREGA.md). Sem teste com leitor de tela real ou aparelho físico nesta auditoria.

Direção: interface cívica editorial, verde profundo, acento lima restrito à ação/seleção, superfícies de papel claras, bordas precisas e poucos níveis de sombra. Marca e ícones existentes preservados. Sem fontes/CDNs novos, efeitos sem função ou migração de tecnologia.
