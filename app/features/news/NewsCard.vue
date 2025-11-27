<script setup lang="ts">
import type { Headline } from '~/types'

interface Props {
  headline: Headline
  isInFeed: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'add-to-feed': [headline: Headline]
  'load-source': [sourceId: string]
  'save-headline': [headline: Headline]
}>()

const { publishedTimeToNow } = useTimeFormat()
</script>

<template>
  <UCard class="overflow-hidden hover:ring-2 hover:ring-primary-400 transition-all">
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
          @click="emit('load-source', headline.source_id)"
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
          :icon="isInFeed ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
          :color="isInFeed ? 'primary' : 'gray'"
          variant="ghost"
          @click="emit('add-to-feed', headline)"
        />
        <UButton
          icon="i-heroicons-chat-bubble-left"
          color="gray"
          variant="ghost"
          @click="emit('save-headline', headline)"
        />
      </div>
    </template>
  </UCard>
</template>
