import Vue from 'vue';
import { distanceInWordsToNow, format } from "date-fns";
import ja from 'date-fns/locale/ja'

Vue.filter('publishedTimeToNow', time => {
  return `${format(time, 'MMM Do dddd', {locale: ja})}`;
});

Vue.filter('commentTimeToNow', timestamp => {
  const timeElapsed = distanceInWordsToNow(timestamp, {
    includeSeconds: true,
    locale: ja
  });
  return `${timeElapsed}前`;
})


