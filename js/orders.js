/* Pedidos: nenhuma informação de cliente é armazenada no navegador. */
(() => {
  const el = id => document.getElementById(id);
  const money = value => Number(value).toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statuses = ['Novo','Em aprovação','Em produção','Pronto','Entregue','Cancelado'];
  let cart = [], orders = [], generation = 0, submitting = false, requestId = null;
  const fabric = el('order-fabric'), model = el('order-model'), size = el('order-size');
  const option = () => ORDER_OPTIONS.find(o => o.id === model.value);
  fabric.innerHTML = [...new Set(ORDER_OPTIONS.map(o => o.tecido))].map(v => `<option>${escape(v)}</option>`).join('');
  function updateModels() {
    model.innerHTML = ORDER_OPTIONS.filter(o => o.tecido === fabric.value).map(o => `<option value="${o.id}">${escape(o.modelo)}</option>`).join('');
    updateSizes();
  }
  function updateSizes() {
    const selected = option();
    size.innerHTML = selected.tamanhos.map(v => `<option>${escape(v)}</option>`).join('');
    el('order-unit-price').textContent = `Preço de referência por peça: ${money(selected.preco)}`;
    const white = selected.modelo.endsWith('branca');
    el('order-color').readOnly = white;
    el('order-color').value = white ? 'Branca' : '';
  }
  function totals() {
    const quantity = cart.reduce((n,i) => n + i.quantity,0);
    const subtotal = cart.reduce((n,i) => n + i.quantity * Math.round(i.unit_price * 100),0);
    const discount = quantity > 10 ? Math.round(subtotal * .18) : 0;
    return {quantity,subtotal,discount,total:subtotal-discount};
  }
  function renderCart() {
    el('order-cart').innerHTML = cart.length ? cart.map((i,index) => `<div class="order-cart-item"><div><strong>${escape(i.fabric)} · ${escape(i.model)}</strong><p>${i.quantity} × ${escape(i.size)} · ${escape(i.color)} · Estampa ${escape(i.print)}</p><p>${money(i.quantity*i.unit_price)}</p></div><button type="button" class="btn btn-outline" data-remove="${index}" aria-label="Remover item ${index+1}">Remover</button></div>`).join('') : '<p class="order-empty">Adicione as peças para montar seu pedido.</p>';
    el('order-cart').querySelectorAll('[data-remove]').forEach(b => b.onclick = () => {cart.splice(Number(b.dataset.remove),1); renderCart();});
    const t = totals();
    el('order-total').textContent = `${t.quantity} peça(s) · Estimativa: ${money(t.total/100)}${t.discount ? ` · Desconto de 18%: ${money(t.discount/100)}` : ''}`;
  }
  fabric.onchange = updateModels; model.onchange = updateSizes;
  el('add-order-item').onclick = () => {
    if (submitting) return;
    const qty = Number(el('order-quantity').value), color = el('order-color').value.trim();
    if (!Number.isInteger(qty) || qty < 1 || qty > 500 || totals().quantity + qty > 500 || !color || color.length > 80 || cart.length >= 50) {
      el('order-feedback').textContent = 'Informe a cor e uma quantidade inteira. Limite: 500 peças e 50 itens por pedido.'; return;
    }
    const o = option();
    cart.push({option_id:o.id,fabric:o.tecido,model:o.modelo,size:size.value,color,print:el('order-print').value,quantity:qty,unit_price:o.preco});
    el('order-feedback').textContent = ''; renderCart();
  };
  el('order-form').onsubmit = async event => {
    event.preventDefault();
    if (submitting) return;
    const name = el('order-name').value.trim(), phone = el('order-phone').value.replace(/\D/g,'');
    if (!cart.length || name.length < 2 || !/^\d{10,15}$/.test(phone)) {
      el('order-feedback').textContent = 'Adicione ao menos uma peça, seu nome e um WhatsApp válido com DDD.'; return;
    }
    submitting = true;
    requestId ||= crypto.randomUUID();
    const controls = [...el('order-form').querySelectorAll('input,select,textarea,button')];
    const payload = {request_id:requestId,customer_name:name,phone,delivery:el('order-delivery').value,payment:el('order-payment').value,notes:el('order-notes').value.trim(),items:cart.map(({option_id,size,color,print,quantity}) => ({option_id,size,color,print,quantity}))};
    controls.forEach(c => c.disabled = true);
    el('order-feedback').textContent = 'Registrando pedido...';
    try {
      const {data,error} = await getClient().rpc('submit_order',{payload});
      if (error || !data) throw error || new Error('Sem confirmação');
      el('order-feedback').textContent = `Pedido registrado! Código: ${data}. Aguarde o contato da loja para confirmar a arte, as cores e o orçamento.`;
      cart = []; requestId = null; renderCart(); el('order-form').reset(); updateModels();
    } catch (error) {
      el('order-feedback').textContent = 'Não foi possível confirmar o registro. As escolhas foram mantidas para tentar novamente sem duplicação. Se persistir, fale com a loja.';
    } finally {
      controls.forEach(c => c.disabled = Boolean(requestId));
      el('submit-order').disabled = false; submitting = false;
    }
  };
  function clearOrders() {
    generation++; orders = [];
    el('orders-list').replaceChildren(); el('order-metrics').replaceChildren(); el('orders-feedback').textContent = '';
    el('order-search').value = ''; el('order-status-filter').value = '';
  }
  async function loadOrders() {
    if (!isLoggedIn) { clearOrders(); return; }
    const current = ++generation;
    el('orders-feedback').textContent = 'Carregando pedidos...';
    try {
      const {data,error} = await getClient().from('orders').select('*').order('created_at',{ascending:false});
      if (current !== generation || !isLoggedIn) return;
      if (error) throw error;
      orders = data || []; el('orders-feedback').textContent = ''; renderOrders();
    } catch (error) {
      if (current !== generation || !isLoggedIn) return;
      orders = []; el('orders-list').replaceChildren(); el('order-metrics').replaceChildren();
      el('orders-feedback').textContent = 'Não foi possível carregar os pedidos. Verifique a conexão, a migração do banco e sua permissão de administrador.';
    }
  }
  function renderOrders() {
    if (!isLoggedIn) {clearOrders();return;}
    const active = orders.filter(o => o.status !== 'Cancelado');
    const metrics = [['Pedidos',orders.length],['Em andamento',active.filter(o => o.status !== 'Entregue').length],['Peças',active.reduce((n,o) => n+o.quantity,0)],['Valor estimado',money(active.reduce((n,o) => n+Number(o.total),0))]];
    el('order-metrics').innerHTML = metrics.map(([label,value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    const query = el('order-search').value.trim().toLocaleLowerCase('pt-BR'), status = el('order-status-filter').value;
    const visible = orders.filter(o => (!status || o.status === status) && `${o.id} ${o.customer_name} ${o.phone}`.toLocaleLowerCase('pt-BR').includes(query));
    el('orders-list').innerHTML = visible.length ? visible.map(o => `<article class="order-record"><div class="orders-heading"><div><h4>${escape(o.customer_name)}</h4><p class="order-code">${escape(o.id)}</p><p>${escape(new Date(o.created_at).toLocaleString('pt-BR'))} · ${escape(o.phone)}</p></div><label>Status<select data-order-id="${escape(o.id)}">${statuses.map(s => `<option${s===o.status?' selected':''}>${s}</option>`).join('')}</select></label></div><div class="order-table-wrap"><table><caption>Opções escolhidas</caption><thead><tr><th>Peça</th><th>Tamanho</th><th>Cor</th><th>Estampa</th><th>Qtd.</th><th>Unitário</th></tr></thead><tbody>${o.items.map(i => `<tr><td>${escape(i.fabric)} · ${escape(i.model)}</td><td>${escape(i.size)}</td><td>${escape(i.color)}</td><td>${escape(i.print)}</td><td>${Number(i.quantity)}</td><td>${money(i.unit_price)}</td></tr>`).join('')}</tbody></table></div><p>${escape(o.delivery)} · ${escape(o.payment)}</p>${o.notes?`<p class="order-notes"><strong>Personalização:</strong> ${escape(o.notes)}</p>`:''}<p>Subtotal ${money(o.subtotal)} · Desconto ${money(o.discount)} · <strong>Estimativa ${money(o.total)}</strong></p></article>`).join('') : '<p class="order-empty">Nenhum pedido encontrado.</p>';
    el('orders-list').querySelectorAll('[data-order-id]').forEach(select => select.onchange = async () => {
      const id = select.dataset.orderId, previous = orders.find(o => o.id === id).status, next = select.value, current = generation;
      select.disabled = true;
      try {
        const {data,error} = await getClient().from('orders').update({status:next}).eq('id',id).eq('status',previous).select('id');
        if (current !== generation || !isLoggedIn) return;
        if (error || !data?.length) throw error || new Error('Pedido alterado ou acesso revogado');
        orders.find(o => o.id === id).status = next;
        el('orders-feedback').textContent = 'Status atualizado.'; renderOrders();
      } catch(error) {
        if (current !== generation || !isLoggedIn) return;
        select.value = previous; select.disabled = false;
        el('orders-feedback').textContent = 'Não foi possível atualizar. Recarregue os pedidos e tente novamente.';
      }
    });
  }
  document.addEventListener('admin-login',loadOrders);
  document.addEventListener('admin-logout',clearOrders);
  el('refresh-orders').onclick = loadOrders;
  el('order-search').oninput = renderOrders; el('order-status-filter').onchange = renderOrders;
  // Oculta e elimina dados privados imediatamente ao perder a sessão.
  if (_supabase) getClient().auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') {
      isLoggedIn = false; sessionUser = null; clearOrders();
      adminPanel.classList.remove('show'); adminLoginDiv.style.display = 'block';
    }
  });
  updateModels(); renderCart();
})();
