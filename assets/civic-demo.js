(()=>{
'use strict';
const DAY=86400000;
const base=Date.parse('2026-11-06T18:00:00-03:00');
const iso=(days,hours=0)=>new Date(base-days*DAY+hours*3600000).toISOString();
const PHOTO_LIBRARY=Object.freeze({
 rio:{file:'Rio_Piracicaba_2.jpg',url:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Rio_Piracicaba_2.jpg/1280px-Rio_Piracicaba_2.jpg',credit:'José Luiz Ribeiro',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:Rio_Piracicaba_2.jpg'},
 engenho:{file:'Engenho_Central_-_Piracicaba.jpg',url:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Engenho_Central_-_Piracicaba.jpg/1280px-Engenho_Central_-_Piracicaba.jpg',credit:'Leonardo Salvato',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:Engenho_Central_-_Piracicaba.jpg'},
 porto:{file:'Parque_da_Rua_do_Porto,_Piracicaba_-_SP,_Brazil_-_panoramio.jpg',url:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Parque_da_Rua_do_Porto%2C_Piracicaba_-_SP%2C_Brazil_-_panoramio.jpg/1280px-Parque_da_Rua_do_Porto%2C_Piracicaba_-_SP%2C_Brazil_-_panoramio.jpg',credit:'Jose Roberto V. Mora',license:'CC BY 3.0',source:'https://commons.wikimedia.org/wiki/File:Parque_da_Rua_do_Porto,_Piracicaba_-_SP,_Brazil_-_panoramio.jpg'},
 atividade:{file:'Pessoas_praticando_atividades_físicas_em_Piracicaba_SP.jpg',url:'https://upload.wikimedia.org/wikipedia/commons/4/40/Pessoas_praticando_atividades_f%C3%ADsicas_em_Piracicaba_SP.jpg',credit:'Marina Almeida',license:'CC BY 2.0',source:'https://commons.wikimedia.org/wiki/File:Pessoas_praticando_atividades_físicas_em_Piracicaba_SP.jpg'},
 cidade:{file:'Piracicaba_(2).jpg',url:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Piracicaba_%282%29.jpg/1280px-Piracicaba_%282%29.jpg',credit:'Ana Paula Hirama',license:'CC BY-SA 2.0',source:'https://commons.wikimedia.org/wiki/File:Piracicaba_(2).jpg'},
 tempestade:{file:'Frente_de_rajada_em_Piracicaba_2.jpg',url:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Frente_de_rajada_em_Piracicaba_2.jpg/1280px-Frente_de_rajada_em_Piracicaba_2.jpg',credit:'Erik dos Santos',license:'CC0 1.0',source:'https://commons.wikimedia.org/wiki/File:Frente_de_rajada_em_Piracicaba_2.jpg'},
 catedral:{file:'Catedral_de_Piracicaba.jpg',url:'https://upload.wikimedia.org/wikipedia/commons/e/e7/Catedral_de_Piracicaba.jpg',credit:'Lepeduarte',license:'CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:Catedral_de_Piracicaba.jpg'}
});
const PHOTO_BY_CATEGORY=Object.freeze({iluminacao:'catedral',vias:'cidade',residuos:'porto',agua:'rio',alagamentos:'tempestade',sinalizacao:'cidade',acessibilidade:'atividade',areas:'engenho',outros:'porto'});
const image=(name,alt)=>{const p=PHOTO_LIBRARY[PHOTO_BY_CATEGORY[name]||name]||PHOTO_LIBRARY.cidade;return{url:p.url,alt,demo:true,real:true,illustrative:true,credit:p.credit,license:p.license,source:p.source}};
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

const DEMO_AGENCIES=Object.freeze({vias:'Manutenção viária · DEMO',iluminacao:'Iluminação pública · DEMO',residuos:'Limpeza urbana · DEMO',agua:'Água e saneamento · DEMO',alagamentos:'Drenagem urbana · DEMO',sinalizacao:'Mobilidade e sinalização · DEMO',acessibilidade:'Acessibilidade urbana · DEMO',areas:'Áreas públicas · DEMO',outros:'Serviços urbanos · DEMO'});
const extraSeeds=[["Faixa de pedestres recebe manutenção demonstrativa","A sinalização horizontal aparece como em atendimento neste cenário fictício, usado para demonstrar atualização de mobilidade.","sinalizacao","Jardim Elite","Em andamento",6],["Vazamento em área pública é marcado como resolvido","Caso fictício de saneamento com histórico completo de recebimento, encaminhamento, execução e resolução.","agua","Água Branca","Resolvida",18,2],["Praça entra em vistoria de zeladoria","Ocorrência fictícia sobre conservação de área pública para ampliar o recorte territorial da demonstração.","areas","Parque da Rua do Porto","Em análise",4],["Iluminação de travessia é concluída","Exemplo fictício de atendimento concluído em área central para mostrar uma resolução recente.","iluminacao","Cidade Alta","Resolvida",14,1],["Boca de lobo recebe encaminhamento","Cenário fictício de drenagem urbana com encaminhamento registrado no histórico demonstrativo.","alagamentos","Paulicéia","Encaminhada",6],["Descarte irregular é registrado","Exemplo fictício recém-recebido para demonstrar entrada de nova ocorrência no painel.","residuos","Campestre","Recebida",1],["Placa de orientação é reposta","Resolução fictícia de sinalização para enriquecer a seção de resultados do jornal DEMO.","sinalizacao","Jardim Caxambu","Resolvida",20,3],["Trecho de asfalto entra em análise","Registro fictício de pavimento usado para mostrar análise inicial e filtros por bairro.","vias","Nova Piracicaba","Em análise",5],["Mobiliário urbano recebe manutenção","Exemplo fictício de serviço urbano geral em andamento para apresentação de histórico e setor de referência.","outros","Monte Alegre","Em andamento",7],["Rota acessível é liberada após ajuste","Caso fictício de acessibilidade concluído, com linha do tempo criada apenas para demonstração.","acessibilidade","São Judas","Resolvida",24,4],["Rede de água recebe reparo demonstrativo","Ocorrência fictícia em andamento para mostrar acompanhamento contínuo pelo cidadão.","agua","Algodoal","Em andamento",8],["Área verde tem serviço concluído","Resultado fictício de manutenção de área pública com atualização publicada no jornal de demonstração.","areas","Santa Rosa","Resolvida",16,2],["Poste com falha é encaminhado","Registro fictício de iluminação encaminhado para setor de referência demonstrativo.","iluminacao","Jaraguá","Encaminhada",5],["Ponto de resíduos entra em análise","Ocorrência fictícia de limpeza urbana usada para demonstrar triagem e priorização.","residuos","Bairro Verde","Em análise",3],["Reparo de pavimento é concluído","Caso fictício de via pública com resolução publicada e histórico completo para apresentação.","vias","Piracicamirim","Resolvida",27,7],["Sinalização vertical é registrada","Novo registro fictício de mobilidade, ainda na etapa de recebimento.","sinalizacao","Santa Cecília","Recebida",1],["Drenagem em via central é concluída","Resolução fictícia de alagamento usada apenas para demonstrar dados históricos no portal.","alagamentos","Centro","Resolvida",32,10],["Calçada recebe adequação demonstrativa","Ocorrência fictícia de acessibilidade em execução para demonstrar acompanhamento por status.","acessibilidade","Jardim Itapuã","Em andamento",7],["Parque recebe encaminhamento de zeladoria","Registro fictício de área pública encaminhado para manutenção demonstrativa.","areas","Taquaral","Encaminhada",5],["Equipamento urbano volta ao funcionamento","Caso fictício classificado como outros, resolvido e publicado somente no modo de apresentação.","outros","Vila Independência","Resolvida",19,3],["Iluminação de praça entra em atendimento","Ocorrência fictícia em andamento para demonstrar alertas e acompanhamento de bairro.","iluminacao","Nova América","Em andamento",6],["Demanda de abastecimento é recebida","Novo registro fictício de água e saneamento usado para demonstrar volume recente.","agua","Monte Líbano","Recebida",1],["Limpeza de área central é finalizada","Resolução fictícia de resíduos para demonstrar resultados, filtros e manchetes do jornal DEMO.","residuos","Centro","Resolvida",13,2],["Via de acesso é encaminhada para reparo","Ocorrência fictícia de pavimento encaminhada e acompanhada pelo perfil de demonstração.","vias","Castelinho","Encaminhada",4]];
const statusFlow=['Recebida','Em análise','Encaminhada','Em andamento','Resolvida'];
function makeExtra(seed,index){
 const [title,description,category,bairro,status,age,done=0.5]=seed,level=statusFlow.indexOf(status),last=status==='Resolvida'?done:Math.max(.2,age-Math.max(1,level*1.4)),span=Math.max(0,age-last);
 const history=statusFlow.slice(0,level+1).map((step,n)=>{const days=level===0?age:age-(span*n/level);return{status:step,date:iso(days),note:(step==='Recebida'?'Registro fictício recebido.':step==='Em análise'?'Triagem fictícia registrada.':step==='Encaminhada'?'Encaminhamento fictício ao setor de referência.':step==='Em andamento'?'Atendimento fictício iniciado.':'Resolução fictícia publicada para apresentação.')}});
 const protocol='DEMO-2026-'+String(index+13).padStart(5,'0'),lat=-22.725+((index%6)-2.5)*.006,lng=-47.650+((Math.floor(index/6)%5)-2)*.007,updated=history[history.length-1].date;
 return{protocol,title,description,category,bairro,status,agency:DEMO_AGENCIES[category],created:iso(age),updated,...(status==='Resolvida'?{resolved:updated}:{}),lat:Number(lat.toFixed(3)),lng:Number(lng.toFixed(3)),cloudOrigin:true,moderationStatus:'approved',public:true,demoImage:image(category,'Foto real de Piracicaba usada somente como ilustração de '+category+' na demonstração'),history};
}
rows.push(...extraSeeds.map(makeExtra));
const stories=[{"id":"demo-story-01","kicker":"Especial DEMO","title":"Uma semana de participação fictícia em diferentes regiões da cidade","summary":"A edição de apresentação reúne registros simulados em vias, iluminação, resíduos, drenagem, acessibilidade e áreas públicas.","photo":"cidade","href":"#/noticias?demo=1"},{"id":"demo-story-02","kicker":"Resultados DEMO","title":"Casos resolvidos mostram como o histórico aparece para o cidadão","summary":"Protocolos fictícios concluídos exibem etapas, datas, setor de referência e leitura editorial em um mesmo fluxo.","photo":"engenho","href":"#/noticias?demo=1&tipo=resolvidas"},{"id":"demo-story-03","kicker":"Bairros DEMO","title":"Centro, Vila Rezende e Piracicamirim ganham destaque no painel de apresentação","summary":"Os dados são totalmente fictícios e servem para demonstrar filtros, personalização e acompanhamento territorial.","photo":"rio","href":"#/perfil-demo"},{"id":"demo-story-04","kicker":"Acessibilidade DEMO","title":"Perfil acompanha melhorias fictícias de calçadas e rotas acessíveis","summary":"A conta de demonstração mostra favoritos, notificações, histórico e ocorrências salvas sem enviar nada ao backend real.","photo":"atividade","href":"#/minhas"},{"id":"demo-story-05","kicker":"Clima urbano DEMO","title":"Cenários de drenagem ajudam a apresentar o acompanhamento por status","summary":"Fotos reais de Piracicaba aparecem somente como ilustração e nunca como prova das ocorrências fictícias exibidas.","photo":"tempestade","href":"#/noticias?demo=1&tipo=atualizacoes"},{"id":"demo-story-06","kicker":"Cidade DEMO","title":"Jornal cívico combina notícias simuladas, imagens ilustrativas e transparência","summary":"A apresentação diferencia explicitamente conteúdo fictício, dados públicos reais e fotografias usadas apenas como ambientação visual.","photo":"porto","href":"#/noticias?demo=1"},{"id":"demo-story-07","kicker":"Patrimônio DEMO","title":"Identidade de Piracicaba reforça a apresentação sem imitar portal oficial","summary":"Elementos locais e fotografias licenciadas ajudam a contextualizar a experiência mantendo o aviso de projeto acadêmico independente.","photo":"catedral","href":"#/demonstracao"},{"id":"demo-story-08","kicker":"Meu Cidade DEMO","title":"Conta fictícia reúne ocorrências criadas, salvas e acompanhadas em uma única visão","summary":"O roteiro de apresentação permite mostrar uma jornada completa, do registro à resolução, sem usar dados pessoais verdadeiros.","photo":"engenho","href":"#/conta"}].map(s=>({...s,photo:image(s.photo,'Fotografia real de Piracicaba usada apenas como ilustração editorial no modo DEMO')}));

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
 ],
 activity:[
  {date:iso(0,1),type:'Resumo',title:'Resumo semanal gerado',detail:'8 atualizações fictícias organizadas para o perfil.'},
  {date:iso(0,3),type:'Bairro',title:'Centro recebeu nova atualização',detail:'Trecho de calçada entrou em análise.'},
  {date:iso(0,4),type:'Acompanhamento',title:'Sinalização segue em atendimento',detail:'O protocolo DEMO-2026-00012 recebeu nova movimentação.'},
  {date:iso(1),type:'Resolução',title:'Iluminação marcada como resolvida',detail:'A ocorrência da Vila Rezende foi concluída na demonstração.'},
  {date:iso(2),type:'Resolução',title:'Reparo viário concluído',detail:'A ocorrência fictícia do Centro foi resolvida.'}
 ],
 recommendations:[
  {title:'Revisar ocorrências ainda abertas',detail:'Há registros fictícios em análise, encaminhados e em andamento.',href:'#/minhas?tab=acompanhando',action:'Ver acompanhamentos'},
  {title:'Acompanhar o Centro',detail:'Seu bairro favorito tem atualizações recentes na demonstração.',href:'#/noticias?demo=1&bairro=Centro',action:'Abrir notícias'},
  {title:'Conhecer os resultados',detail:'Veja os casos resolvidos e como aparecem no jornal cívico.',href:'#/noticias?demo=1&tipo=resolvidas',action:'Ver resolvidos'}
 ]
};

profile.bio='Perfil totalmente fictício criado para apresentar uma experiência completa do Cidade Conecta, com ocorrências, bairros favoritos, notícias, notificações, itens salvos, histórico e resultados. Nenhuma informação deste perfil representa uma pessoa real.';
profile.neighborhoods=['Centro','Vila Rezende','Paulista','Piracicamirim','Nova América','São Dimas','Santa Terezinha','Água Branca'];
profile.following=18;profile.reports=14;profile.resolved=12;
profile.badges=['Conta DEMO','36 ocorrências fictícias','8 bairros acompanhados','Apresentação do produto','Dados não reais'];
account.follows=['DEMO-2026-00001','DEMO-2026-00002','DEMO-2026-00003','DEMO-2026-00004','DEMO-2026-00005','DEMO-2026-00008','DEMO-2026-00012','DEMO-2026-00013','DEMO-2026-00014','DEMO-2026-00016','DEMO-2026-00018','DEMO-2026-00021','DEMO-2026-00022','DEMO-2026-00024','DEMO-2026-00029','DEMO-2026-00030','DEMO-2026-00033','DEMO-2026-00036'];
account.neighborhoods=[...profile.neighborhoods];
account.created=['DEMO-2026-00001','DEMO-2026-00003','DEMO-2026-00005','DEMO-2026-00008','DEMO-2026-00010','DEMO-2026-00013','DEMO-2026-00016','DEMO-2026-00017','DEMO-2026-00021','DEMO-2026-00023','DEMO-2026-00026','DEMO-2026-00030','DEMO-2026-00033','DEMO-2026-00036'];
account.saved=['DEMO-2026-00002','DEMO-2026-00004','DEMO-2026-00007','DEMO-2026-00011','DEMO-2026-00014','DEMO-2026-00019','DEMO-2026-00022','DEMO-2026-00024','DEMO-2026-00027','DEMO-2026-00029','DEMO-2026-00032','DEMO-2026-00035'];
account.notifications.push(
 {id:'demo-notice-09',type:'occurrence_resolved',protocol:'DEMO-2026-00014',neighborhood_label:'Água Branca',title:'Problema resolvido',body:'Vazamento fictício em área pública foi marcado como resolvido.',created_at:iso(.3),read_at:null},
 {id:'demo-notice-10',type:'occurrence_update',protocol:'DEMO-2026-00013',neighborhood_label:'Jardim Elite',title:'Atendimento atualizado',body:'Faixa de pedestres fictícia segue em manutenção.',created_at:iso(.45),read_at:null},
 {id:'demo-notice-11',type:'neighborhood_update',protocol:'DEMO-2026-00016',neighborhood_label:'Cidade Alta',title:'Resultado no bairro',body:'Iluminação fictícia de travessia foi concluída.',created_at:iso(.6),read_at:null},
 {id:'demo-notice-12',type:'occurrence_update',protocol:'DEMO-2026-00018',neighborhood_label:'Paulicéia',title:'Ocorrência encaminhada',body:'Demanda fictícia de drenagem foi encaminhada.',created_at:iso(.8),read_at:null},
 {id:'demo-notice-13',type:'occurrence_resolved',protocol:'DEMO-2026-00024',neighborhood_label:'Santa Rosa',title:'Área pública resolvida',body:'Serviço fictício de manutenção de área verde foi concluído.',created_at:iso(1.1),read_at:null},
 {id:'demo-notice-14',type:'occurrence_update',protocol:'DEMO-2026-00030',neighborhood_label:'Jardim Itapuã',title:'Acessibilidade em andamento',body:'Adequação fictícia de calçada entrou em execução.',created_at:iso(1.3),read_at:null},
 {id:'demo-notice-15',type:'occurrence_resolved',protocol:'DEMO-2026-00035',neighborhood_label:'Centro',title:'Limpeza concluída',body:'Ocorrência fictícia de resíduos foi finalizada.',created_at:iso(1.5),read_at:iso(.4)},
 {id:'demo-notice-16',type:'system',protocol:null,neighborhood_label:null,title:'Jornal DEMO atualizado',body:'Há novas manchetes, fotografias reais ilustrativas e resultados fictícios para a apresentação.',created_at:iso(.15),read_at:null}
);
account.weekly={period:'Últimos 7 dias',updates:24,resolved:8,newInNeighborhoods:11,followedActive:12,headline:'Sua semana fictícia teve 24 atualizações e 8 resoluções.',message:'Centro, Vila Rezende, Piracicamirim e Nova América concentram os destaques desta edição de demonstração.'};
account.milestones=[
 {label:'14 registros fictícios criados',detail:'Exemplos distribuídos entre nove categorias do Cidade Conecta.'},
 {label:'18 ocorrências acompanhadas',detail:'A conta DEMO simula acompanhamento ativo, notificações e resultados.'},
 {label:'8 bairros favoritos',detail:'Preferências fictícias distribuídas por diferentes regiões administrativas.'},
 {label:'12 itens salvos',detail:'Protocolos fictícios guardados para consultas durante a apresentação.'},
 {label:'Jornal DEMO completo',detail:'Notícias simuladas com fotografias reais licenciadas e claramente identificadas como ilustrativas.'}
];
account.activity=[
 {date:iso(.1),type:'Jornal',title:'Nova edição DEMO disponível',detail:'Fotografias reais ilustrativas e novas matérias fictícias foram adicionadas.'},
 {date:iso(.3),type:'Resolução',title:'Vazamento demonstrativo resolvido',detail:'O protocolo DEMO-2026-00014 chegou ao status Resolvida.'},
 {date:iso(.45),type:'Acompanhamento',title:'Sinalização recebeu atualização',detail:'O protocolo DEMO-2026-00013 segue em atendimento fictício.'},
 {date:iso(.6),type:'Bairro',title:'Cidade Alta recebeu resultado',detail:'Uma ocorrência fictícia de iluminação foi concluída.'},
 {date:iso(.8),type:'Encaminhamento',title:'Drenagem encaminhada',detail:'O protocolo DEMO-2026-00018 avançou no fluxo fictício.'},
 {date:iso(1.1),type:'Resolução',title:'Área verde concluída',detail:'O perfil recebeu uma nova resolução fictícia em Santa Rosa.'},
 {date:iso(1.3),type:'Acessibilidade',title:'Calçada entrou em execução',detail:'A adequação fictícia no Jardim Itapuã mudou para Em andamento.'},
 {date:iso(2),type:'Resumo',title:'Resumo semanal atualizado',detail:'A conta reuniu 24 movimentações fictícias em uma única visão.'}
];
account.recommendations=[
 {title:'Apresentar as ocorrências criadas',detail:'Mostre 14 registros fictícios com diferentes categorias e status.',href:'#/minhas?tab=criados',action:'Abrir ocorrências'},
 {title:'Mostrar o jornal com fotos reais',detail:'As fotos são licenciadas e identificadas como ilustração; as notícias continuam fictícias.',href:'#/noticias?demo=1',action:'Abrir jornal'},
 {title:'Explorar os acompanhamentos',detail:'Há 18 protocolos seguidos e várias notificações prontas para demonstrar.',href:'#/minhas?tab=acompanhando',action:'Ver acompanhamentos'},
 {title:'Mostrar os bairros favoritos',detail:'O perfil acompanha oito bairros ficticiamente, sem usar localização real.',href:'#/minhas?tab=bairros',action:'Abrir bairros'}
];

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
function metrics(input=rows,now=Date.now()){
 const D=window.CidadeConectaData;
 const calendar=new Intl.DateTimeFormat('sv-SE',{dateStyle:'short',timeZone:'America/Sao_Paulo'});
 const today=calendar.format(now);
 const resolved=input.filter(o=>o.status==='Resolvida').length;
 return {
  resolved,open:input.length-resolved,
  today:input.filter(o=>D.time(o.created)!==null&&D.time(o.created)<=now&&calendar.format(new Date(o.created))===today).length,
  categories:D.rank(input,'category'),bairros:D.rank(input,'bairro')
 };
}
window.CidadeConectaDemo=Object.freeze({profile,account,rows,stories,photos:PHOTO_LIBRARY,feed,filter,metrics});
})();