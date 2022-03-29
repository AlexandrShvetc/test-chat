<template>
  <div class="container">
    <form>
      <div class="row">
        <h2 style="text-align:center">Login</h2>
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <router-link class="btn"  to="chat"><input type="submit" value="Login"></router-link>
      </div>
    </form>
    <div class="bottom-container">
      <div class="row">
        <div class="col">
          <router-link to="registration"><a href="#" style="color:white" class="btn">Sign up</a></router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VAutorize",

}
</script>

<style>
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
  text-align: center;
  background-color: #666;
  border-radius: 0 0 4px 4px;
}
</style>