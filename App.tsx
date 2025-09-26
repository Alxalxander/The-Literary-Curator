import React, { useState, useEffect } from 'react';
import { RecommendationResponse, ChatMessage } from './types';
import { INITIAL_CHAT_MESSAGE } from './constants';
import { getBookRecommendation } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import ReadingList from './components/ReadingList';
import { BookIcon, LibraryIcon } from './components/Icons';

type View = 'chat' | 'history';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendationResponse[]>(() => {
    // Load saved books from local storage on initial render
    try {
      const savedBooks = localStorage.getItem('readingList');
      return savedBooks ? JSON.parse(savedBooks) : [];
    } catch (error) {
      console.error("Failed to load books from local storage:", error);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('chat');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Save books to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('readingList', JSON.stringify(recommendedBooks));
    } catch (error) {
      console.error("Failed to save books to local storage:", error);
    }
  }, [recommendedBooks]);

  const handleSendMessage = async (text: string) => {
    const newUserMessage: ChatMessage = { role: 'user', text };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const result = await getBookRecommendation(newMessages);
      
      const newBotMessages: ChatMessage[] = [];

      if (result.recommendations && result.recommendations.length > 0) {
        newBotMessages.push({ role: 'bot', recommendations: result.recommendations });
        setRecommendedBooks(prev => [...prev, ...result.recommendations!]);
      } else {
        newBotMessages.push({ role: 'bot', text: result.text || "I'm not sure what to say about that." });
      }
      
      setMessages(prev => [...prev, ...newBotMessages]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setMessages(prev => [...prev, { role: 'bot', text: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = (title: string) => {
    setRecommendedBooks(prevBooks =>
      prevBooks.map(book =>
        book.recommendation_details.title === title
          ? { ...book, isBookmarked: !book.isBookmarked }
          : book
      )
    );
  };
  
  const NavButton: React.FC<{
    view: View;
    label: string;
    icon: React.ReactNode;
  }> = ({ view, label, icon }) => (
    <button
        onClick={() => setCurrentView(view)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === view
            ? 'bg-[#EAE1D9] text-[#402E26]'
            : 'text-[#6B4E3F] hover:bg-[#F6F1EB]'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
  );

  const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );


  return (
    <div className="flex flex-col h-screen font-sans bg-[#FDFBF7]">
      <header className="bg-[#FDFBF7]/80 backdrop-blur-lg border-b border-[#D5C6B8]/50 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto py-3 px-4 flex items-center justify-between relative">
          <div className="flex items-center">
            <BookIcon className="h-7 w-7 text-[#8C5A3A]" />
            <h1 className="ml-3 text-2xl sm:text-3xl font-bold text-[#402E26] font-serif">The Literary Curator</h1>
          </div>
          <nav className="hidden sm:flex items-center space-x-2">
            <NavButton view="chat" label="Chat" icon={<BookIcon className="h-4 w-4" />} />
            <NavButton view="history" label="My Reading List" icon={<LibraryIcon className="h-4 w-4" />} />
          </nav>
          <div className="sm:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 rounded-md text-[#6B4E3F] hover:bg-[#F6F1EB] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8C5A3A]"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            {isMenuOpen && (
              <div id="mobile-menu" className="absolute top-full right-4 mt-2 w-56 rounded-md shadow-lg bg-[#FDFBF7] ring-1 ring-[#D5C6B8] ring-opacity-50">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button
                    onClick={() => { setCurrentView('chat'); setIsMenuOpen(false); }}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${currentView === 'chat' ? 'bg-[#EAE1D9] text-[#402E26]' : 'text-[#6B4E3F] hover:bg-[#F6F1EB]'}`}
                  >
                    <BookIcon className="h-4 w-4 mr-3" />
                    Chat
                  </button>
                  <button
                    onClick={() => { setCurrentView('history'); setIsMenuOpen(false); }}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${currentView === 'history' ? 'bg-[#EAE1D9] text-[#402E26]' : 'text-[#6B4E3F] hover:bg-[#F6F1EB]'}`}
                  >
                    <LibraryIcon className="h-4 w-4 mr-3" />
                    My Reading List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow flex-shrink min-h-0">
        {currentView === 'chat' ? (
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <ReadingList books={recommendedBooks} onToggleBookmark={handleToggleBookmark} />
        )}
      </main>
    </div>
  );
}

export default App;