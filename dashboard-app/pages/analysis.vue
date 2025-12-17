<template>
    <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-white">Analysis</h1>
                <p class="text-sm text-gray-400">
                    Key metrics, trends and AI insights for the selected period
                </p>
            </div>

            <div class="flex items-center gap-3">
                <USelect v-model="period" size="sm" class="w-40">
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                </USelect>
                <UButton
                    color="yellow"
                    size="sm"
                    @click="loadAnalytics"
                    :loading="loading"
                    class="bg-yellow-400 text-black hover:bg-yellow-300"
                >
                    Refresh
                </UButton>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400">
                    Total reach (last {{ period }} days)
                </div>
                <div class="mt-2 flex items-end justify-between">
                    <div>
                        <div class="text-2xl font-semibold text-white">
                            {{ formatted(totalReach) }}
                        </div>
                        <div class="text-xs text-gray-400">
                            Sum of impressions / reach
                        </div>
                    </div>
                    <div class="text-sm text-green-400 font-semibold">
                        {{ deltaReach }}
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400">Average engagement rate</div>
                <div class="mt-2 flex items-end justify-between">
                    <div>
                        <div class="text-2xl font-semibold text-white">
                            {{ avgEngagementRateDisplay }}
                        </div>
                        <div class="text-xs text-gray-400">
                            Engagements / reach
                        </div>
                    </div>
                    <div class="text-sm text-green-400 font-semibold">
                        {{ deltaEngagement }}
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400">Follower growth</div>
                <div class="mt-2 flex items-end justify-between">
                    <div>
                        <div class="text-2xl font-semibold text-white">
                            {{ formatted(followerGrowth) }}
                        </div>
                        <div class="text-xs text-gray-400">
                            Net change in followers
                        </div>
                    </div>
                    <div class="text-sm text-green-400 font-semibold">
                        {{ followerGrowthPct }}
                    </div>
                </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div class="text-xs text-gray-400">Top performing platform</div>
                <div class="mt-2">
                    <div class="text-lg font-semibold text-white">
                        {{ topPlatform || "—" }}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        By engagement rate
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts area: left wide, right side AI Insights -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
                <!-- Engagement rate over time + controls -->
                <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h3 class="text-sm font-semibold text-white">
                                Engagement rate over time
                            </h3>
                            <p class="text-xs text-gray-400">
                                Period: last {{ period }} days
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <UButton
                                size="sm"
                                variant="soft"
                                color="gray"
                                @click="setPeriod(30)"
                                :class="
                                    period === '30'
                                        ? 'bg-yellow-400 text-black'
                                        : ''
                                "
                                >30d</UButton
                            >
                            <UButton
                                size="sm"
                                variant="soft"
                                color="gray"
                                @click="setPeriod(90)"
                                :class="
                                    period === '90'
                                        ? 'bg-yellow-400 text-black'
                                        : ''
                                "
                                >90d</UButton
                            >
                        </div>
                    </div>

                    <!-- Line chart placeholder -->
                    <div
                        class="h-56 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center"
                    >
                        <div v-if="lineData.length === 0" class="text-gray-500">
                            No engagement data available
                        </div>
                        <svg
                            v-else
                            class="w-full h-full p-4"
                            viewBox="0 0 100 40"
                            preserveAspectRatio="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <!-- simple area sparkline -->
                            <polyline
                                :points="linePoints"
                                fill="none"
                                stroke="#FBBF24"
                                stroke-width="0.8"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                            />
                            <polyline
                                :points="linePointsArea"
                                fill="rgba(251,191,36,0.08)"
                                stroke="none"
                            />
                        </svg>
                    </div>
                </div>

                <!-- Bar chart + heatmap row -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        class="bg-gray-800 rounded-xl p-4 border border-gray-700"
                    >
                        <h4 class="text-sm font-semibold text-white mb-2">
                            Performance by content pillar
                        </h4>
                        <div
                            class="h-44 bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center"
                        >
                            <div
                                v-if="barData.length === 0"
                                class="text-gray-500"
                            >
                                No pillar data
                            </div>
                            <div v-else class="w-full p-3 flex items-end gap-3">
                                <div
                                    v-for="(v, idx) in barData"
                                    :key="idx"
                                    class="flex-1 flex flex-col items-center"
                                >
                                    <div
                                        class="w-full bg-yellow-400"
                                        :style="{
                                            height:
                                                Math.max(
                                                    6,
                                                    (v.value / maxBarValue) *
                                                        100,
                                                ) + '%',
                                        }"
                                    ></div>
                                    <div
                                        class="text-xs text-gray-300 mt-2 truncate"
                                    >
                                        {{ v.label }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="bg-gray-800 rounded-xl p-4 border border-gray-700"
                    >
                        <h4 class="text-sm font-semibold text-white mb-2">
                            Best posting times (heatmap)
                        </h4>
                        <div
                            class="h-44 bg-gray-900 rounded-lg border border-gray-800 p-3 overflow-auto"
                        >
                            <div
                                v-if="heatmap.length === 0"
                                class="text-gray-500"
                            >
                                No heatmap data
                            </div>
                            <div v-else class="grid grid-cols-8 gap-1 text-xs">
                                <div class="text-gray-400 col-span-1">
                                    Day/Hour
                                </div>
                                <div
                                    v-for="h in heatmapHours"
                                    :key="h"
                                    class="text-gray-400 text-center"
                                >
                                    {{ h }}
                                </div>

                                <template v-for="(row, rIdx) in heatmap">
                                    <div class="text-gray-300">
                                        {{ row.day }}
                                    </div>
                                    <div
                                        v-for="(cell, cIdx) in row.values"
                                        :key="cIdx"
                                        class="h-6 rounded text-center text-xs"
                                        :style="{ background: heatColor(cell) }"
                                    >
                                        <div class="text-black/80 px-1">
                                            {{ cell }}
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Data table -->
                <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-semibold text-white">
                            Top 10 posts (by engagement)
                        </h4>
                        <div class="text-xs text-gray-400">
                            Sorted by engagement rate
                        </div>
                    </div>

                    <div class="overflow-auto">
                        <table class="w-full text-left text-sm">
                            <thead
                                class="text-xs text-gray-400 border-b border-gray-700"
                            >
                                <tr>
                                    <th class="py-2 px-3">#</th>
                                    <th class="py-2 px-3">Post</th>
                                    <th class="py-2 px-3">Platform</th>
                                    <th class="py-2 px-3">Reach</th>
                                    <th class="py-2 px-3">Engagements</th>
                                    <th class="py-2 px-3">Eng. rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="topPosts.length === 0">
                                    <td
                                        class="py-6 px-3 text-gray-500"
                                        colspan="6"
                                    >
                                        No post metrics available
                                    </td>
                                </tr>

                                <tr
                                    v-for="(p, idx) in topPosts"
                                    :key="p._id"
                                    class="border-b border-gray-800"
                                >
                                    <td
                                        class="py-3 px-3 text-gray-300 align-top"
                                    >
                                        {{ idx + 1 }}
                                    </td>
                                    <td
                                        class="py-3 px-3 text-gray-200 max-w-md truncate"
                                    >
                                        {{
                                            p.title ||
                                            (p.content || "").slice(0, 60)
                                        }}
                                    </td>
                                    <td class="py-3 px-3 text-gray-300">
                                        {{ p.platform }}
                                    </td>
                                    <td class="py-3 px-3 text-gray-300">
                                        {{ formatted(p.reach || 0) }}
                                    </td>
                                    <td class="py-3 px-3 text-gray-300">
                                        {{ formatted(p.engagements || 0) }}
                                    </td>
                                    <td class="py-3 px-3 text-gray-300">
                                        {{
                                            p.engagementRate
                                                ? (
                                                      p.engagementRate * 100
                                                  ).toFixed(2) + "%"
                                                : "—"
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Right column: AI Insights -->
            <aside class="space-y-4">
                <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <h4 class="text-sm font-semibold text-white mb-2">
                        AI Insights — Monthly Analysis
                    </h4>
                    <div
                        v-if="aiReport"
                        class="space-y-2 text-sm text-gray-200"
                    >
                        <div class="text-xs text-gray-400">Summary</div>
                        <div class="text-sm">{{ aiReport.summary }}</div>

                        <div class="mt-2 text-xs text-gray-400">Highlights</div>
                        <ul class="list-disc list-inside text-sm text-gray-300">
                            <li v-for="(h, i) in aiReport.highlights" :key="i">
                                {{ h }}
                            </li>
                        </ul>

                        <div class="mt-3 text-xs text-gray-400">
                            Actionable recommendations
                        </div>
                        <ol
                            class="list-decimal list-inside text-sm text-gray-300"
                        >
                            <li
                                v-for="(r, i) in aiReport.recommendations"
                                :key="i"
                            >
                                {{ r }}
                            </li>
                        </ol>
                    </div>

                    <div v-else class="text-gray-400 text-sm">
                        No AI analysis available. Click Refresh to request
                        analysis for the selected period.
                    </div>
                </div>

                <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <h4 class="text-sm font-semibold text-white mb-2">
                        Quick actions
                    </h4>
                    <div class="flex flex-col gap-2">
                        <UButton
                            color="yellow"
                            @click="generateAiReport"
                            class="bg-yellow-400 text-black"
                            >Generate AI Report</UButton
                        >
                        <UButton
                            color="gray"
                            variant="soft"
                            @click="downloadCsv"
                            >Export CSV</UButton
                        >
                        <UButton
                            color="gray"
                            variant="ghost"
                            @click="openSettings"
                            >View Analytics Settings</UButton
                        >
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup>
const n8n = useN8n();
const router = useRouter();

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

const loading = ref(false);
const period = ref("30"); // '30' or '90'

// Analytics state
const posts = ref([]); // posts with metrics: reach, engagements, engagementRate, scheduledDate, platform, title
const lineData = ref([]); // engagement rate over time series
const barData = ref([]); // pillars performance
const heatmap = ref([]); // array of { day, values: [] }
const heatmapHours = ["0", "4", "8", "12", "16", "20", "24"];
const aiReport = ref(null);

// Derived metrics
const totalReach = computed(() => {
    if (!posts.value || posts.value.length === 0) return 0;
    return posts.value.reduce((s, p) => s + (p.reach || 0), 0);
});

const avgEngagementRate = computed(() => {
    if (!posts.value || posts.value.length === 0) return null;
    const rates = posts.value.map((p) =>
        typeof p.engagementRate === "number"
            ? p.engagementRate
            : p.engagements && p.reach
              ? p.engagements / p.reach
              : 0,
    );
    const sum = rates.reduce((s, v) => s + v, 0);
    return sum / rates.length;
});

const avgEngagementRateDisplay = computed(() => {
    const r = avgEngagementRate.value;
    return r === null ? "—" : (r * 100).toFixed(2) + "%";
});

const followerGrowth = ref(0);
const followerGrowthPct = ref("—");
const deltaReach = ref("");
const deltaEngagement = ref("");
const topPlatform = computed(() => {
    if (!posts.value || posts.value.length === 0) return null;
    const byPlatform = {};
    posts.value.forEach((p) => {
        const plt = p.platform || "Other";
        byPlatform[plt] = byPlatform[plt] || {
            engagements: 0,
            reach: 0,
            count: 0,
        };
        byPlatform[plt].engagements += p.engagements || 0;
        byPlatform[plt].reach += p.reach || 0;
        byPlatform[plt].count++;
    });
    let best = null;
    Object.entries(byPlatform).forEach(([plt, data]) => {
        const rate = data.reach ? data.engagements / data.reach : 0;
        if (!best || rate > best.rate) best = { platform: plt, rate };
    });
    return best ? best.platform : null;
});

const topPosts = computed(() => {
    if (!posts.value) return [];
    return [...posts.value]
        .sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0))
        .slice(0, 10);
});

// Small helpers for visualizations
const maxBarValue = computed(() => {
    if (!barData.value || barData.value.length === 0) return 1;
    return Math.max(...barData.value.map((x) => x.value), 1);
});

const linePoints = computed(() => {
    if (!lineData.value || lineData.value.length === 0) return "";
    // map to simple 100x40 coordinate system
    const n = lineData.value.length;
    return lineData.value
        .map((v, i) => {
            const x = (i / Math.max(1, n - 1)) * 100;
            const y = 40 - Math.min(40, (v / Math.max(...lineData.value)) * 36);
            return `${x},${y}`;
        })
        .join(" ");
});

const linePointsArea = computed(() => {
    if (!lineData.value || lineData.value.length === 0) return "";
    const pts = linePoints.value;
    if (!pts) return "";
    // close the polygon to bottom
    return pts + " 100,40 0,40";
});

const heatColor = (v) => {
    // simple gradient from transparent to yellow-400
    if (!v) return "transparent";
    const val = Math.min(1, v / 10);
    const a = 0.08 + val * 0.6;
    return `rgba(251,191,36,${a})`;
};

function formatted(v) {
    if (v === null || v === undefined) return "—";
    if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
    if (v >= 1000) return (v / 1000).toFixed(1) + "k";
    return String(v);
}

// Loading logic: attempt to load analytics from backend (strategy endpoint provides posts)
async function loadAnalytics() {
    loading.value = true;
    aiReport.value = null;
    try {
        // Try to fetch strategy data (existing composable exposes getStrategy)
        const month = new Date().toISOString().slice(0, 7);
        const res = await n8n.getStrategy({ month });
        const strat = res?.data;
        // If backend provides posts with metrics, consume them
        posts.value = (strat?.posts || []).map((p) => ({
            _id: p._id,
            title: p.title || "",
            content: p.content || "",
            platform: p.platform || "Unknown",
            reach: p.reach || p.impressions || 0,
            engagements: p.engagements || p.likes || 0,
            engagementRate:
                p.engagementRate ||
                (p.reach ? (p.engagements || 0) / p.reach : 0),
            scheduledDate: p.scheduledDate,
        }));

        // Build lineData from posts aggregated by day (engagement rate average)
        const series = {};
        for (const p of posts.value) {
            const d = p.scheduledDate
                ? new Date(p.scheduledDate).toISOString().slice(0, 10)
                : "unknown";
            series[d] = series[d] || { sumRate: 0, count: 0 };
            series[d].sumRate += p.engagementRate || 0;
            series[d].count++;
        }
        const sortedDates = Object.keys(series).sort();
        lineData.value = sortedDates.map(
            (d) => series[d].sumRate / Math.max(1, series[d].count),
        );

        // Bar data by pillar if available on strategy
        if (strat?.pillarsMetrics) {
            barData.value = Object.entries(strat.pillarsMetrics).map(
                ([k, v]) => ({ label: k, value: v }),
            );
        } else {
            barData.value = []; // placeholder
        }

        // Heatmap if available
        if (strat?.heatmap) {
            heatmap.value = strat.heatmap;
        } else {
            heatmap.value = []; // placeholder
        }

        // Followers: try to read from strategy.summary
        followerGrowth.value = strat?.followerGrowth || 0;
        followerGrowthPct.value = strat?.followerGrowthPct
            ? strat.followerGrowthPct + "%"
            : "—";

        // deltas (example if provided)
        deltaReach.value = strat?.deltaReach
            ? strat.deltaReach > 0
                ? "+" + strat.deltaReach
                : String(strat.deltaReach)
            : "";
        deltaEngagement.value = strat?.deltaEngagement
            ? strat.deltaEngagement > 0
                ? "+" + strat.deltaEngagement
                : String(strat.deltaEngagement)
            : "";

        // AI report if included
        if (strat?.aiReport) {
            aiReport.value = strat.aiReport;
        }
    } catch (e) {
        // If backend is not available or does not provide analytics, keep placeholders
        console.warn("Analytics load failed or not available", e);
        // keep posts empty or as-is
    } finally {
        loading.value = false;
    }
}

async function generateAiReport() {
    if (!confirm("Request AI report for the selected period?")) return;
    loading.value = true;
    try {
        // call backend webhook if available
        (await n8n.callWebhook)
            ? n8n.callWebhook("generate-ai-report", { period: period.value })
            : null;
        // backend should update strategy.aiReport — re-load
        await loadAnalytics();
    } catch (e) {
        console.error("AI report generation failed", e);
    } finally {
        loading.value = false;
    }
}

function setPeriod(d) {
    period.value = String(d);
    // reload analytics for different period
    loadAnalytics();
}

function downloadCsv() {
    // simple CSV generation from topPosts
    const rows = [
        ["rank", "title", "platform", "reach", "engagements", "engagementRate"],
    ];
    topPosts.value.forEach((p, idx) => {
        rows.push([
            idx + 1,
            (p.title || "").replace(/,/g, " "),
            p.platform,
            p.reach || 0,
            p.engagements || 0,
            p.engagementRate ? p.engagementRate.toFixed(4) : "",
        ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top_posts_${period.value}d.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function openSettings() {
    navigateTo("/settings");
}

onMounted(() => {
    loadAnalytics();
});
</script>

<style scoped>
/* minor visual helpers */
table th,
table td {
    vertical-align: middle;
}
</style>
