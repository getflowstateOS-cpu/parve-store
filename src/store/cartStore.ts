"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addToCart, createCart } from "@/lib/shopify";

export interface CartItem {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  addItemWithShopify: (item: CartItem) => Promise<void>;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCartId: (id: string) => void;
  setCheckoutUrl: (url: string) => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      addItemWithShopify: async (item) => {
        const isShopifyVariant = item.variantId.startsWith("gid://shopify");

        get().addItem(item);

        if (!isShopifyVariant) {
          set({ isOpen: true });
          return;
        }

        try {
          let { cartId } = get();

          if (!cartId) {
            const cart = await createCart(item.variantId, item.quantity);
            if (cart) {
              set({
                cartId: cart.id,
                checkoutUrl: cart.checkoutUrl,
                isOpen: true,
              });
            }
            return;
          }

          const cart = await addToCart(cartId, item.variantId, item.quantity);
          if (cart) {
            set({ checkoutUrl: cart.checkoutUrl, isOpen: true });
          }
        } catch (error) {
          console.error("Shopify cart sync failed:", error);
          set({ isOpen: true });
        }
      },

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQty: (variantId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity: qty } : i
                ),
        })),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCartId: (id) => set({ cartId: id }),
      setCheckoutUrl: (url) => set({ checkoutUrl: url }),

      total: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "parve-cart" }
  )
);
