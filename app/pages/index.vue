<script setup lang="ts">
import type { Headline, NewsCategory, Country } from '~/types'
import AppHeader from '~/features/layout/AppHeader.vue'
import NewsCard from '~/features/news/NewsCard.vue'
import SearchDialog from '~/features/search/SearchDialog.vue'
import FeedSidebar from '~/features/feed/FeedSidebar.vue'
import CategorySidebar from '~/features/category/CategorySidebar.vue'

const newsStore = useNewsStore()
const router = useRouter()

const showLeftSidepanel = ref(false)
const showRightSidepanel = ref(false)
const showSearchDialog = ref(false)

const newsCategories: NewsCategory[] = [
  { name: 'トップニュース', path: '', icon: 'i-heroicons-newspaper' },
  { name: 'テクノロジー', path: 'technology', icon: 'i-heroicons-computer-desktop' },
  { name: 'ビジネス', path: 'business', icon: 'i-heroicons-briefcase' },
  { name: 'エンターテイメント', path: 'entertainment', icon: 'i-heroicons-tv' },
  { name: 'サイエンス', path: 'science', icon: 'i-heroicons-beaker' },
  { name: 'スポーツ', path: 'sports', icon: 'i-heroicons-trophy' }
]

const countries: Country[] = [
  { code: 'jp', name: '日本', language: 'ja' },
  { code: 'us', name: 'アメリカ', language: 'en' },
  { code: 'ca', name: 'カナダ', language: 'en' },
  { code: 'de', name: 'ドイツ', language: 'de' },
  { code: 'ru', name: 'ロシア', language: 'ru' },
]

const headlines = computed(() => newsStore.headlines)
const feed = computed(() => newsStore.feed)
const category = computed(() => newsStore.category)
const loading = computed(() => newsStore.loading)
const country = computed(() => newsStore.country)
const user = computed(() => newsStore.user)
const isAuthenticated = computed(() => newsStore.isAuthenticated)
const hasMore = computed(() => newsStore.hasMore)

const loadMoreTrigger = ref<HTMLElement | null>(null)

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  await newsStore.loadMoreHeadlines()
}

const loadCategory = async (categoryPath: string) => {
  newsStore.setCategory(categoryPath)
  await newsStore.loadHeadlines(buildHeadlinesUrl(country.value, categoryPath))
  showRightSidepanel.value = false
}

const loadSource = async (sourceId: string | null) => {
  if (sourceId) {
    newsStore.setSource(sourceId)
    await newsStore.loadHeadlines(`/api/news/latest?domain=${sourceId}&language=ja`)
  }
}

const changeCountry = async (newCountry: string) => {
  newsStore.setCountry(newCountry)
  await newsStore.loadHeadlines(buildHeadlinesUrl(newCountry, category.value))
}

const searchHeadlines = async (query: string) => {
  const url = `/api/news/latest?q=${encodeURIComponent(query)}&language=ja`
  await newsStore.loadHeadlines(url)
}

const addHeadlineToFeed = async (headline: Headline) => {
  if (user.value) {
    await newsStore.addHeadlineToFeed(headline)
  }
}

const removeHeadlineFromFeed = async (headline: Headline) => {
  await newsStore.removeHeadlineFromFeed(headline)
}

const saveHeadline = async (headline: Headline) => {
  await newsStore.saveHeadline(headline)
  router.push(`/headlines/${headline.slug}`)
}

const logoutUser = () => {
  newsStore.logoutUser()
}

const isInFeed = (title: string): boolean => {
  return feed.value.findIndex((headline: Headline) => headline.title === title) > -1
}

const getLanguageForCountry = (countryCode: string): string => {
  const found = countries.find((c) => c.code === countryCode)
  return found?.language || 'en'
}

const buildHeadlinesUrl = (countryCode: string, categoryPath: string) => {
  const language = getLanguageForCountry(countryCode)
  const baseUrl = `/api/news/latest?country=${countryCode}&language=${language}`
  return categoryPath ? `${baseUrl}&category=${categoryPath}` : baseUrl
}

const observer = ref<IntersectionObserver | null>(null)

const setupObserver = () => {
  if (observer.value) {
    observer.value.disconnect()
  }

  if (loadMoreTrigger.value) {
    observer.value = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    observer.value.observe(loadMoreTrigger.value)
  }
}

onMounted(async () => {
  const url = buildHeadlinesUrl(country.value, category.value)
  await newsStore.loadHeadlines(url)

  if (user.value) {
    await newsStore.loadUserFeed()
  }

  nextTick(() => {
    setupObserver()
  })
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

watch(country, async () => {
  await newsStore.loadHeadlines(buildHeadlinesUrl(country.value, category.value))
})

watch(headlines, () => {
  nextTick(() => {
    setupObserver()
  })
})

watch(user, async (newUser) => {
  if (newUser) {
    await newsStore.loadUserFeed()
  }
})
</script>

<template>
  <div class="pt-16">
    <AppHeader
      :is-authenticated="isAuthenticated"
      :user="user"
      @open-feed="showLeftSidepanel = true"
      @open-search="showSearchDialog = true"
      @open-category="showRightSidepanel = true"
      @logout="logoutUser"
    />

    <SearchDialog
      v-model:open="showSearchDialog"
      @search="searchHeadlines"
    />

    <FeedSidebar
      v-model:open="showLeftSidepanel"
      :feed="feed"
      :user="user"
      :loading="loading"
      :country="country"
      :countries="countries"
      @change-country="changeCountry"
      @remove-from-feed="removeHeadlineFromFeed"
      @save-headline="saveHeadline"
    />

    <CategorySidebar
      v-model:open="showRightSidepanel"
      :loading="loading"
      :current-category="category"
      :categories="newsCategories"
      @load-category="loadCategory"
    />

    <main class="p-4 min-h-screen">
      <div class="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading state -->
        <div v-if="loading && headlines.length === 0" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center gap-4">
            <UIcon name="i-lucide-loader-circle" class="w-12 h-12 animate-spin text-primary-400" />
            <span class="text-gray-300">ニュースを読み込んでいます...</span>
          </div>
        </div>

        <!-- News grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          <NewsCard
            v-for="headline in headlines"
            :key="headline.title"
            :headline="headline"
            :is-in-feed="isInFeed(headline.title)"
            @add-to-feed="addHeadlineToFeed"
            @load-source="loadSource"
            @save-headline="saveHeadline"
          />
        </div>

        <!-- Infinite scroll trigger -->
        <div
          v-if="headlines.length > 0"
          ref="loadMoreTrigger"
          class="flex justify-center py-8"
        >
          <div v-if="loading" class="flex items-center gap-2 text-gray-300">
            <UIcon name="i-lucide-loader-circle" class="w-6 h-6 animate-spin" />
            <span>読み込み中...</span>
          </div>
          <div v-else-if="!hasMore" class="text-gray-400">
            すべての記事を読み込みました
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
