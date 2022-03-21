<template>
  <div id="app">
    <ul>
      <li v-for="(message, index) in messages" :key="index">
        {{message}}
      </li>
    </ul>
    <b-input-group prepend="Message" class="mt-3">
      <b-form-input v-model="draft"></b-form-input>
      <b-input-group-append>
        <b-button variant="info" @click="send">Button</b-button>
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script>
import Pusher from "pusher-js";
import qs from 'querystring';
import uniq from 'lodash.uniq';
const AUTH_ENDPOINT = 'https://pusher-auth.now.sh';

export default {
  name: 'App',
  components: {},
  data: () => ({
    me: null,
    members: [],
    messages: [],
    draft: '',
    pusher: null,
    channel: null,
    presenceChannel: null,
  }),
  mounted() {
    Pusher.logToConsole = true;

   this.pusher = new Pusher('d34060bc154d925283f8', {
     app_id: "1364833",
     // key: "94db23f60a72fb315a70",
     secret: "bd540eabe0c92baa34b2",
     cluster: "eu",
     // authEndpoint: '/pusher/auth',
     forceTLS: true,
     authEndpoint: `${AUTH_ENDPOINT}/auth`,
     authTransport: 'jsonp'
    });

    this.channel = this.pusher.subscribe('chat');
    this.presenceChannel = this.pusher.subscribe('presence-chat');
    this.channel.bind('message', obj => {
      this.messages.push({
        ...obj,
        ts: new Date(+obj.ts)
      });
    });
    this.presenceChannel
        .bind('pusher:subscription_succeeded', members => {
          const list = [];
          members.each(function(member) {
            // for example:
            list.push(member.id);
          });
          this.members = list;
          this.me = members.me.id;
        })
        .bind('pusher:member_added', member => {
          this.members = uniq(this.members.concat(member.id));
        })
        .bind('pusher:member_removed', member => {
          this.members = this.members.filter(m => m !== member.id);
        });
    this.channel.bind('pusher:subscription_succeeded', () => {
      //this.send('makákó');
    });


  },
  methods: {
    send() {
      const query = {
        msg: this.draft,
        ts: Date.now(),
        user: this.me
      };
      fetch(`${AUTH_ENDPOINT}/message?${qs.stringify(query)}`);
      // fetch(`pusher/message?${qs.stringify(query)}`);
      this.draft = '';
    }
  },
}
</script>

<style>

</style>
