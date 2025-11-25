<template>
  <div class="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700">
    <h3 class="text-xl font-bold mb-6">Settings</h3>
    
    <div class="space-y-6">
        <!-- API Keys -->
        <div>
            <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Social Media Keys</h4>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm mb-1">OpenAI API Key</label>
                    <input type="password" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none" placeholder="sk-..." />
                </div>
                <div>
                    <label class="block text-sm mb-1">LinkedIn Access Token</label>
                    <input type="password" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none" />
                </div>
                <div>
                    <label class="block text-sm mb-1">Instagram Graph API Key</label>
                    <input type="password" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none" />
                </div>
            </div>
        </div>

        <!-- Schedule -->
        <div>
            <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Default Schedule</h4>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm mb-1">Posts per Week</label>
                    <input type="number" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none" value="3" />
                </div>
                <div>
                    <label class="block text-sm mb-1">Publish Time</label>
                    <input type="time" class="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none" value="10:00" />
                </div>
            </div>
        </div>

        <div class="pt-4 border-t border-gray-700">
            <button class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors">
                Save Settings
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
</script>
