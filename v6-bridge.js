const q6Money=v=>money(v);
const q6Value=(p,key)=>p[key]||'-';
renderDetailV2=function(){
  const q=(store.state?.quotes||[]).find(x=>String(x.id)===String(store.id));
  if(!q){store.view='list';return render()}
  const clientSource=q.customerSource==='其他自定义'?(q.customCustomerSource||q.customerSource):q.customerSource||'未填写';
  const products=(q.products||[]).map((p,i)=>{
    const process=[
      joinCustom(p.processes?.forming,p.customForming,'其他自定义输入'),
      joinCustom(p.processes?.coloring,p.customColoring,'其他自定义输入'),
      joinCustom(p.processes?.surface,p.customSurface,'其他自定义输入')
    ].filter(v=>v&&v!=='未填写').join('、')||'未填写';
    const rows=[['材质',p.material==='其他自定义'?(p.customMaterial||p.material):p.material||'未填写'],['尺寸',p.size||'未填写'],['工艺',process],['电镀',joinCustom(p.processes?.plating,p.customPlating,'其他自定义输入')],['配件',joinCustom(p.accessories,p.customAccessory)],['包装',joinCustom(p.packaging,p.customPackaging)],['工期',p.leadTime||'待确认']];
    if(p.packingEnabled==='有')rows.push(['产品克重',q6Value(p,'productWeight')],['箱规',p.boxSpec==='其他自定义'?(p.customBoxSpec||p.boxSpec):q6Value(p,'boxSpec')],['装箱数量',`${q6Value(p,'packingQuantity')} PCS`],['装箱重量',`毛重 ${q6Value(p,'grossWeight')} KG / 净重 ${q6Value(p,'netWeight')} KG`]);
    const prices=(p.prices||[]).map(r=>`<div class="q6-price-row"><span>${esc(r.quantity||'-')} PCS</span><span>${q6Money(r.unitPrice)} / PCS</span><strong>${q6Money(Number(r.quantity||0)*Number(r.unitPrice||0)+Number(p.mouldFee||0))}</strong></div>`).join('');
    const note=p.noteOption==='其他自定义'?(p.customNote||'无'):p.noteOption||'无';
    const sample=p.sample==='有'?`<div class="q6-block-title">打样信息</div><div class="q6-info-row sample-fee"><span>打样费</span><b>${q6Money(p.sampleFee)}</b><span>下单可退</span><b>${p.refundable==='是'?q6Money(p.refundAmount):'否'}</b></div><div class="q6-info-row"><span>打样工期</span><b>${esc(p.sampleLeadTime||'待确认')}</b></div><div class="q6-info-row"><span>打样备注</span><b>${esc(p.sampleNote||'无')}</b></div>`:'';
    return `<section class="q6-product"><div class="q6-product-head">${i+1}. ${esc(displayName(p)||'未命名产品')}</div><div class="q6-specs">${rows.map(([k,v])=>`<div class="q6-row"><span>${esc(k)}：</span><b>${esc(v)}</b></div>`).join('')}</div><div class="q6-block-title">阶梯报价</div><div class="q6-price"><div class="q6-price-row q6-price-head"><span>数量（PCS）</span><span>单价（元/PCS）</span><span>合计（含模具/版费）</span></div>${prices}</div><div class="q6-info-row"><span>模具 / 版费</span><b>${q6Money(p.mouldFee)}</b></div><div class="q6-info-row"><span>报价备注</span><b>${esc(note)}</b></div>${sample}</section>`
  }).join('');
  document.querySelector('#app').innerHTML=shell(`<article class="q6-sheet"><header class="q6-header"><div class="q6-brand"><img src="./company-logo.jpg" alt="中禾完整 Logo"><div class="q6-company"><h1>温州市中禾工艺品有限公司</h1><p>源头大厂 · 专注行业三十余年 · 品质保证</p></div></div><div class="q6-title-row"><span>ZHONGHE QUOTATION</span><b>产品报价单</b></div></header><section class="q6-meta"><div class="q6-cell"><span>报价单号</span><b>${esc(q.number)}</b></div><div class="q6-cell"><span>报价日期</span><b>${esc(q.quoteDate||'未填写')}</b></div><div class="q6-cell"><span>有效期至</span><b>${esc(q.validUntil||'未填写')}</b></div></section><section class="q6-client"><div class="q6-section-label"><b>客户信息</b><small>CLIENT INFORMATION</small></div><div class="q6-client-grid"><div class="q6-client-cell"><span>客户名称</span><b>${esc(q.customer||'未填写')}</b></div><div class="q6-client-cell"><span>客户来源</span><b>${esc(clientSource)}</b></div><div class="q6-client-cell"><span>报价联系人</span><b>${esc(q.contact||'周先生')}</b></div><div class="q6-client-cell"><span>电话 / 微信</span><b>${esc(q.phoneWechat||'未填写')}</b></div></div></section>${products}<footer class="q6-footer"><strong>温州市中禾工艺品有限公司</strong>本报价以最终确认的规格、数量、工艺和样品为准；原材料价格波动可能影响最终成交价。</footer></article><div class="q6-actions"><button class="secondary" data-action="edit" data-id="${q.id}">修改</button><button class="ghost" data-action="duplicate" data-id="${q.id}">复制</button><button class="primary" data-action="export" data-id="${q.id}">保存报价图片</button></div>`,'报价详情',true)
};

const q6RenderEditBase=renderEdit;
const q6DateParts=value=>String(value||'').split('-').map(Number);
const q6DateDiff=(start,end)=>{const [sy,sm,sd]=q6DateParts(start),[ey,em,ed]=q6DateParts(end);if(!sy||!ey)return 30;return Math.round((Date.UTC(ey,em-1,ed)-Date.UTC(sy,sm-1,sd))/86400000)};
const q6AddDays=(value,days)=>{const [y,m,d]=q6DateParts(value);if(!y)return '';const date=new Date(Date.UTC(y,m-1,d));date.setUTCDate(date.getUTCDate()+Number(days||0));return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`};
renderEdit=function(){
  q6RenderEditBase();
  (editing?.products||[]).forEach((product,index)=>{
    const groups=[
      ['forming',product.processes?.forming,'其他自定义输入','自定义成型工艺','customForming'],
      ['coloring',product.processes?.coloring,'其他自定义输入','自定义上色工艺','customColoring'],
      ['surface',product.processes?.surface,'其他自定义输入','自定义表面处理','customSurface'],
      ['plating',product.processes?.plating,'其他自定义输入','自定义电镀','customPlating'],
      ['accessories',product.accessories,'其他自定义','自定义配件','customAccessory'],
      ['packaging',product.packaging,'其他自定义','自定义包装','customPackaging']
    ];
    groups.forEach(([group,selected,option,label,key])=>{
      if(!(selected||[]).includes(option))return;
      const choice=document.querySelector(`input[name="p.${index}.${group}"][value="${option}"]`);
      choice?.closest('.chips')?.insertAdjacentHTML('afterend',input(label,`p.${index}.${key}`,product[key]||'','text','class="custom-entry" placeholder="请输入具体内容"'));
    });
    if(product.packingEnabled==='有'&&product.boxSpec==='其他自定义'){
      const box=document.querySelector(`select[name="p.${index}.boxSpec"]`);
      box?.closest('.field')?.insertAdjacentHTML('afterend',input('自定义箱规',`p.${index}.customBoxSpec`,product.customBoxSpec||'','text','class="custom-entry" placeholder="例如 40×30×20cm"'));
    }
  });
  const quoteDate=document.querySelector('input[name="quoteDate"]'),validUntil=document.querySelector('input[name="validUntil"]');
  if(!quoteDate||!validUntil)return;
  quoteDate.closest('.form-grid.two')?.classList.add('date-grid');
  const presets=[0,30,60,90],diff=q6DateDiff(quoteDate.value,validUntil.value),selected=presets.includes(diff)?diff:30,field=validUntil.closest('.field');
  field.innerHTML=`<label>报价有效期</label><select name="validityDays" aria-label="报价有效期">${presets.map(days=>`<option value="${days}" ${days===selected?'selected':''}>${days===0?'当天':days+'天'}</option>`).join('')}</select><input type="hidden" name="validUntil" value="${esc(validUntil.value)}"><small class="validity-hint">有效期至 ${esc(validUntil.value)}</small>`;
  const preset=field.querySelector('select[name="validityDays"]'),hidden=field.querySelector('input[name="validUntil"]'),hint=field.querySelector('.validity-hint');
  const sync=()=>{hidden.value=q6AddDays(quoteDate.value,preset.value);hint.textContent=`有效期至 ${hidden.value}`};
  quoteDate.addEventListener('change',sync);preset.addEventListener('change',sync);sync();
};
document.addEventListener('change',event=>{
  if(store.view!=='edit')return;
  const customChip=event.target.matches('.chip input[type="checkbox"]')&&String(event.target.value).includes('其他自定义');
  const customBox=event.target.matches('select[name$=".boxSpec"]');
  if(customChip||customBox){snapshot();renderEdit()}
});

const q6RenderListBase=renderList;
renderList=function(){
  q6RenderListBase();
  document.querySelector('.toolbar')?.insertAdjacentHTML('beforebegin',`<section class="backup-tools" aria-label="报价备份"><div><strong>报价备份</strong><p>导出后保存到文件，可在其他设备导入；不会自动同步。</p></div><div class="backup-buttons"><button class="ghost" data-action="backup-export">导出备份</button><button class="ghost" data-action="backup-import">导入恢复</button></div><input type="file" id="quote-backup-file" accept=".json,application/json" hidden></section>`);
  document.querySelectorAll('.quote-card').forEach(card=>{
    const actions=card.querySelector('.card-actions'),id=card.dataset.open;
    if(!actions||!id||actions.querySelector('[data-action="delete"]'))return;
    actions.insertAdjacentHTML('beforeend',`<button class="danger" data-action="delete" data-id="${esc(id)}" aria-label="删除报价 ${esc(card.querySelector('.quote-no')?.textContent||'')}">删除</button>`);
  });
};

// Backups contain quote records only, including custom fields and embedded photos.
function q6BackupPayload(quotes){
  return {format:'zhonghe-quote-backup',version:1,exportedAt:new Date().toISOString(),quotes:clone(quotes)};
}
function q6ReadBackup(value){
  if(!value||value.format!=='zhonghe-quote-backup'||value.version!==1||!Array.isArray(value.quotes))throw new Error('请选择本工具导出的 JSON 备份文件');
  if(value.quotes.length>10000)throw new Error('备份报价数量过多，请分批导入');
  const record=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const scalar=v=>v===undefined||v===null||['string','number'].includes(typeof v);
  return value.quotes.map((q,index)=>{
    const fail=()=>{throw new Error(`备份第 ${index+1} 条报价格式不正确，未导入任何数据`)};
    if(!record(q)||typeof q.number!=='string'||!q.number.trim()||typeof q.customer!=='string'||!Array.isArray(q.products)||!q.products.length)fail();
    if(Object.values(q).some(v=>typeof v==='function')||!scalar(q.id))fail();
    const next=clone(q);
    for(const key of ['customerSource','customCustomerSource','contact','phoneWechat','quoteDate','validUntil','status','createdAt','updatedAt'])if(!scalar(next[key]))fail();
    next.products=next.products.map(p=>{
      if(!record(p)||typeof p.name!=='string'||!Array.isArray(p.prices))fail();
      const product={...emptyProduct(),...p,processes:{...emptyProduct().processes,...p.processes}};
      for(const group of ['forming','coloring','surface','plating'])if(!Array.isArray(product.processes[group])||product.processes[group].some(v=>typeof v!=='string'))fail();
      for(const key of ['accessories','packaging'])if(!Array.isArray(product[key])||product[key].some(v=>typeof v!=='string'))fail();
      for(const key of ['quotePhotos','referencePhotos'])if(!Array.isArray(product[key])||product[key].some(v=>typeof v!=='string'&&!(record(v)&&(typeof v.url==='string'||typeof v.raw==='string'))))fail();
      for(const [key,val] of Object.entries(product))if(!['processes','prices','accessories','packaging','quotePhotos','referencePhotos'].includes(key)&&!scalar(val))fail();
      if(product.prices.some(r=>!record(r)||!scalar(r.quantity)||!scalar(r.unitPrice)))fail();
      return product;
    });
    return next;
  });
}
function q6BackupSignature(q){
  const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>!['id','createdAt','updatedAt','backupOriginalNumber'].includes(k)).map(k=>[k,sort(v[k])])):v;
  const normalized={...q,number:q.backupOriginalNumber||q.number,products:(q.products||[]).map(p=>({...emptyProduct(),...p,processes:{...emptyProduct().processes,...p.processes}}))};
  return JSON.stringify(sort(normalized));
}
function q6MergeBackup(existing,incoming){
  const quotes=clone(existing),signatures=new Set(quotes.map(q6BackupSignature));
  const ids=new Set(quotes.map(q=>String(q.id))),numbers=new Set(quotes.map(q=>q.number));
  let added=0,skipped=0,conflicts=0;
  for(const item of incoming){
    const q=clone(item),signature=q6BackupSignature(q);
    if(signatures.has(signature)){skipped++;continue}
    const originalNumber=q.number;
    if(numbers.has(q.number)){
      q.backupOriginalNumber=q.backupOriginalNumber||originalNumber;
      let suffix=1;do{q.number=`${originalNumber}-导入${suffix++}`}while(numbers.has(q.number));
      conflicts++;
    }
    if(!q.id||ids.has(String(q.id)))do{q.id=uid('q')}while(ids.has(String(q.id)));
    quotes.push(q);ids.add(String(q.id));numbers.add(q.number);signatures.add(signature);added++;
  }
  return {quotes,added,skipped,conflicts};
}
function q6BackupDialog(title,message,confirmLabel){
  return new Promise(resolve=>{
    document.querySelector('#dialog-root').innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-card"><h2>${esc(title)}</h2><p>${esc(message)}</p><div class="modal-actions"><button class="ghost" data-backup-cancel>取消</button><button class="primary" data-backup-confirm>${esc(confirmLabel)}</button></div></div></div>`;
    const finish=ok=>{document.querySelector('#dialog-root').innerHTML='';resolve(ok)};
    document.querySelector('[data-backup-cancel]').onclick=()=>finish(false);
    document.querySelector('[data-backup-confirm]').onclick=()=>finish(true);
  });
}
document.addEventListener('click',async event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='backup-import')document.querySelector('#quote-backup-file')?.click();
  if(action!=='backup-export')return;
  try{
    const quotes=store.state?.quotes||[];
    if(!quotes.length)return toast('暂无报价可备份');
    const blob=new Blob([JSON.stringify(q6BackupPayload(quotes),null,2)],{type:'application/json'});
    const fileName=`中禾报价备份-${today()}-${quotes.length}条.json`;
    const file=typeof File==='function'?new File([blob],fileName,{type:'application/json'}):null;
    if(file&&navigator.canShare?.({files:[file]})){
      await navigator.share({files:[file],title:'中禾报价备份'});
      toast('请确认已将备份保存到“文件”或其他安全位置');
    }else{
      const url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download=fileName;document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);toast('已发起备份下载，请保存好 JSON 文件');
    }
  }catch(error){if(error.name!=='AbortError')toast('备份导出失败：'+error.message)}
});
document.addEventListener('change',async event=>{
  if(event.target.id!=='quote-backup-file')return;
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{
    if(file.size>50*1024*1024)throw new Error('备份文件超过 50MB，请分批导入');
    let parsed;try{parsed=JSON.parse(await file.text())}catch{throw new Error('文件无法解析，请选择完整的 JSON 备份文件')}
    const incoming=q6ReadBackup(parsed),preview=q6MergeBackup(store.state?.quotes||[],incoming);
    if(!preview.added)return toast(`没有新增报价，${preview.skipped} 条重复记录已跳过`);
    const approved=await q6BackupDialog('导入报价备份',`文件包含 ${incoming.length} 条报价，预计新增 ${preview.added} 条、跳过重复 ${preview.skipped} 条。同单号但内容不同的 ${preview.conflicts} 条将添加“导入”后缀，两份均保留。现有报价不会被覆盖。`,'确认导入');
    if(!approved)return;
    const result=q6MergeBackup(store.state?.quotes||[],incoming);
    const next={...store.state,quotes:result.quotes};
    // Commit storage first: a quota failure must leave the current state untouched.
    localStorage.setItem('zhq_demo_state',JSON.stringify(next));
    store.state=next;store.keyword='';store.view='list';store.id='';render();
    toast(`导入完成：新增 ${result.added} 条，跳过重复 ${result.skipped} 条`);
  }catch(error){toast(error.name==='QuotaExceededError'?'存储空间不足，未导入；请先导出现有报价备份':error.message)}
});
['gesturestart','gesturechange','gestureend'].forEach(type=>document.addEventListener(type,event=>event.preventDefault(),{passive:false}));
document.addEventListener('touchmove',event=>{if(event.touches&&event.touches.length>1)event.preventDefault()},{passive:false});

const q6TopbarBase=topbar;
topbar=function(title='报价工作台',back=false){
  const html=q6TopbarBase(title,back);
  return back?html.replace('<button class="icon-btn" data-action="back" aria-label="返回">←</button>','<button class="icon-btn back-btn" data-action="back" aria-label="返回报价列表"><span aria-hidden="true">←</span><span>返回</span></button>'):html;
};

const q6RenderBase=render;
let q6HistoryReady=false,q6HandlingPop=false,q6LastRoute='';
const q6RouteState=()=>({view:store.view||'list',id:store.id||''});
const q6RouteKey=state=>`${state.view}:${state.id}`;
render=function(){
  q6RenderBase();
  if(!store.mode||!store.state)return;
  const state=q6RouteState(),key=q6RouteKey(state);
  if(!q6HistoryReady){
    history.replaceState(state,'',location.href);
    q6HistoryReady=true;
  }else if(!q6HandlingPop&&key!==q6LastRoute){
    history.pushState(state,'',location.href);
  }
  q6LastRoute=key;
  q6HandlingPop=false;
};
document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-action="back"]');
  if(!button||!q6HistoryReady)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(store.view==='edit')snapshot();
  history.back();
},true);
window.addEventListener('popstate',event=>{
  const state=event.state||{view:'list',id:''};
  q6HandlingPop=true;
  store.view=state.view||'list';
  store.id=state.id||'';
  q6LastRoute=q6RouteKey(q6RouteState());
  render();
});
if(store.state)render();
