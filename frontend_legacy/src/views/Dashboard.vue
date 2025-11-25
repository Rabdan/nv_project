<template>
  <div class="space-y-8">
    <!-- Strategy Section -->
    <section class="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-200">Monthly Strategy</h3>
        <div class="flex items-center space-x-4">
          <button @click="prevMonth" class="p-2 hover:bg-gray-700 rounded-lg">←</button>
          <span class="font-bold text-xl">{{ currentMonthLabel }}</span>
          <button @click="nextMonth" class="p-2 hover:bg-gray-700 rounded-lg">→</button>
        </div>
      </div>
      
      <div v-if="loadingStrategy" class="text-center py-8 text-gray-400">Loading strategy...</div>
      <div v-else-if="strategy" class="prose prose-invert max-w-none">
        <div class="bg-gray-900 p-4 rounded-lg mb-4">
          <h4 class="text-blue-400 font-bold mb-2">Focus: {{ strategy.focus }}</h4>
          <p>{{ strategy.summary }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="(theme, idx) in strategy.themes" :key="idx" class="bg-gray-700 p-3 rounded border border-gray-600">
                <div class="font-bold text-sm text-gray-300 mb-1">Theme {{ idx + 1 }}</div>
                <div>{{ theme }}</div>
            </div>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <p class="text-gray-400 mb-4">No strategy found for this month.</p>
        <button @click="createStrategy" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
          Generate Strategy
        </button>
      </div>
    </section>

    <!-- Posts Section -->
    <section class="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-200">Weekly Content</h3>
        <div class="flex space-x-2">
            <button @click="generateContent" :disabled="!strategy" class="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm">
                Generate Posts
            </button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="post in posts" :key="post.id" class="bg-gray-900 rounded-lg p-4 border border-gray-700 flex gap-4">
            <!-- Image Placeholder -->
            <div class="w-32 h-32 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-gray-600">
                <img v-if="post.imageUrl" :src="post.imageUrl" class="w-full h-full object-cover rounded" />
                <span v-else>No Image</span>
            </div>
            
            <!-- Content -->
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-mono text-blue-400">{{ post.platform }}</span>
                    <span :class="statusColor(post.status)" class="text-xs px-2 py-0.5 rounded-full border">{{ post.status }}</span>
                </div>
                <p class="text-sm text-gray-300 line-clamp-3 mb-2">{{ post.content }}</p>
                <div class="text-xs text-gray-500">Scheduled: {{ formatDate(post.scheduledAt) }}</div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col space-y-2 justify-center">
                <button v-if="post.status === 'draft'" @click="approvePost(post.id)" class="p-2 bg-blue-600 hover:bg-blue-500 rounded text-xs">Approve</button>
                <button v-if="post.status === 'approved'" @click="publishPost(post.id)" class="p-2 bg-purple-600 hover:bg-purple-500 rounded text-xs">Publish</button>
                <button @click="regeneratePost(post.id)" class="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs">Regen</button>
            </div>
        </div>
        <div v-if="posts.length === 0" class="text-center py-8 text-gray-500">
            No posts generated yet.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import n8n from '../services/n8n';

const currentDate = ref(new Date());
const loadingStrategy = ref(false);
const strategy = ref(null);
const posts = ref([]);

const currentMonthLabel = computed(() => {
    return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const loadData = async () => {
    loadingStrategy.value = true;
    try {
        const monthStr = currentDate.value.toISOString().slice(0, 7); // YYYY-MM
        // Mock data for now if API fails
        try {
            const res = await n8n.getStrategy(monthStr);
            strategy.value = res.data;
        } catch (e) {
            console.warn('API failed, using mock');
            // Mock
            // strategy.value = { focus: 'Mental Health Awareness', summary: 'Focus on anxiety relief techniques.', themes: ['Breathing', 'Grounding', 'Sleep'] };
            strategy.value = null; 
        }
        
        // Load posts
        // const postsRes = await n8n.getPosts(monthStr);
        // posts.value = postsRes.data;
        posts.value = [
            { id: 1, platform: 'Instagram', content: 'Take a deep breath. #anxiety', status: 'draft', scheduledAt: new Date().toISOString() },
            { id: 2, platform: 'LinkedIn', content: 'Professional burnout is real.', status: 'approved', scheduledAt: new Date().toISOString() }
        ];

    } finally {
        loadingStrategy.value = false;
    }
};

const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1));
    loadData();
};

const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1));
    loadData();
};

const createStrategy = async () => {
    loadingStrategy.value = true;
    await n8n.createStrategy({ month: currentDate.value.toISOString() });
    await loadData();
};

const generateContent = async () => {
    if (!strategy.value) return;
    await n8n.generateContent(strategy.value._id);
    // Reload posts
};

const approvePost = async (id) => {
    await n8n.updatePostStatus(id, 'approved');
    const p = posts.value.find(x => x.id === id);
    if (p) p.status = 'approved';
};

const publishPost = async (id) => {
    await n8n.publishContent(id);
    const p = posts.value.find(x => x.id === id);
    if (p) p.status = 'published';
};

const regeneratePost = (id) => {
    console.log('Regenerate', id);
};

const statusColor = (status) => {
    switch(status) {
        case 'draft': return 'border-yellow-500 text-yellow-500';
        case 'approved': return 'border-blue-500 text-blue-500';
        case 'published': return 'border-green-500 text-green-500';
        default: return 'border-gray-500 text-gray-500';
    }
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
};

onMounted(() => {
    loadData();
});
</script>
