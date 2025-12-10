// ============================================================================
// ANIME DISCOVERY DASHBOARD - ULTIMATE EDITION
// All 10 Advanced Features Implemented
// ============================================================================

// Global state
let DATA = null;
let filteredAnime = [];
let currentAnime = null;
let charts = {};
let currentTheme = null;
let sortDirection = {};

// Genre color themes (intuitive associations)
const GENRE_THEMES = {
    'Action': 'theme-action',              // Red - energy, adrenaline
    'Adventure': 'theme-adventure',        // Green - exploration, nature
    'Comedy': 'theme-comedy',              // Yellow/gold - joy, laughter
    'Drama': 'theme-drama',                // Blue - emotion, depth
    'Fantasy': 'theme-fantasy',            // Purple - magic, imagination
    'Romance': 'theme-romance',            // Pink/rose - love, warmth
    'Sci-Fi': 'theme-scifi',              // Dark blue - space, technology
    'Sports': 'theme-sports',              // Bright blue - energy, competition
    'Thriller': 'theme-thriller',          // Gray - tension, suspense
    'Horror': 'theme-horror',              // Black - fear, darkness
    'Mystery': 'theme-mystery',            // Dark gray - intrigue, unknown
    'Supernatural': 'theme-supernatural',  // Purple - otherworldly
    'Award Winning': 'theme-awardwinning'  // Gold - prestige, excellence
};

// Genre to color mapping for charts
const GENRE_COLORS = {
    'Action': 'rgba(231, 76, 60, 0.8)',
    'Adventure': 'rgba(39, 174, 96, 0.8)',
    'Comedy': 'rgba(241, 196, 15, 0.8)',
    'Drama': 'rgba(52, 152, 219, 0.8)',
    'Fantasy': 'rgba(155, 89, 182, 0.8)',
    'Romance': 'rgba(233, 30, 99, 0.8)',
    'Sci-Fi': 'rgba(30, 58, 138, 0.8)',
    'Sports': 'rgba(37, 99, 235, 0.8)',
    'Thriller': 'rgba(107, 114, 128, 0.8)',
    'Horror': 'rgba(31, 31, 31, 0.8)',
    'Mystery': 'rgba(74, 85, 104, 0.8)',
    'Supernatural': 'rgba(124, 58, 237, 0.8)',
    'Award Winning': 'rgba(217, 119, 6, 0.8)'
};

// ============================================================================
// INITIALIZATION
// ============================================================================

async function loadData() {
    try {
        const response = await fetch('anime_data_full.json');
        DATA = await response.json();
        filteredAnime = DATA.anime;
        document.getElementById('loadingIndicator').style.display = 'none';
        init();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loadingIndicator').innerHTML = 
            '<p style="color: #e53e3e;">Error loading data. Please ensure anime_data_full.json is in the same directory.</p>';
    }
}

function init() {
    populateFilters();
    setupEventListeners();
    createAllCharts();
    updateStats();
    renderTable();
    console.log(`✅ Loaded ${DATA.anime.length.toLocaleString()} anime`);
}

// ============================================================================
// RANDOM ANIME FEATURE (SFW - No Hentai/Ecchi/Erotica)
// ============================================================================

function randomAnime() {
    console.log('🎲 Random Anime button clicked');
    
    // Comprehensive list of adult/inappropriate genres to block
    const blockedGenres = [
        'hentai',
        'ecchi', 
        'erotica',
        'girls',  // "Girls" genre often has ecchi content
        'boys'    // Similar for "Boys"
    ];
    
    const sfwAnime = DATA.anime.filter(anime => {
        const genreLower = anime.g.toLowerCase();
        const nameLower = anime.n.toLowerCase();
        
        // Block if genre contains any blocked term
        const hasBlockedGenre = blockedGenres.some(blocked => genreLower.includes(blocked));
        
        // Block if name contains obvious adult keywords
        const hasBlockedName = nameLower.includes('hentai') || 
                               nameLower.includes('ecchi') ||
                               nameLower.includes('18+');
        
        return !hasBlockedGenre && !hasBlockedName;
    });
    
    console.log(`✓ Filtered to ${sfwAnime.length} SFW anime (from ${DATA.anime.length} total)`);
    
    if (sfwAnime.length === 0) {
        alert('No SFW anime found!');
        return;
    }
    
    // Pick a random anime
    const randomIndex = Math.floor(Math.random() * sfwAnime.length);
    const randomPick = sfwAnime[randomIndex];
    
    console.log(`🎲 Random pick: ${randomPick.n} (${randomPick.g}, Rating: ${randomPick.s})`);
    
    // Show in modal
    showAnimeDetail(randomPick);
}

// ============================================================================
// FEATURE 1: FUZZY SEARCH (Levenshtein Distance)
// ============================================================================

function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function fuzzySearch(query, threshold = 3) {
    query = query.toLowerCase().trim();
    
    if (query.length === 0) return [];
    
    const results = DATA.anime
        .map(anime => {
            const name = anime.n.toLowerCase();
            let score = 0;
            
            // Exact match gets highest priority
            if (name === query) {
                score = 1000;
            }
            // Starts with query
            else if (name.startsWith(query)) {
                score = 500;
            }
            // Contains query as substring
            else if (name.includes(query)) {
                score = 250;
            }
            // Check individual words
            else {
                const nameWords = name.split(/\s+/);
                const queryWords = query.split(/\s+/);
                
                for (const qWord of queryWords) {
                    for (const nWord of nameWords) {
                        // Word starts with query word
                        if (nWord.startsWith(qWord) && qWord.length >= 2) {
                            score += 100;
                        }
                        // Fuzzy match with Levenshtein
                        else if (qWord.length >= 3) {
                            const distance = levenshteinDistance(qWord, nWord);
                            if (distance <= threshold) {
                                score += (50 - distance * 10);
                            }
                        }
                    }
                }
            }
            
            return { anime, score };
        })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(result => result.anime);
    
    return results;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const term = e.target.value.trim();
            
            if (term.length < 2) {
                searchResults.classList.remove('active');
                return;
            }
            
            const matches = fuzzySearch(term);
            
            if (matches.length > 0) {
                searchResults.innerHTML = matches.map(anime => {
                    const highlighted = highlightMatch(anime.n, term);
                    return `
                        <div class="search-result-item" onclick='showAnimeDetail(${JSON.stringify(anime).replace(/'/g, "&#39;")})'>
                            <strong>${highlighted}</strong><br>
                            <small>⭐ ${anime.s} • 🎭 ${anime.g} • 📺 ${anime.e} eps • ${anime.t}</small>
                        </div>
                    `;
                }).join('');
                searchResults.classList.add('active');
            } else {
                searchResults.innerHTML = '<div class="search-result-item">No matches found. Try different keywords!</div>';
                searchResults.classList.add('active');
            }
        }, 300);
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

function highlightMatch(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    return text.substring(0, index) + 
           '<span class="search-highlight">' + 
           text.substring(index, index + query.length) + 
           '</span>' + 
           text.substring(index + query.length);
}

// ============================================================================
// FEATURE 2: DYNAMIC GENRE THEMING
// ============================================================================

function applyGenreTheme(genre) {
    const body = document.body;
    
    // Remove all theme classes
    Object.values(GENRE_THEMES).forEach(theme => {
        body.classList.remove(theme);
    });
    
    // Apply new theme if genre matches
    const themeClass = GENRE_THEMES[genre];
    if (themeClass) {
        body.classList.add(themeClass);
        currentTheme = genre;
        console.log(`🎨 Applied ${genre} theme`);
    } else {
        currentTheme = null;
    }
}

// ============================================================================
// FEATURE 3: CLICKABLE GENRE CHART
// ============================================================================

function createGenreChart() {
    const ctx = document.getElementById('genreChart').getContext('2d');
    
    const sortedIndices = DATA.genreStats.scores
        .map((score, index) => ({ score, index }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.index);
    
    const sortedLabels = sortedIndices.map(i => DATA.genreStats.labels[i]);
    const sortedScores = sortedIndices.map(i => DATA.genreStats.scores[i]);
    const sortedCounts = sortedIndices.map(i => DATA.genreStats.counts[i]);
    
    // Use genre-specific colors for bars
    const barColors = sortedLabels.map(genre => 
        GENRE_COLORS[genre] || 'rgba(102, 126, 234, 0.8)'
    );
    
    const borderColors = sortedLabels.map(genre => {
        const color = GENRE_COLORS[genre] || 'rgba(102, 126, 234, 1)';
        return color.replace('0.8)', '1)');
    });
    
    charts.genre = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLabels,
            datasets: [{
                label: 'Average Rating',
                data: sortedScores,
                backgroundColor: barColors,
                borderColor: borderColors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const genre = sortedLabels[index];
                    filterByGenre(genre);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: (context) => {
                            return [
                                `Count: ${sortedCounts[context.dataIndex].toLocaleString()} anime`,
                                '',
                                '💡 Click to filter by this genre'
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 5,
                    max: 9,
                    title: { display: true, text: 'Average Rating' }
                },
                x: {
                    ticks: { maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });
}

function filterByGenre(genre) {
    document.getElementById('genreFilter').value = genre;
    applyGenreTheme(genre);
    updateBreadcrumb(`Filtered by: ${genre}`);
    filterData();
}

function updateBreadcrumb(text) {
    const breadcrumb = document.getElementById('breadcrumb');
    const breadcrumbText = document.getElementById('breadcrumbText');
    
    if (text) {
        breadcrumbText.textContent = text;
        breadcrumb.classList.add('active');
    } else {
        breadcrumb.classList.remove('active');
    }
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = 'All';
    document.getElementById('typeFilter').value = 'All';
    document.getElementById('episodeFilter').value = 'All';
    applyGenreTheme(null);
    updateBreadcrumb(null);
    filterData();
}

// ============================================================================
// FEATURE 4: FULL DATASET TABLE
// ============================================================================

function renderTable(sortBy = 's', direction = 'desc') {
    const tbody = document.getElementById('tableBody');
    const searchTerm = document.getElementById('tableSearch')?.value.toLowerCase() || '';
    
    let displayAnime = filteredAnime;
    
    if (searchTerm) {
        displayAnime = displayAnime.filter(a => 
            a.n.toLowerCase().includes(searchTerm) ||
            a.g.toLowerCase().includes(searchTerm) ||
            a.t.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort
    displayAnime = [...displayAnime].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    // Paginate - show top 1000 for performance
    const display = displayAnime.slice(0, 1000);
    
    tbody.innerHTML = display.map(anime => `
        <tr onclick='showAnimeDetail(${JSON.stringify(anime).replace(/'/g, "&#39;")})'>
            <td><strong>${anime.n}</strong></td>
            <td>⭐ ${anime.s}</td>
            <td>${anime.g}</td>
            <td>${anime.t}</td>
            <td>${anime.e}</td>
            <td>${anime.m.toLocaleString()}</td>
            <td>${anime.y || 'N/A'}</td>
        </tr>
    `).join('');
    
    if (displayAnime.length > 1000) {
        tbody.innerHTML += `
            <tr style="background: #f7fafc;">
                <td colspan="7" style="text-align: center; font-style: italic; color: #718096;">
                    Showing top 1,000 of ${displayAnime.length.toLocaleString()} results
                </td>
            </tr>
        `;
    }
}

function sortTable(column) {
    const currentSort = sortDirection[column] || 'desc';
    const newSort = currentSort === 'desc' ? 'asc' : 'desc';
    sortDirection = { [column]: newSort };
    renderTable(column, newSort);
}

// ============================================================================
// HIDDEN GEMS FEATURE
// ============================================================================

// ============================================================================
// FEATURE 6: GENRE COMPARISON MODE
// ============================================================================

function createGenreCheckboxes() {
    const container = document.getElementById('genreCheckboxes');
    const genres = DATA.genreStats.labels;
    
    container.innerHTML = genres.map(genre => `
        <label class="genre-checkbox">
            <input type="checkbox" value="${genre}" onchange="updateComparison()">
            <span>${genre}</span>
        </label>
    `).join('');
}

function updateComparison() {
    const checkboxes = document.querySelectorAll('#genreCheckboxes input:checked');
    const selectedGenres = Array.from(checkboxes).map(cb => cb.value);
    
    // Update UI
    document.querySelectorAll('.genre-checkbox').forEach(label => {
        const checkbox = label.querySelector('input');
        if (checkbox.checked) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });
    
    if (selectedGenres.length === 0) {
        // Show placeholder
        if (charts.comparison) {
            charts.comparison.destroy();
            charts.comparison = null;
        }
        return;
    }
    
    // Calculate distributions for each genre
    const datasets = selectedGenres.map((genre, index) => {
        const genreAnime = DATA.anime.filter(a => a.g === genre);
        const scores = genreAnime.map(a => a.s);
        
        // Create histogram bins
        const bins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const counts = bins.slice(0, -1).map((bin, i) => {
            return scores.filter(s => s >= bin && s < bins[i + 1]).length;
        });
        
        const colors = [
            'rgba(231, 76, 60, 0.7)',
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)'
        ];
        
        return {
            label: genre,
            data: counts,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.7', '1'),
            borderWidth: 2
        };
    });
    
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    if (charts.comparison) {
        charts.comparison.destroy();
    }
    
    charts.comparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Comparing ${selectedGenres.join(' vs ')}`
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${context.parsed.y} anime`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Anime' }
                },
                x: {
                    title: { display: true, text: 'Rating Range' }
                }
            }
        }
    });
}

// ============================================================================
// FEATURE 7: RATING DISTRIBUTION
// ============================================================================

function createDistributionChart() {
    const scores = filteredAnime.map(a => a.s);
    
    // Create bins
    const bins = [];
    for (let i = 0; i <= 10; i += 0.5) {
        bins.push(i);
    }
    
    const counts = bins.slice(0, -1).map((bin, i) => {
        return scores.filter(s => s >= bin && s < bins[i + 1]).length;
    });
    
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    if (charts.distribution) {
        charts.distribution.destroy();
    }
    
    charts.distribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.slice(0, -1).map((b, i) => `${b.toFixed(1)}-${bins[i+1].toFixed(1)}`),
            datasets: [{
                label: 'Number of Anime',
                data: counts,
                backgroundColor: 'rgba(102, 126, 234, 0.7)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: `Distribution of ${filteredAnime.length.toLocaleString()} Anime Ratings`
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const total = filteredAnime.length;
                            const count = context.parsed.y;
                            const percent = ((count / total) * 100).toFixed(1);
                            return [
                                `Count: ${count} anime`,
                                `Percentage: ${percent}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Anime' }
                },
                x: {
                    title: { display: true, text: 'Rating Range' }
                }
            }
        }
    });
}

// ============================================================================
// OTHER CHARTS
// ============================================================================

function createEpisodeChart() {
    const ctx = document.getElementById('episodeChart').getContext('2d');
    
    charts.episode = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: DATA.episodeStats.labels,
            datasets: [{
                label: 'Average Rating',
                data: DATA.episodeStats.scores,
                backgroundColor: 'rgba(118, 75, 162, 0.8)',
                borderColor: 'rgba(118, 75, 162, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: (context) => {
                            return `Count: ${DATA.episodeStats.counts[context.dataIndex].toLocaleString()} anime`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 5,
                    max: 9,
                    title: { display: true, text: 'Average Rating' }
                }
            }
        }
    });
}

function createTypeChart() {
    const ctx = document.getElementById('typeChart').getContext('2d');
    
    charts.type = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: DATA.typeStats.labels,
            datasets: [{
                label: 'Average Rating',
                data: DATA.typeStats.scores,
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(41, 128, 185, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: (context) => {
                            return `Count: ${DATA.typeStats.counts[context.dataIndex].toLocaleString()} anime`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 5,
                    max: 9,
                    title: { display: true, text: 'Average Rating' }
                }
            }
        }
    });
}

function createScatterChart() {
    const ctx = document.getElementById('scatterChart').getContext('2d');
    const sample = filteredAnime.slice(0, 1000);
    const scatterData = sample.map(a => ({
        x: a.m,
        y: a.s,
        name: a.n,
        genre: a.g
    }));
    
    if (charts.scatter) {
        charts.scatter.destroy();
    }
    
    charts.scatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Anime',
                data: scatterData,
                backgroundColor: 'rgba(102, 126, 234, 0.5)',
                borderColor: 'rgba(102, 126, 234, 0.8)',
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const point = context.raw;
                            return [
                                point.name,
                                `Rating: ${point.y}`,
                                `Members: ${point.x.toLocaleString()}`,
                                `Genre: ${point.genre}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'logarithmic',
                    title: { display: true, text: 'Members (Popularity - Log Scale)' }
                },
                y: {
                    title: { display: true, text: 'Rating' },
                    min: 5,
                    max: 10
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const anime = sample[index];
                    showAnimeDetail(anime);
                }
            }
        }
    });
}

function createTopAnimeChart() {
    const ctx = document.getElementById('topAnimeChart').getContext('2d');
    const top50 = filteredAnime.slice(0, 50);
    
    if (charts.topAnime) {
        charts.topAnime.destroy();
    }
    
    charts.topAnime = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top50.map(a => a.n.length > 30 ? a.n.substring(0, 30) + '...' : a.n),
            datasets: [{
                label: 'Rating',
                data: top50.map(a => a.s),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (context) => top50[context[0].dataIndex].n,
                        label: (context) => {
                            const anime = top50[context.dataIndex];
                            return [
                                `Rating: ${anime.s}`,
                                `Genre: ${anime.g}`,
                                `Type: ${anime.t}`,
                                `Episodes: ${anime.e}`,
                                `Members: ${anime.m.toLocaleString()}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 7,
                    max: 10,
                    title: { display: true, text: 'Rating' }
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const anime = top50[elements[0].index];
                    showAnimeDetail(anime);
                }
            }
        }
    });
}

function createAllCharts() {
    createGenreChart();
    createGenreCheckboxes();
    createEpisodeChart();
    createTypeChart();
    createScatterChart();
    createTopAnimeChart();
    createDistributionChart();
}

// ============================================================================
// FILTERING & UPDATES
// ============================================================================

function filterData() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const genre = document.getElementById('genreFilter').value;
    const type = document.getElementById('typeFilter').value;
    const episodes = document.getElementById('episodeFilter').value;
    
    filteredAnime = DATA.anime.filter(anime => {
        const matchSearch = search === '' || anime.n.toLowerCase().includes(search);
        const matchGenre = genre === 'All' || anime.g === genre;
        const matchType = type === 'All' || anime.t === type;
        const matchEpisodes = episodes === 'All' || anime.r === episodes;
        return matchSearch && matchGenre && matchType && matchEpisodes;
    });
    
    updateStats();
    createDistributionChart();
    createScatterChart();
    createTopAnimeChart();
    renderTable();
}

function updateStats() {
    document.getElementById('totalAnime').textContent = DATA.anime.length.toLocaleString();
    document.getElementById('filteredCount').textContent = filteredAnime.length.toLocaleString();
    
    const avgScore = filteredAnime.length > 0
        ? (filteredAnime.reduce((sum, a) => sum + a.s, 0) / filteredAnime.length).toFixed(2)
        : '0.00';
    document.getElementById('avgScore').textContent = avgScore;
}

// ============================================================================
// MODAL & DETAILS
// ============================================================================

function showAnimeDetail(anime) {
    currentAnime = anime;
    document.getElementById('searchResults').classList.remove('active');
    
    document.getElementById('modalTitle').textContent = anime.n;
    document.getElementById('modalStats').innerHTML = `
        ⭐ <strong>Rating:</strong> ${anime.s}/10<br>
        🎭 <strong>Genre:</strong> ${anime.g}<br>
        🎬 <strong>Type:</strong> ${anime.t}<br>
        📺 <strong>Episodes:</strong> ${anime.e}<br>
        📅 <strong>Year:</strong> ${anime.y || 'Unknown'}<br>
        👥 <strong>Members:</strong> ${anime.m.toLocaleString()}<br>
        📊 <strong>Range:</strong> ${anime.r}
    `;
    
    createComparisonChart(anime);
    generateRecommendations(anime);
    
    document.getElementById('animeModal').classList.add('active');
}

function createComparisonChart(anime) {
    const similar = DATA.anime
        .filter(a => a.g === anime.g && a.n !== anime.n)
        .sort((a, b) => Math.abs(a.m - anime.m) - Math.abs(b.m - anime.m))
        .slice(0, 10);
    
    const ctx = document.getElementById('comparisonModalChart').getContext('2d');
    
    if (charts.comparisonModal) {
        charts.comparisonModal.destroy();
    }
    
    charts.comparisonModal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [anime.n, ...similar.map(a => a.n)].map(n => 
                n.length > 20 ? n.substring(0, 20) + '...' : n
            ),
            datasets: [{
                label: 'Rating',
                data: [anime.s, ...similar.map(a => a.s)],
                backgroundColor: (context) => {
                    return context.dataIndex === 0 ? 
                        'rgba(231, 76, 60, 0.8)' : 
                        'rgba(102, 126, 234, 0.6)';
                },
                borderColor: (context) => {
                    return context.dataIndex === 0 ? 
                        'rgba(192, 57, 43, 1)' : 
                        'rgba(102, 126, 234, 1)';
                },
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: `${anime.n} vs Similar ${anime.g} Anime`
                }
            },
            scales: {
                y: {
                    min: 5,
                    max: 10
                },
                x: {
                    ticks: { maxRotation: 45, minRotation: 45 }
                }
            }
        }
    });
}

function generateRecommendations(anime) {
    const recommendations = DATA.anime
        .filter(a => {
            if (a.n === anime.n) return false;
            const sameGenre = a.g === anime.g;
            const similarRating = Math.abs(a.s - anime.s) <= 0.5;
            return sameGenre && similarRating;
        })
        .sort((a, b) => Math.abs(a.s - anime.s) - Math.abs(b.s - anime.s))
        .slice(0, 6);
    
    const recsContainer = document.getElementById('recommendations');
    if (recommendations.length > 0) {
        recsContainer.innerHTML = recommendations.map(rec => `
            <div class="rec-card" onclick='showAnimeDetail(${JSON.stringify(rec).replace(/'/g, "&#39;")})'>
                <div class="rec-title">${rec.n.length > 35 ? rec.n.substring(0, 35) + '...' : rec.n}</div>
                <div class="rec-info">
                    ⭐ ${rec.s} • ${rec.t}<br>
                    📺 ${rec.e} eps • ${rec.y || 'N/A'}<br>
                    👥 ${rec.m.toLocaleString()}
                </div>
            </div>
        `).join('');
    } else {
        recsContainer.innerHTML = '<p style="color: #718096;">No similar recommendations found.</p>';
    }
}

function googleSearch() {
    if (currentAnime) {
        const query = encodeURIComponent(currentAnime.n + ' anime');
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
}

function closeModal() {
    document.getElementById('animeModal').classList.remove('active');
}

// ============================================================================
// UI HELPERS
// ============================================================================

function showTab(tabName) {
    console.log(`📑 Switching to tab: ${tabName}`);
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function populateFilters() {
    const genres = [...new Set(DATA.anime.map(a => a.g))].sort();
    const types = [...new Set(DATA.anime.map(a => a.t))].sort();
    
    const genreSelect = document.getElementById('genreFilter');
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
    
    const typeSelect = document.getElementById('typeFilter');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

function setupEventListeners() {
    setupSearch();
    document.getElementById('searchInput').addEventListener('input', filterData);
    document.getElementById('genreFilter').addEventListener('change', (e) => {
        applyGenreTheme(e.target.value === 'All' ? null : e.target.value);
        updateBreadcrumb(e.target.value === 'All' ? null : `Filtered by: ${e.target.value}`);
        filterData();
    });
    document.getElementById('typeFilter').addEventListener('change', filterData);
    document.getElementById('episodeFilter').addEventListener('change', filterData);
    
    const tableSearch = document.getElementById('tableSearch');
    if (tableSearch) {
        tableSearch.addEventListener('input', () => renderTable());
    }
    
    const tableSortBy = document.getElementById('tableSortBy');
    if (tableSortBy) {
        tableSortBy.addEventListener('change', (e) => {
            renderTable(e.target.value, 'desc');
        });
    }
    
    window.onclick = (event) => {
        const modal = document.getElementById('animeModal');
        if (event.target === modal) {
            closeModal();
        }
    };
}

// ============================================================================
// START APPLICATION
// ============================================================================

loadData();
