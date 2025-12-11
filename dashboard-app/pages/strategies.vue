<template>
    <div class="space-y-6">
        <!-- Month selector block -->
        <section class="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-white">
                        Monthly Strategy
                    </h2>
                    <p class="text-sm text-gray-400">
                        Select month for the strategy
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <UButton
                        icon="i-heroicons-chevron-left"
                        @click="prevMonth"
                        :disabled="!canGoPrev"
                        variant="ghost"
                        color="gray"
                        size="sm"
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
                        variant="ghost"
                        color="gray"
                        size="sm"
                    />
                    <USelect v-model="customMonth" size="sm" class="ml-3">
                        <option
                            v-for="m in monthOptions"
                            :key="m.value"
                            :value="m.value"
                        >
                            {{ m.label }}
                        </option>
                    </USelect>
                </div>
            </div>
        </section>

        <!-- Theme / Pillars / Topics row -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400">Theme</div>
                <UInput
                    v-model="strategy.theme"
                    placeholder="Short theme"
                    class="mt-2"
                />
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
                                variant="soft"
                                color="gray"
                                @click="decrementPillar(key)"
                                :disabled="strategy.pillars[key] <= 0"
                            />
                            <div class="w-10 text-center text-white">
                                {{ strategy.pillars[key] }}
                            </div>
                            <UButton
                                icon="i-heroicons-plus"
                                size="xs"
                                variant="soft"
                                color="gray"
                                @click="incrementPillar(key)"
                                :disabled="strategy.pillars[key] >= 100"
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
                    />
                </div>
            </div>
        </section>

        <!-- Schedules per platform row -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm text-white font-semibold">LinkedIn</div>
                    <div class="text-xs text-gray-400">
                        Time:
                        <span class="ml-1">{{
                            strategy.schedule.linkedin.time || "--:--"
                        }}</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <UButton
                        v-for="day in daysOfWeek"
                        :key="'li-' + day.value"
                        size="sm"
                        :color="
                            strategy.schedule.linkedin.days.includes(day.value)
                                ? 'yellow'
                                : 'gray'
                        "
                        :variant="
                            strategy.schedule.linkedin.days.includes(day.value)
                                ? 'solid'
                                : 'outline'
                        "
                        @click="toggleDay('linkedin', day.value)"
                        >{{ day.label }}</UButton
                    >
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm text-white font-semibold">
                        Instagram
                    </div>
                    <div class="text-xs text-gray-400">
                        Time:
                        <span class="ml-1">{{
                            strategy.schedule.instagram.time || "--:--"
                        }}</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <UButton
                        v-for="day in daysOfWeek"
                        :key="'ig-' + day.value"
                        size="sm"
                        :color="
                            strategy.schedule.instagram.days.includes(day.value)
                                ? 'yellow'
                                : 'gray'
                        "
                        :variant="
                            strategy.schedule.instagram.days.includes(day.value)
                                ? 'solid'
                                : 'outline'
                        "
                        @click="toggleDay('instagram', day.value)"
                        >{{ day.label }}</UButton
                    >
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                    <div class="text-sm text-white font-semibold">Facebook</div>
                    <div class="text-xs text-gray-400">
                        Time:
                        <span class="ml-1">{{
                            strategy.schedule.facebook.time || "--:--"
                        }}</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <UButton
                        v-for="day in daysOfWeek"
                        :key="'fb-' + day.value"
                        size="sm"
                        :color="
                            strategy.schedule.facebook.days.includes(day.value)
                                ? 'yellow'
                                : 'gray'
                        "
                        :variant="
                            strategy.schedule.facebook.days.includes(day.value)
                                ? 'solid'
                                : 'outline'
                        "
                        @click="toggleDay('facebook', day.value)"
                        >{{ day.label }}</UButton
                    >
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
                        color="yellow"
                        class="bg-yellow-400 text-black hover:bg-yellow-300"
                        >Generate</UButton
                    >
                    <UButton v-else color="gray" variant="soft" to="/posts"
                        >Manage Posts</UButton
                    >
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
                                    color="yellow"
                                    @click="updatePostStatus(p._id, 'approved')"
                                    >Approve</UButton
                                >
                                <UButton
                                    size="sm"
                                    variant="ghost"
                                    color="gray"
                                    @click="previewPost(p)"
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
        const res = await n8n.getStrategy({ month: currentMonthStr.value });
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

const generatePosts = async () => {
    if (!strategy.value._id) {
        // try to save first
        await saveStrategy();
    }
    generating.value = true;
    try {
        await n8n.generateContent(strategy.value._id);
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
