<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <UDashboardNavbar>
      <template #left>
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold text-primary-500">NeuroVision</h1>
          <div class="hidden sm:flex items-center gap-2">
            <UButton
              to="/dashboard"
              icon="i-heroicons-chart-bar"
              variant="ghost"
              color="gray"
              size="sm"
            >
              Dashboard
            </UButton>
            <UButton
              to="/settings"
              icon="i-heroicons-cog-6-tooth"
              variant="ghost"
              color="gray"
              size="sm"
            >
              Settings
            </UButton>
          </div>
        </div>
      </template>

      <template #right>
        <ClientOnly>
          <UButton
            :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
          />
        </ClientOnly>
        <UButton
          icon="i-heroicons-arrow-right-on-rectangle"
          color="gray"
          variant="ghost"
          label="Logout"
          @click="handleLogout"
        />
        <UAvatar
          alt="Admin"
          size="sm"
          class="bg-primary-500 text-white"
        />
      </template>
    </UDashboardNavbar>

    <!-- Main Content -->
    <main class="flex-1 p-4 sm:p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { logout } = useN8n()

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const handleLogout = () => {
  logout()
}
</script>
