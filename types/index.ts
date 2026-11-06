export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  img?: string
  category: string
  stock: number
  is_featured: boolean
  accord: string
  size_ml: number
  created_at: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

export interface Order {
  id: string
  user_id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  customer_address: string
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: 'customer' | 'admin'
  created_at: string
}
