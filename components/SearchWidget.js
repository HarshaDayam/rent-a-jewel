import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isWordMatchWithTypo(queryWord, targetText) {
  const q = queryWord.toLowerCase().trim();
  if (!q) return true;
  const targetWords = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (targetWords.some(w => w.includes(q))) return true;
  let threshold = q.length >= 6 ? 2 : (q.length >= 4 ? 1 : 0);
  if (threshold === 0) return false;
  return targetWords.some(w => {
    if (Math.abs(w.length - q.length) > threshold) return false;
    return levenshteinDistance(q, w) <= threshold;
  });
}

export default function SearchWidget({ products = [] }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Process suggestions
  const q = query.toLowerCase().trim();
  const queryWords = q.split(/\s+/).filter(Boolean);
  
  let suggestedProducts = [];
  if (q.length > 0) {
    suggestedProducts = products.filter(p => {
      const searchableText = `${p.name} ${p.category} ${p.desc || ""}`;
      return queryWords.every(word => isWordMatchWithTypo(word, searchableText));
    }).slice(0, 3); // top 3 products
  }

  const hasResults = suggestedProducts.length > 0;

  return (
    <div className="search-widget" ref={wrapperRef}>
      <form onSubmit={handleSearchSubmit} className="search-widget-form">
        <input 
          type="text"
          placeholder="Search jewelry..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="search-widget-input"
        />
        <button type="submit" className="search-widget-btn" aria-label="Search">
          &#128269;
        </button>
      </form>

      {isOpen && q.length > 0 && (
        <div className="search-widget-dropdown">
          {hasResults ? (
            <>
              <div className="search-widget-results">
                {suggestedProducts.map(p => (
                  <Link href={`/search?q=${encodeURIComponent(p.name)}`} key={p.id} className="search-widget-item">
                    <img src={p.img.split('|')[0]} alt={p.name} className="search-widget-thumb" />
                    <div className="search-widget-info">
                      <div className="search-widget-title">{p.name}</div>
                      <div className="search-widget-cat">{p.category}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="search-widget-footer">
                <Link href={`/search?q=${encodeURIComponent(q)}`} className="search-widget-viewall">
                  View all results for "{query}"
                </Link>
              </div>
            </>
          ) : (
            <div className="search-widget-empty">No matching jewelry found</div>
          )}
        </div>
      )}
    </div>
  );
}
