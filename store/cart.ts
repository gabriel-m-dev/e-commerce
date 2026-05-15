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
}

export type CartItem = {
  product: CartProduct
  size?: string
  quantity: number
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: CartProduct, quantity?: number, size?: string) => void
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string) => void
  updateSize: (productId: string, oldSize: string | undefined, newSize: string) => void
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

      addItem: (product, quantity = 1, size) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.size === size
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.size === size
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, size, quantity }] }
        })
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        }))
      },

      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      updateSize: (productId, oldSize, newSize) => {
        set((state) => {
          const item = state.items.find(
            (i) => i.product.id === productId && (i.size ?? '') === (oldSize ?? '')
          )
          if (!item) return state
          const conflict = state.items.find(
            (i) => i.product.id === productId && i.size === newSize
          )
          if (conflict) {
            return {
              items: state.items
                .filter((i) => !(i.product.id === productId && (i.size ?? '') === (oldSize ?? '')))
                .map((i) =>
                  i.product.id === productId && i.size === newSize
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
            }
          }
          return {
            items: state.items.map((i) =>
              i.product.id === productId && (i.size ?? '') === (oldSize ?? '')
                ? { ...i, size: newSize }
                : i
            ),
          }
        })
      },

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
