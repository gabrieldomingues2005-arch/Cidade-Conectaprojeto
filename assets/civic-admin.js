/* Ferramentas de leitura interna; a autorização continua no Auth/Edge existentes. */
(()=>{
'use strict';
const D=window.CidadeConectaData,U=window.CidadeConectaUI;
const $=s=>document.querySelector(s);
const authorized=()=>window.CidadeConectaAuth?.state.status==='authorized';
function checks(rows){return rows.map(o=>{const issues=[],cat=o.categories?.slug,created=D.time(o.created_at),last=D.time(o.updated_at)||created;
 if(!o.neighborhood_label)issues.push('Bairro ausente');
 if(!cat||!Object.hasOwn(D.CATEGORIES,cat))issues.push('Categoria inconsistente');
 else if(cat==='outros')issues.push('Revisar classificação');
 if(!o.title||o.title.length<5)issues.push('Título incompleto');
 if(!D.STATUSES.includes(o.status))issues.push('Status inconsistente');
 if(created===null||created>Date.now()||(D.time(o.updated_at)!==null&&D.time(o.updated_at)<created))issues.push('Data inconsistente');
 if(last&&Date.now()-last>30*D.DAY&&o.status!=='Resolvida')issues.push('Sem atualização há mais de 30 dias');
 if(o.territory_resolution_status==='unresolved')issues.push('Referência territorial pendente');
 const duplicates=rows.filter(x=>x.protocol!==o.protocol&&x.categories?.slug===cat&&D.norm(x.neighborhood_label)===D.norm(o.neighborhood_label)&&D.norm(x.title)===D.norm(o.title)).map(x=>x.protocol);
 if(duplicates.length)issues.push('Possível duplicidade');
 return{protocol:o.protocol,issues,duplicates,attention:issues.length};
})}
function filter(rows){if(!authorized())return[];const priority=$('#adminAttention')?.value,agency=$('#adminAgency')?.value,moderation=$('#adminModeration')?.value,quality=new Map(checks(rows).map(x=>[x.protocol,x]));let arr=rows.filter(o=>(!priority||quality.get(o.protocol).attention>0)&&(!agency||o.responsible_agency===agency)&&(!moderation||o.moderation_status===moderation));const sort=$('#adminSort')?.value;if(sort==='attention')arr=arr.slice().sort((a,b)=>quality.get(b.protocol).attention-quality.get(a.protocol).attention);if(sort==='oldest')arr=arr.slice().sort((a,b)=>(D.time(a.created_at)||0)-(D.time(b.created_at)||0));return arr}
function enhance(rows,openDetail,rerender){
 if(!authorized()||!$('#adminList')||$('#adminQuality'))return;
 const controls=document.createElement('div');controls.className='civic-admin-controls';controls.innerHTML=`<label>Atenção sugerida<select id="adminAttention"><option value="">Todos os registros</option><option value="attention">Com pontos de revisão</option></select></label><label>Setor<select id="adminAgency"><option value="">Todos os setores</option>${[...new Set(rows.map(o=>o.responsible_agency).filter(Boolean))].sort().map(x=>`<option value="${U.esc(x)}">${U.esc(x)}</option>`).join('')}</select></label><label>Moderação<select id="adminModeration"><option value="">Todos</option><option value="pending">Pendente</option><option value="approved">Aprovada</option><option value="rejected">Rejeitada</option></select></label><label>Ordenar<select id="adminSort"><option value="">Mais recentes</option><option value="oldest">Mais antigas</option><option value="attention">Mais pontos de revisão</option></select></label>`;
 $('#adminList').before(controls);controls.addEventListener('change',rerender);
 const section=document.createElement('section');section.id='adminQuality';section.className='card civic-admin-quality';const items=checks(rows).filter(x=>x.attention);
 section.innerHTML=`<div class="titleRow"><div><span class="miniLabel">Qualidade dos dados · interno</span><h2>Registros que pedem revisão</h2><p class="muted">${items.length} de ${rows.length} registros da fila apresentam sinais de atenção. São sugestões de conferência, sem alteração automática de classificação, status ou prioridade oficial.</p></div></div>${items.length?`<ul class="civic-quality-list">${items.slice(0,50).map(x=>`<li><div><b>${U.esc(x.protocol)}</b><p>${x.issues.map(U.esc).join(' · ')}</p>${x.duplicates.length?`<small>Comparar com: ${x.duplicates.map(U.esc).join(', ')}. Registros nunca são fundidos automaticamente.</small>`:''}</div><button type="button" class="btn secondary smallBtn" data-quality-open="${U.esc(x.protocol)}">Conferir histórico</button></li>`).join('')}</ul>`:'<p>Nenhum problema detectado nos campos disponíveis nesta listagem.</p>'}<p class="small muted">A listagem não lê contato, endereço exato ou ponto privado. A presença de localização e a completude da descrição dependem da conferência do detalhe autorizado; sua ausência na projeção mínima não é tratada como erro.</p><p class="small muted">Encaminhamento, rejeição e mudança de estado continuam fora desta ferramenta de leitura. Ações de escrita exigem fluxo transacional auditado e validação com conta interna de QA.</p>`;
 $('#adminList').closest('.card').after(section);
 section.addEventListener('click',event=>{const p=event.target.closest('[data-quality-open]')?.dataset.qualityOpen;if(p&&authorized())openDetail(p)});
 $('#adminClear')?.addEventListener('click',()=>{for(const id of ['adminAttention','adminAgency','adminModeration','adminSort'])$('#'+id).value='';rerender()});
}
window.CidadeConectaAdmin=Object.freeze({filter,enhance});
})();
