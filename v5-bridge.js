const renderDetailV4=renderDetailV2;
renderDetailV2=function(){
  renderDetailV4();
  const q=(store.state?.quotes||[]).find(x=>String(x.id)===String(store.id));
  if(!q)return;
  document.querySelectorAll('.doc-product').forEach((section,i)=>{
    const p=(q.products||[])[i];if(!p)return;
    const process=[...(p.processes?.forming||[]),...(p.processes?.coloring||[]),...(p.processes?.surface||[])].join('、')||'未填写';
    const rows=[['材质',p.material==='其他自定义'?(p.customMaterial||p.material):p.material||'未填写'],['尺寸',p.size||'未填写'],['工艺',process],['电镀',joinCustom(p.processes?.plating,p.customPlating,'其他自定义输入')],['配件',joinCustom(p.accessories,p.customAccessory)],['包装',joinCustom(p.packaging,p.customPackaging)],['工期',p.leadTime||'待确认']];
    if(p.packingEnabled==='有')rows.push(['产品克重',p.productWeight||'-'],['箱规',p.boxSpec||'-'],['装箱数量',`${p.packingQuantity||'-'} PCS`],['装箱重量',`毛重 ${p.grossWeight||'-'} KG / 净重 ${p.netWeight||'-'} KG`]);
    const head=section.querySelector('.doc-product-title');if(head)head.innerHTML=`<div class="mini-product-title">${i+1}. ${esc(displayName(p))}</div>`;
    const specs=section.querySelector('.doc-specs');if(specs)specs.innerHTML=rows.map(([k,v])=>`<div><span>${esc(k)}：</span><b>${esc(v)}</b></div>`).join('');
    const priceHead=section.querySelector('.doc-price-head');if(priceHead)priceHead.innerHTML='<span>数量（PCS）</span><span>单价（元/PCS）</span><span>合计（含模具/版费）</span>';
    const extras=section.querySelector('.doc-extras');if(extras){const sample=extras.querySelector('.sample-important');if(sample)sample.innerHTML=`<div class="mini-sample-row five"><span>打样费</span><b>${money(p.sampleFee)}</b><span>下单可退</span><b>${esc(p.refundable||'否')}</b><strong>${p.refundable==='是'?money(p.refundAmount):''}</strong></div><div class="mini-sample-row"><span>打样工期</span><b>${esc(p.sampleLeadTime||'待确认')}</b></div><div class="mini-sample-row"><span>打样备注</span><b>${esc(p.sampleNote||'无')}</b></div>`;const packing=[...extras.children].find(el=>el!==sample);if(packing)packing.remove()}
  });
};

exportPng=async function(q){
  toast('正在按小程序版式生成报价图片…');
  const W=1400,M=116,CW=W-M*2,products=q.products||[],probe=document.createElement('canvas').getContext('2d');
  const font=(s,w='400')=>`${w} ${s}px "PingFang SC","Microsoft YaHei",sans-serif`;
  const wrap=(v,max,size=22,weight='500')=>{probe.font=font(size,weight);const out=[];let row='';for(const ch of String(v||'未填写')){const n=row+ch;if(row&&probe.measureText(n).width>max){out.push(row);row=ch}else row=n}if(row)out.push(row);return out.length?out:['未填写']};
  const process=p=>[...(p.processes?.forming||[]),...(p.processes?.coloring||[]),...(p.processes?.surface||[])].join('、')||'未填写';
  const specs=p=>{const r=[['材质',p.material==='其他自定义'?(p.customMaterial||p.material):p.material||'未填写'],['尺寸',p.size||'未填写'],['工艺',process(p)],['电镀',joinCustom(p.processes?.plating,p.customPlating,'其他自定义输入')],['配件',joinCustom(p.accessories,p.customAccessory)],['包装',joinCustom(p.packaging,p.customPackaging)],['工期',p.leadTime||'待确认']];if(p.packingEnabled==='有')r.push(['产品克重',p.productWeight||'-'],['箱规',p.boxSpec||'-'],['装箱数量',`${p.packingQuantity||'-'} PCS`],['装箱重量',`毛重 ${p.grossWeight||'-'} KG / 净重 ${p.netWeight||'-'} KG`]);return r};
  const rowH=v=>Math.max(56,wrap(v,CW-210,22,'600').length*31+25);
  const pHeight=p=>80+specs(p).reduce((n,[,v])=>n+rowH(v),0)+18+54+Math.max(1,(p.prices||[]).length)*62+56+56+(p.sample==='有'?168:0)+34;
  const H=350+products.reduce((n,p)=>n+pHeight(p),0)+78,canvas=document.createElement('canvas');canvas.width=W;canvas.height=Math.min(H,28000);const x=canvas.getContext('2d');
  const rect=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};const line=(a,b,c,d,color='#dce8e3',width=1)=>{x.strokeStyle=color;x.lineWidth=width;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()};
  const text=(v,a,b,s=22,c='#173a32',w='400',align='left')=>{x.font=font(s,w);x.fillStyle=c;x.textAlign=align;x.textBaseline='alphabetic';x.fillText(String(v??''),a,b)};
  const paragraph=(v,a,b,max,s=22,c='#173a32',w='600',lh=31)=>wrap(v,max,s,w).forEach((r,i)=>text(r,a,b+i*lh,s,c,w));
  const pair=(label,value,x0,y0,width)=>{text(label+'：',x0,y0,18,'#71847d','600');let fs=22;x.font=font(fs,'700');while(fs>16&&x.measureText(String(value)).width>width-140){fs--;x.font=font(fs,'700')}text(value,x0+140,y0,fs,'#173a32','700')};
  rect(0,0,W,canvas.height,'#fff');
  let logo=null;try{logo=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src='./company-logo.jpg'})}catch{}
  if(logo)x.drawImage(logo,29,179,520,220,M,42,220,93);
  text('温州市中禾工艺品有限公司',M+244,82,32,'#12372f','800');text('源头大厂 · 专注行业三十余年 · 品质保证',M+244,119,17,'#61766f','600');text('产品报价单',W-M,91,34,'#12372f','800','right');text('QUOTATION',W-M,121,15,'#9a7840','800','right');line(M,158,W-M,158,'#176b57',3);
  const half=CW/2;pair('报价单号',q.number||'-',M,201,half);pair('有效期至',q.validUntil||'-',M+half,201,half);pair('客户名称',q.customer||'-',M,252,half);pair('客户来源',q.customerSource==='其他自定义'?(q.customCustomerSource||q.customerSource):q.customerSource||'-',M+half,252,half);pair('报价联系人',q.contact||'-',M,303,half);pair('电话/微信',q.phoneWechat||'-',M+half,303,half);
  let y=350;
  products.forEach((p,pi)=>{
    rect(M,y,CW,62,'#196a57');text(`${pi+1}. ${displayName(p)||'未命名产品'}`,M+26,y+41,23,'#fff','800');y+=80;
    specs(p).forEach(([k,v],i)=>{const h=rowH(v);rect(M,y,CW,h,i%2?'#fff':'#eaf5f0');text(k+'：',M+26,y+37,18,'#6d817a','600');paragraph(v,M+170,y+38,CW-195,22,'#173a32','650',31);line(M,y+h,W-M,y+h,'#dfeae6',1);y+=h});
    y+=18;rect(M,y,CW,54,'#e1f0ea');text('数量（PCS）',M+30,y+35,18,'#315f54','800');text('单价（元/PCS）',M+430,y+35,18,'#315f54','800');text('合计（含模具/版费）',W-M-28,y+35,18,'#315f54','800','right');y+=54;
    const prs=(p.prices||[]).length?p.prices:[{quantity:'-',unitPrice:''}];prs.forEach(r=>{rect(M,y,CW,62,'#fff');text(r.quantity||'-',M+30,y+40,21,'#173a32','600');text(money(r.unitPrice),M+430,y+40,21,'#173a32','600');text(money(Number(r.quantity||0)*Number(r.unitPrice||0)+Number(p.mouldFee||0)),W-M-28,y+40,22,'#0c5545','800','right');line(M,y+62,W-M,y+62,'#e2ebe7',1);y+=62});
    rect(M,y,CW,56,'#eaf5f0');text('模具/版费：',M+28,y+37,18,'#315f54','800');text(money(p.mouldFee),M+190,y+37,21,'#0d5948','800');y+=56;
    rect(M,y,CW,56,'#eaf5f0');text('报价备注：',M+28,y+37,18,'#315f54','800');text(p.noteOption==='其他自定义'?(p.customNote||'无'):p.noteOption||'无',M+190,y+37,20,'#173a32','650');y+=56;
    if(p.sample==='有'){
      rect(M,y,CW,56,'#eaf5f0');text('打样费',M+28,y+37,18,'#315f54','800');text(money(p.sampleFee),M+190,y+37,21,'#0d5948','800');text('下单可退',M+500,y+37,18,'#315f54','800');text(p.refundable||'否',M+650,y+37,20,'#173a32','700');if(p.refundable==='是')text(money(p.refundAmount),W-M-28,y+37,20,'#b64e44','800','right');y+=56;
      rect(M,y,CW,56,'#eaf5f0');text('打样工期',M+28,y+37,18,'#315f54','800');text(p.sampleLeadTime||'待确认',M+190,y+37,20,'#173a32','650');y+=56;
      rect(M,y,CW,56,'#eaf5f0');text('打样备注',M+28,y+37,18,'#315f54','800');text(p.sampleNote||'无',M+190,y+37,20,'#173a32','650');y+=56;
    }
    line(M,y+10,W-M,y+10,'#176b57',1);y+=34;
  });
  text('温州市中禾工艺品有限公司 · 本报价以最终确认的规格、数量、工艺和样品为准',W/2,canvas.height-28,16,'#6b7d77','500','center');
  canvas.toBlob(blob=>{if(!blob)return toast('图片生成失败');const a=document.createElement('a'),url=URL.createObjectURL(blob);a.download=`${q.number||'报价单'}-中禾报价.png`;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('小程序风格报价图片已保存')},'image/png',1)
};

if(store.state)render();
