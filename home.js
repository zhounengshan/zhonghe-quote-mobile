// Homepage only. Editing, export and storage continue to use the existing handlers.
const homeIcon=(name)=>{
  const paths={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',backup:'<path d="M12 15V3m-4 4 4-4 4 4M5 12H3v8h18v-8h-2"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',arrow:'<path d="m9 5 7 7-7 7"/>'};
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||''}</svg>`;
};
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
  const list=all.filter(q=>!keyword||[q.number,q.customer,q.contact,...(q.products||[]).flatMap(p=>[p.name,p.customName])].join(' ').toLowerCase().includes(keyword))
    .sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  const resultLabel=keyword?`找到 ${list.length} 条报价`:`共 ${all.length} 条 · 最近更新优先`;
  const empty=keyword?`<div class="qh-empty"><h3>没有找到相关报价</h3><p>换个客户名称、单号或产品名称试试。</p><button class="qh-button qh-secondary" data-home-clear>清空搜索</button></div>`:`<div class="qh-empty"><h3>从第一份报价开始</h3><p>新建报价，填写客户和产品信息，保存后就会出现在这里。</p></div>`;
  const cards=list.map(homeQuoteCard).join('')||empty;
  if(resultsOnly&&document.querySelector('#home-results')){
    document.querySelector('#home-results').innerHTML=cards;
    document.querySelector('#home-result-count').textContent=resultLabel;
    document.querySelector('#home-clear').hidden=!store.keyword;
    return;
  }
  const month=today().slice(0,7),monthCount=all.filter(q=>String(q.quoteDate||'').startsWith(month)).length;
  const productCount=all.reduce((n,q)=>n+(q.products||[]).length,0);
  document.querySelector('#app').innerHTML=`<div class="qh-home">
    <header class="qh-header"><div class="qh-brand">
      <svg class="qh-logo" viewBox="24 182 530 218" role="img" aria-label="中禾 ZHONGHE 公司标志"><image href="./company-logo.jpg" width="578" height="578"/></svg>
      <h1>报价工作台</h1></div>
      <details class="qh-backup"><summary>${homeIcon('backup')}<span>备份</span></summary><section class="qh-backup-panel" aria-label="数据备份"><h2>数据备份</h2><p>报价仅存当前浏览器，不会自动云同步。导出文件可在其他设备导入，重复记录自动跳过。</p><div class="qh-backup-actions"><button class="qh-button qh-save" data-action="backup-export">导出备份</button><button class="qh-button qh-secondary" data-action="backup-import">导入恢复</button></div><input type="file" id="quote-backup-file" accept=".json,application/json" hidden></section></details>
    </header>
    <main class="qh-main"><section class="qh-overview" aria-label="报价概况"><p class="qh-tagline">专业报价，传递公司价值</p><dl class="qh-stats"><div><dt>全部报价</dt><dd>${all.length}</dd></div><div><dt>本月新增</dt><dd>${monthCount}</dd></div><div><dt>产品项目</dt><dd>${productCount}</dd></div></dl></section>
      <p class="qh-storage-note">仅存本机，未云同步<span>请定期备份</span></p>
      <div class="qh-toolbar"><div class="qh-search">${homeIcon('search')}<input type="search" id="search" value="${esc(store.keyword)}" placeholder="搜索单号、客户、产品" aria-label="搜索报价：单号、客户、产品" autocomplete="off" enterkeyhint="search"><button type="button" id="home-clear" data-home-clear aria-label="清空搜索" ${store.keyword?'':'hidden'}>${homeIcon('close')}</button></div><button class="qh-button qh-primary qh-desktop-create" data-action="create">${homeIcon('plus')}新建报价</button></div>
      <div class="qh-list-heading"><h2>报价记录</h2><p id="home-result-count" role="status" aria-live="polite">${resultLabel}</p></div>
      <section id="home-results" class="qh-list" aria-label="报价记录">${cards}</section>
    </main>
    <div class="qh-mobile-dock"><button class="qh-button qh-primary" data-action="create">${homeIcon('plus')}新建报价</button></div>
  </div>`;
};
document.addEventListener('click',event=>{
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
