(()=>{
'use strict';
const commons=(file,credit,license,source)=>Object.freeze({
 url:'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(file)+'?width=1280',
 alt:source,
 credit,license,
 source:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file).replaceAll('%2F','/')
});
const photos=Object.freeze({
 rio:commons('Rio_Piracicaba_2.jpg','José Luiz Ribeiro','CC BY-SA 4.0','Rio Piracicaba'),
 engenho:commons('Engenho_Central_-_Piracicaba.jpg','Leonardo Salvato','CC BY-SA 4.0','Engenho Central de Piracicaba'),
 porto:commons('Parque_da_Rua_do_Porto,_Piracicaba_-_SP,_Brazil_-_panoramio.jpg','Jose Roberto V. Mora','CC BY 3.0','Parque e região da Rua do Porto'),
 cidade:commons('Piracicaba_(2).jpg','Ana Paula Hirama','CC BY-SA 2.0','Vista urbana de Piracicaba'),
 atividade:commons('Pessoas_praticando_atividades_físicas_em_Piracicaba_SP.jpg','Marina Almeida','CC BY 2.0','Vida urbana e atividade física em Piracicaba'),
 tempestade:commons('Frente_de_rajada_em_Piracicaba_2.jpg','Erik dos Santos','CC0 1.0','Paisagem urbana de Piracicaba sob frente de rajada'),
 catedral:commons('Catedral_de_Piracicaba.jpg','Lepeduarte','CC BY-SA 4.0','Catedral em Piracicaba')
});
const agenda=Object.freeze([
 Object.freeze({
  id:'rock-vendas-2026',date:'2026-11-11',dateLabel:'11 e 12 NOV',time:'8h às 12h',title:'2º Rock Vendas',
  category:'Capacitação e negócios',place:'Instituto Pecege · Santa Rosa',
  summary:'Formação presencial com metodologia gamificada sobre perfis de clientes, comunicação, negociação e estratégias comerciais.',
  url:'https://parquetecnologico.piracicaba.sp.gov.br/events/2-rock-vendas-1',
  sourceLabel:'Agenda do Parque Tecnológico de Piracicaba',image:photos.atividade
 }),
 Object.freeze({
  id:'expo-rh-2026',date:'2026-11-11',dateLabel:'11 NOV',time:'Agenda do evento',title:'Expo Gestão & RH Piracicaba 2026',
  category:'Gestão, pessoas e conexões',place:'Instituto Pecege · Piracicaba',
  summary:'Encontro divulgado pela agenda colaborativa do ecossistema local para profissionais, líderes e empresas ampliarem conexões e trocarem experiências.',
  url:'https://parquetecnologico.piracicaba.sp.gov.br/agendacolaborativa',
  sourceLabel:'Agenda colaborativa do Parque Tecnológico',image:photos.cidade
 }),
 Object.freeze({
  id:'piracicaba-transformacao-2026',date:'2026-11-25',dateLabel:'25 NOV',time:'14h às 17h',title:'Piracicaba em Transformação',
  category:'Inovação e transformação digital',place:'ACIPI · Centro',
  summary:'O Conecta SP – Piracicaba reúne atores do ecossistema para discutir desafios dos negócios e soluções digitais para empresas da região.',
  url:'https://parquetecnologico.piracicaba.sp.gov.br/events/piracicaba-em-transformacao-anamid',
  sourceLabel:'Parque Tecnológico de Piracicaba',image:photos.engenho
 }),
 Object.freeze({
  id:'arena-nd-2026',date:'2026-11-26',dateLabel:'26 NOV',time:'13h30 às 17h30',title:'Arena ND 2026',
  category:'Tecnologia, marketing e empreendedorismo',place:'Instituto Pecege · Santa Rosa',
  summary:'Encontro sobre ideias, pessoas e experiências que estão transformando negócios, com conteúdo sobre tecnologia, marketing, estratégia e conexões.',
  url:'https://parquetecnologico.piracicaba.sp.gov.br/events/arena-nd-2026',
  sourceLabel:'Parque Tecnológico de Piracicaba',image:photos.rio
 }),
 Object.freeze({
  id:'feira-rua-porto',date:'recorrente',dateLabel:'FINS DE SEMANA',time:'10h às 17h',title:'Feira de Artesanato da Rua do Porto',
  category:'Cultura e economia criativa',place:'Rua do Porto',
  summary:'Feira tradicional com artesãos locais no calçadão da Rua do Porto, próxima ao Casarão do Turismo e à orla do Rio Piracicaba.',
  url:'https://turismopiracicaba.com.br/artesaos/feira-de-artesanato-da-rua-do-porto/',
  sourceLabel:'Secretaria Municipal de Turismo',image:photos.porto
 })
]);
const gallery=Object.freeze([
 Object.freeze({title:'Rio Piracicaba',subtitle:'Paisagem e identidade da cidade',image:photos.rio}),
 Object.freeze({title:'Engenho Central',subtitle:'Patrimônio histórico e espaço cultural',image:photos.engenho}),
 Object.freeze({title:'Rua do Porto',subtitle:'Turismo, gastronomia e memória ribeirinha',image:photos.porto}),
 Object.freeze({title:'Centro de Piracicaba',subtitle:'Arquitetura e vida urbana',image:photos.catedral})
]);
window.CidadeConectaCityNews=Object.freeze({
 updatedAt:'2026-11-06',
 updatedLabel:'Recorte verificado em 06/11/2026',
 agendaSource:'https://parquetecnologico.piracicaba.sp.gov.br/agendacolaborativa',
 tourismSource:'https://turismopiracicaba.com.br/',
 photos,agenda,gallery
});
})();