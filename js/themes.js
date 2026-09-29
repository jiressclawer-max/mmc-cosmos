/* ================================================================
   MMC - Maître Morazandry Cosmos
   Fichier : themes.js
   Description : Chargement dynamique des thèmes du jour
   Auteur : MMC
   Dernière mise à jour : 2026
   ================================================================ */

'use strict';

/* ================================================================
   1. CONFIGURATION
   ================================================================ */

const THEMES_CONFIG = {
    // Chemin vers le fichier JSON (relatif au contexte d'appel)
    jsonPath: null,
    // Nombre de thèmes à afficher en aperçu sur la page d'accueil
    previewCount: 4,
    // Chemin de base pour les liens (permet d'adapter selon la page)
    basePath: '',
    // Conteneur cible
    containerId: 'themes-container'
};


/* ================================================================
   2. DÉTECTION AUTOMATIQUE DU CHEMIN
   ================================================================ */

/**
 * Détecte le chemin de base selon l'emplacement de la page
 * @returns {string} - Chemin de base ('', '../', etc.)
 */
function detectBasePath() {
    const path = window.location.pathname;

    // Si on est dans un sous-dossier (ex: /themes/)
    if (path.includes('/themes/')) {
        return '../';
    }

    return '';
}

/**
 * Détecte le chemin du fichier JSON
 * @param {string} basePath
 * @returns {string}
 */
function detectJsonPath(basePath) {
    return basePath + 'data/themes.json';
}


/* ================================================================
   3. CHARGEMENT DES THÈMES
   ================================================================ */

/**
 * Charge le fichier JSON des thèmes
 * @param {string} jsonPath - Chemin vers le fichier
 * @returns {Promise<Object>}
 */
async function loadThemes(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error('Erreur HTTP ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Erreur de chargement des thèmes :', error);
        return null;
    }
}


/* ================================================================
   4. TRI DES THÈMES
   ================================================================ */

/**
 * Trie les thèmes par date décroissante
 * @param {Array} themes
 * @returns {Array}
 */
function sortThemesByDate(themes) {
    return themes.slice().sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
}


/* ================================================================
   5. CRÉATION DES CARTES DE THÈMES
   ================================================================ */

/**
 * Crée une carte de thème (élément HTML)
 * @param {Object} theme - Données du thème
 * @param {string} basePath - Chemin de base pour les liens
 * @returns {HTMLElement}
 */
function createThemeCard(theme, basePath) {
    const card = document.createElement('article');
    card.className = 'theme-card';

    // Construire le lien absolu
    const link = basePath + theme.url;

    // Préparer l'image (avec fallback emoji)
    const imageHtml = theme.image
        ? `<img src="${basePath}${theme.image}" alt="${escapeHtml(theme.titre)}" class="theme-card-image" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size:3rem;opacity:0.6;\\'>🌌</span>';" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:12px;">`
        : '';

    // Construire les hashtags
    const hashtagsHtml = (theme.hashtags || [])
        .slice(0, 4)
        .map(tag => `<span class="theme-card-hashtag">#${escapeHtml(tag)}</span>`)
        .join('');

    card.innerHTML = `
        <a href="${link}" class="theme-card-link" aria-label="Lire le thème : ${escapeHtml(theme.titre)}">
            ${imageHtml}
            <div class="theme-card-header">
                <span class="theme-badge-jour">${escapeHtml(theme.jour)}</span>
                <span class="theme-badge-cat">${escapeHtml(theme.categorie)}</span>
            </div>
            <h3 class="theme-card-title">${escapeHtml(theme.titre)}</h3>
            <p class="theme-card-question">❓ ${escapeHtml(theme.question)}</p>
            <blockquote class="theme-card-citation">« ${escapeHtml(theme.citation)} »</blockquote>
            <p class="theme-card-excerpt">${escapeHtml(theme.excerpt)}</p>
            <div class="theme-card-footer">
                <span class="theme-card-date">📅 ${formatDate(theme.date)}</span>
                <span class="theme-card-link-txt">Lire la suite →</span>
            </div>
            ${hashtagsHtml ? `<div class="theme-card-hashtags">${hashtagsHtml}</div>` : ''}
        </a>
    `;

    return card;
}


/* ================================================================
   6. AFFICHAGE DES THÈMES (APERÇU ACCUEIL)
   ================================================================ */

/**
 * Affiche les N derniers thèmes sur la page d'accueil
 * @param {Array} themes - Tous les thèmes
 * @param {string} containerId
 * @param {string} basePath
 * @param {number} count
 */
function renderPreview(themes, containerId, basePath, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Trier par date décroissante
    const sorted = sortThemesByDate(themes);

    // Prendre les N plus récents
    const latest = sorted.slice(0, count);

    // Vider le conteneur
    container.innerHTML = '';

    if (latest.length === 0) {
        container.innerHTML = '<p class="no-themes">Aucun thème publié pour le moment.</p>';
        return;
    }

    // Créer les cartes
    latest.forEach(theme => {
        container.appendChild(createThemeCard(theme, basePath));
    });
}


/* ================================================================
   7. AFFICHAGE DE TOUS LES THÈMES (PAGE LISTE)
   ================================================================ */

/**
 * Affiche tous les thèmes sur la page dédiée
 * @param {Array} themes
 * @param {string} containerId
 * @param {string} basePath
 */
function renderAll(themes, containerId, basePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sorted = sortThemesByDate(themes);

    container.innerHTML = '';

    if (sorted.length === 0) {
        container.innerHTML = '<p class="no-themes">Aucun thème publié pour le moment.</p>';
        return;
    }

    sorted.forEach(theme => {
        container.appendChild(createThemeCard(theme, basePath));
    });
}


/* ================================================================
   8. RECHERCHE ET FILTRE
   ================================================================ */

/**
 * Filtre les thèmes par recherche ou catégorie
 * @param {Array} themes
 * @param {Object} filters - { search: '', categorie: '' }
 * @returns {Array}
 */
function filterThemes(themes, filters) {
    return themes.filter(theme => {
        // Filtre par catégorie
        if (filters.categorie && theme.categorie !== filters.categorie) {
            return false;
        }

        // Filtre par recherche (titre, citation, excerpt)
        if (filters.search) {
            const search = filters.search.toLowerCase();
            const text = (
                theme.titre + ' ' +
                theme.citation + ' ' +
                theme.excerpt + ' ' +
                (theme.hashtags || []).join(' ')
            ).toLowerCase();

            if (!text.includes(search)) return false;
        }

        return true;
    });
}


/* ================================================================
   9. INITIALISATION AUTOMATIQUE
   ================================================================ */

/**
 * Point d'entrée principal : détecte le contexte et charge les thèmes
 */
document.addEventListener('DOMContentLoaded', async function () {
    const basePath = detectBasePath();
    const jsonPath = detectJsonPath(basePath);

    // ===== PAGE D'ACCUEIL =====
    const previewContainer = document.getElementById('themes-container');
    if (previewContainer) {
        const data = await loadThemes(jsonPath);
        if (data && data.themes) {
            const count = previewContainer.dataset.count
                ? parseInt(previewContainer.dataset.count)
                : THEMES_CONFIG.previewCount;
            renderPreview(data.themes, 'themes-container', basePath, count);
        } else {
            previewContainer.innerHTML = '<p class="no-themes">Impossible de charger les thèmes.</p>';
        }
        return;
    }

    // ===== PAGE LISTE DES THÈMES =====
    const allContainer = document.getElementById('all-themes-container');
    if (allContainer) {
        const data = await loadThemes(jsonPath);
        if (data && data.themes) {
            renderAll(data.themes, 'all-themes-container', basePath);

            // Ajouter la recherche si le champ existe
            const searchInput = document.getElementById('themes-search');
            const categorySelect = document.getElementById('themes-category');

            if (searchInput || categorySelect) {
                const applyFilters = () => {
                    const filters = {
                        search: searchInput ? searchInput.value : '',
                        categorie: categorySelect ? categorySelect.value : ''
                    };
                    const filtered = filterThemes(data.themes, filters);
                    renderAll(filtered, 'all-themes-container', basePath);
                };

                if (searchInput) searchInput.addEventListener('input', applyFilters);
                if (categorySelect) categorySelect.addEventListener('change', applyFilters);
            }
        } else {
            allContainer.innerHTML = '<p class="no-themes">Impossible de charger les thèmes.</p>';
        }
        return;
    }
});


/* ================================================================
   10. UTILITAIRES
   ================================================================ */

/**
 * Échappe le HTML pour éviter les injections XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Formate une date en français long
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}


/* ================================================================
   11. EXPOSITION GLOBALE (utile pour le debug)
   ================================================================ */

window.MMCThemes = {
    load: loadThemes,
    renderPreview: renderPreview,
    renderAll: renderAll,
    filter: filterThemes,
    config: THEMES_CONFIG
};


/* ================================================================
   FIN DU SCRIPT
   ================================================================ */
