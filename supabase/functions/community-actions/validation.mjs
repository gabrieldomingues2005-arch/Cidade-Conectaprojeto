export function validate(body){
 if(!body||typeof body!=='object'||Array.isArray(body))return {error:'invalid_json'};
 const {action,protocol,deviceKey,resolution,rating,trackingKey}=body;
 if(!['read','recurrence','feedback'].includes(action)||typeof protocol!=='string'||!/^CC-\d{4}-\d{5}$/.test(protocol)||typeof deviceKey!=='string'||! /^[a-f0-9]{64}$/.test(deviceKey))return {error:'invalid_fields'};
 if(trackingKey!==undefined&&(typeof trackingKey!=='string'||! /^[A-Za-z0-9_-]{20,200}$/.test(trackingKey)))return {error:'invalid_tracking_key'};
 if(action==='feedback'&&(!['yes','partial','no'].includes(resolution)||(rating!==undefined&&rating!==null&&(!Number.isInteger(rating)||rating<1||rating>5))))return {error:'invalid_feedback'};
 return {action,protocol,deviceKey,trackingKey:trackingKey||null,resolution:action==='feedback'?resolution:null,rating:action==='feedback'?(rating??null):null};
}
