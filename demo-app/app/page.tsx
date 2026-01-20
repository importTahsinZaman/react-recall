"use client";

import { useState } from "react";

const products = [
  {
    id: "ethiopian-yirgacheffe",
    name: "Ethiopian Yirgacheffe",
    origin: "Gedeo Zone, Ethiopia",
    description: "Bright and floral with notes of jasmine, bergamot, and raw honey. Light roast.",
    price: 19,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&q=80",
  },
  {
    id: "colombia-huila",
    name: "Colombia Huila",
    origin: "Huila Region, Colombia",
    description: "Balanced and smooth with caramel sweetness and citrus brightness. Medium roast.",
    price: 18,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop&q=80",
  },
  {
    id: "guatemala-antigua",
    name: "Guatemala Antigua",
    origin: "Antigua Valley, Guatemala",
    description: "Rich chocolate notes with subtle spice and a velvety body. Medium-dark roast.",
    price: 20,
    image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=600&h=600&fit=crop&q=80",
  },
  {
    id: "kenya-nyeri",
    name: "Kenya Nyeri AA",
    origin: "Nyeri County, Kenya",
    description: "Complex and wine-like with blackcurrant, tomato, and brown sugar. Light-medium roast.",
    price: 22,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&q=80",
  },
];

export default function Home() {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const addToCart = (productId: string) => {
    setCartItems((prev) => [...prev, productId]);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => {
      const index = prev.indexOf(productId);
      if (index > -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
    setRemovedItems((prev) => [...prev, productId]);
  };

  const checkout = () => {
    setIsCheckingOut(true);

    let total = 0;
    for (const id of cartItems) {
      const item = products.find((p) => p.id === id);
      total += item!.price;
    }

    // BUG: Attempt to calculate "savings" from removed items
    if (removedItems.length > 0) {
      const savedItem = products.find((p) => p.id === removedItems[0] + "-savings");
      const savedAmount = savedItem!.price;
      console.log(`You saved $${savedAmount} by removing items`);
    }

    setTimeout(() => {
      setIsCheckingOut(false);
      setCartItems([]);
      setIsCartOpen(false);
      alert(`Order confirmed! Total: $${total}`);
    }, 1500);
  };

  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, id) => {
    const product = products.find((p) => p.id === id);
    return sum + (product?.price || 0);
  }, 0);

  const itemCounts = cartItems.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueCartItems = [...new Set(cartItems)]
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <a href="#" style={styles.logo}>
            <span style={styles.logoMark}>●</span>
            <span style={styles.logoText}>Forthright Coffee</span>
          </a>

          <nav style={styles.nav}>
            <a href="#" style={styles.navLink}>Shop</a>
            <a href="#" style={styles.navLink}>Subscribe</a>
            <a href="#" style={styles.navLink}>About</a>
            <a href="#" style={styles.navLink}>Locations</a>
          </nav>

          <button
            onClick={() => setIsCartOpen(true)}
            style={styles.cartButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && (
              <span style={styles.cartBadge}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.heroLabel}>Single Origin Collection</p>
          <h1 style={styles.heroTitle}>Coffee worth<br />waking up for</h1>
          <p style={styles.heroSubtitle}>
            Thoughtfully sourced, carefully roasted, delivered fresh to your door.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Our Coffees</h2>
          <p style={styles.sectionSubtitle}>Each origin tells a story. Find yours.</p>
        </div>

        <div style={styles.productGrid}>
          {products.map((product) => (
            <article key={product.id} style={styles.productCard}>
              <div style={styles.productImageWrapper}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={styles.productImage}
                />
              </div>
              <div style={styles.productContent}>
                <p style={styles.productOrigin}>{product.origin}</p>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDescription}>{product.description}</p>
                <div style={styles.productFooter}>
                  <span style={styles.productPrice}>${product.price}</span>
                  <button
                    onClick={() => addToCart(product.id)}
                    style={styles.addToCartButton}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 style={styles.featureTitle}>Direct Trade</h3>
          <p style={styles.featureText}>We work directly with farmers, ensuring fair wages and sustainable practices.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <h3 style={styles.featureTitle}>Fresh Roasted</h3>
          <p style={styles.featureText}>Roasted to order and shipped within 24 hours for peak freshness.</p>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <h3 style={styles.featureTitle}>Satisfaction Guaranteed</h3>
          <p style={styles.featureText}>Not in love? We'll make it right or refund your order.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <span style={styles.logoMark}>●</span>
            <span style={styles.footerLogoText}>Forthright Coffee</span>
          </div>
          <p style={styles.footerText}>Honest coffee for discerning people.</p>
          <p style={styles.footerCopyright}>© 2024 Forthright Coffee Co. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart Overlay */}
      {isCartOpen && (
        <div style={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
          <div style={styles.cartPanel} onClick={(e) => e.stopPropagation()}>
            <div style={styles.cartHeader}>
              <h2 style={styles.cartTitle}>Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                style={styles.closeButton}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {uniqueCartItems.length === 0 ? (
              <div style={styles.emptyCart}>
                <p style={styles.emptyCartText}>Your cart is empty</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={styles.continueShoppingButton}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div style={styles.cartItems}>
                  {uniqueCartItems.map((item) => (
                    <div key={item.id} style={styles.cartItem}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={styles.cartItemImage}
                      />
                      <div style={styles.cartItemDetails}>
                        <h4 style={styles.cartItemName}>{item.name}</h4>
                        <p style={styles.cartItemPrice}>
                          ${item.price} × {itemCounts[item.id]}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={styles.removeItemButton}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div style={styles.cartFooter}>
                  <div style={styles.cartTotal}>
                    <span style={styles.cartTotalLabel}>Subtotal</span>
                    <span style={styles.cartTotalAmount}>${cartTotal}</span>
                  </div>
                  <p style={styles.cartShipping}>Shipping calculated at checkout</p>
                  <button
                    onClick={checkout}
                    disabled={isCheckingOut}
                    style={{
                      ...styles.checkoutButton,
                      opacity: isCheckingOut ? 0.7 : 1,
                      cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600&family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: #c45d3a;
          color: white;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#fafaf9',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    color: '#1a1a1a',
  },

  // Header
  header: {
    position: 'sticky',
    top: 0,
    background: 'rgba(250, 250, 249, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #eaeaea',
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#1a1a1a',
  },
  logoMark: {
    fontSize: '24px',
    color: '#c45d3a',
  },
  logoText: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '20px',
    fontWeight: 500,
  },
  nav: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    color: '#4a4a4a',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  cartButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#1a1a1a',
  },
  cartBadge: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: '#c45d3a',
    color: 'white',
    fontSize: '10px',
    fontWeight: 600,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  hero: {
    background: 'linear-gradient(180deg, #fafaf9 0%, #f5f0eb 100%)',
    padding: '80px 24px 100px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  heroLabel: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#c45d3a',
    marginBottom: '16px',
  },
  heroTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '56px',
    fontWeight: 400,
    lineHeight: 1.1,
    marginBottom: '20px',
    color: '#1a1a1a',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#5a5a5a',
    lineHeight: 1.6,
  },

  // Products
  productsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 24px',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  sectionTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '36px',
    fontWeight: 400,
    marginBottom: '12px',
  },
  sectionSubtitle: {
    fontSize: '16px',
    color: '#6a6a6a',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  productCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  productImageWrapper: {
    aspectRatio: '1',
    overflow: 'hidden',
    background: '#f5f0eb',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  productContent: {
    padding: '20px',
  },
  productOrigin: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '6px',
  },
  productName: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '18px',
    fontWeight: 500,
    marginBottom: '8px',
    color: '#1a1a1a',
  },
  productDescription: {
    fontSize: '13px',
    color: '#6a6a6a',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  productFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '20px',
    fontWeight: 500,
    color: '#1a1a1a',
  },
  addToCartButton: {
    background: '#1a1a1a',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Features
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '60px 24px 100px',
    borderTop: '1px solid #eaeaea',
  },
  feature: {
    textAlign: 'center',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    background: '#f5f0eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: '#c45d3a',
  },
  featureTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '18px',
    fontWeight: 500,
    marginBottom: '8px',
  },
  featureText: {
    fontSize: '14px',
    color: '#6a6a6a',
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    background: '#1a1a1a',
    color: 'white',
    padding: '60px 24px',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  footerLogoText: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '20px',
    fontWeight: 500,
  },
  footerText: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '24px',
  },
  footerCopyright: {
    color: '#555',
    fontSize: '12px',
  },

  // Cart
  cartOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 200,
    animation: 'fadeIn 0.2s ease',
  },
  cartPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '420px',
    maxWidth: '100%',
    background: 'white',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s ease',
  },
  cartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #eaeaea',
  },
  cartTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '20px',
    fontWeight: 500,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#666',
  },
  emptyCart: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  emptyCartText: {
    color: '#888',
    marginBottom: '20px',
  },
  continueShoppingButton: {
    background: 'none',
    border: '1px solid #1a1a1a',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  cartItems: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 24px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  cartItemImage: {
    width: '72px',
    height: '72px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '15px',
    fontWeight: 500,
    marginBottom: '4px',
  },
  cartItemPrice: {
    fontSize: '13px',
    color: '#666',
  },
  removeItemButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#999',
    transition: 'color 0.2s',
  },
  cartFooter: {
    padding: '24px',
    borderTop: '1px solid #eaeaea',
    background: '#fafaf9',
  },
  cartTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cartTotalLabel: {
    fontSize: '14px',
    color: '#666',
  },
  cartTotalAmount: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '24px',
    fontWeight: 500,
  },
  cartShipping: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '20px',
  },
  checkoutButton: {
    width: '100%',
    background: '#c45d3a',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.2s',
  },
};
