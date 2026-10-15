(()=>{
'use strict';
const regions=[
 {id:1,name:'Região 1',population:61859,area:10.68,density:5792.04,bairros:['Centro','Cidade Alta','Cidade Jardim','Clube de Campo','Higienópolis','Jardim Elite','Nova América','Parque da Rua do Porto','São Dimas','São Judas','Vila Independência','Vila Monteiro']},
 {id:2,name:'Região 2',population:36982,area:37.99,density:973.47,bairros:['Água Santa','Algodoal','Areão','Capim Fino','Jardim Monumento','Nhô Quim','Nova Piracicaba','Guamium','Santa Rosa','Vila Rezende']},
 {id:3,name:'Região 3',population:28526,area:16.38,density:1741.51,bairros:['Corumbataí','Jardim Primavera','Mário Dedini','Guamium','Vila Fátima','Vila Industrial']},
 {id:4,name:'Região 4',population:60002,area:27.94,density:2147.53,bairros:['Itaperu','Parque Residencial Piracicaba (Balbo)','Santa Terezinha','Vale do Sol','Vila Sônia']},
 {id:5,name:'Região 5',population:30290,area:17.18,density:1763.10,bairros:['Castelinho','Glebas Califórnia','Jupiá','Morato','Ondas','Ondinhas','Paulista']},
 {id:6,name:'Região 6',population:46321,area:5.83,density:7945.28,bairros:['Bairro Verde','Jaraguá','Jardim Itapuã','Monte Líbano','Paulicéia','Vila Cristina']},
 {id:7,name:'Região 7',population:38043,area:28.57,density:1331.57,bairros:['Água das Pedras','Campestre','Dona Antônia','Jardim Planalto','Novo Horizonte','Santa Helena','São Jorge']},
 {id:8,name:'Região 8',population:58099,area:32.85,density:1768.61,bairros:['Água Branca','CECAP','Chicó','Jardim Califórnia','Jardim Caxambu','Pompéia','Taquaral']},
 {id:9,name:'Região 9',population:42210,area:54.01,density:781.52,bairros:['Agronomia','Cidade Judiciária','Conceição','Dois Córregos','Jardim Abaeté','Jardim São Francisco','Monte Alegre','Morumbi','Piracicamirim','Santa Cecília','Santa Rita','Unileste']}
];
const aliases={
 'monumento':'Jardim Monumento','verde':'Bairro Verde','pq resid piracicaba':'Parque Residencial Piracicaba (Balbo)',
 'parque residencial piracicaba':'Parque Residencial Piracicaba (Balbo)','balbo':'Parque Residencial Piracicaba (Balbo)',
 'jardim abate':'Jardim Abaeté','jd abaete':'Jardim Abaeté','cecap':'CECAP','pompeia':'Pompéia','guamium':'Guamium','guamiun':'Guamium'
};
const districts=['Piracicaba (sede)','Santa Terezinha','Guamium','Ártemis','Tupi','Ibitiruna'];
const ruralNuclei=['Anhumas','Ártemis','Ibitiruna','Tanquinho','Tupi','Santa Olímpia','Santana','Brisa da Serra','Canaã','Nova Suíça','Terra Nova','Vila Belém','Nuinorte','Santa Isabel'];
const regionalNeighbors=['Anhembi','Santa Maria da Serra','São Pedro','Charqueada','Ipeúna','Rio Claro','Santa Gertrudes','Cordeirópolis','Limeira','Iracemápolis','Santa Bárbara d’Oeste','Rio das Pedras','Saltinho','Tietê','Laranjal Paulista','Mombuca','Capivari','Rafard','Águas de São Pedro','Brotas','Torrinha','Conchas','Bofete'];
const services={
 vias:{label:'Vias públicas',agency:'Secretaria Municipal de Obras, Infraestrutura e Serviços Públicos',note:'Conservação, pavimentação, recapeamento, manutenção viária e zeladoria.'},
 iluminacao:{label:'Iluminação',agency:'Secretaria Municipal de Obras, Infraestrutura e Serviços Públicos',note:'Manutenção e ampliação da iluminação pública municipal.'},
 residuos:{label:'Resíduos',agency:'Secretaria Municipal de Obras, Infraestrutura e Serviços Públicos',note:'Coleta e serviços urbanos; o encaminhamento real depende do tipo de resíduo.'},
 agua:{label:'Água/Saneamento',agency:'SEMAE Piracicaba',note:'Água, esgoto e ocorrências ligadas aos serviços de saneamento.'},
 alagamentos:{label:'Alagamentos',agency:'Obras / Defesa Civil',note:'Drenagem urbana pode envolver Obras; em risco imediato, a referência é a Defesa Civil e canais de emergência.'},
 sinalizacao:{label:'Sinalização',agency:'Secretaria Municipal de Segurança Pública, Trânsito e Transportes',note:'Sinalização viária, engenharia de tráfego e trânsito.'},
 acessibilidade:{label:'Acessibilidade',agency:'Meio Ambiente / Trânsito e Transportes',note:'Fiscalização de calçadas pode envolver Meio Ambiente; travessias e sinalização podem envolver Trânsito e Transportes.'},
 areas:{label:'Áreas públicas',agency:'Secretaria Municipal de Obras, Infraestrutura e Serviços Públicos',note:'Parques, praças, jardins, áreas verdes e logradouros públicos.'},
 outros:{label:'Outros',agency:'Atendimento 156',note:'Use a triagem do 156 para direcionamento ao órgão responsável.'}
};
const facts={
 municipality:'Piracicaba',state:'São Paulo',stateCode:'SP',ibgeCode:'3538709',center:[-22.7253,-47.6492],
 areaKm2:1377.173,censusPopulation:423323,censusYear:2022,estimatedPopulation:440835,estimateYear:2025,
 density2022:307.19,urbanization2022:98.03,administrativeRegions:9,urbanNeighborhoods:71
};
const sources={
 prefeitura:'https://piracicaba.sp.gov.br/',
 atendimento156:'https://sempapel.pmp.sp.gov.br/156/',
 geoportal:'https://geo.piracicaba.sp.gov.br/',
 municipalMaps:'https://piracicaba.sp.gov.br/servicos/mapas-do-municipio/',
 adminRegionsMap:'https://piracicaba.sp.gov.br/wp-content/uploads/2024/12/MAPA-DAS-REGIOES-ADMINISTRATIVAS-FINAL.pdf',
 planDirector:'https://piracicaba.sp.gov.br/wp-content/uploads/2023/07/Cartilha-PLANO-DIRETOR-PIRACICABA-LC-405-19.pdf',
 ibge:'https://www.ibge.gov.br/cidades-e-estados/sp/piracicaba.html'
};
function norm(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function canonicalBairro(value){const n=norm(value);if(aliases[n])return aliases[n];for(const r of regions){const hit=r.bairros.find(b=>norm(b)===n);if(hit)return hit}return value.trim()}
function regionsForBairro(value){const b=canonicalBairro(value);const n=norm(b);return regions.filter(r=>r.bairros.some(x=>norm(x)===n))}
function regionLabel(value){const rs=regionsForBairro(value);return rs.length?rs.map(r=>r.name).join(' / '):'Região não identificada'}
function allBairros(){const out=[];for(const r of regions)for(const b of r.bairros)if(!out.some(x=>norm(x)===norm(b)))out.push(b);return out.sort((a,b)=>a.localeCompare(b,'pt-BR'))}
window.PIRACICABA_DATA={facts,regions,districts,ruralNuclei,regionalNeighbors,services,sources,canonicalBairro,regionsForBairro,regionLabel,allBairros,norm};
})();
