import { BookDatabase, ChatMessage } from './types';

// This database can still be used by the AI as a source of potential recommendations.
export const DEFAULT_BOOK_DATABASE: BookDatabase = {
  "books": [
    {
      "title": "Hyperion",
      "author": "Dan Simmons",
      "genre": "Science Fiction",
      "keywords": ["Space Opera", "Pilgrimage", "Artificial Intelligence", "Time Travel", "Mystery"]
    },
    {
      "title": "A Fire Upon the Deep",
      "author": "Vernor Vinge",
      "genre": "Science Fiction",
      "keywords": ["Galactic Empire", "Artificial Intelligence", "Aliens", "Adventure"]
    },
    {
      "title": "The Left Hand of Darkness",
      "author": "Ursula K. Le Guin",
      "genre": "Science Fiction",
      "keywords": ["Sociology", "Gender Studies", "Political Intrigue", "Anthropology"]
    },
    {
      "title": "Mistborn: The Final Empire",
      "author": "Brandon Sanderson",
      "genre": "Fantasy",
      "keywords": ["Heist", "Magic System", "Revolution", "Dystopian Society"]
    }
  ]
};

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
    role: 'bot',
    text: "Hello, I am the Curator. Tell me about what you've enjoyed reading, or what you're in the mood for, and I shall find the perfect book for you."
};