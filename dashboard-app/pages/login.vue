<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-900">
        <div
            class="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-md"
        >
            <h2 class="text-2xl font-bold text-center mb-4 text-yellow-400">
                NeuroVision
            </h2>
            <p class="text-center text-sm text-gray-400 mb-6">
                Sign in to your dashboard
            </p>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block text-sm mb-1 text-gray-400"
                        >Username</label
                    >
                    <UInput
                        v-model="username"
                        type="text"
                        placeholder="Username"
                        class="w-full"
                    />
                </div>

                <div>
                    <label class="block text-sm mb-1 text-gray-400"
                        >Password</label
                    >
                    <UInput
                        v-model="password"
                        type="password"
                        placeholder="Password"
                        class="w-full"
                    />
                </div>

                <div v-if="error" class="text-red-500 text-sm text-center">
                    {{ error }}
                </div>

                <div class="flex items-center justify-between">
                    <label
                        class="inline-flex items-center text-xs text-gray-400"
                    >
                        <input
                            type="checkbox"
                            v-model="remember"
                            class="mr-2"
                        />
                        Remember me
                    </label>
                    <NuxtLink
                        to="/forgot"
                        class="text-xs text-yellow-400 hover:underline"
                        >Forgot?</NuxtLink
                    >
                </div>

                <UButton
                    type="submit"
                    :loading="loading"
                    color="yellow"
                    class="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                    {{ loading ? "Signing in..." : "Sign in" }}
                </UButton>
            </form>
        </div>
    </div>
</template>

<script setup>
definePageMeta({ layout: false });

const n8n = useN8n();
const router = useRouter();
const username = ref("admin");
const password = ref("admin123");
const remember = ref(false);
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
    loading.value = true;
    error.value = "";
    try {
        await n8n.login(username.value, password.value);
        // After login, navigate to dashboard (uses default layout with sidebar)
        await router.push("/strategies");
    } catch (e) {
        error.value = e?.response?.data?.error || "Login failed";
    } finally {
        loading.value = false;
    }
};
</script>
