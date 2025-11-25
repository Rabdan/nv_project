<script setup>
// Redirect to dashboard if authenticated, otherwise to login
if (process.client) {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    navigateTo('/dashboard');
  } else {
    navigateTo('/login');
  }
}
</script>

<template>
  <div></div>
</template>
