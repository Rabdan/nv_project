<template>
    <div class="min-h-screen flex">
        <!-- Desktop Sidebar (reworked layout & structure) -->
        <aside
            class="hidden sm:flex w-72 flex-col sidebar text-gray-100 border-r border-gray-800"
        >
            <div
                class="px-4 py-6 flex items-center gap-3 border-b border-gray-800"
            >
                <h1 class="text-2xl font-bold" style="color: var(--nv-accent)">
                    CIVI NeuroVision
                </h1>
            </div>

            <nav class="flex-1 px-2 py-4 space-y-1">
                <!-- Dashboard / Analytics -->
                <div
                    :class="[
                        'relative rounded-md overflow-hidden',
                        isActive('/analysis') ? 'bg-gray-800' : '',
                    ]"
                >
                    <div
                        v-if="isActive('/analysis')"
                        class="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        :style="{
                            background:
                                'linear-gradient(180deg, var(--nv-accent), var(--nv-accent-600))',
                        }"
                    ></div>
                    <UButton
                        to="/analysis"
                        icon="i-heroicons-chart-pie"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200 pl-4"
                    >
                        Dashboard
                    </UButton>
                </div>

                <!-- Strategy -->
                <div
                    :class="[
                        'relative rounded-md overflow-hidden',
                        isActive('/strategies') ? 'bg-gray-800' : '',
                    ]"
                >
                    <div
                        v-if="isActive('/strategies')"
                        class="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        :style="{
                            background:
                                'linear-gradient(180deg, var(--nv-accent), var(--nv-accent-600))',
                        }"
                    ></div>
                    <UButton
                        to="/strategies"
                        icon="i-heroicons-chart-bar"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200 pl-4"
                    >
                        Strategy
                    </UButton>
                </div>

                <!-- Content / Approval -->
                <div
                    :class="[
                        'relative rounded-md overflow-hidden',
                        isActive('/posts') ? 'bg-gray-800' : '',
                    ]"
                >
                    <div
                        v-if="isActive('/posts')"
                        class="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        :style="{
                            background:
                                'linear-gradient(180deg, var(--nv-accent), var(--nv-accent-600))',
                        }"
                    ></div>
                    <UButton
                        to="/posts"
                        icon="i-heroicons-document-text"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200 pl-4"
                    >
                        Content & Approval
                    </UButton>
                </div>

                <!-- Integrations & Settings -->
                <div
                    :class="[
                        'relative rounded-md overflow-hidden',
                        isActive('/integrations') || isActive('/settings')
                            ? 'bg-gray-800'
                            : '',
                    ]"
                >
                    <div
                        v-if="
                            isActive('/integrations') || isActive('/settings')
                        "
                        class="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        :style="{
                            background:
                                'linear-gradient(180deg, var(--nv-accent), var(--nv-accent-600))',
                        }"
                    ></div>
                    <UButton
                        to="/integrations"
                        icon="i-heroicons-puzzle"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200 pl-4"
                    >
                        Integrations & Settings
                    </UButton>
                </div>
            </nav>

            <div class="px-4 py-4 border-t border-gray-800">
                <UButton
                    icon="i-heroicons-arrow-right-on-rectangle"
                    class="w-full justify-center btn-primary"
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
                            class="bg-transparent text-gray-300 hover:bg-gray-700 rounded-md"
                            @click="toggleMobileSidebar"
                        />
                        <h1
                            class="text-lg font-bold"
                            style="color: var(--nv-accent)"
                        >
                            CIVI NeuroVision
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
                            class="bg-transparent rounded-md"
                            :style="{ color: 'var(--nv-accent)' }"
                            aria-label="Theme"
                            @click="isDark = !isDark"
                        />
                    </ClientOnly>

                    <UAvatar
                        alt="Admin"
                        size="sm"
                        class=""
                        :style="{
                            background: 'var(--nv-accent)',
                            color: 'black',
                        }"
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
                class="fixed z-50 inset-y-0 left-0 w-72 bg-[#121212] p-4 sm:hidden"
            >
                <nav class="space-y-2">
                    <UButton
                        to="/analysis"
                        icon="i-heroicons-chart-pie"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200"
                        @click="mobileSidebarOpen = false"
                    >
                        Dashboard
                    </UButton>

                    <UButton
                        to="/strategies"
                        icon="i-heroicons-chart-bar"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200"
                        @click="mobileSidebarOpen = false"
                    >
                        Strategy
                    </UButton>

                    <UButton
                        to="/posts"
                        icon="i-heroicons-document-text"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200"
                        @click="mobileSidebarOpen = false"
                    >
                        Content & Approval
                    </UButton>

                    <UButton
                        to="/integrations"
                        icon="i-heroicons-puzzle"
                        class="w-full justify-start text-left bg-transparent hover:bg-gray-800 text-gray-200"
                        @click="mobileSidebarOpen = false"
                    >
                        Integrations & Settings
                    </UButton>
                </nav>
            </aside>
        </transition>
    </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const { logout } = useN8n();
const route = useRoute();

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

/**
 * Simple helper to determine the active route for sidebar highlighting.
 * Uses startsWith so child routes still activate their parent menu.
 */
const isActive = (path: string) => {
    try {
        return !!route.path && route.path.startsWith(path);
    } catch (e) {
        return false;
    }
};

const handleLogout = () => {
    logout();
};

// Mobile sidebar state
const mobileSidebarOpen = ref(false);
const toggleMobileSidebar = () => {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
};
</script>
