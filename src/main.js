import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import VueTimeago from 'vue-timeago';

import Pusher from 'pusher'


Vue.use(Vuetify);
Vue.use(VueTimeago, {
  name: 'Timeago', // Component name, `Timeago` by default
  locale: 'en'
});

Vue.use(Pusher)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
