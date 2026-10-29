// Configuração pública de runtime do Cidade Conecta.
// IMPORTANTE: este arquivo NÃO deve receber service_role, senha de banco ou qualquer segredo.
// As chaves abaixo são públicas para navegador e dependem de RLS/Edge Functions no backend.
window.CIDADE_CONECTA_CONFIG = Object.freeze({
  appVersion: '5.7.1',
  city: 'Piracicaba',
  state: 'SP',
  municipalityIbgeCode: '3538709',
  dataMode: 'hybrid-write',
  supabase: Object.freeze({
    enabled: true,
    projectRef: 'qzpofoxxrjunyayczcfu',
    url: 'https://qzpofoxxrjunyayczcfu.supabase.co',
    publishableKey: 'sb_publishable_t6k8wsRirkXMjViTA8g4lg_Rqiep7IN',
    // JWT anônimo legado é público e usado somente para a verificação do gateway das Edge Functions.
    legacyAnonJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cG9mb3h4cmp1bnlheWN6Y2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MDY3MzIsImV4cCI6MjEwODI4MjczMn0.MTofSDZefAQHg3drSx-iv-piSVPMoftd-JpfqJxARYw',
    submitFunction: 'submit-occurrence',
    trackFunction: 'track-occurrence'
  })
});
