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

const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700">
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center gap-4">
        <UButton
          icon="i-heroicons-bars-3"
          color="gray"
          variant="ghost"
          class="hidden sm:flex"
          @click="emit('open-feed')"
        />
        <NuxtLink to="/" class="flex items-center">
          <img src="/logo.png" alt="News Gathering" class="h-6 sm:h-8 w-auto" />
        </NuxtLink>
      </div>

      <!-- Desktop menu -->
      <div class="hidden sm:flex items-center gap-4">
        <button class="text-white hover:text-gray-300 transition-colors text-sm font-bold px-3 py-2" @click="emit('open-search')">
          記事検索
        </button>
        <button class="text-white hover:text-gray-300 transition-colors text-sm font-bold px-3 py-2" @click="emit('open-category')">
          カテゴリ
        </button>
        <template v-if="isAuthenticated && user">
          <div class="relative">
            <button
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              @click="isUserMenuOpen = !isUserMenuOpen"
            >
              <UAvatar :src="user.avatar" :alt="user.email" size="xs" />
              <span class="hidden md:inline text-sm text-gray-300">{{ user.email }}</span>
            </button>
            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50"
            >
              <button
                class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                @click="emit('logout'); isUserMenuOpen = false"
              >
                ログアウト
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <UButton to="/login" color="gray" variant="ghost" size="xs">
            ログイン
          </UButton>
          <UButton to="/register" color="gray" variant="ghost" size="xs">
            登録
          </UButton>
        </template>
      </div>

      <!-- Mobile menu -->
      <div class="flex sm:hidden items-center gap-2">
        <template v-if="isAuthenticated && user">
          <UAvatar :src="user.avatar" :alt="user.email" size="xs" />
        </template>
        <UButton
          icon="i-heroicons-bars-3"
          color="gray"
          variant="ghost"
          size="xs"
          @click="isMenuOpen = !isMenuOpen"
        />
      </div>
    </div>

    <!-- Mobile dropdown menu -->
    <div v-if="isMenuOpen" class="sm:hidden border-t border-gray-700 bg-gray-900">
      <div class="flex flex-col p-4 gap-3">
        <button
          class="text-white hover:text-gray-300 transition-colors text-left py-3 px-2 font-bold"
          @click="emit('open-feed'); isMenuOpen = false"
        >
          フィード設定
        </button>
        <button
          class="text-white hover:text-gray-300 transition-colors text-left py-3 px-2 font-bold"
          @click="emit('open-search'); isMenuOpen = false"
        >
          記事検索
        </button>
        <button
          class="text-white hover:text-gray-300 transition-colors text-left py-3 px-2 font-bold"
          @click="emit('open-category'); isMenuOpen = false"
        >
          カテゴリ
        </button>
        <div class="border-t border-gray-700 my-2"></div>
        <template v-if="isAuthenticated && user">
          <div class="flex items-center gap-2 py-2">
            <UAvatar :src="user.avatar" :alt="user.email" size="xs" />
            <span class="text-sm text-gray-300">{{ user.email }}</span>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            size="xs"
            class="justify-start"
            @click="emit('logout'); isMenuOpen = false"
          >
            ログアウト
          </UButton>
        </template>
        <template v-else>
          <UButton to="/login" color="gray" variant="ghost" size="xs" class="justify-start">
            ログイン
          </UButton>
          <UButton to="/register" color="gray" variant="ghost" size="xs" class="justify-start">
            ユーザー登録
          </UButton>
        </template>
      </div>
    </div>
  </header>
</template>
