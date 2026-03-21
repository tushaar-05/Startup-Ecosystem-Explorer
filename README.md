# Startup Ecosystem Explorer
A web application to discover, search, filter, and analyse startups from the Y Combinator ecosystem — built using the Hacker News public API.

## Purpose
The startup world moves fast. New companies are launched every week, and keeping track of what is being built — across sectors, funding batches, and traction levels — is difficult without a dedicated tool.
Startup Ecosystem Explorer solves this by turning raw Hacker News data into a clean, interactive startup directory. Users can search for startups by keyword, filter by industry sector or YC batch, sort by score or recency, and bookmark companies they want to revisit — all in one place.
The target audience includes aspiring entrepreneurs researching markets, developers exploring startup ideas, students studying business and technology, and anyone curious about what is being built in the startup ecosystem right now.

## API Used
Hacker News API (by Y Combinator / Firebase)

Base URL: https://hacker-news.firebaseio.com/v0/
Documentation: https://github.com/HackerNews/API
Authentication: None required — fully public and free


## Features Planned
### Core Features
- Search — live search bar to filter startups by name or keyword using the Array.filter() method
- Sector Filtering — filter startups by industry category (AI, Fintech, Climate, Health, SaaS, Dev tools) using Array.filter()
- Sorting — sort results by top score, newest first, or alphabetically using Array.sort()
- Startup Cards — each startup displays its name, one-line description, category badge, upvote score, batch tag, and post age
- Loading States — spinner shown while API data is being fetched
- Responsive Design — fully functional across desktop, tablet, and mobile screen sizes

### Interactive Features
- Bookmark / Save — star icon on each card to save startups; saved list persists using localStorage
- Compare Mode — select up 2 startups and view them side by side in a comparison panel
- Trend Analysis Panel — sidebar showing a breakdown of startup counts per sector, derived using Array.reduce()
- Score Bar — visual progress bar on each row representing relative traction score

### Bonus Features (Planned)
- Debounced Search — search input waits 300ms after the user stops typing before filtering, avoiding unnecessary re-renders on every keystroke
- Pagination — results split into pages of 10–20 startups for better performance and readability
- Dark / Light Mode Toggle — theme preference saved to localStorage
- Spotlight Card — highest-scoring startup of the current fetch is highlighted at the top of the dashboard
- Quick Filters — one-click preset filters (e.g. Trending, New this week, Score > 200) for faster exploration


### Tech Stack
- HTML5: Page structure and semantic markup
- CSS3/TailwindCSS: Styling, layout (Flexbox and CSS Grid), responsive design
- Vanilla JavaScript (ES6+): API calls, DOM manipulation, all logicHacker News APILive startup data source
- localStorage: Persisting bookmarks and user preferences
- Google Fonts: Typography

No frameworks or build tools are used. This is a pure HTML/CSS/JS project.


## Project Structure
startup-ecosystem-explorer/
│
├── index.html          ← Landing page (intro + login/signup CTA)
├── login.html          ← Login page
├── signup.html         ← Signup page
├── dashboard.html      ← Main app dashboard
├── saved.html          ← Dedicated page showing only the saved startups
├── trends.html         ← Data insights page
├── compare.html        ← Side-by-side comparison view
│
├── css/
│   ├── global.css      ← Shared styles used across all pages
│   ├── dashboard.css   ← Dashboard-specific styles
│   ├── auth.css        ← Login and signup page styles
│   └── landing.css     ← Landing page styles
│
├── js/
│   ├── api.js          ← All Hacker News API fetch logic
│   ├── render.js       ← DOM rendering functions
│   ├── filters.js      ← Search, filter, sort logic (all HOFs)
│   ├── auth.js         ← Handles login and signup logic
│   ├── compare.js      ← Logic for the compare feature
│   ├── saved.js        ← Reads bookmarked startups from localStorage and renders them on the saved page.
│   ├── storage.js      ← localStorage helpers (bookmarks, preferences)
│   ├── trends.js       ← Renders the charts and stats on trends.html.
│   └── utils.js        ← Small reusable helper functions used across multiple files
│
└── README.md

## Setup and Running
This project requires no installation, build step, or server. It runs entirely in the browser.
Steps to run locally:

### Clone the repository:
bash   git clone https://github.com/tushaar-05/startup-ecosystem-explorer.git

### Navigate into the project folder:
bash   cd startup-ecosystem-explorer

### Open index.html in your browser:

### Double-click the file in your file explorer, or Use the Live Server extension in VS Code (recommended for auto-reload)

No API key is needed. The Hacker News API is public and requires no authentication.

## Note: The app fetches live data from the Hacker News API on load. An internet connection is required for the data to appear.


Deployment
The final project will be deployed using vercel and the live link will be added here once available.
Live URL: coming soon

Author
Tushar R Singh — Individual Project, 2025