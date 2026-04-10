const PH_TOKEN = import.meta.env.VITE_PH_TOKEN;
const API_URL = import.meta.env.VITE_API_URL;


async function fetchData(after = null) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PH_TOKEN}`
      },
      body: JSON.stringify({
        query: `
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
        `,
        variables: { after }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return null;
    }

    return result.data;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export { fetchData }