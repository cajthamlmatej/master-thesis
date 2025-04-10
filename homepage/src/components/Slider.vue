<template>
    <article class="slider" ref="sliderElement">
        <div class="content">
            <div class="item" v-for="(item, index) in currentItems" :key="index">
                <img :src="item.thumbnail" alt="Thumbnail" />
                <div class="info">
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.author }}</p>
                </div>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from "vue";

type Item = {
    name: string,
    thumbnail: string,
    author: string,
    link: string
};

const props = defineProps({
    items: {
        type: Array as () => Item[],
        default: () => []
    },
    startDirection: {
        type: String,
        default: 'left',
    },
});

const currentItems = ref(props.items);

const sliderElement = ref<HTMLElement | null>(null);
const hover = ref(false);

const handleHover = (target: boolean) =>{
    const content = sliderElement.value?.querySelector('.content') as HTMLElement;

    if(target) {
        hover.value = true;
        content.style.transitionProperty = 'none';
    } else {
        hover.value = false;
        content.style.transitionProperty = 'transform';
    }
}

const open = (item: Item) => {
    const link = item.link;
    if (link) {
        window.open(link, '_blank');
    }
}

onMounted(() => {
    if (sliderElement.value && sliderElement.value !== null) {
        sliderElement.value.addEventListener('mouseenter', () => {
            handleHover(true);
        });
        sliderElement.value.addEventListener('mouseleave', () => {
            handleHover(false);
        });

        const content = sliderElement.value?.querySelector('.content') as HTMLElement;

        let direction = props.startDirection === 'left' ? 1 : -1;
        if (content) {
            if (direction === 1) {
                content.style.transform = `translateX(00px)`;
            } else {
                content.style.transform = `translateX(-${(content.scrollWidth - (sliderElement.value?.clientWidth??0)) - 100}px)`;
            }

            const move = () => {
                requestAnimationFrame(move);
                if (hover.value) return;

                const currentTransform = getComputedStyle(content).transform;
                const matrix = new DOMMatrix(currentTransform);
                const newTransform = `translateX(${matrix.m41 - (5 * direction)}px)`;
                content.style.transform = newTransform;

                if(direction === -1) {
                    if(matrix.m41 >= 0) {
                        direction = 1;
                    }
                } else {
                    if(matrix.m41 <= -((content.scrollWidth - (sliderElement.value?.clientWidth??0) + 25))) {
                        direction = -1;
                    }
                }
            };

            nextTick(() => {
                setTimeout(() => {
                    requestAnimationFrame(move);
                }, 100);
            })
        }


        sliderElement.value?.addEventListener('mousedown', (event: MouseEvent) => {
            const startX = event.clientX;
            const startY = event.clientY;
            let lastX = startX;

            const move = (event: MouseEvent) => {
                handleHover(true);
                event.preventDefault();
                const currentX = event.clientX;
                const deltaX = lastX - currentX;
                lastX = currentX;

                const oldTransform = Number(content.style.transform.split('(')[1].split('px')[0]);
                
                if(oldTransform- deltaX >= 0) {
                    content.style.transform = `translateX(0px)`;
                    return;
                } else if(oldTransform- deltaX <= -((content.scrollWidth - (sliderElement.value?.clientWidth??0) + 25))) {
                    content.style.transform = `translateX(-${(content.scrollWidth - (sliderElement.value?.clientWidth??0)) +25}px)`;
                    return;
                }
                
                if (Math.abs(deltaX) > 0) {
                    content.style.transform = `translateX(${oldTransform - deltaX}px)`;
                }
            };

            const up = (event: MouseEvent) => {
                const endX = event.clientX;
                const endY = event.clientY;

                const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

                document.removeEventListener('mouseup', up);
                document.removeEventListener('mousemove', move);

                event.preventDefault();
                event.stopPropagation();

                if(distance < 10) {
                    const target = event.target as HTMLElement;

                    const item = target.closest('.item') as HTMLElement;

                    if(item) {
                        const index = Array.from(sliderElement.value?.querySelectorAll('.item') as NodeListOf<HTMLElement>).indexOf(item);
                        const itemData = props.items[index];
                        open(itemData);
                    }

                    return;
                }
            }

            document.addEventListener('mouseup', up);
            document.addEventListener('mousemove', move);
        });
    }
})
</script>

<style scoped lang="scss">
.slider {
    width: 100%;
    height: 20em;
    overflow: hidden;
    position: relative;
    padding: 1em;
    // disable text selection
    user-select: none;

    .content {
        transition: transform 0.3s ease;
        transform: translateX(0);
        width: 100%;
        height: 100%;

        display: flex;
        gap: 1em;

        .item {
            flex: 0 0 auto;
            width: 12em;
            height: fit-content;
            gap: 0.5em;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            position: relative;
            border-radius: 1rem;
            transition: background-color 0.3s ease, transform 0.3s ease;

            img {
                width: 100%;
                aspect-ratio: 1/1;
                object-fit: cover;
                border-radius: 1rem;

                // Not selectable
                user-select: none;
                pointer-events: none;
            }

            .info {
                //position: absolute;
                width: 100%;
                padding: 0.5rem 1rem;

                h3 {
                    font-size: 1.2em;
                    margin-bottom: 5px;
                }

                p {
                    font-size: 0.9em;
                    margin-bottom: 0;
                }
            }

            &:hover {
                background-color: rgba(144, 126, 179, 0.78);
                transform: scale(1.05);
                cursor: pointer;
            }
        }
    }
}
</style>