<template>
  <div id="app" class="container">
    <b-row style="height: 100vh; max-height: 100vh" class="pt-3">
      <b-col cols="4">
        <ul>
          <li v-for="member in members" :key="member.id">{{ member.name }}</li>
        </ul>
      </b-col>
      <b-col cols="8" class="chat">
        <ul ref="scrollChat" id="chat"  style="
    height: 75%;
    max-height: 75%;
    background-color: aliceblue;">
          <li v-for="(message, index) in messages" :key="index" :class="{ right: message.message.user.id === me.id}">
            <b>{{ message.message.user.info.name }}</b>
            <br>
            {{ message.message.msg }}
          </li>
        </ul>

        <b-input-group prepend="Message" class="mt-3">
          <b-form-input v-model="draft" @keydown.prevent.stop.enter="send"></b-form-input>
          <b-input-group-append>
            <b-button variant="info" @click="send">Button</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>


    <b-modal
        id="nameAddModal"
        :title="'ADD YOUR NICK NAME'"
        ok-title="Save"
        @ok="addName">
      <form>
        <b-form-group label="Name" label-for="Name">
          <b-form-input id="Name" v-model="newName"/>
        </b-form-group>
      </form>
    </b-modal>


  </div>
</template>

<script>
import Pusher from "pusher-js";
// import qs from 'querystring';
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
    newName: '',
  }),
  mounted() {
    this.$bvModal.show('nameAddModal')
    const element = document.getElementById('chat');
    element.scrollTop = element.scrollHeight;
    this.scrollToElement();
  },
  methods: {
    pusherConnetcion() {
      Pusher.logToConsole = true;
      const timestamp = new Date().toISOString();
      this.pusher = new Pusher('94db23f60a72fb315a70', {
        broadcaster: 'pusher',
        app_id: "1364833",
        secret: "bd540eabe0c92baa34b2",
        cluster: "eu",
        authEndpoint: `${AUTH_ENDPOINT}/pusher/auth`,
        auth: {
          params: {
            user_id: `${this.me}-${timestamp}`,
            name: `${this.me}`
          },
        },
        // authTransport: 'jsonp'
      });

      this.pusher.connection.bind("connected", () => {
        console.log(this.pusher.connection.socket_id)
      });

      // this.channel = this.pusher.subscribe('private-document');

      this.presenceChannel = this.pusher.subscribe('presence-chat');
      this.presenceChannel.bind('message', obj => {
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
            this.me = members.me;
          })
          .bind('pusher:member_added', member => {
            this.members = uniq(this.members.concat(member.id));
          })
          .bind('pusher:member_removed', member => {
            this.members = this.members.filter(m => m !== member.id);
          });
      // this.channel.bind('pusher:subscription_succeeded', () => {
      //   // this.send('makákó');
      // });
    },
    addName() {
      this.me = this.newName
      this.pusherConnetcion()
    },
    send() {
      const query = {
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


      this.draft = '';
    },
    // sendGetParams() {
    //   const someData = {
    //     ts: Date.now(),
    //     user: this.me
    //   };
    //
    /*  fetch(`${AUTH_ENDPOINT}/pusher/auth/?${qs.stringify(someData)}`)*/
    //       .then(function (response) {
    //         return response.json();
    //       }).then(function (data) {
    //     console.log(data);
    //   }).catch(function () {
    //     console.log("Booo");
    //   });
    //   // // fetch(`pusher/message?${qs.stringify(query)}`);
    // },
  },
  scrollToElement() {
    const el = this.$refs.scrollChat;

    if (el) {
      // Use el.scrollIntoView() to instantly scroll to the element
      el.scrollIntoView({behavior: 'smooth'});
    }
  }
}
</script>

<style>
.right {
  text-align: right;
}

.chat {
  white-space: nowrap;
  overflow-y: scroll;
}
.chat li{
  white-space: normal;
}
</style>
