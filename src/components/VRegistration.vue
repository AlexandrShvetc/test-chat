<template>
  <div class="content">
    <form>
      <div class="container">
        <h1>Register</h1>
        <p>Please fill in this form to create an account.</p>
        <hr>

        <label for="nick-name"><b>Nick Name</b></label>
        <input v-model="nickName" id="nick-name" type="text" placeholder="Enter Name" name="nick-name" required>

        <label for="email"><b>Email</b></label>
        <input v-model="email" id="email" type="text" placeholder="Enter Email" name="email" required>

        <label for="psw"><b>Password</b></label>
        <input v-model="password" id="psw" type="password" placeholder="Enter Password" name="psw" required>

        <label for="psw-repeat"><b>Repeat Password</b></label>
        <input v-model="passwordRepeat" id="psw-repeat" type="password" placeholder="Repeat Password" name="psw-repeat"
               required>
        <hr>
        <p>By creating an account you agree to our <a href="#">Terms & Privacy</a>.</p>

        <button type="submit" class="registerbtn" @click.stop.prevent="sendData">Register</button>
      </div>

      <div class="container ">
        <div class="signin">
          <p>Already have an account?
            <router-link to="/"><a href="#">Sign in</a></router-link>
            .
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import {faker} from '@faker-js/faker'

const AUTH_ENDPOINT = 'https://cheap-deep-chat.herokuapp.com';

// const AUTH_ENDPOINT = 'http://localhost:3030';

export default {
  name: "VRegistration",
  data: () => ({
    id: '',
    nickName: '',
    email: '',
    password: '',
    passwordRepeat: '',
    answer: '',
  }),
  mounted() {
  },
  computed: {},
  methods: {
    async getServerAnswer(query) {
      let response = await fetch(`${AUTH_ENDPOINT}/pusher/auth/signing`, {
        method: 'POST', // или 'PUT'
        // mode: 'no-cors',
        body: JSON.stringify(query), // данные могут быть 'строкой' или {объектом}!
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.answer = await response.json();
    },
    checkUser() {
      if (typeof this.answer['err'] !== 'undefined') {
        return alert(this.answer.err)
      }
      this.nickName = '';
      this.email = '';
      this.password = '';
      this.passwordRepeat = '';
      this.$router.push({name: 'chat', params: {id: this.answer.id, user: this.answer.name}});
    },
    async sendData() {
      if (this.nickName === '')
        return alert('ви не ввели імя')
      if (this.email === '')
        return alert('ви не ввели пошту')
      if (this.password === '')
        return alert('ви не ввели пароль')
      if (this.passwordRepeat === '')
        return alert('ви не поторили парооль')
      if (this.passwordRepeat !== this.password) {
        this.passwordRepeat = ''
        return alert('пароль не співпадає')
      }
      const query = {
        id: faker.datatype.uuid(),
        name: this.nickName,
        email: this.email,
        password: this.password,
      };

      await this.getServerAnswer(query)

      // setTimeout(this.checkUser, 2000)
      this.checkUser()
    },
  },
}
</script>

<style>
.content {
  max-width: 80%;
  margin: auto;
}

/* Add padding to containers */
.container {
  padding: 16px;
  background-color: white;
}

/* Full-width input fields */
input[type=text], input[type=password] {
  width: 100%;
  padding: 15px;
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}

/* Overwrite default styles of hr */
hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Set a style for the submit button */
.registerbtn {
  justify-content: center;
  display: flex;
  max-width: 60%;
  background-color: #4CAF50;
  color: white;
  padding: 16px 20px;
  margin: auto;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  opacity: 0.9;
}

.registerbtn:hover {
  opacity: 1;
}

/* Add a blue text color to links */
a {
  color: dodgerblue;
}

/* Set a grey background color and center the text of the "sign in" section */
.signin {
  background-color: #f1f1f1;
  text-align: center;
  padding: 0 15px;
  border-radius: 4px;
}
.signin p{
  padding: 15px 0;
}
</style>