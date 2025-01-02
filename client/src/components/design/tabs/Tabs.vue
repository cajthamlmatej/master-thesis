<template>
    <section
        :class="classes"
    >
        <article v-if="showArrows" class="arrow" @mousedown.capture="mousedownArrow(-1)"
                 @mouseup.capture="mouseupArrow()">
            <span
                class="mdi mdi-chevron-left"
            ></span>
        </article>

        <article ref="tabsElement"
                 class="tabs-container"
                 @wheel.passive.capture="wheel"
                 @mousedown.capture="mousedown">
            <Tab v-for="tab in props.items" v-model:selected="data.selected" :text="tab.text" :value="tab.value"></Tab>

            <section ref="lineVisualiserElement" class="line-visualiser"></section>
        </article>

        <article v-if="showArrows" class="arrow" @mousedown.capture="mousedownArrow(1)"
                 @mouseup.capture="mouseupArrow()">
            <span
                class="mdi mdi-chevron-right"
            ></span>
        </article>
    </section>
</template>

<script lang="ts" setup>
import Tab from "@/components/design/tabs/Tab.vue";
import {computed, nextTick, onMounted, onUnmounted, reactive, ref, watch} from "vue";

const props = defineProps({
    fluid: {
        type: Boolean,
        default: false,
    },

    items: {
        type: Array <{
            value: string;
            text: string;
        }>,
        default: () => []
    },

    selected: {
        type: String,
        default: "",
    },

    hideLineVisualiserAnimationOnStart: {
        type: Boolean,
        default: false,
    },
})

const classes = computed(() => {
    return {
        "tabs": true,
        "tabs--fluid": props.fluid,
        "tabs--arrows": showArrows.value,
    };
});

const data = reactive({
    selected: props.selected,
});

const emit = defineEmits(['update:selected']);

watch(data, (value) => {
    emit('update:selected', value.selected);
});

watch(() => props.selected, (value) => {
    data.selected = value;
});


const wheel = (e: WheelEvent) => {
    //e.preventDefault();

    const taget = e.target;

    if (!taget || !(taget instanceof HTMLElement)) return;

    const tab = taget.closest('.tabs-container');

    if (!tab || !(tab instanceof HTMLElement)) return;

    tab.scrollLeft += e.deltaY;
};

const mousedown = (e: MouseEvent) => {
    //e.preventDefault();

    const taget = e.target;

    if (!taget || !(taget instanceof HTMLElement)) return;

    const tab = taget.closest('.tabs-container');

    if (!tab || !(tab instanceof HTMLElement)) return;

    const startX = e.pageX - tab.offsetLeft;
    const scrollLeft = tab.scrollLeft;

    const mouseMove = (e: MouseEvent) => {
        const x = e.pageX - tab.offsetLeft;
        const walk = (x - startX);
        tab.scrollLeft = scrollLeft - walk;
    }

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', mouseMove);
    });
};

onMounted(() => {
    recalculateVisibility();
    window.addEventListener('resize', resize);
});

onUnmounted(() => {
    window.removeEventListener('resize', resize);
});
const resize = async () => {
    await nextTick();

    setTimeout(() => {
        recalculateVisibility();
        updateLineVisualiser();
    }, 200);
};

const tabsElement = ref<HTMLElement | null>(null);

const showArrows = ref(false);
const recalculateVisibility = () => {
    // Get width of content vs width of container
    if (!tabsElement.value) return;

    const tabsWidth = tabsElement.value.scrollWidth;
    const containerWidth = tabsElement.value.offsetWidth;

    showArrows.value = tabsWidth > containerWidth;
};

const arrowScrollInterval = ref<NodeJS.Timeout | null>(null);
const mousedownArrow = (direction: number) => {
    if (!tabsElement.value) return;

    // Until down, scroll in direction
    const scroll = () => {
        if (tabsElement.value) {
            // animate scroll left to direction * 10
            tabsElement.value.scrollBy({
                left: direction * 100,
                behavior: 'smooth'
            });
        }
    };

    scroll();

    arrowScrollInterval.value = setInterval(scroll, 100);
};

const mouseupArrow = () => {
    if (arrowScrollInterval.value)
        clearInterval(arrowScrollInterval.value);
};

watch(() => data.selected, () => {
    if (!tabsElement.value) return;

    const tab = tabsElement.value.querySelector(`.tab[data-value="${data.selected}"]`);

    if (!tab || !(tab instanceof HTMLElement)) return;

    const tabWidth = tab.offsetWidth;
    const tabLeft = tab.offsetLeft;

    const containerLeft = tabsElement.value.scrollLeft;

    tabsElement.value.scrollBy({
        left: tabLeft - containerLeft + tabWidth / 2 - tabsElement.value.offsetWidth / 2,
        behavior: 'smooth'
    });
});


const lineVisualiserElement = ref<HTMLElement | null>(null);

onMounted(() => {
    updateLineVisualiser(true);
});

watch(() => data.selected, () => {
    updateLineVisualiser();
});

const updateLineVisualiser = (start: boolean = false) => {
    if (!tabsElement.value || !lineVisualiserElement.value) return;

    const tab = tabsElement.value.querySelector(`.tab[data-value="${data.selected}"]`);

    if (!tab || !(tab instanceof HTMLElement)) return;

    const SIZE = 0.4;

    const tabWidth = tab.offsetWidth * SIZE;
    const tabLeft = tab.offsetLeft;

    if (start && props.hideLineVisualiserAnimationOnStart) {
        console.log('start');
        lineVisualiserElement.value.style.transition = 'none';
    } else {
        lineVisualiserElement.value.style.transition = '';
    }

    lineVisualiserElement.value.style.width = `${tabWidth}px`;
    lineVisualiserElement.value.style.transform = `translateX(${tabLeft + (tab.offsetWidth * (1 - SIZE) / 2)}px)`;

    nextTick(() => {
        setTimeout(() => {
            lineVisualiserElement.value!.style.transition = '';
        }, 100);
    });
};
</script>

<style lang="scss" scoped>

section.tabs {
    position: relative;

    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;

    -webkit-user-select: none;
    user-select: none;

    margin: 0 0 1em;

    &.tabs--fluid {
        > .tabs-container {
            > .tab {
                width: 100%;

                @media (max-width: 768px) {
                    width: auto;
                }
            }
        }
    }

    > .tabs-container {
        flex: 1;

        display: flex;
        justify-content: start;
        align-items: stretch;
        gap: 0.5em;

        width: 100%;

        overflow-x: auto;

        -webkit-user-select: none;
        user-select: none;

        &::-webkit-scrollbar {
            display: none;
        }

        position: relative;
        //padding-bottom: 0.25em;

        .line-visualiser {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 0.25em;
            width: 3em;
            display: block;
            border-radius: 0.25em;
            background-color: var(--color-tab-border-active);
            transition: all 1s cubic-bezier(0.22, 0.79, 0.77, 1.11);
        }
    }

    &--arrows {
        gap: 0.25em;

        .arrow {
            width: 1.5em;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            .mdi {
                font-size: 1.75em;
            }
        }
    }
}
</style>