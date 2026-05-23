import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createCart, addToCart } from "@/lib/shopify";

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartState {
  cartId: string | null;
  checkoutUrl: string | null;
  items: CartItem[];
  isOpen: boolean;
  total: number;
  toggleCart: () => void;
  openCart: () => void;
  addItem: (
    variantId: string,
    title: string,
    price: string,
    image: string
  ) => Promise<void>;
  removeItem: (id: string) => void;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      checkoutUrl: null,
      items: [],
      isOpen: false,
      total: 0,
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      getCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      addItem: async (variantId, title, price, image) => {
        let { cartId } = get();
        if (!cartId) {
          const cart = await createCart();
          if (!cart) return;
          cartId = cart.id;
          set({ cartId, checkoutUrl: cart.checkoutUrl });
        }
        try {
          const cart = await addToCart(cartId!, variantId, 1);
          if (cart) set({ checkoutUrl: cart.checkoutUrl });
        } catch {
          /* demo variants may fail Shopify API — keep local cart */
        }
        set((s) => {
          const existing = s.items.find((i) => i.variantId === variantId);
          const items = existing
            ? s.items.map((i) =>
                i.variantId === variantId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            : [
                ...s.items,
                {
                  id: Date.now().toString(),
                  variantId,
                  title,
                  price,
                  image,
                  quantity: 1,
                },
              ];
          const total = items.reduce(
            (sum, i) => sum + parseFloat(i.price) * i.quantity,
            0
          );
          return { items, total, isOpen: true };
        });
      },
      removeItem: (id) =>
        set((s) => {
          const items = s.items.filter((i) => i.id !== id);
          const total = items.reduce(
            (sum, i) => sum + parseFloat(i.price) * i.quantity,
            0
          );
          return { items, total };
        }),
    }),
    { name: "parve-cart" }
  )
);
