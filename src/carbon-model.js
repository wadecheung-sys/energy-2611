import {facilityDaily} from './business-domain.js';
import {periodDays,dailyEnergy} from './domain.js';

export const energyTypes = { electricity: ['购入电力','kWh','kgCO₂/kWh'], diesel: ['柴油','t','tCO₂/t'], petrol: ['汽油','t','tCO₂/t'], gas: ['天然气','Nm³','kgCO₂/Nm³'] };
export const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function validUrl(value){try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}}
export function versionState(f,date=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'})){
 if(f.lifecycle==='draft')return '草稿';if(f.lifecycle==='withdrawn')return '已撤销';
 if(date<f.effective_from)return '待生效';if(f.effective_to&&date>f.effective_to)return '历史版本';return '有效版本';
}
export function validateFactor(f){
 if(!f.name?.trim()||!f.region?.trim()||!f.method?.trim())throw Error('请填写名称、地区和核算口径');
 if(!energyTypes[f.energy_type]||f.unit!==energyTypes[f.energy_type][2])throw Error('因子单位与能源类型不匹配');
 if(!Number.isFinite(Number(f.value))||Number(f.value)<0)throw Error('因子值必须为非负数');
 if(!f.source?.trim()||(!validUrl(f.url)&&!f.document?.data))throw Error('请填写来源名称，并提供有效HTTP(S)链接或依据文件');
 if(!validDate(f.effective_from))throw Error('请设置有效的生效日期');
 if(f.effective_to&&(!validDate(f.effective_to)||f.effective_to<f.effective_from))throw Error('结束日期无效或早于生效日期');
}
export function publishFactor(versions,id){
 const next=versions.find(f=>f.id===id);if(!next||next.lifecycle!=='draft')throw Error('只能发布草稿');validateFactor(next);
 const siblings=versions.filter(f=>f.family_id===next.family_id&&f.lifecycle==='published');
 for(const f of siblings){
  if(['energy_type','region','method','unit'].some(key=>next[key]!==f[key]))throw Error('同系列能源、地区、方法和单位必须一致；不同口径请新增系列');
  if(next.version<=f.version)throw Error('草稿版本已落后于已发布版本，请重新建立新版本');
  if(next.effective_from<=f.effective_from)throw Error('新版本生效日期必须晚于本系列已发布版本；历史调整请建立独立核算方案');
 }
 const previous=siblings.sort((a,b)=>b.effective_from.localeCompare(a.effective_from))[0];
 if(previous&&(!previous.effective_to||previous.effective_to>=next.effective_from))previous.effective_to=new Date(Date.parse(next.effective_from+'T00:00:00Z')-86400000).toISOString().slice(0,10);
 next.lifecycle='published';return next;
}
const inRange=(date,x)=>date>=x.effective_from&&(!x.effective_to||date<=x.effective_to);
export function addRule(db,rule){
 if(!validDate(rule.effective_from)||rule.effective_to&&(!validDate(rule.effective_to)||rule.effective_to<rule.effective_from))throw Error('请检查规则有效期');
 if(!rule.reason?.trim()||!['全部单位',...db.orgs.filter(o=>o.status==='启用').map(o=>o.name)].includes(rule.org))throw Error('请填写规则依据并选择有效组织');
 const family=db.factorVersions.find(f=>f.family_id===rule.family_id&&f.lifecycle==='published');
 if(!family||family.energy_type!==rule.energy_type)throw Error('请选择能源类型一致的已发布因子系列');
 const overlaps=db.factorRules.some(r=>r.id!==rule.id&&r.energy_type===rule.energy_type&&(r.org===rule.org||r.org==='全部单位'||rule.org==='全部单位')&&r.effective_from<=(rule.effective_to||'9999-12-31')&&rule.effective_from<=(r.effective_to||'9999-12-31'));
 if(overlaps)throw Error('此能源和组织的规则有效期重叠，请先结束原规则，不能同时采用两个口径');
 const existing=db.factorRules.find(r=>r.id===rule.id);if(existing)Object.assign(existing,rule);else db.factorRules.push(rule);
}
export function resolveFactor(db,type,org,date){
 const rules=db.factorRules.filter(r=>r.energy_type===type&&(r.org==='全部单位'||r.org===org)&&inRange(date,r));
 if(rules.length!==1)return {error:rules.length?'引用规则冲突':'缺少核算规则'};
 const versions=db.factorVersions.filter(f=>f.family_id===rules[0].family_id&&f.lifecycle==='published'&&inRange(date,f));
 return versions.length===1?{factor:versions[0],rule:rules[0]}:{error:versions.length?'因子版本冲突':'缺少有效因子版本'};
}
export function activityRows(db,devices,orgs,period,date,{includeFacility=true}={}){
 const days=periodDays(period,date),rows=[];
 for(const day of days){for(const d of devices)rows.push({date:day,org:d.org,device:d.name,device_id:d.id,berth:d.berth,energy_type:'electricity',quantity:dailyEnergy(d,day),source:d.meter});
 if(includeFacility)for(const org of orgs){const base=db.facility.find(f=>f.org===org);if(!base)continue;const swing=1+(Number(day.slice(8))%5)*.03;
 rows.push({date:day,org,device:'公共生产及辅助用电',berth:'公共区域',energy_type:'electricity',quantity:facilityDaily(db,org,'electricity',day),source:'公共用电统计'});
 rows.push({date:day,org,device:'港内运输与辅助设备',berth:'公共区域',energy_type:'diesel',quantity:facilityDaily(db,org,'diesel',day),source:'燃料消耗台账'});
 rows.push({date:day,org,device:'后勤供热',berth:'公共区域',energy_type:'gas',quantity:facilityDaily(db,org,'gas',day),source:'天然气统计台账'});
 const petrol=facilityDaily(db,org,'petrol',day);if(petrol>0)rows.push({date:day,org,device:'汽油用能设备',berth:'公共区域',energy_type:'petrol',quantity:petrol,source:'油品消耗台账'});
 }}return rows;
}
export function calculateCarbon(db,rows){
 const details=new Map();let known_total=0,missing=0;
 for(const row of rows){const resolved=resolveFactor(db,row.energy_type,row.org,row.date);const f=resolved.factor;const emissions=f?row.quantity*Number(f.value)/(f.unit.startsWith('kg')?1000:1):null;
 if(emissions===null)missing++;else known_total+=emissions;
 const key=[row.org,row.device_id||row.device,row.berth,row.energy_type,f?.id||resolved.error,resolved.rule?.id].join('|');
 if(!details.has(key))details.set(key,{...row,quantity:0,emissions:f?0:null,factor:f?structuredClone(f):null,rule:resolved.rule?structuredClone(resolved.rule):null,rule_id:resolved.rule?.id,error:resolved.error,from:row.date,to:row.date});
 const r=details.get(key);r.quantity+=row.quantity;if(emissions!==null)r.emissions+=emissions;r.to=row.date;
 }return {known_total,total:missing||!rows.length?null:known_total,missing,details:[...details.values()],activity_data:structuredClone(rows)};
}
export function snapshotBatch(result,context){return structuredClone({id:'CB'+Date.now(),created:new Date().toISOString(),...context,...result});}
