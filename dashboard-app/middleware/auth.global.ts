export default defineNuxtRouteMiddleware((to, from) => {
  // Allow index page (it handles its own redirect)
  if (to.path === "/") {
    return;
  }

  if (process.client) {
    const token = localStorage.getItem("jwt_token");

    // If going to login and already authenticated, redirect to strategies
    if (to.path === "/login" && token) {
      return navigateTo("/strategies");
    }

    // If not authenticated and not going to login, redirect to login
    if (!token && to.path !== "/login") {
      return navigateTo("/login");
    }
  }
});
