# 🎌 Anime Discovery Dashboard

An interactive, single-page web application for exploring 14,382 anime from MyAnimeList. Discover your next favorite show through intelligent search, dynamic filtering, and psychology-based genre theming.

---

## 🌟 Features

### Core Functionality
- **🔍 Intelligent Fuzzy Search** - Finds anime even with typos (e.g., "narto" → "Naruto")
- **🎲 Random Anime Discovery** - Get random recommendations (SFW content only)
- **🎨 Dynamic Genre Theming** - 13 psychology-based color palettes that change the entire UI
- **📊 Interactive Charts** - Click bars and points to see detailed information
- **🎯 Smart Recommendations** - Similar anime suggestions based on genre and rating

### Analysis Views (8 Tabs)
1. **📊 Genre Analysis** - Average ratings by genre with color-matched bars
2. **⚖️ Genre Comparison** - Side-by-side genre comparisons
3. **📈 Rating Distribution** - Histogram of rating patterns
4. **📺 Episode Analysis** - Quality vs. episode count relationships
5. **🎬 Type Analysis** - TV vs. Movie vs. OVA ratings
6. **🎯 Rating vs Popularity** - Scatter plot revealing hidden patterns
7. **🏆 Top 50 Anime** - Highest-rated shows with clickable bars
8. **📋 Full Dataset** - Searchable, sortable table of all 14,382 anime


### User Experience
- **Real-time Filtering** - Genre, Type, and Episode filters update all views instantly
- **Responsive Detail Modals** - Click any anime for full stats and recommendations
- **Color-Blind Friendly** - WCAG AA compliant with multiple visual encodings
- **Fast Loading** - Optimized data structure loads in under 2 seconds

---

## 🎨 Color Psychology Theming

Each genre triggers a full UI theme change based on psychological color associations:

| Genre | Color | Psychology |
|-------|-------|-----------|
| Action | Red/Orange | Energy, adrenaline, intensity |
| Adventure | Green | Exploration, nature, journey |
| Comedy | Gold | Joy, laughter, happiness |
| Drama | Blue | Emotion, depth, reflection |
| Sci-Fi | Space Blue | Technology, future, cosmos |
| Horror | Black | Fear, darkness, tension |
| Sports | Bright Blue | Competition, energy, movement |
| Award Winning | Gold | Prestige, excellence, quality |

---

## 🚀 Live Demo

**GitHub Pages:** [https://tpaden1.github.io/anime-dashboard-FINAL/)

---

## 📊 Dataset

**Source:** [Top 15,000 Ranked Anime Dataset](https://www.kaggle.com/datasets/quanthan/top-15000-ranked-anime-dataset-update-to-32025) from Kaggle

**Stats:**
- 14,382 anime (after cleaning)
- 42 unique genres
- 6 content types (TV, Movie, OVA, Special, ONA, Music)
- Date range: 1963–2023
- Embedded as optimized JSON (1.7 MB)

---

## 🛠️ Technical Stack

### Frontend
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Chart.js** - Interactive, responsive charts
- **HTML5/CSS3** - Modern, semantic markup
- **Single-Page Application** - No page reloads

### Data Processing
- **Python (Pandas)** - Data cleaning and preprocessing
- **JSON Optimization** - Compressed field names, efficient structure
- **Client-Side Storage** - All data embedded, no backend needed

### Key Features Implementation
```javascript
// Fuzzy Search with 5-tier scoring
- Exact match: 1000 points
- Starts with: 500 points
- Contains: 250 points
- Word matching: 100 points/word
- Levenshtein distance: 50 - (distance × 10)

// Random Anime with Content Filtering
blockedGenres: ['hentai', 'ecchi', 'erotica', 'girls', 'boys']
blockedKeywords: ['hentai', 'ecchi', '18+']

// Dynamic Theming with 13 Color Palettes
GENRE_COLORS = {
  'Action': 'rgba(231, 76, 60, 0.8)',   // Red
  'Sci-Fi': 'rgba(30, 58, 138, 0.8)',   // Dark blue
  'Horror': 'rgba(31, 31, 31, 0.8)',    // Black
  // ... 10 more
}
```

---

## 📁 Project Structure

```
anime-dashboard/
├── index.html              # Main dashboard (25 KB)
├── dashboard.js            # All functionality (37 KB)
├── anime_data_full.json    # Dataset (1.7 MB)
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x (for local server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/anime-dashboard.git
   cd anime-dashboard
   ```

2. **Start local server**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Why a Web Server?
Modern browsers block `fetch()` requests on `file://` protocol for security. A web server (even local) is required to load the JSON data.

---

## 💡 Usage Examples

### For Anime Fans
- **Discover by Genre:** Filter to your favorite genre and see top-rated shows
- **Find Similar Shows:** Click any anime to get recommendations
- **Random Discovery:** Hit the Random button until something catches your eye
- **Filter by Length:** Use Episode filter to find short (1-12) or long (100+) series

### For Content Creators
- **Identify Trends:** See which genres consistently rate highest
- **Find Hidden Quality:** Use Rating vs Popularity view to spot underrated shows
- **Genre Analysis:** Compare how different genres perform on average
- **Data Export:** Use Full Dataset tab for further analysis

### For Developers/Students
- **Learn SPA Architecture:** See how a single-page app works without frameworks
- **Study Data Visualization:** Examine interactive Chart.js implementations
- **Understand Optimization:** Review how 14K records load instantly
- **Explore UX Design:** Analyze modal flows, search UX, and theme switching

---

## 🎯 Key Design Decisions

### 1. Client-Side Only Architecture
**Why:** Simplicity, free hosting via GitHub Pages, instant load times  
**Trade-off:** All data must be sent to browser upfront

### 2. Embedded JSON Data
**Why:** Eliminates HTTP requests, works offline after initial load  
**Trade-off:** Larger initial HTML file (but still <2 MB total)

### 3. Fuzzy Search Algorithm
**Why:** Users often misremember names or make typos  
**Trade-off:** More complex scoring logic than exact match

### 4. Single Primary Genre
**Why:** Clean, readable charts without clutter  
**Trade-off:** Loses multi-genre nuance (e.g., "Action, Adventure")

### 5. Psychology-Based Colors
**Why:** Creates intuitive, memorable associations  
**Trade-off:** More CSS theme variants to maintain

### 6. No Hidden Gems Tab
**Why:** Feature had rendering issues; Random button serves similar purpose  
**Decision:** Removed to maintain quality over quantity

---

## 🔧 Development Process

### Data Cleaning Pipeline
1. **Source:** Raw Kaggle CSV (15,000 entries, ~13 MB)
2. **Clean:** Remove missing ratings/genres, filter invalid data
3. **Process:** Extract primary genre, standardize fields
4. **Optimize:** Compress field names, remove unused columns
5. **Result:** 14,382 anime, 1.7 MB JSON (87% size reduction)

### Feature Development
- **Week 1:** Core dashboard, search, basic charts
- **Week 2:** Advanced features (fuzzy search, recommendations)
- **Week 3:** Polish (theming, color psychology, UX refinements)
- **Week 4:** Testing, optimization, bug fixes

### Challenges Faced
1. **Hidden Gems Rendering:** DOM timing issues prevented table population
   - *Solution:* Removed feature, added Random button instead
2. **Chart Color Matching:** Generic purple didn't match genre themes
   - *Solution:* Created 13-color mapping system
3. **Search Performance:** Exact match too strict, users frustrated
   - *Solution:* Implemented 5-tier fuzzy scoring algorithm
4. **Data Size:** Original dataset too large for instant loading
   - *Solution:* JSON optimization reduced size by 87%

---

## 📈 Performance Metrics

- **Initial Load:** <2 seconds on average connection
- **Search Response:** <50ms for 14K records
- **Chart Render:** <100ms for most views
- **Theme Switch:** <200ms full UI update
- **Memory Usage:** ~50-80 MB in browser
- **Mobile Compatible:** Responsive down to 320px width

---

## 🎓 Learning Outcomes

### Technical Skills
- Single-page application architecture without frameworks
- Advanced JavaScript (ES6+, async/await, array methods)
- Data structures and algorithm optimization
- Chart.js and data visualization
- Responsive CSS and color theory
- Python data preprocessing with Pandas

### Design Skills
- User experience and interaction design
- Color psychology and theming systems
- Information architecture and navigation
- Accessibility (WCAG AA compliance)
- Visual hierarchy and readability

### Problem-Solving
- Debugging DOM rendering issues
- Optimizing large dataset performance
- Implementing fuzzy search algorithms
- Handling edge cases and error states

---

## 🔮 Future Enhancements

### Short Term
- [ ] Dark mode toggle
- [ ] Export filtered results to CSV
- [ ] Save favorite anime to localStorage
- [ ] Advanced filters (year, studio, rating range)
- [ ] Mobile app version (PWA)

### Long Term
- [ ] Backend API for live MyAnimeList data
- [ ] User accounts and watchlists
- [ ] Community ratings and comments
- [ ] Machine learning recommendations
- [ ] Temporal analysis (trends over time)
- [ ] Multi-language support (Japanese names)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Ideas
- Add new analysis views
- Improve search algorithm
- Create additional themes
- Enhance mobile responsiveness
- Write tests
- Improve documentation

---

## 🙏 Acknowledgments

- **Dataset:** [Quan Than's Top 15,000 Ranked Anime Dataset](https://www.kaggle.com/datasets/quanthan/top-15000-ranked-anime-dataset-update-to-32025) on Kaggle
- **Data Source:** [MyAnimeList](https://myanimelist.net/)
- **Color Palette Inspiration:** Material Design and anime aesthetics
- **Development Assistance:** Claude (Anthropic) for code optimization and debugging


---

<p align="center">
  Made with ❤️ and lots of anime by Trevor Paden
</p>

<p align="center">
  <strong>Star ⭐ this repo if you found it helpful!</strong>
</p>
