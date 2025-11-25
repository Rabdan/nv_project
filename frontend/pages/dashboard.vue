<template>
  <div class="space-y-8">
    <!-- Strategy Section -->
    <section class="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-medium text-gray-200">Monthly Strategy</h3>
          <span v-if="strategy?.status === 'new'" class="text-xs px-2 py-1 bg-blue-600 text-white rounded-full font-medium">
            new
          </span>
        </div>
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
      
      <div v-else-if="strategy" class="space-y-6">
        <!-- Theme Input - Half Width -->
        <div class="w-1/2">
          <label class="block text-sm font-medium text-gray-300 mb-2">Theme</label>
          <UTextarea 
            v-model="strategy.theme" 
            placeholder="e.g., Concussion Awareness Month - Focus on recovery and prevention"
            :rows="2"
            autoresize
          />
        </div>

        <!-- Pillars and Topics - Two Column Layout -->
        <div class="grid grid-cols-2 gap-8">
          <!-- Pillars Column -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-3">Content Pillars (%)</label>
            <div class="space-y-3">
              <div v-for="(value, key) in strategy.pillars" :key="key" class="flex items-center gap-3">
                <label class="text-sm text-gray-300 w-40 capitalize">{{ key.replace('_', ' ') }}</label>
                <div class="flex items-center gap-2">
                  <UButton 
                    icon="i-heroicons-minus" 
                    size="xs" 
                    color="gray" 
                    variant="soft"
                    @click="decrementPillar(key)"
                    :disabled="strategy.pillars[key] <= 0"
                  />
                  <span class="text-white font-medium w-12 text-center">{{ strategy.pillars[key] }}</span>
                  <UButton 
                    icon="i-heroicons-plus" 
                    size="xs" 
                    color="gray" 
                    variant="soft"
                    @click="incrementPillar(key)"
                    :disabled="strategy.pillars[key] >= 100"
                  />
                </div>
              </div>
            </div>
            <p class="text-xs mt-3" :class="pillarsSum === 100 ? 'text-green-400' : 'text-red-400'">
              Total: {{ pillarsSum }}% {{ pillarsSum === 100 ? '✓' : '(must equal 100%)' }}
            </p>
          </div>

          <!-- Topics Column -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-3">Topics</label>
            <div class="flex flex-wrap gap-2 mb-3">
              <div 
                v-for="(topic, idx) in strategy.topics" 
                :key="idx" 
                class="inline-flex items-center gap-2 bg-gray-700 text-gray-200 px-3 py-1.5 rounded-full text-sm"
              >
                <span>{{ topic }}</span>
                <button 
                  @click="removeTopic(idx)"
                  class="hover:text-red-400 transition-colors"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="flex gap-2">
              <UInput 
                v-model="newTopic" 
                placeholder="Add a topic..."
                @keyup.enter="addTopicFromInput"
                class="flex-1"
              />
              <UButton 
                icon="i-heroicons-plus" 
                @click="addTopicFromInput" 
                variant="soft"
                :disabled="!newTopic.trim()"
              >
                Add Topic
              </UButton>
            </div>
          </div>
        </div>

        <!-- Schedule Configuration - Collapsible -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-300 mb-2">Publishing Schedule</label>
          
          <!-- LinkedIn Schedule -->
          <UAccordion :items="[{ label: 'LinkedIn', icon: 'i-simple-icons-linkedin', defaultOpen: false }]">
            <template #default>
              <div class="p-4 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-2">Time</label>
                    <UInput 
                      v-model="strategy.schedule.linkedin.time" 
                      type="time"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-2">Timezone</label>
                    <UInput 
                      v-model="strategy.schedule.linkedin.timezone" 
                      placeholder="America/New_York"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-2">Days of Week</label>
                  <div class="flex gap-2">
                    <UButton
                      v-for="day in daysOfWeek"
                      :key="day.value"
                      size="sm"
                      :color="strategy.schedule.linkedin.days.includes(day.value) ? 'primary' : 'gray'"
                      :variant="strategy.schedule.linkedin.days.includes(day.value) ? 'solid' : 'outline'"
                      @click="toggleDay('linkedin', day.value)"
                    >
                      {{ day.label }}
                    </UButton>
                  </div>
                </div>
              </div>
            </template>
          </UAccordion>

          <!-- Instagram Schedule -->
          <UAccordion :items="[{ label: 'Instagram', icon: 'i-simple-icons-instagram', defaultOpen: false }]">
            <template #default>
              <div class="p-4 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-2">Time</label>
                    <UInput 
                      v-model="strategy.schedule.instagram.time" 
                      type="time"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-2">Timezone</label>
                    <UInput 
                      v-model="strategy.schedule.instagram.timezone" 
                      placeholder="America/New_York"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-2">Days of Week</label>
                  <div class="flex gap-2">
                    <UButton
                      v-for="day in daysOfWeek"
                      :key="day.value"
                      size="sm"
                      :color="strategy.schedule.instagram.days.includes(day.value) ? 'primary' : 'gray'"
                      :variant="strategy.schedule.instagram.days.includes(day.value) ? 'solid' : 'outline'"
                      @click="toggleDay('instagram', day.value)"
                    >
                      {{ day.label }}
                    </UButton>
                  </div>
                </div>
              </div>
            </template>
          </UAccordion>

          <!-- Facebook Schedule -->
          <UAccordion :items="[{ label: 'Facebook', icon: 'i-simple-icons-facebook', defaultOpen: false }]">
            <template #default>
              <div class="p-4 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-2">Time</label>
                    <UInput 
                      v-model="strategy.schedule.facebook.time" 
                      type="time"
                    />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-2">Timezone</label>
                    <UInput 
                      v-model="strategy.schedule.facebook.timezone" 
                      placeholder="America/New_York"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-2">Days of Week</label>
                  <div class="flex gap-2">
                    <UButton
                      v-for="day in daysOfWeek"
                      :key="day.value"
                      size="sm"
                      :color="strategy.schedule.facebook.days.includes(day.value) ? 'primary' : 'gray'"
                      :variant="strategy.schedule.facebook.days.includes(day.value) ? 'solid' : 'outline'"
                      @click="toggleDay('facebook', day.value)"
                    >
                      {{ day.label }}
                    </UButton>
                  </div>
                </div>
              </div>
            </template>
          </UAccordion>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end gap-2">
          <UButton @click="saveStrategy" :loading="saving" color="primary" size="lg">
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

const daysOfWeek = [
  { label: 'Mon', value: 'Mon' },
  { label: 'Tue', value: 'Tue' },
  { label: 'Wed', value: 'Wed' },
  { label: 'Thu', value: 'Thu' },
  { label: 'Fri', value: 'Fri' },
  { label: 'Sat', value: 'Sat' },
  { label: 'Sun', value: 'Sun' }
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

// Calculate next month from today
const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

const canGoPrev = computed(() => true);

const canGoNext = computed(() => {
  // Can navigate up to one month beyond current month
  if (currentMonthStr.value >= nextMonthStr) {
    return false;
  }
  // If we're at current month, can always go to next month
  if (currentMonthStr.value === actualCurrentMonth) {
    return true;
  }
  // For past months, can only go forward if strategy is complete
  return isStrategyComplete.value;
});

const loadStrategy = async () => {
  loadingStrategy.value = true;
  try {
    const res = await n8n.getStrategy({ month: currentMonthStr.value });
    strategy.value = res.data;
    console.log(strategy.value);
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
    const res = await n8n.saveStrategy(strategy.value);
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

const newTopic = ref('');

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
    newTopic.value = '';
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
