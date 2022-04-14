<template>
  <div class="container">
    <b-row style="flex-wrap: nowrap; height: 90vh" class="">
      <b-col cols="4">
        <b>It`s ME</b>
        <br>
        <span> <img class="avatar" :src=me.avatar alt="">
          {{ me.name }}
          <button @click.stop.prevent="showModal"><b-icon-pencil></b-icon-pencil></button>
        </span>
        <br>
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
              <span>
                <span class="hide">
<!--                   @editScroll="myScroll"-->
                  <v-edit-message :obj="message.message" @editScroll="myScroll"/>
                <button @click.stop.prevent="deleteMessage(message.message._id)"><b-icon-trash></b-icon-trash></button>
                </span>
                <b class="my-order">{{ message.message.user.name }}</b><img class="avatar-mini"
                                                                            :src=message.message.user.avatar
                                                                            alt=""></span>
              <br>
              {{ message.message.msg }}
              <br>
              <span class="time" :id="message.message.ts">
                <timeago :datetime="message.ts" :auto-update="20"/>
                <span class="my-tooltip">{{ message.ts }}</span>
              </span>
            </li>
          </ul>
        </div>

        <b-input-group class="mt-3">
          <b-form-textarea placeholder="enter your message" v-model="draft"
                           @keydown.prevent.stop.enter="send"></b-form-textarea>
          <b-input-group-append>
            <b-button variant="info" class="sendmsg" @click="send">Send</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-modal
        id="editUser"
        :title="'EDIT USER NAME'"
        ok-title="Save"
        @ok="sendNewName">
      <form>
        <b-form-group
            label="Name"
            label-for="name"
        >
          <b-form-input
              id="name"
              v-model="newName"
          />
        </b-form-group>
      </form>
    </b-modal>

  </div>
</template>

<script>
import {faker} from '@faker-js/faker'
import Pusher from "pusher-js";
import VEditMessage from "@/components/VEditMessage";
// import qs from 'querystring';

const AUTH_ENDPOINT = 'https://cheap-deep-chat.herokuapp.com';

// const AUTH_ENDPOINT = 'http://localhost:3030';
export default {
  name: "VChat",
  components: {VEditMessage},
  data: () => ({
    me: {
      name: '',
    },
    members: [{
      name: '',
    }],
    messages: [{
      message: {
        msg: '',
        ts: '',
        user: {
          avatar: '',
          id: '',
          name: '',
        },
      },
      ts: '',
    }],
    tooltip: {},
    testMessages: '',
    draft: '',
    editedMessage: '',
    pusher: null,
    channel: null,
    presenceChannel: null,
    newName: '',
    answer: '',
    localHeight: '',
    scrollPosition: '',
  }),
  beforeCreate() {
    // this.getMessages(this.messages.length)
  },
  created() {
    this.me.id = this.$route.params.id;
    this.me.name = this.$route.params.user;
    this.me.avatar = faker.image.avatar();
    this.messages.splice(0, 1)
    // this.getMessages(this.messages.length)
  },
  mounted() {
    this.getMessages(this.messages.length)
    this.pusherConnetcion()
    this.updateByScroll()
    // this.scrollToElement()
  },
  beforeUpdate() {
  },
  updated() {
    // const element = document.getElementById('chat');
    // if (element.scrollHeight !== this.localHeight)
    //   element.scrollTop = element.scrollHeight - this.localHeight;
  },
  methods: {
    onResize() {
      const element = document.getElementById('chat');
      if (element.scrollHeight > this.localHeight)
        element.scrollTop = element.scrollHeight - this.localHeight;
      console.log(element.scrollHeight, this.localHeight)
    },

    onEditScroll() {
      const element = document.getElementById('chat');
      if (element.scrollHeight > this.localHeight)
        element.scrollTop = element.scrollHeight - (element.scrollHeight - this.localHeight);
      console.log(element.scrollHeight, this.localHeight)
    },

    myScroll(data) {
      this.scrollPosition = data;
      // setTimeout(this.onEditScroll, 50)
      console.log('resize')
    },
    scrollToElement() {
      const element = document.getElementById('chat');
      this.localHeight = element.scrollHeight;
      element.scrollTop = element.scrollHeight;
      console.log(element.scrollHeight)
    },
    pusherConnetcion() {
      Pusher.logToConsole = true;
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
        })
        // this.scrollToElement()
        setTimeout(this.scrollToElement, 5)
      });

      this.presenceChannel
          .bind('pusher:subscription_succeeded', members => {
            const list = [];
            members.each(function (member) {
              // for example:
              console.log(member)
              if (member.id !== members.me.id)
                list.push({id: member.id, name: member.info.name, avatar: faker.image.avatar()});
            });
            this.members = list;
          })
          .bind('pusher:member_added', member => {
            const isMember = this.members.findIndex(item => item.id === member.id)
            if (isMember === -1 && member.id !== this.me.id)
              this.members.push({id: member.id, name: member.info.name, avatar: faker.image.avatar()})
          })
          .bind('pusher:member_removed', member => {
            const isMember = this.members.findIndex(item => item.id === member.id)
            if (isMember !== -1)
              this.members.splice(isMember, 1)
          })
          .bind('change_name', user => {
            if (this.me.id === user.id.value.id)
              this.me.name = user.id.value.name
            else {
              const isMember = this.members.findIndex(item => item.id === user.id.value.id)
              if (isMember !== -1)
                this.members[isMember].name = user.id.value.name
            }
            // this.$set(this.me, 'name', user.id.value.name)
            this.messages.forEach(message => {
              if (message.message.user.id === user.id.value.id)
                message.message.user.name = user.id.value.name
            })
            console.log(user.id.value.name)
          })
          .bind('delete-message', message => {
            const isMessage = this.messages.findIndex(item => item.message._id === message._id)
            if (isMessage !== -1) {
              this.messages[isMessage].message.msg = `ЦЕ ПОВІДОМЛЕННЯ БУЛО ВИДАЛЕНЕ КОРИТСУВАЧЕМ ${this.messages[isMessage].message.user.name}`
              this.messages[isMessage].message.user.name = ''
              this.messages[isMessage].message.user.avatar = ''
            }
            console.log(message)
          })
          .bind('edit-message', message => {
            const isMessage = this.messages.findIndex(item => item.message._id === message.id.value._id)
            if (isMessage !== -1) {
              this.messages[isMessage].message.msg = message.id.value.msg
              const edit = document.getElementById(`${message.id.value.ts}`)
              const oldHTML = edit.innerHTML
              if (!oldHTML.toString().includes('edited'))
                edit.innerHTML = `${oldHTML} edited`
            }
            if (this.me.id === message.id.value.user.id) {
              const element = document.getElementById('chat');
              if (element.scrollHeight === element.scrollTop)
                setTimeout(this.scrollToElement, 50)
            }
            console.log(message)
          })
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

    async getMessages(number) {
      const scrollEl = document.getElementById('chat')
      // console.log(scrollEl.scrollHeight)
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
          _id: oldMessage._id,
        }
        this.messages.unshift({
          message,
          ts: new Date(oldMessage.ts).toUTCString(),
        })
        setTimeout(this.onResize, 50)

      }
      if (number === 0) {
        return setTimeout(this.scrollToElement, 5)
      }
      // console.log(scrollEl.scrollHeight)
      return scrollEl.scrollHeight
    },

    async updateByScroll() {
      const scrollEl = document.getElementById('chat')
      scrollEl.addEventListener('scroll', () => {
        let scrollPosition = scrollEl.scrollTop
        // console.log(scrollEl.scrollHeight)
        if (scrollPosition === 0) {
          this.localHeight = scrollEl.scrollHeight
          this.getMessages(this.messages.length)
          setTimeout(this.onResize, 50)
        }
        console.log(scrollEl.scrollHeight)
      })
    },

    showModal() {
      this.$bvModal.show('editUser')
    },

    async setNewName() {
      this.me.name = await this.answer.value.name
    },

    async sendNewName() {
      const query = {
        id: this.me.id,
        newName: this.newName,
      };
      let response = await fetch(`${AUTH_ENDPOINT}/pusher/auth/edituser`, {
        method: 'POST', // или 'PUT'
        // mode: 'no-cors',
        body: JSON.stringify(query), // данные могут быть 'строкой' или {объектом}!
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.answer = await response.json();
      if (typeof this.answer['err'] !== 'undefined') {
        return alert(this.answer.err)
      } else {
        await this.$router.replace({params: {id: this.me.id, user: this.answer.value.name}});
      }
    },
    async deleteMessage(id) {
      const isMessage = this.messages.findIndex(item => item.message._id === id)
      if (isMessage !== -1) {
        if (this.messages[isMessage].message.user.name === '')
          return alert('не можна видаляти видалене')
      }
      const query = {
        _id: id,
      };
      let response = await fetch(`${AUTH_ENDPOINT}/pusher/auth/delete-message`, {
        method: 'POST', // или 'PUT'
        // mode: 'no-cors',
        body: JSON.stringify(query), // данные могут быть 'строкой' или {объектом}!
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.answer = await response.json();
      if (typeof this.answer['err'] !== 'undefined') {
        return alert(this.answer.err)
      } else console.log(this.answer)
      // this.scrollToElement()
      const element = document.getElementById('chat');
      if (element.scrollHeight === element.scrollTop)
        setTimeout(this.scrollToElement, 50)
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
  position: relative;
  left: 20%;
  text-align: right;
  background-color: greenyellow;
}

.hide {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
}

.right:hover .hide {
  visibility: visible;
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

.my-tooltip {
  visibility: hidden;
  position: absolute;
  top: -13px;
  left: -100%;
  z-index: -1;
  background-color: #f2f2f2;

}

.time:hover .my-tooltip {
  visibility: visible;
  opacity: 1;
  z-index: 1;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50px;
}

.avatar-mini {
  width: 25px;
  height: 25px;
  border-radius: 25px;
  order: 2;
}

.my-order {
  order: 1;
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