-- Cidade Conecta — seed controlado de Piracicaba
-- Fonte: data/piracicaba.json da mesma branch.

insert into public.municipalities (ibge_code,name,state_name,state_code,center_latitude,center_longitude,area_km2,population_estimate,population_reference_year)
values ('3538709','Piracicaba','São Paulo','SP',-22.7253,-47.6492,1377.173,440835,2025)
on conflict (ibge_code) do update set name=excluded.name,state_name=excluded.state_name,state_code=excluded.state_code,center_latitude=excluded.center_latitude,center_longitude=excluded.center_longitude,area_km2=excluded.area_km2,population_estimate=excluded.population_estimate,population_reference_year=excluded.population_reference_year,updated_at=now();

insert into public.territorial_sources (municipality_id,name,source_url,source_type,reference_date,machine_readable,notes)
select m.id,'IBGE Cidades — Piracicaba','https://www.ibge.gov.br/cidades-e-estados/sp/piracicaba.html','statistics',null,false,'Seed de recuperação a partir da base versionada do projeto.' from public.municipalities m where m.ibge_code='3538709' and not exists (select 1 from public.territorial_sources ts where ts.municipality_id=m.id and ts.name='IBGE Cidades — Piracicaba');
insert into public.territorial_sources (municipality_id,name,source_url,source_type,reference_date,machine_readable,notes)
select m.id,'IBGE — API de Malhas Geográficas','https://servicodados.ibge.gov.br/api/v3/malhas/municipios/3538709?formato=application/vnd.geo%2Bjson&qualidade=minima','geojson',null,true,'Seed de recuperação a partir da base versionada do projeto.' from public.municipalities m where m.ibge_code='3538709' and not exists (select 1 from public.territorial_sources ts where ts.municipality_id=m.id and ts.name='IBGE — API de Malhas Geográficas');
insert into public.territorial_sources (municipality_id,name,source_url,source_type,reference_date,machine_readable,notes)
select m.id,'Prefeitura de Piracicaba — Mapas do Município','https://piracicaba.sp.gov.br/servicos/mapas-do-municipio/','map',null,false,'Seed de recuperação a partir da base versionada do projeto.' from public.municipalities m where m.ibge_code='3538709' and not exists (select 1 from public.territorial_sources ts where ts.municipality_id=m.id and ts.name='Prefeitura de Piracicaba — Mapas do Município');
insert into public.territorial_sources (municipality_id,name,source_url,source_type,reference_date,machine_readable,notes)
select m.id,'Mapa das Regiões Administrativas — atualização 12/12/2024','https://piracicaba.sp.gov.br/wp-content/uploads/2024/12/MAPA-DAS-REGIOES-ADMINISTRATIVAS-FINAL.pdf','map','2024-12-12'::date,false,'Seed de recuperação a partir da base versionada do projeto.' from public.municipalities m where m.ibge_code='3538709' and not exists (select 1 from public.territorial_sources ts where ts.municipality_id=m.id and ts.name='Mapa das Regiões Administrativas — atualização 12/12/2024');
insert into public.territorial_sources (municipality_id,name,source_url,source_type,reference_date,machine_readable,notes)
select m.id,'Geoprocessamento de Piracicaba','https://piracicaba.geopixel.com.br/geopixelcidades3/','geoprocessing',null,false,'Seed de recuperação a partir da base versionada do projeto.' from public.municipalities m where m.ibge_code='3538709' and not exists (select 1 from public.territorial_sources ts where ts.municipality_id=m.id and ts.name='Geoprocessamento de Piracicaba');

insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,1,61859,10.68,5792.04,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,2,36982,37.99,973.47,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,3,28526,16.38,1741.51,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,4,60002,27.94,2147.53,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,5,30290,17.18,1763.1,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,6,46321,5.83,7945.28,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,7,38043,28.57,1331.57,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,8,58099,32.85,1768.61,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();
insert into public.administrative_regions (municipality_id,region_number,population,area_km2,density_hab_km2,source_id,boundary_status)
select m.id,9,42210,54.01,781.52,(select ts.id from public.territorial_sources ts where ts.municipality_id=m.id and ts.name like 'Mapa das Regiões Administrativas%' limit 1),'metadata-only' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,region_number) do update set population=excluded.population,area_km2=excluded.area_km2,density_hab_km2=excluded.density_hab_km2,source_id=excluded.source_id,boundary_status='metadata-only',updated_at=now();

insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Centro','centro','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Cidade Alta','cidade alta','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Cidade Jardim','cidade jardim','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Clube de Campo','clube de campo','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Higienópolis','higienopolis','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Elite','jardim elite','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Nova América','nova america','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Parque da Rua do Porto','parque da rua do porto','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'São Dimas','sao dimas','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'São Judas','sao judas','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Independência','vila independencia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Monteiro','vila monteiro','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Água Santa','agua santa','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Algodoal','algodoal','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Areão','areao','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Capim Fino','capim fino','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Monumento','jardim monumento','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Nhô Quim','nho quim','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Nova Piracicaba','nova piracicaba','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Guamium','guamium','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santa Rosa','santa rosa','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Rezende','vila rezende','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Corumbataí','corumbatai','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Primavera','jardim primavera','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Mário Dedini','mario dedini','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Fátima','vila fatima','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Industrial','vila industrial','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Itaperu','itaperu','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Parque Residencial Piracicaba','parque residencial piracicaba','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santa Terezinha','santa terezinha','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vale do Sol','vale do sol','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Sônia','vila sonia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Castelinho','castelinho','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Glebas Califórnia','glebas california','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jupiá','jupia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Morato','morato','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Ondas','ondas','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Ondinhas','ondinhas','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Paulista','paulista','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Bairro Verde','bairro verde','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jaraguá','jaragua','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Itapuã','jardim itapua','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Monte Líbano','monte libano','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Paulicéia','pauliceia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Cristina','vila cristina','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Água das Pedras','agua das pedras','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Campestre','campestre','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Dona Antonia','dona antonia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Planalto','jardim planalto','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Novo Horizonte','novo horizonte','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santa Helena','santa helena','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'São Jorge','sao jorge','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Água Branca','agua branca','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'CECAP','cecap','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Chicó','chico','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Califórnia','jardim california','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Caxambu','jardim caxambu','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Pompéia','pompeia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Taquaral','taquaral','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Agronomia','agronomia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Cidade Judiciária','cidade judiciaria','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Conceição','conceicao','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Dois Córregos','dois corregos','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim Abaeté','jardim abaete','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Jardim São Francisco','jardim sao francisco','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Monte Alegre','monte alegre','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Morumbi','morumbi','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Piracicamirim','piracicamirim','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santa Cecília','santa cecilia','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santa Rita','santa rita','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Unileste','unileste','urban' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Anhumas','anhumas','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Ártemis','artemis','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Ibitiruna','ibitiruna','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Tanquinho','tanquinho','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Tupi','tupi','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santana / Santa Olímpia','santana / santa olimpia','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Brisa da Serra','brisa da serra','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Canaã','canaa','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Nova Suíça','nova suica','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santa Ana','santa ana','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Terra Nova','terra nova','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Vila Belém','vila belem','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Uninorte','uninorte','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;
insert into public.neighborhoods (municipality_id,name,normalized_name,territory_kind)
select m.id,'Santa Isabel','santa isabel','isolated_nucleus' from public.municipalities m where m.ibge_code='3538709'
on conflict (municipality_id,name,territory_kind) do update set normalized_name=excluded.normalized_name,active=true;

insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Centro' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Cidade Alta' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Cidade Jardim' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Clube de Campo' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Higienópolis' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Jardim Elite' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Nova América' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Parque da Rua do Porto' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='São Dimas' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='São Judas' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Vila Independência' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=1 where m.ibge_code='3538709' and n.name='Vila Monteiro' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Água Santa' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Algodoal' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Areão' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Capim Fino' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Jardim Monumento' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Nhô Quim' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Nova Piracicaba' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,'Referência compartilhada no mapa-fonte.' from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Guamium' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Santa Rosa' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=2 where m.ibge_code='3538709' and n.name='Vila Rezende' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=3 where m.ibge_code='3538709' and n.name='Corumbataí' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=3 where m.ibge_code='3538709' and n.name='Jardim Primavera' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=3 where m.ibge_code='3538709' and n.name='Mário Dedini' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,'Referência compartilhada no mapa-fonte.' from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=3 where m.ibge_code='3538709' and n.name='Guamium' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=3 where m.ibge_code='3538709' and n.name='Vila Fátima' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=3 where m.ibge_code='3538709' and n.name='Vila Industrial' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=4 where m.ibge_code='3538709' and n.name='Itaperu' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=4 where m.ibge_code='3538709' and n.name='Parque Residencial Piracicaba' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=4 where m.ibge_code='3538709' and n.name='Santa Terezinha' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=4 where m.ibge_code='3538709' and n.name='Vale do Sol' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=4 where m.ibge_code='3538709' and n.name='Vila Sônia' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=5 where m.ibge_code='3538709' and n.name='Castelinho' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=5 where m.ibge_code='3538709' and n.name='Glebas Califórnia' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=5 where m.ibge_code='3538709' and n.name='Jupiá' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=5 where m.ibge_code='3538709' and n.name='Morato' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=5 where m.ibge_code='3538709' and n.name='Ondas' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=5 where m.ibge_code='3538709' and n.name='Ondinhas' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=5 where m.ibge_code='3538709' and n.name='Paulista' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=6 where m.ibge_code='3538709' and n.name='Bairro Verde' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=6 where m.ibge_code='3538709' and n.name='Jaraguá' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=6 where m.ibge_code='3538709' and n.name='Jardim Itapuã' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=6 where m.ibge_code='3538709' and n.name='Monte Líbano' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=6 where m.ibge_code='3538709' and n.name='Paulicéia' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=6 where m.ibge_code='3538709' and n.name='Vila Cristina' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=7 where m.ibge_code='3538709' and n.name='Água das Pedras' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=7 where m.ibge_code='3538709' and n.name='Campestre' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=7 where m.ibge_code='3538709' and n.name='Dona Antonia' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=7 where m.ibge_code='3538709' and n.name='Jardim Planalto' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=7 where m.ibge_code='3538709' and n.name='Novo Horizonte' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=7 where m.ibge_code='3538709' and n.name='Santa Helena' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=7 where m.ibge_code='3538709' and n.name='São Jorge' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=8 where m.ibge_code='3538709' and n.name='Água Branca' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=8 where m.ibge_code='3538709' and n.name='CECAP' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=8 where m.ibge_code='3538709' and n.name='Chicó' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=8 where m.ibge_code='3538709' and n.name='Jardim Califórnia' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=8 where m.ibge_code='3538709' and n.name='Jardim Caxambu' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=8 where m.ibge_code='3538709' and n.name='Pompéia' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=8 where m.ibge_code='3538709' and n.name='Taquaral' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Agronomia' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Cidade Judiciária' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Conceição' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Dois Córregos' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Jardim Abaeté' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Jardim São Francisco' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Monte Alegre' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Morumbi' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Piracicamirim' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Santa Cecília' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Santa Rita' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;
insert into public.neighborhood_regions (neighborhood_id,administrative_region_id,relation_note)
select n.id,ar.id,null from public.neighborhoods n join public.municipalities m on m.id=n.municipality_id join public.administrative_regions ar on ar.municipality_id=m.id and ar.region_number=9 where m.ibge_code='3538709' and n.name='Unileste' and n.territory_kind='urban'
on conflict (neighborhood_id,administrative_region_id) do update set relation_note=excluded.relation_note;

insert into public.categories (slug,name,suggested_routing) values ('vias','Vias públicas','Obras e manutenção viária') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('iluminacao','Iluminação','Iluminação pública') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('residuos','Resíduos','Limpeza urbana e resíduos') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('agua','Água/Saneamento','Saneamento / SEMAE') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('alagamentos','Alagamentos','Drenagem urbana / Defesa Civil conforme o risco') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('sinalizacao','Sinalização','Mobilidade e trânsito') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('acessibilidade','Acessibilidade','Acessibilidade / manutenção urbana') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('areas','Áreas públicas','Áreas verdes, parques e serviços urbanos') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;
insert into public.categories (slug,name,suggested_routing) values ('outros','Outros','Triagem de atendimento / 156') on conflict (slug) do update set name=excluded.name,suggested_routing=excluded.suggested_routing,active=true;

-- Invariantes esperados após o seed:
-- 1 município; 5 fontes; 9 regiões; 71 bairros urbanos únicos; 72 vínculos bairro/região; 9 categorias.
