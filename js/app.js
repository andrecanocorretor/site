// js/app.js - Cano's Negócios Imobiliários - Lógica Completa

// Variáveis Globais
let properties = [];
let favorites = new Set(JSON.parse(localStorage.getItem('favorites')) || []);
const PROPERTIES_DATA_URL = 'data/properties.json';

// --- Utilitários ---

/**
 * Formata um número para o padrão monetário BRL.
 * @param {number} value
 * @returns {string}
 */
const formatBRL = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(value);
};

/**
 * Atualiza o contador de favoritos no header.
 */
const updateFavoriteCounter = () => {
    const counterElement = document.getElementById('favorite-count');
    if (counterElement) {
        counterElement.textContent = favorites.size;
    }
};

/**
 * Salva a lista de favoritos no LocalStorage.
 */
const saveFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    updateFavoriteCounter();
};

// --- Favoritos (Base) ---

/**
 * Alterna o estado de favorito de um imóvel.
 * @param {string} propertyId
 * @param {HTMLElement} buttonElement
 */
const toggleFavorite = (propertyId, buttonElement) => {
    if (favorites.has(propertyId)) {
        favorites.delete(propertyId);
        if (buttonElement) buttonElement.classList.remove('active');
    } else {
        favorites.add(propertyId);
        if (buttonElement) buttonElement.classList.add('active');
    }
    saveFavorites();
};

/**
 * Define o evento de clique para o botão de favorito.
 * @param {HTMLElement} buttonElement
 * @param {string} propertyId
 */
const setupFavoriteButton = (buttonElement, propertyId) => {
    if (favorites.has(propertyId)) {
        buttonElement.classList.add('active');
    }
    buttonElement.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(propertyId, buttonElement);
        // Se estiver na página de favoritos, pode ser necessário re-renderizar
        if (window.location.pathname.includes('listings.html') && document.getElementById('filter-favorites')?.checked) {
             renderProperties(filterAndSortProperties());
        }
    };
};

// --- Renderização de Cards ---

/**
 * Cria o HTML para um card de imóvel.
 * @param {object} property
 * @returns {string}
 */
const createPropertyCardHTML = (property) => {
    const tagsHTML = property.tags.map(tag =>
        `<span class="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">${tag}</span>`
    ).join('');

    const isFavorite = favorites.has(property.id) ? 'active' : '';

    return `
        <div data-id="${property.id}" class="bg-white rounded-xl overflow-hidden shadow-pro transition-base flex flex-col">
            <a href="property.html?id=${property.id}" class="block relative group">
                <img loading="lazy" class="w-full h-48 object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-in-out"
                    src="${property.images[0]}" alt="Imagem de ${property.name}">
            </a>
            <div class="p-5 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-gray-900 leading-tight">
                        <a href="property.html?id=${property.id}" class="hover:text-blue-700 transition-colors">${property.name}</a>
                    </h3>
                    <button class="favorite-btn ${isFavorite} p-1 rounded-full text-gray-400 hover:text-yellow-500 transition-base" data-property-id="${property.id}">
                        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.637-.921 1.937 0l1.24 3.791a1.5 1.5 0 001.42.991h3.993c.956 0 1.34.821.57 1.408l-3.235 2.348a1.5 1.5 0 00-.54.673l-1.24 3.791c-.3.921-1.637.921-1.937 0l-1.24-3.791a1.5 1.5 0 00-.54-.673l-3.235-2.348c-.77-.587-.386-1.408.57-1.408h3.993a1.5 1.5 0 001.42-.991l1.24-3.791z" />
                        </svg>
                    </button>
                </div>
                <p class="text-2xl font-extrabold text-blue-800 mb-2">${formatBRL(property.price)}</p>
                <div class="flex items-center text-gray-600 text-sm mb-4 space-x-4">
                    ${property.bedrooms > 0 ? `<span class="flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> ${property.bedrooms} Quartos</span>` : ''}
                    ${property.bathrooms > 0 ? `<span class="flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 8v4m0 4v4m-4-8H4m16 0h-4m-4 4H4m16 0h-4M4 8h4m12 0h-4"></path></svg> ${property.bathrooms} Banh.</span>` : ''}
                    <span class="flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> ${property.city}</span>
                </div>
                <div class="mt-auto">
                    <div class="flex flex-wrap mb-4">${tagsHTML}</div>
                    <a href="./property.html?id=${property.id}" class="block w-full text-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 transition-base">
                        Ver Detalhes
                    </a>
                </div>
            </div>
        </div>
    `;
};

/**
 * Renderiza a lista de cards de imóveis.
 * @param {Array<object>} propertyList
 * @param {string} containerId
 */
const renderProperties = (propertyList, containerId = 'listings-container') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (propertyList.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-10 bg-gray-50 rounded-lg">
                <p class="text-xl text-gray-600">Nenhum imóvel encontrado com os critérios de busca/filtro.</p>
                <p class="text-sm text-gray-500 mt-2">Tente ajustar os filtros ou limpar a busca.</p>
            </div>
        `;
    } else {
        container.innerHTML = propertyList.map(createPropertyCardHTML).join('');
        // Configura os botões de favorito após a renderização
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            setupFavoriteButton(btn, btn.dataset.propertyId);
        });
    }
};

// --- Carregamento de Dados ---

/**
 * Carrega os dados dos imóveis.
 * @returns {Promise<Array<object>>}
 */
const fetchProperties = async () => {
    try {
        const response = await fetch(PROPERTIES_DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Adiciona timestamp para simular "mais recente"
        data.forEach((p, index) => p.timestamp = Date.now() - (data.length - 1 - index) * 60000);
        return data;
    } catch (error) {
        console.error("Erro ao carregar os dados dos imóveis:", error);
        return [];
    }
};

// --- Lógica de Filtros e Busca (Apenas em listings.html) ---

/**
 * Normaliza uma string para busca.
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Aplica filtros e ordenação nos imóveis.
 * @returns {Array<object>}
 */
const filterAndSortProperties = () => {
    if (!properties.length) return [];

    const searchInput = document.getElementById('search-input')?.value.trim();
    const cityFilter = document.getElementById('filter-city')?.value;
    const minPriceFilter = parseFloat(document.getElementById('filter-min-price')?.value) || 0;
    const maxPriceFilter = parseFloat(document.getElementById('filter-max-price')?.value) || Infinity;
    const bedroomsFilter = document.getElementById('filter-bedrooms')?.value;
    const tagsFilter = Array.from(document.querySelectorAll('input[name="filter-tag"]:checked')).map(cb => cb.value);
    const favoritesFilter = document.getElementById('filter-favorites')?.checked;
    const sortSelect = document.getElementById('sort-select')?.value || 'recent';

    let filtered = properties;

    // 1. Busca Full-Text
    if (searchInput) {
        const normalizedSearch = normalizeText(searchInput);
        filtered = filtered.filter(p =>
            normalizeText(p.name).includes(normalizedSearch) ||
            normalizeText(p.address).includes(normalizedSearch) ||
            normalizeText(p.description).includes(normalizedSearch)
        );
    }

    // 2. Filtros de Seleção/Range
    filtered = filtered.filter(p => {
        const cityMatch = !cityFilter || p.city === cityFilter;
        const priceMatch = p.price >= minPriceFilter && p.price <= maxPriceFilter;
        const bedroomsMatch = !bedroomsFilter || bedroomsFilter === 'all' || p.bedrooms === parseInt(bedroomsFilter) || (bedroomsFilter === '4+' && p.bedrooms >= 4);
        const tagsMatch = tagsFilter.length === 0 || tagsFilter.every(tag => p.tags.includes(tag));
        const favoritesMatch = !favoritesFilter || favorites.has(p.id);

        return cityMatch && priceMatch && bedroomsMatch && tagsMatch && favoritesMatch;
    });

    // 3. Ordenação
    switch (sortSelect) {
        case 'recent':
            filtered.sort((a, b) => b.timestamp - a.timestamp); // Mais recente
            break;
        case 'price_asc':
            filtered.sort((a, b) => a.price - b.price); // Menor preço
            break;
        case 'price_desc':
            filtered.sort((a, b) => b.price - a.price); // Maior preço
            break;
    }

    return filtered;
};

/**
 * Inicializa a lógica de filtros e busca na página listings.html.
 */
const setupListingsPage = () => {
    const filterControls = document.querySelectorAll('#filter-form select, #filter-form input');

    const applyFilters = () => {
        const filteredList = filterAndSortProperties();
        renderProperties(filteredList);
    };

    filterControls.forEach(control => {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters); // Para select e checkbox
    });

    document.getElementById('search-button')?.addEventListener('click', applyFilters);

    // Botão Limpar Filtros
    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
        document.getElementById('filter-form')?.reset();
        applyFilters();
    });

    // Primeira renderização ao carregar
    applyFilters();
};

// --- Lógica de Detalhes do Imóvel (property.html) ---

/**
 * Cria o schema JSON-LD para SEO/Estrutura de Dados.
 * @param {object} property
 * @returns {object}
 */
const createJsonLdSchema = (property) => {
    const schemaType = property.type === 'Residence' ? 'schema:Residence' : 'schema:Offer';
    const address = `${property.address}, ${property.city}`;

    return {
        "@context": "https://schema.org",
        "@type": schemaType.split(':')[1], // Residence ou Offer
        "name": property.name,
        "description": property.description,
        "image": property.images[0],
        "offers": {
            "@type": "Offer",
            "priceCurrency": "BRL",
            "price": property.price,
            "availability": "https://schema.org/InStock"
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": property.address,
            "addressLocality": property.city,
            "addressCountry": "BR"
        },
        "numberOfBedrooms": property.bedrooms || undefined,
        "floorSize": {
            "@type": "QuantitativeValue",
            "value": property.area_sqm,
            "unitCode": "SQM"
        }
    };
};

/**
 * Renderiza os detalhes de um imóvel na página property.html.
 * @param {object} property
 */
const renderPropertyDetails = (property) => {
    document.getElementById('property-name').textContent = property.name;
    document.getElementById('property-price').textContent = formatBRL(property.price);
    document.getElementById('property-description').textContent = property.description;
    document.getElementById('property-city').textContent = property.city;
    document.getElementById('property-address').textContent = property.address;

    const detailsContainer = document.getElementById('property-details');
    detailsContainer.innerHTML = `
        ${property.bedrooms > 0 ? `<li class="flex items-center space-x-2"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span>${property.bedrooms} Quartos</span></li>` : ''}
        ${property.bathrooms > 0 ? `<li class="flex items-center space-x-2"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 8v4m0 4v4m-4-8H4m16 0h-4m-4 4H4m16 0h-4M4 8h4m12 0h-4"></path></svg><span>${property.bathrooms} Banheiros</span></li>` : ''}
        <li class="flex items-center space-x-2"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg><span>${property.area_sqm} m²</span></li>
    `;

    const tagsHTML = property.tags.map(tag =>
        `<span class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-3 py-1 rounded-full">${tag}</span>`
    ).join('');
    document.getElementById('property-tags').innerHTML = tagsHTML;

    // Galeria de Imagens
    const galleryContainer = document.getElementById('property-gallery');
    galleryContainer.innerHTML = property.images.map((img, index) => `
        <img loading="lazy" src="${img}" alt="Galeria ${index + 1}" class="w-full h-64 object-cover rounded-lg shadow-md cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]" onclick="openLightbox('${img}')">
    `).join('');

    // Botão de Favorito
    const favButton = document.getElementById('property-favorite-btn');
    if (favButton) {
        setupFavoriteButton(favButton, property.id);
    }

    // JSON-LD
    const jsonLd = createJsonLdSchema(property);
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Web Share API
    const shareButton = document.getElementById('property-share-btn');
    if (shareButton) {
        if (navigator.share) {
            shareButton.onclick = () => {
                navigator.share({
                    title: property.name,
                    text: `Confira este imóvel incrível: ${property.name}!`,
                    url: window.location.href,
                }).catch(error => console.error('Erro ao compartilhar:', error));
            };
        } else {
            // Fallback para navegadores sem Web Share API
            shareButton.onclick = () => {
                alert("A API de Compartilhamento Web não está disponível. Copie a URL manualmente.");
            };
        }
    }
};

/**
 * Inicializa a galeria lightbox.
 */
const setupLightbox = () => {
    window.openLightbox = (imgSrc) => {
        const overlay = document.getElementById('lightbox-overlay');
        const content = document.getElementById('lightbox-content');
        if (overlay && content) {
            content.innerHTML = `<img src="${imgSrc}" alt="Imagem Ampliada">`;
            overlay.classList.add('active');
        }
    };

    document.getElementById('lightbox-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox-overlay') {
            document.getElementById('lightbox-overlay')?.classList.remove('active');
        }
    });
};

// --- Roteamento e Inicialização ---

/**
 * Roteia a lógica a ser executada com base na página atual.
 */
const initialize = async () => {
    // 1. Carregar Dados Globais
    properties = await fetchProperties();
    updateFavoriteCounter(); // Garante que o contador esteja correto em todas as páginas

    // 2. Roteamento de Páginas
    const path = window.location.pathname;

    // Lógica para index.html (Home)
    if (path.includes('index.html') || path === '/' || path === '/index.html') {
        const featured = properties.filter(p => p.is_featured).slice(0, 3); // Apenas 3 destaques
        renderProperties(featured, 'featured-listings');

        // Lógica de busca rápida na home
        document.getElementById('quick-search-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchVal = document.getElementById('quick-search-input').value.trim();
            const cityVal = document.getElementById('quick-search-city').value;
            let targetUrl = 'listings.html';
            let params = new URLSearchParams();

            if (searchVal) params.set('search', searchVal);
            if (cityVal && cityVal !== 'all') params.set('city', cityVal);

            if (params.toString()) {
                targetUrl += '?' + params.toString();
            }
            window.location.href = targetUrl;
        });

        // Preenche as opções de cidade na busca rápida
        const citySelect = document.getElementById('quick-search-city');
        if (citySelect) {
            const cities = [...new Set(properties.map(p => p.city))].sort();
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
    }

    // Lógica para listings.html (Grade de Imóveis)
    if (path.includes('listings.html')) {
        setupListingsPage();

        // Tratamento de parâmetros de busca da home
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        const cityParam = urlParams.get('city');

        if (searchParam) {
            document.getElementById('search-input').value = searchParam;
        }
        if (cityParam) {
            document.getElementById('filter-city').value = cityParam;
        }

        if (searchParam || cityParam) {
            // Re-aplicar filtros com base nos parâmetros da URL
            renderProperties(filterAndSortProperties());
        }
    }

    // Lógica para property.html (Detalhes)
    if (path.includes('property.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');

        if (propertyId) {
            const property = properties.find(p => p.id === propertyId);
            if (property) {
                renderPropertyDetails(property);
                setupLightbox();
            } else {
                document.querySelector('main').innerHTML = `
                    <div class="container mx-auto p-8 text-center">
                        <h1 class="text-4xl font-bold text-red-600 mb-4">Imóvel Não Encontrado</h1>
                        <p class="text-lg text-gray-600">O imóvel com o ID ${propertyId} não existe ou foi removido.</p>
                        <a href="listings.html" class="mt-6 inline-block text-white bg-blue-700 hover:bg-blue-800 py-2 px-4 rounded transition-base">Ver Todos os Imóveis</a>
                    </div>
                `;
            }
        }
    }
};

// Iniciar aplicação
document.addEventListener('DOMContentLoaded', initialize);