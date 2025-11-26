import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('ja')

export const useTimeFormat = () => {
  const publishedTimeToNow = (time: string | Date): string => {
    return dayjs(time).format('M月 D日 dddd')
  }

  const commentTimeToNow = (timestamp: number): string => {
    return dayjs(timestamp).fromNow()
  }

  return {
    publishedTimeToNow,
    commentTimeToNow,
  }
}
