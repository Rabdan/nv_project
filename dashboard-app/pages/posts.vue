<template>
    <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-white">Posts</h1>
                <p class="text-sm text-gray-400">
                    Manage generated content — approve, edit, preview and
                    publish.
                </p>
            </div>

            <div class="flex items-center gap-3">
                <UInput
                    v-model="search"
                    placeholder="Search posts..."
                    size="sm"
                    class="w-72"
                    clearable
                />
                <USelect v-model="filterStatus" size="sm" class="w-40">
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="generated">Generated</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                </USelect>

                <UButton
                    size="sm"
                    @click="refresh"
                    :loading="loading"
                    class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                >
                    Refresh
                </UButton>

                <UButton
                    size="sm"
                    @click="bulkApprove"
                    :disabled="!hasSelection"
                    class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                >
                    Approve Selected
                </UButton>
                <UButton
                    size="sm"
                    @click="bulkPublish"
                    :disabled="!hasSelection"
                    class="bg-green-500 text-white hover:bg-green-400 rounded"
                >
                    Publish Selected
                </UButton>
            </div>
        </div>

        <div
            class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
            <div class="p-4 border-b border-gray-700 flex items-center gap-4">
                <UButton
                    size="sm"
                    @click="toggleSelectAll"
                    class="border border-gray-600 text-gray-200 bg-transparent hover:bg-gray-700 rounded"
                >
                    {{ allSelected ? "Unselect all" : "Select all" }}
                </UButton>
                <div class="text-sm text-gray-400">
                    {{ filteredPosts.length }} posts
                </div>

                <div class="ml-auto text-xs text-gray-400">
                    Tip: Yellow actions are primary (Approve), green is publish.
                </div>
            </div>

            <div v-if="loading" class="p-8 text-center text-gray-400">
                <UIcon
                    name="i-heroicons-arrow-path"
                    class="animate-spin text-2xl"
                />
                <div class="mt-2">Loading posts...</div>
            </div>

            <div
                v-else-if="filteredPosts.length === 0"
                class="p-8 text-center text-gray-500"
            >
                No posts found.
            </div>

            <div v-else class="divide-y divide-gray-700">
                <div
                    v-for="post in filteredPosts"
                    :key="post._id"
                    class="p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center"
                >
                    <div class="flex items-start gap-3 w-full md:w-1/4">
                        <input
                            type="checkbox"
                            class="mt-1"
                            :checked="isSelected(post)"
                            @change="toggleSelect(post)"
                        />
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <span
                                    class="text-xs font-semibold px-2 py-1 rounded-full"
                                    :class="platformColor(post.platform)"
                                >
                                    {{ post.platform }}
                                </span>
                                <div
                                    class="text-sm text-white font-medium truncate"
                                >
                                    {{ post.title || previewText(post) }}
                                </div>
                            </div>
                            <div class="text-xs text-gray-400 mt-1">
                                {{ formatDate(post.scheduledDate) }}
                            </div>
                        </div>
                    </div>

                    <div class="flex-1">
                        <p
                            class="text-sm text-gray-200 leading-snug line-clamp-3"
                        >
                            {{ post.content || "Content not generated yet" }}
                        </p>
                        <div class="mt-3 flex items-center gap-2 flex-wrap">
                            <UButton
                                size="sm"
                                @click="approvePost(post)"
                                :disabled="post.status === 'approved'"
                                class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                            >
                                Approve
                            </UButton>

                            <UButton
                                size="sm"
                                @click="openEdit(post)"
                                class="border border-gray-600 text-gray-200 bg-transparent hover:bg-gray-700 rounded"
                            >
                                Edit
                            </UButton>

                            <UButton
                                size="sm"
                                @click="publishPost(post)"
                                :disabled="post.status === 'published'"
                                class="bg-green-500 text-white hover:bg-green-400 rounded"
                            >
                                Publish
                            </UButton>

                            <UButton
                                size="sm"
                                @click="previewPost(post)"
                                class="bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white rounded"
                            >
                                Preview
                            </UButton>

                            <span
                                class="ml-auto text-xs px-2 py-1 rounded"
                                :class="statusColor(post.status)"
                            >
                                {{ post.status }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit drawer / modal (basic) -->
        <UDialog v-model:show="editOpen" :size="'lg'">
            <template #title>Edit Post</template>
            <template #default>
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
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton
                        @click="editOpen = false"
                        class="bg-transparent text-gray-200 hover:bg-gray-700 rounded"
                        >Cancel</UButton
                    >
                    <UButton
                        @click="saveEdit"
                        class="bg-yellow-400 text-black hover:bg-yellow-300 rounded"
                        >Save</UButton
                    >
                </div>
            </template>
        </UDialog>
    </div>
</template>

<script setup>
const n8n = useN8n();

const loading = ref(false);
const posts = ref([]);
const selected = ref(new Set());
const search = ref("");
const filterStatus = ref("");
const editOpen = ref(false);
const editing = reactive({ _id: null, content: "", scheduledDate: "" });

// use same month logic as dashboard to read posts from strategy
const currentDate = ref(new Date());
const currentMonthStr = computed(() => {
    const y = currentDate.value.getFullYear();
    const m = String(currentDate.value.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
});

const loadPosts = async () => {
    loading.value = true;
    try {
        const res = await n8n.getStrategy({ month: currentMonthStr.value });
        // Expect strategy.posts
        const strategy = res.data || {};
        posts.value = strategy.posts || [];
    } catch (e) {
        console.warn("Failed to load posts", e);
        posts.value = [];
    } finally {
        loading.value = false;
    }
};

// Refresh helper
const refresh = () => loadPosts();

onMounted(() => {
    loadPosts();
});

// selection helpers
const isSelected = (post) => selected.value.has(post._id);
const toggleSelect = (post) => {
    if (selected.value.has(post._id)) selected.value.delete(post._id);
    else selected.value.add(post._id);
};
const allSelected = computed(
    () =>
        posts.value.length > 0 &&
        posts.value.every((p) => selected.value.has(p._id)),
);
const hasSelection = computed(() => selected.value.size > 0);
const toggleSelectAll = () => {
    if (allSelected.value) {
        selected.value = new Set();
    } else {
        selected.value = new Set(posts.value.map((p) => p._id));
    }
};

// actions
const approvePost = async (post) => {
    try {
        await n8n.updatePostStatus(post._id, "approved");
        await loadPosts();
    } catch (e) {
        console.error("Approve failed", e);
    }
};

const publishPost = async (post) => {
    try {
        // composable has publishContent, but expects strategyId in original code
        // try update status first
        await n8n.updatePostStatus(post._id, "published");
        await loadPosts();
    } catch (e) {
        console.error("Publish failed", e);
    }
};

const bulkApprove = async () => {
    if (!hasSelection.value) return;
    loading.value = true;
    try {
        const ids = Array.from(selected.value);
        await Promise.all(
            ids.map((id) => n8n.updatePostStatus(id, "approved")),
        );
        selected.value = new Set();
        await loadPosts();
    } catch (e) {
        console.error("Bulk approve failed", e);
    } finally {
        loading.value = false;
    }
};

const bulkPublish = async () => {
    if (!hasSelection.value) return;
    loading.value = true;
    try {
        const ids = Array.from(selected.value);
        await Promise.all(
            ids.map((id) => n8n.updatePostStatus(id, "published")),
        );
        selected.value = new Set();
        await loadPosts();
    } catch (e) {
        console.error("Bulk publish failed", e);
    } finally {
        loading.value = false;
    }
};

// edit flow (local save via strategy.save)
const openEdit = (post) => {
    editing._id = post._id;
    editing.content = post.content || "";
    // convert to local datetime-local format if available
    editing.scheduledDate = post.scheduledDate
        ? formatForInput(post.scheduledDate)
        : "";
    editOpen.value = true;
};

const saveEdit = async () => {
    if (!editing._id) return;
    loading.value = true;
    try {
        // find strategy and update post by id, then save strategy
        const res = await n8n.getStrategy({ month: currentMonthStr.value });
        const strategy = res.data;
        if (!strategy) throw new Error("Strategy not found");

        const idx = (strategy.posts || []).findIndex(
            (p) => p._id === editing._id,
        );
        if (idx === -1) throw new Error("Post not found in strategy");

        strategy.posts[idx].content = editing.content;
        if (editing.scheduledDate)
            strategy.posts[idx].scheduledDate = new Date(
                editing.scheduledDate,
            ).toISOString();

        // Use saveStrategy if available
        if (n8n.saveStrategy) {
            await n8n.saveStrategy(strategy);
        } else {
            // fallback: update status to trigger re-fetch (best-effort)
            await n8n.updatePostStatus(
                editing._id,
                strategy.posts[idx].status || "generated",
            );
        }

        editOpen.value = false;
        await loadPosts();
    } catch (e) {
        console.error("Save edit failed", e);
    } finally {
        loading.value = false;
    }
};

const previewPost = (post) => {
    // very small inline preview — open modal or new page; here we use window.open with a simple data URL
    const body = post.content || "";
    const win = window.open("", "_blank", "noopener");
    if (win) {
        win.document.write(
            '<pre style=\"white-space:pre-wrap;font-family:ui-sans-serif;padding:20px;background:#0b1220;color:#e6edf3;\">' +
                escapeHtml(body) +
                "</pre>",
        );
        win.document.title = post.title || "Post Preview";
        win.focus();
    }
};

// filtering & helpers
const filteredPosts = computed(() => {
    const q = search.value.trim().toLowerCase();
    return posts.value
        .filter((p) => {
            if (filterStatus.value && p.status !== filterStatus.value)
                return false;
            if (!q) return true;
            return (
                (p.content || "").toLowerCase().includes(q) ||
                (p.title || "").toLowerCase().includes(q)
            );
        })
        .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
});

const platformColor = (platform) => {
    if (!platform) return "bg-gray-600 text-white";
    const map = {
        LinkedIn: "bg-blue-600 text-white",
        Instagram: "bg-pink-600 text-white",
        Facebook: "bg-blue-700 text-white",
    };
    return map[platform] || "bg-gray-600 text-white";
};

const statusColor = (status) => {
    const map = {
        pending: "bg-yellow-900 text-yellow-300",
        generated: "bg-blue-900 text-blue-300",
        approved: "bg-green-900 text-green-300",
        published: "bg-purple-900 text-purple-300",
    };
    return map[status] || "bg-gray-700 text-gray-300";
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

const formatForInput = (d) => {
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = dt.getFullYear();
    const mm = pad(dt.getMonth() + 1);
    const dd = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mi = pad(dt.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const previewText = (post) => {
    if (post.title) return post.title;
    if (post.content)
        return (
            post.content.slice(0, 60) + (post.content.length > 60 ? "…" : "")
        );
    return "Untitled post";
};

const escapeHtml = (unsafe) => {
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};
</script>

<style scoped>
/* Make sure long content is nicely truncated */
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
