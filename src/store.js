import {deviceSeed,waterSeed,factorSeed,maintenanceSeed,userSeed,roleAccess} from './data.js';
import {upgrade} from './model-upgrade.js';
const key='tangshan-energy-v1';
const defaults=()=>({devices:structuredClone(deviceSeed),water:structuredClone(waterSeed),factors:structuredClone(factorSeed),maintenance:structuredClone(maintenanceSeed),users:structuredClone(userSeed),roles:structuredClone(roleAccess),factorHistory:[],queue:[],logs:[{time:'2026-10-31 17:20',user:'能源管理员',action:'完成月度计量数据检查',target:'2026年10月'}]});
let saved;try{saved=JSON.parse(localStorage.getItem(key));}catch{}
export const db=saved?.devices?{...defaults(),...saved}:defaults();
upgrade(db);
export function persist(){localStorage.setItem(key,JSON.stringify(db));}
export function timestamp(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());}
export function audit(user,action,target){db.logs.unshift({time:timestamp(),user,action,target});persist();}
