<script setup lang="ts">
import type { Headline, User, Country } from '~/types'

interface Props {
  open: boolean
  feed: Headline[]
  user: User | null
  loading: boolean
  country: string
  countries: Country[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'change-country': [country: string]
  'remove-from-feed': [headline: Headline]
  'save-headline': [headline: Headline]
}>()
</script>

<template>
  <USlideover :open="open" side="left" title="メニュー" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="p-4 space-y-4">
        <div v-if="loading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="w-6 h-6 animate-spin text-primary-400" />
        </div>

        <UFormField label="国を選択" class="w-full">
          <USelect
            :model-value="country"
            :items="countries"
            label-key="name"
            value-key="code"
            class="w-full"
            @update:model-value="emit('change-country', $event)"
          />
        </UFormField>

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
                @click="emit('save-headline', headline)"
              >
                記事のコメントを見る
              </button>
            </div>
            <UButton
              icon="i-heroicons-trash"
              color="error"
              variant="ghost"
              size="xs"
              @click="emit('remove-from-feed', headline)"
            />
          </li>
        </ul>
      </div>
    </template>
  </USlideover>
</template>
