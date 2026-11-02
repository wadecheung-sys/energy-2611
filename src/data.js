// 集中维护的业务样本，非生产运行记录；正式接入只替换数据服务层。
export const sourceUrl = 'https://www.mee.gov.cn/xxgk2018/xxgk/xxgk01/202512/t20251231_1139517.html';
export const organizations = ['一公司','二公司','矿石码头','集装箱码头'];
export const deviceSeed = Array.from({length:20},(_,i)=>({
 id:`EQ${String(i+1).padStart(3,'0')}`,name:i<10?`${101+i}号门机`:i<14?`${201+i-10}号装船机`:i<17?`${301+i-14}号堆取料机`:`${401+i-17}号岸桥`,
 type:i<10?'门机':i<14?'装船机':i<17?'堆取料机':'岸桥',org:organizations[i%4],berth:`${8+i%8}号泊位`,station:`${i%4+1}号配电室`,asset:i===4?'':`TSG-2026-${String(i+1).padStart(4,'0')}`,
 meter:`E${260001+i}`,multiplier:[40,60,80,100][i%4],base:950+i*127,added:i<5,status:i===2?'通讯中断':'正常',baseReading:21800+i*3150
}));
export const waterSeed = organizations.map((org,i)=>({id:`W${260001+i}`,name:`${org}生产供水总表`,org,status:i===1?'计量异常':'正常',reading:19632+i*3810,berth:'公共区域'}));
export const factorSeed=[
 {id:'F01',name:'全国电力平均二氧化碳排放因子',region:'全国',value:0.5306,year:2023,unit:'kgCO₂/kWh',version:1,status:'核算采用',source:'生态环境部、国家统计局 公告2025年第47号',url:sourceUrl},
 {id:'F02',name:'河北省电力平均二氧化碳排放因子',region:'河北',value:0.6516,year:2023,unit:'kgCO₂/kWh',version:1,status:'备选',source:'生态环境部、国家统计局 公告2025年第47号',url:sourceUrl},
 {id:'F03',name:'华北区域电力平均二氧化碳排放因子',region:'华北',value:0.6361,year:2023,unit:'kgCO₂/kWh',version:1,status:'备选',source:'生态环境部、国家统计局 公告2025年第47号',url:sourceUrl}
];
export const maintenanceSeed=[
 {id:'WX2026102901',meter:'E260003',org:'矿石码头',device:'103号门机',fault:'采集通讯中断',level:'重要',status:'待处理',owner:'设备运维组',created:'2026-10-29 09:16',finished:'',history:[{time:'2026-10-29 09:16',text:'通讯超时，已生成维护记录'}]},
 {id:'WX2026102802',meter:'W260002',org:'二公司',device:'二公司生产供水总表',fault:'表底连续跳变',level:'一般',status:'处理中',owner:'计量维护组',created:'2026-10-28 14:30',finished:'',history:[{time:'2026-10-28 14:30',text:'发现读数异常'},{time:'2026-10-28 15:10',text:'已受理，检查脉冲采集器'}]},
 {id:'WX2026102603',meter:'E260008',org:'集装箱码头',device:'108号门机',fault:'采集通讯中断',level:'一般',status:'已完成',owner:'设备运维组',created:'2026-10-26 08:12',finished:'2026-10-26 11:42',history:[{time:'2026-10-26 08:12',text:'发现通讯中断'},{time:'2026-10-26 11:42',text:'更换通讯模块，完成核验'}]}
];
export const userSeed=[{id:'U001',name:'能源管理员',account:'energy_admin',org:'全部单位',role:'能源管理员',status:'启用'},{id:'U002',name:'设备运维员',account:'maintenance',org:'全部单位',role:'设备运维员',status:'启用'},{id:'U003',name:'一公司负责人',account:'company_one',org:'一公司',role:'单位查看员',status:'启用'}];
export const navGroups=[
 ['运行总览',[['overview','工作台','home'],['energy','公司用能','chart']]],
 ['计量与运维',[['devices','重点设备','crane'],['meters','水电表监测','meter'],['maintenance','水电表维护','tool']]],
 ['能碳管理',[['carbon','碳排放总览','leaf'],['carbon-analysis','碳分解核算','chart'],['factors','排放因子','sliders']]],
 ['统计与对接',[['company-report','公司能耗报表','file'],['equipment-report','重点设备报表','file'],['loss','配电室线损','bolt'],['intake','数据接入','database'],['push','集团数据上报','send']]],
 ['系统管理',[['organizations','组织机构','tree'],['roles','角色权限','shield'],['users','用户管理','users'],['menus','菜单管理','grid'],['logs','操作记录','clock']]]
];
export const pageMeta=Object.fromEntries(navGroups.flatMap(([group,items])=>items.map(([id,title,icon])=>[id,{title,group,icon}])));
export const roleAccess={'能源管理员':Object.keys(pageMeta),'设备运维员':['overview','devices','meters','maintenance','intake','push','loss','logs'],'单位查看员':['overview','energy','devices','meters','carbon','carbon-analysis','company-report','equipment-report','loss']};
