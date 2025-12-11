<template>
    <div class="min-h-screen flex">
        <!-- Desktop Sidebar -->
        <aside
            class="hidden sm:flex w-64 flex-col bg-gray-900 text-gray-100 border-r border-gray-800"
        >
            <div
                class="px-4 py-6 flex items-center gap-3 border-b border-gray-800"
            >
                <h1 class="text-2xl font-bold text-yellow-400">NeuroVision</h1>
            </div>

            <nav class="flex-1 px-2 py-4 space-y-1">
                <UButton
                    to="/strategies"
                    icon="i-heroicons-chart-bar"
                    variant="ghost"
                    color="gray"
                    class="w-full justify-start text-left"
                >
                    Strategies
                </UButton>

                <UButton
                    to="/posts"
                    icon="i-heroicons-document-text"
                    variant="ghost"
                    color="gray"
                    class="w-full justify-start text-left"
                >
                    Posts
                </UButton>

                <UButton
                    to="/analysis"
                    icon="i-heroicons-chart-pie"
                    variant="ghost"
                    color="gray"
                    class="w-full justify-start text-left"
                >
                    Analysis
                </UButton>

                <UButton
                    to="/settings"
                    icon="i-heroicons-cog-6-tooth"
                    variant="ghost"
                    color="gray"
                    class="w-full justify-start text-left"
                >
                    Settings
                </UButton>
            </nav>

            <div class="px-4 py-4 border-t border-gray-800">
                <UButton
                    icon="i-heroicons-arrow-right-on-rectangle"
                    variant="soft"
                    color="yellow"
                    class="w-full justify-center bg-yellow-400 text-black hover:bg-yellow-300"
                    @click="handleLogout"
                >
                    Logout
                </UButton>
            </div>
        </aside>

        <!-- Main area (navbar + page) -->
        <div class="flex-1 flex flex-col">
            <UDashboardNavbar class="bg-transparent border-b border-gray-800">
                <template #left>
                    <div class="flex items-center gap-4 sm:hidden">
                        <UButton
                            icon="i-heroicons-bars-3"
                            variant="ghost"
                            color="gray"
                            @click="toggleMobileSidebar"
                        />
                        <h1 class="text-lg font-bold text-yellow-400">
                            NeuroVision
                        </h1>
                    </div>
                </template>

                <template #right>
                    <ClientOnly>
                        <UButton
                            :icon="
                                isDark
                                    ? 'i-heroicons-moon-20-solid'
                                    : 'i-heroicons-sun-20-solid'
                            "
                            color="yellow"
                            variant="ghost"
                            aria-label="Theme"
                            @click="isDark = !isDark"
                            class="hover:bg-yellow-500/10"
                        />
                    </ClientOnly>

                    <UAvatar
                        alt="Admin"
                        size="sm"
                        class="bg-yellow-400 text-black"
                    />
                </template>
            </UDashboardNavbar>

            <main class="flex-1 p-4 sm:p-8">
                <slot />
            </main>
        </div>

        <!-- Mobile sidebar overlay -->
        <transition name="fade">
            <div
                v-if="mobileSidebarOpen"
                class="fixed inset-0 z-40 bg-black/40 sm:hidden"
                @click="mobileSidebarOpen = false"
            />
        </transition>

        <!-- Mobile sidebar -->
        <transition name="slide">
            <aside
                v-if="mobileSidebarOpen"
                class="fixed z-50 inset-y-0 left-0 w-64 bg-gray-900 p-4 sm:hidden"
            >
                <nav class="space-y-2">
                    <UButton
                        to="/strategies"
                        icon="i-heroicons-chart-bar"
                        variant="ghost"
                        color="gray"
                        class="w-full justify-start text-left"
                        @click="mobileSidebarOpen = false"
                    >
                        Strategies
                    </UButton>

                    <UButton
                        to="/posts"
                        icon="i-heroicons-document-text"
                        variant="ghost"
                        color="gray"
                        class="w-full justify-start text-left"
                        @click="mobileSidebarOpen = false"
                    >
                        Posts
                    </UButton>

                    <UButton
                        to="/settings"
                        icon="i-heroicons-cog-6-tooth"
                        variant="ghost"
                        color="gray"
                        class="w-full justify-start text-left"
                        @click="mobileSidebarOpen = false"
                    >
                        Settings
                    </UButton>
                </nav>
            </aside>
        </transition>
    </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const { logout } = useN8n();

// Ensure dark theme by default
onMounted(() => {
    // Set preference to dark if not explicitly set
    if (!colorMode.preference) {
        colorMode.preference = "dark";
    } else {
        // If preference exists but isn't dark, keep it as is; user toggle will change it
        // This line intentionally leaves existing behavior intact except defaulting when undefined
    }
});

const isDark = computed({
    get() {
        return colorMode.value === "dark";
    },
    set(val: boolean) {
        colorMode.preference = val ? "dark" : "light";
    },
});

const handleLogout = () => {
    logout();
};

// Mobile sidebar state
const mobileSidebarOpen = ref(false);
const toggleMobileSidebar = () => {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
};
</script>
