const q6Money=v=>money(v);
const q6Value=(p,key)=>p[key]||'-';
renderDetailV2=function(){
  const q=(store.state?.quotes||[]).find(x=>String(x.id)===String(store.id));
  if(!q){store.view='list';return render()}
  const clientSource=q.customerSource==='其他自定义'?(q.customCustomerSource||q.customerSource):q.customerSource||'未填写';
  const products=(q.products||[]).map((p,i)=>{
    const process=[...(p.processes?.forming||[]),...(p.processes?.coloring||[]),...(p.processes?.surface||[])].join('、')||'未填写';
    const rows=[['材质',p.material==='其他自定义'?(p.customMaterial||p.material):p.material||'未填写'],['尺寸',p.size||'未填写'],['工艺',process],['电镀',joinCustom(p.processes?.plating,p.customPlating,'其他自定义输入')],['配件',joinCustom(p.accessories,p.customAccessory)],['包装',joinCustom(p.packaging,p.customPackaging)],['工期',p.leadTime||'待确认']];
    if(p.packingEnabled==='有')rows.push(['产品克重',q6Value(p,'productWeight')],['箱规',q6Value(p,'boxSpec')],['装箱数量',`${q6Value(p,'packingQuantity')} PCS`],['装箱重量',`毛重 ${q6Value(p,'grossWeight')} KG / 净重 ${q6Value(p,'netWeight')} KG`]);
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
  const quoteDate=document.querySelector('input[name="quoteDate"]'),validUntil=document.querySelector('input[name="validUntil"]');
  if(!quoteDate||!validUntil)return;
  const presets=[0,30,60,90],diff=q6DateDiff(quoteDate.value,validUntil.value),selected=presets.includes(diff)?diff:30,field=validUntil.closest('.field');
  field.innerHTML=`<label>报价有效期</label><select name="validityDays" aria-label="报价有效期">${presets.map(days=>`<option value="${days}" ${days===selected?'selected':''}>${days===0?'当天':days+'天'}</option>`).join('')}</select><input type="hidden" name="validUntil" value="${esc(validUntil.value)}"><small class="validity-hint">有效期至 ${esc(validUntil.value)}</small>`;
  const preset=field.querySelector('select[name="validityDays"]'),hidden=field.querySelector('input[name="validUntil"]'),hint=field.querySelector('.validity-hint');
  const sync=()=>{hidden.value=q6AddDays(quoteDate.value,preset.value);hint.textContent=`有效期至 ${hidden.value}`};
  quoteDate.addEventListener('change',sync);preset.addEventListener('change',sync);sync();
};
if(store.state)render();
