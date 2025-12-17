<template>
    <div class="space-y-6">
        <!-- Month selector + Theme block -->
        <section class="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-white">
                        Monthly Strategy & Planning
                    </h2>
                    <p class="text-sm text-gray-400">
                        Select a month, edit the theme, pillars and topics — all
                        in a single panel for quick planning.
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

                    <USelect
                        v-model="customMonth"
                        :items="strategiesList"
                        placeholder="Select month"
                        value-key="month"
                        :ui="{ content: 'min-w-fit' }"
                        class="w-52"
                    >
                        <template #item-label="{ item }">
                            <div class="flex items-center gap-2">
                                <div class="text-sm">{{ item.label }}</div>
                                <div class="text-xs text-gray-400 truncate">
                                    — {{ item.theme || "No theme" }}
                                </div>
                            </div>
                        </template>
                    </USelect>

                    <UButton
                        icon="i-heroicons-chevron-right"
                        @click="nextMonth"
                        :disabled="!canGoNext"
                        size="sm"
                        class="bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                    />

                    <div class="ml-auto flex items-center gap-2">
                        <UButton
                            :loading="saving"
                            @click="saveAndReload"
                            class="bg-yellow-400 text-black hover:bg-yellow-300"
                        >
                            Save Strategy
                        </UButton>
                    </div>
                </div>
            </div>
        </section>

        <!-- Theme / Pillars / Topics row -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-4">
                <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div class="text-xs text-gray-400">Theme</div>
                    <div class="mt-2 text-sm text-gray-200">
                        <UTextarea
                            v-model="strategy.theme"
                            placeholder="Enter the monthly theme..."
                            :rows="3"
                            class="ml-4 flex-1 w-full pr-4"
                        />
                    </div>
                </div>
                <div
                    class="bg-gray-800 rounded-xl p-4 border border-gray-700 h-full"
                >
                    <div class="text-xs text-gray-400 mb-2">
                        Topics & Keywords
                    </div>

                    <div class="flex flex-wrap gap-2 mb-3">
                        <div
                            v-for="(t, i) in strategy.topics"
                            :key="i"
                            class="px-3 py-1 bg-gray-900 rounded-full text-xs flex items-center gap-2 border border-gray-700"
                        >
                            <span>{{ t }}</span>
                            <button
                                @click="removeTopic(i)"
                                class="text-gray-400 hover:text-red-400"
                            >
                                <UIcon
                                    name="i-heroicons-x-mark"
                                    class="w-3 h-3"
                                />
                            </button>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <UInput
                            v-model="newTopic"
                            placeholder="Add topic or keyword"
                        />
                        <UButton
                            icon="i-heroicons-plus"
                            @click="addTopicFromInput"
                            :disabled="!newTopic.trim()"
                            class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                        >
                            Add
                        </UButton>
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400 mb-2">Pillars</div>

                <div class="grid grid-cols-1 gap-4">
                    <div
                        v-for="(val, key) in strategy.pillars"
                        :key="key"
                        class="flex items-center"
                    >
                        <!-- Slider control replacing donut and numeric input -->
                        <div class="flex-none w-full">
                            <div class="flex items-center justify-between mb-2">
                                <div class="text-xs text-gray-300 capitalize">
                                    {{ formatPillarKey(key) }}
                                </div>
                                <div class="pillar-circle text-sm">
                                    {{ strategy.pillars[key] }}%
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                v-model.number="strategy.pillars[key]"
                                @input="
                                    onPillarChange(key, strategy.pillars[key])
                                "
                                :style="{
                                    '--range-percent':
                                        (strategy.pillars[key] || 0) + '%',
                                }"
                                class="w-full"
                            />
                        </div>
                    </div>

                    <div
                        :class="
                            pillarsSum === 100
                                ? 'text-green-400 text-xs mt-2'
                                : 'text-red-400 text-xs mt-2'
                        "
                    >
                        Total: {{ pillarsSum }}%
                    </div>
                </div>
            </div>
        </section>

        <!-- Schedules per platform (unchanged) -->
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

        <!-- Posts quick actions -->
        <section class="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-medium text-white">Posts</h3>
                    <p class="text-sm text-gray-400">
                        Manage posts for the current strategy in the dedicated
                        Posts feed.
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <UButton
                        @click="
                            () =>
                                navigateTo(
                                    `/posts?month=${strategy.month || customMonth}`,
                                )
                        "
                        class="bg-gray-700 text-white hover:bg-gray-600 rounded"
                        >Open Feed</UButton
                    >
                    <UButton
                        @click="generatePosts"
                        class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                        >Generate / Re-Generate</UButton
                    >
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";

const n8n = useN8n();
const router = useRouter();
const route = useRoute();

/**
 * Small navigate helper used in templates.
 * Uses router.push but swallows benign navigation errors (duplicate navigation).
 */
const navigateTo = (target) => {
    try {
        if (!target) return;
        if (typeof target === "string") {
            router.push(target).catch(() => {});
        } else {
            router.push(target).catch(() => {});
        }
    } catch (e) {
        // noop on navigation issues
    }
};

/**
 * formatPillarKey helper used in template to transform keys like:
 *  - "pillar_1" -> "1"
 *  - "brand_awareness" -> "Brand awareness"
 */
const formatPillarKey = (k) => {
    if (!k) return "";
    const s = String(k)
        .replace(/_/g, " ")
        .replace(/\bpillar\b/gi, "")
        .trim()
        .replace(/\s+/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
};

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

// strategies list for month selection (fetched from backend)
const strategiesList = ref([]);

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
    if (index > -1) days.splice(index, 1);
    else days.push(day);
};

const currentMonthStr = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = String(currentDate.value.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
});

const monthOptions = computed(() => {
    // fallback last 12 months (used only if strategiesList unavailable)
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

// selected month (string like "2025-07")
const customMonth = ref("");

// pillars sum helper
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

// helpers to navigate strategiesList
const currentIndex = computed(() =>
    strategiesList.value.findIndex((s) => s.month === customMonth.value),
);
const canGoPrev = computed(() => currentIndex.value > 0);
const canGoNext = computed(
    () =>
        currentIndex.value >= 0 &&
        currentIndex.value < strategiesList.value.length - 1,
);

// load available strategies from backend
const loadStrategiesList = async () => {
    try {
        const res = await n8n.getStrategies();
        const arr = (res.data || []).map((r) => ({
            month: r.month,
            label: new Date(r.month + "-01").toLocaleString("default", {
                month: "short",
                year: "numeric",
            }),
            theme: r.theme || "",
            postsCount: (r.posts || []).length || 0,
        }));
        strategiesList.value = arr;

        // if route has ?month, prioritize it
        if (route.query.month && typeof route.query.month === "string") {
            customMonth.value = String(route.query.month);
        } else if (!customMonth.value && strategiesList.value.length) {
            // default to latest (first) if not set
            customMonth.value = strategiesList.value[0].month;
        } else if (
            customMonth.value &&
            !strategiesList.value.find((s) => s.month === customMonth.value)
        ) {
            // if selected month not in list, fall back to first
            customMonth.value = strategiesList.value.length
                ? strategiesList.value[0].month
                : customMonth.value;
        }
    } catch (e) {
        console.warn("Failed to load strategies list", e);
        strategiesList.value = [];
        if (!customMonth.value) customMonth.value = currentMonthStr.value;
    }
};

// load strategy data for currently selected month
const loadStrategy = async () => {
    loadingStrategy.value = true;
    try {
        const month = customMonth.value || currentMonthStr.value;
        const res = await n8n.getStrategy({ month });
        strategy.value = res.data || strategy.value;
        // ensure strategy has pillars structure
        if (!strategy.value.pillars)
            strategy.value.pillars = {
                pillar_1: 40,
                pillar_2: 30,
                pillar_3: 30,
            };
    } catch (e) {
        console.warn("Strategy not found", e);
    } finally {
        loadingStrategy.value = false;
    }
};

// save helpers
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
        // ensure strategy.month matches selected month
        strategy.value.month = customMonth.value || strategy.value.month;
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
        const month = customMonth.value || strategy.value.month;
        await n8n.generateContent(month);
        await loadStrategy();
    } catch (error) {
        console.error("Failed to generate posts:", error);
    } finally {
        generating.value = false;
    }
};

// normalization algorithm (unchanged logic)
const normalizePillars = (changedKey) => {
    const keys = Object.keys(strategy.value.pillars);
    let total = keys.reduce((s, k) => s + (strategy.value.pillars[k] || 0), 0);

    if (total === 100) return;

    if (total === 0) {
        const per = Math.floor(100 / keys.length);
        keys.forEach((k) => (strategy.value.pillars[k] = per));
        strategy.value.pillars[keys[0]] += 100 - per * keys.length;
        return;
    }

    const diff = total - 100;
    const others = keys.filter((k) => k !== changedKey);
    const sumOthers = others.reduce(
        (s, k) => s + (strategy.value.pillars[k] || 0),
        0,
    );

    if (sumOthers === 0 && others.length > 0) {
        const per = Math.round(diff / others.length);
        others.forEach((k) => {
            strategy.value.pillars[k] = Math.max(
                0,
                Math.min(100, (strategy.value.pillars[k] || 0) - per),
            );
        });
    } else {
        others.forEach((k) => {
            const cur = strategy.value.pillars[k] || 0;
            const change = Math.round((cur / Math.max(1, sumOthers)) * diff);
            strategy.value.pillars[k] = Math.max(
                0,
                Math.min(100, cur - change),
            );
        });
    }

    const newTotal = keys.reduce(
        (s, k) => s + (strategy.value.pillars[k] || 0),
        0,
    );
    if (newTotal !== 100) {
        const delta = 100 - newTotal;
        strategy.value.pillars[changedKey] = Math.max(
            0,
            Math.min(100, (strategy.value.pillars[changedKey] || 0) + delta),
        );
    }
};

// when a slider changes
const onPillarChange = (key, value) => {
    strategy.value.pillars[key] = Math.max(
        0,
        Math.min(100, Number(value) || 0),
    );
    normalizePillars(key);
};

const newTopic = ref("");

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

// navigate months via strategiesList
const prevMonth = () => {
    if (!strategiesList.value.length) return;
    const idx = currentIndex.value;
    if (idx > 0) customMonth.value = strategiesList.value[idx - 1].month;
};

const nextMonth = () => {
    if (!strategiesList.value.length) return;
    const idx = currentIndex.value;
    if (idx >= 0 && idx < strategiesList.value.length - 1)
        customMonth.value = strategiesList.value[idx + 1].month;
};

// small helpers for posts preview and colors (unchanged)
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

// react to manual month changes: load strategy and update URL
watch(
    () => customMonth.value,
    (v) => {
        if (!v) return;
        // update query param and load strategy
        router.replace({ query: { ...route.query, month: v } }).catch(() => {});
        loadStrategy();
    },
);

onMounted(() => {
    // load available strategies then load current strategy
    loadStrategiesList().then(() => {
        // if customMonth still empty, ensure we have a sensible default
        if (!customMonth.value) {
            customMonth.value = strategiesList.value.length
                ? strategiesList.value[0].month
                : currentMonthStr.value;
        }
        loadStrategy();
    });
});
</script>

<style scoped>
/* Reuse pillar-circle styling from global CSS; fallback here if needed */
.pillar-circle {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.02),
        rgba(0, 0, 0, 0.18)
    );
    border: 1px solid rgba(255, 213, 79, 0.08);
    color: var(--nv-accent);
    font-weight: 800;
}

/* Make range inputs look polished */
input[type="range"] {
    -webkit-appearance: none;
    height: 8px;
    background: linear-gradient(
        90deg,
        var(--nv-accent) 0%,
        var(--nv-accent) var(--range-percent, 50%),
        rgba(255, 255, 255, 0.04) var(--range-percent, 50%),
        rgba(255, 255, 255, 0.04) 100%
    );
    border-radius: 999px;
    outline: none;
}
input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid var(--nv-accent);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
    cursor: pointer;
}
</style>
