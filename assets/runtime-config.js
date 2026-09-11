// Configuração pública de runtime do Cidade Conecta.
// IMPORTANTE: este arquivo NÃO deve receber service_role, senha de banco ou qualquer segredo.
// Enquanto o projeto Supabase do Cidade Conecta não estiver conectado nesta integração,
// o site permanece em modo local e não toca em nenhum outro projeto Supabase.
window.CIDADE_CONECTA_CONFIG = Object.freeze({
  appVersion: '4.4.0',
  city: 'Piracicaba',
  state: 'SP',
  municipalityIbgeCode: '3538709',
  dataMode: 'local',
  supabase: Object.freeze({
    enabled: false,
    url: '',
    publishableKey: ''
  })
});
