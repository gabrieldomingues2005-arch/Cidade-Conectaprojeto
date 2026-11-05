-- Run only on Cidade Conecta qzpofoxxrjunyayczcfu. All test records/audit rows roll back.
begin;
set local role service_role;
do $$
declare
 v_new record;
 v jsonb;
 v_i integer;
 v_protocol text;
begin
 select * into v_new from public.submit_occurrence_internal('iluminacao','QA transacional de participação','Teste técnico controlado. Todos os dados desta transação serão revertidos.','Centro',null,null,null,null,null,null,null);
 v_protocol:=v_new.protocol;
 update public.occurrences set public_visible=true,moderation_status='approved' where protocol=v_protocol;
 v:=public.community_participation_internal('read',v_protocol,repeat('a',64),repeat('b',64));
 if v->>'recurrenceCount'<>'0' or v->>'registered'<>'false' then raise exception 'initial read failed'; end if;
 v:=public.community_participation_internal('recurrence',v_protocol,repeat('a',64),repeat('b',64));
 v:=public.community_participation_internal('recurrence',v_protocol,repeat('a',64),repeat('b',64));
 if v->>'recurrenceCount'<>'1' or v->>'registered'<>'true' then raise exception 'dedup failed'; end if;
 v:=public.community_participation_internal('feedback',v_protocol,repeat('a',64),repeat('b',64),'yes',5,v_new.tracking_key);
 if v->>'error'<>'not_resolved' then raise exception 'unresolved feedback was allowed'; end if;
 update public.occurrences set status='Resolvida',resolved_at=now() where protocol=v_protocol;
 v:=public.community_participation_internal('feedback',v_protocol,repeat('a',64),repeat('b',64),'yes',5,repeat('wrong',8));
 if v->>'error'<>'tracking_required' then raise exception 'tracking guard failed'; end if;
 v:=public.community_participation_internal('feedback',v_protocol,repeat('a',64),repeat('b',64),'partial',4,v_new.tracking_key);
 if v->>'feedbackSaved'<>'true' or v->>'myResolution'<>'partial' then raise exception 'private feedback failed'; end if;
 if v->'satisfaction'<>'null'::jsonb then raise exception 'small aggregate exposed'; end if;
 v:=public.community_participation_internal('read',v_protocol,repeat('d',64),repeat('b',64));
 if v->'myResolution'<>'null'::jsonb then raise exception 'individual feedback exposed'; end if;
 if (select count(*) from public.audit_log where entity_id=v_new.occurrence_id and action='community_recurrence')<>1 then raise exception 'recurrence audit mismatch'; end if;
 for v_i in 1..31 loop v:=public.community_participation_internal('read',v_protocol,repeat('a',64),repeat('c',64)); end loop;
 if v->>'error'<>'rate_limited' then raise exception 'quota failed'; end if;
 if has_function_privilege('anon','public.community_participation_internal(text,text,text,text,text,integer,text)','execute') or has_function_privilege('authenticated','public.community_participation_internal(text,text,text,text,text,integer,text)','execute') then raise exception 'client RPC access'; end if;
 if has_schema_privilege('anon','private','usage') or has_schema_privilege('authenticated','private','usage') then raise exception 'private schema access'; end if;
 if not has_function_privilege('service_role','public.community_participation_internal(text,text,text,text,text,integer,text)','execute') then raise exception 'service RPC denied'; end if;
end;
$$;
rollback;
select 'PASS: dedup, feedback guards, privacy, quota, audit, anon/authenticated/service_role; transaction rolled back' as qa_result;
