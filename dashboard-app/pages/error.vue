<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
    <div class="max-w-2xl w-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center shadow-lg">
      <div class="flex flex-col items-center gap-6">
        <!-- Illustrative 400 SVG -->
        <div class="w-48 h-48 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            class="w-full h-full"
            role="img"
            aria-labelledby="errTitle errDesc"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stop-color="#ffd54f" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#ffb74d" stop-opacity="0.95" />
              </linearGradient>
              <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000" flood-opacity="0.6"/>
              </filter>
            </defs>

            <rect x="10" y="10" width="180" height="180" rx="20" fill="#0b1220" stroke="rgba(255,255,255,0.03)" stroke-width="2" />
            <g transform="translate(0,0)" filter="url(#f1)">
              <text x="100" y="78" text-anchor="middle" font-size="58" font-weight="800" fill="url(#g1)" font-family="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial">
                400
              </text>
            </g>

            <g>
              <circle cx="62" cy="132" r="10" fill="#ffa726" opacity="0.12" />
              <circle cx="138" cy="132" r="10" fill="#ffd54f" opacity="0.12" />
            </g>
          </svg>
        </div>

        <div>
          <h1 id="errTitle" class="text-2xl font-semibold">Something went wrong</h1>
          <p id="errDesc" class="text-sm text-gray-400 mt-2">
            Bad Request (400)
          </p>
          <p v-if="displayMessage" class="mt-3 text-xs text-gray-300 max-w-prose mx-auto">
            {{ displayMessage }}
          </p>
        </div>

        <div class="flex gap-3 mt-4">
          <button
            @click="goHome"
            class="px-4 py-2 bg-yellow-400 text-black font-medium rounded hover:bg-yellow-300 disabled:opacity-60"
          >
            Go to Dashboard
          </button>

          <button
            @click="retry"
            :disabled="isRetrying"
            class="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded hover:bg-gray-600 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <svg v-if="isRetrying" class="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4"></circle>
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
            </svg>
            Retry
          </button>
        </div>

        <div v-if="showDetails" class="mt-4 text-xs text-gray-500 max-w-prose">
          <div><strong>Code:</strong> {{ code }}</div>
          <div v-if="rawResponse"><strong>Response:</strong> <pre class="whitespace-pre-wrap break-words text-[11px] bg-[rgba(255,255,255,0.02)] p-2 rounded mt-2 text-gray-300">{{ rawResponse }}</pre></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isRetrying = ref(false);

// Read optional query params: code and message/response
const code = computed(() => route.query.code || '400');
const msg = computed(() => route.query.message || route.query.msg || '');
const rawResponse = computed(() => route.query.raw || '');

// If a message was passed in a different encoding (e.g. URL-encoded), decode it safely
const displayMessage = computed(() => {
  if (!msg.value) return '';
  try {
    return decodeURIComponent(String(msg.value));
  } catch (_e) {
    return String(msg.value);
  }
});

// Optional: show details when ?debug=1 is present
const showDetails = computed(() => {
  return route.query.debug === '1' || route.query.debug === 'true';
});

const goHome = () => {
  router.push('/').catch(() => {});
};

const retry = async () => {
  try {
    isRetrying.value = true;
    // simple retry approach: reload current page or go back
    // If the caller provided a retryUrl query param, navigate there
    if (route.query.retryUrl && typeof route.query.retryUrl === 'string') {
      router.push(route.query.retryUrl).catch(() => {});
    } else {
      // otherwise reload the window to retry network call
      window.location.reload();
    }
  } finally {
    // keep the spinner for a short moment to avoid flicker
    setTimeout(() => {
      isRetrying.value = false;
    }, 600);
  }
};
</script>

<style scoped>
/* keep styles concise; tailwind classes used for layout */
</style>
