<template>
  <div class="space-y-8">
    <!-- Strategy Section -->
    <section class="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-200">Monthly Strategy</h3>
        <div class="flex items-center space-x-4">
          <UButton 
            icon="i-heroicons-chevron-left" 
            @click="prevMonth" 
            :disabled="!canGoPrev"
            variant="ghost"
            color="gray"
          />
          <span class="font-bold text-xl text-white">{{ currentMonthLabel }}</span>
          <UButton 
            icon="i-heroicons-chevron-right" 
            @click="nextMonth"
            :disabled="!canGoNext"
            variant="ghost"
            color="gray"
          />
        </div>
      </div>
      
      <div v-if="loadingStrategy" class="text-center py-8 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-2xl" />
        <p class="mt-2">Loading strategy...</p>
      </div>
      
      <div v-else-if="strategy" class="space-y-4">
        <!-- Theme Input -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Theme</label>
          <UInput v-model="strategy.theme" placeholder="e.g., Concussion Awareness" />
        </div>

        <!-- Pillars -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Content Pillars (%)</label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="text-xs text-gray-400">Education</label>
              <UInput v-model.number="strategy.pillars.education" type="number" min="0" max="100" />
            </div>
            <div>
              <label class="text-xs text-gray-400">Success Stories</label>
              <UInput v-model.number="strategy.pillars.success_stories" type="number" min="0" max="100" />
            </div>
            <div>
              <label class="text-xs text-gray-400">Thought Leadership</label>
              <UInput v-model.number="strategy.pillars.thought_leadership" type="number" min="0" max="100" />
            </div>
            <div>
              <label class="text-xs text-gray-400">Clinic Updates</label>
              <UInput v-model.number="strategy.pillars.clinic_updates" type="number" min="0" max="100" />
            </div>
          </div>
          <p class="text-xs mt-1" :class="pillarsSum === 100 ? 'text-green-400' : 'text-red-400'">
            Total: {{ pillarsSum }}% {{ pillarsSum === 100 ? '✓' : '(must equal 100%)' }}
          </p>
        </div>

        <!-- Topics -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Topics</label>
          <div class="space-y-2">
            <div v-for="(topic, idx) in strategy.topics" :key="idx" class="flex gap-2">
              <UInput v-model="strategy.topics[idx]" class="flex-1" />
              <UButton icon="i-heroicons-trash" color="red" variant="ghost" @click="removeTopic(idx)" />
            </div>
            <UButton icon="i-heroicons-plus" @click="addTopic" variant="outline" size="sm">Add Topic</UButton>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end gap-2">
          <UButton @click="saveStrategy" :loading="saving" color="primary">
            Save Strategy
          </UButton>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-400 mb-4">Error loading strategy.</p>
        <UButton @click="loadStrategy" color="primary" variant="ghost">
          Retry
        </UButton>
      </div>
    </section>

    <!-- Posts Section -->
    <section v-if="strategy" class="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-200">Content Calendar</h3>
        <UButton 
          @click="generatePosts" 
          :disabled="!isStrategyComplete || generating"
          :loading="generating"
          color="green"
        >
          Generate Posts
        </UButton>
      </div>

      <div v-if="posts.length === 0" class="text-center py-8 text-gray-500">
        No posts generated yet. Click "Generate Posts" to create content calendar.
      </div>

      <div v-else class="space-y-4">
        <div v-for="post in posts" :key="post._id" class="bg-gray-900 rounded-lg p-4 border border-gray-700 flex gap-4">
          <!-- Platform Badge -->
          <div class="flex-shrink-0">
            <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full"
                  :class="platformColor(post.platform)">
              {{ post.platform }}
            </span>
            <p class="text-xs text-gray-500 mt-2">{{ formatDate(post.scheduledDate) }}</p>
          </div>
          
          <!-- Content -->
          <div class="flex-1">
            <p v-if="post.content" class="text-sm text-gray-300">{{ post.content }}</p>
            <p v-else class="text-sm text-gray-500 italic">Content not generated yet</p>
          </div>

          <!-- Status -->
          <div class="flex-shrink-0">
            <span class="text-xs px-2 py-1 rounded" :class="statusColor(post.status)">
              {{ post.status }}
            </span>
          </div>
        </div>
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
const strategy = ref(null);

const currentMonthStr = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
});

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const pillarsSum = computed(() => {
  if (!strategy.value?.pillars) return 0;
  return Object.values(strategy.value.pillars).reduce((sum, val) => sum + (val || 0), 0);
});

const isStrategyComplete = computed(() => {
  return strategy.value && 
         strategy.value.theme && 
         pillarsSum.value === 100 && 
         strategy.value.topics?.length > 0;
});

const posts = computed(() => strategy.value?.posts || []);

// Track the actual current month (today's month)
const today = new Date();
const actualCurrentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

const canGoPrev = computed(() => true);

const canGoNext = computed(() => {
  // Cannot go beyond the actual current month
  if (currentMonthStr.value >= actualCurrentMonth) {
    return false;
  }
  // Can only go to next month if current strategy is complete
  return isStrategyComplete.value;
});

const loadStrategy = async () => {
  loadingStrategy.value = true;
  try {
    const res = await n8n.callWebhook('strategy', { month: currentMonthStr.value });
    strategy.value = res.data;
  } catch (e) {
    console.warn('Strategy not found');
    strategy.value = null;
  } finally {
    loadingStrategy.value = false;
  }
};



const saveStrategy = async () => {
  saving.value = true;
  try {
    const res = await n8n.callWebhook('strategy', strategy.value, 'POST');
    strategy.value = res.data;
  } catch (error) {
    console.error('Failed to save strategy:', error);
  } finally {
    saving.value = false;
  }
};

const generatePosts = async () => {
  generating.value = true;
  try {
    await n8n.generateContent(strategy.value._id);
    await loadStrategy(); // Reload to get generated posts
  } catch (error) {
    console.error('Failed to generate posts:', error);
  } finally {
    generating.value = false;
  }
};

const addTopic = () => {
  if (!strategy.value.topics) strategy.value.topics = [];
  strategy.value.topics.push('');
};

const removeTopic = (idx) => {
  strategy.value.topics.splice(idx, 1);
};

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1));
  loadStrategy();
};

const nextMonth = () => {
  if (!canGoNext.value) return;
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1));
  loadStrategy();
};

const platformColor = (platform) => {
  const colors = {
    'LinkedIn': 'bg-blue-600 text-white',
    'Instagram': 'bg-pink-600 text-white',
    'Facebook': 'bg-blue-700 text-white'
  };
  return colors[platform] || 'bg-gray-600 text-white';
};

const statusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-900 text-yellow-300',
    'generated': 'bg-blue-900 text-blue-300',
    'approved': 'bg-green-900 text-green-300',
    'published': 'bg-purple-900 text-purple-300'
  };
  return colors[status] || 'bg-gray-700 text-gray-300';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadStrategy();
});
</script>
