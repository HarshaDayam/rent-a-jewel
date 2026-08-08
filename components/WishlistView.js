'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import JewelSVG from './JewelSVG';
import SearchWidget from './SearchWidget';

const RUPEE_SYMBOL = "Rs. ";
function formatRupee(n) {
  return RUPEE_SYMBOL + Number(n).toLocaleString("en-IN") + ".00";
}

export default function WishlistView({ products = [] }) {
  const [wishlist, setWishlist] = useState([]);
  const [mounted, setMounted] = useState(false);
  
  // Modal Detail States (similar to Catalog/Search views)
  const [activeProduct, setActiveProduct] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ xPercent: 50, yPercent: 50 });
  const [isTouchZooming, setIsTouchZooming] = useState(false);
  const dialogRef = useRef(null);
  const zoomFactor = 2.5;

  useEffect(() => {
    setMounted(true);
    try {
      const storedWishlist = localStorage.getItem('rent_a_jewel_wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
  }, []);

  const removeFromWishlist = (productId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = wishlist.filter(id => id !== productId);
    setWishlist(updated);
    try {
      localStorage.setItem('rent_a_jewel_wishlist', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
    
    // Close modal if the removed product is currently open
    if (activeProduct && activeProduct.id === productId) {
      closeModal();
    }
  };

  // --- Modal Logic ---
  const openModal = (product) => {
    setActiveProduct(product);
    setIsZoomed(false);
    setIsHovering(false);
    setIsTouchZooming(false);
    if (dialogRef.current) {
      dialogRef.current.showModal();
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      document.body.style.overflow = '';
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

  // --- Hover/Touch Zoom Logic ---
  const updateZoomPosition = (clientX, clientY, container) => {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));
    setLensPos({
      xPercent: (x / rect.width) * 100,
      yPercent: (y / rect.height) * 100
    });
  };

  const handleMouseEnter = (e) => {
    if (window.innerWidth > 720) {
      setIsHovering(true);
      updateZoomPosition(e.clientX, e.clientY, e.currentTarget);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseMove = (e) => {
    if (isHovering && window.innerWidth > 720) {
      updateZoomPosition(e.clientX, e.clientY, e.currentTarget);
    }
  };

  const handleTouchStart = (e) => {
    if (window.innerWidth <= 720 && isZoomed && e.touches.length === 1) {
      setIsTouchZooming(true);
      updateZoomPosition(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  };

  const handleTouchMove = (e) => {
    if (isTouchZooming && e.touches.length === 1) {
      updateZoomPosition(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  };

  const handleTouchEnd = () => {
    setIsTouchZooming(false);
    setLensPos({ xPercent: 50, yPercent: 50 });
  };

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

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
              <Link href="/search" style={{ color: 'var(--ivory)', fontSize: '13px', textDecoration: 'none', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.8 }}>
                Search &amp; Filters
              </Link>
            </li>
            <li>
              <Link href="/wishlist" style={{ color: 'var(--gold-light)', fontSize: '13px', textDecoration: 'none', letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: '1px solid var(--gold)', paddingBottom: '4px' }}>
                My Wishlist
              </Link>
            </li>
          </ul>
          <div className="nav-icons">
            <SearchWidget products={products} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontFamily: 'var(--font-marcellus), serif', fontSize: '32px', color: 'var(--wine)', marginBottom: '10px' }}>
          Your Wishlist
        </h1>
        <p style={{ color: 'var(--bronze)', fontSize: '14px', marginBottom: '40px' }}>
          {mounted ? `${wishlist.length} item(s) saved` : "Loading wishlist..."}
        </p>

        {mounted && wishlistedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--ivory)', borderRadius: '8px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>♡</div>
            <h2 style={{ fontFamily: 'var(--font-marcellus), serif', color: 'var(--wine)', marginBottom: '10px' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--bronze)', marginBottom: '30px' }}>Explore our catalog and save your favorite pieces.</p>
            <Link href="/" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--gold)', color: '#fff', textDecoration: 'none', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', borderRadius: '4px' }}>
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="catalog-grid">
            {wishlistedProducts.map(p => (
              <div className="card" key={p.id} onClick={() => openModal(p)}>
                <div className="card-img">
                  <button 
                    className="wishlist-btn active"
                    onClick={(e) => removeFromWishlist(p.id, e)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 2,
                      background: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      color: 'var(--wine)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    title="Remove from Wishlist"
                  >
                    ❤️
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
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="brand-foot">RENT - A - JEWEL by VIDHYA</div>
        <p>sample catalog for demonstration</p>
        <small>Product data &amp; images dynamically loaded from catalog sheet. Not an active store.</small>
      </footer>

      {/* Modal Dialog */}
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
                
                <button 
                  onClick={() => removeFromWishlist(activeProduct.id)}
                  style={{ 
                    marginTop: '20px', 
                    padding: '12px', 
                    background: 'var(--wine)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-inter), sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '12px'
                  }}
                >
                  Remove from Wishlist
                </button>

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
