<template>
    <div class="max-w-7xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-white">Posts Feed</h1>
                <p class="text-sm text-gray-400">
                    Browse and manage posts generated for strategies. Choose a
                    strategy (month) and platform to filter the feed.
                </p>
            </div>

            <div class="flex items-center gap-3">
                <USelect
                    v-model="selectedStrategyMonth"
                    :items="strategiesList"
                    placeholder="Select month"
                    value-key="month"
                    :ui="{ content: 'min-w-fit' }"
                    class="w-48"
                >
                    <template #item-label="{ item }">
                        {{ item.label }}
                        {{
                            item.theme
                                ? item.theme.slice(0, 28) + "…"
                                : "No theme"
                        }}
                        <span class="text-muted">
                            ({{ item.postsCount }} posts)
                        </span>
                    </template>
                </USelect>

                <select v-model="filterPlatform" class="w-40 rounded px-2 py-1">
                    <option value="">All platforms</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                </select>
            </div>
        </div>

        <div
            v-if="loading && !loadedOnce"
            class="p-12 text-center text-gray-400"
        >
            <UIcon
                name="i-heroicons-arrow-path"
                class="animate-spin text-2xl"
            />
            <div class="mt-3">Loading posts and strategies...</div>
        </div>

        <div v-else>
            <div
                v-if="filteredPosts.length === 0"
                class="p-8 text-center text-gray-500"
            >
                No posts match the selected filters.
            </div>

            <div
                v-else
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                <div v-for="post in filteredPosts" :key="post._id">
                    <UCard variant="subtle">
                        <template #header>
                            <div class="h-8 flex items-center justify-between">
                                <span
                                    class="text-xs font-semibold px-2 py-1 rounded-full"
                                    :class="platformColor(post.platform)"
                                    >{{ post.platform }}</span
                                >
                                <div class="text-xs text-gray-400 mt-3">
                                    Scheduled:
                                    <span class="text-gray-200">{{
                                        formatDate(post.scheduledDate)
                                    }}</span>
                                </div>
                            </div>
                        </template>

                        <div class="flex-1">
                            <div
                                class="text-sm text-white font-medium truncate h-32"
                            >
                                <img
                                    :src="post.imageurl"
                                    lazy
                                    alt="Post Image"
                                    class="object-contain w-full h-full"
                                />
                            </div>
                            <div
                                class="text-xs text-gray-400 mt-2 line-clamp-4"
                            >
                                {{ post.text || "Content not generated yet" }}
                            </div>
                            <div
                                class="text-xs text-gray-400 mt-2 line-clamp-4"
                            >
                                {{ post.tags.join(", ") || "No tags" }}
                            </div>
                        </div>

                        <template #footer>
                            <div class="h-8 flex items-center justify-between">
                                <div
                                    class="text-xs text-gray-400 mt-2 line-clamp-4"
                                >
                                    Status: {{ post.status }}
                                </div>
                                <div class="flex items-center gap-2 h-8">
                                    <UButton
                                        @click="approvePost(post)"
                                        :disabled="post.status === 'approved'"
                                        class="bg-yellow-400 text-black px-2 py-1 rounded text-xs hover:bg-yellow-200"
                                        >Approve</UButton
                                    >
                                    <UButton
                                        @click="openDeleteDialog(post)"
                                        :disabled="post.status === 'approved'"
                                        class="bg-red-400 text-white p-1 rounded hover:bg-red-200"
                                        ><UIcon name="i-heroicons-trash"
                                    /></UButton>
                                    <UButton
                                        @click="openEditDialog(post)"
                                        :disabled="post.status === 'approved'"
                                        class="text-blue-400 text-black p-1 rounded hover:bg-blue-200"
                                        ><UIcon name="i-heroicons-pencil"
                                    /></UButton>
                                </div>
                            </div>
                        </template>
                    </UCard>
                </div>
            </div>
        </div>

        <!-- Optional edit dialog (re-used if needed) -->
        <UModal
            v-model:open="editOpen"
            title=">Edit Post"
            :ui="{ footer: 'justify-end' }"
        >
            <template>
                <div class="space-y-3">
                    <label class="text-xs text-gray-300">Content</label>
                    <UTextarea v-model="editing.content" :rows="6" />
                    <label class="text-xs text-gray-300">Scheduled Date</label>
                    <UInput
                        v-model="editing.scheduledDate"
                        type="datetime-local"
                    />
                </div>
            </template>
            <template #footer="{ close }">
                <div class="flex justify-end gap-2">
                    <UButton
                        @click="editOpen = false"
                        class="bg-transparent text-gray-200 hover:bg-gray-700 rounded"
                        >Cancel</UButton
                    >
                    <UButton @click="saveEdit" class="btn-primary"
                        >Save</UButton
                    >
                </div>
            </template>
        </UModal>

        <!-- Delete confirmation dialog (replaces inline confirm) -->
        <UModal
            v-model:open="deleteDialogOpen"
            title=">Delete Post"
            description="Are you sure you want to delete this post? This action cannot be undone."
            :ui="{ footer: 'justify-end' }"
        >
            <template #footer="{ close }">
                <UButton
                    label="Cancel"
                    color="neutral"
                    variant="outline"
                    @click="close"
                />
                <UButton
                    label="Delete"
                    @click="confirmDelete"
                    color="neutral"
                />
            </template>
        </UModal>
    </div>
</template>

<script setup>
const n8n = useN8n();
const router = useRouter();
const route = useRoute();

import { ref, computed, onMounted } from "vue";

// state
const loading = ref(false);
const loadedOnce = ref(false);
const strategiesList = ref([]);
const selectedStrategyMonth = ref("");
const posts = ref([]);
const filterPlatform = ref("");
const search = ref("");

// edit dialog
const editOpen = ref(false);
const editing = ref({ _id: null, content: "", scheduledDate: "" });

/**
 * Build last 12 months options (same logic used across app)
 */
const monthOptions = () => {
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
};

/**
 * Load strategies for the last 12 months and build strategiesList.
 * Keeps the latest (most recent month) first.
 */
const loadStrategiesList = async () => {
    try {
        const res = await n8n.getStrategies();
        strategiesList.value = res.data.map((r) => {
            return {
                month: r.month,
                label: new Date(r.month + "-01").toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                }),
                theme: r.theme || "",
                postsCount: (r.posts || []).length || 0,
            };
        });
    } catch (e) {
        console.warn("Failed to load strategies", e);
        strategiesList.value = [];
    }
    // default selected strategy: if route has ?month use it, otherwise latest available strategy (first item)
    if (route.query.month && typeof route.query.month === "string") {
        selectedStrategyMonth.value = String(route.query.month);
    } else {
        selectedStrategyMonth.value = strategiesList.value.length
            ? strategiesList.value[0].month
            : "";
    }
};

/**
 * Load posts for selected strategy month
 */
const loadPostsForSelected = async (month) => {
    if (!month) {
        posts.value = [];
        return;
    }
    loading.value = true;
    try {
        // get strategy data which contains posts
        const res = await n8n.getStrategy({ month });
        const strat = res.data || {};
        console.log("Loaded strategy for", month, strat);
        posts.value = (strat.posts || []).map((p) => ({
            _id: p.platform + "-" + p.scheduledDate,
            imageurl: p.imageurl || "",
            text: p.text || "",
            platform: p.platform || "Unknown",
            imageurl: p.imageurl || "",
            scheduledDate: p.scheduledDate || null,
            tags: p.tags || [],
            status: p.status || "generated",
        }));
        console.log("Loaded posts for", month, posts.value);
    } catch (e) {
        console.warn("Failed to load posts for", month, e);
        posts.value = [];
    } finally {
        loading.value = false;
        loadedOnce.value = true;
    }
};

// load on change
watch(selectedStrategyMonth, async (v) => {
    console.log("Wathc Loading posts for", v);
    await loadPostsForSelected(v);
    // update URL query so navigation is shareable
    router.replace({ query: { ...route.query, month: v } }).catch(() => {});
});

// initial load
onMounted(async () => {
    loading.value = true;
    try {
        await loadStrategiesList();
        await loadPostsForSelected(selectedStrategyMonth.value);
    } finally {
        loading.value = false;
        loadedOnce.value = true;
    }
});

// refresh
const refresh = async () => {
    await loadStrategiesList();
    await loadPostsForSelected(selectedStrategyMonth.value);
};

// computed filtered posts
const filteredPosts = computed(() => {
    const q = search.value.trim().toLowerCase();
    console.log("Filtered posts", posts.value);
    return posts.value
        .filter((p) =>
            !filterPlatform.value ? true : p.platform === filterPlatform.value,
        )
        .filter((p) => {
            if (!q) return true;
            return (
                (p.title || "").toLowerCase().includes(q) ||
                (p.content || "").toLowerCase().includes(q)
            );
        })
        .sort(
            (a, b) =>
                new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0),
        );
});

// actions
const approvePost = async (post) => {
    try {
        await n8n.updatePostStatus(
            selectedStrategyMonth.value,
            post._id,
            "approved",
        );
        // optimistic update
        post.status = "approved";
    } catch (e) {
        console.error("Approve failed", e);
    }
};

/* Delete flow using modal dialog (no direct confirm()) */
const deleteDialogOpen = ref(false);
const deleteTarget = ref(null);

const openDeleteDialog = (post) => {
    deleteTarget.value = post;
    deleteDialogOpen.value = true;
};

const cancelDelete = () => {
    deleteTarget.value = null;
    deleteDialogOpen.value = false;
};

const confirmDelete = async () => {
    if (!deleteTarget.value) return;
    const post = deleteTarget.value;
    // close dialog immediately for UX
    deleteDialogOpen.value = false;
    try {
        // try delete with month if API expects it; keep flexible via composable
        if (selectedStrategyMonth.value) {
            await n8n.deletePost(selectedStrategyMonth.value, post._id);
        }
        // remove locally
        posts.value = posts.value.filter((p) => p._id !== post._id);
    } catch (e) {
        console.error("Delete failed", e);
    } finally {
        deleteTarget.value = null;
    }
};

// small helpers
const platformColor = (platform) => {
    if (!platform) return "bg-gray-600 text-white";
    const map = {
        LinkedIn: "bg-blue-600 text-white",
        Instagram: "bg-pink-600 text-white",
        Facebook: "bg-blue-700 text-white",
    };
    return map[platform] || "bg-gray-600 text-white";
};

const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const previewText = (post) => {
    if (post.title) return post.title;
    if (post.content)
        return (
            post.content.slice(0, 60) + (post.content.length > 60 ? "…" : "")
        );
    return "Untitled post";
};

// editing (optional)
const openEdit = (post) => {
    editing.value._id = post._id;
    editing.value.content = post.text || "";
    editing.value.scheduledDate = post.scheduledDate
        ? formatForInput(post.scheduledDate)
        : "";
    editOpen.value = true;
};

const saveEdit = async () => {
    if (!editing.value._id) return;
    try {
        const res = await n8n.getStrategy({
            month: selectedStrategyMonth.value,
        });
        const strat = res.data;
        if (!strat) throw new Error("Strategy not found");
        const idx = (strat.posts || []).findIndex(
            (p) => p._id === editing.value._id,
        );
        if (idx === -1) throw new Error("Post not found in strategy");
        strat.posts[idx].text = editing.value.content;
        if (editing.value.scheduledDate)
            strat.posts[idx].scheduledDate = new Date(
                editing.value.scheduledDate,
            ).toISOString();
        if (n8n.saveStrategy) await n8n.saveStrategy(strat);
        editOpen.value = false;
        await loadPostsForSelected(selectedStrategyMonth.value);
    } catch (e) {
        console.error("Save edit failed", e);
    }
};

function formatForInput(d) {
    if (!d) return "";
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
</script>

<style scoped>
.line-clamp-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Primary accent button */
.btn-primary {
    background: linear-gradient(180deg, var(--nv-accent), var(--nv-accent-600));
    color: #0b0b0b;
    border-radius: 999px;
    padding: 0.5rem 0.95rem;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(255, 197, 7, 0.12);
    border: 1px solid rgba(0, 0, 0, 0.12);
}

/* Card hover polish for post cards */
.post-card {
    background: var(--nv-card-plain);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.03);
    padding: 1rem;
    transition:
        transform 0.16s ease,
        box-shadow 0.16s ease;
}
.post-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.7);
}
</style>
