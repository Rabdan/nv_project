<template>
    <!-- Safelist dynamic UButton colors so Tailwind includes them (keep these commented examples) -->
    <!-- <UButton color="yellow" /> -->
    <!-- <UButton color="gray" /> -->
    <!-- <UButton color="blue" /> -->
    <!-- <UButton color="pink" /> -->
    <!-- <UButton color="purple" /> -->
    <!-- <UButton color="green" /> -->

    <div class="space-y-6">
        <!-- Month selector + Theme block (month select removed; only prev/next navigation remains) -->
        <section class="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-white">
                        Monthly Strategy
                    </h2>
                    <p class="text-sm text-gray-400">
                        Browse months with arrows and edit the strategy theme
                        below
                    </p>
                </div>
                <div class="flex items-center gap-3 w-full">
                    <UButton
                        icon="i-heroicons-chevron-left"
                        @click="prevMonth"
                        :disabled="!canGoPrev"
                        size="sm"
                        class="bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                    />
                    <div
                        class="px-3 py-2 bg-gray-900 rounded text-white font-medium"
                    >
                        {{ currentMonthLabel }}
                    </div>

                    <UButton
                        icon="i-heroicons-chevron-right"
                        @click="nextMonth"
                        :disabled="!canGoNext"
                        size="sm"
                        class="bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                    />

                    <!-- Save button (posts to /strategy) -->
                    <div class="ml-4">
                        <UButton
                            :loading="saving"
                            @click="saveAndReload"
                            class="bg-yellow-400 text-black hover:bg-yellow-300"
                        >
                            Save
                        </UButton>
                    </div>
                </div>
            </div>
        </section>

        <!-- Theme / Pillars / Topics row -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400">Theme</div>
                <div class="mt-2 text-sm text-gray-200">
                    <!-- Theme textarea moved here -->
                    <UTextarea
                        v-model="strategy.theme"
                        placeholder="Enter the monthly theme..."
                        rows="3"
                        class="ml-4 flex-1"
                    />
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400 mb-2">Pillars (%)</div>
                <div class="space-y-2">
                    <div
                        v-for="(value, key) in strategy.pillars"
                        :key="key"
                        class="flex items-center justify-between"
                    >
                        <div class="capitalize text-gray-300 text-sm">
                            {{ key.replace("_", " ") }}
                        </div>
                        <div class="flex items-center gap-2">
                            <UButton
                                icon="i-heroicons-minus"
                                size="xs"
                                @click="decrementPillar(key)"
                                :disabled="strategy.pillars[key] <= 0"
                                class="bg-gray-700 text-white hover:bg-gray-600 rounded"
                            />
                            <div class="w-10 text-center text-white">
                                {{ strategy.pillars[key] }}
                            </div>
                            <UButton
                                icon="i-heroicons-plus"
                                size="xs"
                                @click="incrementPillar(key)"
                                :disabled="strategy.pillars[key] >= 100"
                                class="bg-gray-700 text-white hover:bg-gray-600 rounded"
                            />
                        </div>
                    </div>
                </div>
                <div
                    class="text-xs mt-3"
                    :class="
                        pillarsSum === 100 ? 'text-green-400' : 'text-red-400'
                    "
                >
                    Total: {{ pillarsSum }}%
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400 mb-2">Topics</div>
                <div class="flex flex-wrap gap-2 mb-3">
                    <div
                        v-for="(t, i) in strategy.topics"
                        :key="i"
                        class="px-2 py-1 bg-gray-700 rounded text-xs flex items-center gap-2"
                    >
                        <span>{{ t }}</span>
                        <button
                            @click="removeTopic(i)"
                            class="text-gray-400 hover:text-red-400"
                        >
                            <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                        </button>
                    </div>
                </div>
                <div class="flex gap-2">
                    <UInput v-model="newTopic" placeholder="Add topic" />
                    <UButton
                        icon="i-heroicons-plus"
                        @click="addTopicFromInput"
                        :disabled="!newTopic.trim()"
                        class="bg-gray-700 text-white hover:bg-gray-600 rounded"
                    />
                </div>
            </div>
        </section>

        <!-- Schedules per platform row -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-sm text-white font-semibold">LinkedIn</div>
                    <UInput
                        v-model="strategy.schedule.linkedin.time"
                        type="time"
                        class="w-32"
                    />
                    <UInput
                        v-model="strategy.schedule.linkedin.timezone"
                        placeholder="Timezone"
                        class="w-36"
                    />
                </div>
                <div class="flex flex-wrap gap-2">
                    <UButton
                        v-for="day in daysOfWeek"
                        :key="'li-' + day.value"
                        size="sm"
                        :class="
                            strategy.schedule.linkedin.days.includes(day.value)
                                ? 'bg-yellow-400 text-black rounded-md'
                                : 'border border-gray-600 text-gray-200 bg-transparent rounded-md hover:bg-gray-700 hover:text-white'
                        "
                        @click="toggleDay('linkedin', day.value)"
                    >
                        {{ day.label }}
                    </UButton>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-sm text-white font-semibold">
                        Instagram
                    </div>
                    <UInput
                        v-model="strategy.schedule.instagram.time"
                        type="time"
                        class="w-32"
                    />
                    <UInput
                        v-model="strategy.schedule.instagram.timezone"
                        placeholder="Timezone"
                        class="w-36"
                    />
                </div>
                <div class="flex flex-wrap gap-2">
                    <UButton
                        v-for="day in daysOfWeek"
                        :key="'ig-' + day.value"
                        size="sm"
                        :class="
                            strategy.schedule.instagram.days.includes(day.value)
                                ? 'bg-yellow-400 text-black rounded-md'
                                : 'border border-gray-600 text-gray-200 bg-transparent rounded-md hover:bg-gray-700 hover:text-white'
                        "
                        @click="toggleDay('instagram', day.value)"
                    >
                        {{ day.label }}
                    </UButton>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-sm text-white font-semibold">Facebook</div>
                    <UInput
                        v-model="strategy.schedule.facebook.time"
                        type="time"
                        class="w-32"
                    />
                    <UInput
                        v-model="strategy.schedule.facebook.timezone"
                        placeholder="Timezone"
                        class="w-36"
                    />
                </div>
                <div class="flex flex-wrap gap-2">
                    <UButton
                        v-for="day in daysOfWeek"
                        :key="'fb-' + day.value"
                        size="sm"
                        :class="
                            strategy.schedule.facebook.days.includes(day.value)
                                ? 'bg-yellow-400 text-black rounded-md'
                                : 'border border-gray-600 text-gray-200 bg-transparent rounded-md hover:bg-gray-700 hover:text-white'
                        "
                        @click="toggleDay('facebook', day.value)"
                    >
                        {{ day.label }}
                    </UButton>
                </div>
            </div>
        </section>

        <!-- Posts table block -->
        <section class="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-white">Posts</h3>
                <div>
                    <UButton
                        v-if="posts.length === 0"
                        @click="generatePosts"
                        class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                        >Generate</UButton
                    >
                    <UButton
                        v-else
                        @click="generatePosts"
                        class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                        >Re-Generate</UButton
                    >
                    <!--UButton
                        v-else
                        to="/posts"
                        class="bg-gray-700 text-white hover:bg-gray-600 rounded"
                        >Manage Posts</UButton
                    -->
                </div>
            </div>

            <div
                v-if="posts.length === 0"
                class="text-center py-12 text-gray-500"
            >
                <p>
                    No posts yet for this month. Click Generate to create
                    content.
                </p>
            </div>

            <div v-else class="overflow-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="text-xs text-gray-400 text-left">
                            <th class="px-3 py-2">#</th>
                            <th class="px-3 py-2">Platform</th>
                            <th class="px-3 py-2">Scheduled</th>
                            <th class="px-3 py-2">Status</th>
                            <th class="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(p, idx) in posts"
                            :key="p._id"
                            class="border-t border-gray-700"
                        >
                            <td class="px-3 py-2 text-gray-300">
                                {{ idx + 1 }}
                            </td>
                            <td class="px-3 py-2 text-gray-200">
                                {{ p.platform }}
                            </td>
                            <td class="px-3 py-2 text-gray-300">
                                {{ formatDate(p.scheduledDate) }}
                            </td>
                            <td class="px-3 py-2 text-gray-300">
                                {{ p.status }}
                            </td>
                            <td class="px-3 py-2">
                                <UButton
                                    size="sm"
                                    @click="updatePostStatus(p._id, 'approved')"
                                    class="bg-yellow-400 text-black hover:bg-yellow-300 rounded mr-2"
                                    >Approve</UButton
                                >
                                <UButton
                                    size="sm"
                                    @click="previewPost(p)"
                                    class="bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white rounded"
                                    >Preview</UButton
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<script setup>
const n8n = useN8n();

const currentDate = ref(new Date());
const loadingStrategy = ref(false);
const saving = ref(false);
const generating = ref(false);
const strategy = ref({
    theme: "",
    pillars: { pillar_1: 40, pillar_2: 30, pillar_3: 30 },
    topics: [],
    schedule: {
        linkedin: { time: "", timezone: "", days: [] },
        instagram: { time: "", timezone: "", days: [] },
        facebook: { time: "", timezone: "", days: [] },
    },
    posts: [],
});

const daysOfWeek = [
    { label: "Mon", value: "Mon" },
    { label: "Tue", value: "Tue" },
    { label: "Wed", value: "Wed" },
    { label: "Thu", value: "Thu" },
    { label: "Fri", value: "Fri" },
    { label: "Sat", value: "Sat" },
    { label: "Sun", value: "Sun" },
];

const toggleDay = (platform, day) => {
    if (!strategy.value.schedule[platform].days) {
        strategy.value.schedule[platform].days = [];
    }
    const days = strategy.value.schedule[platform].days;
    const index = days.indexOf(day);
    if (index > -1) {
        days.splice(index, 1);
    } else {
        days.push(day);
    }
};

const currentMonthStr = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = String(currentDate.value.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
});

const currentMonthLabel = computed(() => {
    return currentDate.value.toLocaleString("default", {
        month: "long",
        year: "numeric",
    });
});

const monthOptions = computed(() => {
    // last 12 months
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        arr.push({
            value: val,
            label: d.toLocaleString("default", {
                month: "short",
                year: "numeric",
            }),
        });
    }
    return arr;
});

const customMonth = ref(currentMonthStr.value);

watch(customMonth, (v) => {
    // set the current month to custom selection and reload
    currentDate.value = new Date(v + "-01");
    loadStrategy();
});

const pillarsSum = computed(() => {
    if (!strategy.value?.pillars) return 0;
    return Object.values(strategy.value.pillars).reduce(
        (sum, val) => sum + (val || 0),
        0,
    );
});

const isStrategyComplete = computed(() => {
    return (
        strategy.value &&
        strategy.value.theme &&
        pillarsSum.value === 100 &&
        strategy.value.topics?.length > 0
    );
});

const posts = computed(() => strategy.value?.posts || []);

const today = new Date();
const actualCurrentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

const canGoPrev = computed(() => true);

const canGoNext = computed(() => {
    if (
        currentMonthStr.value >=
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
    ) {
        return false;
    }
    return true;
});

const loadStrategy = async () => {
    loadingStrategy.value = true;
    try {
        console.log("Fetching strategy for month:", currentMonthStr.value);
        const res = await n8n.getStrategy(currentMonthStr.value);
        strategy.value = res.data || strategy.value;
    } catch (e) {
        console.warn("Strategy not found", e);
    } finally {
        loadingStrategy.value = false;
    }
};

const saveStrategy = async () => {
    saving.value = true;
    try {
        const res = await n8n.saveStrategy(strategy.value);
        strategy.value = res.data;
    } catch (error) {
        console.error("Failed to save strategy:", error);
    } finally {
        saving.value = false;
    }
};

const saveAndReload = async () => {
    saving.value = true;
    try {
        // use POST /strategy to create/update and then reload
        await n8n.saveStrategy(strategy.value);
        await loadStrategy();
    } catch (error) {
        console.error("Failed to post strategy:", error);
    } finally {
        saving.value = false;
    }
};

const generatePosts = async () => {
    await saveStrategy();
    generating.value = true;
    try {
        await n8n.generateContent(strategy.value.month);
        await loadStrategy();
    } catch (error) {
        console.error("Failed to generate posts:", error);
    } finally {
        generating.value = false;
    }
};

const newTopic = ref("");

const incrementPillar = (key) => {
    if (strategy.value.pillars[key] < 100) {
        strategy.value.pillars[key]++;
    }
};

const decrementPillar = (key) => {
    if (strategy.value.pillars[key] > 0) {
        strategy.value.pillars[key]--;
    }
};

const addTopicFromInput = () => {
    if (newTopic.value.trim()) {
        if (!strategy.value.topics) strategy.value.topics = [];
        strategy.value.topics.push(newTopic.value.trim());
        newTopic.value = "";
    }
};

const removeTopic = (idx) => {
    strategy.value.topics.splice(idx, 1);
};

const prevMonth = () => {
    currentDate.value = new Date(
        currentDate.value.setMonth(currentDate.value.getMonth() - 1),
    );
    loadStrategy();
};

const nextMonth = () => {
    if (!canGoNext.value) return;
    currentDate.value = new Date(
        currentDate.value.setMonth(currentDate.value.getMonth() + 1),
    );
    loadStrategy();
};

const platformColor = (platform) => {
    const colors = {
        LinkedIn: "bg-blue-600 text-white",
        Instagram: "bg-pink-600 text-white",
        Facebook: "bg-blue-700 text-white",
    };
    return colors[platform] || "bg-gray-600 text-white";
};

const statusColor = (status) => {
    const colors = {
        pending: "bg-yellow-900 text-yellow-300",
        generated: "bg-blue-900 text-blue-300",
        approved: "bg-green-900 text-green-300",
        published: "bg-purple-900 text-purple-300",
    };
    return colors[status] || "bg-gray-700 text-gray-300";
};

const formatDate = (dateStr) => {
    return dateStr
        ? new Date(dateStr).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
          })
        : "—";
};

const previewPost = (post) => {
    const body = post.content || "";
    const win = window.open("", "_blank", "noopener");
    if (win) {
        win.document.write(
            '<pre style="white-space:pre-wrap;font-family:ui-sans-serif;padding:20px;background:#0b1220;color:#e6edf3;">' +
                escapeHtml(body) +
                "</pre>",
        );
        win.document.title = post.title || "Post Preview";
        win.focus();
    }
};

const escapeHtml = (unsafe) => {
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

onMounted(() => {
    loadStrategy();
});
</script>
