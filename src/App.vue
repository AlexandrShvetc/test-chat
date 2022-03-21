<template>
  <div id="app">

    <ul>
      <li v-for="{message, index} in messages" :key="index">
        {{message}}
      </li>
    </ul>

  </div>
</template>

<script>
import Pusher from "pusher-js";

export default {
  name: 'App',
  components: {

  },
  data: () => ({
    messages: [],
    }),
  beforeMount() {
    Pusher.logToConsole = true;

    let pusher = new Pusher('94db23f60a72fb315a70', {
      cluster: 'eu'
    });

    let channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
     this.messages.push(JSON.stringify(data));
    });
  },
  methods: {

  },
}
</script>

<style>

</style>
