(()=>{
'use strict';
const licenses={
 'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
 'CC BY-SA 2.0':'https://creativecommons.org/licenses/by-sa/2.0/',
 'CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/',
 'CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/',
 'CC0 1.0':'https://creativecommons.org/publicdomain/zero/1.0/'
};
const commons=(key,file,credit,license,alt)=>Object.freeze({
 url:'assets/city-photos/'+key+'.webp',alt,credit,license,licenseUrl:licenses[license],
 source:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file)
});
const photos=Object.freeze({
 rio:commons('rio','Rio_Piracicaba_2.jpg','José Luiz Ribeiro','CC BY-SA 4.0','Rio Piracicaba'),
 engenho:commons('engenho','Engenho_Central_-_Piracicaba.jpg','Leonardo Salvato','CC BY-SA 4.0','Engenho Central de Piracicaba'),
 porto:commons('porto','Parque_da_Rua_do_Porto,_Piracicaba_-_SP,_Brazil_-_panoramio.jpg','Jose Roberto V. Mora…','CC BY 3.0','Parque e região da Rua do Porto'),
 cidade:commons('cidade','Piracicaba_(2).jpg','Ana Paula Hirama','CC BY-SA 2.0','Vista urbana de Piracicaba'),
 atividade:commons('atividade','Pessoas_praticando_atividades_físicas_em_Piracicaba_SP.jpg','Marina Almeida','CC BY 2.0','Vida urbana e atividade física em Piracicaba'),
 tempestade:commons('tempestade','Frente_de_rajada_em_Piracicaba_2.jpg','Erik dos Santos','CC0 1.0','Árvore caída após tempestade em Piracicaba')
});
const agenda=Object.freeze([
 Object.freeze({
  id:'rock-vendas-2026',date:'2026-11-11',dateLabel:'11 e 12 NOV',time:'8h às 12h',title:'2º Rock Vendas',
  category:'Capacitação e negócios',place:'Instituto Pecege · Santa Rosa',
  summary:'Formação presencial com metodologia gamificada sobre perfis de clientes, comunicação, negociação e estratégias comerciais.',
  url:'https://www.rockensina.com.br/mais/curso-presencial-vendas/',
  sourceLabel:'Rock Ensina',image:photos.atividade
 }),
 Object.freeze({
  id:'expo-rh-2026',date:'2026-11-11',dateLabel:'11 NOV',time:'8h às 18h',title:'Expo Gestão & RH Piracicaba 2026',
  category:'Gestão, pessoas e conexões',place:'Instituto Pecege · Piracicaba',
  summary:'Encontro divulgado pela agenda colaborativa do ecossistema local para profissionais, líderes e empresas ampliarem conexões e trocarem experiências.',
  url:'https://www.linka.la/event/6fb9bee3-e911-43f2-ad44-e529cf08aeac',
  sourceLabel:'Página do evento no Linka',image:photos.cidade
 }),
 Object.freeze({
  id:'piracicaba-transformacao-2026',date:'2026-11-25',dateLabel:'25 NOV',time:'14h às 17h',title:'Piracicaba em Transformação',
  category:'Inovação e transformação digital',place:'ACIPI · Centro',
  summary:'O Conecta SP – Piracicaba reúne atores do ecossistema para discutir desafios dos negócios e soluções digitais para empresas da região.',
  url:'https://conecta-sp.anamid.com.br/',
  sourceLabel:'AnaMid',image:photos.engenho
 }),
 Object.freeze({
  id:'arena-nd-2026',date:'2026-11-26',dateLabel:'26 NOV',time:'A partir das 13h30',title:'Arena ND 2026',
  category:'Tecnologia, marketing e empreendedorismo',place:'Instituto Pecege · Santa Rosa',
  summary:'Encontro sobre ideias, pessoas e experiências que estão transformando negócios, com conteúdo sobre tecnologia, marketing, estratégia e conexões.',
  url:'https://faculdade.pecege.com/blog/arena-nd-2026',
  sourceLabel:'Faculdade Pecege',image:photos.rio
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
 Object.freeze({title:'Vista de Piracicaba',subtitle:'Paisagem urbana',image:photos.cidade})
]);
window.CidadeConectaCityNews=Object.freeze({
 updatedAt:'2026-11-07',
 updatedLabel:'Links conferidos em 07/11/2026',
 agendaSource:'https://parquetecnologico.piracicaba.sp.gov.br/agendacolaborativa',
 tourismSource:'https://turismopiracicaba.com.br/',
 photos,agenda,gallery
});
})();