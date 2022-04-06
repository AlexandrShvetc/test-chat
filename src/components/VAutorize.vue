<template>
  <div class="container">
    <div class="content">
      <form>
        <div class="row">
          <h2 style="text-align:center">Login</h2>
          <input type="text" v-model="email" name="email" placeholder="email" required>
          <input type="password" v-model="password" name="password" placeholder="Password" required>
          <input type="submit" class="login" value="Login" @click.stop.prevent="sendData">
        </div>
      </form>
      <div class="bottom-container">
        <!--      <div class="row">-->
        <!--        <div class="col">-->
        <router-link to="registration"><a href="#" style="color:white" class="btn">Sign up</a></router-link>
        <!--        </div>-->
        <!--      </div>-->
      </div>
    </div>
  </div>
</template>

<script>
const AUTH_ENDPOINT = 'https://cheap-deep-chat.herokuapp.com';

export default {
  name: "VAutorize",
  data: () => ({
    email: '',
    password: '',
    answer: '',
  }),
  methods: {
    async getServerAnswer(query) {
      let response = await fetch(`${AUTH_ENDPOINT}/pusher/auth/login`, {
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
      this.email = '';
      this.password = '';
      this.$router.push({name: 'chat', params: {id: this.answer.id, user: this.answer.name}});
    },

    async sendData() {
      if (this.email === '')
        return alert('ви не ввели логін')
      if (this.password === '')
        return alert('ви не ввели пароль')
      const query = {
        email: this.email,
        password: this.password,
      };
      await this.getServerAnswer(query);
      this.checkUser()
    },
  },
}
</script>

<style>
.content{
  margin: auto;
  max-width: 60%;
}
/* style the container */
.container {
  position: relative;
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px 0 30px 0;
}

/* style inputs and link buttons */
input, .btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  margin: 5px 0;
  opacity: 0.85;
  display: inline-block;
  font-size: 17px;
  line-height: 20px;
  text-decoration: none; /* remove underline from anchors */
}

input:hover, .btn:hover {
  opacity: 1;
}

/* style the submit button */
input[type=submit] {
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
}

input[type=submit]:hover {
  background-color: #45a049;
}

/* Two-column layout */
.col {
  float: left;
  width: 50%;
  margin: auto;
  padding: 0 50px;
  margin-top: 6px;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

.bottom-container {
  margin: 0 -15px;
  text-align: center;
  background-color: #666;
  border-radius: 0 0 4px 4px;
}
.login{
  border-radius: 4px 4px 0 0;
}
</style>