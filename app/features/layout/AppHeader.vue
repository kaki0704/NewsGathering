<script setup lang="ts">
import type { User } from '~/types'

interface Props {
  isAuthenticated: boolean
  user: User | null
}

defineProps<Props>()

const emit = defineEmits<{
  'open-feed': []
  'open-search': []
  'open-category': []
  logout: []
}>()
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700">
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-4">
        <UButton
          icon="i-heroicons-bars-3"
          color="gray"
          variant="ghost"
          @click="emit('open-feed')"
        />
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo.svg" alt="News Gathering" class="h-8" />
        </NuxtLink>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="isAuthenticated && user">
          <UButton color="gray" variant="ghost">
            <UAvatar :src="user.avatar" :alt="user.email" size="xs" />
            <span class="ml-2 hidden sm:inline">{{ user.email }}</span>
          </UButton>
          <UButton color="gray" variant="ghost" @click="emit('logout')">
            ログアウト
          </UButton>
        </template>
        <template v-else>
          <UButton to="/login" color="gray" variant="ghost">ログイン</UButton>
          <UButton to="/register" color="gray" variant="ghost">ユーザー登録</UButton>
        </template>
        <button class="text-red-400 hover:text-red-300 transition-colors" @click="emit('open-search')">記事検索</button>
        <button class="text-lime-400 hover:text-lime-300 transition-colors" @click="emit('open-category')">カテゴリ</button>
      </div>
    </div>
  </header>
</template>
