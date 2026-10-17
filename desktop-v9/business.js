(() => {
  'use strict';

  const svg = {
    dashboard:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13h6V4H4v9Zm10 7h6V11h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z"/></svg>',
    quote:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></svg>',
    history:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6M12 8v4l3 2"/></svg>',
    deal:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h5M8 16h3"/><path d="m15 15 1.5 1.5L20 13"/></svg>'
  };

  function setBrand() {
    const brand = document.querySelector('.sidebar-brand');
    if (brand) brand.innerHTML = '<span class="brand-seal">ZH</span><span class="brand-text">中禾报价<small>QUOTATION DESK</small></span>';
    const items = {
      dashboard:['工作台',svg.dashboard],
      'quote-new':['新建报价',svg.quote],
      quotes:['报价记录',svg.history],
      deals:['成交订单',svg.deal]
    };
    Object.entries(items).forEach(([page,[label,icon]]) => {
      const item = document.querySelector(`.nav-item[data-page="${page}"]`);
      if (!item) return;
      const iconBox = item.querySelector('.icon');
      const text = item.querySelector('.label');
      if (iconBox) iconBox.innerHTML = icon;
      if (text) text.textContent = label;
      item.setAttribute('title',label);
    });
    document.querySelector('.nav-item[data-page="customers"]')?.remove();
    const footer = document.querySelector('.sidebar-footer');
    if (footer) footer.textContent = 'V9 · 本地数据兼容';
  }

  function cleanHeadings() {
    const names = {
      'page-dashboard':'工作台',
      'page-quote-new':'新建报价',
      'page-quotes':'报价记录',
      'page-deals':'成交订单'
    };
    Object.entries(names).forEach(([id,name]) => {
      const heading = document.querySelector(`#${id} > .page-header h2`);
      if (!heading) return;
      const small = heading.querySelector('small');
      heading.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
      });
      heading.insertBefore(document.createTextNode(name),small || null);
    });
  }

  function addCommandBar() {
    const header = document.querySelector('#page-quote-new > .page-header');
    const actions = header?.querySelector('.actions');
    if (!actions || actions.querySelector('.business-command-group')) return;
    const group = document.createElement('div');
    group.className = 'business-command-group';
    group.innerHTML = `
      <span class="business-save-state">本地自动保存</span>
      <button type="button" class="btn btn-outline btn-sm" data-business-preview>预览报价单</button>
      <button type="button" class="btn btn-primary btn-sm" data-business-save>保存报价单</button>`;
    group.querySelector('[data-business-preview]').addEventListener('click',() => window.previewQuote?.());
    group.querySelector('[data-business-save]').addEventListener('click',() => window.saveQuote?.());
    actions.prepend(group);
    const reset = actions.querySelector('button[onclick*="resetQuoteForm"]');
    if (reset) reset.textContent = '清空内容';
  }

  function createWorkspace() {
    const page = document.getElementById('page-quote-new');
    const header = page?.querySelector(':scope > .page-header');
    if (!page || !header || page.querySelector(':scope > .quote-workspace')) return;
    const cards = [...page.children].filter(el => el.classList.contains('card'));
    if (cards.length < 2) return;

    const workspace = document.createElement('div');
    workspace.className = 'quote-workspace';
    const rail = document.createElement('aside');
    rail.className = 'quote-rail';
    rail.innerHTML = '<h3>产品清单</h3><div class="quote-rail-list"></div>';
    const core = document.createElement('div');
    core.className = 'quote-core';
    cards.forEach(card => core.append(card));
    const summary = document.createElement('aside');
    summary.className = 'quote-summary';
    summary.innerHTML = `
      <h3>报价摘要</h3>
      <div class="quote-summary-body">
        <div class="quote-summary-label">当前报价金额</div>
        <div class="quote-summary-total">¥0.00</div>
        <div class="quote-summary-stat"><span>产品</span><strong data-products>0 项</strong></div>
        <div class="quote-summary-stat"><span>数量档位</span><strong data-tiers>0 个</strong></div>
        <div class="quote-summary-stat"><span>资料完整度</span><strong data-completion>0%</strong></div>
        <div class="quote-summary-actions">
          <button type="button" class="btn btn-primary" data-summary-save>保存报价单</button>
          <button type="button" class="btn btn-outline" data-summary-preview>预览报价单</button>
        </div>
      </div>`;
    summary.querySelector('[data-summary-save]').addEventListener('click',() => window.saveQuote?.());
    summary.querySelector('[data-summary-preview]').addEventListener('click',() => window.previewQuote?.());
    workspace.append(rail,core,summary);
    header.after(workspace);
  }

  function getQuoteItems() {
    try { return Array.isArray(quoteItems) ? quoteItems : []; }
    catch (_) { return []; }
  }

  function syncWorkspace() {
    const items = getQuoteItems();
    const list = document.querySelector('.quote-rail-list');
    if (list) {
      list.replaceChildren();
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'quote-rail-item';
        empty.textContent = '尚未添加产品';
        list.append(empty);
      }
      items.forEach((item,index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `quote-rail-item${index === 0 ? ' is-active' : ''}`;
        button.innerHTML = `${index + 1}. ${item.name || item.category || '未命名产品'}<small>${item.quantity || 0} PCS · ¥${Number(item.price || 0).toFixed(2)}</small>`;
        button.addEventListener('click',() => {
          document.querySelectorAll('.quote-rail-item').forEach(el => el.classList.remove('is-active'));
          button.classList.add('is-active');
          document.querySelectorAll('#quoteItemsBody>tr[data-quote-index]')[index]?.scrollIntoView({behavior:'smooth',block:'center'});
        });
        list.append(button);
      });
    }

    const total = document.getElementById('quoteTotalDisplay')?.textContent || '¥0.00';
    const totalNode = document.querySelector('.quote-summary-total');
    if (totalNode) totalNode.textContent = total;
    const products = document.querySelector('[data-products]');
    const tiers = document.querySelector('[data-tiers]');
    const completion = document.querySelector('[data-completion]');
    if (products) products.textContent = `${items.length} 项`;
    if (tiers) tiers.textContent = `${items.reduce((sum,item) => sum + 1 + (item.quantityTiers?.length || 0),0)} 个`;
    if (completion) {
      const fields = items.flatMap(item => [item.name,item.material,item.spec,item.process,item.quantity,item.price,item.leadTime,item.packing]);
      const customerFields = ['quoteCustomerType','quoteIdType','quoteIdNumber','quoteDate'].map(id => document.getElementById(id)?.value);
      const values = [...customerFields,...fields];
      const filled = values.filter(value => value !== '' && value !== null && value !== undefined && value !== 0).length;
      completion.textContent = `${values.length ? Math.round(filled / values.length * 100) : 0}%`;
    }
  }

  function bindDynamicRendering() {
    if (typeof window.renderQuoteItems === 'function' && !window.renderQuoteItems.__businessWrapped) {
      const original = window.renderQuoteItems;
      const wrapped = function(...args) {
        const result = original.apply(this,args);
        requestAnimationFrame(syncWorkspace);
        return result;
      };
      wrapped.__businessWrapped = true;
      window.renderQuoteItems = wrapped;
    }
    const total = document.getElementById('quoteTotalDisplay');
    if (total) new MutationObserver(syncWorkspace).observe(total,{childList:true,subtree:true,characterData:true});
    document.getElementById('page-quote-new')?.addEventListener('input',() => requestAnimationFrame(syncWorkspace));
    document.getElementById('page-quote-new')?.addEventListener('change',() => requestAnimationFrame(syncWorkspace));
  }

  function removeRepeatedPreviewImages() {
    const rows = [...document.querySelectorAll('#quoteDetailContent .preview-table tbody tr:not(.total-row)')];
    const firstRowBySource = new Map();
    rows.forEach((row,rowIndex) => {
      const cell = row.cells[2];
      if (!cell) return;
      const images = [...cell.querySelectorAll('img')];
      const duplicateAcrossRows = images.length > 0 && images.every(image => {
        const previous = firstRowBySource.get(image.src);
        if (previous === undefined) {
          firstRowBySource.set(image.src,rowIndex);
          return false;
        }
        return previous !== rowIndex;
      });
      if (duplicateAcrossRows) {
        cell.replaceChildren();
        const reference = document.createElement('span');
        reference.className = 'shared-image-reference';
        reference.textContent = '同款设计图';
        cell.append(reference);
      }
    });
  }

  function bindPreviewRendering() {
    if (typeof window.renderPreviewContent !== 'function' || window.renderPreviewContent.__businessWrapped) return;
    const original = window.renderPreviewContent;
    const wrapped = function(...args) {
      const result = original.apply(this,args);
      requestAnimationFrame(removeRepeatedPreviewImages);
      return result;
    };
    wrapped.__businessWrapped = true;
    window.renderPreviewContent = wrapped;
  }

  function refineCopy() {
    const customerTitle = document.querySelector('#page-quote-new .quote-core>.card:first-child .card-title');
    if (customerTitle) customerTitle.firstChild.textContent = '报价信息';
    const productTitle = document.querySelector('#page-quote-new .quote-core>.card:nth-child(2) .card-title>span');
    if (productTitle) productTitle.textContent = '产品与价格方案';
    const dashboardTitle = document.querySelector('#page-dashboard>.page-header h2 small');
    if (dashboardTitle) dashboardTitle.textContent = '最近 30 天业务概览';
    const dealShortcut = document.querySelector('#page-dashboard button[onclick="navigateTo(\'deals\')"]');
    if (dealShortcut) dealShortcut.textContent = '成交数据';
    const saveStatus = document.getElementById('erpSaveStatus');
    if (saveStatus && saveStatus.textContent.trim() === '本地数据') saveStatus.textContent = '本机数据已连接';
  }

  function bindHistoryFilters() {
    const fields = ['filterCustId','filterProductName','filterDateStart','filterDateEnd']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    fields.forEach(field => field.addEventListener('keydown',event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      window.applyQuoteFilters?.();
    }));
  }

  setBrand();
  cleanHeadings();
  addCommandBar();
  createWorkspace();
  refineCopy();
  bindDynamicRendering();
  bindPreviewRendering();
  bindHistoryFilters();
  syncWorkspace();
})();
