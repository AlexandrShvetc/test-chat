<template>
  <div>
    <button @click.stop.prevent="showModal">
      <b-icon-pen></b-icon-pen>
    </button>
    <b-modal
        :id=obj._id
        :title="'EDIT YOUR MESSAGE'"
        ok-title="Edit"
        @ok="editMessage">
      <form>
        <b-form-group
            label="Message"
            label-for="Message"
        >
          <b-form-textarea
              id="Message"
              v-model="editedMessage"
          />
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
const AUTH_ENDPOINT = 'https://cheap-deep-chat.herokuapp.com';

// const AUTH_ENDPOINT = 'http://localhost:3030';
export default {
  name: "VEditMessage",
  data: () => ({
    editedMessage: '',
    answer: '',
  }),
  props: {
    obj: {},
  },
  methods: {
    showModal() {
      if (this.obj.user.name === '')
        return alert('не можна редагувати видалене')

      this.editedMessage = this.obj.msg
      this.$bvModal.show(`${this.obj._id}`)
    },
    async editMessage() {


      const query = {
        _id: this.obj._id,
        msg: this.editedMessage,
      };
      let response = await fetch(`${AUTH_ENDPOINT}/pusher/auth/edit-message`, {
        method: 'POST', // или 'PUT'
        // mode: 'no-cors',
        body: JSON.stringify(query), // данные могут быть 'строкой' или {объектом}!
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.answer = await response.json();
      console.log(this.answer)
    },
  },
}
</script>

<style scoped>

</style>