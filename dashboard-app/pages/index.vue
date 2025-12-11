<script setup>
// Redirect to strategies if authenticated, otherwise to login
if (process.client) {
    const token = localStorage.getItem("jwt_token");
    if (token) {
        navigateTo("/strategies");
    } else {
        navigateTo("/login");
    }
}
</script>

<template>
    <div></div>
</template>
