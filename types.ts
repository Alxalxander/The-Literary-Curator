// FIX: Add Book and BookDatabase interfaces to be used in constants.ts.
export interface Book {
  title: string;
  author: string;
  genre: string;
  keywords: string[];
}

export interface BookDatabase {
  books: Book[];
}

export interface SimilarBook {
  title: string;
  author: string;
}

export interface RecommendationDetails {
  title: string;
  author: string;
  genre: string;
  keywords: string[];
  pitch: string;
  similar_books?: SimilarBook[];
}

export interface GroundingChunkWeb {
    uri: string;
    title: string;
}

export interface RecommendationResponse {
  recommendation_details: RecommendationDetails;
  justification: string;
  sources?: GroundingChunkWeb[];
  isBookmarked?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text?: string;
  recommendations?: RecommendationResponse[];
}

export interface GeminiServiceResponse {
  text?: string;
  recommendations?: RecommendationResponse[];
}