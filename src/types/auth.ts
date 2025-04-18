export type User = {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export type AuthState = {
  user: User | null
  isLoading: boolean
  error: string | null
}

export type SignUpCredentials = {
  email: string
  password: string
  name?: string
}

export type SignInCredentials = {
  email: string
  password: string
} 