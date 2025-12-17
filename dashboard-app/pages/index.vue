<script setup>
// Use router.push for navigation (more reliable than global helper here)
const router = useRouter();

// Redirect to strategies if authenticated, otherwise to login
if (process.client) {
    const token = localStorage.getItem("jwt_token");
    if (token) {
        router.push("/strategies").catch(() => {});
    } else {
        router.push("/login").catch(() => {});
    }
}
</script>

<template>
    <div></div>
</template>
