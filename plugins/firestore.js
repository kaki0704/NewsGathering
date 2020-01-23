import firebase from 'firebase/app';
import 'firebase/firestore'

if (!firebase.apps.length) {
  var firebaseConfig = {
    apiKey: "AIzaSyBCSLa8t2fplYRYcthG_U0LvViwSYPoe84",
    authDomain: "nuxt-news-feed-e0bdf.firebaseapp.com",
    databaseURL: "https://nuxt-news-feed-e0bdf.firebaseio.com",
    projectId: "nuxt-news-feed-e0bdf",
    storageBucket: "nuxt-news-feed-e0bdf.appspot.com",
    messagingSenderId: "193019485146",
    appId: "1:193019485146:web:15844ed31609b9d24ffee3",
    measurementId: "G-LP6LYF6SXH"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export default db;
