const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  const nodes = new Map(), events = new Map(), calls = [];
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      value: '', textContent: '', disabled: false, readOnly: false,
      set innerHTML(value) {
        this.html = value;
        const match = value.match(/<option(?: value="([^"]*)")?[^>]*>([^<]*)<\/option>/);
        if (match) this.value = match[1] ?? match[2];
      },
      get innerHTML() {return this.html || '';},
      querySelectorAll() {return [];}, replaceChildren() {this.html='';}, reset() {},
      classList: {remove() {}}, style: {}
    });
    return nodes.get(id);
  }
  const client = {rpc: async (name,args) => {calls.push({name,args});return {data:'order-uuid',error:null};},
    auth:{onAuthStateChange(fn) {this.callback=fn;}},
    from() {return {select() {return {order:async()=>({data:[],error:null})};}};}};
  const context = {products:[{id:'produto-1',nome:'Camiseta personalizada',categoria:'Unissex',preco:69.3,cores:['Preta','Branca'],tamanhos:['P','M'],ativo:true}],document:{getElementById:node,addEventListener:(name,fn)=>events.set(name,fn)},
    crypto: {randomUUID:()=> 'request-uuid'},getClient:()=>client,_supabase:client,isLoggedIn:false,sessionUser:null,
    adminPanel:node('panel'),adminLoginDiv:node('login')};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('js/orders.js','utf8'),context);
  node('order-print').value='8 × 8 cm'; node('order-quantity').value='1';
  node('order-delivery').value='Retirada agendada';node('order-payment').value='Pix';
  return {node,context,client,events,calls,
    add(qty) {node('order-color').value='Preta';node('order-quantity').value=String(qty);node('add-order-item').onclick();},
    async submit() {node('order-name').value='Cliente de teste';node('order-phone').value='(41) 99999-9999';await node('order-form').onsubmit({preventDefault(){}});}};
}
test('catálogo vazio não permite adicionar pedidos',()=>{
 const t=setup(); t.context.products=[]; t.events.get('products-updated')();
 assert.equal(t.node('add-order-item').disabled,true);
 t.add(1); assert.match(t.node('order-total').textContent,/0 peça/);
});
test('10 peças sem desconto; 11 peças com desconto de 18%',()=>{
  const t=setup();t.add(10);assert.match(t.node('order-total').textContent,/693,00/);assert.doesNotMatch(t.node('order-total').textContent,/Desconto/);
  t.add(1);assert.match(t.node('order-total').textContent,/625,09/);assert.match(t.node('order-total').textContent,/137,21/);
});
test('recusa quantidade fracionada, negativa e acima do limite',()=>{
  for(const qty of [1.5,-1,501]) {const t=setup();t.add(qty);assert.match(t.node('order-total').textContent,/0 peça/);}
  const t=setup();t.add(500);t.add(1);assert.match(t.node('order-total').textContent,/500 peça/);
});
test('cores e tamanhos acompanham as opções definidas no produto',()=>{
 const t=setup(); t.context.products[0].cores=['Azul']; t.context.products[0].tamanhos=['GG'];
 t.events.get('products-updated')(); assert.equal(t.node('order-color').value,'Azul'); assert.equal(t.node('order-size').value,'GG');
 t.add(1); assert.match(t.node('order-total').textContent,/0 peça/);
});
test('envia somente escolhas; preço e total são calculados pelo banco',async()=>{
  const t=setup();t.add(2);await t.submit();assert.equal(t.calls.length,1);assert.equal(t.calls[0].name,'submit_product_order');
  const p=t.calls[0].args.payload;assert.equal(p.phone,'41999999999');assert.equal(p.items[0].quantity,2);assert.equal(p.items[0].unit_price,undefined);assert.equal(p.total,undefined);
  assert.match(t.node('order-feedback').textContent,/Pedido registrado/);assert.match(t.node('order-total').textContent,/0 peça/);
});
test('falha preserva carrinho e reaproveita identificador ao reenviar',async()=>{
  const t=setup();t.add(1);let requests=[];
  t.client.rpc=async(name,{payload})=>{requests.push(payload.request_id);return requests.length===1?{error:new Error('offline')}:{data:'order-uuid'};};
  await t.submit();assert.match(t.node('order-feedback').textContent,/Não foi possível/);assert.match(t.node('order-total').textContent,/1 peça/);
  await t.submit();assert.equal(requests[0],requests[1]);assert.match(t.node('order-feedback').textContent,/Pedido registrado/);
});
test('pedido vazio e telefone inválido não são enviados',async()=>{
  const t=setup();await t.submit();assert.equal(t.calls.length,0);
  t.add(1);t.node('order-name').value='Teste';t.node('order-phone').value='123';await t.node('order-form').onsubmit({preventDefault(){}});assert.equal(t.calls.length,0);
});
test('logout limpa dados e resposta atrasada não repopula painel',async()=>{
  const t=setup();t.context.isLoggedIn=true;let release;
  t.client.from=()=>({select:()=>({order:()=>new Promise(resolve=>release=resolve)})});
  const loading=t.events.get('admin-login')();
  t.client.auth.callback('SIGNED_OUT');
  release({data:[{customer_name:'Privado'}],error:null});await loading;
  assert.equal(t.node('orders-list').innerHTML,'');assert.equal(t.node('order-metrics').innerHTML,'');assert.equal(t.context.isLoggedIn,false);
});
test('nomes de produtos são escapados ao renderizar o carrinho',()=>{
 const t=setup();t.context.products[0].nome='<img src=x onerror=alert(1)>';t.add(1);
 assert.ok(t.node('order-cart').innerHTML.includes('&lt;img'));assert.ok(!t.node('order-cart').innerHTML.includes('<img'));
});
test('produto removido do catálogo é removido do carrinho',()=>{
 const t=setup();t.add(2);t.context.products=[];t.events.get('products-updated')();
 assert.match(t.node('order-total').textContent,/0 peça/);
});
