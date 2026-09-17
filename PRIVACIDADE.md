# Privacidade e uso responsável — Cidade Conecta

Este documento orienta o protótipo acadêmico. Antes de qualquer uso público real, deverá ser revisado juridicamente e adaptado à LGPD e às regras da instituição/parceiros.

## Princípios

- Coletar apenas dados necessários.
- Separar dados públicos de dados pessoais.
- Não publicar nome, e-mail ou telefone do cidadão.
- Evitar localização excessivamente precisa na área pública quando isso puder expor pessoas ou residências.
- Não permitir acusações, exposição ou denúncias contra pessoas, vizinhos ou estabelecimentos.
- Moderar imagens e descrições antes de disponibilização pública em uma versão real.
- Definir prazo de retenção e procedimento para correção/exclusão de dados.
- Manter trilha de auditoria das mudanças de status.

## Protótipo atual

Os dados são armazenados localmente no navegador e servem apenas para demonstração. Não há autenticação de produção, backend seguro nem integração oficial com órgãos públicos.

## Antes de um piloto comunitário

Será necessário implementar autenticação, autorização por perfis, banco seguro, armazenamento protegido de imagens, política de privacidade completa, termos de uso, moderação, registro de consentimento e canal para exercício dos direitos do titular.


## Implementação v4.6

O MVP usa backend Supabase separado. Nome/e-mail/telefone ficam em `occurrence_contacts`; endereço e coordenadas exatas ficam em `occurrence_private_location`. A ocorrência pública usa coordenadas reduzidas para 3 casas decimais e só é exposta depois da moderação. O token privado de acompanhamento não é armazenado em texto puro no banco.
