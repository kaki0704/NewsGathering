import slugify from 'limax'
import md5 from 'md5'
import { defineStore } from 'pinia'
import defaultImage from '~/assets/default-image.jpeg'
import type {
  AuthPayload,
  Comment,
  Headline,
  NewsDataApiResponse,
  NewsDataArticle,
  User,
} from '~/types'
import { clearUserData, saveUserData } from '~/utils'

export const useNewsStore = defineStore('news', () => {
  const news = ref({
    headlines: [] as Headline[],
    headline: null as Headline | null,
    feed: [] as Headline[],
    category: '',
    country: 'jp',
    source: '',
    nextPage: null as string | null,
    currentApiUrl: '',
  })

  const auth = ref({
    token: '',
    user: null as User | null,
    loading: false,
  })

  const isAuthenticated = computed(() => !!auth.value.token)
  const hasMore = computed(() => !!news.value.nextPage)

  const headlines = computed(() => news.value.headlines)
  const headline = computed(() => news.value.headline)
  const feed = computed(() => news.value.feed)
  const category = computed(() => news.value.category)
  const country = computed(() => news.value.country)
  const source = computed(() => news.value.source)
  const nextPage = computed(() => news.value.nextPage)
  const currentApiUrl = computed(() => news.value.currentApiUrl)
  const loading = computed(() => auth.value.loading)
  const token = computed(() => auth.value.token)
  const user = computed(() => auth.value.user)

  const setLoading = (value: boolean) => {
    auth.value.loading = value
  }

  const setToken = (value: string) => {
    auth.value.token = value
  }

  const setUser = (value: User | null) => {
    auth.value.user = value
  }

  const setCategory = (value: string) => {
    news.value.category = value
  }

  const setCountry = (value: string) => {
    news.value.country = value
  }

  const setSource = (value: string) => {
    news.value.source = value
  }

  const setFeed = (value: Headline[]) => {
    news.value.feed = value
  }

  const setHeadline = (value: Headline | null) => {
    news.value.headline = value
  }

  const clearToken = () => {
    auth.value.token = ''
  }

  const clearUser = () => {
    auth.value.user = null
  }

  const clearFeed = () => {
    news.value.feed = []
  }

  const loadHeadlines = async (apiUrl: string) => {
    auth.value.loading = true
    news.value.currentApiUrl = apiUrl

    try {
      const response = await $fetch<NewsDataApiResponse>(apiUrl)

      if (response.status === 'success' && response.results) {
        const headlinesData: Headline[] = response.results.map(
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

        news.value.headlines = headlinesData
        news.value.nextPage = response.nextPage || null
      } else {
        news.value.headlines = []
        news.value.nextPage = null
      }
    } catch {
      news.value.headlines = []
      news.value.nextPage = null
    } finally {
      auth.value.loading = false
    }
  }

  const loadMoreHeadlines = async () => {
    if (!news.value.nextPage || auth.value.loading) return

    auth.value.loading = true

    try {
      const url = `${news.value.currentApiUrl}&page=${news.value.nextPage}`
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

        news.value.headlines = [...news.value.headlines, ...newHeadlines]
        news.value.nextPage = response.nextPage || null
      }
    } catch {
    } finally {
      auth.value.loading = false
    }
  }

  const addHeadlineToFeed = async (headlineData: Headline) => {
    if (!auth.value.user) return

    const { getDb, collection, doc, setDoc } = useFirebase()
    const db = getDb()
    const feedRef = doc(
      collection(db, `users/${auth.value.user.email}/feed`),
      headlineData.title,
    )
    await setDoc(feedRef, headlineData)
  }

  const loadUserFeed = async () => {
    if (!auth.value.user) return

    const { getDb, collection, onSnapshot } = useFirebase()
    const db = getDb()
    const feedRef = collection(db, `users/${auth.value.user.email}/feed`)

    onSnapshot(feedRef, (querySnapshot) => {
      const headlinesData: Headline[] = []
      querySnapshot.forEach((doc) => {
        headlinesData.push(doc.data() as Headline)
      })
      news.value.feed = headlinesData
    })
  }

  const loadHeadline = async (headlineSlug: string) => {
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
      news.value.headline = loadedHeadline
    }
  }

  const sendComment = async (comment: Comment) => {
    if (!news.value.headline) return

    const { getDb, collection, doc, setDoc, getDocs, query, orderBy } =
      useFirebase()
    const db = getDb()
    const commentsRef = collection(
      db,
      `headlines/${news.value.headline.slug}/comments`,
    )

    auth.value.loading = true
    await setDoc(doc(commentsRef, comment.id), comment)

    const commentsQuery = query(commentsRef, orderBy('likes', 'desc'))
    const querySnapshot = await getDocs(commentsQuery)
    const comments: Comment[] = []
    querySnapshot.forEach((doc) => {
      comments.push(doc.data() as Comment)
    })
    news.value.headline = { ...news.value.headline, comments }
    auth.value.loading = false
  }

  const likeComment = async (commentId: string) => {
    if (!news.value.headline) return

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
      `headlines/${news.value.headline.slug}/comments`,
      commentId,
    )

    await updateDoc(likedCommentRef, {
      likes: increment(1),
    })

    const commentsRef = query(
      collection(db, `headlines/${news.value.headline.slug}/comments`),
      orderBy('likes', 'desc'),
    )

    onSnapshot(commentsRef, (querySnapshot) => {
      const comments: Comment[] = []
      querySnapshot.forEach((doc) => {
        comments.push(doc.data() as Comment)
      })
      if (news.value.headline) {
        news.value.headline = { ...news.value.headline, comments }
      }
    })
  }

  const saveHeadline = async (headlineData: Headline) => {
    const { getDb, doc, getDoc, setDoc } = useFirebase()
    const db = getDb()
    const headlineRef = doc(db, 'headlines', headlineData.slug)

    const headlineDoc = await getDoc(headlineRef)
    if (!headlineDoc.exists()) {
      await setDoc(headlineRef, headlineData)
    }
  }

  const removeHeadlineFromFeed = async (headlineData: Headline) => {
    if (!auth.value.user) return

    const { getDb, collection, doc, deleteDoc } = useFirebase()
    const db = getDb()
    const headlineRef = doc(
      collection(db, `users/${auth.value.user.email}/feed`),
      headlineData.title,
    )
    await deleteDoc(headlineRef)
  }

  const authenticateUser = async (payload: AuthPayload) => {
    auth.value.loading = true

    try {
      const {
        loginWithEmail,
        registerWithEmail,
        getDb,
        collection,
        doc,
        setDoc,
        getDoc,
      } = useFirebase()

      const { userCredential, userData } = await (async () => {
        if (payload.action === 'register') {
          const credential = await registerWithEmail(
            payload.email,
            payload.password,
          )
          const avatar = `https://gravatar.com/avatar/${md5(credential.user.email!)}?d=identicon`
          const user = { email: credential.user.email!, avatar }

          const db = getDb()
          await setDoc(doc(collection(db, 'users'), payload.email), user)
          return { userCredential: credential, userData: user }
        }

        const credential = await loginWithEmail(payload.email, payload.password)
        const db = getDb()
        const loginRef = doc(db, 'users', payload.email)
        const loggedInUser = await getDoc(loginRef)

        if (loggedInUser.exists()) {
          return {
            userCredential: credential,
            userData: loggedInUser.data() as User,
          }
        }

        const avatar = `https://gravatar.com/avatar/${md5(credential.user.email!)}?d=identicon`
        const user = { email: credential.user.email!, avatar }
        await setDoc(doc(collection(db, 'users'), payload.email), user)
        return { userCredential: credential, userData: user }
      })()

      const idToken = await userCredential.user.getIdToken()

      auth.value.user = userData
      auth.value.token = idToken
      saveUserData(
        { idToken, expiresIn: '3600', email: userData.email },
        userData,
      )
    } finally {
      auth.value.loading = false
    }
  }

  const setLogoutTimer = (interval: number) => {
    setTimeout(() => logoutUser(), interval)
  }

  const logoutUser = async () => {
    const { logout } = useFirebase()
    try {
      await logout()
    } catch {}
    clearToken()
    clearUser()
    clearFeed()
    clearUserData()
  }

  return {
    news: readonly(news),
    auth: readonly(auth),
    headlines,
    headline,
    feed,
    category,
    country,
    source,
    nextPage,
    currentApiUrl,
    loading,
    token,
    user,
    isAuthenticated,
    hasMore,
    setLoading,
    setToken,
    setUser,
    setCategory,
    setCountry,
    setSource,
    setFeed,
    setHeadline,
    clearToken,
    clearUser,
    clearFeed,
    loadHeadlines,
    loadMoreHeadlines,
    addHeadlineToFeed,
    loadUserFeed,
    loadHeadline,
    sendComment,
    likeComment,
    saveHeadline,
    removeHeadlineFromFeed,
    authenticateUser,
    setLogoutTimer,
    logoutUser,
  }
})
