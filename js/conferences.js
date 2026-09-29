/* ================================================================
   MMC - Maître Morazandry Cosmos
   Fichier : conferences.js
   Description : Chargement dynamique des conférences
   ================================================================ */

'use strict';

/* ================================================================
   1. CHARGEMENT DES DONNÉES
   ================================================================ */

async function loadConferences(jsonPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Erreur HTTP ' + response.status);
        return await response.json();
    } catch (error) {
        console.error('❌ Erreur de chargement des conférences :', error);
        return null;
    }
}

/* ================================================================
   2. UTILITAIRES
   ================================================================ */

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

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

function formatPrice(price, devise) {
    if (price === 0 || price === '0') return 'Gratuit';
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + (devise || 'Ar');
}

/* ================================================================
   3. CARTE DE CONFÉRENCE À VENIR
   ================================================================ */

function createUpcomingCard(conf) {
    const card = document.createElement('article');
    card.className = 'conference-card conference-upcoming';

    const imageHtml = conf.image
        ? `<img src="${conf.image}" alt="${escapeHtml(conf.titre)}" class="conference-image" loading="lazy" onerror="this.style.display='none';">`
        : `<div class="conference-image conference-image-placeholder">🎤</div>`;

    const priceClass = (conf.prix === 0 || conf.prix === '0') ? 'price-free' : 'price-paid';
    const placesRestantes = conf.places_restantes || 0;
    const complet = placesRestantes <= 0;

    card.innerHTML = `
        ${imageHtml}
        <div class="conference-body">
            <div class="conference-meta">
                <span class="conference-badge-theme">${escapeHtml(conf.theme)}</span>
                <span class="conference-badge-date">📅 ${formatDate(conf.date)}</span>
            </div>
            <h3 class="conference-title">${escapeHtml(conf.titre)}</h3>
            <p class="conference-description">${escapeHtml(conf.description)}</p>

            <div class="conference-info">
                <div class="conference-info-item">
                    <span class="info-label">🕐 Heure</span>
                    <span class="info-value">${escapeHtml(conf.heure)} · ${escapeHtml(conf.duree)}</span>
                </div>
                <div class="conference-info-item">
                    <span class="info-label">📍 Lieu</span>
                    <span class="info-value">${escapeHtml(conf.lieu)}</span>
                </div>
                <div class="conference-info-item">
                    <span class="info-label">💰 Prix</span>
                    <span class="info-value ${priceClass}">${formatPrice(conf.prix, conf.devise)}</span>
                </div>
                <div class="conference-info-item">
                    <span class="info-label">👥 Places</span>
                    <span class="info-value ${complet ? 'complet' : ''}">
                        ${complet ? '❌ Complet' : placesRestantes + ' places restantes'}
                    </span>
                </div>
            </div>

            ${complet
                ? `<span class="btn btn-disabled">❌ Complet</span>`
                : `<a href="${conf.inscription_url || '#'}" class="btn btn-primary">📝 Réserver ma place</a>`
            }
        </div>
    `;

    return card;
}

/* ================================================================
   4. CARTE DE CONFÉRENCE PASSÉE
   ================================================================ */

function createPastCard(conf) {
    const card = document.createElement('article');
    card.className = 'conference-card conference-past';

    const imageHtml = conf.image
        ? `<img src="${conf.image}" alt="${escapeHtml(conf.titre)}" class="conference-image" loading="lazy" onerror="this.style.display='none';">`
        : `<div class="conference-image conference-image-placeholder">🎬</div>`;

    // Vidéo
    const videoHtml = conf.video_url
        ? `
            <div class="conference-video">
                <iframe src="${conf.video_url}" title="Vidéo de la conférence ${escapeHtml(conf.titre)}"
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen loading="lazy"></iframe>
            </div>
        `
        : '';

    // Galerie photos
    const photosHtml = (conf.photos && conf.photos.length)
        ? `
            <div class="conference-gallery">
                <h4 class="gallery-title">📸 Photos de l'événement</h4>
                <div class="gallery-grid">
                    ${conf.photos.map(photo => `
                        <a href="${photo}" target="_blank" rel="noopener" class="gallery-item">
                            <img src="${photo}" alt="Photo de la conférence" loading="lazy" onerror="this.parentElement.style.display='none';">
                        </a>
                    `).join('')}
                </div>
            </div>
        `
        : '';

    card.innerHTML = `
        ${imageHtml}
        <div class="conference-body">
            <div class="conference-meta">
                <span class="conference-badge-theme">${escapeHtml(conf.theme)}</span>
                <span class="conference-badge-date">✅ Terminée le ${formatDate(conf.date)}</span>
                ${conf.participants ? `<span class="conference-badge-participants">👥 ${conf.participants} participants</span>` : ''}
            </div>
            <h3 class="conference-title">${escapeHtml(conf.titre)}</h3>
            <p class="conference-description">${escapeHtml(conf.description)}</p>

            <div class="conference-info">
                <div class="conference-info-item">
                    <span class="info-label">📍 Lieu</span>
                    <span class="info-value">${escapeHtml(conf.lieu)}</span>
                </div>
                <div class="conference-info-item">
                    <span class="info-label">🕐 Durée</span>
                    <span class="info-value">${escapeHtml(conf.duree)}</span>
                </div>
            </div>

            ${videoHtml}
            ${photosHtml}
        </div>
    `;

    return card;
}

/* ================================================================
   5. AFFICHAGE
   ================================================================ */

function renderUpcoming(conferences, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const upcoming = conferences
        .filter(c => c.statut === 'a_venir')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = '';

    if (upcoming.length === 0) {
        container.innerHTML = '<p class="no-conferences">Aucune conférence à venir pour le moment.</p>';
        return;
    }

    upcoming.forEach(conf => {
        container.appendChild(createUpcomingCard(conf));
    });
}

function renderPast(conferences, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const past = conferences
        .filter(c => c.statut === 'terminee')
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = '';

    if (past.length === 0) {
        container.innerHTML = '<p class="no-conferences">Aucune conférence passée pour le moment.</p>';
        return;
    }

    past.forEach(conf => {
        container.appendChild(createPastCard(conf));
    });
}

/* ================================================================
   6. INITIALISATION
   ================================================================ */

document.addEventListener('DOMContentLoaded', async function () {
    // Détecter le chemin de base
    const path = window.location.pathname;
    const basePath = path.includes('/themes/') ? '../' : '';
    const jsonPath = basePath + 'data/conferences.json';

    const data = await loadConferences(jsonPath);
    if (!data || !data.conferences) return;

    renderUpcoming(data.conferences, 'upcoming-conferences');
    renderPast(data.conferences, 'past-conferences');
});

/* ================================================================
   7. EXPOSITION GLOBALE
   ================================================================ */

window.MMCConferences = {
    load: loadConferences,
    renderUpcoming: renderUpcoming,
    renderPast: renderPast
};
