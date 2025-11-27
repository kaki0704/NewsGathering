<script setup lang="ts">
useHead({
  title: 'News Gathering',
  meta: [
    { name: 'description', content: 'A news application built with Nuxt 3 and Firestore' }
  ]
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
