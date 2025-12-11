<template>
    <div
        class="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700"
    >
        <h3 class="text-xl font-bold mb-6 text-white">Settings</h3>

        <div class="space-y-6">
            <!-- API Keys -->
            <div>
                <h4
                    class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4"
                >
                    Social Media Keys
                </h4>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm mb-1 text-gray-300"
                            >OpenAI API Key</label
                        >
                        <input
                            type="password"
                            class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none text-white"
                            placeholder="sk-..."
                        />
                    </div>
                    <div>
                        <label class="block text-sm mb-1 text-gray-300"
                            >LinkedIn Access Token</label
                        >
                        <input
                            type="password"
                            class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none text-white"
                        />
                    </div>
                    <div>
                        <label class="block text-sm mb-1 text-gray-300"
                            >Instagram Graph API Key</label
                        >
                        <input
                            type="password"
                            class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none text-white"
                        />
                    </div>
                </div>
            </div>

            <!-- Schedule -->
            <div>
                <h4
                    class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4"
                >
                    Default Schedule
                </h4>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm mb-1 text-gray-300"
                            >Posts per Week</label
                        >
                        <input
                            type="number"
                            class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none text-white"
                            value="3"
                        />
                    </div>
                    <div>
                        <label class="block text-sm mb-1 text-gray-300"
                            >Publish Time</label
                        >
                        <input
                            type="time"
                            class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none text-white"
                            value="10:00"
                        />
                    </div>
                </div>
            </div>

            <div class="pt-4 border-t border-gray-700">
                <button
                    class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors text-white"
                >
                    Save Settings
                </button>
            </div>

            <!-- Users management -->
            <div class="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h4
                    class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4"
                >
                    Users
                </h4>
                <div class="space-y-3 max-w-md">
                    <div>
                        <label class="block text-sm mb-1 text-gray-300"
                            >Username</label
                        >
                        <UInput
                            v-model="newUser.username"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label class="block text-sm mb-1 text-gray-300"
                            >Password</label
                        >
                        <UInput
                            v-model="newUser.password"
                            type="password"
                            placeholder="password"
                        />
                    </div>
                    <div class="flex items-center gap-2">
                        <UButton
                            color="yellow"
                            @click="addUser"
                            :loading="adding"
                            >Add user</UButton
                        >
                        <div v-if="addMessage" class="text-sm text-gray-300">
                            {{ addMessage }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { registerUser } = useN8n();
const newUser = reactive({ username: "", password: "" });
const adding = ref(false);
const addMessage = ref("");

const addUser = async () => {
    if (!newUser.username || !newUser.password) {
        addMessage.value = "Username and password required";
        return;
    }
    adding.value = true;
    addMessage.value = "";
    try {
        const res = await registerUser(newUser.username, newUser.password);
        // Expecting backend: { message: "User created successfully" }
        addMessage.value = res?.message || "User created successfully";
        newUser.username = "";
        newUser.password = "";
    } catch (e) {
        addMessage.value =
            e?.response?.data?.message || e.message || "Failed to create user";
    } finally {
        adding.value = false;
    }
};
</script>
