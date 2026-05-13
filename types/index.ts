export type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: Category
  stock: number
  featured: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export type CartItem = {
  product: Product
  quantity: number
}

export type Cart = {
  items: CartItem[]
  total: number
  itemCount: number
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type Order = {
  id: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  shippingAddress: Address
  createdAt: Date
}

export type Address = {
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type User = {
  id: string
  name: string
  email: string
  createdAt: Date
}
