<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { Comment, CommentUser } from '~/types'

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()
const { commentTimeToNow } = useTimeFormat()

const text = ref('')

const headline = computed(() => newsStore.headline)
const loading = computed(() => newsStore.loading)
const user = computed(() => newsStore.user)

const sendComment = async () => {
  if (!text.value.trim() || !user.value) return

  const comment: Comment = {
    id: uuidv4(),
    text: text.value,
    user: getCommentUserData(),
    publishedAt: Date.now(),
    likes: 0
  }

  await newsStore.sendComment(comment)
  text.value = ''
}

const likeComment = async (commentId: string) => {
  await newsStore.likeComment(commentId)
}

const getCommentUserData = (): CommentUser => {
  if (!user.value) {
    throw new Error('User is not logged in')
  }
  return {
    email: user.value.email,
    avatar: user.value.avatar,
    username: user.value.email.split('@')[0]
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  const slug = route.params.slug as string
  await newsStore.loadHeadline(slug)
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 py-20 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Headline Card -->
      <UCard v-if="headline" class="mb-8">
        <template #header>
          <img
            :src="headline.image_url || '/default-image.jpeg'"
            :alt="headline.title"
            class="w-full h-64 object-cover"
          />
        </template>

        <div class="space-y-4">
          <a
            :href="headline.link"
            target="_blank"
            class="text-2xl font-bold text-gray-100 hover:text-primary-400"
          >
            {{ headline.title }}
          </a>

          <div class="flex items-center gap-4 text-gray-400">
            <div class="flex items-center gap-2">
              <span>{{ headline.source_name }}</span>
              <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
            </div>
            <div v-if="headline.creator && headline.creator.length > 0" class="flex items-center gap-2">
              <span>{{ headline.creator.join(', ') }}</span>
              <UIcon name="i-heroicons-user" class="w-4 h-4" />
            </div>
          </div>

          <p class="text-gray-300">{{ headline.content }}</p>
        </div>
      </UCard>

      <!-- Comment Form -->
      <UCard class="mb-8">
        <form @submit.prevent="sendComment">
          <UFormField label="コメントを入力してください">
            <UTextarea
              v-model="text"
              :disabled="loading || !user"
              placeholder="コメントを入力..."
              :rows="3"
            />
          </UFormField>
          <div class="mt-4">
            <UButton
              type="submit"
              color="primary"
              :disabled="loading || !user || !text.trim()"
              :loading="loading"
            >
              コメントを投稿する
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Comments List -->
      <UCard v-if="headline?.comments?.length">
        <template #header>
          <h3 class="text-lg font-semibold">コメント</h3>
        </template>

        <ul class="space-y-4">
          <li
            v-for="comment in headline.comments"
            :key="comment.id"
            class="flex items-start gap-4 p-4 rounded-lg bg-gray-800"
          >
            <UAvatar :src="comment.user.avatar" :alt="comment.user.username" />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-gray-200">{{ comment.user.username }}</span>
                <span class="text-sm text-gray-500">{{ commentTimeToNow(comment.publishedAt) }}</span>
              </div>
              <p class="text-gray-300">{{ comment.text }}</p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge color="primary" variant="soft">{{ comment.likes }}</UBadge>
              <UButton
                icon="i-heroicons-hand-thumb-up"
                color="gray"
                variant="ghost"
                size="sm"
                :disabled="loading || !user"
                @click="likeComment(comment.id)"
              />
            </div>
          </li>
        </ul>
      </UCard>

      <!-- Back Button -->
      <UButton
        icon="i-heroicons-arrow-left"
        color="primary"
        size="lg"
        class="fixed bottom-8 right-8 rounded-full shadow-lg"
        @click="goBack"
      />
    </div>
  </div>
</template>
