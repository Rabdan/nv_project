<template>
    <div class="max-w-6xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-white">Scheduling</h1>
                <p class="text-sm text-gray-400">
                    Manage the publishing queue: platform, date/time and status
                </p>
            </div>

            <div class="flex items-center gap-3">
                <USelect v-model="filterPlatform" size="sm" class="w-40">
                    <option value="">All platforms</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                </USelect>

                <USelect v-model="filterStatus" size="sm" class="w-40">
                    <option value="">All statuses</option>
                    <option value="queued">Queued</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="error">Error</option>
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
                    @click="exportCsv"
                    class="bg-gray-700 text-white hover:bg-gray-600 rounded"
                    >Export CSV</UButton
                >
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

                <UButton
                    size="sm"
                    @click="bulkPublish"
                    :disabled="!hasSelection"
                    class="bg-green-500 text-white hover:bg-green-400 rounded"
                    >Publish Selected</UButton
                >
                <UButton
                    size="sm"
                    @click="bulkDelete"
                    :disabled="!hasSelection"
                    class="bg-red-500 text-white hover:bg-red-400 rounded"
                    >Delete Selected</UButton
                >

                <div class="ml-auto text-xs text-gray-400">
                    Tip: use the table to edit schedule times or publish
                    immediately.
                </div>
            </div>

            <div v-if="loading" class="p-8 text-center text-gray-400">
                <UIcon
                    name="i-heroicons-arrow-path"
                    class="animate-spin text-2xl"
                />
                <div class="mt-2">Loading queue...</div>
            </div>

            <div
                v-else-if="filteredQueue.length === 0"
                class="p-8 text-center text-gray-500"
            >
                No items in publishing queue.
            </div>

            <div v-else class="overflow-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="text-xs text-gray-400 text-left">
                            <th class="px-3 py-2">#</th>
                            <th class="px-3 py-2">Select</th>
                            <th class="px-3 py-2">Platform</th>
                            <th class="px-3 py-2">Scheduled</th>
                            <th class="px-3 py-2">Content</th>
                            <th class="px-3 py-2">Status</th>
                            <th class="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(item, idx) in filteredQueue"
                            :key="item._id"
                            class="border-t border-gray-700"
                        >
                            <td class="px-3 py-2 text-gray-300 align-top">
                                {{ idx + 1 }}
                            </td>
                            <td class="px-3 py-2 align-top">
                                <input
                                    type="checkbox"
                                    :checked="isSelected(item)"
                                    @change="toggleSelect(item)"
                                />
                            </td>
                            <td class="px-3 py-2 text-gray-200 align-top">
                                <span
                                    class="text-xs font-semibold px-2 py-1 rounded-full"
                                    :class="platformColor(item.platform)"
                                >
                                    {{ item.platform || "Unknown" }}
                                </span>
                            </td>
                            <td class="px-3 py-2 text-gray-300 align-top">
                                {{ formatDate(item.scheduledDate) }}
                            </td>
                            <td
                                class="px-3 py-2 text-gray-200 align-top max-w-xl"
                            >
                                <div class="line-clamp-3">
                                    {{ item.title || previewText(item) }}
                                </div>
                            </td>
                            <td class="px-3 py-2 align-top">
                                <span
                                    class="text-xs px-2 py-1 rounded"
                                    :class="statusColor(item.status)"
                                >
                                    {{ item.status || "queued" }}
                                </span>
                            </td>
                            <td class="px-3 py-2 align-top">
                                <div class="flex items-center gap-2">
                                    <UButton
                                        size="sm"
                                        @click="openEdit(item)"
                                        class="bg-transparent text-gray-300 hover:bg-gray-700 rounded"
                                        >Edit</UButton
                                    >
                                    <UButton
                                        size="sm"
                                        @click="publishNow(item)"
                                        :disabled="item.status === 'published'"
                                        class="bg-green-500 text-white hover:bg-green-400 rounded"
                                        >Publish now</UButton
                                    >
                                    <UButton
                                        size="sm"
                                        @click="deleteItem(item)"
                                        class="bg-red-500 text-white hover:bg-red-400 rounded"
                                        >Delete</UButton
                                    >
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Edit modal -->
        <UDialog v-model:show="editOpen" :size="'lg'">
            <template #title>Edit Scheduled Item</template>
            <template #default>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-300 mb-1"
                            >Platform</label
                        >
                        <USelect v-model="editing.platform">
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                        </USelect>
                    </div>

                    <div>
                        <label class="block text-xs text-gray-300 mb-1"
                            >Scheduled date & time</label
                        >
                        <UInput
                            v-model="editing.scheduledDateLocal"
                            type="datetime-local"
                        />
                    </div>

                    <div>
                        <label class="block text-xs text-gray-300 mb-1"
                            >Content</label
                        >
                        <UTextarea v-model="editing.content" :rows="5" />
                    </div>
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
                        :loading="saving"
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
const queue = ref([]); // items loaded from strategy.posts or similar
const selected = ref(new Set());
const filterPlatform = ref("");
const filterStatus = ref("");
const editOpen = ref(false);
const saving = ref(false);

// editing model (local)
const editing = reactive({
    _id: null,
    platform: "",
    scheduledDateLocal: "",
    content: "",
});

// month logic: reuse same approach to query current month strategy
const currentDate = ref(new Date());
const currentMonthStr = computed(() => {
    const y = currentDate.value.getFullYear();
    const m = String(currentDate.value.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
});

const loadQueue = async () => {
    loading.value = true;
    try {
        const res = await n8n.getStrategy({ month: currentMonthStr.value });
        const strat = res.data || {};
        // Expect strategy.posts
        queue.value = (strat.posts || []).map((p) => ({
            ...p,
            // ensure id
            _id: p._id || p.platform + "-" + (p.scheduledDate || Math.random()),
            status:
                p.status ||
                (p.published
                    ? "published"
                    : p.scheduledDate
                      ? "scheduled"
                      : "queued"),
        }));
    } catch (e) {
        console.warn("Failed to load scheduling queue", e);
        queue.value = [];
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadQueue();
});

// helpers & computed
const filteredQueue = computed(() => {
    return queue.value
        .filter((item) =>
            filterPlatform.value
                ? item.platform === filterPlatform.value
                : true,
        )
        .filter((item) =>
            filterStatus.value ? item.status === filterStatus.value : true,
        )
        .sort(
            (a, b) =>
                new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0),
        );
});

const isSelected = (item) => selected.value.has(item._id);
const toggleSelect = (item) => {
    if (selected.value.has(item._id)) selected.value.delete(item._id);
    else selected.value.add(item._id);
};
const allSelected = computed(
    () =>
        queue.value.length > 0 &&
        queue.value.every((p) => selected.value.has(p._id)),
);
const hasSelection = computed(() => selected.value.size > 0);
const toggleSelectAll = () => {
    if (allSelected.value) selected.value = new Set();
    else selected.value = new Set(queue.value.map((p) => p._id));
};

// actions
const refresh = () => loadQueue();

const publishNow = async (item) => {
    if (!confirm("Publish this item now?")) return;
    loading.value = true;
    try {
        // Try using publishContent if available, otherwise fallback to updatePostStatus
        if (n8n.publishContent) {
            await n8n.publishContent(item._id);
        } else {
            await n8n.updatePostStatus(item._id, "published");
        }
        await loadQueue();
    } catch (e) {
        console.error("Publish failed", e);
    } finally {
        loading.value = false;
    }
};

const deleteItem = async (item) => {
    if (!confirm("Delete this scheduled item?")) return;
    loading.value = true;
    try {
        // Many endpoints expect (month, postId) - keep same semantics as existing pages
        if (n8n.deletePost) {
            // try both signatures (some pages pass month first)
            try {
                await n8n.deletePost(currentMonthStr.value, item._id);
            } catch {
                await n8n.deletePost(item._id);
            }
        } else {
            // last resort: update status to deleted
            await n8n.updatePostStatus(item._id, "deleted");
        }
        await loadQueue();
    } catch (e) {
        console.error("Delete failed", e);
    } finally {
        loading.value = false;
    }
};

const bulkPublish = async () => {
    if (!hasSelection.value) return;
    if (!confirm("Publish all selected items now?")) return;
    loading.value = true;
    try {
        const ids = Array.from(selected.value);
        await Promise.all(
            ids.map((id) => {
                // keep call style used elsewhere
                return n8n.updatePostStatus(id, "published");
            }),
        );
        selected.value = new Set();
        await loadQueue();
    } catch (e) {
        console.error("Bulk publish failed", e);
    } finally {
        loading.value = false;
    }
};

const bulkDelete = async () => {
    if (!hasSelection.value) return;
    if (!confirm("Delete all selected items?")) return;
    loading.value = true;
    try {
        const ids = Array.from(selected.value);
        await Promise.all(
            ids.map((id) => {
                // try deletePost with month if supported
                return n8n.deletePost
                    ? n8n
                          .deletePost(currentMonthStr.value, id)
                          .catch(() => n8n.deletePost(id))
                    : n8n.updatePostStatus(id, "deleted");
            }),
        );
        selected.value = new Set();
        await loadQueue();
    } catch (e) {
        console.error("Bulk delete failed", e);
    } finally {
        loading.value = false;
    }
};

// Edit flow
const openEdit = (item) => {
    editing._id = item._id;
    editing.platform = item.platform || "";
    editing.content = item.content || item.title || "";
    editing.scheduledDateLocal = item.scheduledDate
        ? formatForInput(item.scheduledDate)
        : "";
    editOpen.value = true;
};

const saveEdit = async () => {
    if (!editing._id) return;
    saving.value = true;
    try {
        // fetch strategy and update post content/time if possible
        const res = await n8n.getStrategy({ month: currentMonthStr.value });
        const strat = res.data;
        if (!strat) throw new Error("Strategy not found");

        const idx = (strat.posts || []).findIndex((p) => p._id === editing._id);
        if (idx === -1) throw new Error("Post not found in strategy");

        strat.posts[idx].platform = editing.platform;
        strat.posts[idx].content = editing.content;
        if (editing.scheduledDateLocal)
            strat.posts[idx].scheduledDate = new Date(
                editing.scheduledDateLocal,
            ).toISOString();

        // Save strategy if possible
        if (n8n.saveStrategy) {
            await n8n.saveStrategy(strat);
        } else {
            // fallback: try update status to trigger save
            await n8n.updatePostStatus(
                editing._id,
                strat.posts[idx].status || "scheduled",
            );
        }

        editOpen.value = false;
        await loadQueue();
    } catch (e) {
        console.error("Save edit failed", e);
    } finally {
        saving.value = false;
    }
};

// utilities
const formatDate = (d) => {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    } catch {
        return String(d);
    }
};

const formatForInput = (d) => {
    if (!d) return "";
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
            post.content.slice(0, 80) + (post.content.length > 80 ? "…" : "")
        );
    return "Untitled";
};

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
        queued: "bg-yellow-900 text-yellow-300",
        scheduled: "bg-yellow-800 text-yellow-200",
        published: "bg-green-900 text-green-300",
        error: "bg-red-900 text-red-300",
        deleted: "bg-gray-700 text-gray-300",
    };
    return map[status] || "bg-gray-700 text-gray-300";
};

// CSV export
const exportCsv = () => {
    const rows = [["platform", "scheduledDate", "status", "title", "content"]];
    queue.value.forEach((p) => {
        rows.push([
            p.platform || "",
            p.scheduledDate || "",
            p.status || "",
            (p.title || "").replace(/,/g, " "),
            (p.content || "").replace(/,/g, " "),
        ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `publishing_queue_${currentMonthStr.value}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};
</script>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
