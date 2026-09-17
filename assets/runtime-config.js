// Configuração pública de runtime do Cidade Conecta.
// IMPORTANTE: este arquivo NÃO deve receber service_role, senha de banco ou qualquer segredo.
// As chaves abaixo são públicas para navegador e dependem de RLS/Edge Functions no backend.
window.CIDADE_CONECTA_CONFIG = Object.freeze({
  appVersion: '4.6.0',
  city: 'Piracicaba',
  state: 'SP',
  municipalityIbgeCode: '3538709',
  dataMode: 'hybrid-write',
  supabase: Object.freeze({
    enabled: true,
    projectRef: 'yvmkgpijzewssdxgimit',
    url: 'https://yvmkgpijzewssdxgimit.supabase.co',
    publishableKey: 'sb_publishable_-DmGo1Sk6LSZFV565b2tVA_UTTh2Pne',
    // JWT anônimo legado é público e usado somente para a verificação do gateway das Edge Functions.
    legacyAnonJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bWtncGlqemV3c3NkeGdpbWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2Nzg5OTcsImV4cCI6MjEwNTI1NDk5N30.obQ-zH09E8Mx9ZZok4_OSeu0y8WCIeVzIQjqWcGcQ7o',
    submitFunction: 'submit-occurrence',
    trackFunction: 'track-occurrence'
  })
});
