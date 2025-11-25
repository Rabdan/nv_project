<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-blue-500">NeuroVision</h1>
        <p class="text-xs text-gray-400 mt-1">Social Automation</p>
      </div>
      <nav class="flex-1 px-4 space-y-2">
        <router-link to="/" class="flex items-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/' }">
          <span class="mr-3">📊</span> Dashboard
        </router-link>
        <router-link to="/settings" class="flex items-center px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/settings' }">
          <span class="mr-3">⚙️</span> Settings
        </router-link>
      </nav>
      <div class="p-4 border-t border-gray-700">
        <div class="text-sm text-gray-500">v0.1.0</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <header class="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-8">
        <h2 class="text-xl font-semibold">{{ $route.name }}</h2>
        <div class="flex items-center space-x-4">
          <button class="p-2 rounded-full hover:bg-gray-700">
            <span class="sr-only">Notifications</span>
            🔔
          </button>
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            A
          </div>
        </div>
      </header>
      <div class="p-8">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>
