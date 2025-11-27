<script setup lang="ts">
import type { NewsCategory } from '~/types'

interface Props {
  open: boolean
  loading: boolean
  currentCategory: string
  categories: NewsCategory[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'load-category': [categoryPath: string]
}>()
</script>

<template>
  <USlideover :open="open" side="right" title="ニュースカテゴリ" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="p-4">
        <UButton
          icon="i-heroicons-x-mark"
          color="gray"
          variant="ghost"
          size="sm"
          class="sm:hidden mb-4"
          @click="emit('update:open', false)"
        >
          閉じる
        </UButton>
        <div v-if="loading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="w-6 h-6 animate-spin text-primary-400" />
        </div>

        <nav class="space-y-1">
          <button
            v-for="newsCategory in categories"
            :key="newsCategory.path"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="newsCategory.path === currentCategory ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-gray-800 text-gray-300'"
            @click="emit('load-category', newsCategory.path)"
          >
            <UIcon :name="newsCategory.icon" class="w-5 h-5" />
            <span>{{ newsCategory.name }}</span>
          </button>
        </nav>
      </div>
    </template>
  </USlideover>
</template>
