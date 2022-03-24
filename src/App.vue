<template>
  <div id="app">
    <ul>
      <li v-for="(message, index) in messages" :key="index">
        <b>{{ message.message.user }}</b>
        <br>
        {{ message.message.msg }}
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
// const AUTH_ENDPOINT = 'https://pusher-auth.now.sh';
const AUTH_ENDPOINT = 'https://cheap-deep-chat.herokuapp.com';

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

    this.pusher = new Pusher('94db23f60a72fb315a70', {
      broadcaster: 'pusher',
      app_id: "1364833",
      secret: "bd540eabe0c92baa34b2",
      cluster: "eu",
      authEndpoint: `${AUTH_ENDPOINT}/pusher/auth`,
      auth:{
        params:{
          user_id: 'blabla',
        },
        // headers:{
        //   user_id: 'blabla',
        // },
      },
      // authTransport: 'jsonp'
    });

    this.channel = this.pusher.subscribe('private-document');

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
          members.each(function (member) {
            // for example:
            console.log(member)
            list.push({id: member.id, name: member.info.name});
          });
          this.members = list;
          this.me = members.me.info.name;
        })
        .bind('pusher:member_added', member => {
          this.members = uniq(this.members.concat(member.id));
        })
        .bind('pusher:member_removed', member => {
          this.members = this.members.filter(m => m !== member.id);
        });
    this.channel.bind('pusher:subscription_succeeded', () => {
      // this.send('makákó');
    });


  },
  methods: {
    send() {
      let socketId = this.pusher.socket

      const query = {
        socket_id: socketId,
        msg: this.draft,
        ts: Date.now(),
        user: this.me
      };

      fetch(`${AUTH_ENDPOINT}/pusher/auth/message`, {
        method: 'POST', // или 'PUT'
        body: JSON.stringify(query), // данные могут быть 'строкой' или {объектом}!
        headers: {
          'Content-Type': 'application/json'
        }
      })
          .then(function (response) {
            return response.json();
          }).then(function (data) {
        console.log(data);
      }).catch(function () {
        console.log("Booo");
      });

      const someData = {
        ts: Date.now(),
        user: this.me
      };

      fetch(`${AUTH_ENDPOINT}/pusher/auth/?${qs.stringify(someData)}`)
          .then(function (response) {
            return response.json();
          }).then(function (data) {
        console.log(data);
      }).catch(function () {
        console.log("Booo");
      });
      // // fetch(`pusher/message?${qs.stringify(query)}`);
      this.draft = '';
    }
  },
}
</script>

<style>

</style>
