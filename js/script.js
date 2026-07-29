// ========================================================
// SUBLI.ME — JavaScript Principal
// ========================================================

const CONFIG = {
  whatsapp: '5541988259550',
  placeholder: 'images/placeholder.svg'
};

let products = [];
let isLoggedIn = false;
let sessionUser = null;
let heroCarouselInterval = null;

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

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

// ===== DARK MODE =====
const darkToggle = document.getElementById('dark-toggle');

function getDarkModePreference() {
  const saved = localStorage.getItem('sublime_dark_mode');
  if (saved !== null) return saved === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    if (darkToggle) darkToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    if (darkToggle) darkToggle.textContent = '🌙';
  }
  localStorage.setItem('sublime_dark_mode', isDark);
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains('dark-mode');
  applyDarkMode(isDark);
}

if (darkToggle) {
  darkToggle.addEventListener('click', toggleDarkMode);
  // Apply saved preference on load
  applyDarkMode(getDarkModePreference());
}

// ===== HERO CAROUSEL =====
const heroCarouselTrack = document.getElementById('hero-carousel-track');
const heroCarouselDots = document.getElementById('hero-carousel-dots');

function initHeroCarousel() {
  if (!heroCarouselTrack) return;

  // Get all product images for the carousel
  const productImages = products
    .filter(p => p.imagens && Array.isArray(p.imagens) && p.imagens.length > 0)
    .map(p => p.imagens[0]);

  // If no products, keep placeholder
  if (productImages.length === 0) {
    heroCarouselTrack.innerHTML = '<img src="' + CONFIG.placeholder + '" alt="Camisetas Subli.me" class="hero-carousel-slide">';
    if (heroCarouselDots) heroCarouselDots.innerHTML = '';
    return;
  }

  // Limit to 8 images max
  const slides = productImages.slice(0, 8);

  // Build slides
  heroCarouselTrack.innerHTML = slides.map(src =>
    '<img src="' + src + '" alt="Camiseta" class="hero-carousel-slide" onerror="this.src=' + "'" + CONFIG.placeholder + "'" + '">'
  ).join('');

  // Build dots
  if (heroCarouselDots) {
    heroCarouselDots.innerHTML = slides.map((_, i) =>
      '<span class="hero-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"></span>'
    ).join('');

    // Dot click navigation
    $$('.hero-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index);
        goToHeroSlide(idx);
        resetHeroInterval();
      });
    });
  }

  // Start auto-play
  startHeroAutoPlay();
}

let heroCurrentSlide = 0;

function goToHeroSlide(index) {
  if (!heroCarouselTrack) return;
  const slides = heroCarouselTrack.querySelectorAll('img');
  if (!slides.length) return;

  heroCurrentSlide = ((index % slides.length) + slides.length) % slides.length;
  const offset = -heroCurrentSlide * 100;
  heroCarouselTrack.style.transform = 'translateX(' + offset + '%)';

  // Update dots
  $$('.hero-dot').forEach(d => d.classList.remove('active'));
  const activeDot = $('.hero-dot[data-index="' + heroCurrentSlide + '"]');
  if (activeDot) activeDot.classList.add('active');
}

function nextHeroSlide() {
  if (!heroCarouselTrack) return;
  const slides = heroCarouselTrack.querySelectorAll('img');
  if (!slides.length) return;
  goToHeroSlide(heroCurrentSlide + 1);
}

function startHeroAutoPlay() {
  stopHeroAutoPlay();
  heroCarouselInterval = setInterval(nextHeroSlide, 3500);
}

function stopHeroAutoPlay() {
  if (heroCarouselInterval) {
    clearInterval(heroCarouselInterval);
    heroCarouselInterval = null;
  }
}

function resetHeroInterval() {
  stopHeroAutoPlay();
  startHeroAutoPlay();
}

// ===== TOAST =====
function showToast(msg, type = 'info') {
  const existing = $('.toast');
  if (existing) existing.remove();
  const colors = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#433075' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;top:90px;right:24px;z-index:9999;background:' + (colors[type] || colors.info) + ';color:#fff;padding:14px 24px;border-radius:10px;font-weight:600;font-size:0.95rem;box-shadow:0 6px 25px rgba(0,0,0,0.2);animation:slideInRight 0.3s ease;max-width:400px;line-height:1.4';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

const styleTag = document.createElement('style');
styleTag.textContent = '@keyframes slideInRight{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}';
document.head.appendChild(styleTag);

// ===== NAVEGACAO =====
function navigateTo(sectionId) {
  sections.forEach(s => s.classList.remove('active'));
  navLinks.forEach(l => l.classList.remove('active'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
  const link = $('.nav-links a[data-section="' + sectionId + '"]');
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

// ===== HELPERS =====
function getImageSrc(path) {
  return (!path || path === '') ? CONFIG.placeholder : path;
}

function getProductImages(p) {
  return (p.imagens && Array.isArray(p.imagens) && p.imagens.length > 0) ? p.imagens : [CONFIG.placeholder];
}

// ===== PRODUTOS =====
async function loadProducts() {
  showToast('Carregando produtos...', 'info');
  const data = await fetchProducts();
  products = (data && data.length > 0) ? data : [];
  renderProducts();
  renderAdminProducts();
  initHeroCarousel();
}

function renderProducts() {
  if (!productsGrid) return;
  if (products.length === 0) {
    productsGrid.innerHTML = '<div style="text-align:center;padding:60px 0;color:#999;"><p style="font-size:3rem;">👕</p><p>Nenhum produto disponivel</p></div>';
    return;
  }
  productsGrid.innerHTML = products.map(p => {
    const img = getImageSrc(getProductImages(p)[0]);
    return '<div class="product-card" data-id="' + p.id + '"><div class="product-card-image"><img src="' + img + '" alt="' + p.nome + '" loading="lazy" onerror="this.src=' + "'" + CONFIG.placeholder + "'" + '"></div><div class="product-info"><div class="categoria">' + (p.categoria || 'Geral') + '</div><h3>' + p.nome + '</h3><div class="preco">R$ ' + parseFloat(p.preco).toFixed(2) + '</div><div class="tamanhos-mini">' + (p.tamanhos || []).map(t => '<span>' + t + '</span>').join('') + '</div></div>';
  }).join('');
  $$('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const product = products.find(p => p.id === card.dataset.id);
      if (product) openModal(product);
    });
  });
}

// ===== MODAL =====
function openModal(product) {
  if (!modalOverlay || !modalContent) return;
  const imgs = getProductImages(product);
  let idx = 0;

  function render() {
    const hasMultiple = imgs.length > 1;
    let html = '<div class="modal-image"><div class="gallery-container"><img src="' + getImageSrc(imgs[idx]) + '" alt="' + product.nome + '" class="gallery-main-img" onerror="this.src=' + "'" + CONFIG.placeholder + "'" + '">';
    if (hasMultiple) {
      html += '<button class="gallery-nav gallery-prev">‹</button><button class="gallery-nav gallery-next">›</button><div class="gallery-dots">' + imgs.map((_, i) => '<span class="gallery-dot ' + (i === idx ? 'active' : '') + '" data-i="' + i + '"></span>').join('') + '</div>';
    }
    html += '</div><div class="modal-details"><div class="categoria">' + (product.categoria || 'Geral') + '</div><h2>' + product.nome + '</h2><div class="preco-modal">R$ ' + parseFloat(product.preco).toFixed(2) + '</div><p class="descricao">' + (product.descricao || '') + '</p><div class="tamanhos-title">Tamanhos:</div><div class="tamanhos-list">' + (product.tamanhos || []).map(t => '<span class="tam-item" data-tam="' + t + '">' + t + '</span>').join('') + '</div><button class="btn btn-whatsapp" id="whats-btn-modal">📱 Encomendar</button></div>';
    modalContent.innerHTML = html;

    if (hasMultiple) {
      $('.gallery-prev').onclick = (e) => { e.stopPropagation(); idx = (idx - 1 + imgs.length) % imgs.length; render(); };
      $('.gallery-next').onclick = (e) => { e.stopPropagation(); idx = (idx + 1) % imgs.length; render(); };
      $$('.gallery-dot').forEach(d => d.onclick = (e) => { e.stopPropagation(); idx = parseInt(d.dataset.i); render(); });
    }

    let selectedSize = null;
    $$('.tam-item').forEach(el => {
      el.onclick = () => {
        $$('.tam-item').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        selectedSize = el.dataset.tam;
      };
    });

    const wBtn = $('#whats-btn-modal');
    if (wBtn) wBtn.onclick = () => {
      const tam = selectedSize ? 'Tam: ' + selectedSize : 'Tam: a confirmar';
      window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Ola! Quero a ' + product.nome + ' - R$ ' + parseFloat(product.preco).toFixed(2) + ' - ' + tam), '_blank');
    };
  }

  render();
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.onclick = closeModal;
if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ===== LOGIN ADMIN =====
if (adminLoginBtn) {
  adminLoginBtn.onclick = async () => {
    const email = adminEmailInput.value.trim();
    const password = adminPasswordInput.value.trim();
    if (!email || !password) {
      adminLoginError.textContent = 'Preencha usuario e senha!';
      adminLoginError.style.display = 'block';
      return;
    }
    adminLoginBtn.textContent = 'Entrando...';
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
        showToast('Bem-vindo, ' + (user.nome || user.email) + '!', 'success');
} else {
        adminLoginError.textContent = 'Usuario ou senha incorretos! Tente: usuario="teste" senha="123456"';
        adminLoginError.style.display = 'block';
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
      }
    } catch (err) {
      adminLoginError.textContent = 'Erro ao autenticar.';
      adminLoginError.style.display = 'block';
    } finally {
      adminLoginBtn.textContent = 'Entrar';
      adminLoginBtn.disabled = false;
    }
  };
}

if (adminPasswordInput) adminPasswordInput.onkeydown = (e) => { if (e.key === 'Enter') adminLoginBtn.click(); };
if (adminEmailInput) adminEmailInput.onkeydown = (e) => { if (e.key === 'Enter') adminPasswordInput.focus(); };

if (adminLogoutBtn) {
  adminLogoutBtn.onclick = () => {
    isLoggedIn = false;
    sessionUser = null;
    adminPanel.classList.remove('show');
    adminLoginDiv.style.display = 'block';
    adminLoginError.style.display = 'none';
    adminEmailInput.value = '';
    adminPasswordInput.value = '';
    showToast('Desconectado!', 'info');
  };
}

// ===== IMAGEM UPLOAD =====
let pendingImages = [];
const fileInput = document.getElementById('prod-imagem-file');
const previewContainer = document.getElementById('previews-container');
const imagemUrlInput = document.getElementById('prod-imagem-url');

if (fileInput) fileInput.onchange = () => {
  const files = fileInput.files;
  if (!files || files.length === 0) return;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const reader = new FileReader();
    reader.onload = (e) => { pendingImages.push({ name: file.name, dataURL: e.target.result }); updatePreviews(); };
    reader.readAsDataURL(file);
  }
  fileInput.value = '';
};

function updatePreviews() {
  if (!previewContainer) return;
  if (pendingImages.length === 0) {
    previewContainer.innerHTML = '<p style="color:#999;font-size:0.85rem;">Nenhuma imagem</p>';
    return;
  }
  previewContainer.innerHTML = '<div class="multi-previews">' + pendingImages.map((img, i) => '<div class="preview-item"><img src="' + img.dataURL + '" alt=""><button class="preview-remove" data-i="' + i + '">X</button></div>').join('') + '</div>';
  $$('.preview-remove').forEach(btn => btn.onclick = () => { pendingImages.splice(parseInt(btn.dataset.i), 1); updatePreviews(); });
}

// ===== ADICIONAR PRODUTO =====
if (adminForm) {
  adminForm.onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('prod-nome').value.trim();
    const descricao = document.getElementById('prod-descricao').value.trim();
    const preco = parseFloat(document.getElementById('prod-preco').value);
    const categoria = document.getElementById('prod-categoria').value;
    const tamanhosRaw = document.getElementById('prod-tamanhos').value.trim();
    const urlImagem = imagemUrlInput ? imagemUrlInput.value.trim() : '';

    if (!nome || !descricao || isNaN(preco) || !tamanhosRaw) {
      showToast('Preencha todos os campos!', 'warning');
      return;
    }
    const tamanhos = tamanhosRaw.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
    if (tamanhos.length === 0) { showToast('Informe tamanhos.', 'warning'); return; }

    let imagens = [];
    if (pendingImages.length > 0) imagens = pendingImages.map(img => img.dataURL);
    else if (urlImagem) imagens = [urlImagem];
    else imagens = [CONFIG.placeholder];

    const btn = adminForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Salvando...';
    btn.disabled = true;

    const result = await addProduct({ nome, descricao, preco, categoria, tamanhos, imagens, ativo: true });
    if (result) {
      products.push(result);
      renderProducts();
      renderAdminProducts();
      showToast('Produto adicionado!', 'success');
      adminForm.reset();
      pendingImages = [];
      updatePreviews();
    } else {
      showToast('Erro ao salvar.', 'error');
    }
    btn.textContent = orig;
    btn.disabled = false;
  };
}

// ===== LISTAR E REMOVER =====
function renderAdminProducts() {
  if (!adminProductsList) return;
  if (products.length === 0) {
    adminProductsList.innerHTML = '<p style="color:#999;">Nenhum produto cadastrado.</p>';
    return;
  }
  adminProductsList.innerHTML = products.map(p => {
    const img = getImageSrc(getProductImages(p)[0]);
    return '<div class="admin-product-item"><img src="' + img + '" alt="' + p.nome + '" onerror="this.src=' + "'" + CONFIG.placeholder + "'" + '"><div class="info"><h4>' + p.nome + '</h4><p>' + (p.categoria || 'Geral') + ' - R$ ' + parseFloat(p.preco).toFixed(2) + '</p></div><button class="btn-remove" data-id="' + p.id + '">X Remover</button></div>';
  }).join('');
  $$('.btn-remove').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Remover este produto?')) return;
      btn.textContent = '...';
      btn.disabled = true;
      if (await removeProduct(btn.dataset.id)) {
        products = products.filter(p => p.id !== btn.dataset.id);
        renderProducts();
        renderAdminProducts();
        showToast('Produto deletado do banco!', 'success');
      } else {
        btn.textContent = 'X Remover';
        btn.disabled = false;
        showToast('Erro ao deletar.', 'error');
      }
    };
  });
}

// ===== SYNC =====
const syncBtn = document.getElementById('sync-btn');
if (syncBtn) syncBtn.onclick = async () => { showToast('Sincronizando...', 'info'); await loadProducts(); };

// ===== WHATSAPP FLOAT =====
const wFloat = document.querySelector('.whatsapp-float');
if (wFloat) wFloat.onclick = () => window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent('Ola! Vim do site Subli.me'), '_blank');

// ===== INIT =====
async function init() {
  if (initSupabase()) {
    await loadProducts();
    showToast('Conectado!', 'success');
  } else {
    // Even without DB, show empty carousel
    initHeroCarousel();
    showToast('Configure o Supabase.', 'warning');
  }
  navigateTo('home');
}

init();
