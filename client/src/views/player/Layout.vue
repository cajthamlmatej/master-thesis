<template>
    <div class="underlay">
        <Header :active="active" fixed>
            <template #logo>
                {{materialStore.currentMaterial?.name ?? "Presentation"}}
            </template>
            <template #navigation>
                <NavigationButton
                        tooltip-text="Previous slide"
                        icon="arrow-left"
                        label="Previous"
                        hide-mobile
                        tooltip-position="bottom"
                        :disabled="!hasPreviousSlide"
                        @click.stop="previousSlide"
                />
                <NavigationButton
                        tooltip-text="Next slide"
                        icon="arrow-right"
                        label="Next"
                        hide-mobile
                        tooltip-position="bottom"
                        :disabled="!hasNextSlide"
                        @click.stop="nextSlide"
                />

                <NavigationButton
                        tooltip-text="Fullscreen"
                        icon="fullscreen"
                        label="Fullscreen"
                        hide-mobile
                        tooltip-position="bottom"
                        @click.stop="fullscreen"
                />

                <NavigationButton
                        tooltip-text="Leave presentation"
                        icon="exit-to-app"
                        :to="{name: 'Dashboard'}"
                        label="Leave"
                        hide-mobile
                        tooltip-position="bottom"
                />
            </template>
        </Header>

        <router-view/>
    </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useMaterialStore} from "@/stores/material";
import {usePlayerStore} from "@/stores/player";
import type Player from "@/editor/player/Player";
import Header from "@/components/design/header/Header.vue";
import NavigationButton from "@/components/design/navigation/NavigationButton.vue";


const materialStore = useMaterialStore();
const playerStore = usePlayerStore();
const player = ref<Player | null>(null);

watch(() => playerStore.getPlayer(), (value) => {
    player.value = value as Player;
});

const route = useRoute();


onMounted(async() => {
    await materialStore.load();

    let materialId = route.params.material as string;

    if(materialId) {
        await materialStore.loadMaterial(materialId);
    }

    await playerStore.requestPlayer();
    hasNextSlide.value = !!playerStore.getSlides().find(s => s.position > playerStore.getActiveSlide()!.position);
    hasPreviousSlide.value = !!playerStore.getSlides().reverse().find(s => s.position < playerStore.getActiveSlide()!.position);

    window.addEventListener("click", click);
    window.addEventListener("keydown", keydown);
    window.addEventListener("mousemove", mousemove);
});

onUnmounted(() => {
    window.removeEventListener("click", click);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("mousemove", mousemove);
});

let cursorTimeout = undefined as undefined | number;
let active = ref<boolean>(false);

const click = (e: MouseEvent) => {
    const position = {x: e.clientX, y: e.clientY};
    const width = window.innerWidth;

    if(position.x > width / 2) {
        nextSlide();
    } else {
        previousSlide();
    }
};

const hasNextSlide = ref<boolean>(false);
const hasPreviousSlide = ref<boolean>(false);

const nextSlide = () => {
    const current = playerStore.getActiveSlide();
    const next = playerStore.getSlides().find(s => s.position > current!.position);

    if(!next) return;

    playerStore.changeSlide(next);

    hasNextSlide.value = !!playerStore.getSlides().find(s => s.position > next!.position);
    hasPreviousSlide.value = true;
};
const previousSlide = () => {
    const current = playerStore.getActiveSlide();
    const prev = playerStore.getSlides().reverse().find(s => s.position < current!.position);

    if(!prev) return;

    playerStore.changeSlide(prev);

    hasPreviousSlide.value = !!playerStore.getSlides().reverse().find(s => s.position < prev!.position);
    hasNextSlide.value = true;
};

const keydown = (e: KeyboardEvent) => {
    const current = playerStore.getActiveSlide();

    if(!current) return;

    if(["ArrowRight", "Enter", "Space", " ", "PageUp"].includes(e.key)) {
        nextSlide();
    } else if(["ArrowLeft", "PageDown", "Backspace"].includes(e.key)) {
        previousSlide();
    } else if(["Home"].includes(e.key)) {
        playerStore.changeSlide(playerStore.getSlides()[0]);
    } else if(["End"].includes(e.key)) {
        playerStore.changeSlide(playerStore.getSlides()[playerStore.getSlides().length - 1]);
    }
};

const mousemove = (e: MouseEvent) => {
    clearTimeout(cursorTimeout);

    document.body.style.cursor = "default";
    active.value = true;

    cursorTimeout = setTimeout(() => {
        document.body.style.cursor = "none";
        active.value = false;
    }, 3000) as unknown as number;
};

const fullscreen = () => {
    const element = document.documentElement;

    if(document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        element.requestFullscreen();
    }
};
</script>

<style lang="scss" scoped>
.underlay {
    width: 100%;
    height: 100%;
    background-color: black;
}
</style>
