import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartProduct = {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  stock: number
  colors?: string[]
  supplier?: string
}

export type CartItem = {
  product: CartProduct
  size?: string
  color?: string
  quantity: number
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: CartProduct, quantity?: number, size?: string, color?: string) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
  updateSize: (productId: string, oldSize: string | undefined, newSize: string, color?: string) => void
  updateColor: (productId: string, oldColor: string | undefined, newColor: string, size?: string) => void
  clearCart: () => void
  getItemCount: () => number
  getTotal: () => number
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, quantity = 1, size, color) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.size === size && i.color === color
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.size === size && i.color === color
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, size, color, quantity }] }
        })
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.size === size && i.color === color)
          ),
        }))
      },

      updateQuantity: (productId, quantity, size, color) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      updateSize: (productId, oldSize, newSize, color) => {
        set((state) => {
          const item = state.items.find(
            (i) =>
              i.product.id === productId &&
              (i.size ?? '') === (oldSize ?? '') &&
              i.color === color
          )
          if (!item) return state
          const conflict = state.items.find(
            (i) =>
              i.product.id === productId && i.size === newSize && i.color === color
          )
          if (conflict) {
            return {
              items: state.items
                .filter(
                  (i) =>
                    !(
                      i.product.id === productId &&
                      (i.size ?? '') === (oldSize ?? '') &&
                      i.color === color
                    )
                )
                .map((i) =>
                  i.product.id === productId && i.size === newSize && i.color === color
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
            }
          }
          return {
            items: state.items.map((i) =>
              i.product.id === productId &&
              (i.size ?? '') === (oldSize ?? '') &&
              i.color === color
                ? { ...i, size: newSize }
                : i
            ),
          }
        })
      },

      updateColor: (productId, oldColor, newColor, size) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.color === oldColor && i.size === size
              ? { ...i, color: newColor }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'luxe-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export default useCartStore
