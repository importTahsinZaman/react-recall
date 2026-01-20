"use client";

import { useState } from "react";

// Products data
const products = [
  {
    id: "ethiopian-yirgacheffe",
    name: "Ethiopian Yirgacheffe",
    origin: "Gedeo Zone, Ethiopia",
    notes: "Jasmine, bergamot, honey",
    roast: "Light",
    price: 24,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=500&fit=crop",
  },
  {
    id: "colombian-supremo",
    name: "Colombian Supremo",
    origin: "Huila, Colombia",
    notes: "Caramel, walnut, citrus",
    roast: "Medium",
    price: 22,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=500&fit=crop",
  },
  {
    id: "sumatra-mandheling",
    name: "Sumatra Mandheling",
    origin: "North Sumatra, Indonesia",
    notes: "Dark chocolate, cedar, earth",
    roast: "Dark",
    price: 26,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=500&fit=crop",
  },
  {
    id: "kenya-aa",
    name: "Kenya AA",
    origin: "Nyeri, Kenya",
    notes: "Blackcurrant, tomato, brown sugar",
    roast: "Medium-Light",
    price: 28,
    image: "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&h=500&fit=crop",
  },
];

// Cart state with intentional bug
export default function Home() {
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const addToCart = (product: typeof products[0]) => {
    setCartItemIds((prev) => [...prev, product.id]);
  };

  const removeFromCart = (productId: string) => {
    setCartItemIds((prev) => prev.filter((id) => id !== productId));
    // BUG: Track removed items but use them incorrectly in checkout
    setRemovedItems((prev) => [...prev, productId]);
  };

  const checkout = () => {
    setIsCheckingOut(true);

    // Calculate order total
    let total = 0;
    for (const id of cartItemIds) {
      const item = products.find((p) => p.id === id);
      total += item!.price;
    }

    // BUG: Show "savings" from removed items
    // Developer tried to look up a "variant" product that doesn't exist
    if (removedItems.length > 0) {
      const savedItem = products.find(p => p.id === removedItems[0] + "-savings");
      // BUG: savedItem is undefined - there's no product with "-savings" suffix
      // This crashes: Cannot read property 'price' of undefined
      const savedAmount = savedItem!.price;
      console.log(`You saved $${savedAmount} by removing items`);
    }

    // Never reaches here if items were removed
    setTimeout(() => {
      setIsCheckingOut(false);
      alert(`Order placed! Total: $${total}`);
    }, 1000);
  };

  const cartItems = cartItemIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item?.price || 0), 0);
  const itemCounts = cartItemIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueCartItems = [...new Set(cartItemIds)].map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;

  return (
    <div style={styles.container}>
      {/* Background texture */}
      <div style={styles.bgTexture} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C10.477 4 6 8.477 6 14c0 4.418 2.865 8.166 6.84 9.49.18.036.24-.09.24-.18v-2.7c-2.78.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .09.06.22.24.18C23.135 22.166 26 18.418 26 14c0-5.523-4.477-10-10-10z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.logo}>ORIGIN</h1>
            <p style={styles.tagline}>Specialty Coffee Roasters</p>
          </div>
        </div>
        <nav style={styles.nav}>
          <a href="#" style={styles.navLink}>Shop</a>
          <a href="#" style={styles.navLink}>Our Story</a>
          <a href="#" style={styles.navLink}>Subscriptions</a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <span style={styles.heroLabel}>New Harvest</span>
          <h2 style={styles.heroTitle}>Single Origin<br />Collection</h2>
          <p style={styles.heroSubtitle}>
            Hand-selected beans from the world's finest growing regions,<br />
            roasted in small batches for peak flavor.
          </p>
        </section>

        {/* Products + Cart Layout */}
        <div style={styles.shopLayout}>
          {/* Product Grid */}
          <section style={styles.productsSection}>
            <div style={styles.productGrid}>
              {products.map((product, index) => (
                <article
                  key={product.id}
                  style={{
                    ...styles.productCard,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div style={styles.productImageContainer}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={styles.productImage}
                    />
                    <div style={styles.roastBadge}>{product.roast}</div>
                  </div>
                  <div style={styles.productInfo}>
                    <span style={styles.productOrigin}>{product.origin}</span>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productNotes}>{product.notes}</p>
                    <div style={styles.productFooter}>
                      <span style={styles.productPrice}>${product.price}</span>
                      <button
                        onClick={() => addToCart(product)}
                        style={styles.addButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#d4a574';
                          e.currentTarget.style.color = '#0a0a0a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#d4a574';
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Cart Sidebar */}
          <aside style={styles.cartSidebar}>
            <div style={styles.cartHeader}>
              <h3 style={styles.cartTitle}>Your Cart</h3>
              <span style={styles.cartCount}>
                {cartItemIds.length} {cartItemIds.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {uniqueCartItems.length === 0 ? (
              <div style={styles.emptyCart}>
                <div style={styles.emptyCartIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M6 6h15l-1.5 9h-12z" />
                    <circle cx="9" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                    <path d="M6 6L5 3H2" />
                  </svg>
                </div>
                <p style={styles.emptyCartText}>Your cart is empty</p>
                <p style={styles.emptyCartSubtext}>Add some coffee to get started</p>
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
                      <div style={styles.cartItemInfo}>
                        <h4 style={styles.cartItemName}>{item.name}</h4>
                        <p style={styles.cartItemMeta}>
                          ${item.price} × {itemCounts[item.id]}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={styles.removeButton}
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div style={styles.cartFooter}>
                  <div style={styles.cartTotal}>
                    <span style={styles.cartTotalLabel}>Subtotal</span>
                    <span style={styles.cartTotalValue}>${cartTotal}</span>
                  </div>
                  <p style={styles.shippingNote}>Shipping calculated at checkout</p>
                  <button
                    onClick={checkout}
                    disabled={isCheckingOut}
                    style={{
                      ...styles.checkoutButton,
                      opacity: isCheckingOut ? 0.7 : 1,
                    }}
                  >
                    {isCheckingOut ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer style={styles.footer}>
        <p>© 2024 Origin Coffee Roasters. Crafted with care.</p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          box-sizing: border-box;
        }

        ::selection {
          background: #d4a574;
          color: #0a0a0a;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#f5f0eb',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  bgTexture: {
    position: 'fixed',
    inset: 0,
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(212, 165, 116, 0.05) 0%, transparent 50%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")
    `,
    opacity: 0.4,
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 48px',
    borderBottom: '1px solid rgba(212, 165, 116, 0.15)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d4a574 0%, #c9956c 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0a0a0a',
  },
  logo: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '28px',
    fontWeight: 500,
    letterSpacing: '0.2em',
    margin: 0,
    color: '#f5f0eb',
  },
  tagline: {
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(212, 165, 116, 0.8)',
    margin: '2px 0 0 0',
  },
  nav: {
    display: 'flex',
    gap: '40px',
  },
  navLink: {
    color: 'rgba(245, 240, 235, 0.7)',
    textDecoration: 'none',
    fontSize: '13px',
    letterSpacing: '0.05em',
    transition: 'color 0.2s ease',
  },
  main: {
    position: 'relative',
    zIndex: 10,
    padding: '0 48px',
  },
  hero: {
    textAlign: 'center',
    padding: '80px 0 60px',
  },
  heroLabel: {
    display: 'inline-block',
    fontSize: '11px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#d4a574',
    border: '1px solid rgba(212, 165, 116, 0.3)',
    padding: '8px 20px',
    marginBottom: '24px',
  },
  heroTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '64px',
    fontWeight: 400,
    lineHeight: 1.1,
    margin: '0 0 24px 0',
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: 'rgba(245, 240, 235, 0.6)',
    fontWeight: 300,
    margin: 0,
  },
  shopLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '48px',
    paddingBottom: '80px',
  },
  productsSection: {
    // No additional styles needed
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '32px',
  },
  productCard: {
    background: 'rgba(20, 20, 20, 0.6)',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(212, 165, 116, 0.1)',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
    animation: 'fadeInUp 0.6s ease forwards',
    opacity: 0,
  },
  productImageContainer: {
    position: 'relative',
    aspectRatio: '4/3',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  roastBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(10, 10, 10, 0.85)',
    backdropFilter: 'blur(8px)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#d4a574',
  },
  productInfo: {
    padding: '24px',
  },
  productOrigin: {
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(212, 165, 116, 0.7)',
  },
  productName: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '24px',
    fontWeight: 500,
    margin: '8px 0',
    color: '#f5f0eb',
  },
  productNotes: {
    fontSize: '13px',
    color: 'rgba(245, 240, 235, 0.5)',
    fontStyle: 'italic',
    margin: '0 0 20px 0',
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '28px',
    fontWeight: 500,
    color: '#d4a574',
  },
  addButton: {
    background: 'transparent',
    border: '1px solid #d4a574',
    color: '#d4a574',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
  cartSidebar: {
    background: 'rgba(20, 20, 20, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(212, 165, 116, 0.15)',
    padding: '32px',
    position: 'sticky',
    top: '24px',
    height: 'fit-content',
    maxHeight: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column',
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(212, 165, 116, 0.1)',
  },
  cartTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '24px',
    fontWeight: 500,
    margin: 0,
  },
  cartCount: {
    fontSize: '13px',
    color: 'rgba(212, 165, 116, 0.7)',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '48px 0',
  },
  emptyCartIcon: {
    color: 'rgba(212, 165, 116, 0.3)',
    marginBottom: '16px',
  },
  emptyCartText: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '20px',
    margin: '0 0 8px 0',
    color: 'rgba(245, 240, 235, 0.6)',
  },
  emptyCartSubtext: {
    fontSize: '13px',
    color: 'rgba(245, 240, 235, 0.4)',
    margin: 0,
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    overflowY: 'auto',
    marginBottom: '24px',
  },
  cartItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(10, 10, 10, 0.4)',
    borderRadius: '10px',
  },
  cartItemImage: {
    width: '64px',
    height: '64px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '16px',
    fontWeight: 500,
    margin: '0 0 4px 0',
  },
  cartItemMeta: {
    fontSize: '13px',
    color: 'rgba(212, 165, 116, 0.7)',
    margin: 0,
  },
  removeButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(245, 240, 235, 0.4)',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
    borderRadius: '6px',
  },
  cartFooter: {
    borderTop: '1px solid rgba(212, 165, 116, 0.1)',
    paddingTop: '24px',
  },
  cartTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cartTotalLabel: {
    fontSize: '14px',
    color: 'rgba(245, 240, 235, 0.7)',
  },
  cartTotalValue: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: '32px',
    fontWeight: 500,
    color: '#d4a574',
  },
  shippingNote: {
    fontSize: '12px',
    color: 'rgba(245, 240, 235, 0.4)',
    margin: '0 0 20px 0',
  },
  checkoutButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #d4a574 0%, #c9956c 100%)',
    border: 'none',
    color: '#0a0a0a',
    padding: '18px 32px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '40px',
    borderTop: '1px solid rgba(212, 165, 116, 0.1)',
    fontSize: '12px',
    color: 'rgba(245, 240, 235, 0.4)',
    letterSpacing: '0.05em',
  },
};
