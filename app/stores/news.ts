import slugify from 'limax'
import md5 from 'md5'
import { defineStore } from 'pinia'
import defaultImage from '~/assets/default-image.jpeg'
import type {
  AuthPayload,
  Comment,
  FetchError,
  Headline,
  NewsDataApiResponse,
  NewsDataArticle,
  User,
} from '~/types'
import { clearUserData, saveUserData } from '~/utils'

interface NewsState {
  headlines: Headline[]
  headline: Headline | null
  feed: Headline[]
  loading: boolean
  token: string
  user: User | null
  category: string
  country: string
  source: string
  nextPage: string | null
  currentApiUrl: string
}

export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    headlines: [],
    headline: null,
    feed: [],
    loading: false,
    token: '',
    user: null,
    category: '',
    country: 'jp',
    source: '',
    nextPage: null,
    currentApiUrl: '',
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    hasMore: (state): boolean => !!state.nextPage,
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setToken(token: string) {
      this.token = token
    },

    setUser(user: User | null) {
      this.user = user
    },

    setCategory(category: string) {
      this.category = category
    },

    setCountry(country: string) {
      this.country = country
    },

    setSource(source: string) {
      this.source = source
    },

    setFeed(headlines: Headline[]) {
      this.feed = headlines
    },

    setHeadline(headline: Headline | null) {
      this.headline = headline
    },

    clearToken() {
      this.token = ''
    },

    clearUser() {
      this.user = null
    },

    clearFeed() {
      this.feed = []
    },

    async loadHeadlines(apiUrl: string) {
      this.loading = true
      this.currentApiUrl = apiUrl

      try {
        const response = await $fetch<NewsDataApiResponse>(apiUrl)

        if (response.status === 'success' && response.results) {
          const headlines: Headline[] = response.results.map(
            (article: NewsDataArticle) => {
              const slug = slugify(article.title || 'untitled', {
                replacement: '-',
              })
              return {
                ...article,
                image_url: article.image_url || defaultImage,
                slug,
              }
            },
          )

          this.headlines = headlines
          this.nextPage = response.nextPage || null
        } else {
          this.headlines = []
          this.nextPage = null
        }
      } catch (error) {
        console.error('Failed to load headlines:', error)
        this.headlines = []
        this.nextPage = null
      } finally {
        this.loading = false
      }
    },

    async loadMoreHeadlines() {
      if (!this.nextPage || this.loading) return

      this.loading = true

      try {
        const url = `${this.currentApiUrl}&page=${this.nextPage}`
        const response = await $fetch<NewsDataApiResponse>(url)

        if (response.status === 'success' && response.results) {
          const newHeadlines: Headline[] = response.results.map(
            (article: NewsDataArticle) => {
              const slug = slugify(article.title || 'untitled', {
                replacement: '-',
              })
              return {
                ...article,
                image_url: article.image_url || defaultImage,
                slug,
              }
            },
          )

          this.headlines = [...this.headlines, ...newHeadlines]
          this.nextPage = response.nextPage || null
        }
      } catch (error) {
        console.error('Failed to load more headlines:', error)
      } finally {
        this.loading = false
      }
    },

    async addHeadlineToFeed(headline: Headline) {
      if (!this.user) return

      const { getDb, collection, doc, setDoc } = useFirebase()
      const db = getDb()
      const feedRef = doc(
        collection(db, `users/${this.user.email}/feed`),
        headline.title,
      )
      await setDoc(feedRef, headline)
    },

    async loadUserFeed() {
      if (!this.user) return

      const { getDb, collection, onSnapshot } = useFirebase()
      const db = getDb()
      const feedRef = collection(db, `users/${this.user.email}/feed`)

      onSnapshot(feedRef, (querySnapshot) => {
        const headlines: Headline[] = []
        querySnapshot.forEach((doc) => {
          headlines.push(doc.data() as Headline)
        })
        this.feed = headlines
      })
    },

    async loadHeadline(headlineSlug: string) {
      const { getDb, collection, doc, getDoc, getDocs, query, orderBy } =
        useFirebase()
      const db = getDb()
      const headlineRef = doc(db, 'headlines', headlineSlug)
      const commentsRef = query(
        collection(db, `headlines/${headlineSlug}/comments`),
        orderBy('likes', 'desc'),
      )

      const headlineDoc = await getDoc(headlineRef)
      if (headlineDoc.exists()) {
        const loadedHeadline = headlineDoc.data() as Headline
        const commentsSnapshot = await getDocs(commentsRef)
        const comments: Comment[] = []
        commentsSnapshot.forEach((doc) => {
          comments.push(doc.data() as Comment)
        })
        loadedHeadline.comments = comments
        this.headline = loadedHeadline
      }
    },

    async sendComment(comment: Comment) {
      if (!this.headline) return

      const { getDb, collection, doc, setDoc, getDocs, query, orderBy } =
        useFirebase()
      const db = getDb()
      const commentsRef = collection(
        db,
        `headlines/${this.headline.slug}/comments`,
      )

      this.loading = true
      await setDoc(doc(commentsRef, comment.id), comment)

      const commentsQuery = query(commentsRef, orderBy('likes', 'desc'))
      const querySnapshot = await getDocs(commentsQuery)
      const comments: Comment[] = []
      querySnapshot.forEach((doc) => {
        comments.push(doc.data() as Comment)
      })
      this.headline = { ...this.headline, comments }
      this.loading = false
    },

    async likeComment(commentId: string) {
      if (!this.headline) return

      const {
        getDb,
        collection,
        doc,
        updateDoc,
        increment,
        query,
        orderBy,
        onSnapshot,
      } = useFirebase()
      const db = getDb()
      const likedCommentRef = doc(
        db,
        `headlines/${this.headline.slug}/comments`,
        commentId,
      )

      await updateDoc(likedCommentRef, {
        likes: increment(1),
      })

      const commentsRef = query(
        collection(db, `headlines/${this.headline.slug}/comments`),
        orderBy('likes', 'desc'),
      )

      onSnapshot(commentsRef, (querySnapshot) => {
        const comments: Comment[] = []
        querySnapshot.forEach((doc) => {
          comments.push(doc.data() as Comment)
        })
        if (this.headline) {
          this.headline = { ...this.headline, comments }
        }
      })
    },

    async saveHeadline(headline: Headline) {
      const { getDb, doc, getDoc, setDoc } = useFirebase()
      const db = getDb()
      const headlineRef = doc(db, 'headlines', headline.slug)

      const headlineDoc = await getDoc(headlineRef)
      if (!headlineDoc.exists()) {
        await setDoc(headlineRef, headline)
      }
    },

    async removeHeadlineFromFeed(headline: Headline) {
      if (!this.user) return

      const { getDb, collection, doc, deleteDoc } = useFirebase()
      const db = getDb()
      const headlineRef = doc(
        collection(db, `users/${this.user.email}/feed`),
        headline.title,
      )
      await deleteDoc(headlineRef)
    },

    async authenticateUser(payload: AuthPayload) {
      this.loading = true

      try {
        const { loginWithEmail, registerWithEmail, getDb, collection, doc, setDoc, getDoc } = useFirebase()

        let userCredential
        let user: User

        if (payload.action === 'register') {
          userCredential = await registerWithEmail(payload.email, payload.password)
          const avatar = `https://gravatar.com/avatar/${md5(userCredential.user.email!)}?d=identicon`
          user = { email: userCredential.user.email!, avatar }

          const db = getDb()
          await setDoc(doc(collection(db, 'users'), payload.email), user)
        } else {
          userCredential = await loginWithEmail(payload.email, payload.password)
          const db = getDb()
          const loginRef = doc(db, 'users', payload.email)
          const loggedInUser = await getDoc(loginRef)

          if (loggedInUser.exists()) {
            user = loggedInUser.data() as User
          } else {
            // User document doesn't exist, create one
            const avatar = `https://gravatar.com/avatar/${md5(userCredential.user.email!)}?d=identicon`
            user = { email: userCredential.user.email!, avatar }
            await setDoc(doc(collection(db, 'users'), payload.email), user)
          }
        }

        const idToken = await userCredential.user.getIdToken()

        this.user = user
        this.token = idToken
        saveUserData({ idToken, expiresIn: '3600', email: user.email }, user)
      } catch (error) {
        console.error('Authentication error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setLogoutTimer(interval: number) {
      setTimeout(() => this.logoutUser(), interval)
    },

    async logoutUser() {
      const { logout } = useFirebase()
      try {
        await logout()
      } catch (error) {
        console.error('Logout error:', error)
      }
      this.clearToken()
      this.clearUser()
      this.clearFeed()
      clearUserData()
    },
  },
})
