import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { FiHeart, FiShare2, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

const Quotes = () => {
  const [quote, setQuote] = useState(null);
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  // Local quotes data
  const localQuotes = [
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    {
      text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
      author: "Dr. Seuss"
    },
    {
      text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
      author: "Mahatma Gandhi"
    },
    {
      text: "The mind is not a vessel to be filled, but a fire to be kindled.",
      author: "Plutarch"
    },
    {
      text: "You don't have to be great to start, but you have to start to be great.",
      author: "Zig Ziglar"
    },
    {
      text: "The expert in anything was once a beginner.",
      author: "Helen Hayes"
    },
    {
      text: "The only person who is educated is the one who has learned how to learn and change.",
      author: "Carl Rogers"
    },
    {
      text: "Education is not preparation for life; education is life itself.",
      author: "John Dewey"
    },
    {
      text: "The difference between ordinary and extraordinary is that little extra.",
      author: "Jimmy Johnson"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt"
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs"
    },
    {
      text: "Failure is the opportunity to begin again more intelligently.",
      author: "Henry Ford"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill"
    }
  ];

  useEffect(() => {
    fetchQuoteOfTheDay();
    fetchFavoriteQuotes();
  }, []);

  const fetchQuoteOfTheDay = async () => {
    setLoading(true);
    try {
      // Try to fetch from an API first
      const response = await fetch('https://api.quotable.io/random?tags=education,wisdom,success');
      
      if (response.ok) {
        const data = await response.json();
        setQuote({
          text: data.content,
          author: data.author
        });
      } else {
        // If API fails, use a random local quote
        const randomIndex = Math.floor(Math.random() * localQuotes.length);
        setQuote(localQuotes[randomIndex]);
      }
    } catch (err) {
      console.error('Error fetching quote:', err);
      // Use a random local quote as fallback
      const randomIndex = Math.floor(Math.random() * localQuotes.length);
      setQuote(localQuotes[randomIndex]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteQuotes = async () => {
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(db, 'favoriteQuotes'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const quotesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFavoriteQuotes(quotesData);
    } catch (err) {
      console.error('Error fetching favorite quotes:', err);
      setError('Failed to load favorite quotes. Please try again.');
    }
  };

  const handleSaveFavorite = async () => {
    if (!quote) return;
    
    // Check if already in favorites
    const isAlreadyFavorite = favoriteQuotes.some(
      fav => fav.text === quote.text && fav.author === quote.author
    );
    
    if (isAlreadyFavorite) {
      alert('This quote is already in your favorites!');
      return;
    }
    
    try {
      const userId = auth.currentUser.uid;
      
      // Add to Firestore
      const quoteRef = await addDoc(collection(db, 'favoriteQuotes'), {
        text: quote.text,
        author: quote.author,
        userId,
        savedAt: new Date().toISOString()
      });
      
      // Update local state
      setFavoriteQuotes([
        ...favoriteQuotes,
        {
          id: quoteRef.id,
          text: quote.text,
          author: quote.author,
          userId,
          savedAt: new Date()
        }
      ]);
      
      alert('Quote added to favorites!');
    } catch (err) {
      console.error('Error saving favorite quote:', err);
      setError('Failed to save quote. Please try again.');
    }
  };

  const handleRemoveFavorite = async (quoteId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'favoriteQuotes', quoteId));
      
      // Update local state
      setFavoriteQuotes(favoriteQuotes.filter(quote => quote.id !== quoteId));
    } catch (err) {
      console.error('Error removing favorite quote:', err);
      setError('Failed to remove quote. Please try again.');
    }
  };

  const handleShareQuote = () => {
    if (!quote) return;
    
    const shareText = `"${quote.text}" - ${quote.author}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Inspirational Quote',
        text: shareText
      }).catch(err => {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        copyToClipboard(shareText);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Quote copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy quote. Please try again.');
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Motivational Quotes</h1>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            showFavorites
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showFavorites ? 'Daily Quote' : 'My Favorites'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!showFavorites ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
            </div>
          ) : quote ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Quote of the Day</h2>
                <div className="w-16 h-1 bg-primary mx-auto"></div>
              </div>
              
              <div className="mb-6">
                <p className="text-xl text-gray-700 italic mb-2">"{quote.text}"</p>
                <p className="text-right text-gray-600">- {quote.author}</p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSaveFavorite}
                  className="flex items-center text-red-500 hover:text-red-700"
                >
                  <FiHeart className="mr-1" /> Favorite
                </button>
                <button
                  onClick={handleShareQuote}
                  className="flex items-center text-blue-500 hover:text-blue-700"
                >
                  <FiShare2 className="mr-1" /> Share
                </button>
                <button
                  onClick={fetchQuoteOfTheDay}
                  className="flex items-center text-green-500 hover:text-green-700"
                >
                  <FiRefreshCw className="mr-1" /> New Quote
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">No quote available. Try refreshing.</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">My Favorite Quotes</h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>
          
          {favoriteQuotes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              You haven't saved any favorite quotes yet.
            </p>
          ) : (
            <div className="space-y-6">
              {favoriteQuotes.map((quote) => (
                <div key={quote.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <p className="text-lg text-gray-700 italic mb-2">"{quote.text}"</p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">- {quote.author}</p>
                    <button
                      onClick={() => handleRemoveFavorite(quote.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quotes;
