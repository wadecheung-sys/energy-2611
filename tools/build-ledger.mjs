import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
const {Workbook,SpreadsheetFile,FileBlob}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs')));
const root=path.resolve(import.meta.dirname,'..');
const pages=JSON.parse((await fs.readFile(path.join(root,'planning/pages.json'),'utf8')).replace(/^\uFEFF/,''));
const end=pages.length+7;
const out=path.join(root,'outputs/energy-planning');await fs.mkdir(out,{recursive:true});
const target=path.join(out,'能源平台页面规划与进展.xlsx');
// 再次生成前按稳定ID保留用户意见及下一步决定，不覆盖人工讨论结果。
const notes=new Map();
try{await fs.access(target);const old=await SpreadsheetFile.importXlsx(await FileBlob.load(target));const values=old.worksheets.getItem('页面台账').getRange('A8:N200').values;for(const r of values){if(r[0])notes.set(r[0],[r[11],r[12]]);}}catch(e){if(e.code!=='ENOENT')throw e;}
const wb=Workbook.create();const s=wb.worksheets.add('页面台账');const changes=wb.worksheets.add('讨论与变更');
for(const sh of [s,changes]){sh.showGridLines=false;sh.getRange('A1:N50').format.font={name:'Microsoft YaHei',size:11,color:'#334D61'};sh.getRange('A1:N50').format.verticalAlignment='center';sh.tabColor='#146C94';}
s.getRange('A1:N1').merge();s.getRange('A1').values=[['唐山港能源平台 页面规划与进展']];s.getRange('A1:N1').format={fill:'#173D57',font:{name:'Microsoft YaHei',size:17,bold:true,color:'#FFFFFF'},rowHeight:40};
s.getRange('A2:N2').merge();s.getRange('A2').values=[['版本 0.1　2026-11-02　以业务表达为主；还原表示结构与操作思路复用，不表示像素一致或旧代码复用。']];s.getRange('A2:N2').format.rowHeight=30;
s.getRange('A3:N3').merge();s.getRange('A3').values=[['后续按页面ID讨论并持续更新。L列填写您的意见，M列记录已决定的下一步；重新生成台账时保留这两列。']];s.getRange('A3:N3').format={fill:'#EAF4F8',rowHeight:30};
s.getRange('A4:F4').values=[['页面总数',null,'已实现待评审',null,'部分实现',null]];
s.getRange('B4').formulas=[[`=COUNTA(A8:A${end})`]];s.getRange('D4').formulas=[[`=COUNTIF(F8:F${end},"已实现待评审")`]];s.getRange('F4').formulas=[[`=COUNTIF(F8:F${end},"部分实现")`]];s.getRange('G4:L4').values=[['待规划',null,'还原',null,'新增',null]];
s.getRange('H4').formulas=[[`=COUNTIF(F8:F${end},"待规划")`]];s.getRange('J4').formulas=[[`=COUNTIF(D8:D${end},"还原")`]];s.getRange('L4').formulas=[[`=COUNTIF(D8:D${end},"新增")`]];s.getRange('M4:N4').values=[['调整',null]];s.getRange('N4').formulas=[[`=COUNTIF(D8:D${end},"调整")`]];s.getRange('A4:N4').format={fill:'#F3F7FA',rowHeight:30};
s.getRange('A5:N5').merge();s.getRange('A5').values=[['来源：2026年10月技术规格书4.2（R01—R12）；唐山港能源平台截图（S01—S51）；2026-11-01用户沟通。具体定位见每行依据。']];s.getRange('A5:N5').format={font:{size:10,color:'#718797'},rowHeight:28};
const headers=['页面ID','一级菜单','页面名称','页面性质','需求对应','当前状态','旧成果依据','表达思路与本轮内容','下一步建议','当前边界或歧义','页面路径','用户意见','下一步决定','更新日期'];
s.getRange('A7:N7').values=[headers];
const rows=pages.map(p=>[p.id,p.group,p.name,p.kind,p.req,p.status,p.source,p.idea,p.next,p.limit,p.id==='P20'?'登录入口 /':p.route?'#'+p.route:'未建立',notes.get(p.id)?.[0]||'',notes.get(p.id)?.[1]||'',new Date('2026-11-02T00:00:00Z')]);s.getRange(`A8:N${7+rows.length}`).values=rows;
const tab=s.tables.add(`A7:N${7+rows.length}`,true,'PageLedger');tab.showFilterButton=true;
s.getRange('A7:N7').format={fill:'#146C94',font:{bold:true,color:'#FFFFFF'},rowHeight:32,wrapText:true};
s.getRange(`A8:N${end}`).format={wrapText:true,rowHeight:84};s.getRange(`N8:N${end}`).setNumberFormat('yyyy-mm-dd');
const widths=[10,16,22,12,20,20,32,48,40,48,24,36,36,16];widths.forEach((w,i)=>s.getRangeByIndexes(0,i,end,1).format.columnWidth=w);
s.getRange(`L8:M${end}`).format.fill='#FFF8DE';
s.getRange('D8:D200').dataValidation={rule:{type:'list',values:['还原','新增','调整']}};
s.getRange('F8:F200').dataValidation={rule:{type:'list',values:['待规划','编码中','部分实现','已实现待评审','待调整','已确认','暂缓']}};
s.getRange(`D8:D${end}`).conditionalFormats.add('containsText',{text:'新增',format:{fill:'#E6F2FA',font:{color:'#15688F'}}});
s.getRange(`F8:F${end}`).conditionalFormats.add('containsText',{text:'部分实现',format:{fill:'#FFF1D8',font:{color:'#9B701D'}}});
s.getRange(`F8:F${end}`).conditionalFormats.add('containsText',{text:'待规划',format:{fill:'#F0F2F4',font:{color:'#7C8992'}}});
s.freezePanes.freezeRows(7);s.freezePanes.freezeColumns(3);
changes.getRange('A1:G1').merge();changes.getRange('A1').values=[['讨论与变更记录']];changes.getRange('A1:G1').format={fill:'#173D57',font:{size:17,bold:true,color:'#FFFFFF'},rowHeight:40};
changes.getRange('A2:G2').merge();changes.getRange('A2').values=[['已确认方向与仍需讨论事项分开记录。每轮评审后追加记录，不把页面完成等同于需求验收完成。']];changes.getRange('A2:G2').format={wrapText:true,rowHeight:35};
changes.getRange('A4:G4').values=[['记录ID','日期','关联页面','事项','当前结论或建议','确认状态','下一步']];
const records=[
 ['C01',new Date('2026-11-01'),'全部','工作目标','以表达业务思路为主，使用新建前端和灵活的集中数据','用户已确认','持续迭代页面与台账'],
 ['C02',new Date('2026-11-01'),'全部','页面性质台账','区分还原、新增、调整，允许视觉表达与旧截图有差异','用户已确认','按固定页面ID记录意见和决定'],
 ['C03',new Date('2026-11-01'),'P11','线损计算','同一计量边界进线减出线，线损率为差额除以进线','用户已说明','完善进出线明细及异常状态'],
 ['C04',new Date('2026-11-01'),'P03 P13','设备范围','重点用能设备全量视图，5台新增独立计量为子集','实施假设','用页面继续核对字段与业务关系'],
 ['C05',new Date('2026-11-01'),'P06—P08','碳核算范围','先表达购入电力核算，官方全国、河北、华北2023年电力因子内置','待讨论','补油气排放源、因子生效期和历史批次机制'],
 ['C06',new Date('2026-11-01'),'P14 P15 P17','配置深度','组织详情、角色菜单授权和菜单关系已有页面，部分编辑仍待补齐','待讨论','按实际使用优先级补充编辑'],
 ['C07',new Date('2026-11-01'),'P19—P27','旧功能保留范围','保留规划记录，不用空页面冒充完成','待讨论','选择下一轮优先还原的业务'],
 ['C08',new Date('2026-11-01'),'全部','首版实现','18个可访问页面；状态区分已实现待评审与部分实现','待评审','检查布局、交互和业务表达']
];changes.getRange('A5:G12').values=records;changes.tables.add('A4:G12',true,'DecisionLog');changes.getRange('A4:G4').format={fill:'#146C94',font:{bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:32};changes.getRange('A5:G12').format={wrapText:true,rowHeight:75};changes.getRange('B5:B12').setNumberFormat('yyyy-mm-dd');[12,16,20,22,66,20,48].forEach((w,i)=>changes.getRangeByIndexes(0,i,15,1).format.columnWidth=w);changes.freezePanes.freezeRows(4);
wb.recalculate();
const initial=s.getRange('D4').values[0][0];s.getRange('F8').values=[['待调整']];wb.recalculate();const changed=s.getRange('D4').values[0][0];if(changed!==initial-1)throw Error('状态统计重算失败');s.getRange('F8').values=[[pages[0].status]];wb.recalculate();
console.log((await wb.inspect({kind:'region',sheetId:'页面台账',range:'A4:N4',maxChars:2500,tableMaxCols:14})).ndjson);
const exported=await SpreadsheetFile.exportXlsx(wb);
let savedTarget=target;
try{await exported.save(target);}catch(e){if(e.code!=='EBUSY')throw e;savedTarget=path.join(out,'能源平台页面规划与进展-v0.2.xlsx');await exported.save(savedTarget);}
for(const [sheetName,range,name] of [['页面台账','A1:N7','ledger-header'],['页面台账','A7:F14','ledger-preview'],['页面台账','G7:J13','ledger-details'],['讨论与变更','A1:G8','decisions-preview']]){const image=await wb.render({sheetName,range,scale:1.3});await fs.writeFile(path.join(out,name+'.png'),new Uint8Array(await image.arrayBuffer()));}
console.log(savedTarget);
