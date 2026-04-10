export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { after } = req.body;
  const PH_TOKEN = process.env.PH_TOKEN;
  const API_URL = 'https://api.producthunt.com/v2/api/graphql';

  if (!PH_TOKEN) {
    console.error('Missing PH_TOKEN environment variable');
    return res.status(500).json({ 
      errors: [{ message: 'Server configuration error: Missing PH_TOKEN' }] 
    });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PH_TOKEN.trim()}`
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
        variables: { after: after || null }
      })
    });

    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error) {
    console.error('Server side error:', error);
    return res.status(500).json({ 
      errors: [{ message: 'Internal server error: ' + error.message }] 
    });
  }
}
