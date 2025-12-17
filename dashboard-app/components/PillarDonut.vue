<template>
    <div
        class="pillar-donut relative inline-flex items-center justify-center"
        :style="{ width: size + 'px', height: size + 'px' }"
        role="slider"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="internalValue"
        :aria-label="label || 'Pillar percent'"
        tabindex="0"
        @keydown="onKeyDown"
    >
        <svg
            :width="size"
            :height="size"
            :viewBox="`0 0 ${size} ${size}`"
            @pointerdown="onPointerDown"
            class="block"
            style="
                touch-action: none;
                -webkit-user-select: none;
                -ms-user-select: none;
                user-select: none;
            "
        >
            <defs>
                <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" :stop-color="accent" stop-opacity="1" />
                    <stop offset="100%" :stop-color="accent" stop-opacity="1" />
                </linearGradient>
            </defs>

            <!-- Background circle -->
            <circle
                :cx="half"
                :cy="half"
                :r="radius"
                :stroke-width="strokeWidth"
                stroke="rgba(255,255,255,0.04)"
                fill="transparent"
            />

            <!-- Progress circle -->
            <circle
                :cx="half"
                :cy="half"
                :r="radius"
                :stroke-width="strokeWidth"
                stroke-linecap="round"
                :stroke="`url(#${gradId})`"
                fill="transparent"
                :style="{
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                }"
                transform=""
            />
        </svg>

        <!-- Center content: percent and optional input -->
        <div
            class="center absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
            <div
                class="text-sm font-semibold select-none"
                :style="{ color: 'var(--nv-accent)' }"
            >
                {{ Math.round(internalValue) }}%
            </div>
            <input
                v-if="editable"
                class="mt-1 text-xs text-white bg-transparent text-center border-none outline-none w-14"
                type="number"
                :min="min"
                :max="max"
                v-model.number="inputValue"
                @change="onInputChange"
                @pointerdown.stop
                style="pointer-events: auto"
                aria-label="Edit percentage"
            />
        </div>

        <!-- Label under the donut if provided -->
        <div
            v-if="label"
            class="absolute -bottom-6 text-xs text-gray-300 w-full text-center select-none"
        >
            {{ label }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";

interface Props {
    modelValue?: number;
    label?: string;
    size?: number;
    strokeWidth?: number;
    min?: number;
    max?: number;
    editable?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "change"]);

const min = props.min ?? 0;
const max = props.max ?? 100;
const editable = props.editable ?? true;
const size = props.size ?? 80;
const strokeWidth = props.strokeWidth ?? 8;
const label = props.label ?? "";

const accent =
    (
        getComputedStyle(document.documentElement).getPropertyValue(
            "--nv-accent",
        ) || ""
    ).trim() || "#ffd54f";
const gradId = "pvGrad-" + Math.random().toString(36).slice(2, 9);

const half = size / 2;
const radius = half - strokeWidth / 2;
const circumference = 2 * Math.PI * radius;

const internalValue = ref<number>(normalizePercent(props.modelValue ?? 0));
const inputValue = ref<number>(internalValue.value);

watch(
    () => props.modelValue,
    (v) => {
        if (typeof v === "number" && v !== internalValue.value) {
            internalValue.value = normalizePercent(v);
            inputValue.value = internalValue.value;
        }
    },
);

watch(internalValue, (v) => {
    emit("update:modelValue", v);
    emit("change", v);
    inputValue.value = v;
});

// compute dash offset
const dashOffset = computed(() => {
    const pct = clamp(internalValue.value, min, max) / 100;
    // strokeDashoffset pointing so 0% = full offset, 100% = 0 offset
    return String((1 - pct) * circumference);
});

function clamp(v: number, a = min, b = max) {
    return Math.max(a, Math.min(b, v));
}
function normalizePercent(v: number) {
    if (typeof v !== "number" || isNaN(v)) return 0;
    return clamp(Math.round(v));
}

/* Pointer drag handling */
let dragging = false;

function onPointerDown(e: PointerEvent) {
    // capture pointer to track outside svg
    const el = e.currentTarget as Element;
    (el as Element).setPointerCapture?.(e.pointerId);
    dragging = true;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    updateFromPointer(e);
}

function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    updateFromPointer(e);
}

function onPointerUp(e: PointerEvent) {
    dragging = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    // release pointer capture
    try {
        const el = e.currentTarget as Element;
        (el as Element).releasePointerCapture?.(e?.pointerId);
    } catch (err) {
        // ignore
    }
}

function updateFromPointer(e: PointerEvent) {
    // Compute position relative to svg center
    const target = (e.target || e.currentTarget) as Element;
    // find SVG bounding rect by traversing up to svg
    const svg = (e.target as Element).closest
        ? (e.target as Element).closest("svg")
        : null;
    const rect = svg ? (svg as SVGElement).getBoundingClientRect() : null;
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // angle in degrees where 0 is at top and increases clockwise
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // atan2 returns angle relative to x-axis; convert:
    angle = angle + 90; // rotate so 0 at top
    if (angle < 0) angle += 360;
    const pct = (angle / 360) * 100;
    internalValue.value = Math.round(pct);
}

/* Keyboard support */
function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        internalValue.value = clamp(internalValue.value - 1);
        e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        internalValue.value = clamp(internalValue.value + 1);
        e.preventDefault();
    } else if (e.key === "PageDown") {
        internalValue.value = clamp(internalValue.value - 10);
        e.preventDefault();
    } else if (e.key === "PageUp") {
        internalValue.value = clamp(internalValue.value + 10);
        e.preventDefault();
    }
}

function onInputChange() {
    internalValue.value = normalizePercent(inputValue.value);
}

/* cleanup */
onBeforeUnmount(() => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
});
</script>

<style scoped>
.pillar-donut {
    position: relative;
    display: inline-block;
}
.pillar-donut svg {
    display: block;
}
.center {
    pointer-events: none;
}
.center input {
    background: transparent;
    border: 0;
    color: white;
    width: 3.2rem;
    font-weight: 600;
}
</style>
