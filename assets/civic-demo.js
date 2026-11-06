(()=>{
'use strict';
const DAY=86400000;
const base=Date.parse('2026-11-05T18:00:00-03:00');
const iso=(days,hours=0)=>new Date(base-days*DAY+hours*3600000).toISOString();
const image=(name,alt)=>({url:'assets/demo-news/'+name+'.svg',alt,demo:true});
const rows=[
 {protocol:'DEMO-2026-00001',title:'Iluminação restaurada em praça de bairro',description:'Demonstração editorial: postes foram marcados como atendidos após uma sequência fictícia de atualizações.',category:'iluminacao',bairro:'Vila Rezende',status:'Resolvida',agency:'Iluminação pública · DEMO',created:iso(9),updated:iso(1),resolved:iso(1),lat:-22.708,lng:-47.645,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('iluminacao','Ilustração fictícia de iluminação urbana para demonstração'),history:[{status:'Recebida',date:iso(9),note:'Registro fictício recebido.'},{status:'Em análise',date:iso(8),note:'Triagem fictícia concluída.'},{status:'Encaminhada',date:iso(7),note:'Encaminhamento fictício.'},{status:'Em andamento',date:iso(4),note:'Atendimento fictício iniciado.'},{status:'Resolvida',date:iso(1),note:'Resolução fictícia publicada para demonstração.'}]},
 {protocol:'DEMO-2026-00002',title:'Buraco em via recebe reparo demonstrativo',description:'Caso fictício criado para demonstrar uma notícia de problema resolvido com linha do tempo completa.',category:'vias',bairro:'Centro',status:'Resolvida',agency:'Manutenção viária · DEMO',created:iso(12),updated:iso(2),resolved:iso(2),lat:-22.725,lng:-47.649,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('vias','Ilustração fictícia de manutenção viária para demonstração'),history:[{status:'Recebida',date:iso(12),note:'Registro fictício criado.'},{status:'Em análise',date:iso(11),note:'Análise fictícia.'},{status:'Encaminhada',date:iso(10),note:'Encaminhamento fictício.'},{status:'Em andamento',date:iso(6),note:'Reparo fictício iniciado.'},{status:'Resolvida',date:iso(2),note:'Reparo fictício concluído.'}]},
 {protocol:'DEMO-2026-00003',title:'Coleta de resíduos entra em atendimento',description:'Ocorrência fictícia para mostrar atualização de serviço urbano no jornal.',category:'residuos',bairro:'Santa Terezinha',status:'Em andamento',agency:'Limpeza urbana · DEMO',created:iso(5),updated:iso(1,2),lat:-22.673,lng:-47.664,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('residuos','Ilustração fictícia de limpeza urbana para demonstração'),history:[{status:'Recebida',date:iso(5),note:'Registro fictício.'},{status:'Em análise',date:iso(4),note:'Triagem fictícia.'},{status:'Encaminhada',date:iso(3),note:'Encaminhamento fictício.'},{status:'Em andamento',date:iso(1,2),note:'Atendimento fictício em curso.'}]},
 {protocol:'DEMO-2026-00004',title:'Sinalização de travessia é atualizada',description:'Notícia fictícia de mobilidade criada para demonstrar variedade editorial.',category:'sinalizacao',bairro:'Paulista',status:'Resolvida',agency:'Trânsito · DEMO',created:iso(15),updated:iso(3),resolved:iso(3),lat:-22.733,lng:-47.637,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('sinalizacao','Ilustração fictícia de sinalização urbana para demonstração'),history:[{status:'Recebida',date:iso(15),note:'Registro fictício.'},{status:'Encaminhada',date:iso(12),note:'Encaminhamento fictício.'},{status:'Em andamento',date:iso(7),note:'Atualização fictícia iniciada.'},{status:'Resolvida',date:iso(3),note:'Sinalização fictícia concluída.'}]},
 {protocol:'DEMO-2026-00005',title:'Ponto de alagamento recebe vistoria',description:'Caso fictício sobre drenagem urbana para demonstrar cobertura temática do portal.',category:'alagamentos',bairro:'Piracicamirim',status:'Em análise',agency:'Drenagem urbana · DEMO',created:iso(2),updated:iso(1),lat:-22.752,lng:-47.614,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('alagamentos','Ilustração fictícia de drenagem urbana para demonstração'),history:[{status:'Recebida',date:iso(2),note:'Registro fictício.'},{status:'Em análise',date:iso(1),note:'Vistoria fictícia em análise.'}]},
 {protocol:'DEMO-2026-00006',title:'Rampa de acesso é incluída em manutenção',description:'Exemplo fictício de pauta de acessibilidade urbana.',category:'acessibilidade',bairro:'Nova América',status:'Encaminhada',agency:'Acessibilidade urbana · DEMO',created:iso(3),updated:iso(1,4),lat:-22.754,lng:-47.633,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('acessibilidade','Ilustração fictícia de acessibilidade urbana para demonstração'),history:[{status:'Recebida',date:iso(3),note:'Registro fictício.'},{status:'Em análise',date:iso(2),note:'Triagem fictícia.'},{status:'Encaminhada',date:iso(1,4),note:'Encaminhamento fictício.'}]},
 {protocol:'DEMO-2026-00007',title:'Área verde recebe ação de manutenção',description:'Notícia fictícia de zeladoria para enriquecer a apresentação do jornal.',category:'areas',bairro:'São Dimas',status:'Resolvida',agency:'Áreas públicas · DEMO',created:iso(18),updated:iso(4),resolved:iso(4),lat:-22.718,lng:-47.630,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('areas','Ilustração fictícia de manutenção de área verde para demonstração'),history:[{status:'Recebida',date:iso(18),note:'Registro fictício.'},{status:'Em andamento',date:iso(10),note:'Serviço fictício iniciado.'},{status:'Resolvida',date:iso(4),note:'Serviço fictício concluído.'}]},
 {protocol:'DEMO-2026-00008',title:'Vazamento é encaminhado para avaliação',description:'Exemplo fictício de pauta de água e saneamento.',category:'agua',bairro:'Jardim Monumento',status:'Encaminhada',agency:'Água e saneamento · DEMO',created:iso(1,1),updated:iso(0,2),lat:-22.713,lng:-47.671,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('agua','Ilustração fictícia de água e saneamento para demonstração'),history:[{status:'Recebida',date:iso(1,1),note:'Registro fictício.'},{status:'Em análise',date:iso(0,1),note:'Análise fictícia.'},{status:'Encaminhada',date:iso(0,2),note:'Encaminhamento fictício.'}]},
 {protocol:'DEMO-2026-00009',title:'Nova demanda de iluminação é registrada',description:'Exemplo fictício de notícia de entrada recente.',category:'iluminacao',bairro:'Cecap',status:'Recebida',agency:'Iluminação pública · DEMO',created:iso(0,0),updated:iso(0,0),lat:-22.744,lng:-47.598,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('iluminacao','Ilustração fictícia de iluminação urbana para demonstração'),history:[{status:'Recebida',date:iso(0,0),note:'Registro fictício recém-criado.'}]},
 {protocol:'DEMO-2026-00010',title:'Trecho de calçada entra em análise',description:'Exemplo fictício adicional para demonstrar densidade editorial e filtros.',category:'acessibilidade',bairro:'Centro',status:'Em análise',agency:'Acessibilidade urbana · DEMO',created:iso(1,3),updated:iso(0,3),lat:-22.724,lng:-47.648,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('acessibilidade','Ilustração fictícia de calçada acessível para demonstração'),history:[{status:'Recebida',date:iso(1,3),note:'Registro fictício.'},{status:'Em análise',date:iso(0,3),note:'Análise fictícia em andamento.'}]},
 {protocol:'DEMO-2026-00011',title:'Limpeza de ponto de descarte é concluída',description:'Resolução fictícia para alimentar a seção de resultados do jornal.',category:'residuos',bairro:'Vila Sônia',status:'Resolvida',agency:'Limpeza urbana · DEMO',created:iso(20),updated:iso(5),resolved:iso(5),lat:-22.682,lng:-47.686,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('residuos','Ilustração fictícia de limpeza urbana para demonstração'),history:[{status:'Recebida',date:iso(20),note:'Registro fictício.'},{status:'Em andamento',date:iso(12),note:'Atendimento fictício.'},{status:'Resolvida',date:iso(5),note:'Limpeza fictícia concluída.'}]},
 {protocol:'DEMO-2026-00012',title:'Reparo de sinalização segue em andamento',description:'Exemplo fictício de atualização ainda aberta.',category:'sinalizacao',bairro:'Morumbi',status:'Em andamento',agency:'Trânsito · DEMO',created:iso(6),updated:iso(0,4),lat:-22.741,lng:-47.624,cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image('sinalizacao','Ilustração fictícia de sinalização viária para demonstração'),history:[{status:'Recebida',date:iso(6),note:'Registro fictício.'},{status:'Encaminhada',date:iso(4),note:'Encaminhamento fictício.'},{status:'Em andamento',date:iso(0,4),note:'Manutenção fictícia em andamento.'}]}
];
const profile={
 id:'demo-gabriel-cidade',name:'Gabriel Demo',handle:'@gabriel.demo',initials:'GD',role:'Morador fictício · Conta de demonstração',
 bio:'Perfil totalmente fictício criado para apresentar a experiência completa do Cidade Conecta: acompanhamento, bairros favoritos, notificações, histórico e jornal.',
 neighborhoods:['Centro','Vila Rezende','Paulista','Piracicamirim'],since:'2026',following:7,reports:5,resolved:4,
 badges:['Conta DEMO','Participação fictícia','Dados não reais','Apresentação do produto']
};
const account={
 credentials:{email:'gabriel.demo@cidadeconecta.local',password:'CidadeConecta2026!'},
 profile:{id:'demo-gabriel-cidade',name:'Gabriel Demo',role:'citizen',created_at:iso(62)},
 preferences:{display_name:'Gabriel Demo',sync_enabled:false,notify_occurrences:true,notify_neighborhoods:true,digest_frequency:'weekly',updated_at:iso(0,1)},
 follows:['DEMO-2026-00001','DEMO-2026-00002','DEMO-2026-00003','DEMO-2026-00004','DEMO-2026-00005','DEMO-2026-00008','DEMO-2026-00012'],
 neighborhoods:['Centro','Vila Rezende','Paulista','Piracicamirim'],
 created:['DEMO-2026-00001','DEMO-2026-00003','DEMO-2026-00005','DEMO-2026-00008','DEMO-2026-00010'],
 saved:['DEMO-2026-00002','DEMO-2026-00004','DEMO-2026-00007','DEMO-2026-00011'],
 recent:[
  {kind:'protocol',value:'DEMO-2026-00012',at:Date.parse(iso(0,2))},
  {kind:'bairro',value:'Centro',at:Date.parse(iso(0,4))},
  {kind:'protocol',value:'DEMO-2026-00001',at:Date.parse(iso(1,1))},
  {kind:'bairro',value:'Vila Rezende',at:Date.parse(iso(1,3))}
 ],
 notifications:[
  {id:'demo-notice-01',type:'occurrence_update',protocol:'DEMO-2026-00012',neighborhood_label:'Morumbi',title:'Ocorrência atualizada',body:'Reparo de sinalização segue em andamento · nova atualização fictícia publicada.',created_at:iso(0,4),read_at:null},
  {id:'demo-notice-02',type:'neighborhood_update',protocol:'DEMO-2026-00010',neighborhood_label:'Centro',title:'Atualização no bairro',body:'Trecho de calçada entrou em análise no Centro.',created_at:iso(0,3),read_at:null},
  {id:'demo-notice-03',type:'occurrence_update',protocol:'DEMO-2026-00008',neighborhood_label:'Jardim Monumento',title:'Ocorrência encaminhada',body:'Vazamento fictício foi encaminhado para avaliação.',created_at:iso(0,2),read_at:null},
  {id:'demo-notice-04',type:'occurrence_resolved',protocol:'DEMO-2026-00001',neighborhood_label:'Vila Rezende',title:'Problema resolvido',body:'Iluminação restaurada em praça de bairro.',created_at:iso(1),read_at:iso(0,5)},
  {id:'demo-notice-05',type:'occurrence_resolved',protocol:'DEMO-2026-00002',neighborhood_label:'Centro',title:'Problema resolvido',body:'Reparo demonstrativo em via foi concluído.',created_at:iso(2),read_at:iso(1,2)},
  {id:'demo-notice-06',type:'neighborhood_update',protocol:'DEMO-2026-00004',neighborhood_label:'Paulista',title:'Resultado no bairro',body:'Sinalização fictícia de travessia foi atualizada.',created_at:iso(3),read_at:iso(2,3)},
  {id:'demo-notice-07',type:'occurrence_update',protocol:'DEMO-2026-00003',neighborhood_label:'Santa Terezinha',title:'Atendimento iniciado',body:'Coleta de resíduos fictícia entrou em atendimento.',created_at:iso(1,2),read_at:iso(0,6)},
  {id:'demo-notice-08',type:'system',protocol:null,neighborhood_label:null,title:'Resumo semanal disponível',body:'Seu resumo DEMO reúne bairros acompanhados, resoluções e atualizações recentes.',created_at:iso(0,1),read_at:null}
 ],
 weekly:{
  period:'Últimos 7 dias',updates:8,resolved:3,newInNeighborhoods:4,followedActive:4,
  headline:'Sua semana fictícia teve 8 atualizações e 3 resoluções.',
  message:'Centro e Vila Rezende concentraram as principais movimentações do perfil DEMO nesta edição.'
 },
 milestones:[
  {label:'5 registros fictícios criados',detail:'Exemplos em iluminação, resíduos, drenagem, água e acessibilidade.'},
  {label:'4 bairros acompanhados',detail:'Centro, Vila Rezende, Paulista e Piracicamirim.'},
  {label:'4 resoluções acompanhadas',detail:'Históricos completos disponíveis no jornal DEMO.'}
 ]
};
function feed(input=rows,limit=60){
 const items=[];
 for(const o of input){
  items.push({id:o.protocol+':created',protocol:o.protocol,title:o.title,bairro:o.bairro,category:o.category,status:'Recebida',date:o.created,type:'created',media:o.demoImage});
  for(const h of o.history||[]){if(h.status==='Recebida'&&h.date===o.created)continue;items.push({id:o.protocol+':'+h.status+':'+h.date,protocol:o.protocol,title:o.title,bairro:o.bairro,category:o.category,status:h.status,date:h.date,type:h.status==='Resolvida'?'resolved':'updated',media:o.demoImage})}
 }
 return items.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,limit);
}
function filter(params){
 const q=params instanceof URLSearchParams?params:new URLSearchParams(params||'');
 return rows.filter(o=>(!q.get('category')||o.category===q.get('category'))&&(!q.get('bairro')||o.bairro===q.get('bairro'))&&(!q.get('status')||o.status===q.get('status')));
}
window.CidadeConectaDemo=Object.freeze({profile,account,rows,feed,filter});
})();