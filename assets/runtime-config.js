// Configuração pública de runtime do Cidade Conecta.
// IMPORTANTE: este arquivo NÃO deve receber service_role, senha de banco ou qualquer segredo.
// A chave abaixo é publishable e foi criada para uso público no navegador com RLS ativo.
window.CIDADE_CONECTA_CONFIG = Object.freeze({
  appVersion: '4.5.0',
  city: 'Piracicaba',
  state: 'SP',
  municipalityIbgeCode: '3538709',
  dataMode: 'hybrid-read',
  supabase: Object.freeze({
    enabled: true,
    projectRef: 'yvmkgpijzewssdxgimit',
    url: 'https://yvmkgpijzewssdxgimit.supabase.co',
    publishableKey: 'sb_publishable_-DmGo1Sk6LSZFV565b2tVA_UTTh2Pne'
  })
});
