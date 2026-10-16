// Homepage only. Editing, export and storage continue to use the existing handlers.
const homeIcon=(name)=>{
  const paths={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',backup:'<path d="M12 15V3m-4 4 4-4 4 4M5 12H3v8h18v-8h-2"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',arrow:'<path d="m9 5 7 7-7 7"/>'};
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`;
};
const homePeriod={preset:'all',start:'',end:'',expanded:false};
function homeDateRange(preset,now=today()){
  if(preset==='month')return {start:now.slice(0,7)+'-01',end:now};
  if(preset==='30')return {start:q6AddDays(now,-29),end:now};
  if(preset==='90')return {start:q6AddDays(now,-89),end:now};
  return {start:'',end:''};
}
function homeInPeriod(q){
  const {start,end}=homePeriod;
  if(!start&&!end)return true;
  const date=String(q.quoteDate||'');
  return /^\d{4}-\d{2}-\d{2}$/.test(date)&&(!start||date>=start)&&(!end||date<=end);
}
function homeCategoryCounts(quotes){
  const counts=new Map();
  for(const q of quotes){
    // Count quotes containing a category, not products or price tiers.
    const names=new Set((q.products||[]).map(p=>String(p.name||'未分类').trim()||'未分类'));
    if(!names.size)names.add('未分类');
    for(const name of names)counts.set(name,(counts.get(name)||0)+1);
  }
  return [...counts].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'zh-CN'));
}
function homeAnalytics(quotes){
  const categories=homeCategoryCounts(quotes),max=categories[0]?.count||0;
  const rows=homePeriod.expanded?categories:categories.slice(0,5);
  const range=homePeriod.start||homePeriod.end?`${homePeriod.start||'不限起始'} 至 ${homePeriod.end||'不限截止'}`:'全部时间';
  return `<div class="qh-analytics-head"><h2>报价概况</h2><p>${esc(range)}${store.keyword?' · 当前搜索结果':''}</p></div>
    <div class="qh-analytics-grid"><dl class="qh-stats"><div><dt>当前报价</dt><dd>${quotes.length}<small>份</small></dd></div><div><dt>产品类别</dt><dd>${categories.length}<small>类</small></dd></div><div><dt>产品项目</dt><dd>${quotes.reduce((n,q)=>n+(q.products||[]).length,0)}<small>项</small></dd></div></dl>
    <section class="qh-chart" aria-label="产品类别报价数量"><div class="qh-chart-heading"><h3>哪类产品报价最多</h3><span>单位：份</span></div>
      ${max?`<ol class="qh-bars">${rows.map(({name,count})=>`<li><div class="qh-bar-label"><span>${esc(name)}</span><b>${count} 份</b></div><div class="qh-bar-track" aria-hidden="true"><div style="width:${count/max*100}%"></div></div></li>`).join('')}</ol><div class="qh-chart-scale" aria-hidden="true"><span>0</span><span>${max}</span></div>`:'<p class="qh-chart-empty">当前条件下暂无报价数据</p>'}
      ${categories.length>5?`<button class="qh-chart-toggle" data-chart-toggle>${homePeriod.expanded?'收起':'查看全部 '+categories.length+' 类'}</button>`:''}
      <p class="qh-chart-note">按品名类别统计；同单同类只计一次，多类别报价分别计数。</p>
    </section></div>`;
}
function homeQuoteCard(q){
  const products=q.products||[],id=esc(q.id),customer=esc(q.customer||'客户未填写');
  const names=products.map(displayName).filter(Boolean).join('、')||'产品未填写';
  const priceCount=products.reduce((n,p)=>n+(p.prices||[]).length,0);
  return `<article class="qh-card">
    <div class="qh-card-heading"><button type="button" class="qh-customer" data-action="detail" data-id="${id}" aria-label="查看 ${customer} 的报价 ${esc(q.number)}">${customer}${homeIcon('arrow')}</button>
      <details class="qh-more"><summary aria-label="更多操作：${esc(q.number)}">${homeIcon('more')}</summary><div class="qh-menu"><button type="button" data-action="delete" data-id="${id}">删除报价</button></div></details></div>
    <p class="qh-product">${esc(names)}</p>
    <p class="qh-number">单号 <span>${esc(q.number||'未填写')}</span></p>
    <dl class="qh-dates"><div><dt>报价日期</dt><dd>${esc(q.quoteDate||'未填写')}</dd></div><div><dt>有效期至</dt><dd>${esc(q.validUntil||'未填写')}</dd></div></dl>
    <p class="qh-counts">${products.length} 个产品<span aria-hidden="true"> · </span>${priceCount} 档价格</p>
    <div class="qh-actions"><button class="qh-button qh-secondary" data-action="edit" data-id="${id}">修改</button><button class="qh-button qh-secondary" data-action="duplicate" data-id="${id}">复制</button><button class="qh-button qh-save" data-action="export" data-id="${id}">保存图片</button></div>
  </article>`;
}
renderList=function({resultsOnly=false}={}){
  const all=store.state?.quotes||[],keyword=store.keyword.trim().toLowerCase();
  const list=all.filter(homeInPeriod).filter(q=>!keyword||[q.number,q.customer,q.contact,...(q.products||[]).flatMap(p=>[p.name,p.customName])].join(' ').toLowerCase().includes(keyword))
    .sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  const filtering=keyword||homePeriod.start||homePeriod.end;
  const resultLabel=filtering?`找到 ${list.length} 条报价`:`共 ${all.length} 条 · 最近更新优先`;
  const empty=filtering?`<div class="qh-empty"><h3>没有找到相关报价</h3><p>试试其他关键词，或扩大报价日期范围。</p><button class="qh-button qh-secondary" data-home-reset>重置全部筛选</button></div>`:`<div class="qh-empty"><h3>从第一份报价开始</h3><p>新建报价，填写客户和产品信息，保存后就会出现在这里。</p></div>`;
  const cards=list.map(homeQuoteCard).join('')||empty;
  if(resultsOnly&&document.querySelector('#home-results')){
    document.querySelector('#home-results').innerHTML=cards;
    document.querySelector('#home-result-count').textContent=resultLabel;
    document.querySelector('#home-clear').hidden=!store.keyword;
    document.querySelector('#home-analytics').innerHTML=homeAnalytics(list);
    return;
  }
  document.querySelector('#app').innerHTML=`<div class="qh-home">
    <header class="qh-header"><div class="qh-brand">
      <svg class="qh-logo" viewBox="24 182 530 218" role="img" aria-label="中禾 ZHONGHE 公司标志"><image href="./company-logo.jpg" width="578" height="578"/></svg>
      <h1>报价工作台</h1></div>
      <details class="qh-backup"><summary>${homeIcon('backup')}<span>备份</span></summary><section class="qh-backup-panel" aria-label="数据备份"><h2>数据备份</h2><p>报价仅存当前浏览器，不会自动云同步。导出文件可在其他设备导入，重复记录自动跳过。</p><div class="qh-backup-actions"><button class="qh-button qh-save" data-action="backup-export">导出备份</button><button class="qh-button qh-secondary" data-action="backup-import">导入恢复</button></div><input type="file" id="quote-backup-file" accept=".json,application/json" hidden></section></details>
    </header>
    <main class="qh-main"><section class="qh-time-filter" aria-label="按报价日期筛选"><div class="qh-filter-title"><h2>报价日期</h2><span>按报价单上的日期筛选</span></div><div class="qh-periods">${[['all','全部'],['month','本月'],['30','近30天'],['90','近90天'],['custom','自定义']].map(([value,label])=>`<button type="button" data-period="${value}" aria-pressed="${homePeriod.preset===value}">${label}</button>`).join('')}</div><div id="home-custom-range" class="qh-custom-range" ${homePeriod.preset==='custom'?'':'hidden'}><label>开始日期<input type="date" id="home-start" value="${esc(homePeriod.start)}" aria-describedby="home-range-error"></label><label>结束日期<input type="date" id="home-end" value="${esc(homePeriod.end)}" aria-describedby="home-range-error"></label><button class="qh-button qh-primary" data-apply-period>应用时间</button><p id="home-range-error" role="alert"></p></div></section>
      <section id="home-analytics" class="qh-overview" aria-label="报价统计">${homeAnalytics(list)}</section>
      <p class="qh-storage-note">仅存本机，未云同步<span>请定期备份</span></p>
      <div class="qh-toolbar"><div class="qh-search">${homeIcon('search')}<input type="search" id="search" value="${esc(store.keyword)}" placeholder="搜索单号、客户、产品" aria-label="搜索报价：单号、客户、产品" autocomplete="off" enterkeyhint="search"><button type="button" id="home-clear" data-home-clear aria-label="清空搜索" ${store.keyword?'':'hidden'}>${homeIcon('close')}</button></div><button class="qh-button qh-primary qh-desktop-create" data-action="create">${homeIcon('plus')}新建报价</button></div>
      <div class="qh-list-heading"><h2>报价记录</h2><p id="home-result-count" role="status" aria-live="polite">${resultLabel}</p></div>
      <section id="home-results" class="qh-list" aria-label="报价记录">${cards}</section>
    </main>
    <div class="qh-mobile-dock"><button class="qh-button qh-primary" data-action="create">${homeIcon('plus')}新建报价</button></div>
  </div>`;
};
document.addEventListener('click',event=>{
  const period=event.target.closest('[data-period]');
  if(period){
    homePeriod.preset=period.dataset.period;
    if(homePeriod.preset!=='custom')Object.assign(homePeriod,homeDateRange(homePeriod.preset));
    document.querySelectorAll('[data-period]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.period===homePeriod.preset)));
    document.querySelector('#home-custom-range').hidden=homePeriod.preset!=='custom';
    document.querySelector('#home-start').value=homePeriod.start;
    document.querySelector('#home-end').value=homePeriod.end;
    document.querySelector('#home-range-error').textContent='';
    renderList({resultsOnly:true});
  }
  if(event.target.closest('[data-apply-period]')){
    const start=document.querySelector('#home-start'),end=document.querySelector('#home-end');
    const error=document.querySelector('#home-range-error');
    if(!start.validity.valid||!end.validity.valid){error.textContent='请输入有效日期';return;}
    if(!start.value||!end.value){error.textContent='请选择开始日期和结束日期';return;}
    if(start.value>end.value){error.textContent='开始日期不能晚于结束日期';return;}
    homePeriod.start=start.value;homePeriod.end=end.value;error.textContent='';
    renderList({resultsOnly:true});
  }
  if(event.target.closest('[data-chart-toggle]')){homePeriod.expanded=!homePeriod.expanded;renderList({resultsOnly:true});}
  if(event.target.closest('[data-home-reset]')){
    Object.assign(homePeriod,{preset:'all',start:'',end:'',expanded:false});store.keyword='';renderList();
  }
  if(event.target.closest('[data-home-clear]')){
    const search=document.querySelector('.qh-home #search');
    if(search){search.value='';updateQuoteSearch(search);search.focus();}
  }
  const active=event.target.closest('.qh-home details');
  document.querySelectorAll('.qh-home details[open]').forEach(item=>{
    if(item!==active||event.target.closest('[data-action="delete"]'))item.open=false;
  });
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const open=document.querySelector('.qh-home details[open]');
  if(open){open.open=false;open.querySelector('summary').focus();}
});
if(store.state&&store.view==='list')render();
