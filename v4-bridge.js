const renderDetailV3=renderDetailV2;
renderDetailV2=function(){
  renderDetailV3();
  const logo=document.querySelector('.doc-logo');
  if(logo)logo.innerHTML='<img src="./company-logo.jpg" alt="中禾 Logo">';
  const slogan=document.querySelector('.doc-company p');
  if(slogan)slogan.textContent='源头大厂 · 专注行业三十余年 · 品质保证';
  const client=document.querySelector('.doc-client');
  if(client){const fields=[...client.children].slice(1),byLabel=label=>fields.find(el=>el.querySelector('span')?.textContent.trim()===label);['客户名称','报价联系人','客户来源','电话 / 微信'].forEach(label=>{const el=byLabel(label);if(el)client.appendChild(el)})}
  document.querySelectorAll('.doc-specs span').forEach(el=>{el.textContent=el.textContent.replace(/[：:]$/,'')+'：'});
  document.querySelectorAll('.sample-important small').forEach(el=>el.textContent='打样费用');
  const footer=document.querySelector('.doc-footer p');
  if(footer)footer.textContent='本报价以最终确认的规格、数量、工艺和样品为准；原材料价格波动可能影响最终成交价。';
};

exportPng=async function(q){
  toast('正在生成专业报价图片…');
  const W=1400,M=90,CW=W-M*2,products=q.products||[],probe=document.createElement('canvas').getContext('2d');
  const font=(size,weight='400')=>`${weight} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
  const wrap=(value,maxWidth,size=22,weight='500')=>{probe.font=font(size,weight);const rows=[];let row='';for(const ch of String(value||'未填写')){if(ch==='\n'){rows.push(row||' ');row='';continue}const next=row+ch;if(row&&probe.measureText(next).width>maxWidth){rows.push(row);row=ch}else row=next}if(row)rows.push(row);return rows.length?rows:['未填写']};
  const processes=p=>[...(p.processes?.forming||[]),...(p.processes?.coloring||[]),...(p.processes?.surface||[]),...(p.processes?.plating||[])].join('、')||'未填写';
  const specRows=p=>[['材质',p.material==='其他自定义'?(p.customMaterial||p.material):p.material||'未填写'],['尺寸规格',p.size||'未填写'],['生产工艺',processes(p)],['配件配置',joinCustom(p.accessories,p.customAccessory)],['包装方式',joinCustom(p.packaging,p.customPackaging)],['预计工期',p.leadTime||'待确认']];
  const specHeight=v=>Math.max(64,wrap(v,CW-210,22,'600').length*32+26);
  const itemHeight=p=>{const note=p.noteOption==='其他自定义'?(p.customNote||'无'):p.noteOption||'无';return 96+specRows(p).reduce((n,[,v])=>n+specHeight(v),0)+22+56+Math.max(1,(p.prices||[]).length)*68+66+Math.max(70,wrap(note,CW-210,21,'600').length*31+30)+(p.packingEnabled==='有'?90:0)+(p.sample==='有'?126:0)+40};
  const H=530+products.reduce((n,p)=>n+itemHeight(p),0)+150,canvas=document.createElement('canvas');canvas.width=W;canvas.height=Math.min(H,28000);const x=canvas.getContext('2d');
  const rect=(a,b,w,h,color,r=0)=>{x.fillStyle=color;if(r&&x.roundRect){x.beginPath();x.roundRect(a,b,w,h,r);x.fill()}else x.fillRect(a,b,w,h)};
  const line=(a,b,c,d,color='#dfe6e2',width=1)=>{x.strokeStyle=color;x.lineWidth=width;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()};
  const text=(v,a,b,size=22,color='#183b33',weight='400',align='left')=>{x.font=font(size,weight);x.fillStyle=color;x.textAlign=align;x.textBaseline='alphabetic';x.fillText(String(v??''),a,b)};
  const paragraph=(v,a,b,maxWidth,size=22,color='#183b33',weight='500',lh=32)=>{const rows=wrap(v,maxWidth,size,weight);rows.forEach((row,i)=>text(row,a,b+i*lh,size,color,weight));return rows.length};
  const fitText=(v,a,b,maxWidth,size=22,min=15,color='#183b33',weight='700')=>{let s=size;x.font=font(s,weight);while(s>min&&x.measureText(String(v)).width>maxWidth){s--;x.font=font(s,weight)}text(v,a,b,s,color,weight)};
  const spaced=(v,a,b,targetWidth,size=14,color='#98783f',weight='700')=>{const cs=[...String(v)];x.font=font(size,weight);const base=cs.reduce((n,ch)=>n+x.measureText(ch).width,0),gap=cs.length>1?Math.max(0,(targetWidth-base)/(cs.length-1)):0;x.fillStyle=color;x.textAlign='left';let xx=a;cs.forEach(ch=>{x.fillText(ch,xx,b);xx+=x.measureText(ch).width+gap})};
  const drawLabel=(v,a,b,target=92)=>{const cs=[...String(v)],size=17;x.font=font(size,'700');const base=cs.reduce((n,ch)=>n+x.measureText(ch).width,0),gap=cs.length>1?Math.max(0,(target-base)/(cs.length-1)):0;x.fillStyle='#61776f';x.textAlign='left';let xx=a;cs.forEach(ch=>{x.fillText(ch,xx,b);xx+=x.measureText(ch).width+gap});text('：',a+target+6,b,size,'#61776f','700')};
  rect(0,0,W,canvas.height,'#eeeae1');rect(22,22,W-44,canvas.height-44,'#fff');
  let logo=null;try{logo=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='./company-logo.jpg'})}catch{}
  if(logo)x.drawImage(logo,40,193,205,196,M,68,112,107);else{rect(M,68,112,107,'#0b493c',18);text('中禾',M+56,132,28,'#fff','800','center')}
  const hx=M+136;text('温州市中禾工艺品有限公司',hx,105,38,'#102f29','800');spaced('WENZHOU ZHONGHE CRAFTS CO., LTD.',hx,140,540,14,'#98783f','750');text('源头大厂 · 专注行业三十余年 · 品质保证',hx,174,17,'#765d30','700');
  text('QUOTATION',W-M,104,17,'#98783f','800','right');text('产品报价单',W-M,147,34,'#102f29','800','right');line(M,205,W-M,205,'#315d52',2);line(M,214,W-M,214,'#c0a161',1);
  const sy=242,cell=(CW-20)/3;[['报价单号',q.number||'-'],['报价日期',q.quoteDate||'-'],['有效期至',q.validUntil||'-']].forEach(([k,v],i)=>{const sx=M+i*(cell+10);rect(sx,sy,cell,80,'#f5f7f5',5);text(k,sx+18,sy+27,15,'#6d817a','700');fitText(v,sx+18,sy+60,cell-36,22,16,'#173a32','750')});
  const cy=346;rect(M,cy,CW,142,'#edf5f1',8);rect(M,cy,164,142,'#0b493c',8);text('CLIENT',M+28,cy+48,14,'#c4d5cf','800');text('客户信息',M+28,cy+90,25,'#fff','800');const dx=M+188,dw=(CW-188)/2;
  const client=[['客户名称',q.customer||'-'],['报价联系人',q.contact||'-'],['客户来源',q.customerSource==='其他自定义'?(q.customCustomerSource||q.customerSource):q.customerSource||'-'],['电话 / 微信',q.phoneWechat||'-']];client.forEach(([k,v],i)=>{const col=i%2,row=Math.floor(i/2),sx=dx+col*dw,yy=cy+44+row*58;text(k+'：',sx,yy,15,'#6c8079','700');fitText(v,sx+124,yy,dw-145,20,14,'#173a32','750');if(col===0)line(sx+dw-14,cy+16,sx+dw-14,cy+126,'#d7e5df',1)});
  let y=530;
  products.forEach((p,index)=>{
    rect(M,y,CW,72,'#0b493c',7);rect(M,y,76,72,'#bc9448',7);text(String(index+1).padStart(2,'0'),M+38,y+46,23,'#fff','900','center');text('PRODUCT ITEM',M+100,y+25,12,'#bfd1cb','750');text(displayName(p)||'未命名产品',M+100,y+54,25,'#fff','800');y+=96;
    specRows(p).forEach(([k,v],i)=>{const rh=specHeight(v);rect(M,y,CW,rh,i%2?'#fbfcfb':'#f3f7f5');drawLabel(k,M+24,y+39,92);paragraph(v,M+166,y+39,CW-190,22,'#173a32','650',32);line(M,y+rh,W-M,y+rh,'#e2e8e5',1);y+=rh});
    y+=22;rect(M,y,CW,56,'#e7f1ec',6);text('数量阶梯',M+28,y+36,17,'#41675d','800');text('含税单价',M+448,y+36,17,'#41675d','800');text('报价合计（含模具 / 版费）',W-M-26,y+36,17,'#41675d','800','right');y+=56;
    const prs=(p.prices||[]).length?p.prices:[{quantity:'-',unitPrice:''}];prs.forEach((r,i)=>{rect(M,y,CW,68,i%2?'#fbfcfb':'#fff');text(`${String(i+1).padStart(2,'0')}   ${r.quantity||'-'} PCS`,M+28,y+43,21,'#173a32','650');text(`${money(r.unitPrice)} / PCS`,M+448,y+43,21,'#173a32','650');text(money(Number(r.quantity||0)*Number(r.unitPrice||0)+Number(p.mouldFee||0)),W-M-26,y+44,23,'#0b493c','850','right');line(M,y+68,W-M,y+68,'#e4eae7',1);y+=68});
    rect(M,y,CW,66,'#faf5e9');text('模具 / 版费：',M+26,y+41,18,'#745b2c','750');text(money(p.mouldFee),W-M-26,y+43,23,'#60491f','850','right');y+=66;
    const note=p.noteOption==='其他自定义'?(p.customNote||'无'):p.noteOption||'无',nh=Math.max(70,wrap(note,CW-210,21,'600').length*31+30);rect(M,y,CW,nh,'#fffaf0');text('报价说明：',M+26,y+39,18,'#745b2c','750');paragraph(note,M+166,y+39,CW-195,21,'#403d35','650',31);line(M,y+nh,W-M,y+nh,'#eadfc8',1);y+=nh;
    if(p.packingEnabled==='有'){rect(M,y,CW,86,'#f2f5f3',6);text('装箱信息：',M+26,y+32,17,'#60756d','750');text(`箱规 ${p.boxSpec||'-'}　·　${p.packingQuantity||'-'} PCS / 箱`,M+166,y+32,19,'#173a32','700');text(`产品克重 ${p.productWeight||'-'}　·　毛重 ${p.grossWeight||'-'} KG　·　净重 ${p.netWeight||'-'} KG`,M+166,y+65,18,'#4c625a','650');y+=90}
    if(p.sample==='有'){rect(M,y,CW,118,'#fbf4e5',8);rect(M,y,7,118,'#bc9448',4);text('打样报价',M+26,y+37,18,'#735722','800');text(money(p.sampleFee),M+166,y+41,29,'#0b493c','900');text(`打样工期 ${p.sampleLeadTime||'待确认'}`,M+380,y+38,18,'#173a32','750');text(p.refundable==='是'?`下单可退 ${money(p.refundAmount)}`:'下单不退',W-M-26,y+38,18,'#173a32','750','right');line(M+26,y+59,W-M-26,y+59,'#e5d5b3',1);text('打样说明：',M+26,y+91,17,'#735f38','750');paragraph(p.sampleNote||'无打样备注',M+166,y+91,CW-195,19,'#465851','650',28);y+=126}
    line(M,y,W-M,y,'#c2a363',1);y+=40;
  });
  const fy=canvas.height-116;rect(M,fy,CW,82,'#edf4f1',7);text('本报价以最终确认的规格、数量、工艺和样品为准；原材料价格波动可能影响最终成交价。',M+28,fy+49,17,'#344d46','600');text('中禾工艺',W-M-28,fy+38,23,'#183b33','800','right');text('ZHONGHE CRAFTS',W-M-28,fy+62,11,'#70827c','700','right');
  canvas.toBlob(blob=>{if(!blob)return toast('图片生成失败');const a=document.createElement('a'),url=URL.createObjectURL(blob);a.download=`${q.number||'报价单'}-中禾工艺产品报价.png`;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('专业产品报价图片已保存')},'image/png',1)
};

if(store.state)render();