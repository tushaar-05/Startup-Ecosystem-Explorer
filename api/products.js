export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { after } = req.body;
  const PH_TOKEN = process.env.PH_TOKEN;
  const API_URL = 'https://api.producthunt.com/v2/api/graphql';

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

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
