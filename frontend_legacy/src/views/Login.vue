<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6 text-blue-500">NeuroVision Login</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm mb-1 text-gray-400">Username</label>
          <input v-model="username" type="text" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none text-white" required />
        </div>
        
        <div>
          <label class="block text-sm mb-1 text-gray-400">Password</label>
          <input v-model="password" type="password" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none text-white" required />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>

        <button type="submit" :disabled="loading" class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors disabled:opacity-50">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import n8n from '../services/n8n';

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
    loading.value = true;
    error.value = '';
    try {
        await n8n.login(username.value, password.value);
        router.push('/');
    } catch (e) {
        error.value = e.response?.data?.error || 'Login failed';
    } finally {
        loading.value = false;
    }
};
</script>
