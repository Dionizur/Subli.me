// ========================================================
// SUBLI.ME — JavaScript Principal
// ========================================================
// Depende de: supabase-config.js, supabase-service.js
// NÃO usa mais arquivos JSON locais — tudo via Supabase.
// ========================================================

// ===== CONFIGURAÇÕES =====
const CONFIG = {
  whatsapp: '5541988259550',
  placeholder: 'images/placeholder.svg',
  storageKey: 'sublime_session'
};

// ===== STATE =====
let products = [];
let isLoggedIn = false;
let sessionUser = null;

// ===== DOM HELPERS =====
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

// ===== DOM REFS =====
const sections = $$('.section');
const navLinks = $$('.nav-links a');
const hamburger = $('.hamburger');
const navLinksContainer = $('.nav-links');
const productsGrid = $('.products-grid');
const modalOverlay = $('.modal-overlay');
const modalContent = $('.modal-content');
const modalClose = $('.modal-close');

const adminLoginDiv = $('.admin-login');
const adminPanel = $('.admin-panel');
const adminEmailInput = $('#admin-email');
const adminPasswordInput = $('#admin-password');
const adminLoginBtn = $('#admin-login-btn');
const adminLoginError = $('#admin-login-error');
const adminEmailDisplay = $('#admin-email-display');
const adminLogoutBtn = $('#admin-logout-btn');
const adminForm = $('#admin-form');
const adminProductsList = $('.admin-products-list .products-list');

// ===== TOAST SYSTEM =====
function showToast(msg, type = 'info') {
  const existing = $('.toast');
  if (existing) existing.remove();

  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#433075'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; top: 90px; right: 24px; z-index: 9999;
    background: ${colors[type] || colors.info}; color: #fff;
    padding: 14px 24px; border-radius: 10px; font-weight: 600;
    font-size: 0.95rem; box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease; max-width: 400px;
    line-height: 1.4;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Add keyframe for toast animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// ===== NAVIGATION =====
function navigateTo(sectionId) {
  sections.forEach(s => s.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  const link = $(`.nav-links a[data-section="${sectionId}"]`);
  if (link) link.classList.add('active');
  navLinksContainer.classList.remove('open');
  hamburger.classList.remove('active');
  if (sectionId === 'admin' && !isLoggedIn) {
    adminPanel.classList.remove('show');
    adminLoginDiv.style.display = 'block';
    adminLoginError.style.display = 'none';
    adminEmailInput.value = '';
    adminPasswordInput.value = '';
  }
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.dataset.section);
  });
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinksContainer.classList.toggle('open');
});

// ===== IMAGE HELPERS =====
function getImageSrc(path) {
  if (!path || path === '') return CONFIG.placeholder;
  return path;
}

function getProductImages(p) {
  return p.imagens && Array.isArray(p.imagens) && p.imagens.length > 0
    ? p.imagens
    : [CONFIG.placeholder];
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
  showToast('🔄 Carregando produtos...', 'info');

  const data = await fetchProducts();
  if (data && data.length > 0) {
    products = data;
    showToast(`✅ ${products.length} produto(s) carregados!`, 'success');
  } else {
    products = [];
    showToast('📭 Nenhum produto encontrado no banco.', 'warning');
  }

  renderProducts();
  renderAdminProducts();
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  if (!productsGrid) return;
  if (products.length === 0) {
    productsGrid.innerHTML = `<div style="text-align:center;color:#999;grid-column:1/-1;padding:60px 0;">
      <p style="font-size:3rem;margin-bottom:16px;">👕</p>
      <p>Nenhum produto disponível no momento.</p>
      <p style="font-size:0.85rem;margin-top:8px;color:#bbb;">Volte em breve ou entre em contato pelo WhatsApp!</p>
    </div>`;
    return;
  }
  productsGrid.innerHTML = products.map(p => {
    const firstImg = getImageSrc(getProductImages(p)[0]);
    return `<div class="product-card" data-id="${p.id}">
      <img src="${firstImg}" alt="${p.nome}" loading="lazy" onerror="this.src='${CONFIG.placeholder}'">
      <div class="product-info">
        <div class="categoria">${p.categoria || 'Geral'}</div>
        <h3>${p.nome}</h3>
        <div class="preco">R$ ${parseFloat(p.preco).toFixed(2)}</div>
        <div class="tamanhos-mini">${(p.tamanhos || []).map(t => `<span>${t}</span>`).join('')}</div>
      </div>
    </div>`;
  }).join('');

  $$('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const product = products.find(p => p.id === id);
      if (product) openModal(product);
    });
  });
}

// ===== MODAL =====
function openModal(product) {
  if (!modalOverlay || !modalContent) return;

  const imgs = getProductImages(product);
  let modalImageIndex = 0;

  function renderModalImage() {
    const imgSrc = getImageSrc(imgs[modalImageIndex]);
    const hasMultiple = imgs.length > 1;

    let html = `<div class="modal-image"><div class="gallery-container">
      <img src="${imgSrc}" alt="${product.nome}" class="gallery-main-img" onerror="this.src='${CONFIG.placeholder}'">`;
    if (hasMultiple) {
      html += `<button class="gallery-nav gallery-prev" data-action="prev">‹</button>
        <button class="gallery-nav gallery-next" data-action="next">›</button>
        <div class="gallery-dots">${imgs.map((_, i) =>
          `<span class="gallery-dot ${i === modalImageIndex ? 'active' : ''}" data-index="${i}"></span>`
        ).join('')}</div>`;
    }
    html += `</div></div>
      <div class="modal-details">
        <div class="categoria">${product.categoria || 'Geral'}</div>
        <h2>${product.nome}</h2>
        <div class="preco-modal">R$ ${parseFloat(product.preco).toFixed(2)}</div>
        <p class="descricao">${product.descricao || ''}</p>
        <div class="tamanhos-title">Tamanhos disponíveis:</div>
        <div class="tamanhos-list">${(product.tamanhos || []).map(t =>
          `<span class="tamanho-item" data-tam="${t}">${t}</span>`
        ).join('')}</div>
        <button class="btn btn-whatsapp" id="modal-whatsapp-btn">📱 Encomendar via WhatsApp</button>
      </div>`;

    modalContent.innerHTML = html;

    if (hasMultiple) {
      $('[data-action="prev"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        modalImageIndex = (modalImageIndex - 1 + imgs.length) % imgs.length;
        renderModalImage();
      });
      $('[data-action="next"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        modalImageIndex = (modalImageIndex + 1) % imgs.length;
        renderModalImage();
      });
      $$('.gallery-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          modalImageIndex = parseInt(dot.dataset.index);
          renderModalImage();
        });
      });
    }

    let selectedSize = null;
    $$('.tamanho-item').forEach(el => {
      el.addEventListener('click', () => {
        $$('.tamanho-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        selectedSize = el.dataset.tam;
      });
    });

    $('#modal-whatsapp-btn')?.addEventListener('click', () => {
      const sizeText = selectedSize ? `Tam: ${selectedSize}` : 'Tam: a confirmar';
      const msg = `Olá! Tenho interesse na *${product.nome}*\n💵 R$ ${parseFloat(product.preco).toFixed(2)}\n📏 ${sizeText}`;
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  renderModalImage();
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ===== ADMIN =====
adminLoginBtn?.addEventListener('click', async () => {
  const email = adminEmailInput.value.trim();
  const password = adminPasswordInput.value.trim();

  if (!email || !password) {
    adminLoginError.textContent = '❌ Preencha usuário e senha!';
    adminLoginError.style.display = 'block';
    return;
  }

  adminLoginBtn.textContent = '⏳ Entrando...';
  adminLoginBtn.disabled = true;

  try {
    const user = await authenticateAdmin(email, password);

    if (user) {
      isLoggedIn = true;
      sessionUser = user;
      adminLoginDiv.style.display = 'none';
      adminLoginError.style.display = 'none';
      adminEmailDisplay.textContent = user.email;
      adminPanel.classList.add('show');
      renderAdminProducts();
      showToast(`👋 Bem-vindo, ${user.nome || user.email}!`, 'success');
    } else {
      // Tenta fazer um diagnóstico extra quando falha
      try {
        const client = getClient();
        const { data: allAdmins, error: allError } = await client.from('admins').select('*');
        console.log('🔍 DIAGNÓSTICO: Todos os admins no banco:', allAdmins);
        if (allError) {
          console.error('🔍 ERRO ao buscar admins:', allError.message, 'Código:', allError.code);
          adminLoginError.innerHTML = `❌ Erro no banco: ${allError.message}<br><small style="font-size:0.75rem;">Código: ${allError.code || 'N/A'}</small>`;
        } else if (!allAdmins || allAdmins.length === 0) {
          adminLoginError.innerHTML = '❌ Tabela "admins" está VAZIA!<br><small>Execute o SQL do supabase-schema.sql novamente</small>';
        } else {
          const found = allAdmins.find(a => a.email === email);
          if (!found) {
            adminLoginError.innerHTML = `❌ Admin "${email}" não encontrado!<br><small>Admins disponíveis: ${allAdmins.map(a => `"${a.email}"`).join(', ')}</small>`;
          } else {
            const hash = btoa(unescape(encodeURIComponent(password)));
            adminLoginError.innerHTML = `❌ Senha incorreta para "${email}"<br><small>Hash esperado: ${found.senha_hash} | Seu hash: ${hash}</small>`;
          }
        }
      } catch (diagErr) {
        adminLoginError.innerHTML = `❌ ${diagErr.message}`;
      }
      adminLoginError.style.display = 'block';
      adminPasswordInput.value = '';
      adminPasswordInput.focus();
    }
  } catch (err) {
    adminLoginError.textContent = '❌ Erro ao autenticar. Tente novamente.';
    adminLoginError.style.display = 'block';
  } finally {
    adminLoginBtn.textContent = 'Entrar';
    adminLoginBtn.disabled = false;
  }
});

adminPasswordInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLoginBtn.click();
});
adminEmailInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminPasswordInput.focus();
});

adminLogoutBtn?.addEventListener('click', () => {
  isLoggedIn = false;
  sessionUser = null;
  adminPanel.classList.remove('show');
  adminLoginDiv.style.display = 'block';
  adminLoginError.style.display = 'none';
  adminEmailInput.value = '';
  adminPasswordInput.value = '';
  showToast('👋 Desconectado!', 'info');
});

// ===== IMAGE UPLOAD =====
let pendingImages = [];
const fileInput = $('#prod-imagem-file');
const previewContainer = $('#previews-container');

// Also support URL input
const imagemUrlInput = $('#prod-imagem-url');

fileInput?.addEventListener('change', () => handleFiles(fileInput));

function handleFiles(input) {
  const files = input.files;
  if (!files || files.length === 0) return;
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      showToast(`"${file.name}" não é uma imagem válida.`, 'error');
      continue;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      pendingImages.push({ name: file.name, dataURL: event.target.result });
      updatePreviews();
    };
    reader.readAsDataURL(file);
  }
  input.value = '';
}

function updatePreviews() {
  if (!previewContainer) return;
  if (pendingImages.length === 0) {
    previewContainer.innerHTML = '<p style="color:#999;font-size:0.85rem;">Nenhuma imagem selecionada</p>';
    return;
  }
  previewContainer.innerHTML = `<div class="multi-previews">${pendingImages.map((img, idx) =>
    `<div class="preview-item">
      <img src="${img.dataURL}" alt="Prévia ${idx+1}">
      <button type="button" class="preview-remove" data-idx="${idx}">✕</button>
    </div>`
  ).join('')}</div>`;
  $$('.preview-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      pendingImages.splice(parseInt(btn.dataset.idx), 1);
      updatePreviews();
    });
  });
}

// ===== ADMIN: ADD PRODUCT =====
adminForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = $('#prod-nome').value.trim();
  const descricao = $('#prod-descricao').value.trim();
  const preco = parseFloat($('#prod-preco').value);
  const categoria = $('#prod-categoria').value;
  const tamanhosRaw = $('#prod-tamanhos').value.trim();
  const urlImagem = imagemUrlInput?.value.trim();

  if (!nome || !descricao || isNaN(preco) || !tamanhosRaw) {
    showToast('⚠️ Preencha todos os campos!', 'warning');
    return;
  }

  const tamanhos = tamanhosRaw.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
  if (tamanhos.length === 0) {
    showToast('⚠️ Informe pelo menos um tamanho.', 'warning');
    return;
  }

  let imagens = [];
  if (pendingImages.length > 0) {
    imagens = pendingImages.map(img => img.dataURL);
  } else if (urlImagem) {
    imagens = [urlImagem];
  } else {
    imagens = [CONFIG.placeholder];
  }

  const novoProduto = {
    nome,
    descricao,
    preco,
    categoria,
    tamanhos,
    imagens,
    ativo: true
  };

  const btn = adminForm.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '⏳ Salvando...';
  btn.disabled = true;

  try {
    const result = await addProduct(novoProduto);

    if (result) {
      products.push(result);
      renderProducts();
      renderAdminProducts();
      showToast('✅ Produto adicionado com sucesso!', 'success');
      adminForm.reset();
      pendingImages = [];
      updatePreviews();
    } else {
      showToast('❌ Erro ao salvar no banco de dados.', 'error');
    }
  } catch (err) {
    showToast('❌ Erro ao adicionar produto.', 'error');
  } finally {
    btn.textContent = orig;
    btn.disabled = false;
  }
});

// ===== ADMIN: RENDER & REMOVE =====
function renderAdminProducts() {
  if (!adminProductsList) return;
  if (products.length === 0) {
    adminProductsList.innerHTML = '<p style="color:#999;">Nenhum produto cadastrado.</p>';
    return;
  }
  adminProductsList.innerHTML = products.map(p => {
    const firstImg = getImageSrc(getProductImages(p)[0]);
    return `<div class="admin-product-item" data-id="${p.id}">
      <img src="${firstImg}" alt="${p.nome}" onerror="this.src='${CONFIG.placeholder}'">
      <div class="info">
        <h4>${p.nome}</h4>
        <p>${p.categoria || 'Geral'} • R$ ${parseFloat(p.preco).toFixed(2)} • ${(p.tamanhos || []).length} tamanhos</p>
      </div>
      <button class="btn-remove" data-id="${p.id}">✕ Remover</button>
    </div>`;
  }).join('');

  $$('.btn-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('Tem certeza que deseja remover este produto?')) return;

      btn.textContent = '⏳...';
      btn.disabled = true;

      const ok = await removeProduct(id);
      if (ok) {
        products = products.filter(p => p.id !== id);
        renderProducts();
        renderAdminProducts();
        showToast('✅ Produto removido!', 'success');
      } else {
        btn.textContent = '✕ Remover';
        btn.disabled = false;
      }
    });
  });
}

// ===== MANUAL SYNC =====
$('#sync-btn')?.addEventListener('click', async () => {
  showToast('🔄 Sincronizando...', 'info');
  await loadProducts();
});

// ===== WHATSAPP FLOAT =====
$('.whatsapp-float')?.addEventListener('click', () => {
  const msg = 'Olá! Vim do site Subli.me. Gostaria de mais informações sobre as camisetas personalizadas.';
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
});

// ===== DIAGNÓSTICO AUTOMÁTICO (ADMIN LOGIN) =====
// Toda vez que tentar logar, mostra diagnóstico completo no console
async function runLoginDiagnostic() {
  console.log('%c🔍 DIAGNÓSTICO DE LOGIN', 'font-size:16px;font-weight:bold');
  console.log('========================================');
  
  // 1. Verifica conexão
  try {
    const client = getClient();
    console.log('✅ Cliente Supabase conectado');
  } catch (err) {
    console.error('❌ Cliente Supabase NÃO conectado');
    return;
  }

  // 2. Tenta buscar admins
  try {
    const client = getClient();
    const { data, error } = await client.from('admins').select('email, senha_hash, nome');
    
    if (error) {
      console.error('❌ ERRO na tabela admins:', error.message);
      console.error('   ⚠️ Você PRECISA executar o supabase-schema.sql no SQL Editor!');
      return;
    }
    
    console.log(`✅ Tabela "admins" existe! ${data.length} registro(s):`);
    data.forEach(a => {
      console.log(`   👤 Email: "${a.email}" | Senha hash: "${a.senha_hash}" | Nome: "${a.nome}"`);
    });
    
    // Verifica se o admin "teste" existe
    const adminTeste = data.find(a => a.email === 'teste');
    if (adminTeste) {
      console.log('✅ Admin "teste" ENCONTRADO!');
      console.log('   → Hash da senha 123456 = MTIzNDU2');
      console.log('   → Hash no banco:', adminTeste.senha_hash);
      if (adminTeste.senha_hash === 'MTIzNDU2') {
        console.log('✅ Hash CONFERE! Login deve funcionar!');
      } else {
        console.error('❌ Hash DIFERENTE! O hash no banco não é MTIzNDU2');
      }
    } else {
      console.error('❌ Admin "teste" NÃO encontrado!');
      console.error('   → Execute este SQL no SQL Editor:');
      console.error("   INSERT INTO admins (email, senha_hash, nome) VALUES ('teste', 'MTIzNDU2', 'Admin Teste');");
    }
  } catch (err) {
    console.error('❌ Erro ao consultar banco:', err.message);
  }
  
  console.log('========================================');
  console.log('📌 Acesse: https://supabase.com/dashboard/project/zfhyxjwamuxrfcwjeaia');
  console.log('   → SQL Editor → New Query');
  console.log('   → Cole o conteúdo de supabase-schema.sql');
  console.log('   → Clique em Run');
}

// ===== INIT =====
async function init() {
  const connected = initSupabase();

  if (connected) {
    await loadProducts();
    showToast('✅ Conectado ao banco de dados Supabase!', 'success');
    
    // Auto-diagnóstico: verifica se as tabelas existem
    console.log('%c🔧 Diagnóstico automático...', 'font-weight:bold');
    setTimeout(() => runLoginDiagnostic(), 1000);
  } else {
    showToast('⚠️ Configure o Supabase em js/supabase-config.js', 'warning');
  }

  navigateTo('home');
}

init();

