// Quote-only workspace: no account layer, no workflow status, no destructive actions.
store.mode='demo';
localStorage.setItem('zhq_mode','demo');

topbar=function(title='报价工作台',back=false){
  return `<header class="topbar">${back?'<button class="icon-btn" data-action="back" aria-label="返回">←</button>':'<div class="brandmark">中</div>'}<div class="brandcopy"><strong>${esc(title)}</strong><small>ZHONGHE QUOTE STUDIO</small></div><span class="company-badge">中禾工艺</span></header>`
};

renderList=function({resultsOnly=false}={}){
  const all=store.state?.quotes||[],k=store.keyword.trim().toLowerCase();
  const list=all.filter(q=>!k||[q.number,q.customer,q.contact,...(q.products||[]).flatMap(p=>[p.name,p.customName])].join(' ').toLowerCase().includes(k)).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  const month=today().slice(0,7),monthCount=all.filter(q=>String(q.quoteDate||'').startsWith(month)).length,productCount=all.reduce((n,q)=>n+(q.products||[]).length,0);
  const cards=list.map(q=>{const products=q.products||[],pc=products.reduce((n,p)=>n+(p.prices||[]).length,0);return `<article class="quote-card" data-open="${esc(q.id)}"><div class="card-top"><div><div class="quote-no">${esc(q.number)}</div><div class="customer">${esc(q.customer||'客户未填写')}</div></div><span class="pill ordered">已保存</span></div><div class="products">${esc(products.map(displayName).filter(Boolean).join('、')||'产品未填写')}</div><div class="meta"><span>报价 ${esc(q.quoteDate||'未填写')} · 有效期 ${esc(q.validUntil||'未填写')}</span><span>${products.length} 个产品 · ${pc} 档价格</span></div><div class="card-actions"><button class="secondary" data-action="edit" data-id="${q.id}">修改</button><button class="ghost" data-action="duplicate" data-id="${q.id}">复制</button><button class="primary" data-action="export" data-id="${q.id}">保存图片</button></div></article>`}).join('');
  if(resultsOnly&&document.querySelector('.quote-list')){
    document.querySelector('.quote-list').innerHTML=cards||'<div class="empty">暂无符合条件的报价</div>';
    return;
  }
  document.querySelector('#app').innerHTML=shell(`<section class="hero quote-only-hero"><div class="hero-eyebrow">ZHONGHE QUOTATION</div><h1>专业报价，传递公司价值</h1><p>专注报价制作与客户版图片输出，资料保存在当前设备，打开即可使用。</p><div class="stats"><div class="stat"><b>${all.length}</b><span>报价档案</span></div><div class="stat"><b>${monthCount}</b><span>本月新增</span></div><div class="stat"><b>${productCount}</b><span>产品项目</span></div></div></section><div class="workspace-note">无需登录 · 本机保存 · 一键生成客户版图片</div><div class="toolbar"><label class="search">⌕<input id="search" value="${esc(store.keyword)}" placeholder="搜索单号、客户、产品"></label><button class="primary" data-action="create">＋ 新建报价</button></div><section class="quote-list">${cards||'<div class="empty">暂无报价，点击“新建报价”开始制作</div>'}</section><button class="fab" data-action="create">＋ 新建报价</button>`,'报价工作台')
};

const renderEditBase=renderEdit;
renderEdit=function(){
  renderEditBase();
  const status=document.querySelector('select[name="status"]');
  if(status)status.closest('.field')?.remove();
  const intro=document.querySelector('.page-head p');
  if(intro)intro.textContent='填写客户、工艺与阶梯价格，保存后即可生成正式报价图片';
};

const renderDetailBase=renderDetailV2;
renderDetailV2=function(){
  renderDetailBase();
  const q=(store.state?.quotes||[]).find(x=>String(x.id)===String(store.id));
  const cells=document.querySelectorAll('.doc-summary > div');
  if(cells[1]&&q)cells[1].outerHTML=`<div class="summary-products"><span>产品项目</span><b>${(q.products||[]).length} 项</b></div>`;
  const company=document.querySelector('.doc-company');
  if(company){const slogan=company.querySelector('p');if(slogan)slogan.textContent='源头大厂，专注行业三十余年'}
  const docTitle=document.querySelector('.doc-type b');
  if(docTitle)docTitle.textContent='产品报价单';
  document.querySelectorAll('.doc-lead').forEach(el=>el.remove());
  document.querySelectorAll('.doc-extras > div').forEach(el=>{if(el.querySelector('small')?.textContent.includes('打样')){el.classList.add('sample-important');el.querySelector('small').textContent='打样报价'}});
  ['status','print','delete'].forEach(name=>document.querySelector(`[data-action="${name}"]`)?.remove());
  const dock=document.querySelector('.action-dock');
  if(dock){dock.classList.add('quote-only');const exp=dock.querySelector('[data-action="export"]');if(exp)exp.textContent='保存为报价图片'}
  const doc=document.querySelector('.quote-document');
  if(doc)doc.insertAdjacentHTML('afterend','<div class="export-note">客户版图片采用独立商务版式生成，长规格、工艺说明和多档价格会自动换行排版。</div>');
};

exportPng=function(q){
  const W=1400,M=82,CW=W-M*2,products=q.products||[],canvas=document.createElement('canvas'),probe=canvas.getContext('2d');
  const font=(size,weight='400')=>`${weight} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
  const lines=(value,maxWidth,size=24,weight='500')=>{probe.font=font(size,weight);const out=[];let row='';for(const ch of String(value||'未填写')){if(ch==='\n'){out.push(row||' ');row='';continue}const next=row+ch;if(row&&probe.measureText(next).width>maxWidth){out.push(row);row=ch}else row=next}if(row)out.push(row);return out.length?out:['未填写']};
  const process=p=>[...(p.processes?.forming||[]),...(p.processes?.coloring||[]),...(p.processes?.surface||[]),...(p.processes?.plating||[])].join('、')||'未填写';
  const specs=p=>[['材质',p.material==='其他自定义'?(p.customMaterial||p.material):p.material||'未填写'],['尺寸规格',p.size||'未填写'],['生产工艺',process(p)],['配件配置',joinCustom(p.accessories,p.customAccessory)],['包装方式',joinCustom(p.packaging,p.customPackaging)],['预计工期',p.leadTime||'待确认']];
  const productHeight=p=>{let h=86+24;for(const [,v] of specs(p))h+=Math.max(62,lines(v,CW-230,23,'600').length*34+28);h+=22+58+Math.max(1,(p.prices||[]).length)*70+70;const note=p.noteOption==='其他自定义'?(p.customNote||'无'):p.noteOption||'无';h+=Math.max(74,lines(note,CW-220,21,'600').length*31+34);if(p.packingEnabled==='有')h+=86;if(p.sample==='有')h+=112;return h+42};
  const productHeights=products.map(productHeight),H=Math.min(28000,610+productHeights.reduce((a,b)=>a+b,0)+190);
  canvas.width=W;canvas.height=H;const x=canvas.getContext('2d');
  const rect=(a,b,w,h,color,r=0)=>{x.fillStyle=color;if(r&&x.roundRect){x.beginPath();x.roundRect(a,b,w,h,r);x.fill()}else x.fillRect(a,b,w,h)};
  const rule=(a,b,c,d,color='#dfe6e2',width=1)=>{x.strokeStyle=color;x.lineWidth=width;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()};
  const text=(v,a,b,size=24,color='#163a32',weight='400',align='left')=>{x.font=font(size,weight);x.fillStyle=color;x.textAlign=align;x.textBaseline='alphabetic';x.fillText(String(v??''),a,b)};
  const spacedText=(v,a,b,targetWidth,size=16,color='#a07d3d',weight='700')=>{const s=String(v),chars=[...s];x.font=font(size,weight);const base=chars.reduce((n,ch)=>n+x.measureText(ch).width,0),gap=chars.length>1?Math.max(0,(targetWidth-base)/(chars.length-1)):0;x.fillStyle=color;x.textAlign='left';x.textBaseline='alphabetic';let xx=a;chars.forEach(ch=>{x.fillText(ch,xx,b);xx+=x.measureText(ch).width+gap})};
  const paragraph=(v,a,b,maxWidth,size=23,color='#163a32',weight='500',lh=34)=>{const ls=lines(v,maxWidth,size,weight);ls.forEach((s,i)=>text(s,a,b+i*lh,size,color,weight));return ls.length};
  rect(0,0,W,H,'#eeeae1');rect(24,24,W-48,H-48,'#fff');rect(24,24,W-48,18,'#083f35');
  rect(M,70,108,108,'#083f35',17);text('ZH',M+54,140,39,'#fff','900','center');
  text('温州市中禾工艺品有限公司',M+138,117,39,'#102f29','800');spacedText('WENZHOU ZHONGHE CRAFTS CO., LTD.',M+138,150,535,15,'#a07d3d','750');text('源头大厂，专注行业三十余年',M+138,180,18,'#806331','700');
  text('QUOTATION',W-M,107,18,'#a07d3d','800','right');text('产品报价单',W-M,151,35,'#102f29','800','right');rule(M,207,W-M,207,'#083f35',4);rule(M,217,W-M,217,'#c7a55f',2);
  const sy=250,cell=CW/3;[['报价单号',q.number||'-'],['报价日期',q.quoteDate||'-'],['有效期至',q.validUntil||'-']].forEach(([k,v],i)=>{const sx=M+i*cell;rect(sx,sy,cell-10,76,'#f7f8f6',5);text(k,sx+18,sy+26,15,'#788681','600');text(v,sx+18,sy+58,22,'#163a32','750')});
  const cy=352;rect(M,cy,CW,142,'#eff5f2',10);rect(M,cy,164,142,'#083f35',10);text('CLIENT',M+28,cy+48,15,'#bfd2cb','800');text('客户信息',M+28,cy+88,25,'#fff','800');
  const client=[['客户名称',q.customer||'-'],['客户来源',q.customerSource==='其他自定义'?(q.customCustomerSource||q.customerSource):q.customerSource||'-'],['报价联系人',q.contact||'-'],['电话 / 微信',q.phoneWechat||'-']];client.forEach(([k,v],i)=>{const col=i%2,row=Math.floor(i/2),sx=M+196+col*455,yy=cy+43+row*55;text(k,sx,yy,15,'#71817b','600');text(String(v).slice(0,23),sx+120,yy,20,'#163a32','700')});
  let y=540;
  products.forEach((p,index)=>{
    rect(M,y,CW,76,'#083f35',8);rect(M,y,78,76,'#bd9650',8);text(String(index+1).padStart(2,'0'),M+39,y+49,24,'#fff','900','center');text('PRODUCT ITEM',M+104,y+27,13,'#bdd1ca','700');text(displayName(p)||'未命名产品',M+104,y+57,26,'#fff','800');y+=100;
    specs(p).forEach(([k,v],ri)=>{const ls=lines(v,CW-230,23,'600'),rh=Math.max(62,ls.length*34+28);rect(M,y,CW,rh,ri%2?'#fbfcfb':'#f5f8f6');text(k,M+24,y+38,17,'#71817b','650');paragraph(v,M+174,y+38,CW-210,23,'#173a32','600',34);rule(M,y+rh,W-M,y+rh,'#e2e8e5',1);y+=rh});
    y+=22;rect(M,y,CW,58,'#e7f0ec',7);text('数量阶梯',M+28,y+37,17,'#41675d','800');text('含税单价',M+450,y+37,17,'#41675d','800');text('报价合计（含模具 / 版费）',W-M-26,y+37,17,'#41675d','800','right');y+=58;
    const priceRows=(p.prices||[]).length?p.prices:[{quantity:'-',unitPrice:''}];priceRows.forEach((r,ri)=>{rect(M,y,CW,70,ri%2?'#fbfcfb':'#fff');text(`${String(ri+1).padStart(2,'0')}   ${r.quantity||'-'} PCS`,M+28,y+44,21,'#163a32','650');text(`${money(r.unitPrice)} / PCS`,M+450,y+44,21,'#163a32','650');text(money(Number(r.quantity||0)*Number(r.unitPrice||0)+Number(p.mouldFee||0)),W-M-26,y+45,23,'#083f35','850','right');rule(M,y+70,W-M,y+70,'#e4eae7',1);y+=70});
    rect(M,y,CW,64,'#faf5e9');text('模具 / 版费',M+26,y+26,15,'#856a37','650');text(money(p.mouldFee),W-M-26,y+42,23,'#6b5228','850','right');y+=64;rule(M,y,W-M,y,'#eadfc8',1);
    const note=p.noteOption==='其他自定义'?(p.customNote||'无'):p.noteOption||'无',noteLines=lines(note,CW-220,21,'600'),nh=Math.max(70,noteLines.length*31+34);rect(M,y,CW,nh,'#fffaf0');text('报价说明',M+26,y+31,15,'#856a37','650');paragraph(note,M+174,y+34,CW-210,21,'#4d4638','650',31);y+=nh;
    if(p.packingEnabled==='有'){y+=12;rect(M,y,CW,74,'#f5f7f6',6);text('装箱信息',M+22,y+28,15,'#74827d','700');text(`${p.boxSpec||'-'} · ${p.packingQuantity||'-'} PCS / 箱 · 毛重 ${p.grossWeight||'-'} KG · 净重 ${p.netWeight||'-'} KG`,M+22,y+57,18,'#173a32','600');y+=74}
    if(p.sample==='有'){y+=14;rect(M,y,CW,96,'#f8f0dd',8);rect(M,y,8,96,'#bd9650',4);text('打样报价 · 重要',M+26,y+32,17,'#896827','800');text(money(p.sampleFee),M+220,y+33,25,'#083f35','900');text(`工期 ${p.sampleLeadTime||'待确认'}　·　${p.refundable==='是'?`下单可退 ${money(p.refundAmount)}`:'下单不退'}`,M+390,y+32,18,'#173a32','700');text(p.sampleNote||'无打样备注',M+26,y+70,18,'#4c5e58','600');y+=96}
    y+=28;rule(M,y,W-M,y,'#bd9650',2);y+=28;
  });
  const fy=H-150;rect(M,fy,CW,88,'#103a31',8);text('报价条款',M+28,fy+37,18,'#d7ba7d','800');paragraph('本报价以最终确认的规格、数量、工艺和样品为准；原材料价格波动可能影响最终成交价。',M+160,fy+37,CW-420,17,'#e5efeb','500',27);text('中禾工艺',W-M-28,fy+38,24,'#fff','800','right');text('ZHONGHE CRAFTS',W-M-28,fy+65,12,'#b7cbc5','700','right');
  canvas.toBlob(blob=>{if(!blob)return toast('图片生成失败');const a=document.createElement('a'),url=URL.createObjectURL(blob);a.download=`${q.number||'报价单'}-中禾工艺报价.png`;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('正式客户版报价图片已保存')},'image/png',1)
};

if(store.state)render();
