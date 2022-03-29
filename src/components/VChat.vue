<template>
  <div class="container">
    <b-row style="flex-wrap: nowrap; height: 100vh" class="pt-3">
      <b-col cols="4">
        <b>Members list</b>
        <ul class="members">
          <li v-for="member in members" :key="member.id">
            <img class="avatar" :src=member.avatar alt=""> {{ member.name }}</li>
        </ul>
      </b-col>
      <b-col cols="8">
        <div id="chat" class="chat" ref="scrollChat">
          <ul id="scrollUl">
            <li class="lis" v-for="(message, index) in messages" :key="index" :class="{ right: message.message.user.id === me.id}">
              <b>{{ message.message.user.info.name }}</b>
              <br>
              {{ message.message.msg }}
              <br>
              <span class="time">{{message.ts }}</span>
            </li>
          </ul>
        </div>

        <b-input-group prepend="Message" class="mt-3">
          <b-form-textarea v-model="draft" @keydown.prevent.stop.enter="send"></b-form-textarea>
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
import {faker} from '@faker-js/faker'
import Pusher from "pusher-js";
// import qs from 'querystring';
import uniq from 'lodash.uniq';
const AUTH_ENDPOINT = 'https://cheap-deep-chat.herokuapp.com';

export default {
  name: "VChat",
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
    // this.scrollToElement();
  },
  updated() {
    this.scrollToElement()
  },
  methods: {
    scrollToElement() {
      const element = document.getElementById('chat');
      element.scrollTop = element.scrollHeight;
    },
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

      this.presenceChannel = this.pusher.subscribe('presence-chat');
      this.presenceChannel.bind('message', obj => {
        console.log(obj)
        // const newDate = new Date(+obj.ts).toDateString()
        this.messages.push({
          ...obj,
          ts: new Date(obj.message.ts).toUTCString(),
        })
      });

      this.presenceChannel
          .bind('pusher:subscription_succeeded', members => {
            const list = [];
            members.each(function (member) {
              // for example:
              console.log(member)
              list.push({id: member.id, name: member.info.name, avatar: faker.image.avatar()});
            });
            this.members = list;
            this.me = members.me;
          })
          .bind('pusher:member_added', member => {
            this.members = uniq(this.members.concat({id: member.id, name: member.info.name}));
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

}
</script>

<style>
li {
  list-style-type: none;
}
.chat{
  position: relative;
}

.lis{
  position: relative;
  max-width: 80%;
  width: auto;
  min-width: 0;
  background-color: lavender;
  border-radius: 10px;
}

.right {
  left: 20%;
  text-align: right;
  background-color: greenyellow;

}

.chat {
  height: 75%;
  white-space: nowrap;
  overflow-y: auto;
  background-color: aliceblue;
}
.chat ul{
  padding: 15px 10px;
}

.chat li {
  white-space: normal;
  word-wrap: break-word;
  padding: 5px 10px;
  margin-bottom: 5px;
}
.time{
  font-size: 10px;
}
.avatar{
  width: 50px;
  height: 50px;
  border-radius: 50px;
}
.members{
  padding: 0;
}
.members li{
  padding: 5px;
  margin-bottom: 5px;
}
</style>