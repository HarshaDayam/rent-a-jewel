'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import JewelSVG from './JewelSVG';
import SearchWidget from './SearchWidget';

const RUPEE_SYMBOL = "Rs. ";

function formatRupee(n) {
  return RUPEE_SYMBOL + Number(n).toLocaleString("en-IN") + ".00";
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
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
  
  const targetWords = targetText.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter(Boolean);
    
  // Check exact substring match first (e.g. "neck" matches "necklace")
  if (targetWords.some(w => w.includes(q))) {
    return true;
  }
  
  let threshold = 0;
  if (q.length >= 6) {
    threshold = 2;
  } else if (q.length >= 4) {
    threshold = 1;
  }
  
  if (threshold === 0) return false;
  
  return targetWords.some(w => {
    if (Math.abs(w.length - q.length) > threshold) return false;
    return levenshteinDistance(q, w) <= threshold;
  });
}

import { useSearchParams } from 'next/navigation';

export default function SearchView({ products = [] }) {
  const searchParams = useSearchParams();
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState('featured');
  const [wishlist, setWishlist] = useState([]);

  // Modal Detail States
  const [activeProduct, setActiveProduct] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchZooming, setIsTouchZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ xPercent: 0, yPercent: 0 });
  const zoomFactor = 2.5;

  const dialogRef = useRef(null);

  // Initialize wishlist from localStorage and compute max price limit from data
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('rent_a_jewel_wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
  }, []);

  // Determine actual max price in data to initialize price range filter
  const maxPriceLimit = products.length > 0 ? Math.max(...products.map(p => p.price), 5000) : 5000;

  useEffect(() => {
    if (products.length > 0) {
      setMaxPrice(maxPriceLimit);
    }
  }, [products, maxPriceLimit]);

  // Wishlist toggle
  const toggleWishlist = (productId, e) => {
    e.stopPropagation();
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    try {
      localStorage.setItem('rent_a_jewel_wishlist', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  };

  // Modal open/close
  const openModal = (product) => {
    setActiveProduct(product);
    setIsZoomed(false);
    setIsHovering(false);
    setIsTouchZooming(false);
    
    // Log recent view
    try {
      const stored = localStorage.getItem('rent_a_jewel_recent');
      let recent = stored ? JSON.parse(stored) : [];
      recent = [product.id, ...recent.filter(id => id !== product.id)].slice(0, 10);
      localStorage.setItem('rent_a_jewel_recent', JSON.stringify(recent));
    } catch (e) {
      console.error('Recent tracking error:', e);
    }

    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    setActiveProduct(null);
    setIsZoomed(false);
    setIsHovering(false);
    setIsTouchZooming(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      closeModal();
    }
  };

  // Magnifier zoom handlers
  const handleMouseEnter = () => {
    if (window.innerWidth > 720) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 720) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const lensSize = 1 / zoomFactor;
    
    const xPos = Math.max(0, Math.min(px - lensSize / 2, 1 - lensSize));
    const yPos = Math.max(0, Math.min(py - lensSize / 2, 1 - lensSize));
    
    setLensPos({
      xPercent: xPos * 100,
      yPercent: yPos * 100
    });
  };

  const updateTouchPos = (e) => {
    if (e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const px = (touch.clientX - rect.left) / rect.width;
    const py = (touch.clientY - rect.top) / rect.height;
    const lensSize = 1 / zoomFactor;
    
    const xPos = Math.max(0, Math.min(px - lensSize / 2, 1 - lensSize));
    const yPos = Math.max(0, Math.min(py - lensSize / 2, 1 - lensSize));
    
    setLensPos({
      xPercent: xPos * 100,
      yPercent: yPos * 100
    });
  };

  const handleTouchStart = (e) => {
    setIsTouchZooming(true);
    updateTouchPos(e);
  };

  const handleTouchMove = (e) => {
    updateTouchPos(e);
  };

  const handleTouchEnd = () => {
    setIsTouchZooming(false);
  };

  // Search filter options
  const categoryFilters = [
    { label: 'Necklaces', dbValues: ['Necklace', 'Choker'] },
    { label: 'Harams', dbValues: ['Haram'] },
    { label: 'Bangles', dbValues: ['Bangles'] },
    { label: 'Earrings', dbValues: ['Earrings'] },
    { label: 'Bridal', dbValues: ['Bridal'] }
  ];

  const handleCategoryChange = (label) => {
    if (selectedCategories.includes(label)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== label));
    } else {
      setSelectedCategories([...selectedCategories, label]);
    }
  };

  // Predefined price filter tags
  const applyPriceQuickFilter = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setMinPrice(0);
    setMaxPrice(maxPriceLimit);
    setSortBy('featured');
  };

  // Filter and Search Matching
  const filteredProducts = products.filter(p => {
    // 1. Search Query (Whitespace Split Multi-Word Fuzzy Match)
    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const searchableText = `${p.name} ${p.category} ${p.desc || ""}`;
    const matchesSearch = queryWords.every(word => 
      isWordMatchWithTypo(word, searchableText)
    );

    // 2. Category Checkboxes
    let matchesCategory = true;
    if (selectedCategories.length > 0) {
      const allowedDbValues = selectedCategories.flatMap(label => {
        const filter = categoryFilters.find(f => f.label === label);
        return filter ? filter.dbValues : [];
      });
      matchesCategory = allowedDbValues.includes(p.category);
    }

    // 3. Price Bounds
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'discount') {
      const discountA = a.oldPrice ? ((a.oldPrice - a.price) / a.oldPrice) : 0;
      const discountB = b.oldPrice ? ((b.oldPrice - b.price) / b.oldPrice) : 0;
      return discountB - discountA;
    }
    return 0; // featured/unsorted (default order)
  });

  return (
    <>
      {/* Header */}
      <header className="site">
        <div className="nav-wrap">
          <Link href="/" className="brand">
            <span className="name" style={{ color: 'var(--gold)' }}>RENT - A - JEWEL</span>
            <span className="sub" style={{ color: 'var(--green)' }}>BY VIDHYA</span>
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/" style={{ color: 'var(--ivory)', fontSize: '13px', textDecoration: 'none', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.8 }}>
                Home Catalog
              </Link>
            </li>
            <li>
              <Link href="/search" style={{ color: 'var(--gold-light)', fontSize: '13px', textDecoration: 'none', letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: '1px solid var(--gold)', paddingBottom: '4px' }}>
                Search &amp; Filters
              </Link>
            </li>
          </ul>
          <div className="nav-icons">
            <SearchWidget products={products} />
            <Link 
              href="/wishlist"
              className="icon-btn" 
              title="My Wishlist"
              style={{ textDecoration: 'none' }}
            >
              {wishlist.length > 0 ? '❤️' : '♡'}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace split layout */}
      <main className="section" style={{ minHeight: '80vh', padding: '40px 28px' }}>
        <div className="search-layout">
          {/* Left Sidebar Filters */}
          <aside className="search-sidebar">
            <div className="filter-card">
              <h3 className="filter-title">Filters</h3>
              
              {/* Search Query Filter */}
              <div className="filter-group">
                <label className="filter-label">Search Keyword</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="search-input-field"
                    placeholder="Search name, details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      className="clear-field-btn"
                      onClick={() => setSearchQuery('')}
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label className="filter-label">Categories</label>
                <div className="category-checklist">
                  {categoryFilters.map(cat => (
                    <label key={cat.label} className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.label)}
                        onChange={() => handleCategoryChange(cat.label)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="filter-group">
                <label className="filter-label">Price Range (Rs.)</label>
                <div className="price-inputs">
                  <div className="price-input-box">
                    <span>Min</span>
                    <input 
                      type="number" 
                      value={minPrice} 
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))} 
                    />
                  </div>
                  <div className="price-input-box">
                    <span>Max</span>
                    <input 
                      type="number" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value)))} 
                    />
                  </div>
                </div>
                <div className="slider-container" style={{ marginTop: '16px' }}>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPriceLimit} 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--wine)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                    <span>Rs. 0</span>
                    <span>Rs. {maxPriceLimit.toLocaleString()}</span>
                  </div>
                </div>
                {/* Price Quick Filters */}
                <div className="quick-prices">
                  <button onClick={() => applyPriceQuickFilter(0, 1000)}>Under 1k</button>
                  <button onClick={() => applyPriceQuickFilter(1000, 3000)}>1k - 3k</button>
                  <button onClick={() => applyPriceQuickFilter(3000, maxPriceLimit)}>Over 3k</button>
                </div>
              </div>

              {/* Sorting Filter */}
              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select 
                  className="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured / Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="discount">Discount: High to Low</option>
                </select>
              </div>

              {/* Reset Action */}
              <button className="reset-btn" onClick={resetFilters}>
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <section className="search-results">
            <div className="results-header">
              <div>
                <h2>Search Results</h2>
                <p className="results-count">
                  {sortedProducts.length === 0 
                    ? "No matching pieces found." 
                    : `Showing ${sortedProducts.length} jewellery pieces`}
                </p>
              </div>
              {(searchQuery || selectedCategories.length > 0 || minPrice > 0 || maxPrice < maxPriceLimit || sortBy !== 'featured') && (
                <button className="clear-all-filter-link" onClick={resetFilters}>
                  Clear Filters
                </button>
              )}
            </div>

            {/* Active Tags Summary */}
            <div className="active-filters-row">
              {searchQuery && <span className="filter-pill">Keyword: "{searchQuery}"</span>}
              {selectedCategories.map(cat => (
                <span key={cat} className="filter-pill">Category: {cat}</span>
              ))}
              {(minPrice > 0 || maxPrice < maxPriceLimit) && (
                <span className="filter-pill">Rs. {minPrice} - Rs. {maxPrice}</span>
              )}
              {sortBy !== 'featured' && (
                <span className="filter-pill">Sorted by: {sortBy}</span>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid">
              {sortedProducts.map(p => {
                const offPct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
                const isWishlisted = wishlist.includes(p.id);
                return (
                  <div key={p.id} className="card" onClick={() => openModal(p)}>
                    <div className="thumb-wrap">
                      {offPct > 0 && <span className="off-badge">{offPct}% OFF</span>}
                      <button 
                        onClick={(e) => toggleWishlist(p.id, e)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          zIndex: 10,
                          background: 'rgba(250, 243, 231, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '14px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        {isWishlisted ? '❤️' : '♡'}
                      </button>
                      <JewelSVG category={p.category} productId={p.id} imageUrl={p.img} altText={p.name} />
                      <span className="zoom-hint">&#128269;</span>
                    </div>
                    <div className="card-body">
                      <span className="category-tag">{p.category}</span>
                      <h3>{p.name}</h3>
                      <div className="price-row">
                        <span className="price">{formatRupee(p.price)}</span>
                        {p.oldPrice > p.price && (
                          <span className="price-strike">{formatRupee(p.oldPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="brand-foot">RENT - A - JEWEL by VIDHYA</div>
        <p>sample catalog for demonstration</p>
        <small>Product data &amp; images dynamically loaded from catalog sheet. Not an active store.</small>
      </footer>

      {/* Detailed Modal Dialog Overlay with Desktop/Mobile Magnifiers */}
      <dialog 
        ref={dialogRef} 
        className="modal-dialog" 
        onClick={handleBackdropClick}
        onClose={closeModal}
      >
        {activeProduct && (
          <>
            <button className="modal-close" onClick={closeModal}>&#10005;</button>
            <div className="modal-box">
              <div 
                className={`modal-img ${isZoomed ? 'zoomed' : ''}`} 
                onClick={() => {
                  if (window.innerWidth <= 720) {
                    setIsZoomed(!isZoomed);
                  }
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: isTouchZooming 
                      ? `scale(${zoomFactor}) translate(-${lensPos.xPercent}%, -${lensPos.yPercent}%)` 
                      : 'none',
                    transformOrigin: '0 0',
                    transition: isTouchZooming ? 'none' : 'transform 0.15s ease-out'
                  }}
                >
                  <JewelSVG 
                    category={activeProduct.category} 
                    productId={activeProduct.id} 
                    imageUrl={activeProduct.img} 
                    altText={activeProduct.name} 
                  />
                </div>
                {isHovering && (
                  <div 
                    className="zoom-lens"
                    style={{
                      left: `${lensPos.xPercent}%`,
                      top: `${lensPos.yPercent}%`,
                      width: `${(1 / zoomFactor) * 100}%`,
                      height: `${(1 / zoomFactor) * 100}%`
                    }}
                  />
                )}
              </div>
              {isHovering && (
                <div className="zoom-window">
                  <div 
                    className="zoom-img-container"
                    style={{
                      transform: `scale(${zoomFactor}) translate(-${lensPos.xPercent}%, -${lensPos.yPercent}%)`
                    }}
                  >
                    <JewelSVG 
                      category={activeProduct.category} 
                      productId={activeProduct.id} 
                      imageUrl={activeProduct.img} 
                      altText={activeProduct.name} 
                    />
                  </div>
                </div>
              )}
              <div className="modal-info">
                <div className="eyebrow">{activeProduct.category}</div>
                <h3>{activeProduct.name}</h3>
                <div className="price-row">
                  <span className="price">{formatRupee(activeProduct.price)}</span>
                  {activeProduct.oldPrice > activeProduct.price && (
                    <span className="price-strike">{formatRupee(activeProduct.oldPrice)}</span>
                  )}
                </div>
                <p className="desc">{activeProduct.desc || "Exquisitely detailed jewelry piece, handcrafted for special celebrations and traditional occasions."}</p>
                <div className="zoom-note desktop-note">Hover over image to zoom</div>
                <div className="zoom-note mobile-note">Tap &amp; drag image to zoom</div>
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
