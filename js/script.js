/* ================================================================
   MMC - Maître Morazandry Cosmos
   Fichier : script.js
   Description : Script principal du site
   Auteur : MMC
   Dernière mise à jour : 2026
   ================================================================ */

'use strict';

/* ================================================================
   1. MENU MOBILE
   ================================================================ */

/**
 * Ouvre ou ferme le menu mobile
 */
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

/**
 * Ferme le menu mobile lorsqu'on clique sur un lien
 */
document.addEventListener('DOMContentLoaded', function () {
    const mobileLinks = document.querySelectorAll('.mobile-menu a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function () {
            const menu = document.getElementById('mobileMenu');
            if (menu) menu.classList.remove('active');
        });
    });

    // Fermer le menu en cliquant en dehors
    document.addEventListener('click', function (event) {
        const menu = document.getElementById('mobileMenu');
        const toggle = document.querySelector('.mobile-toggle');
        if (!menu || !toggle) return;

        const isClickInsideMenu = menu.contains(event.target);
        const isClickOnToggle = toggle.contains(event.target);

        if (!isClickInsideMenu && !isClickOnToggle && menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    });
});


/* ================================================================
   2. ANIMATIONS AU SCROLL
   ================================================================ */

/**
 * Initialise les animations au scroll (fade-in)
 */
document.addEventListener('DOMContentLoaded', function () {
    // Vérifie si IntersectionObserver est supporté
    if (!('IntersectionObserver' in window)) {
        // Fallback : afficher tout directement
        document.querySelectorAll('.news-card, .theme-card, .bio-block, .presentation-text, .big-quote')
            .forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Éléments à animer
    const elementsToAnimate = document.querySelectorAll(
        '.news-card, .theme-card, .bio-block, .presentation-text, .presentation-image, .big-quote, .section-title'
    );

    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});


/* ================================================================
   3. FORMATAGE DES DATES
   ================================================================ */

/**
 * Formate une date au format français long
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {string} - Date formatée (ex: "29 septembre 2026")
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

/**
 * Formate une date au format court
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {string} - Date formatée (ex: "29/09/2026")
 */
function formatDateShort(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


/* ================================================================
   4. RETOUR EN HAUT
   ================================================================ */

/**
 * Crée et gère le bouton "Retour en haut"
 */
document.addEventListener('DOMContentLoaded', function () {
    // Créer le bouton
    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Retour en haut de la page');
    backToTop.innerHTML = '↑';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #d4a373;
        color: #0c0a0a;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        font-weight: bold;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(backToTop);

    // Afficher/masquer le bouton
    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            backToTop.style.display = 'flex';
            setTimeout(() => {
                backToTop.style.opacity = '1';
                backToTop.style.transform = 'translateY(0)';
            }, 10);
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (window.scrollY <= 400) backToTop.style.display = 'none';
            }, 300);
        }
    });

    // Scroll vers le haut au clic
    backToTop.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Effet hover
    backToTop.addEventListener('mouseenter', function () {
        backToTop.style.background = '#e5b888';
        backToTop.style.transform = 'translateY(-3px)';
    });

    backToTop.addEventListener('mouseleave', function () {
        backToTop.style.background = '#d4a373';
        backToTop.style.transform = 'translateY(0)';
    });
});


/* ================================================================
   5. SCROLL FLUIDE POUR LES ANCRES
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});


/* ================================================================
   6. COMPTEUR DU PANIER (localStorage)
   ================================================================ */

/**
 * Récupère le nombre d'articles dans le panier
 * @returns {number} - Nombre d'articles
 */
function getCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('mmc_cart') || '[]');
        return Array.isArray(cart) ? cart.length : 0;
    } catch (e) {
        return 0;
    }
}

/**
 * Met à jour le compteur du panier dans le header
 */
document.addEventListener('DOMContentLoaded', function () {
    const cartCounters = document.querySelectorAll('.cart-count');
    if (cartCounters.length === 0) return;

    const count = getCartCount();
    cartCounters.forEach(counter => {
        counter.textContent = count;
        counter.style.display = count > 0 ? 'inline-block' : 'none';
    });
});


/* ================================================================
   7. LAZY LOADING DES IMAGES (FALLBACK)
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Vérifie si le navigateur supporte le lazy loading natif
    if ('loading' in HTMLImageElement.prototype) {
        // Le navigateur gère le lazy loading nativement
        return;
    }

    // Fallback avec IntersectionObserver
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
});


/* ================================================================
   8. GESTION DES ERREURS D'IMAGES (FALLBACK)
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            // Si l'image ne charge pas, masquer l'image et afficher le fallback
            this.style.display = 'none';
            const fallback = this.nextElementSibling;
            if (fallback && fallback.classList.contains('img-fallback')) {
                fallback.style.display = 'flex';
            }
        });
    });
});


/* ================================================================
   9. ANNÉE AUTOMATIQUE DANS LE FOOTER
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
});


/* ================================================================
   10. DÉTECTION DU MODE SOMBRE DU SYSTÈME (OPTIONNEL)
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Le site est déjà en mode sombre, mais on peut détecter si l'utilisateur préfère le mode clair
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.classList.add('user-prefers-light');
    }
});


/* ================================================================
   11. CONSOLE DE BIENVENUE (SEO & MARQUE)
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    const styles = [
        'color: #d4a373',
        'font-size: 20px',
        'font-weight: bold',
        'padding: 10px'
    ].join(';');

    const stylesSmall = [
        'color: #bfaa95',
        'font-size: 12px',
        'padding: 5px'
    ].join(';');

    console.log('%c🌌 MMC - Maître Morazandry Cosmos', styles);
    console.log('%cBienvenue sur le site officiel de Maître MORAZANDRY.', stylesSmall);
    console.log('%c📖 "La Formation de Toutes Choses"', stylesSmall);
    console.log('%chttps://jiressclawer-max.github.io/mmc-cosmos/', stylesSmall);
});


/* ================================================================
   12. PRÉCHARGEMENT DES LIENS (PREFETCH)
   ================================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Précharger les pages principales lors du survol des liens
    const linksToPrefetch = document.querySelectorAll('a[href$=".html"]');

    linksToPrefetch.forEach(link => {
        link.addEventListener('mouseenter', function () {
            const href = this.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#')) return;

            // Vérifier si un prefetch existe déjà
            if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;

            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
        }, { once: true });
    });
});


/* ================================================================
   13. EXPOSITION DES FONCTIONS GLOBALES
   ================================================================ */

// Rendre les fonctions accessibles globalement pour les onclick
window.toggleMenu = toggleMenu;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
window.getCartCount = getCartCount;


/* ================================================================
   FIN DU SCRIPT
   ================================================================ */
