'use client';

import React, { useState, useEffect, useRef } from 'react';
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

export default function CatalogView({ products = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [alsoViewed, setAlsoViewed] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchZooming, setIsTouchZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ xPercent: 0, yPercent: 0 });
  const zoomFactor = 2.5;

  const dialogRef = useRef(null);
  const recentCarouselRef = useRef(null);
  const alsoViewedCarouselRef = useRef(null);

  // Initialize recently viewed from localStorage and shuffle alsoViewed on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rent_a_jewel_recent');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
      
      const storedWishlist = localStorage.getItem('rent_a_jewel_wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (e) {
      console.error('Failed to load localStorage data:', e);
    }

    // Shuffle and pick 8 random products for "Customers Also Viewed"
    if (products.length > 0) {
      const shuffled = [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);
      setAlsoViewed(shuffled);
    }
  }, [products]);

  // Handle recently viewed tracking
  const trackProductView = (productId) => {
    let updated = [productId, ...recentlyViewed.filter(id => id !== productId)];
    if (updated.length > 10) updated = updated.slice(0, 10);
    setRecentlyViewed(updated);
    try {
      localStorage.setItem('rent_a_jewel_recent', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recently viewed to localStorage:', e);
    }
  };

  // Toggle wishlist item
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
      console.error('Failed to save wishlist to localStorage:', e);
    }
  };

  // Open zoom modal
  const openModal = (product) => {
    setActiveProduct(product);
    setIsZoomed(false);
    trackProductView(product.id);
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  // Close zoom modal
  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    setActiveProduct(null);
    setIsZoomed(false);
    setIsHovering(false);
    setIsTouchZooming(false);
  };

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
    
    // Center the lens on cursor, and constrain it between 0 and 1 - lensSize
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

  // Close when clicking on the dialog backdrop
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      closeModal();
    }
  };

  // Scroll carousels horizontally
  const scrollCarousel = (carouselRef, dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  // Map user navigation labels to category names in backend database
  const mapNavCategory = (navLabel) => {
    if (navLabel === 'Necklaces') return 'Necklace';
    if (navLabel === 'Harams') return 'Haram';
    return navLabel; // Bangles, Earrings, Bridal match exactly
  };

  // Filters logic
  const categoriesList = ['All', 'Necklaces', 'Bangles', 'Earrings', 'Bridal', 'Harams'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === mapNavCategory(selectedCategory);
    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const searchableText = `${p.name} ${p.category} ${p.desc || ""}`;
    const matchesSearch = queryWords.every(word => 
      isWordMatchWithTypo(word, searchableText)
    );
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Site Header */}
      <header className="site">
        <div className="nav-wrap">
          <Link href="/" className="brand" onClick={() => setSelectedCategory('All')}>
            <span className="name" style={{ color: 'var(--gold)' }}>RENT - A - JEWEL</span>
            <span className="sub" style={{ color: 'var(--green)' }}>BY VIDHYA</span>
          </Link>
          <ul className="nav-links">
            {categoriesList.slice(1).map(cat => (
              <li key={cat}>
                <button 
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => {
                    setSelectedCategory(cat);
                    const catalogEl = document.getElementById('catalog');
                    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
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

      <section className="hero">
        <div className="hero-eyebrow">CLASSICAL DANCE - BRIDAL - PARTYWEAR JEWELRY</div>
        <h1>
          <span style={{ color: 'var(--gold)' }}>RENT - A - JEWEL</span>
          <span style={{ fontSize: '0.42em', display: 'block', letterSpacing: '2px', marginTop: '8px', color: 'var(--green)' }}>BY VIDHYA</span>
        </h1>
        <p className="tag">Where tradition is set in every stone</p>
        <div className="ornament">
          <span className="line"></span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="#C9A24B" />
          </svg>
          <span className="line"></span>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <section className="section" id="catalog">
        <div className="section-head">
          <div className="eyebrow">The Catalog</div>
          <h2>Our Collection</h2>
          {/* Category Quick Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  if (searchQuery === "wishlist_active") setSearchQuery('');
                  setSelectedCategory(cat);
                }}
                style={{
                  background: selectedCategory === cat ? 'var(--wine)' : 'var(--card)',
                  color: selectedCategory === cat ? 'var(--gold-light)' : 'var(--ink)',
                  border: '1px solid rgba(122, 75, 31, .15)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  transition: 'all 0.25s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Product Cards */}
        {filteredProducts.length === 0 ? (
          <p className="empty-note">
            {searchQuery === "wishlist_active" 
              ? "No items in your wishlist yet." 
              : "No jewellery pieces found matching your filter details."}
          </p>
        ) : (
          <div className="grid">
            {filteredProducts.map(p => {
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
        )}
      </section>

      {/* Recently Viewed Carousel Section */}
      <section className="section carousel-section">
        <div className="section-head">
          <div className="eyebrow">Your Journey</div>
          <h2>Recently Viewed</h2>
        </div>
        <div className="carousel-outer">
          <button className="carousel-nav prev" onClick={() => scrollCarousel(recentCarouselRef, -1)}>&#8249;</button>
          <div className="carousel" ref={recentCarouselRef}>
            {recentlyViewed.map(id => {
              const p = products.find(prod => prod.id === id);
              if (!p) return null;
              return (
                <div key={`recent-${p.id}`} className="mini-card" onClick={() => openModal(p)}>
                  <div className="mini-thumb">
                    <JewelSVG category={p.category} productId={p.id} imageUrl={p.img} altText={p.name} />
                  </div>
                  <div className="mini-body">
                    <h4>{p.name}</h4>
                    <span className="price">{formatRupee(p.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="carousel-nav next" onClick={() => scrollCarousel(recentCarouselRef, 1)}>&#8250;</button>
        </div>
        {recentlyViewed.length === 0 && (
          <p className="empty-note">Click on any piece above to start building your viewing history.</p>
        )}
      </section>

      {/* Customers Also Viewed Section */}
      <section className="section">
        <div className="section-head">
          <div className="eyebrow">Curated For You</div>
          <h2>Customers Also Viewed</h2>
        </div>
        <div className="carousel-outer">
          <button className="carousel-nav prev" onClick={() => scrollCarousel(alsoViewedCarouselRef, -1)}>&#8249;</button>
          <div className="carousel" ref={alsoViewedCarouselRef}>
            {alsoViewed.map(p => (
              <div key={`also-${p.id}`} className="mini-card" onClick={() => openModal(p)}>
                <div className="mini-thumb">
                  <JewelSVG category={p.category} productId={p.id} imageUrl={p.img} altText={p.name} />
                </div>
                <div className="mini-body">
                  <h4>{p.name}</h4>
                  <span className="price">{formatRupee(p.price)}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-nav next" onClick={() => scrollCarousel(alsoViewedCarouselRef, 1)}>&#8250;</button>
        </div>
      </section>

      <footer>
        <div className="brand-foot">RENT - A - JEWEL by VIDHYA</div>
        <p>sample catalog for demonstration</p>
        <small>Product data &amp; images dynamically loaded from catalog sheet. Not an active store.</small>
      </footer>

      {/* Native Dialog Modal Overlay */}
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
                <div className="zoom-note mobile-note">Tap image to zoom</div>
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
