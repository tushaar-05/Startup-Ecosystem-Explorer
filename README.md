# Startup Ecosystem Explorer

A web application to discover, search, filter, and analyse startups from the Product Hunt ecosystem — built using the Product Hunt GraphQL API.

## Purpose

The startup world moves fast. New products and companies launch every day, and keeping track of what is being built — across sectors, ranking, and traction — is difficult without a dedicated tool.

Startup Ecosystem Explorer solves this by turning live Product Hunt data into a clean, interactive startup directory. Users can search for startups by keyword, filter by topic/sector, sort by votes or recency, bookmark companies they want to revisit, and compare any 2 startups — all in one place.

The target audience includes aspiring entrepreneurs researching markets, developers exploring startup ideas, students studying business and technology, and anyone curious about what is being built in the startup ecosystem right now.

---

## API Used

**Product Hunt API (GraphQL)**

- Base URL: `https://api.producthunt.com/v2/api/graphql`
- Documentation: https://api.producthunt.com/v2/docs

### Key Query Used

```graphql
query Posts($after: String) {
  posts(order: RANKING, first: 30, after: $after) {
    edges {
      node {
        id
        name
        tagline
        slug
        url
        votesCount
        commentsCount
        createdAt
        topics {
          edges {
            node {
              name
              slug
            }
          }
        }
        thumbnail { url }
        user { name username headline }
        description
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```


### Authentication
The API requires a Developer Token (Bearer token). This is stored in `config.js` as `PH_TOKEN` and passed in the `Authorization` header of every request.


### Pagination
The API supports cursor-based pagination via `pageInfo.endCursor` and the `$after` variable. The app passes this cursor to fetch additional pages of results on demand.

---

## Features
### Core Features
- **Search** — live search bar to filter startups by name or keyword using `Array.filter()`
- **Topic Filtering** — filter startups by Product Hunt topic categories (AI, Fintech, Climate, Health, SaaS, Developer Tools, etc.) extracted from each post's `topics` field
- **Sorting** — sort results by top votes, newest first, or alphabetically using `Array.sort()`
- **Startup Cards** — each card displays the startup's thumbnail, name, tagline, topic badges, vote count, comment count, founder info, and post age
- **Loading States** — skeleton loading while API data is being fetched
- **Responsive Design** — fully functional across desktop, tablet, and mobile screen sizes

### Interactive Features
- **Bookmark / Save** — star icon on each card to save startups; saved list persists using `localStorage`
- **Score Bar** — visual progress bar on each card representing relative traction (votes relative to the highest-voted post in the current fetch)

### Bonus Features
- **Debounced Search** — search input waits 300ms after the user stops typing before filtering, avoiding unnecessary re-renders on every keystroke
- **Pagination** — results split into pages of 10–20 startups using cursor-based pagination (`pageInfo.hasNextPage` + `endCursor`)
- **Dark / Light Mode Toggle** — theme preference saved to `localStorage`
- **Spotlight Card** — highest-voted startup of the current fetch is highlighted at the top of the dashboard

---

## Tech Stack
- HTML5 -> Page structure and semantic markup
- CSS3 / TailwindCSS -> Styling, layout (Flexbox & CSS Grid), responsive
- Vanilla JavaScript ES6+ -> API calls, DOM manipulation, all logic
- Product Hunt GraphQL API -> Live startup data source
- `localStorage` -> Persisting bookmarks and theme preferences
- Google Fonts -> Typography

No frameworks or build tools are used. This is a pure HTML/CSS/JS project.

---

## Setup and Running
This project requires no installation, build step, or server. It runs entirely in the browser.

### Steps to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tushaar-05/startup-ecosystem-explorer.git
   ```

2. **Navigate into the project folder:**
   ```bash
   cd startup-ecosystem-explorer
   ```

3. **Add your Product Hunt API token:**
   - Create a Developer account at https://www.producthunt.com/v2/oauth/applications
   - Generate a Developer Token
   - Add it to `config.js`:
     ```js
     export const PH_TOKEN = 'your_token_here';
     export const API_URL = 'https://api.producthunt.com/v2/api/graphql';
     ```

4. **Open `dashboard.html` in your browser:**
   - Double-click the file in your file explorer, or
   - Use the **Live Server** extension in VS Code (recommended for ES module support)


---

## Note
The app fetches live data from the Product Hunt API on load. An internet connection and a valid API token are required for data to appear.

---

## Deployment
The final project will be deployed using Vercel. The live link will be added here once available.

**Live URL:** coming soon

---

## Author

**Tushar R Singh** — Individual Project, 2026