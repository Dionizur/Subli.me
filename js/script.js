// ===== CONFIG =====
const WHATSAPP_NUMBER = '5541988259550';
const PLACEHOLDER_IMG = 'images/placeholder.svg';

// ===== PRODUCTS (com múltiplas imagens) =====
const PRODUCTS_DATA = [
  { "id": 1, "nome": "Camiseta Street Art", "imagens": ["images/camiseta1.svg", "images/placeholder.svg"], "descricao": "Camiseta oversized com estampa artística exclusiva. Produzida em algodão premium 30.1, costura reforçada e acabamento de alta qualidade.", "preco": 79.90, "tamanhos": ["PP", "P", "M", "G", "GG"], "categoria": "Masculina" },
  { "id": 2, "nome": "Camiseta Minimalista", "imagens": ["images/camiseta2.svg", "images/placeholder.svg"], "descricao": "Camiseta básica de corte reto com design minimalista. Tecido leve e confortável, perfeita para o dia a dia.", "preco": 69.90, "tamanhos": ["P", "M", "G", "GG"], "categoria": "Feminina" },
  { "id": 3, "nome": "Camiseta Vintage", "imagens": ["images/camiseta3.svg", "images/placeholder.svg"], "descricao": "Camiseta com estampa inspirada nos anos 80/90. Modelo casual com gola careca e mangas curtas.", "preco": 89.90, "tamanhos": ["P", "M", "G", "GG", "XGG"], "categoria": "Unissex" },
  { "id": 4, "nome": "Camiseta Geométrica", "imagens": ["images/camiseta4.svg", "images/placeholder.svg"], "descricao": "Camiseta estilosa com padrão geométrico moderno. Confortável e respirável.", "preco": 74.90, "tamanhos": ["PP", "P", "M", "G"], "categoria": "Masculina" },
  { "id": 5, "nome": "Camiseta Floral", "imagens": ["images/camiseta5.svg", "images/placeholder.svg"], "descricao": "Camiseta com estampa floral delicada. Modelo ajustado ao corpo, decote redondo.", "preco": 79.90, "tamanhos": ["P", "M", "G", "GG"], "categoria": "Feminina" },
  { "id": 6, "nome": "Camiseta Esportiva", "imagens": ["images/camiseta6.svg", "images/placeholder.svg"], "descricao": "Camiseta dry-fit para atividades esportivas. Leve, respirável e com proteção UV.", "preco": 94.90, "tamanhos": ["P", "M", "G", "GG", "XGG"], "categoria": "Unissex" }
];

// ===== STATE =====
let products = [];
let isLoggedIn = false;
let uploadedImages = {}; // filename -> dataURL
let modalImages = [];   // current modal gallery images
let modalImageIndex = 0;

// ===== DOM REFS =====
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');
const productsGrid = document.querySelector('.products-grid');
const modalOverlay = document.querySelector('.modal-overlay');
const modalContent = document.querySelector('.modal-content');
const modalClose = document.querySelector('.modal-close');

// Admin DOM
const adminLoginDiv = document.querySelector('.admin-login');
const adminPanel = document.querySelector('.admin-panel');
const adminEmailInput = document.getElementById('admin-email');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLoginError = document.getElementById('admin-login-error');
const adminEmailDisplay = document.getElementById('admin-email-display');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminForm = document.getElementById('admin-form');
const adminProductsList = document.querySelector('.admin-products-list .products-list');
const downloadJsonBtn = document.getElementById('download-json-btn');
const jsonSaveMsg = document.getElementById('json-save-msg');
const fileInputs = document.querySelectorAll('.prod-imagem-file');
const previewContainer = document.getElementById('previews-container');

// ===== HELPERS =====
function getImageSrc(path) {
  // If the path is already a dataURL, use it directly
  if (path && path.startsWith('data:')) return path;
  if (uploadedImages[path]) return uploadedImages[path];
  return path;
}

/** Return product's images array (backward compat with 'imagem' field) */
function getProductImages(p) {
  if (p.imagens && Array.isArray(p.imagens) && p.imagens.length > 0) return p.imagens;
  if (p.imagem) return [p.imagem];
  return [PLACEHOLDER_IMG];
}

// ===== NAVIGATION =====
function navigateTo(sectionId) {
  sections.forEach(s => s.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  const link = document.querySelector(`.nav-links a[data-section="${sectionId}"]`);
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
  link.addEventListener('click', (e) => { e.preventDefault(); navigateTo(link.dataset.section); });
});
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinksContainer.classList.toggle('open');
});

// ===== LOCAL STORAGE PERSISTENCE =====
const STORAGE_KEY = 'sublime_products';

function saveProductsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Erro ao salvar no localStorage:', err);
  }
}

function loadProductsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar do localStorage:', err);
  }
  return null;
}

// ===== LOAD PRODUCTS =====
function loadProducts() {
  const stored = loadProductsFromStorage();
  if (stored) {
    products = stored;
  } else {
    products = PRODUCTS_DATA.map(p => ({ ...p }));
    saveProductsToStorage();
  }
  renderProducts();
  renderAdminProducts();
}

// ===== RENDER PRODUCT GRID =====
function renderProducts() {
  if (!productsGrid) return;
  if (products.length === 0) {
    productsGrid.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;">Nenhum produto disponível no momento.</p>';
    return;
  }
  productsGrid.innerHTML = products.map(p => {
    const firstImg = getImageSrc(getProductImages(p)[0]);
    return `<div class="product-card" data-id="${p.id}">
      <img src="${firstImg}" alt="${p.nome}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div class="product-info">
        <div class="categoria">${p.categoria}</div>
        <h3>${p.nome}</h3>
        <div class="preco">R$ ${p.preco.toFixed(2)}</div>
        <div class="tamanhos-mini">${p.tamanhos.map(t => `<span>${t}</span>`).join('')}</div>
      </div>
    </div>`;
  }).join('');
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const product = products.find(p => p.id === id);
      if (product) openModal(product);
    });
  });
}

// ===== MODAL WITH GALLERY =====
function openModal(product) {
  if (!modalOverlay || !modalContent) return;

  modalImages = getProductImages(product);
  modalImageIndex = 0;

  renderModalImage(product);

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderModalImage(product) {
  const imgSrc = getImageSrc(modalImages[modalImageIndex]);
  const hasMultiple = modalImages.length > 1;

  let galleryHtml = `<div class="modal-image">`;
  galleryHtml += `<div class="gallery-container">`;
  galleryHtml += `<img src="${imgSrc}" alt="${product.nome}" class="gallery-main-img" onerror="this.src='${PLACEHOLDER_IMG}'">`;

  if (hasMultiple) {
    galleryHtml += `<button class="gallery-nav gallery-prev" id="gallery-prev">‹</button>`;
    galleryHtml += `<button class="gallery-nav gallery-next" id="gallery-next">›</button>`;
    galleryHtml += `<div class="gallery-dots">`;
    for (let i = 0; i < modalImages.length; i++) {
      galleryHtml += `<span class="gallery-dot ${i === modalImageIndex ? 'active' : ''}" data-index="${i}"></span>`;
    }
    galleryHtml += `</div>`;
  }
  galleryHtml += `</div></div>`;

  const detalhesHtml = `<div class="modal-details">
    <div class="categoria">${product.categoria}</div>
    <h2>${product.nome}</h2>
    <div class="preco-modal">R$ ${product.preco.toFixed(2)}</div>
    <p class="descricao">${product.descricao}</p>
    <div class="tamanhos-title">Tamanhos disponíveis:</div>
    <div class="tamanhos-list">
      ${product.tamanhos.map(t => `<span class="tamanho-item" data-tam="${t}">${t}</span>`).join('')}
    </div>
    <button class="btn btn-whatsapp" id="modal-whatsapp-btn">📱 Encomendar via WhatsApp</button>
  </div>`;

  modalContent.innerHTML = galleryHtml + detalhesHtml;

  // Gallery navigation
  if (hasMultiple) {
    document.getElementById('gallery-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      modalImageIndex = (modalImageIndex - 1 + modalImages.length) % modalImages.length;
      renderModalImage(product);
    });
    document.getElementById('gallery-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      modalImageIndex = (modalImageIndex + 1) % modalImages.length;
      renderModalImage(product);
    });
    document.querySelectorAll('.gallery-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        modalImageIndex = parseInt(dot.dataset.index);
        renderModalImage(product);
      });
    });
  }

  // Size selection
  let selectedSize = null;
  document.querySelectorAll('.tamanho-item').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.tamanho-item').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedSize = el.dataset.tam;
    });
  });

  // WhatsApp
  document.getElementById('modal-whatsapp-btn')?.addEventListener('click', () => {
    const sizeText = selectedSize ? `Tam: ${selectedSize}` : 'Tam: a confirmar';
    const msg = `Olá! Tenho interesse na *${product.nome}*\n💵 R$ ${product.preco.toFixed(2)}\n📏 ${sizeText}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ===== ADMIN AUTH =====
let adminCredentials = { email: '', senha_hash: '' };
async function loadAdminCredentials() {
  try {
    const res = await fetch('data/admin.json');
    adminCredentials = await res.json();
  } catch (err) {
    console.warn('Erro ao carregar admin.json, usando fallback.');
    adminCredentials = { email: 'teste', senha_hash: 'MTIzNDU2' };
  }
}
function toBase64(str) { return btoa(unescape(encodeURIComponent(str))); }

adminLoginBtn?.addEventListener('click', () => {
  const email = adminEmailInput.value.trim();
  const password = adminPasswordInput.value.trim();
  if (email === adminCredentials.email && toBase64(password) === adminCredentials.senha_hash) {
    isLoggedIn = true;
    adminLoginDiv.style.display = 'none';
    adminLoginError.style.display = 'none';
    adminEmailDisplay.textContent = email;
    adminPanel.classList.add('show');
    renderAdminProducts();
  } else {
    adminLoginError.textContent = '❌ Usuário ou senha incorretos!';
    adminLoginError.style.display = 'block';
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
  }
});
adminPasswordInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') adminLoginBtn.click(); });
adminEmailInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') adminPasswordInput.focus(); });
adminLogoutBtn?.addEventListener('click', () => {
  isLoggedIn = false;
  adminPanel.classList.remove('show');
  adminLoginDiv.style.display = 'block';
  adminLoginError.style.display = 'none';
  adminEmailInput.value = '';
  adminPasswordInput.value = '';
});

// ===== MULTI IMAGE UPLOAD =====
let pendingImages = []; // array of { name, dataURL }

fileInputs.forEach(input => {
  input.addEventListener('change', (e) => {
    handleFiles(e.target);
  });
});

function handleFiles(input) {
  const files = input.files;
  if (!files || files.length === 0) return;

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      alert(`"${file.name}" não é uma imagem válida.`);
      continue;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      pendingImages.push({ name: file.name, dataURL: event.target.result });
      updatePreviews();
    };
    reader.readAsDataURL(file);
  }
  // Reset input to allow re-selecting same files
  input.value = '';
}

function updatePreviews() {
  if (!previewContainer) return;
  if (pendingImages.length === 0) {
    previewContainer.innerHTML = '<p style="color:#999;font-size:0.85rem;margin-top:8px;">Nenhuma imagem selecionada</p>';
    return;
  }
  let html = '<div class="multi-previews">';
  pendingImages.forEach((img, idx) => {
    html += `<div class="preview-item">
      <img src="${img.dataURL}" alt="Prévia ${idx+1}">
      <button type="button" class="preview-remove" data-idx="${idx}">✕</button>
    </div>`;
  });
  html += '</div>';
  previewContainer.innerHTML = html;

  document.querySelectorAll('.preview-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      pendingImages.splice(idx, 1);
      updatePreviews();
    });
  });
}

// ===== ADMIN: ADD PRODUCT =====
adminForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('prod-nome').value.trim();
  const descricao = document.getElementById('prod-descricao').value.trim();
  const preco = parseFloat(document.getElementById('prod-preco').value);
  const categoria = document.getElementById('prod-categoria').value;
  const tamanhosRaw = document.getElementById('prod-tamanhos').value.trim();

  if (!nome || !descricao || isNaN(preco) || !tamanhosRaw) {
    alert('Preencha todos os campos!');
    return;
  }
  const tamanhos = tamanhosRaw.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
  if (tamanhos.length === 0) { alert('Informe pelo menos um tamanho.'); return; }

// Build imagens array from pending uploads
  // Store the actual dataURLs directly in the product so they persist in localStorage
  let imagens = [];
  if (pendingImages.length > 0) {
    pendingImages.forEach(img => {
      // Store the dataURL directly in the imagens array for persistence
      imagens.push(img.dataURL);
    });
  }
  if (imagens.length === 0) {
    imagens = [PLACEHOLDER_IMG];
  }

  const newProduct = {
    id: Date.now(),
    nome,
    imagens,
    descricao,
    preco,
    tamanhos,
    categoria
  };

  products.push(newProduct);
  saveProductsToStorage();
  renderProducts();
  renderAdminProducts();

  const btn = adminForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = '✅ Produto Adicionado!';
  setTimeout(() => { btn.textContent = originalText; }, 2000);

  adminForm.reset();
  pendingImages = [];
  updatePreviews();
});

// ===== ADMIN: REMOVE PRODUCT =====
function renderAdminProducts() {
  if (!adminProductsList) return;
  if (products.length === 0) {
    adminProductsList.innerHTML = '<p style="color:#999;">Nenhum produto cadastrado.</p>';
    return;
  }
  adminProductsList.innerHTML = products.map(p => {
    const firstImg = getImageSrc(getProductImages(p)[0]);
    return `<div class="admin-product-item" data-id="${p.id}">
      <img src="${firstImg}" alt="${p.nome}" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div class="info">
        <h4>${p.nome}</h4>
        <p>${p.categoria} • R$ ${p.preco.toFixed(2)} • ${p.tamanhos.length} tamanhos • ${getProductImages(p).length} foto(s)</p>
      </div>
      <button class="btn-remove" data-id="${p.id}">✕ Remover</button>
    </div>`;
  }).join('');
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      if (confirm('Tem certeza que deseja remover este produto?')) {
        products = products.filter(p => p.id !== id);
        saveProductsToStorage();
        renderProducts();
        renderAdminProducts();
      }
    });
  });
}

// ===== DOWNLOAD JSON =====
downloadJsonBtn?.addEventListener('click', () => {
  const jsonString = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  if (jsonSaveMsg) {
    jsonSaveMsg.style.display = 'inline';
    setTimeout(() => { jsonSaveMsg.style.display = 'none'; }, 3000);
  }
});

// ===== WHATSAPP FLOAT =====
document.querySelector('.whatsapp-float')?.addEventListener('click', () => {
  const msg = 'Olá! Vim do site Subli.me. Gostaria de mais informações sobre as camisetas personalizadas.';
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

// ===== INIT =====
loadProducts();
loadAdminCredentials();
navigateTo('home');

