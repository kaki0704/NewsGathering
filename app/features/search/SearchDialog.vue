<script setup lang="ts">
interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  search: [query: string]
}>()

const query = ref('')
const fromDate = ref<Date | null>(null)
const toDate = ref<Date | null>(null)
const sortBy = ref('')

const sortOptions = [
  { label: '新しい順 (デフォルト)', value: 'publishedAt' },
  { label: '関連性', value: 'relevancy' },
  { label: '人気度', value: 'popularity' }
]

const handleSearch = () => {
  if (!query.value) {
    alert('キーワードを入力してください')
    return
  }
  emit('search', query.value)
  emit('update:open', false)
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="open" title="記事を探す" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="p-4 space-y-4">
        <UFormField label="検索キーワード" class="w-full">
          <UInput
            v-model="query"
            placeholder="キーワードを入力してください。（条件にAND, OR, NOTが使用できます。）"
            :maxlength="30"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="開始日 (任意)">
            <UInput v-model="fromDate" type="date" class="w-full" />
          </UFormField>
          <UFormField label="終了日 (任意)">
            <UInput v-model="toDate" type="date" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="並び順 (任意)" class="w-full">
          <USelect v-model="sortBy" :items="sortOptions" value-key="value" placeholder="選択してください" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4">
          <UButton color="neutral" variant="ghost" @click="handleCancel">
            キャンセル
          </UButton>
          <UButton color="primary" @click="handleSearch">検索</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
