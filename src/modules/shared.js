import {esc,num,button,panel,table,options,notice} from '../ui.js';
import {legacyPages} from '../legacy-catalog.js';
import {resourceTotal,sum} from '../business-domain.js';
export function createContext(core){
 const {db,state,setExport}=core;state.business??={resource:'electricity',compare:'year',reportMode:'月',selected:null,from:'2026-10-01',to:'2026-10-31',pages:{},search:''};
 const v=state.business,actions={},forms={};
 const orgs=()=>core.authorizedOrgs().filter(o=>state.org==='全部单位'||state.org===o);
 const act=(label,name,id='',style='text')=>button(label,'biz:'+name+(id?':'+id:''),style);
 const field=(label,name,value='',type='text',extra='')=>`<label class="form-field">${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
 const select=(label,name,items,value)=>`<label class="form-field">${esc(label)}<select name="${name}">${items.map(x=>{const [val,text]=Array.isArray(x)?x:[x,x];return `<option value="${esc(val)}" ${val===value?'selected':''}>${esc(text)}</option>`;}).join('')}</select></label>`;
 const form=(type,id,body,label='保存')=>`<form data-business="${type}" data-id="${esc(id)}"><div class="business-form">${body}</div><p class="error" id="business-error" role="alert"></p><div class="form-actions">${button('取消','close')}<button class="btn primary" type="submit">${label}</button></div></form>`;
 const tabs=ids=>`<div class="panel route-tabs">${ids.map(id=>{const p=legacyPages.find(p=>p.id===id);return `<a href="#${id}" class="${state.route===id?'active':''}">${esc(p.title)}</a>`;}).join('')}</div>`;
 const display=x=>typeof x==='number'?num(x,2):esc(x??'—');
 function report(title,headers,plain,html,extra='',groups){
  setExport(headers,plain);const per=12,pages=Math.max(1,Math.ceil(plain.length/per));v.pages[state.route]=Math.min(v.pages[state.route]||0,pages-1);const start=v.pages[state.route]*per;let body=table(headers,(html||plain.map(row=>row.map(display))).slice(start,start+per));
  if(groups&&plain.length)body=body.replace('<thead>','<thead><tr>'+groups.map(g=>`<th colspan="${g.span}">${esc(g.label)}</th>`).join('')+'</tr>');
  return panel(title,body+`<div class="table-pagination"><span>共 ${plain.length} 条 · 第 ${v.pages[state.route]+1}/${pages} 页</span>${act('上一页','page','-1')}${act('下一页','page','1')}</div>`,extra);
 }
 function pick(label,key,items,value=v[key]){return `<label>${esc(label)}<select data-biz-filter="${key}">${items.map(x=>{const [val,text]=Array.isArray(x)?x:[x,x];return `<option value="${esc(val)}" ${value===val?'selected':''}>${esc(text)}</option>`;}).join('')}</select></label>`;}
 const total=(type,period=state.period,date=state.date)=>sum(orgs().map(o=>resourceTotal(db,core.scope(),o,type,period,date)));
 const requireEdit=()=>{if(state.role!=='能源管理员')throw Error('当前角色没有维护权限');};
 actions.page=id=>{v.pages[state.route]=Math.max(0,(v.pages[state.route]||0)+Number(id));core.render();};
 return {...core,v,actions,forms,orgs,act,field,select,form,tabs,display,report,pick,total,requireEdit,canManage:()=>state.role==='能源管理员',help:(title,text)=>`<details class="business-help"><summary>${esc(title)}</summary><p>${text}</p></details>`};
}
export function multiChart(series,labels,unit){
 if(!series.length||!labels.length)return notice('请选择至少一个统计对象');const colors=['#168bb7','#23a58f','#e4a353','#7a7fca','#cb6f7f'];const max=Math.max(1,...series.flatMap(x=>x.values))*1.12;
 return `<div class="chart-legend">${series.map((s,i)=>`<span><i style="background:${colors[i%5]}"></i>${esc(s.name)}</span>`).join('')}</div><div class="chart"><svg viewBox="0 0 790 245" aria-label="${esc(unit)}趋势" role="img">${[0,1,2,3,4].map(i=>`<line x1="55" x2="760" y1="${205-i*41}" y2="${205-i*41}" stroke="#e7edf2"/><text x="48" y="${209-i*41}" text-anchor="end" class="axis">${num(max*i/4,0)}</text>`).join('')}${series.map((s,j)=>`<polyline points="${s.values.map((v,i)=>`${55+i*705/Math.max(1,labels.length-1)},${205-v/max*164}`).join(' ')}" fill="none" stroke="${colors[j%5]}" stroke-width="2.5"/>`).join('')}${labels.map((l,i)=>i%Math.ceil(labels.length/8)===0||i===labels.length-1?`<text x="${55+i*705/Math.max(1,labels.length-1)}" y="231" text-anchor="middle" class="axis">${esc(l)}</text>`:'').join('')}<text x="12" y="15" class="axis">${esc(unit)}</text></svg></div>`;
}
export function ring(items,unit){const colors=['#168bb7','#23a58f','#e4a353','#7a7fca'];const total=sum(items.map(x=>x.value));let before=0;return `<div class="donut-layout"><svg viewBox="0 0 180 180" role="img" aria-label="用能构成">${items.map((x,i)=>{const value=total?x.value/total*100:0;const node=`<circle cx="90" cy="90" r="64" fill="none" stroke="${colors[i%4]}" stroke-width="18" pathLength="100" stroke-dasharray="${value} ${100-value}" stroke-dashoffset="${-before}" transform="rotate(-90 90 90)"/>`;before+=value;return node;}).join('')}<text x="90" y="86" text-anchor="middle" fill="currentColor" font-size="18">${num(total,0)}</text><text x="90" y="107" text-anchor="middle" fill="#8297a5" font-size="11">${esc(unit)}</text></svg><div>${items.map((x,i)=>`<div class="donut-key"><i style="background:${colors[i%4]}"></i><span>${esc(x.name)}</span><strong>${num(total?x.value/total*100:0,1)}%</strong></div>`).join('')}</div></div>`;}
