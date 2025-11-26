<script setup lang="ts">
import type { Headline, NewsCategory } from '~/types'

const newsStore = useNewsStore()
const router = useRouter()
const { publishedTimeToNow } = useTimeFormat()

const showLeftSidepanel = ref(false)
const showRightSidepanel = ref(false)
const showSearchDialog = ref(false)

const query = ref('')
const fromDate = ref<Date | null>(null)
const toDate = ref<Date | null>(null)
const sortBy = ref('')

const newsCategories: NewsCategory[] = [
  { name: 'トップニュース', path: '', icon: 'i-heroicons-newspaper' },
  { name: 'テクノロジー', path: 'technology', icon: 'i-heroicons-computer-desktop' },
  { name: 'ビジネス', path: 'business', icon: 'i-heroicons-briefcase' },
  { name: 'エンターテイメント', path: 'entertainment', icon: 'i-heroicons-tv' },
  { name: 'サイエンス', path: 'science', icon: 'i-heroicons-beaker' },
  { name: 'スポーツ', path: 'sports', icon: 'i-heroicons-trophy' }
]

const countries = [
  { code: 'jp', name: 'Japan', language: 'ja' },
  { code: 'us', name: 'United States', language: 'en' },
  { code: 'ca', name: 'Canada', language: 'en' },
  { code: 'de', name: 'Germany', language: 'de' },
  { code: 'ru', name: 'Russia', language: 'ru' },
]

const sortOptions = [
  { label: '新しい順 (デフォルト)', value: 'publishedAt' },
  { label: '関連性', value: 'relevancy' },
  { label: '人気度', value: 'popularity' }
]

const headlines = computed(() => newsStore.headlines)
const feed = computed(() => newsStore.feed)
const category = computed(() => newsStore.category)
const loading = computed(() => newsStore.loading)
const country = computed(() => newsStore.country)
const user = computed(() => newsStore.user)
const isAuthenticated = computed(() => newsStore.isAuthenticated)

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

const searchHeadlines = async () => {
  if (!query.value) {
    alert('キーワードを入力してください')
    return
  }

  const url = `/api/news/latest?q=${encodeURIComponent(query.value)}&language=ja`

  await newsStore.loadHeadlines(url)
  showSearchDialog.value = false
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
  return feed.value.findIndex(headline => headline.title === title) > -1
}

const getLanguageForCountry = (countryCode: string): string => {
  const found = countries.find((c) => c.code === countryCode)
  return found?.language || 'en'
}

const buildHeadlinesUrl = (countryCode: string, categoryPath: string) => {
  const language = getLanguageForCountry(countryCode)
  let url = `/api/news/latest?country=${countryCode}&language=${language}`
  if (categoryPath) {
    url += `&category=${categoryPath}`
  }
  return url
}

onMounted(async () => {
  const url = buildHeadlinesUrl(country.value, category.value)
  await newsStore.loadHeadlines(url)
  await newsStore.loadUserFeed()
})

watch(country, async () => {
  await newsStore.loadHeadlines(buildHeadlinesUrl(country.value, category.value))
})
</script>

<template>
  <div class="pt-16">
    <header class="fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-bars-3"
            color="gray"
            variant="ghost"
            @click="showLeftSidepanel = true"
          />
          <NuxtLink to="/" class="text-xl font-bold text-primary-400">
            News Gathering
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2">
          <template v-if="isAuthenticated && user">
            <UButton color="gray" variant="ghost">
              <UAvatar :src="user.avatar" :alt="user.email" size="xs" />
              <span class="ml-2 hidden sm:inline">{{ user.email }}</span>
            </UButton>
            <UButton color="gray" variant="ghost" @click="logoutUser">
              ログアウト
            </UButton>
          </template>
          <template v-else>
            <UButton to="/login" color="gray" variant="ghost">ログイン</UButton>
            <UButton to="/register" color="gray" variant="ghost">ユーザー登録</UButton>
          </template>
          <button class="text-red-400 hover:text-red-300 transition-colors" @click="showSearchDialog = true">記事検索</button>
          <button class="text-lime-400 hover:text-lime-300 transition-colors" @click="showRightSidepanel = true">カテゴリ</button>
        </div>
      </div>
    </header>

    <UModal v-model="showSearchDialog">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">記事を探す</h3>
        </template>

        <div class="space-y-4">
          <UFormGroup label="検索キーワード">
            <UInput
              v-model="query"
              placeholder="キーワードを入力してください。（条件にAND, OR, NOTが使用できます。）"
              :maxlength="30"
            />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="開始日 (任意)">
              <UInput v-model="fromDate" type="date" />
            </UFormGroup>
            <UFormGroup label="終了日 (任意)">
              <UInput v-model="toDate" type="date" />
            </UFormGroup>
          </div>

          <UFormGroup label="並び順 (任意)">
            <USelect v-model="sortBy" :options="sortOptions" option-attribute="label" value-attribute="value" placeholder="選択してください" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="red" variant="ghost" @click="showSearchDialog = false">
              キャンセル
            </UButton>
            <UButton color="primary" @click="searchHeadlines">検索</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <USlideover v-model="showLeftSidepanel" side="left">
      <UCard class="h-full flex flex-col" :ui="{ body: { base: 'flex-1 overflow-auto' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">メニュー</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="showLeftSidepanel = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <UProgress v-if="loading" animation="carousel" />

          <UFormGroup label="国を選択">
            <USelect
              :model-value="country"
              :options="countries"
              option-attribute="name"
              value-attribute="code"
              @update:model-value="changeCountry"
            />
          </UFormGroup>

          <div v-if="feed.length === 0 && !user" class="text-center py-8">
            <UIcon name="i-heroicons-bookmark" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-400 mb-4">ブックマークされている記事はありません</p>
            <p class="text-gray-500 text-sm mb-4">ブックマークするにはログインしてください</p>
            <UButton to="/login" color="primary">ログイン</UButton>
          </div>

          <div v-else-if="feed.length === 0" class="text-center py-8">
            <UIcon name="i-heroicons-bookmark-slash" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-400">フィードには何もありません</p>
            <p class="text-gray-500 text-sm">ブックマークした記事がこちらで見ることができます。</p>
          </div>

          <ul v-else class="space-y-2">
            <li v-for="headline in feed" :key="headline.title" class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800">
              <UAvatar :src="headline.image_url || ''" :alt="headline.title" size="md" />
              <div class="flex-1 min-w-0">
                <a :href="headline.link" target="_blank" class="text-sm font-medium text-gray-200 hover:text-primary-400 line-clamp-2">
                  {{ headline.title }}
                </a>
                <p class="text-xs text-gray-500">{{ headline.source_name }}</p>
                <button
                  class="text-xs text-primary-400 hover:underline"
                  @click="saveHeadline(headline)"
                >
                  記事のコメントを見る
                </button>
              </div>
              <UButton
                icon="i-heroicons-trash"
                color="red"
                variant="ghost"
                size="xs"
                @click="removeHeadlineFromFeed(headline)"
              />
            </li>
          </ul>
        </div>
      </UCard>
    </USlideover>

    <USlideover v-model="showRightSidepanel" side="right">
      <UCard class="h-full flex flex-col" :ui="{ body: { base: 'flex-1 overflow-auto' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">ニュースカテゴリ</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="showRightSidepanel = false"
            />
          </div>
        </template>

        <div>
          <UProgress v-if="loading" animation="carousel" />

          <nav class="space-y-1">
            <button
              v-for="newsCategory in newsCategories"
              :key="newsCategory.path"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              :class="newsCategory.path === category ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-gray-800 text-gray-300'"
              @click="loadCategory(newsCategory.path)"
            >
              <UIcon :name="newsCategory.icon" class="w-5 h-5" />
              <span>{{ newsCategory.name }}</span>
            </button>
          </nav>
        </div>
      </UCard>
    </USlideover>

    <main class="p-4 bg-cyan-700 min-h-screen">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <UCard
          v-for="headline in headlines"
          :key="headline.title"
          class="overflow-hidden hover:ring-2 hover:ring-primary-400 transition-all"
        >
          <template #header>
            <img
              :src="headline.image_url || '/default-image.jpeg'"
              :alt="headline.title"
              class="w-full h-48 object-cover"
            />
          </template>

          <div class="space-y-2">
            <a
              :href="headline.link"
              target="_blank"
              class="font-semibold text-gray-200 hover:text-primary-400 line-clamp-2"
            >
              {{ headline.title }}
            </a>

            <div class="flex items-center gap-2 text-sm text-gray-400">
              <button
                class="hover:text-primary-400"
                @click="loadSource(headline.source_id)"
              >
                {{ headline.source_name }}
              </button>
              <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
            </div>

            <div v-if="headline.creator && headline.creator.length > 0" class="flex items-center gap-2 text-sm text-gray-500">
              <span>{{ headline.creator.join(', ') }}</span>
              <UIcon name="i-heroicons-user" class="w-4 h-4" />
            </div>

            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>{{ publishedTimeToNow(headline.pubDate) }}</span>
              <UIcon name="i-heroicons-clock" class="w-4 h-4" />
            </div>

            <p class="text-sm text-gray-400 line-clamp-3">{{ headline.description }}</p>
          </div>

          <template #footer>
            <div class="flex gap-2">
              <UButton
                :icon="isInFeed(headline.title) ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
                :color="isInFeed(headline.title) ? 'primary' : 'gray'"
                variant="ghost"
                @click="addHeadlineToFeed(headline)"
              />
              <UButton
                icon="i-heroicons-chat-bubble-left"
                color="gray"
                variant="ghost"
                @click="saveHeadline(headline)"
              />
            </div>
          </template>
        </UCard>
      </div>
    </main>
  </div>
</template>
