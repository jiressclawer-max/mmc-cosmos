/* ================================================================
   MMC - Maître Morazandry Cosmos
   Fichier : themes.js
   Description : Chargement dynamique des thèmes du jour
   ================================================================ */

'use strict';

const THEMES_CONFIG = {
    previewCount: 4,
    containerId: 'themes-container'
};

/**
 * Détecte le chemin de base selon l'emplacement de la page
 */
function detectBasePath() {
    const path = window.location.pathname;
    if (path.includes('/themes/')) {
        return '../';
    }
    return '';
}

/**
 * Vérifie si on est dans le dossier /themes/
 */
function isInThemesFolder() {
    return window.location.pathname.includes('/themes/');
}

/**
 * Charge le fichier JSON des thèmes
 */
async function loadThemes(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
        return await response.json();
    } catch (error) {
        console.error('❌ Erreur de chargement des thèmes :', error);
        return null;
    }
}

/**
 * Trie les thèmes par date décroissante
 */
function sortThemesByDate(themes) {
    return themes.slice().sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
}

/**
 * 🔧 Construit le bon lien selon le contexte
 */
function buildThemeLink(themeUrl) {
    if (isInThemesFolder()) {
        // On est dans /themes/ → on retire le préfixe "themes/"
        return themeUrl.replace(/^themes\//, '');
    }
    // On est à la racine → on garde "themes/jour-1.html"
    return themeUrl;
}

/**
 * Construit le bon chemin d'image selon le contexte
 */
function buildImagePath(imagePath, basePath) {
    if (!imagePath) return '';
    return basePath + imagePath;
}

/**
 * Crée une carte de thème
 */
function createThemeCard(theme, basePath) {
    const card = document.createElement('article');
    card.className = 'theme-card';

    const link = buildThemeLink(theme.url);
    const imageSrc = buildImagePath(theme.image, basePath);

    const imageHtml = imageSrc
        ? `<img src="${imageSrc}" alt="${escapeHtml(theme.titre)}" class="theme-card-image" loading="lazy" onerror="this.style.display='none';">`
        : '';

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

/**
 * Affiche les N derniers thèmes
 */
function renderPreview(themes, containerId, basePath, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const sorted = sortThemesByDate(themes);
    const latest = sorted.slice(0, count);
    container.innerHTML = '';

    if (latest.length === 0) {
        container.innerHTML = '<p class="no-themes">Aucun thème publié pour le moment.</p>';
        return;
    }

    latest.forEach(theme => {
        container.appendChild(createThemeCard(theme, basePath));
    });
}

/**
 * Affiche tous les thèmes
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

/**
 * Filtre les thèmes
 */
function filterThemes(themes, filters) {
    return themes.filter(theme => {
        if (filters.categorie && theme.categorie !== filters.categorie) {
            return false;
        }
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

/**
 * Échappe le HTML
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Formate une date en français
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

/**
 * Initialisation automatique
 */
document.addEventListener('DOMContentLoaded', async function () {
    const basePath = detectBasePath();
    const jsonPath = basePath + 'data/themes.json';

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

    // ===== PAGE LISTE =====
    const allContainer = document.getElementById('all-themes-container');
    if (allContainer) {
        const data = await loadThemes(jsonPath);
        if (data && data.themes) {
            renderAll(data.themes, 'all-themes-container', basePath);
        } else {
            allContainer.innerHTML = '<p class="no-themes">Impossible de charger les thèmes.</p>';
        }
    }
});

// Exposition globale
window.MMCThemes = {
    load: loadThemes,
    renderPreview: renderPreview,
    renderAll: renderAll,
    filter: filterThemes,
    config: THEMES_CONFIG,
    buildThemeLink: buildThemeLink,
    isInThemesFolder: isInThemesFolder
};
