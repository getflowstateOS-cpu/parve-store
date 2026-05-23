"use client";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

export default function SlidingCart() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQty,
    checkoutUrl,
    total,
    count,
  } = useCartStore();

  return (
    <>
      <div
        onClick={closeCart}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          background: "rgba(26,26,26,0.6)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.4s",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "min(400px, 100vw)",
          height: "100%",
          zIndex: 151,
          background: "#FAF8F5",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition:
            "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
          display: "flex",
          flexDirection: "column",
          borderLeft: "0.5px solid rgba(201,169,110,0.2)",
        }}
      >
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "0.5px solid rgba(201,169,110,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 20,
                fontWeight: 300,
                letterSpacing: "0.1em",
              }}
            >
              Your Bag
            </p>
            <p
              style={{
                fontFamily: "Jost, sans-serif",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "#C9A96E",
                marginTop: 2,
              }}
            >
              {count()} {count() === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <button
            onClick={closeCart}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              color: "#6B6B6B",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: 22,
                  fontWeight: 300,
                  color: "#6B6B6B",
                  marginBottom: 8,
                }}
              >
                Your bag is empty
              </p>
              <p
                style={{
                  fontFamily: "Jost, sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  color: "#C9A96E",
                }}
              >
                Discover the collection
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 24,
                  paddingBottom: 24,
                  borderBottom: "0.5px solid rgba(201,169,110,0.15)",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 100,
                    background: "#F0EBE0",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productTitle}
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: 28,
                        color: "#C9A96E",
                        opacity: 0.5,
                      }}
                    >
                      P
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: 15,
                      fontWeight: 400,
                      marginBottom: 4,
                    }}
                  >
                    {item.productTitle}
                  </p>
                  <p
                    style={{
                      fontFamily: "Jost, sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      color: "#C9A96E",
                      marginBottom: 12,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.variantTitle}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <button
                        onClick={() =>
                          updateQty(item.variantId, item.quantity - 1)
                        }
                        style={{
                          width: 24,
                          height: 24,
                          border: "0.5px solid #1A1A1A",
                          background: "none",
                          fontFamily: "Jost, sans-serif",
                          fontSize: 14,
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontFamily: "Jost, sans-serif",
                          fontSize: 12,
                          minWidth: 16,
                          textAlign: "center",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQty(item.variantId, item.quantity + 1)
                        }
                        style={{
                          width: 24,
                          height: 24,
                          border: "0.5px solid #1A1A1A",
                          background: "none",
                          fontFamily: "Jost, sans-serif",
                          fontSize: 14,
                        }}
                      >
                        +
                      </button>
                    </div>
                    <p
                      style={{
                        fontFamily: "Jost, sans-serif",
                        fontSize: 13,
                        color: "#1A1A1A",
                      }}
                    >
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    style={{
                      marginTop: 10,
                      background: "none",
                      border: "none",
                      fontFamily: "Jost, sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#6B6B6B",
                      textDecoration: "underline",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div
            style={{
              padding: "20px 24px 32px",
              borderTop: "0.5px solid rgba(201,169,110,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "Jost, sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#6B6B6B",
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: 20,
                  fontWeight: 300,
                }}
              >
                ${total().toFixed(2)}
              </span>
            </div>
            <p
              style={{
                fontFamily: "Jost, sans-serif",
                fontSize: 10,
                color: "#6B6B6B",
                marginBottom: 20,
                letterSpacing: "0.1em",
              }}
            >
              Shipping calculated at checkout
            </p>
            <a
              href={checkoutUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                width: "100%",
                padding: "15px",
                background: "#1A1A1A",
                color: "#FAF8F5",
                textAlign: "center",
                fontFamily: "Jost, sans-serif",
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#C9A96E")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#1A1A1A")
              }
            >
              Proceed to Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
