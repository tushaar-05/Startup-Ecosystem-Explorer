# Startup Ecosystem Explorer

A web application to discover, search, filter, and analyse startups from the Product Hunt ecosystem — built using the Product Hunt GraphQL API and Vite.

## Purpose

The startup world moves fast. New products and companies launch every day, and keeping track of what is being built — across sectors, ranking, and traction — is difficult without a dedicated tool.

Startup Ecosystem Explorer solves this by turning live Product Hunt data into a clean, interactive startup directory. Users can search for startups by keyword, filter by topic/sector, sort by votes or recency, bookmark companies they want to revisit, and see real-time stats like the "Top Score Today" — all in one place.

---

## API Used

**Product Hunt API (GraphQL)**

- Base URL: `https://api.producthunt.com/v2/api/graphql`
- Documentation: [Product Hunt API Docs](https://api.producthunt.com/v2/docs)

### Key Query Used

```graphql
query Posts($after: String) {
  posts(order: RANKING, first: 20, after: $after) {
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
The API requires a Developer Token (Bearer token). This is securely managed using Vite's environment variable system. Create a `.env` file in the root directory:
```env
VITE_PH_TOKEN=your_token_here
VITE_API_URL=https://api.producthunt.com/v2/api/graphql
```

---

## Features

### Core Features
- **Live Search** — Filter startups by name, tagline, or founder using debounced input processing.
- **Sector Filtering** — Dynamically populated topic categories (AI, Fintech, SaaS, etc.) based on live data.
- **Dynamic Stats** — Real-time hero counters for **Total Startups**, **Saved by You**, and **Top Score Today**.
- **Spotlight Highlight** — The #1 trending startup of the day is featured prominently at the top.
- **Sorting** — Organize results by top score, newest, or alphabetical order.

### Interactive Features
- **Bookmark / Save** — Persistent bookmarking using `localStorage`.
- **Skeleton Loading** — Smooth loading states while fetching data from the GraphQL endpoint.
- **Dark / Light Mode** — Fully themed interface with theme preference persistence.
- **Responsive Design** — Optimized for desktop, tablet, and mobile viewing.

---

## Tech Stack
- **JavaScript (ES6+)** — Core logic and module-based architecture.
- **Vite** — Build tool and dev server for fast development and secure env management.
- **TailwindCSS** — Utility-first styling for a premium, responsive UI.
- **Product Hunt GraphQL API** — Live data source.
- **localStorage** — Client-side data persistence for themes and bookmarks.

---

## Setup and Running

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- A Product Hunt API Token ([Get one here](https://www.producthunt.com/v2/oauth/applications))

### Steps to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tushaar-05/Startup-Eecosystem-Explorer.git
   cd Startup-Eecosystem-Explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root.
   - Add your token: `VITE_PH_TOKEN=your_actual_token`.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## Deployment (Vercel)

This project is optimized for deployment on **Vercel**.

1. Connect your repository to Vercel.
2. Vercel will automatically detect Vite and set the build command to `npm run build` and output directory to `dist/`.
3. **Important**: Add your `VITE_PH_TOKEN` and `VITE_API_URL` under **Settings > Environment Variables** in the Vercel dashboard.

---

## Author

**Tushar R Singh** — 2026