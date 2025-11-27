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
  <article class="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
    <!-- Image -->
    <div class="relative overflow-hidden aspect-video flex-shrink-0">
      <img
        :src="headline.image_url || '/default-image.jpeg'"
        :alt="headline.title"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

      <!-- Category badge -->
      <div v-if="headline.category && headline.category.length > 0" class="absolute top-3 left-3">
        <span class="px-3 py-1 bg-primary-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
          {{ headline.category[0] }}
        </span>
      </div>

      <!-- Bookmark button overlay -->
      <button
        class="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-gray-900/60 backdrop-blur-sm hover:bg-gray-900/80 transition-colors cursor-pointer"
        @click.stop="emit('add-to-feed', headline)"
      >
        <UIcon
          :name="isInFeed ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
          :class="isInFeed ? 'text-primary-400' : 'text-white'"
          class="w-5 h-5"
        />
      </button>
    </div>

    <!-- Content -->
    <div class="p-5 space-y-3 flex-grow flex flex-col">
      <!-- Title -->
      <a
        :href="headline.link"
        target="_blank"
        class="block font-bold text-lg text-gray-100 hover:text-primary-400 line-clamp-2 transition-colors leading-tight cursor-pointer"
      >
        {{ headline.title }}
      </a>

      <!-- Meta info -->
      <div class="flex items-center gap-3 text-xs text-gray-400">
        <button
          class="flex items-center gap-1.5 hover:text-primary-400 transition-colors cursor-pointer"
          @click.stop="emit('load-source', headline.source_id)"
        >
          <UIcon name="i-heroicons-building-library" class="w-4 h-4" />
          <span class="font-medium">{{ headline.source_name }}</span>
        </button>

        <span class="text-gray-600">•</span>

        <div class="flex items-center gap-1.5">
          <UIcon name="i-heroicons-clock" class="w-4 h-4" />
          <span>{{ publishedTimeToNow(headline.pubDate) }}</span>
        </div>
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-400 line-clamp-2 leading-relaxed">
        {{ headline.description }}
      </p>

      <!-- Creator (if available) -->
      <div v-if="headline.creator && headline.creator.length > 0" class="flex items-center gap-1.5 text-xs text-gray-500">
        <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
        <span class="truncate">{{ headline.creator.join(', ') }}</span>
      </div>

      <!-- Spacer to push footer to bottom -->
      <div class="flex-grow" />
    </div>

    <!-- Footer -->
    <div class="px-5 pb-4 flex-shrink-0">
      <div class="flex items-center justify-between pt-3 border-t border-gray-700/50">
        <button
          class="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors cursor-pointer"
          @click.stop="emit('save-headline', headline)"
        >
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5" />
          <span class="font-medium">コメント</span>
        </button>

        <a
          :href="headline.link"
          target="_blank"
          class="flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium cursor-pointer"
        >
          <span>記事を読む</span>
          <UIcon name="i-heroicons-arrow-up-right" class="w-4 h-4" />
        </a>
      </div>
    </div>

    <!-- Hover border effect -->
    <div class="absolute inset-0 rounded-xl border-2 border-primary-500/0 group-hover:border-primary-500/30 transition-colors pointer-events-none" />
  </article>
</template>
