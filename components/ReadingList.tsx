import React, { useState } from 'react';
import { RecommendationResponse } from '../types';
import RecommendationCard from './RecommendationCard';
import { LibraryIcon, BookmarkIcon } from './Icons';

interface ReadingListProps {
  books: RecommendationResponse[];
  onToggleBookmark: (title: string) => void;
}

const ReadingList: React.FC<ReadingListProps> = ({ books, onToggleBookmark }) => {
  const [activeFilter, setActiveFilter] = useState<{ type: 'all' | 'genre' | 'bookmarked', value?: string }>({ type: 'all' });

  const genres = Array.from(new Set(books.map(rec => rec.recommendation_details.genre))).sort();
  const bookmarkedCount = books.filter(b => b.isBookmarked).length;
  
  const filteredBooks = books.filter(rec => {
    switch (activeFilter.type) {
      case 'genre':
        return rec.recommendation_details.genre === activeFilter.value;
      case 'bookmarked':
        return rec.isBookmarked;
      case 'all':
      default:
        return true;
    }
  });

  const FilterButton: React.FC<{
    filter: { type: 'all' | 'genre' | 'bookmarked', value?: string };
    label: string;
    icon?: React.ReactNode;
  }> = ({ filter, label, icon }) => {
    const isActive = activeFilter.type === filter.type && activeFilter.value === filter.value;
    return (
      <button
        onClick={() => setActiveFilter(filter)}
        className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
          isActive
            ? 'bg-[#402E26] text-white shadow'
            : 'bg-[#EAE1D9] text-[#6B4E3F] hover:bg-[#D5C6B8]'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-full overflow-y-auto chat-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#402E26] font-serif mb-4 sm:mb-0">Your Curated Reading List</h2>
        {books.length > 0 && (
          <div className="text-sm text-[#6B4E3F]">
            Showing {filteredBooks.length} of {books.length} books.
          </div>
        )}
      </div>

      {(genres.length > 0 || bookmarkedCount > 0) && (
        <div className="mb-8 p-3 bg-[#F6F1EB]/50 rounded-lg border border-[#D5C6B8]/50">
          <h3 className="text-sm font-semibold text-[#6B4E3F] mb-3">Filter</h3>
          <div className="flex flex-wrap gap-2">
            <FilterButton filter={{ type: 'all' }} label="All" />
            {bookmarkedCount > 0 && (
                <FilterButton
                filter={{ type: 'bookmarked' }}
                label={`Bookmarked (${bookmarkedCount})`}
                icon={<BookmarkIcon className="h-4 w-4" filled />}
                />
            )}
            {genres.map(genre => <FilterButton key={genre} filter={{ type: 'genre', value: genre }} label={genre} />)}
          </div>
        </div>
      )}

      {books.length === 0 ? (
        <div className="text-center py-20 bg-[#F6F1EB]/50 rounded-lg border-2 border-dashed border-[#D5C6B8]">
          <LibraryIcon className="mx-auto h-12 w-12 text-[#BFAD9F]" />
          <h3 className="mt-2 text-lg font-medium text-[#6B4E3F]">Your list is empty</h3>
          <p className="mt-1 text-[#6B4E3F]">Books recommended by the Curator will appear here.</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 bg-[#F6F1EB]/50 rounded-lg">
          <h3 className="text-lg font-medium text-[#6B4E3F]">No Matches Found</h3>
          <p className="mt-1 text-[#6B4E3F]">There are no books in your list that match the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredBooks.map((rec, index) => (
            <RecommendationCard 
                key={`${rec.recommendation_details.title}-${index}`} 
                recommendation={rec} 
                onToggleBookmark={onToggleBookmark}
                startCollapsed={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadingList;