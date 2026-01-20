"use client";

import { useState, useEffect } from "react";

// Pixel art coffee icons as SVG components
const PixelCoffeeCup = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Steam */}
    <rect x="5" y="0" width="1" height="1" fill="currentColor" opacity="0.5" />
    <rect x="7" y="1" width="1" height="1" fill="currentColor" opacity="0.5" />
    <rect x="9" y="0" width="1" height="1" fill="currentColor" opacity="0.5" />
    <rect x="6" y="2" width="1" height="1" fill="currentColor" opacity="0.3" />
    <rect x="8" y="2" width="1" height="1" fill="currentColor" opacity="0.3" />
    {/* Cup */}
    <rect x="3" y="4" width="1" height="1" fill="currentColor" />
    <rect x="4" y="4" width="6" height="1" fill="currentColor" />
    <rect x="10" y="4" width="1" height="1" fill="currentColor" />
    <rect x="3" y="5" width="1" height="6" fill="currentColor" />
    <rect x="10" y="5" width="1" height="6" fill="currentColor" />
    <rect x="4" y="11" width="6" height="1" fill="currentColor" />
    {/* Handle */}
    <rect x="11" y="5" width="1" height="1" fill="currentColor" />
    <rect x="12" y="6" width="1" height="3" fill="currentColor" />
    <rect x="11" y="9" width="1" height="1" fill="currentColor" />
    {/* Coffee liquid */}
    <rect x="4" y="6" width="6" height="4" fill="currentColor" opacity="0.4" />
    {/* Saucer */}
    <rect x="2" y="12" width="10" height="1" fill="currentColor" />
    <rect x="1" y="13" width="12" height="1" fill="currentColor" />
  </svg>
);

const PixelCoffeeBeans = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Bean 1 - top left */}
    <rect x="2" y="3" width="1" height="1" fill="currentColor" />
    <rect x="3" y="2" width="2" height="1" fill="currentColor" />
    <rect x="5" y="3" width="1" height="1" fill="currentColor" />
    <rect x="1" y="4" width="1" height="2" fill="currentColor" />
    <rect x="6" y="4" width="1" height="2" fill="currentColor" />
    <rect x="2" y="6" width="1" height="1" fill="currentColor" />
    <rect x="5" y="6" width="1" height="1" fill="currentColor" />
    <rect x="3" y="7" width="2" height="1" fill="currentColor" />
    <rect x="3" y="4" width="1" height="3" fill="currentColor" opacity="0.5" />
    {/* Bean 2 - right */}
    <rect x="9" y="4" width="1" height="1" fill="currentColor" />
    <rect x="10" y="3" width="2" height="1" fill="currentColor" />
    <rect x="12" y="4" width="1" height="1" fill="currentColor" />
    <rect x="8" y="5" width="1" height="2" fill="currentColor" />
    <rect x="13" y="5" width="1" height="2" fill="currentColor" />
    <rect x="9" y="7" width="1" height="1" fill="currentColor" />
    <rect x="12" y="7" width="1" height="1" fill="currentColor" />
    <rect x="10" y="8" width="2" height="1" fill="currentColor" />
    <rect x="10" y="5" width="1" height="3" fill="currentColor" opacity="0.5" />
    {/* Bean 3 - bottom */}
    <rect x="4" y="9" width="1" height="1" fill="currentColor" />
    <rect x="5" y="8" width="2" height="1" fill="currentColor" />
    <rect x="7" y="9" width="1" height="1" fill="currentColor" />
    <rect x="3" y="10" width="1" height="2" fill="currentColor" />
    <rect x="8" y="10" width="1" height="2" fill="currentColor" />
    <rect x="4" y="12" width="1" height="1" fill="currentColor" />
    <rect x="7" y="12" width="1" height="1" fill="currentColor" />
    <rect x="5" y="13" width="2" height="1" fill="currentColor" />
    <rect x="5" y="10" width="1" height="3" fill="currentColor" opacity="0.5" />
  </svg>
);

const PixelPourOver = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Dripper top */}
    <rect x="3" y="1" width="10" height="1" fill="currentColor" />
    <rect x="4" y="2" width="8" height="1" fill="currentColor" />
    <rect x="5" y="3" width="6" height="1" fill="currentColor" />
    <rect x="5" y="4" width="1" height="1" fill="currentColor" />
    <rect x="10" y="4" width="1" height="1" fill="currentColor" />
    <rect x="6" y="5" width="1" height="1" fill="currentColor" />
    <rect x="9" y="5" width="1" height="1" fill="currentColor" />
    <rect x="7" y="6" width="2" height="1" fill="currentColor" />
    {/* Drip */}
    <rect x="7" y="7" width="1" height="1" fill="currentColor" opacity="0.6" />
    <rect x="7" y="9" width="1" height="1" fill="currentColor" opacity="0.4" />
    {/* Carafe */}
    <rect x="4" y="10" width="8" height="1" fill="currentColor" />
    <rect x="3" y="11" width="1" height="3" fill="currentColor" />
    <rect x="12" y="11" width="1" height="3" fill="currentColor" />
    <rect x="4" y="14" width="8" height="1" fill="currentColor" />
    {/* Coffee in carafe */}
    <rect x="4" y="12" width="8" height="2" fill="currentColor" opacity="0.3" />
    {/* Handle */}
    <rect x="13" y="11" width="1" height="1" fill="currentColor" />
    <rect x="14" y="12" width="1" height="1" fill="currentColor" />
    <rect x="13" y="13" width="1" height="1" fill="currentColor" />
  </svg>
);

const PixelEspresso = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Portafilter handle */}
    <rect x="1" y="5" width="3" height="1" fill="currentColor" />
    <rect x="1" y="6" width="3" height="1" fill="currentColor" />
    {/* Portafilter body */}
    <rect x="4" y="4" width="8" height="1" fill="currentColor" />
    <rect x="4" y="5" width="1" height="3" fill="currentColor" />
    <rect x="11" y="5" width="1" height="3" fill="currentColor" />
    <rect x="5" y="7" width="6" height="1" fill="currentColor" />
    {/* Coffee basket */}
    <rect x="5" y="5" width="6" height="2" fill="currentColor" opacity="0.4" />
    {/* Spouts */}
    <rect x="6" y="8" width="1" height="2" fill="currentColor" />
    <rect x="9" y="8" width="1" height="2" fill="currentColor" />
    {/* Drips */}
    <rect x="6" y="10" width="1" height="1" fill="currentColor" opacity="0.6" />
    <rect x="9" y="11" width="1" height="1" fill="currentColor" opacity="0.6" />
    {/* Cup */}
    <rect x="4" y="12" width="8" height="1" fill="currentColor" />
    <rect x="3" y="13" width="10" height="1" fill="currentColor" />
    <rect x="2" y="14" width="12" height="1" fill="currentColor" />
  </svg>
);

const pixelIcons = [PixelCoffeeCup, PixelCoffeeBeans, PixelPourOver, PixelEspresso];

// Products data
const products = [
  {
    id: "ethiopian-yirgacheffe",
    name: "ETHIOPIAN_YIRGACHEFFE",
    origin: "GEDEO_ZONE",
    notes: "JASMINE, BERGAMOT, HONEY",
    roast: "LIGHT",
    price: 24,
    icon: 0,
  },
  {
    id: "colombian-supremo",
    name: "COLOMBIAN_SUPREMO",
    origin: "HUILA_REGION",
    notes: "CARAMEL, WALNUT, CITRUS",
    roast: "MEDIUM",
    price: 22,
    icon: 1,
  },
  {
    id: "sumatra-mandheling",
    name: "SUMATRA_MANDHELING",
    origin: "NORTH_SUMATRA",
    notes: "DARK_CHOCOLATE, CEDAR, EARTH",
    roast: "DARK",
    price: 26,
    icon: 2,
  },
  {
    id: "kenya-aa",
    name: "KENYA_AA_RESERVE",
    origin: "NYERI_COUNTY",
    notes: "BLACKCURRANT, TOMATO, BROWN_SUGAR",
    roast: "MED_LIGHT",
    price: 28,
    icon: 3,
  },
];

export default function Home() {
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBootSequence(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product: typeof products[0]) => {
    setCartItemIds((prev) => [...prev, product.id]);
  };

  const removeFromCart = (productId: string) => {
    setCartItemIds((prev) => prev.filter((id) => id !== productId));
    setRemovedItems((prev) => [...prev, productId]);
  };

  const checkout = () => {
    setIsCheckingOut(true);

    let total = 0;
    for (const id of cartItemIds) {
      const item = products.find((p) => p.id === id);
      total += item!.price;
    }

    // BUG: Show "savings" from removed items
    if (removedItems.length > 0) {
      const savedItem = products.find(p => p.id === removedItems[0] + "-savings");
      const savedAmount = savedItem!.price;
      console.log(`You saved $${savedAmount} by removing items`);
    }

    setTimeout(() => {
      setIsCheckingOut(false);
      alert(`ORDER CONFIRMED. TOTAL: $${total} USD`);
    }, 1000);
  };

  const cartItems = cartItemIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item?.price || 0), 0);
  const itemCounts = cartItemIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueCartItems = [...new Set(cartItemIds)].map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;

  if (bootSequence) {
    return (
      <div style={styles.container}>
        <div style={styles.scanlines} />
        <div style={styles.crtOverlay} />
        <div style={styles.bootScreen}>
          <pre style={styles.bootText}>
{`COFFEED.SYS v2.4.1
(C) 1987 BEAN MACHINE CORP.

INITIALIZING MEMORY............ OK
LOADING FLAVOR PROFILES........ OK
CONNECTING TO ROASTER.......... OK
CALIBRATING GRINDER............ OK

SYSTEM READY.

`}
            <span style={{ opacity: cursorVisible ? 1 : 0 }}>█</span>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* CRT Effects */}
      <div style={styles.scanlines} />
      <div style={styles.crtOverlay} />
      <div style={styles.flicker} />

      {/* Terminal Window */}
      <div style={styles.terminal}>
        {/* Title Bar */}
        <div style={styles.titleBar}>
          <span>■ COFFEED.SYS - REMOTE ORDERING TERMINAL</span>
          <span style={styles.titleBarRight}>[$USER@roastery]</span>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          {/* Header */}
          <pre style={styles.asciiHeader}>
{`╔═══════════════════════════════════════════════════════════════════════════════╗
║  ██████╗ ██████╗ ███████╗███████╗███████╗███████╗██████╗    ███████╗██╗   ██╗ ║
║ ██╔════╝██╔═══██╗██╔════╝██╔════╝██╔════╝██╔════╝██╔══██╗   ██╔════╝╚██╗ ██╔╝ ║
║ ██║     ██║   ██║█████╗  █████╗  █████╗  █████╗  ██║  ██║   ███████╗ ╚████╔╝  ║
║ ██║     ██║   ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║   ╚════██║  ╚██╔╝   ║
║ ╚██████╗╚██████╔╝██║     ██║     ███████╗███████╗██████╔╝██╗███████║   ██║    ║
║  ╚═════╝ ╚═════╝ ╚═╝     ╚═╝     ╚══════╝╚══════╝╚═════╝ ╚═╝╚══════╝   ╚═╝    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  SPECIALTY COFFEE ORDERING SYSTEM          [AUTHORIZED PERSONNEL ONLY]        ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}
          </pre>

          {/* Two Column Layout */}
          <div style={styles.columns}>
            {/* Products Section */}
            <div style={styles.productsSection}>
              <div style={styles.sectionHeader}>
                {'>'} SELECT PRODUCT FROM DATABASE:
              </div>
              <pre style={styles.tableHeader}>
{`┌──────┬────────────────────────┬────────────┬───────────┬─────────┐
│ ICON │ PRODUCT_NAME           │ ORIGIN     │ ROAST_LVL │ PRICE   │
├──────┼────────────────────────┼────────────┼───────────┼─────────┤`}
              </pre>

              {products.map((product, index) => {
                const IconComponent = pixelIcons[product.icon];
                return (
                  <div key={product.id} style={styles.productRow}>
                    <div style={styles.productIconCell}>
                      <IconComponent />
                    </div>
                    <div style={styles.productInfo}>
                      <div style={styles.productName}>{product.name}</div>
                      <div style={styles.productMeta}>
                        <span style={styles.dim}>ORIGIN:</span> {product.origin}
                      </div>
                      <div style={styles.productMeta}>
                        <span style={styles.dim}>NOTES:</span> {product.notes}
                      </div>
                    </div>
                    <div style={styles.productRoast}>{product.roast}</div>
                    <div style={styles.productPrice}>${product.price}.00</div>
                    <button
                      onClick={() => addToCart(product)}
                      style={styles.addButton}
                    >
                      [ADD]
                    </button>
                  </div>
                );
              })}

              <pre style={styles.tableFooter}>
{`└──────┴────────────────────────┴────────────┴───────────┴─────────┘`}
              </pre>

              <div style={styles.statusLine}>
                <span style={styles.dim}>STATUS:</span>{' '}
                <span style={styles.success}>■</span> CONNECTED TO ROASTER{' '}
                <span style={styles.dim}>|</span>{' '}
                <span style={styles.warning}>■</span> {products.length} PRODUCTS LOADED{' '}
                <span style={styles.dim}>|</span>{' '}
                UPTIME: 847:23:41
              </div>
            </div>

            {/* Cart Section */}
            <div style={styles.cartSection}>
              <div style={styles.sectionHeader}>
                {'>'} ORDER_BUFFER [{cartItemIds.length} ITEMS]:
              </div>

              <div style={styles.cartBox}>
                {uniqueCartItems.length === 0 ? (
                  <div style={styles.emptyCart}>
                    <pre>
{`  ┌─────────────────────┐
  │                     │
  │   BUFFER EMPTY      │
  │                     │
  │   ADD ITEMS TO      │
  │   BEGIN ORDER       │
  │                     │
  └─────────────────────┘`}
                    </pre>
                  </div>
                ) : (
                  <>
                    {uniqueCartItems.map((item) => (
                      <div key={item.id} style={styles.cartItem}>
                        <div style={styles.cartItemIcon}>
                          {(() => {
                            const IconComponent = pixelIcons[item.icon];
                            return <IconComponent />;
                          })()}
                        </div>
                        <div style={styles.cartItemInfo}>
                          <div>{item.name}</div>
                          <div style={styles.dim}>
                            QTY: {itemCounts[item.id]} × ${item.price}.00
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={styles.removeButton}
                        >
                          [DEL]
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {uniqueCartItems.length > 0 && (
                <>
                  <pre style={styles.cartTotal}>
{`═══════════════════════════════
 SUBTOTAL:           $${cartTotal.toString().padStart(6, ' ')}.00
 TAX (0%):           $     0.00
───────────────────────────────
 TOTAL:              $${cartTotal.toString().padStart(6, ' ')}.00
═══════════════════════════════`}
                  </pre>

                  <button
                    onClick={checkout}
                    disabled={isCheckingOut}
                    style={{
                      ...styles.checkoutButton,
                      opacity: isCheckingOut ? 0.5 : 1,
                    }}
                  >
                    {isCheckingOut ? (
                      '[ PROCESSING... ]'
                    ) : (
                      <>{'>'} EXECUTE ORDER{cursorVisible ? '█' : ' '}</>
                    )}
                  </button>
                </>
              )}

              <div style={styles.systemLog}>
                <div style={styles.sectionHeader}>{'>'} SYSTEM_LOG:</div>
                <div style={styles.logEntry}>
                  <span style={styles.dim}>[{new Date().toLocaleTimeString()}]</span>{' '}
                  Terminal session active
                </div>
                {cartItemIds.length > 0 && (
                  <div style={styles.logEntry}>
                    <span style={styles.dim}>[{new Date().toLocaleTimeString()}]</span>{' '}
                    <span style={styles.success}>+</span> Items added to buffer
                  </div>
                )}
                {removedItems.length > 0 && (
                  <div style={styles.logEntry}>
                    <span style={styles.dim}>[{new Date().toLocaleTimeString()}]</span>{' '}
                    <span style={styles.error}>-</span> Items removed from buffer
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <span>COFFEED.SYS v2.4.1</span>
            <span style={styles.dim}>|</span>
            <span>BEAN MACHINE CORP © 1987</span>
            <span style={styles.dim}>|</span>
            <span>MEM: 640K</span>
            <span style={styles.dim}>|</span>
            <span>BAUD: 9600</span>
            <span style={styles.dim}>|</span>
            <span style={styles.blink}>● ONLINE</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

        * {
          box-sizing: border-box;
        }

        @keyframes flicker {
          0% { opacity: 0.97; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }

        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes textShadowPulse {
          0%, 100% {
            text-shadow: 0 0 10px #ffb000, 0 0 20px #ffb00066, 0 0 30px #ffb00033;
          }
          50% {
            text-shadow: 0 0 15px #ffb000, 0 0 25px #ffb00088, 0 0 40px #ffb00044;
          }
        }

        ::selection {
          background: #ffb000;
          color: #0a0a08;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0a0a08',
    fontFamily: "'VT323', monospace",
    fontSize: '18px',
    color: '#ffb000',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  scanlines: {
    position: 'fixed',
    inset: 0,
    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
    pointerEvents: 'none',
    zIndex: 100,
  },
  crtOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.6) 100%)',
    pointerEvents: 'none',
    zIndex: 99,
  },
  flicker: {
    position: 'fixed',
    inset: 0,
    background: 'transparent',
    pointerEvents: 'none',
    zIndex: 98,
    animation: 'flicker 0.15s infinite',
  },
  bootScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 40px)',
  },
  bootText: {
    fontSize: '20px',
    lineHeight: 1.6,
    textShadow: '0 0 10px #ffb000, 0 0 20px #ffb00066',
    animation: 'textShadowPulse 2s ease-in-out infinite',
  },
  terminal: {
    maxWidth: '1400px',
    margin: '0 auto',
    border: '2px solid #ffb000',
    boxShadow: '0 0 20px #ffb00044, inset 0 0 60px #ffb00011',
    background: '#0d0d0a',
  },
  titleBar: {
    background: '#ffb000',
    color: '#0a0a08',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  titleBarRight: {
    opacity: 0.7,
  },
  content: {
    padding: '20px',
  },
  asciiHeader: {
    fontSize: '12px',
    lineHeight: 1.2,
    textAlign: 'center',
    margin: '0 0 20px 0',
    textShadow: '0 0 10px #ffb000, 0 0 20px #ffb00044',
    overflow: 'hidden',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '30px',
  },
  productsSection: {},
  sectionHeader: {
    fontSize: '20px',
    marginBottom: '12px',
    textShadow: '0 0 10px #ffb000',
  },
  tableHeader: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.7,
  },
  tableFooter: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.7,
  },
  productRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 8px',
    borderLeft: '1px solid #ffb00044',
    borderRight: '1px solid #ffb00044',
    transition: 'background 0.1s',
    cursor: 'default',
  },
  productIconCell: {
    width: '50px',
    display: 'flex',
    justifyContent: 'center',
    filter: 'drop-shadow(0 0 8px #ffb000)',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: '20px',
    textShadow: '0 0 8px #ffb00088',
  },
  productMeta: {
    fontSize: '14px',
    opacity: 0.8,
  },
  productRoast: {
    width: '80px',
    textAlign: 'center',
    fontSize: '14px',
  },
  productPrice: {
    width: '80px',
    textAlign: 'right',
    fontSize: '20px',
    textShadow: '0 0 8px #ffb00088',
  },
  addButton: {
    background: 'transparent',
    border: '1px solid #ffb000',
    color: '#ffb000',
    padding: '8px 16px',
    fontFamily: "'VT323', monospace",
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.1s',
    textShadow: '0 0 8px #ffb00088',
  },
  dim: {
    opacity: 0.5,
  },
  success: {
    color: '#00ff00',
    textShadow: '0 0 8px #00ff00',
  },
  warning: {
    color: '#ffb000',
  },
  error: {
    color: '#ff4444',
    textShadow: '0 0 8px #ff4444',
  },
  statusLine: {
    marginTop: '16px',
    fontSize: '14px',
    padding: '8px',
    borderTop: '1px dashed #ffb00044',
  },
  cartSection: {},
  cartBox: {
    border: '1px solid #ffb00066',
    minHeight: '200px',
    marginBottom: '16px',
    background: '#0a0a0899',
  },
  emptyCart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    opacity: 0.5,
    fontSize: '14px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px dashed #ffb00033',
  },
  cartItemIcon: {
    filter: 'drop-shadow(0 0 6px #ffb000)',
  },
  cartItemInfo: {
    flex: 1,
    fontSize: '16px',
  },
  removeButton: {
    background: 'transparent',
    border: '1px solid #ff4444',
    color: '#ff4444',
    padding: '4px 12px',
    fontFamily: "'VT323', monospace",
    fontSize: '16px',
    cursor: 'pointer',
    textShadow: '0 0 8px #ff444488',
  },
  cartTotal: {
    fontSize: '16px',
    margin: '0 0 16px 0',
    lineHeight: 1.4,
  },
  checkoutButton: {
    width: '100%',
    background: '#ffb000',
    border: 'none',
    color: '#0a0a08',
    padding: '16px',
    fontFamily: "'VT323', monospace",
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.1s',
    boxShadow: '0 0 20px #ffb00066',
  },
  systemLog: {
    marginTop: '20px',
    padding: '12px',
    background: '#00000066',
    border: '1px solid #ffb00033',
    fontSize: '14px',
  },
  logEntry: {
    marginTop: '4px',
    opacity: 0.8,
  },
  footer: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #ffb00044',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    fontSize: '14px',
    opacity: 0.7,
  },
  blink: {
    animation: 'blink 1s infinite',
    color: '#00ff00',
  },
};
