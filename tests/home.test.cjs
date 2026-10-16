const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const handlers = {};
let pageWrites = 0;
const nodes = {
  '#app': { set innerHTML(value) { pageWrites++; this.html = value; } },
  '#home-results': { innerHTML: '' },
  '#home-result-count': { textContent: '' },
  '#home-clear': { hidden: true }
};
const context = {
  store: { view: 'list', keyword: '', state: null },
  document: {
    addEventListener(name, handler) { (handlers[name] ||= []).push(handler); },
    querySelector(selector) { return nodes[selector] || null; }
  },
  esc: value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])),
  today: () => '2026-10-16',
  displayName: product => product.customName || product.name,
  render() { throw Error('Should not render before loading state'); }
};
vm.createContext(context);
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
vm.runInContext(app.slice(app.indexOf('const composingSearchInputs'), app.indexOf("document.addEventListener('change'")), context);
vm.runInContext(fs.readFileSync(path.join(root, 'home.js'), 'utf8'), context);
const quotes = [
  { id: 'a', number: 'Q1', customer: '中禾客户', contact: '周先生', products: [{ name: '徽章', prices: [{ quantity: 1000, unitPrice: 2.5 }] }] },
  { id: 'b', number: 'Q2', customer: '测试客户', products: [{ name: '其他金属制品', customName: '定制纪念牌', prices: [] }] }
];
context.store.state = { quotes };
const saved = JSON.stringify(quotes);
context.renderList();
assert.equal(pageWrites, 1);
assert(nodes['#app'].html.includes('quote-backup-file'));
assert(nodes['#app'].html.includes('data-action="backup-export"'));
assert(nodes['#app'].html.includes('data-action="delete"'));
const emit = (type, target, extra = {}) => handlers[type][0]({ target, ...extra });
const search = { id: 'search', value: '' };
emit('compositionstart', search);
search.value = 'zhong';
emit('input', search, { isComposing: true });
assert.equal(context.store.keyword, '');
search.value = '中禾';
emit('compositionend', search);
assert(nodes['#home-results'].innerHTML.includes('中禾客户'));
assert(!nodes['#home-results'].innerHTML.includes('测试客户'));
assert.equal(nodes['#home-result-count'].textContent, '找到 1 条报价');
for (const value of ['Q2', '定制纪念牌']) {
  search.value = value; emit('input', search);
  assert(nodes['#home-results'].innerHTML.includes('测试客户'));
}
search.value = '不存在'; emit('input', search);
assert(nodes['#home-results'].innerHTML.includes('没有找到相关报价'));
search.value = ''; emit('input', search);
assert.equal(nodes['#home-clear'].hidden, true);
assert(nodes['#home-results'].innerHTML.includes('中禾客户'));
assert.equal(pageWrites, 1, 'search must never rebuild the page/input');
assert.equal(JSON.stringify(quotes), saved, 'rendering/search must not mutate saved data');
const unsafe = context.homeQuoteCard({ id: '" onfocus="x', customer: '<script>x</script>', products: [] });
assert(!unsafe.includes('<script>'));
assert(!unsafe.includes('id="" onfocus'));
context.store.state = { quotes: [] };
context.renderList();
assert(nodes['#app'].html.includes('从第一份报价开始'));
console.log('PASS: IME, Chinese/custom-product search, clearing, no matches, empty data, escaping, immutable records and stable input render');
