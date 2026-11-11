# Publicação no Google Firebase Hosting

O frontend usa a `main` deste repositório e o backend oficial `qzpofoxxrjunyayczcfu`. O projeto Google é `cidade-conecta-piracicaba`, separado dos demais projetos da conta.

- URL de divulgação: https://cidade-conecta-piracicaba.web.app/
- URL alternativa do mesmo Hosting: https://cidade-conecta-piracicaba.firebaseapp.com/
- Painel: https://console.firebase.google.com/project/cidade-conecta-piracicaba/hosting

## Publicar uma atualização

Com Node.js 22 ou superior e Firebase CLI autenticado:

```sh
git switch main
git pull --ff-only origin main
node --test scripts/test-*.mjs
node scripts/validate-project.mjs
node scripts/validate-recovery.mjs
node scripts/qa-client-privacy.mjs
firebase deploy --only hosting --project cidade-conecta-piracicaba
```

O `predeploy` prepara `dist/` usando uma lista explícita de arquivos públicos. Não publica `.git`, SQL, funções Supabase, documentação ou evidências. Atualiza os endereços canônicos, Open Graph e sitemap para o Google somente na cópia de publicação; o código-fonte continua compatível com GitHub Pages. `version.json` informa o commit publicado.

O Hosting atende arquivos e páginas estáticas reais; não converte arquivos ausentes em respostas HTML de sucesso. As rotas interativas continuam usando `#/`. O Service Worker não armazena respostas externas de autenticação ou das Edge Functions.

## Supabase Auth

Abra apenas o projeto oficial:
https://supabase.com/dashboard/project/qzpofoxxrjunyayczcfu/auth/url-configuration

- Site URL: `https://cidade-conecta-piracicaba.web.app/`.
- Acrescente às Redirect URLs, preservando os endereços existentes:
  - `https://cidade-conecta-piracicaba.web.app/`
  - `https://cidade-conecta-piracicaba.firebaseapp.com/`
  - `https://gabrieldomingues2005-arch.github.io/Cidade-Conectaprojeto/` (compatibilidade).

Cadastro e reenvio enviam `redirect_to` para a página atual, sem parâmetros ou fragmento. O retorno limpa as credenciais da barra, valida o usuário no Auth e abre a conta cidadã. Links expirados mostram orientação e reenvio. Não desative a confirmação para contornar falhas de e-mail.

As nove Edge Functions aceitam somente os domínios exatos aprovados (incluindo as duas origens Firebase), preservando validação JWT, papéis internos e os controles existentes. Não há migração de banco nem alteração de permissões para esta publicação. DEMO permanece local; o registro de ocorrências continua sem cadastro.

## Conferência e reversão

Depois da publicação, abra a URL principal em janela anônima e confira `/version.json`, página inicial, menu, mapa/lista, notícias/imagens, conta, confirmação e protocolo. O QR Code deve conter a URL principal completa com `/` final.

Para reverter, selecione uma versão anterior no painel Hosting e use a opção de rollback. As versões anteriores das Edge Functions devem ser restauradas separadamente se necessário; reverter o frontend não modifica o banco.
