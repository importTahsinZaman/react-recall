"use client";

import { useState } from "react";

// Pixel art components - Stardew Valley style
const PixelCoffeeCup = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Steam wisps */}
    <rect x="5" y="0" width="1" height="1" fill="#d4a574" />
    <rect x="7" y="1" width="1" height="1" fill="#d4a574" />
    <rect x="9" y="0" width="1" height="1" fill="#d4a574" />
    <rect x="6" y="1" width="1" height="1" fill="#c49464" opacity="0.6" />
    <rect x="8" y="0" width="1" height="1" fill="#c49464" opacity="0.6" />
    {/* Cup body */}
    <rect x="3" y="3" width="8" height="1" fill="#f5deb3" />
    <rect x="2" y="4" width="1" height="7" fill="#e8c9a0" />
    <rect x="11" y="4" width="1" height="7" fill="#d4b896" />
    <rect x="3" y="4" width="8" height="7" fill="#fff8e7" />
    <rect x="3" y="11" width="8" height="1" fill="#e8c9a0" />
    {/* Coffee inside */}
    <rect x="3" y="5" width="8" height="5" fill="#6b4423" />
    <rect x="4" y="5" width="2" height="1" fill="#8b5a2b" />
    {/* Handle */}
    <rect x="12" y="5" width="1" height="1" fill="#e8c9a0" />
    <rect x="13" y="6" width="1" height="3" fill="#f5deb3" />
    <rect x="12" y="9" width="1" height="1" fill="#e8c9a0" />
    {/* Saucer */}
    <rect x="1" y="12" width="12" height="1" fill="#e8c9a0" />
    <rect x="0" y="13" width="14" height="1" fill="#d4b896" />
    <rect x="1" y="14" width="12" height="1" fill="#c9a886" />
  </svg>
);

const PixelCoffeeBag = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Bag body */}
    <rect x="2" y="4" width="12" height="10" fill="#8b5a2b" />
    <rect x="3" y="3" width="10" height="1" fill="#a0522d" />
    <rect x="2" y="4" width="1" height="10" fill="#6b4423" />
    <rect x="13" y="4" width="1" height="10" fill="#5a3a1d" />
    <rect x="2" y="14" width="12" height="1" fill="#5a3a1d" />
    {/* Fold at top */}
    <rect x="4" y="2" width="8" height="1" fill="#a0522d" />
    <rect x="5" y="1" width="6" height="1" fill="#8b5a2b" />
    {/* Label */}
    <rect x="4" y="6" width="8" height="6" fill="#f5deb3" />
    <rect x="5" y="7" width="6" height="4" fill="#fff8e7" />
    {/* Coffee bean on label */}
    <rect x="6" y="8" width="1" height="2" fill="#6b4423" />
    <rect x="7" y="7" width="2" height="1" fill="#6b4423" />
    <rect x="7" y="10" width="2" height="1" fill="#6b4423" />
    <rect x="9" y="8" width="1" height="2" fill="#6b4423" />
    <rect x="7" y="8" width="2" height="2" fill="#8b5a2b" />
  </svg>
);

const PixelLatte = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Tall glass */}
    <rect x="4" y="2" width="8" height="1" fill="#e8e8e8" />
    <rect x="3" y="3" width="1" height="11" fill="#d0d0d0" />
    <rect x="12" y="3" width="1" height="11" fill="#b8b8b8" />
    <rect x="4" y="3" width="8" height="11" fill="#f0f0f0" />
    <rect x="4" y="14" width="8" height="1" fill="#d0d0d0" />
    {/* Coffee gradient layers */}
    <rect x="4" y="11" width="8" height="3" fill="#6b4423" />
    <rect x="4" y="8" width="8" height="3" fill="#c49464" />
    <rect x="4" y="5" width="8" height="3" fill="#f5deb3" />
    <rect x="4" y="3" width="8" height="2" fill="#fff8e7" />
    {/* Foam art - heart */}
    <rect x="6" y="3" width="1" height="1" fill="#d4a574" />
    <rect x="9" y="3" width="1" height="1" fill="#d4a574" />
    <rect x="7" y="4" width="2" height="1" fill="#d4a574" />
    {/* Straw */}
    <rect x="10" y="0" width="1" height="5" fill="#e74c3c" />
    <rect x="10" y="0" width="1" height="1" fill="#c0392b" />
  </svg>
);

const PixelEspresso = () => (
  <svg width="48" height="48" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    {/* Steam */}
    <rect x="6" y="2" width="1" height="1" fill="#d4a574" opacity="0.7" />
    <rect x="8" y="1" width="1" height="1" fill="#d4a574" opacity="0.7" />
    <rect x="7" y="3" width="1" height="1" fill="#c49464" opacity="0.5" />
    {/* Small cup */}
    <rect x="4" y="5" width="8" height="1" fill="#fff8e7" />
    <rect x="3" y="6" width="1" height="5" fill="#e8c9a0" />
    <rect x="12" y="6" width="1" height="5" fill="#d4b896" />
    <rect x="4" y="6" width="8" height="5" fill="#fff8e7" />
    <rect x="4" y="11" width="8" height="1" fill="#e8c9a0" />
    {/* Espresso with crema */}
    <rect x="4" y="7" width="8" height="1" fill="#d4a574" />
    <rect x="4" y="8" width="8" height="3" fill="#3d2314" />
    <rect x="5" y="8" width="2" height="1" fill="#4a2c1a" />
    {/* Handle */}
    <rect x="13" y="7" width="1" height="1" fill="#e8c9a0" />
    <rect x="14" y="8" width="1" height="2" fill="#f5deb3" />
    <rect x="13" y="10" width="1" height="1" fill="#e8c9a0" />
    {/* Saucer */}
    <rect x="2" y="12" width="12" height="1" fill="#e8c9a0" />
    <rect x="1" y="13" width="14" height="1" fill="#d4b896" />
    <rect x="2" y="14" width="12" height="1" fill="#c9a886" />
  </svg>
);

const GoldCoin = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
    <rect x="5" y="1" width="6" height="1" fill="#ffd700" />
    <rect x="3" y="2" width="2" height="1" fill="#ffd700" />
    <rect x="11" y="2" width="2" height="1" fill="#daa520" />
    <rect x="2" y="3" width="1" height="2" fill="#ffd700" />
    <rect x="13" y="3" width="1" height="2" fill="#b8860b" />
    <rect x="1" y="5" width="1" height="6" fill="#ffd700" />
    <rect x="14" y="5" width="1" height="6" fill="#b8860b" />
    <rect x="2" y="11" width="1" height="2" fill="#daa520" />
    <rect x="13" y="11" width="1" height="2" fill="#b8860b" />
    <rect x="3" y="13" width="2" height="1" fill="#daa520" />
    <rect x="11" y="13" width="2" height="1" fill="#b8860b" />
    <rect x="5" y="14" width="6" height="1" fill="#b8860b" />
    {/* Inner fill */}
    <rect x="3" y="3" width="10" height="10" fill="#ffc125" />
    <rect x="5" y="2" width="6" height="1" fill="#ffe55c" />
    <rect x="2" y="5" width="1" height="6" fill="#ffe55c" />
    {/* G symbol */}
    <rect x="6" y="5" width="4" height="1" fill="#b8860b" />
    <rect x="5" y="6" width="1" height="4" fill="#b8860b" />
    <rect x="6" y="10" width="4" height="1" fill="#b8860b" />
    <rect x="9" y="8" width="1" height="2" fill="#b8860b" />
    <rect x="7" y="8" width="2" height="1" fill="#b8860b" />
  </svg>
);

const pixelIcons = [PixelCoffeeCup, PixelCoffeeBag, PixelLatte, PixelEspresso];

const products = [
  {
    id: "house-blend",
    name: "House Blend",
    description: "A cozy morning starter",
    price: 24,
    icon: 0,
    season: "All Seasons",
  },
  {
    id: "mountain-roast",
    name: "Mountain Roast",
    description: "Bold & adventurous",
    price: 22,
    icon: 1,
    season: "Winter favorite",
  },
  {
    id: "honey-latte",
    name: "Honey Latte",
    description: "Sweet & creamy",
    price: 26,
    icon: 2,
    season: "Spring special",
  },
  {
    id: "farmers-espresso",
    name: "Farmer's Espresso",
    description: "Strong & energizing",
    price: 28,
    icon: 3,
    season: "Harvest boost",
  },
];

export default function Home() {
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const addToCart = (product: typeof products[0]) => {
    setCartItemIds((prev) => [...prev, product.id]);
    setClickedButton(product.id);
    setTimeout(() => setClickedButton(null), 150);
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
      console.log(`You saved ${savedAmount}g by removing items`);
    }

    setTimeout(() => {
      setIsCheckingOut(false);
      alert(`Purchase complete! Total: ${total}g`);
    }, 1000);
  };

  const cartTotal = cartItemIds.reduce((sum, id) => {
    const item = products.find((p) => p.id === id);
    return sum + (item?.price || 0);
  }, 0);

  const itemCounts = cartItemIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueCartItems = [...new Set(cartItemIds)]
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <div style={styles.container}>
      {/* Decorative elements */}
      <div style={styles.leafTopLeft}>🌿</div>
      <div style={styles.leafTopRight}>🌿</div>
      <div style={styles.flowerBottomLeft}>🌻</div>
      <div style={styles.flowerBottomRight}>🌷</div>

      {/* Main shop window */}
      <div style={styles.shopWindow}>
        {/* Wooden frame top */}
        <div style={styles.frameTop}>
          <div style={styles.frameCorner}>◈</div>
          <div style={styles.shopTitle}>☕ Pelican Town Cafe ☕</div>
          <div style={styles.frameCorner}>◈</div>
        </div>

        {/* Content area */}
        <div style={styles.contentArea}>
          {/* Left side - Shop items */}
          <div style={styles.shopSection}>
            <div style={styles.sectionLabel}>
              <span style={styles.pixelBorder}>~ For Sale ~</span>
            </div>

            <div style={styles.itemGrid}>
              {products.map((product) => {
                const IconComponent = pixelIcons[product.icon];
                const isClicked = clickedButton === product.id;
                return (
                  <div
                    key={product.id}
                    style={{
                      ...styles.itemCard,
                      transform: isClicked ? 'scale(0.95)' : 'scale(1)',
                    }}
                  >
                    <div style={styles.itemIconWrapper}>
                      <IconComponent />
                    </div>
                    <div style={styles.itemName}>{product.name}</div>
                    <div style={styles.itemDesc}>{product.description}</div>
                    <div style={styles.itemSeason}>{product.season}</div>
                    <div style={styles.itemFooter}>
                      <div style={styles.priceTag}>
                        <GoldCoin />
                        <span style={styles.priceAmount}>{product.price}g</span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        style={styles.buyButton}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shop info */}
            <div style={styles.shopInfo}>
              <span>Open 9am - 5pm</span>
              <span style={styles.divider}>◆</span>
              <span>Closed on Wednesdays</span>
            </div>
          </div>

          {/* Right side - Cart/Bag */}
          <div style={styles.cartSection}>
            <div style={styles.sectionLabel}>
              <span style={styles.pixelBorder}>~ Your Bag ~</span>
            </div>

            <div style={styles.cartBag}>
              {uniqueCartItems.length === 0 ? (
                <div style={styles.emptyBag}>
                  <div style={styles.emptyBagIcon}>🎒</div>
                  <div style={styles.emptyBagText}>Your bag is empty!</div>
                  <div style={styles.emptyBagSubtext}>Select items to purchase</div>
                </div>
              ) : (
                <div style={styles.cartItems}>
                  {uniqueCartItems.map((item) => {
                    const IconComponent = pixelIcons[item.icon];
                    return (
                      <div key={item.id} style={styles.cartItem}>
                        <div style={styles.cartItemIcon}>
                          <IconComponent />
                        </div>
                        <div style={styles.cartItemInfo}>
                          <div style={styles.cartItemName}>{item.name}</div>
                          <div style={styles.cartItemQty}>
                            ×{itemCounts[item.id]}
                          </div>
                        </div>
                        <div style={styles.cartItemPrice}>
                          {item.price * itemCounts[item.id]}g
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={styles.removeButton}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Cart total */}
              {uniqueCartItems.length > 0 && (
                <div style={styles.cartFooter}>
                  <div style={styles.totalRow}>
                    <span>Total:</span>
                    <div style={styles.totalAmount}>
                      <GoldCoin />
                      <span style={styles.totalValue}>{cartTotal}g</span>
                    </div>
                  </div>

                  <button
                    onClick={checkout}
                    disabled={isCheckingOut}
                    style={{
                      ...styles.checkoutButton,
                      opacity: isCheckingOut ? 0.7 : 1,
                    }}
                  >
                    {isCheckingOut ? '...' : 'Purchase'}
                  </button>
                </div>
              )}
            </div>

            {/* Player money display */}
            <div style={styles.walletDisplay}>
              <div style={styles.walletLabel}>Your Gold:</div>
              <div style={styles.walletAmount}>
                <GoldCoin />
                <span>1,247g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wooden frame bottom */}
        <div style={styles.frameBottom}>
          <div style={styles.framePattern}>═══════════════════════════════════════════════</div>
        </div>
      </div>

      {/* Dialogue box */}
      <div style={styles.dialogueBox}>
        <div style={styles.dialoguePortrait}>👩‍🌾</div>
        <div style={styles.dialogueContent}>
          <div style={styles.dialogueName}>Cafe Owner</div>
          <div style={styles.dialogueText}>
            "Welcome to my little cafe! Everything's made fresh with ingredients from the valley."
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        * {
          box-sizing: border-box;
          image-rendering: pixelated;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        ::selection {
          background: #8b5a2b;
          color: #fff8e7;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #7CB342 100%)',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '10px',
    color: '#3d2914',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  leafTopLeft: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    fontSize: '40px',
    animation: 'sway 3s ease-in-out infinite',
    opacity: 0.8,
  },
  leafTopRight: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '40px',
    animation: 'sway 3s ease-in-out infinite',
    animationDelay: '0.5s',
    opacity: 0.8,
    transform: 'scaleX(-1)',
  },
  flowerBottomLeft: {
    position: 'absolute',
    bottom: '20px',
    left: '30px',
    fontSize: '32px',
    animation: 'float 4s ease-in-out infinite',
  },
  flowerBottomRight: {
    position: 'absolute',
    bottom: '20px',
    right: '30px',
    fontSize: '32px',
    animation: 'float 4s ease-in-out infinite',
    animationDelay: '1s',
  },
  shopWindow: {
    background: '#f4e4bc',
    border: '8px solid #8b5a2b',
    borderRadius: '4px',
    boxShadow: `
      0 0 0 4px #6b4423,
      0 0 0 8px #5a3a1d,
      8px 8px 0 0 rgba(0,0,0,0.3)
    `,
    maxWidth: '900px',
    width: '100%',
  },
  frameTop: {
    background: 'linear-gradient(180deg, #a0522d 0%, #8b5a2b 100%)',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '4px solid #6b4423',
  },
  frameCorner: {
    color: '#ffd700',
    fontSize: '16px',
    textShadow: '2px 2px 0 #8b5a2b',
  },
  shopTitle: {
    color: '#fff8e7',
    fontSize: '14px',
    textShadow: '2px 2px 0 #5a3a1d',
    letterSpacing: '2px',
  },
  contentArea: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: '20px',
    padding: '20px',
  },
  shopSection: {},
  sectionLabel: {
    marginBottom: '16px',
    textAlign: 'center',
  },
  pixelBorder: {
    background: '#8b5a2b',
    color: '#fff8e7',
    padding: '8px 16px',
    border: '2px solid #6b4423',
    boxShadow: '2px 2px 0 #5a3a1d',
  },
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  itemCard: {
    background: '#fff8e7',
    border: '4px solid #d4b896',
    borderRadius: '4px',
    padding: '12px',
    textAlign: 'center',
    boxShadow: '4px 4px 0 #c9a886',
    transition: 'transform 0.1s',
  },
  itemIconWrapper: {
    background: '#f4e4bc',
    border: '2px solid #d4b896',
    borderRadius: '4px',
    padding: '8px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#5a3a1d',
    marginBottom: '4px',
  },
  itemDesc: {
    fontSize: '8px',
    color: '#8b5a2b',
    marginBottom: '4px',
  },
  itemSeason: {
    fontSize: '7px',
    color: '#5a8f3d',
    marginBottom: '8px',
    fontStyle: 'italic',
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  priceTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  priceAmount: {
    color: '#b8860b',
    fontWeight: 'bold',
  },
  buyButton: {
    background: 'linear-gradient(180deg, #5a8f3d 0%, #4a7f2d 100%)',
    border: '2px solid #3d6b24',
    borderRadius: '2px',
    color: '#fff8e7',
    padding: '6px 12px',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '8px',
    cursor: 'pointer',
    boxShadow: '2px 2px 0 #2d5a1a',
    transition: 'all 0.1s',
  },
  shopInfo: {
    marginTop: '16px',
    textAlign: 'center',
    fontSize: '8px',
    color: '#8b5a2b',
    padding: '8px',
    borderTop: '2px dashed #d4b896',
  },
  divider: {
    margin: '0 8px',
    color: '#d4b896',
  },
  cartSection: {},
  cartBag: {
    background: '#fff8e7',
    border: '4px solid #d4b896',
    borderRadius: '4px',
    minHeight: '280px',
    boxShadow: '4px 4px 0 #c9a886',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyBag: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#a0896b',
  },
  emptyBagIcon: {
    fontSize: '40px',
    marginBottom: '12px',
    animation: 'float 3s ease-in-out infinite',
  },
  emptyBagText: {
    fontSize: '10px',
    marginBottom: '4px',
  },
  emptyBagSubtext: {
    fontSize: '8px',
    opacity: 0.7,
  },
  cartItems: {
    flex: 1,
    padding: '8px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderBottom: '2px dashed #e8d8c0',
  },
  cartItemIcon: {
    flexShrink: 0,
  },
  cartItemInfo: {
    flex: 1,
    minWidth: 0,
  },
  cartItemName: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#5a3a1d',
  },
  cartItemQty: {
    fontSize: '8px',
    color: '#8b5a2b',
  },
  cartItemPrice: {
    fontSize: '9px',
    color: '#b8860b',
    fontWeight: 'bold',
  },
  removeButton: {
    background: '#e74c3c',
    border: '2px solid #c0392b',
    borderRadius: '2px',
    color: 'white',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '8px',
    padding: 0,
  },
  cartFooter: {
    padding: '12px',
    borderTop: '4px solid #d4b896',
    background: '#f4e4bc',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '10px',
  },
  totalAmount: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  totalValue: {
    color: '#b8860b',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  checkoutButton: {
    width: '100%',
    background: 'linear-gradient(180deg, #e8a030 0%, #d4902a 100%)',
    border: '3px solid #b8860b',
    borderRadius: '2px',
    color: '#fff8e7',
    padding: '10px',
    fontFamily: "'Press Start 2P', cursive",
    fontSize: '10px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #8b6508',
    textShadow: '1px 1px 0 #8b6508',
    transition: 'all 0.1s',
  },
  walletDisplay: {
    marginTop: '16px',
    background: '#5a3a1d',
    border: '3px solid #3d2914',
    borderRadius: '4px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '3px 3px 0 #2d1f0d',
  },
  walletLabel: {
    color: '#d4b896',
    fontSize: '8px',
  },
  walletAmount: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ffd700',
    fontSize: '11px',
  },
  frameBottom: {
    background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 100%)',
    padding: '8px 20px',
    borderTop: '4px solid #a0522d',
    textAlign: 'center',
  },
  framePattern: {
    color: '#5a3a1d',
    fontSize: '8px',
    opacity: 0.5,
  },
  dialogueBox: {
    background: '#fff8e7',
    border: '4px solid #8b5a2b',
    borderRadius: '4px',
    padding: '16px',
    maxWidth: '600px',
    width: '100%',
    display: 'flex',
    gap: '16px',
    boxShadow: `
      0 0 0 2px #6b4423,
      4px 4px 0 0 rgba(0,0,0,0.2)
    `,
  },
  dialoguePortrait: {
    width: '64px',
    height: '64px',
    background: '#f4e4bc',
    border: '3px solid #d4b896',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    flexShrink: 0,
  },
  dialogueContent: {
    flex: 1,
  },
  dialogueName: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#5a8f3d',
    marginBottom: '8px',
  },
  dialogueText: {
    fontSize: '9px',
    lineHeight: 1.8,
    color: '#3d2914',
  },
};
