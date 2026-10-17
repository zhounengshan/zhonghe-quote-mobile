/* Additive presentation/shortcuts. Keep the original quote data and image handlers. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 window.quoteSaveNotice=message=>{
  let notice=$('quote-save-notice');if(!notice){notice=document.createElement('div');notice.id='quote-save-notice';notice.setAttribute('role','status');document.body.append(notice);}
  notice.textContent=message;notice.hidden=false;clearTimeout(window.quoteNoticeTimer);window.quoteNoticeTimer=setTimeout(()=>notice.hidden=true,6000);
 };
 window.confirmQuoteRevision=summary=>new Promise(resolve=>{
  if($('quote-revision-confirm')){resolve(false);return;}
  const active=document.activeElement,dialog=document.createElement('dialog');dialog.id='quote-revision-confirm';dialog.setAttribute('aria-labelledby','revision-confirm-title');
  const title=document.createElement('h3');title.id='revision-confirm-title';title.textContent='确认保存修改';
  const description=document.createElement('p');description.textContent='以下修改将保存到当前报价单，并记录修订历史。';
  const content=document.createElement('pre');content.textContent=summary;
  const actions=document.createElement('div');actions.className='revision-actions';
  const cancel=document.createElement('button');cancel.className='btn btn-outline';cancel.textContent='返回编辑';
  const confirm=document.createElement('button');confirm.className='btn btn-primary';confirm.textContent='确认保存';
  const finish=value=>{dialog.close();dialog.remove();active?.focus();resolve(value);};
  cancel.onclick=()=>finish(false);confirm.onclick=()=>finish(true);dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});
  actions.append(cancel,confirm);dialog.append(title,description,content,actions);document.body.append(dialog);dialog.showModal();cancel.focus();
 });
 const mobileOptions = {
  '成型工艺':['冲压','液压','压铸','浇筑','腐蚀','切割'],
  '上色工艺':['烤漆','珐琅','软珐琅','UV印刷','丝印','贴纸印刷','移印'],
  '表面处理':['滴胶','拉丝','保光','激光'],
  '电镀':['仿金','亮金','24K金','亮镍','黑镍','哑光黑镍','纯银','光亮铜','枪黑拉丝（仿古银）','古银','古金','青古铜','红古铜','铬','哑光金','哑光银','哑光镍','哑光铜','哑光漆','无'],
  '配件':['蝴蝶扣','橡胶扣','普通别针','安全别针','平底/圆头卡帽','长针','17mm磁扣','23mm大磁扣','U型脚','热转印挂绳','常规珠链','木底座','磁铁扣','钥匙圈+4节链','钥匙圈+8字扣','龙虾扣','狗扣','磁铁','软磁','无']
 };
 const materials=['锌合金','黄铜','纯铜','铁','铝','不锈钢','999纯银','999纯金'];
 const packaging=['OPP袋','OPP袋+纸卡','PVC袋','PVC+纸卡','PE展示盒','天地盖纸盒','塑料仿皮纸盒','木盒','三折木盒','塑料盒','马口铁盒','纸卡+塑膜','气泡袋','亚克力盒','普通翻盖纸盒','吸塑+纸卡','吸塑盒'];
 const boxSizes=['20×20×11','29.5×21×13','31×21×17.5','35×25×16','35×25×20','35×25×25','54×38×42.5'];
 // Render from structured fields too: older records may have packingDetails
 // without their generated text ever being merged into packing.
 const packingFields=[['productWeight','产品克重（g）'],['boxSpec','箱规（cm）'],['packingQuantity','装箱数量（PCS）'],['grossWeight','毛重（kg）'],['netWeight','净重（kg）']];
 function mergedPacking(item){
  if(!item.packingDetails)return item.packing||'';
  let base=String(item.packing||'');
  if(item.packingGeneratedBlock)base=base.replace(item.packingGeneratedBlock,'');
  const labels=packingFields.filter(([key])=>Object.hasOwn(item.packingDetails,key)).map(([,label])=>label);
  base=base.split('\n').filter(line=>!labels.some(label=>line.trim().startsWith(label+'：')||line.trim().startsWith(label+':'))).join('\n').trim();
  const lines=packingFields.filter(([key])=>String(item.packingDetails[key]??'').trim()).map(([key,label])=>label+'：'+item.packingDetails[key]);
  return [base,...lines].filter(Boolean).join('\n');
 }
 const buildOriginal=buildQuoteHTML;
 buildQuoteHTML=q=>{
  const multi=(q.items||[]).some(i=>i.quantityTiers?.length);
  const items=(q.items||[]).map(item=>({...item,packing:mergedPacking(item)}));
  const html=buildOriginal({...q,showTotal:multi?false:q.showTotal,remark:[q.remark,multi?'多数量报价：各档位为备选方案，金额不累加。':''].filter(Boolean).join('\n'),items});
  if(!multi)return html;
  const doc=document.createElement('div');doc.innerHTML=html;
  const rows=doc.querySelectorAll('.preview-table tbody tr');
  items.forEach((item,idx)=>{
   if(!item.quantityTiers?.length)return;
   const tiers=[item,...item.quantityTiers];
   const columns=[t=>String(t.quantity),t=>'¥'+Number(t.price||0).toFixed(2),t=>'¥'+Number(t.moldFee||0).toFixed(2),t=>'¥'+(Number(t.quantity||0)*Number(t.price||0)+Number(t.moldFee||0)).toFixed(2),t=>t.leadTime||'—'];
   columns.forEach((format,col)=>{
    const cell=rows[idx].cells[6+col];cell.replaceChildren();cell.classList.add('tier-values');
    tiers.forEach((tier,n)=>{const line=document.createElement('div');line.className='tier-value';line.textContent=format(tier);line.title='档位'+(n+1);cell.append(line);});
   });
  });
  return doc.innerHTML;
 };
 const saveOriginal=saveQuote;
 saveQuote=function(){
  for(const item of quoteItems)for(const tier of item.quantityTiers||[]){
   if(!Number.isInteger(Number(tier.quantity))||Number(tier.quantity)<=0||tier.price===''||tier.moldFee===''||!Number.isFinite(Number(tier.price))||Number(tier.price)<0||!Number.isFinite(Number(tier.moldFee))||Number(tier.moldFee)<0){window.quoteSaveNotice('请填写有效档位：数量为正整数，单价和模具费不得为负。');return;}
  }
  for(const item of quoteItems){
   item.packing=mergedPacking(item);
   if(item.packingDetails)item.packingGeneratedBlock=packingFields.filter(([key])=>String(item.packingDetails[key]??'').trim()).map(([key,label])=>label+'：'+item.packingDetails[key]).join('\n');
  }
  return saveOriginal();
 };
 function selector(label,values){
  const select=document.createElement('select');select.setAttribute('aria-label',label);
  for(const value of ['',...values]){const option=document.createElement('option');option.value=value;option.textContent=value||'选择'+label;select.append(option);}return select;
 }
 function commit(input){input.dispatchEvent(new Event('input',{bubbles:true}));}
 function appendSelector(input,label,values,container){
  const select=selector(label,values);container.append(select);
  select.addEventListener('change',()=>{if(!select.value)return;const value=label+'：'+select.value;
   if(!input.value.split('\n').includes(value)){input.value=[input.value.trim(),value].filter(Boolean).join('\n');commit(input);}
   select.value='';
  });
 }
 const columns = {name:1,material:3,spec:4,process:5,quantity:6,price:7,moldFee:8,leadTime:10,packing:11,remark:12};
 function updateTierSummary(){if(quoteItems.some(i=>i.quantityTiers?.length))$('quoteTotalDisplay').textContent='多数量备选 · 不累加';else $('quoteTotalDisplay').textContent='¥'+quoteItems.reduce((sum,i)=>sum+(Number(i.quantity)||0)*(Number(i.price)||0)+(Number(i.moldFee)||0),0).toFixed(2);}
 $('quoteItemsBody').addEventListener('input',updateTierSummary);
 function decorateTiers(row,item,idx){
  const cell=document.createElement('td');cell.className='quantity-tiers';cell.colSpan=14;row.append(cell);
  const heading=document.createElement('strong');heading.textContent='多数量报价';cell.append(heading);
  const hint=document.createElement('p');hint.textContent='上方数量为档位1；新增档位共用产品资料，各档金额不累加。';cell.append(hint);
  const list=document.createElement('div');cell.append(list);
  const draw=()=>{
   updateTierSummary();
   list.replaceChildren();
   (item.quantityTiers||[]).forEach((tier,n)=>{
    const line=document.createElement('div');line.className='quantity-tier-row';
    const title=document.createElement('span');title.textContent='档位'+(n+2);line.append(title);
    const subtotal=document.createElement('output');
    const update=()=>{subtotal.textContent='¥'+((Number(tier.quantity)||0)*(Number(tier.price)||0)+(Number(tier.moldFee)||0)).toFixed(2);};
    for(const [key,label] of [['quantity','数量'],['price','单价'],['moldFee','模具费'],['leadTime','工期']]){
     const wrap=document.createElement('label');wrap.textContent=label;
     const input=document.createElement('input');input.type=key==='leadTime'?'text':'number';input.value=tier[key]??'';
     input.setAttribute('aria-label',`产品${idx+1} 档位${n+2} ${label}`);
     if(key!=='leadTime'){input.min=key==='quantity'?'1':'0';input.step=key==='quantity'?'1':'0.01';}
     input.addEventListener('input',()=>{tier[key]=key==='leadTime'?input.value:input.value===''?'':Number(input.value);update();});wrap.append(input);line.append(wrap);
    }
    update();line.append(subtotal);
    const remove=document.createElement('button');remove.type='button';remove.className='btn btn-outline';remove.textContent='移除此档';remove.onclick=()=>{item.quantityTiers.splice(n,1);draw();};line.append(remove);list.append(line);
   });
  };
  const add=document.createElement('button');add.type='button';add.className='btn btn-outline';add.textContent='添加数量档位';
  add.onclick=()=>{(item.quantityTiers ||= []).push({quantity:'',price:item.price||0,moldFee:item.moldFee||0,leadTime:item.leadTime||''});draw();list.lastElementChild?.querySelector('input')?.focus();};cell.append(add);draw();
 }
 const labels = ['产品','品名','设计图 · 上传 / 粘贴','材质','规格 / 尺寸','工艺要求','数量（PCS）','单价（元）','模具费（元）','小计（元）','生产工期','包装要求','产品备注','操作'];
 function decoratePacking(){
  const list=$('sampleInfoContainer').querySelector('.sample-management-card > div:last-child');
  if(!list)return;
  list.classList.add('sample-packing-list');
  [...list.children].forEach((sample,idx)=>{
   const item=quoteItems[idx], data=item.packingDetails||{};
   const pair=document.createElement('div');pair.className='sample-packing-pair';sample.before(pair);pair.append(sample);sample.classList.add('sample-editor');
   const panel=document.createElement('section');panel.className='packing-editor';pair.append(panel);
   const title=document.createElement('h3');title.textContent=`${idx+1}. ${item.name||'未命名'} · 装箱数据`;panel.append(title);
   const hint=document.createElement('p');hint.textContent='选填；已填内容会逐行显示在报价单中，原有包装说明保留。';panel.append(hint);
   const grid=document.createElement('div');grid.className='packing-fields';panel.append(grid);
   const fields=[['productWeight','产品克重（g）'],['boxSpec','箱规（cm）'],['packingQuantity','装箱数量（PCS）'],['grossWeight','毛重（kg）'],['netWeight','净重（kg）']];
   const sync=()=>{
    const input=$('quoteItemsBody').querySelectorAll('tr[data-quote-index]')[idx].cells[11].querySelector('textarea');
    let base=input.value;
    if(item.packingGeneratedBlock&&base.includes(item.packingGeneratedBlock))base=base.replace(item.packingGeneratedBlock,'').trim();
    const lines=fields.filter(([key])=>String(data[key]||'').trim()).map(([key,label])=>label+'：'+data[key]);
    item.packingDetails={...data};item.packingGeneratedBlock=lines.join('\n');
    input.value=[base,item.packingGeneratedBlock].filter(Boolean).join('\n');commit(input);
   };
   for(const [key,label] of fields){
    const wrap=document.createElement('label');wrap.textContent=label;
    const input=document.createElement('input');input.type='text';input.value=data[key]||'';input.setAttribute('aria-label',`产品${idx+1} ${label}`);
    input.placeholder=key==='boxSpec'?'选择常用箱规或自填':'选填';
    if(key==='boxSpec'){
     const choose=selector(`产品${idx+1} 箱规选择（cm）`,[...boxSizes,'自定义']);
     choose.options[0].textContent='请选择箱规';choose.value=boxSizes.includes(input.value)?input.value:input.value?'自定义':'';
     input.hidden=choose.value!=='自定义';input.placeholder='输入长×宽×高';
     choose.addEventListener('change',()=>{input.hidden=choose.value!=='自定义';if(!input.hidden){input.focus();return;}input.value=choose.value;data[key]=choose.value;sync();});
     wrap.append(choose);
    }else input.inputMode=key==='packingQuantity'?'numeric':'decimal';
    input.addEventListener('input',()=>{data[key]=input.value;sync();});wrap.append(input);grid.append(wrap);
   }
  });
 }
 function decorateProducts() {
  const table = $('quoteItemsBody').closest('table'); table.classList.add('product-editor-table');
  for (const row of $('quoteItemsBody').querySelectorAll('tr[data-quote-index]')) {
   const idx = Number(row.dataset.quoteIndex), item = quoteItems[idx];
   [...row.cells].forEach((cell,i)=>cell.dataset.label=labels[i]);
   row.cells[0].textContent=`产品 ${idx+1} · ${item.category}`;
   const img = row.cells[2];
   img.querySelector('input[type=text]').placeholder='在这里粘贴图片（Ctrl / ⌘ V）';
   for (const [field,col] of Object.entries(columns)) {
    const input=row.cells[col].querySelector('input,textarea');
    if(input) input.setAttribute('aria-label',`产品${idx+1} ${labels[col]}`);
   }
   const material=row.cells[3].querySelector('input');
   const materialSelect=selector(`产品${idx+1} 材质选择`,[...materials,'其他自定义']);
   material.before(materialSelect);
   materialSelect.value=materials.includes(material.value)?material.value:material.value?'其他自定义':'';
   material.hidden=materialSelect.value!=='其他自定义';
   material.placeholder='填写自定义材质';
   materialSelect.addEventListener('change',()=>{material.hidden=materialSelect.value!=='其他自定义';if(!material.hidden){material.focus();return;}material.value=materialSelect.value;commit(material);});
   const process=row.cells[5].querySelector('textarea');
   const processControls=document.createElement('div');processControls.className='process-selectors';process.before(processControls);
   for(const [label,values] of Object.entries(mobileOptions))appendSelector(process,label,values,processControls);
   process.placeholder='选择后自动追加；特殊要求可直接修改';
   const packing=row.cells[11].querySelector('textarea');
   const packingControls=document.createElement('div');packingControls.className='packing-selectors';packing.before(packingControls);
   const packingSelect=selector(`产品${idx+1} 包装选择`,[...packaging,'自定义']);packingControls.append(packingSelect);
   const packingBase=()=>packing.value.replace(item.packingGeneratedBlock||'','').trim();
   const initialPacking=packingBase().replace(/^包装[：:]\s*/,'');
   packingSelect.value=packaging.includes(initialPacking)?initialPacking:initialPacking?'自定义':'';
   packing.hidden=packingSelect.value!=='自定义';packing.placeholder='填写自定义包装说明';
   let customPacking=packingBase();
   packingSelect.addEventListener('change',()=>{
    if(!packing.hidden)customPacking=packingBase();
    packing.hidden=packingSelect.value!=='自定义';
    const base=packing.hidden?(packingSelect.value?'包装：'+packingSelect.value:''):customPacking;
    packing.value=[base,item.packingGeneratedBlock].filter(Boolean).join('\n');commit(packing);
    if(!packing.hidden)packing.focus();
   });
   const lead=row.cells[10].querySelector('input');
   const leadSelect=selector(`产品${idx+1} 工期选择`,['7天左右','10天左右','15天左右','20天左右','30天左右','自定义']);
   lead.before(leadSelect);leadSelect.value=[...leadSelect.options].some(o=>o.value===lead.value)?lead.value:'自定义';
   lead.hidden=leadSelect.value!=='自定义';lead.placeholder='填写实际工期';
   leadSelect.addEventListener('change',()=>{lead.hidden=leadSelect.value!=='自定义';if(!lead.hidden){lead.focus();return;}lead.value=leadSelect.value;commit(lead);});
   const copy=document.createElement('button');copy.type='button';copy.className='btn btn-outline btn-xs';copy.textContent='复制产品';
   copy.addEventListener('click',()=>{quoteItems.splice(idx+1,0,JSON.parse(JSON.stringify(quoteItems[idx])));renderQuoteItems();});row.cells[13].prepend(copy);
   decorateTiers(row,item,idx);
  }
 }
 const renderOriginal=renderQuoteItems;
 renderQuoteItems=function(){renderOriginal();decorateProducts();decoratePacking();};
 // Native tab order includes Shift+Tab and can leave the last product normally.
 document.removeEventListener('keydown',handleQuoteTabNavigation,true);
 $('quoteItemsBody').addEventListener('keydown',e=>{if(e.key==='Tab')e.stopImmediatePropagation();},true);
 const originalNavigate=navigateTo;
 navigateTo=function(page){if(page==='customers')page='quote-new';originalNavigate(page);refreshContacts();};
 document.querySelector('[data-page=customers]')?.remove();
 document.querySelector('button[onclick="navigateTo(\'customers\')"]')?.remove();
 document.querySelector('.sidebar-footer').textContent='老版增强 · 图片与数据兼容';
 document.querySelector('[data-page=dashboard] .label').textContent='工作台';
 document.querySelector('[data-page=deals] .label').textContent='成交订单';
 const shortcuts=document.createElement('div');shortcuts.className='product-shortcuts';
 for(const category of ['徽章/胸牌','纪念币','奖牌/奖章','钥匙扣/挂件','冰箱贴','书签']) {
  const b=document.createElement('button');b.type='button';b.textContent='+ '+category;
  b.addEventListener('click',()=>{$('quoteProductCategory').value=category;addQuoteItem();});shortcuts.append(b);
 }
 const productCard=$('quoteItemsBody').closest('.card');productCard.querySelector('.table-wrap').before(shortcuts);
 const hint=document.createElement('p');hint.className='hint-line';hint.textContent='图片支持上传或粘贴。工艺、配件可连续添加；包装直接选择，特殊说明请选择“自定义”。';shortcuts.before(hint);
 productCard.querySelector('button[onclick="saveQuote()"]').parentElement.classList.add('quote-sticky-actions');
 const customerGrid=$('quoteCustomerType').closest('.form-grid');
 customerGrid.classList.add('customer-form-grid');
 for(const id of ['quoteCustomerType','quoteIdType','quoteIdNumber','quoteDate','quoteValidity','quoteFollowUp','quoteRemark','quoteShowTotal'])customerGrid.append($(id).closest('.form-group'));
 $('quoteRemark').closest('.form-group').classList.add('quote-remark-field');
 $('quoteShowTotal').closest('.form-group').classList.add('quote-total-field');
 const previewOriginal=previewQuote;
 previewQuote=function(){
  if(quoteItems.some(i=>(i.quantityTiers||[]).some(t=>!Number.isInteger(Number(t.quantity))||Number(t.quantity)<=0||t.price===''||t.moldFee===''||Number(t.price)<0||Number(t.moldFee)<0))){window.quoteSaveNotice('请先填写有效的档位数量、单价和模具费。');return;}
  previewOriginal();if(!$('quoteModal').classList.contains('show'))return;
  $('quoteModal').classList.add('draft-preview');
  $('quoteModal').querySelector('.modal-header h3').textContent='报价单预览 · 尚未保存';
 };
 const closeOriginal=closeModal;
 closeModal=function(id){closeOriginal(id);if(id==='quoteModal'){
  const modal=$(id);modal.classList.remove('draft-preview');modal.querySelector('.modal-header h3').textContent='报价单';
  modal.querySelectorAll('.modal-footer button').forEach(b=>b.style.display='');$('detailStatusSelect').style.display='';
 }};
 // Reset on every saved-quote opening, including after Escape/backdrop dismissal.
 const viewOriginal=viewQuote;
 viewQuote=function(id){
  const modal=$('quoteModal');modal.classList.remove('draft-preview');
  modal.querySelector('.modal-header h3').textContent='报价单';
  modal.querySelectorAll('.modal-footer button').forEach(b=>b.style.display='');
  $('detailStatusSelect').style.display='';viewOriginal(id);
 };
 // Searchable history suggestions do not introduce a separate customer workflow.
 const contactList=document.createElement('datalist');contactList.id='history-contact-options';document.body.append(contactList);$('quoteIdNumber').setAttribute('list',contactList.id);
 function refreshContacts(){
  const ids=[...new Set((DB.quotes||[]).map(q=>q.customerIdNumber).filter(Boolean))];
  contactList.replaceChildren(...ids.map(id=>{const o=document.createElement('option');o.value=id;return o;}));
 }
 $('quoteIdNumber').addEventListener('focus',refreshContacts);
 $('quoteIdNumber').addEventListener('change',()=>{
  const match=[...(DB.quotes||[])].reverse().find(q=>q.customerIdNumber===$('quoteIdNumber').value);
  if(match){$('quoteCustomerType').value=match.customerType||'';$('quoteIdType').value=match.customerIdType||'';}
 });
 document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&!$('page-quote-new').classList.contains('hidden')&&!document.querySelector('.modal-overlay.show,dialog[open]')&&$('authOverlay').style.display==='none'){e.preventDefault();saveQuote();}
 });
 decorateProducts();
})();
