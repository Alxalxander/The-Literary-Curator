import React, { useState } from 'react';
import { RecommendationResponse } from '../types';
import { QuoteIcon, BookIcon, LinkIcon, BookmarkIcon, ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface RecommendationCardProps {
  recommendation: RecommendationResponse;
  onToggleBookmark?: (title: string) => void;
  startCollapsed?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onToggleBookmark, startCollapsed = false }) => {
  const { recommendation_details, justification, sources, isBookmarked } = recommendation;
  const [isExpanded, setIsExpanded] = useState(!startCollapsed);
  
  const learnMoreUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${recommendation_details.title} by ${recommendation_details.author}`
  )}`;

  const DetailsSection: React.FC = () => (
    <>
      <p className="text-[#402E26] italic mb-5 text-base sm:text-lg leading-relaxed">"{recommendation_details.pitch}"</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {recommendation_details.keywords.map((keyword) => (
          <span key={keyword} className="text-xs font-medium bg-[#EAE1D9] text-[#6B4E3F] py-1 px-2.5 rounded-full">
            {keyword}
          </span>
        ))}
      </div>

      <div className="bg-[#FDFBF7]/60 p-3 rounded-md border border-[#D5C6B8]/50 mb-5">
        <div className="flex">
          <QuoteIcon className="h-5 w-5 text-[#BFAD9F] mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-[#6B4E3F] text-sm">Curator's Note</h4>
            <p className="text-[#6B4E3F] text-sm italic">{justification}</p>
          </div>
        </div>
      </div>

      {recommendation_details.similar_books && recommendation_details.similar_books.length > 0 && (
          <div className="bg-[#FDFBF7]/60 p-3 rounded-md border border-[#D5C6B8]/50 mb-4">
          <h4 className="font-semibold text-[#6B4E3F] text-sm mb-2">You Might Also Like...</h4>
          <ul className="space-y-1">
            {recommendation_details.similar_books.map((book, index) => (
              <li key={index} className="text-sm text-[#402E26]">
                <span className="font-medium">{book.title}</span> by <span className="italic">{book.author}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="pt-4 border-t border-[#D5C6B8]/50">
            <h4 className="font-semibold text-[#6B4E3F] text-sm mb-2">Sources</h4>
            <div className="space-y-2">
            {sources.map((source, index) => (
              <a 
                key={index} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-start text-sm text-[#8C5A3A] hover:underline transition-colors"
              >
                <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
              </a>
            ))}
            </div>
        </div>
      )}
    </>
  );

  return (
    <div className="relative bg-[#F6F1EB] border border-[#D5C6B8] rounded-lg overflow-hidden shadow-md max-w-md w-full flex flex-col transition-all duration-300">
       {onToggleBookmark && (
        <button
          onClick={() => onToggleBookmark(recommendation_details.title)}
          className="absolute top-3 right-3 p-2 rounded-full text-[#8C5A3A] hover:bg-[#EAE1D9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8C5A3A] z-10"
          aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          <BookmarkIcon className="h-5 w-5" filled={isBookmarked} />
        </button>
      )}

      <div className="p-5 flex-grow">
        <div className="flex items-start text-[#8C5A3A] mb-3 pr-10">
          <BookIcon className="h-6 w-6 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#402E26] font-serif leading-tight">{recommendation_details.title}</h2>
            <p className="text-[#6B4E3F] text-sm sm:text-base">by {recommendation_details.author}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <span className="text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full text-[#8C5A3A] bg-[#EAE1D9]">
            {recommendation_details.genre}
          </span>
        </div>
        
        {isExpanded ? <DetailsSection /> : <div className="h-2"></div>}
      </div>

      <div className="bg-[#EAE1D9]/60 px-5 py-3 border-t border-[#D5C6B8]/50 mt-auto flex items-center justify-between space-x-3">
        <a 
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#FDFBF7] bg-[#8C5A3A] hover:bg-[#6B4E3F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3A] focus:ring-offset-[#EAE1D9] transition-colors flex-grow sm:flex-grow-0"
        >
          Learn More
          <ExternalLinkIcon className="ml-2 h-4 w-4" />
        </a>
        {startCollapsed && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center justify-center text-center px-4 py-2 border border-[#D5C6B8] text-sm font-medium rounded-md text-[#6B4E3F] bg-transparent hover:bg-[#D5C6B8]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3A] focus:ring-offset-[#EAE1D9] transition-colors"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Show Less' : 'Show Details'}</span>
            {isExpanded 
              ? <ChevronUpIcon className="ml-2 h-4 w-4" /> 
              : <ChevronDownIcon className="ml-2 h-4 w-4" />
            }
          </button>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;