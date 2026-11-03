import {periodDays} from './domain.js';
import {legacyPages} from './legacy-catalog.js';
export function initBusiness(db){
 if(!db.business){
  const orgs=db.orgs.filter(o=>o.status==='启用').map(o=>o.name);
  db.business={entries:[],production:[],teams:[],schedules:[],quotas:[],standards:[],shore:[],green:[],coal:{electricity:.1229,diesel:1.4571,petrol:1.4714,gas:1.2143},densities:{diesel:.84,petrol:.74}};
  orgs.forEach((org,i)=>{
   for(const year of [2025,2026])for(let m=1;m<=(year===2026?10:12);m++){
    const month=`${year}-${String(m).padStart(2,'0')}`;
    db.business.entries.push({id:`B${i}-${month}`,type:'budget',org,month,intensity:5+i,comparable:7+i,electricity:450000+i*70000,operator:'能源管理员',updated:month+'-01 09:00'});
    db.business.entries.push({id:`C${i}-${month}`,type:'coefficients',org,month,unload:1,length:1,climate:1,adaptation:1,teu:i===3?42000:0,operator:'能源管理员',updated:month+'-01 09:00'});
   }
   const types=[...new Set((db.devices||[]).filter(d=>d.org===org).map(d=>d.type))];
   types.forEach((type,j)=>db.business.quotas.push({id:`Q${i}-${j}`,org,year:'2026',device_type:type,value:2.35+j*.15,unit:'kWh/t',reason:'年度设备能耗定额'}));
   ['甲班','乙班'].forEach((name,j)=>db.business.teams.push({id:`T${i}-${j}`,org,name:org+name,device_type:'门机',leader:j?'李海':'张明',status:'启用'}));
   for(const [j,date] of periodDays('月','2026-10-31').entries())for(const [k,shift] of ['白班','夜班'].entries())db.business.schedules.push({id:`S${i}-${j}-${k}`,date,org,team:`T${i}-${(j+k)%2}`,shift,devices:(db.devices||[]).filter(d=>d.org===org&&d.type==='门机').map(d=>d.id)});
  });
  db.business.green=[
   {id:'PV01',name:'矿石码头屋顶光伏',org:'矿石码头',type:'solar',capacity:450,base:1884,power:149.88,reactive:.68,status:'运行'},
   {id:'PV02',name:'集装箱场区光伏',org:'集装箱码头',type:'solar',capacity:320,base:1280,power:118.26,reactive:1.2,status:'运行'},
   {id:'WT01',name:'港区风电机组',org:'一公司',type:'wind',capacity:250,base:940,power:86.3,reactive:2.1,status:'运行'},
   {id:'CP01',name:'一公司充电站',org:'一公司',type:'charging',capacity:240,base:830,power:64,status:'运行'},
   {id:'CP02',name:'集装箱充电站',org:'集装箱码头',type:'charging',capacity:360,base:1230,power:98,status:'运行'},
   {id:'ES01',name:'港区储能站',org:'二公司',type:'storage',capacity:500,base:1100,power:80,soc:68,status:'运行'}
  ];
  db.business.shore=[{id:'SP01',org:'一公司',ship:'冀港远航01',voyage:'20261018',berth:'8号泊位',cargo:'矿石',contact:'港调一组',meter:'AE0801',connected:'2026-10-18T08:00',disconnected:'2026-10-18T20:00',start_reading:14520,end_reading:14628,multiplier:40,price:.85,paid:'未缴费',frequency:50,remark:'',remark2:''},{id:'SP02',org:'二公司',ship:'海运新程02',voyage:'20261022',berth:'9号泊位',cargo:'煤炭',contact:'港调二组',meter:'AE0901',connected:'2026-10-22T06:30',disconnected:'2026-10-23T06:30',start_reading:18200,end_reading:18402,multiplier:40,price:.85,paid:'已缴费',frequency:50,remark:'',remark2:''}];
 }
 // New routes get defaults once; existing role restrictions and menu preferences are preserved.
 for(const [index,p] of legacyPages.entries())if(!db.menuConfig[p.id]){db.menuConfig[p.id]={visible:true,order:100+index};if(!db.roles['能源管理员'].includes(p.id))db.roles['能源管理员'].push(p.id);if(['analysis','unit-report','intensity','codes','green-report'].includes(p.view)&&!db.roles['单位查看员'].includes(p.id))db.roles['单位查看员'].push(p.id);}
 db.schemaVersion=4;
}
