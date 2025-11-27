interface FetchError {
  statusCode?: number
  message?: string
  data?: unknown
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const pathParam = event.context.params?.path

  // Get query parameters from the request URL
  const requestUrl = new URL(event.node.req.url || '', `http://${event.node.req.headers.host || 'localhost'}`)
  const query = Object.fromEntries(requestUrl.searchParams.entries())

  // Handle path - it can be a string or array
  let path = ''
  if (Array.isArray(pathParam)) {
    path = pathParam.join('/')
  } else if (pathParam) {
    path = pathParam
  }

  // If no path, return error
  if (!path) {
    throw createError({
      statusCode: 400,
      message: 'Path is required',
    })
  }

  // newsdata.io uses 'apikey' as query parameter
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      params.set(key, String(value))
    }
  }
  params.set('apikey', config.public.newsdataApiKey)

  const url = `https://newsdata.io/api/1/${path}?${params.toString()}`

  console.log('Fetching URL:', url)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Newsdata.io API Error:', errorText)
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

    console.error('Newsdata.io API Error:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch news',
    })
  }
})
