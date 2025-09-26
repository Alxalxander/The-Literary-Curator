import React from 'react';
import { RecommendationResponse } from '../types';
import { BookIcon, QuoteIcon } from './Icons';

interface MultiRecommendationProps {
  recommendations: RecommendationResponse[];
}

const MultiRecommendation: React.FC<MultiRecommendationProps> = ({ recommendations }) => {
  return (
    <div className="bg-[#EAE1D9] text-[#402E26] rounded-lg p-4 max-w-lg w-full">
      <p className="text-base font-serif text-[#402E26] mb-4">An excellent query. I have found a few volumes that may pique your interest:</p>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="border-t border-[#D5C6B8]/50 pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-start text-[#8C5A3A] mb-2">
                <BookIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-1" />
                <h3 className="text-lg sm:text-xl font-bold text-[#402E26] font-serif leading-tight">{rec.recommendation_details.title}</h3>
            </div>
            
            <div className="pl-6 mb-3">
                <div className="flex">
                    <QuoteIcon className="h-4 w-4 text-[#BFAD9F] mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#6B4E3F] italic">{rec.justification}</p>
                </div>
            </div>
            
            <div className="pl-6 flex flex-wrap gap-1.5">
              {rec.recommendation_details.keywords.map((keyword) => (
                <span key={keyword} className="text-xs font-medium bg-white/60 text-[#6B4E3F] py-0.5 px-2 rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiRecommendation;