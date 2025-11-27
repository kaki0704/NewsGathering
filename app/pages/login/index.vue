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

const getErrorMessage = (error: unknown): string => {
  const err = error as { code?: string; message?: string }
  const errorCode = err?.code || ''

  switch (errorCode) {
    case 'auth/user-not-found':
      return 'このメールアドレスは登録されていません。'
    case 'auth/wrong-password':
      return 'パスワードが正しくありません。'
    case 'auth/user-disabled':
      return 'このアカウントは無効になっています。'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'メールアドレスまたはパスワードが正しくありません。'
    case 'auth/too-many-requests':
      return 'ログイン試行回数が多すぎます。しばらくしてからお試しください。'
    default:
      return 'ログインに失敗しました。'
  }
}

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    await newsStore.authenticateUser({
      action: 'login',
      email: event.data.email,
      password: event.data.password,
      returnSecureToken: true
    })
  } catch (error) {
    toast.add({
      title: 'ログイン失敗',
      description: getErrorMessage(error),
      color: 'error'
    })
  }
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
        <UFormField label="メールアドレス" name="email" required class="w-full">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="email@example.com"
            :disabled="loading"
            icon="i-heroicons-envelope"
            class="w-full"
          />
        </UFormField>

        <UFormField label="パスワード" name="password" required class="w-full">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="パスワード"
            :disabled="loading"
            icon="i-heroicons-lock-closed"
            class="w-full"
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
