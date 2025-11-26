<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  middleware: 'auth'
})

const newsStore = useNewsStore()
const router = useRouter()
const toast = useToast()

const schema = z.object({
  email: z.string().email('不正なメールアドレスです'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください').max(20, 'パスワードは20文字以内で入力してください')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: ''
})

const loading = computed(() => newsStore.loading)
const isAuthenticated = computed(() => newsStore.isAuthenticated)

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  await newsStore.authenticateUser({
    action: 'login',
    email: event.data.email,
    password: event.data.password,
    returnSecureToken: true
  })
}

const goBack = () => {
  router.back()
}

watch(isAuthenticated, (value) => {
  if (value) {
    toast.add({
      title: 'ログイン成功',
      description: `ユーザー名「${state.email}」でログインしました。`,
      color: 'success'
    })
    setTimeout(() => router.push('/'), 2000)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">ログイン</h1>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="メールアドレス" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="email@example.com"
            :disabled="loading"
            icon="i-heroicons-envelope"
          />
        </UFormField>

        <UFormField label="パスワード" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="パスワード"
            :disabled="loading"
            icon="i-heroicons-lock-closed"
          />
        </UFormField>

        <div class="flex items-center justify-between pt-4">
          <UButton to="/register" color="gray" variant="ghost">
            ユーザー登録
          </UButton>
          <UButton type="submit" color="primary" :loading="loading">
            ログイン
          </UButton>
        </div>
      </UForm>
    </UCard>

    <UButton
      icon="i-heroicons-arrow-left"
      color="primary"
      size="lg"
      class="fixed bottom-8 right-8 rounded-full shadow-lg"
      @click="goBack"
    />
  </div>
</template>
