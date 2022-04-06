<template>
  <div class="container">
    <b-row style="flex-wrap: nowrap; height: 90vh" class="">
      <b-col cols="4">
        <b>Members list</b>
        <ul class="members">
          <li v-for="member in members" :key="member.id">
            <img class="avatar" :src=member.avatar alt=""> {{ member.name }}
          </li>
        </ul>
      </b-col>
      <b-col cols="8">
        <div id="chat" class="chat" ref="scrollChat">
          <ul id="scrollUl">
            <li class="lis" v-for="(message, index) in messages" :key="index"
                :class="{ right: message.message.user.id === me.id}">
              <b>{{ message.message.user.info.name }}</b>
              <br>
              {{ message.message.msg }}
              <br>
              <span class="time">
                <timeago :datetime="message.ts" :auto-update="20"/>
                <span class="my-tooltip">{{ message.ts }}</span>
              </span>
            </li>
          </ul>
        </div>

        <b-input-group prepend="Message" class="mt-3">
          <b-form-textarea v-model="draft" @keydown.prevent.stop.enter="send"></b-form-textarea>
          <b-input-group-append>
            <b-button variant="info" class="sendmsg" @click="send">Send</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

  </div>
</template>

<script>
import {faker} from '@faker-js/faker'
import Pusher from "pusher-js";
// import qs from 'querystring';

const AUTH_ENDPOINT = 'https://cheap-deep-chat.herokuapp.com';

export default {
  name: "VChat",
  components: {},
  data: () => ({
    me: {},
    members: [],
    messages: [],
    tooltip: {},
    testMessages: '',
    draft: '',
    pusher: null,
    channel: null,
    presenceChannel: null,
    newName: '',
  }),
  beforeCreate() {
    // this.getMessages(this.messages.length)
  },
  created() {
    this.me.id = this.$route.params.id;
    this.me.name = this.$route.params.user
    this.getMessages(this.messages.length)
  },
  mounted() {
    this.pusherConnetcion()
    this.updateByScroll()
    // this.scrollToElement()
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
      // const timestamp = new Date().toISOString();
      this.pusher = new Pusher('94db23f60a72fb315a70', {
        broadcaster: 'pusher',
        app_id: "1364833",
        secret: "bd540eabe0c92baa34b2",
        cluster: "eu",
        authEndpoint: `${AUTH_ENDPOINT}/pusher/auth`,
        auth: {
          params: {
            user_id: `${this.me.id}`,
            name: `${this.me.name}`
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
        this.messages.push({
          ...obj,
          ts: new Date(+obj.message.ts)
          // ts: new Date(obj.message.ts).toUTCString(),
        })
        // this.scrollToElement()
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
            const isMember = this.members.findIndex(item => item.id === member.id)
            if (isMember === -1)
              this.members.push({id: member.id, name: member.info.name, avatar: faker.image.avatar()})
          })
          .bind('pusher:member_removed', member => {
            const isMember = this.members.findIndex(item => item.id === member.id)
            if (isMember !== -1)
              this.members.splice(isMember, 1)
          });
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
      // this.scrollToElement()
    },

    async getMessages(number) {
      const query = {
        qtty: number
      }
      let response = await fetch(`${AUTH_ENDPOINT}/pusher/auth/messages`, {
        method: 'POST', // или 'PUT'
        body: JSON.stringify(query),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.testMessages = await response.json();
      for (let oldMessage of this.testMessages) {
        let message = {
          msg: oldMessage.msg,
          ts: oldMessage.ts,
          user: oldMessage.user,
        }
        this.messages.unshift({
          message,
          ts: new Date(oldMessage.ts).toUTCString(),
        })
      }
    },

    updateByScroll() {
      const scrollEl = document.getElementById('chat')
      scrollEl.addEventListener('scroll', () => {
        let scrollPosition = scrollEl.scrollTop
        if (scrollPosition === 0)
          this.getMessages(this.messages.length)
        // console.log(scrollEl.scrollTop)
      })
    },
  },

}
</script>

<style>
li {
  list-style-type: none;
}

.chat {
  position: relative;
}

.lis {
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

.chat ul {
  padding: 15px 10px;
}

.chat li {
  white-space: normal;
  word-wrap: break-word;
  padding: 5px 10px;
  margin-bottom: 5px;
}

.time {
  font-size: 10px;
  position: relative;
  cursor: pointer;
}
.my-tooltip{
  visibility: hidden;
  position: absolute;
  top: -13px;
  left: -100%;
  z-index: -1;
  background-color: #f2f2f2;

}
.time:hover .my-tooltip{
  visibility: visible;
  opacity: 1;
  z-index: 1;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50px;
}

.members {
  padding: 0;
}

.members li {
  padding: 5px;
  margin-bottom: 5px;
}

.sendmsg {
  margin: 0;
}
</style>