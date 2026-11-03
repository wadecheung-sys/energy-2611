import {factorSeed,organizations,pageMeta,facilitySeed} from './data.js';
export function upgrade(db){
 db.orgs??=organizations.map((name,i)=>({id:'ORG00'+(i+1),name,parent:'唐山港集团',status:'启用'}));
 db.menuConfig??=Object.fromEntries(Object.keys(pageMeta).map((id,i)=>[id,{visible:true,order:i}]));
 db.roleScopes??={'能源管理员':['全部单位'],'设备运维员':['全部单位'],'单位查看员':['一公司']};
 db.batches??=[];
 db.facility??=structuredClone(facilitySeed);
 if(!db.factorVersions){
  db.factorVersions=factorSeed.map(f=>({...f,family_id:f.id,energy_type:'electricity',method:'购入电力平均排放',lifecycle:'published',effective_from:'2025-01-01',effective_to:'',document:null}));
  // 旧版编辑内容只迁移为草稿，不能覆盖官方种子或无提示改变历史结果。
  for(const f of db.factors||[]){const seed=factorSeed.find(s=>s.id===f.id);if(!seed||seed.value!==f.value)db.factorVersions.push({...f,id:f.id+'-migrated',family_id:f.id,version:Math.max(2,f.version),energy_type:'electricity',method:'购入电力平均排放',lifecycle:'draft',effective_from:'2026-11-02',effective_to:'',reason:'由旧版本维护记录迁移，等待发布确认'});}
  db.factorRules=[{id:'RULE01',energy_type:'electricity',org:'全部单位',family_id:'F01',effective_from:'2025-01-01',effective_to:'',reason:'初始购入电力核算方案，全国平均口径'}];
 }
 for(const f of db.factorVersions)delete f.status;
 db.schemaVersion=3;
 organizations.splice(0,organizations.length,...db.orgs.filter(o=>o.status==='启用').map(o=>o.name));
}
