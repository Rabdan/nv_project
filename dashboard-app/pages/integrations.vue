<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <div class="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-xl w-full text-center">
      <h1 class="text-2xl font-bold text-white mb-2">Integrations</h1>
      <p class="text-sm text-gray-400 mb-4">
        This page is a placeholder. You are being redirected to Settings where integrations and API keys are managed.
      </p>
      <div class="flex items-center justify-center gap-3">
        <NuxtLink to="/settings" class="btn-primary inline-flex items-center justify-center px-4 py-2">
          Go to Settings
        </NuxtLink>
        <button
          type="button"
          @click="goToSettings"
          class="bg-transparent text-gray-200 border border-gray-600 rounded px-3 py-2 hover:bg-gray-700"
        >
          Redirect now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const router = useRouter();

/**
 * Redirect to /settings on mount. We use replace so the integrations placeholder
 * doesn't remain in history (back button behavior is nicer).
 */
onMounted(() => {
  router.replace('/settings').catch(() => {});
});

const goToSettings = () => {
  router.replace('/settings').catch(() => {});
};
</script>

<style scoped>
.btn-primary {
  background: linear-gradient(180deg, var(--nv-accent), var(--nv-accent-600));
  color: #0b0b0b;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(255,197,7,0.12);
  border: 1px solid rgba(0,0,0,0.12);
}
</style>
