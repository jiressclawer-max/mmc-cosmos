/* ================================================================
   MMC - Maître Morazandry Cosmos
   Fichier : boutique.js
   Description : Chargement dynamique et gestion de la boutique
   ================================================================ */

'use strict';

/* ================================================================
   1. CONFIGURATION
   ================================================================ */

const BOUTIQUE_CONFIG = {
    storageKey: 'mmc_cart',
    currency: 'Ar'
};

/* ================================================================
   2. GESTION DU PANIER (localStorage)
   ================================================================ */

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(BOUTIQUE_CONFIG.storageKey) || '[]');
        return Array.isArray(cart) ? cart : [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(BOUTIQUE_CONFIG.storageKey, JSON.stringify(cart));
    updateCartCounters();
}

function addToCart(produit, quantite = 1) {
    const cart = getCart();
    const existing = cart.find(item => item.id === produit.id);

    if (existing) {
        existing.quantite += quantite;
    } else {
        cart.push({
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            devise: produit.devise || BOUTIQUE_CONFIG.currency,
            image: produit.image,
            quantite: quantite,
            unite: produit.unite
        });
    }

    saveCart(cart);
    return true;
}

function updateCartCounters() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantite, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = total;
        el.style.display = total > 0 ? 'inline-block' : 'none';
    });
}

/* ================================================================
   3. NOTIFICATION TOAST
   ================================================================ */

function showToast(message, type = 'success') {
    // Supprimer les toasts existants
    document.querySelectorAll('.mmc-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'mmc-toast mmc-toast-' + type;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ================================================================
   4. CHARGEMENT DES PRODUITS
   ================================================================ */

async function loadProduits(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
        return await response.json();
    } catch (error) {
        console.error('❌ Erreur de chargement des produits :', error);
        return null;
    }
}

/* ================================================================
   5. UTILITAIRES
   ================================================================ */

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function formatPrice(price, devise) {
    if (price === 0 || price === '0') return 'Gratuit';
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + (devise || 'Ar');
}

/* ================================================================
   6. CRÉATION D'UNE CARTE PRODUIT
   ================================================================ */

function createProductCard(produit) {
    const card = document.createElement('article');
    card.className = 'product-card';

    // Badges
    let badgesHtml = '';
    if (produit.promo && produit.prix_barre) {
        const reduction = Math.round((1 - produit.prix / produit.prix_barre) * 100);
        badgesHtml += `<span class="product-badge badge-promo">-${reduction}%</span>`;
    }
    if (produit.nouveau) {
        badgesHtml += `<span class="product-badge badge-new">Nouveau</span>`;
    }
    if (produit.en_vedette && !produit.nouveau) {
        badgesHtml += `<span class="product-badge badge-featured">⭐ Vedette</span>`;
    }
    if (produit.stock <= 0) {
        badgesHtml += `<span class="product-badge badge-out">Rupture</span>`;
    } else if (produit.stock < 10) {
        badgesHtml += `<span class="product-badge badge-low">Stock faible</span>`;
    }

    // Image
    const imageHtml = produit.image
        ? `<img src="${produit.image}" alt="${escapeHtml(produit.nom)}" class="product-image" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">`
        : '<div class="product-image-placeholder">📦</div>';

    // Prix
    const prixHtml = produit.prix_barre
        ? `<span class="product-price-current">${formatPrice(produit.prix, produit.devise)}</span>
           <span class="product-price-old">${formatPrice(produit.prix_barre, produit.devise)}</span>`
        : `<span class="product-price-current">${formatPrice(produit.prix, produit.devise)}</span>`;

    // Bouton d'ajout
    const boutonHtml = produit.stock <= 0
        ? `<button class="btn-add-cart disabled" disabled>❌ Rupture de stock</button>`
        : `<button class="btn-add-cart" onclick="handleAddToCart('${produit.id}')">
               🛒 Ajouter au panier
           </button>`;

    card.innerHTML = `
        <div class="product-image-container">
            ${badgesHtml}
            ${imageHtml}
        </div>
        <div class="product-body">
            <span class="product-category">${escapeHtml(produit.categorie)}</span>
            <h3 class="product-title">${escapeHtml(produit.nom)}</h3>
            <p class="product-description">${escapeHtml(produit.description)}</p>
            <div class="product-unit">${escapeHtml(produit.unite || '')}</div>
            <div class="product-price">${prixHtml}</div>
            ${boutonHtml}
        </div>
    `;

    return card;
}

/* ================================================================
   7. AFFICHAGE
   ================================================================ */

function renderProduits(produits, containerId, filters = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let filtered = produits.slice();

    // Filtre par catégorie
    if (filters.categorie) {
        filtered = filtered.filter(p => p.categorie === filters.categorie);
    }

    // Filtre par recherche
    if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(p =>
            p.nom.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search)
        );
    }

    // Tri
    if (filters.tri === 'prix_asc') {
        filtered.sort((a, b) => a.prix - b.prix);
    } else if (filters.tri === 'prix_desc') {
        filtered.sort((a, b) => b.prix - a.prix);
    } else if (filters.tri === 'nouveau') {
        filtered.sort((a, b) => (b.nouveau ? 1 : 0) - (a.nouveau ? 1 : 0));
    }

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-products">Aucun produit ne correspond à votre recherche.</p>';
        return;
    }

    filtered.forEach(produit => {
        container.appendChild(createProductCard(produit));
    });
}

/* ================================================================
   8. GESTION DE L'AJOUT AU PANIER
   ================================================================ */

let produitsData = [];

function handleAddToCart(produitId) {
    const produit = produitsData.find(p => p.id === produitId);
    if (!produit) return;

    if (produit.stock <= 0) {
        showToast('Ce produit est en rupture de stock.', 'error');
        return;
    }

    addToCart(produit, 1);
    showToast(`"${produit.nom}" ajouté au panier !`, 'success');
}

/* ================================================================
   9. INITIALISATION
   ================================================================ */

document.addEventListener('DOMContentLoaded', async function () {
    // Mettre à jour le compteur du panier
    updateCartCounters();

    const path = window.location.pathname;
    const basePath = path.includes('/themes/') ? '../' : '';
    const jsonPath = basePath + 'data/produits.json';

    const data = await loadProduits(jsonPath);
    if (!data || !data.produits) {
        console.error('Impossible de charger les produits');
        return;
    }

    produitsData = data.produits;

    // Rendu initial
    renderProduits(produitsData, 'products-container');

    // Filtres
    const searchInput = document.getElementById('products-search');
    const categorySelect = document.getElementById('products-category');
    const sortSelect = document.getElementById('products-sort');

    function applyFilters() {
        renderProduits(produitsData, 'products-container', {
            search: searchInput ? searchInput.value : '',
            categorie: categorySelect ? categorySelect.value : '',
            tri: sortSelect ? sortSelect.value : ''
        });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
});

/* ================================================================
   10. EXPOSITION GLOBALE
   ================================================================ */

window.MMCBoutique = {
    getCart: getCart,
    addToCart: addToCart,
    updateCartCounters: updateCartCounters
};
window.handleAddToCart = handleAddToCart;
