export interface Headline {
  title: string
  description: string | null
  link: string
  image_url: string | null
  pubDate: string
  content: string | null
  creator: string[] | null
  source_id: string
  source_name: string
  category: string[]
  country: string[]
  language: string
  slug: string
  comments?: Comment[]
}

export interface Comment {
  id: string
  text: string
  user: CommentUser
  publishedAt: number
  likes: number
}

export interface CommentUser {
  email: string
  avatar: string
  username: string
}

export interface User {
  email: string
  avatar: string
}

export interface UserData {
  jwt: string | null
  expiresIn: string | number | null
  user: string | null
  avatar: string | null
}

export interface AuthResponse {
  idToken: string
  expiresIn: string
  email: string
  refreshToken: string
  localId: string
}

export interface AuthPayload {
  action: 'login' | 'register'
  email: string
  password: string
  returnSecureToken: boolean
}

export interface NewsCategory {
  name: string
  path: string
  icon: string
}

export interface Country {
  code: string
  name: string
  language: string
}

export interface NewsDataApiResponse {
  status: string
  totalResults: number
  results: NewsDataArticle[]
  nextPage: string | null
}

export interface NewsDataArticle {
  title: string
  description: string | null
  link: string
  image_url: string | null
  pubDate: string
  content: string | null
  creator: string[] | null
  source_id: string
  source_name: string
  category: string[]
  country: string[]
  language: string
}

export interface FetchError {
  statusCode?: number
  message?: string
  data?: unknown
}
