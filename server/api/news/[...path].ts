export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const pathParam = event.context.params?.path

  const requestUrl = new URL(
    event.node.req.url || '',
    `http://${event.node.req.headers.host || 'localhost'}`,
  )
  const query = Object.fromEntries(requestUrl.searchParams.entries())

  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam || ''

  if (!path) {
    throw createError({
      statusCode: 400,
      message: 'Path is required',
    })
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      params.set(key, String(value))
    }
  }
  params.set('apikey', config.public.newsdataApiKey)

  const url = `https://newsdata.io/api/1/${path}?${params.toString()}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Failed to fetch news: ${response.statusText}`,
      })
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch news',
    })
  }
})
