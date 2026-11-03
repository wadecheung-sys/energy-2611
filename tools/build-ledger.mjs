import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {SpreadsheetFile,FileBlob}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs')));
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'outputs/energy-planning');
const target=path.join(out,'能源平台页面规划与进展-v0.4.xlsx');
const previous=path.join(out,'能源平台页面规划与进展-v0.3.xlsx');
const source=process.argv[2]||await fs.access(target).then(()=>target).catch(()=>previous);
const pages=JSON.parse(await fs.readFile(path.join(root,'planning/pages.json'),'utf8'));
const baseline=JSON.parse(await fs.readFile(path.join(root,'planning/ledger-baseline.json'),'utf8'));
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const s=wb.worksheets.getItem('页面台账'),changes=wb.worksheets.getItem('讨论与变更');
const originalNotes=s.getRange('L8:M34').values,originalSummary=s.getRange('A4:N4').formulas;
const render=async(sheetName,range,name)=>{const img=await wb.render({sheetName,range,scale:1.5});await fs.writeFile(path.join(out,name+'.png'),new Uint8Array(await img.arrayBuffer()));};
await render('页面台账','A7:J16','ledger-before');
if(process.argv.includes('--inspect')){console.log(JSON.stringify({summary:s.getRange('A4:N4').formulas,values:s.getRange('A7:N9').values,tables:s.tables.items.map(t=>t.name)}));process.exit(0);}
const values=s.getRange('A8:N200').values,conflicts=[];
const keys=['id','group','name','kind','req','status','source','idea','next','limit','route'];
for(const page of pages){const index=values.findIndex(r=>r[0]===page.id);if(index<0){s.tables.items[0].rows.add(null,[[...keys.map(k=>k==='route'?'#'+page[k]:page[k]),'','',new Date('2026-11-03')]]);continue;}const row=index+8;const old=baseline.find(p=>p.id===page.id);let changed=false;
 for(let col=1;col<keys.length;col++){const key=keys[col],raw=values[index][col],current=key==='route'?(raw==='未建立'||raw==='登录入口'?'':String(raw||'').replace(/^#/,'')):raw;if(page[key]===old?.[key])continue;if(current!==old?.[key]&&current!==page[key]){conflicts.push({id:page.id,column:key,current,proposed:page[key]});continue;}s.getRangeByIndexes(row-1,col,1,1).values=[[key==='route'?(page[key]?'#'+page[key]:'登录入口'):page[key]]];changed=true;}
 if(changed)s.getRange(`N${row}`).values=[[new Date('2026-11-02T00:00:00Z')]];
}
s.getRange('A2').values=[['版本 0.4　2026-11-03　已复核技术规格书4.2及旧系统51张截图；页面状态表示前端实现进度，不等同生产验收。']];
s.getRange('A3').values=[['按固定页面ID持续讨论；保留L列用户意见、M列下一步决定，其他列人工改动在增量更新时保留并报告冲突。']];
const newRecords=[
 ['C16',new Date('2026-11-03'),'全部','旧截图全覆盖复核','增加47个路由；66项页面台账；51张截图逐项对应','已实现待评审','原图空白及公式未明确之处保留待确认边界'],
 ['C09',new Date('2026-11-02'),'P06—P17','4.2逐项复核','接入补表底/单位；公司报表补水油气；组织、角色范围与菜单配置补齐','已实现待评审','详见需求复核与因子核算设计.md；生产接口和现场实施另行验收'],
 ['C10',new Date('2026-11-02'),'P08','因子状态与核算引用','取消全局核算采用；因子版本和引用规则分离，同能源/组织/日期唯一','设计建议待评审','确认地区口径、适用日期、是否多方案并行'],
 ['C11',new Date('2026-11-02'),'P06 P07 P08','历史核算与生效期','跨版本周期按日拆分；发布后不覆盖旧批次；缺失项不按0处理','已实现待评审','确认正式审批、归档与重算规则'],
 ['C12',new Date('2026-11-02'),'P06 P09','全港核算边界','已补公共用电和油气活动量结构，但油气因子未确认，完整总量显示待核算','待业务确认','确认排放源清单、官方适用因子及CO₂/CO₂e方法'],
 ['C13',new Date('2026-11-02'),'P08','依据资料与新增入口','新增、草稿、发布、版本历史、来源链接和≤500KB本地附件可操作','已实现待评审','生产改接文件库与服务端事务校验'],
 ['C14',new Date('2026-11-02'),'P20 全部','发布与生产部署区别','按用户要求公开评审入口与admin/123456；不等同规格书内网、信创和密码基线','用户要求已落实','正式工程接入认证、数据库、接口与内网部署'],
 ['C15',new Date('2026-11-03'),'全部','面向用户的界面原则','业务界面只呈现任务、结果和必要规则；移除无效页脚及开发过程文案，详细说明折叠','用户已明确，已落实','后续迭代遵循界面内容原则.md']
];
const oldLog=changes.getRange('A5:G200').values;const table=changes.tables.items.find(t=>t.name==='DecisionLog')||changes.tables.items[0];
const appended=newRecords.filter(r=>!oldLog.some(old=>old[0]===r[0]));
if(appended.length){const first=oldLog.filter(r=>r[0]).length+5;table.rows.add(null,appended);const last=first+appended.length-1;changes.getRange(`A${first}:G${last}`).format={font:{name:'Microsoft YaHei',size:11,color:'#334D61'},wrapText:true,rowHeight:90,verticalAlignment:'center'};changes.getRange(`B${first}:B${last}`).setNumberFormat('yyyy-mm-dd');}
const lastRow=7+pages.length;
s.getRange('A35:N'+lastRow).format={font:{name:'Microsoft YaHei',size:11,color:'#334D61'},wrapText:true,rowHeight:100,verticalAlignment:'center'};s.getRange('N8:N'+lastRow).setNumberFormat('yyyy-mm-dd');
for(let col=0;col<14;col++){const formula=originalSummary[0][col];if(formula)s.getRangeByIndexes(3,col,1,1).formulas=[[formula.replace(/34/g,String(lastRow))]];}
wb.recalculate();assert.deepEqual(s.getRange('L8:M34').values,originalNotes);
console.log(JSON.stringify({source,summary:s.getRange('A4:N4').values,conflicts}));
await (await SpreadsheetFile.exportXlsx(wb)).save(target);
// Preserve unresolved manual conflicts as pending against the prior baseline.
const nextBaseline=structuredClone(pages);for(const item of conflicts)nextBaseline.find(p=>p.id===item.id)[item.column]=baseline.find(p=>p.id===item.id)[item.column];
await fs.writeFile(path.join(root,'planning/ledger-baseline.json'),JSON.stringify(nextBaseline,null,2)+'\n');
await render('页面台账','A7:F17','ledger-preview');await render('页面台账','G12:J17','ledger-details');await render('讨论与变更','A13:G18','decisions-preview');
await render('页面台账','A65:J73','ledger-added');console.log(target);
