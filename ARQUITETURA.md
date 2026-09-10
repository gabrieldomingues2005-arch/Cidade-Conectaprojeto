# Arquitetura funcional — Cidade Conecta

## Fluxo principal

Cidadão → Cidade Conecta → Administração → Órgão responsável

No protótipo atual, as etapas de Administração e Órgão responsável são simuladas localmente. Não existe integração oficial com Prefeitura ou secretarias.

## Perfis futuros

### Cidadão
- Registrar ocorrência urbana.
- Receber protocolo.
- Acompanhar status e histórico.
- Anexar foto e localização quando necessário.

### Administrador/triagem
- Pesquisar e filtrar ocorrências.
- Classificar categoria e prioridade.
- Definir órgão/setor responsável.
- Atualizar status.
- Adicionar observações de andamento.
- Moderar conteúdo público.

### Órgão responsável
- Receber apenas ocorrências encaminhadas à sua área.
- Registrar andamento e solução.
- Manter histórico auditável.

## Status

1. Recebida
2. Em análise
3. Encaminhada
4. Em andamento
5. Resolvida

## Dados públicos

- protocolo
- título
- categoria
- descrição moderada
- bairro
- localização aproximada
- status
- datas e histórico público
- imagem aprovada para publicação

## Dados privados

- nome
- e-mail
- telefone
- localização exata, quando necessária
- dados técnicos de auditoria

## Próxima arquitetura técnica

O próximo passo recomendado é substituir o armazenamento local por API e PostgreSQL, com armazenamento de objetos para imagens, autenticação real e controle de acesso por perfil. O frontend deve consumir apenas dados públicos nas telas abertas e endpoints protegidos nas áreas administrativas.
