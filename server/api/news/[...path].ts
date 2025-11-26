interface FetchError {
  statusCode?: number
  message?: string
  data?: unknown
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = event.context.params?.path || ''
  const query = getQuery(event)

  // newsdata.io uses 'apikey' as query parameter
  const params = new URLSearchParams(query as Record<string, string>)
  params.set('apikey', config.public.newsdataApiKey)

  const url = `https://newsdata.io/api/1/${path}?${params.toString()}`

  try {
    const response = await $fetch(url)
    return response
  } catch (error) {
    const fetchError = error as FetchError
    console.error(
      'Newsdata.io API Error:',
      fetchError.data || fetchError.message,
    )
    throw createError({
      statusCode: fetchError.statusCode || 500,
      message: fetchError.message || 'Failed to fetch news',
    })
  }
})
