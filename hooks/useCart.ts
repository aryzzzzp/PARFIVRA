'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => boolean
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>()(persist((set, get) => ({
  items: [],
  addItem: (product) => {
    if (product.stock <= 0) return false
    const existing = get().items.find((item) => item.product.id === product.id)
    if (existing && existing.quantity >= product.stock) return false
    set({ items: existing ? get().items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1, product } : item) : [...get().items, { id: crypto.randomUUID(), product, quantity: 1 }] })
    return true
  },
  removeItem: (productId) => set({ items: get().items.filter((item) => item.product.id !== productId) }),
  updateQuantity: (productId, qty) => {
    if (qty <= 0) return get().removeItem(productId)
    const item = get().items.find((cartItem) => cartItem.product.id === productId)
    if (!item || item.product.stock <= 0) return get().removeItem(productId)
    set({ items: get().items.map((cartItem) => cartItem.product.id === productId ? { ...cartItem, quantity: Math.min(qty, item.product.stock) } : cartItem) })
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}), { name: 'ParFivra-cart' }))

