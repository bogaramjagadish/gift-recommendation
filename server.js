const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock product catalog (fallback if API fails)
const productCatalog = {
  books: [
    { id: 1, name: "The Alchemist", price: 15, category: "books", personality: "thoughtful" },
    { id: 2, name: "Dune", price: 20, category: "books", personality: "adventurous" }
  ],
  gadgets: [
    { id: 3, name: "Smart Watch", price: 100, category: "gadgets", personality: "tech-savvy" },
    { id: 4, name: "Wireless Earbuds", price: 80, category: "gadgets", personality: "active" }
  ],
  personalized: [
    { id: 5, name: "Custom Mug", price: 25, category: "personalized", personality: "sentimental" }
  ]
};

// Google Custom Search API credentials (replace these!)
const GOOGLE_API_KEY = 'AIzaSyB1He4LFSU_iWQwTyWUaMx1br3EPSlBJfw'; // e.g., 'AIzaSyA1B2C3D4E5F6G7H8I9J0K'
const GOOGLE_CX = 'YOUR_SEARCH_ENGINE_ID'; // e.g., '0123456789abcdefg'

// Helper function to get local suggestions
const getLocalSuggestions = (personality, preferences, occasion) => {
  let suggestions = [];
  if (personality === "thoughtful" || preferences.includes("reading")) {
    suggestions = suggestions.concat(productCatalog.books);
  }
  if (personality === "tech-savvy" || preferences.includes("technology")) {
    suggestions = suggestions.concat(productCatalog.gadgets);
  }
  if (occasion === "birthday" || personality === "sentimental") {
    suggestions = suggestions.concat(productCatalog.personalized);
  }
  return suggestions;
};

// API endpoint to get gift suggestions
app.post('/api/gift-suggestions', async (req, res) => {
  const { personality, preferences, occasion } = req.body;

  // Validate request body
  if (!personality || !preferences || !occasion) {
    return res.status(400).json({ error: 'Missing required fields: personality, preferences, or occasion' });
  }

  // Build search query
  const query = `gift ideas for ${personality} person who likes ${preferences.join(' ')} for ${occasion}`;

  try {
    // Fetch from Google Custom Search API
    const googleResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CX,
        q: query,
        num: 3 // Limit to 3 results
      }
    });

    // Parse Google results
    const googleItems = googleResponse.data.items || [];
    const googleSuggestions = googleItems.map((item, index) => ({
      id: `google-${index}`,
      name: item.title.split(' - ')[0], // Clean up title
      price: 'Price varies', // Google doesn’t provide prices
      link: item.link,
      category: 'web'
    }));

    // Get local suggestions as fallback or supplement
    const localSuggestions = getLocalSuggestions(personality, preferences, occasion);
    const allSuggestions = [...googleSuggestions, ...localSuggestions.slice(0, 3 - googleSuggestions.length)];

    // Generate explanations
    const explanations = allSuggestions.map(item =>
      item.link
        ? `We found '${item.name}' online because it matches a ${personality} personality and ${occasion} occasion.`
        : `We recommend '${item.name}' because it suits ${personality} personalities and ${occasion} occasions.`
    );

    res.json({
      suggestions: allSuggestions,
      explanations
    });
  } catch (error) {
    console.error('Error fetching Google search results:', error.response ? error.response.data : error.message);

    // Fallback to local suggestions
    const localSuggestions = getLocalSuggestions(personality, preferences, occasion);
    const explanations = localSuggestions.map(item =>
      `We recommend '${item.name}' because it suits ${personality} personalities and ${occasion} occasions.`
    );

    res.status(200).json({
      suggestions: localSuggestions.slice(0, 3),
      explanations,
      error: 'Failed to fetch online suggestions; using local catalog instead'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

