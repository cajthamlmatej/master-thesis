<template>
    <div class="underlay">
        <Header :active="active" fixed>
            <template #logo>
                <div v-if="materialStore.currentMaterial" class="meta">
                    <span class="name">{{ materialStore.currentMaterial.name }}</span>

                    <span v-t="{start: timeFromStart, slide: timeFromSlide}" class="time">player.timer</span>
                </div>
            </template>
            <template #navigation>
                <ChangeLanguage/>

                <Dialog>
                    <template #default>
                        <Card dialog>
                            <p v-t class="title">player.variables.title</p>

                            <List>
                                <ListItem v-for="variable in Object.keys(playerStore.variables) ?? []" :key="variable">
                                    <span>{{ variable }}</span>
                                    <pre><code>{{ playerStore.variables[variable] }}</code></pre>
                                </ListItem>
                                <ListItem v-if="Object.keys(playerStore.variables).length === 0">
                                    <span v-t>player.variables.not-found</span>
                                </ListItem>
                            </List>
                        </Card>
                    </template>
                    <template #activator="{toggle}">
                        <NavigationButton
                            :label="$t('player.debug')"
                            :tooltip-text="$t('player.debug')"
                            hide-mobile
                            icon="bug"
                            tooltip-position="bottom"
                            @click.stop="toggle"
                        />
                    </template>
                </Dialog>

                <NavigationButton
                    :disabled="!hasPreviousSlide"
                    :label="$t('player.control.previous-slide')"
                    :tooltip-text="$t('player.control.previous-slide')"
                    hide-mobile
                    icon="arrow-left"
                    tooltip-position="bottom"
                    @click.stop="previousSlide"
                />
                <NavigationButton
                    :disabled="!hasNextSlide"
                    :label="$t('player.control.next-slide')"
                    :tooltip-text="$t('player.control.next-slide')"
                    hide-mobile
                    icon="arrow-right"
                    tooltip-position="bottom"
                    @click.stop="nextSlide"
                />

                <NavigationButton
                    :label="$t('player.control.fullscreen')"
                    :tooltip-text="$t('player.control.fullscreen')"
                    hide-mobile
                    icon="fullscreen"
                    tooltip-position="bottom"
                    @click.stop="fullscreen"
                />

                <NavigationButton
                    :label="$t('player.control.edit')"
                    :to="{name: 'Editor', params: {material: route.params.material}}"
                    :tooltip-text="$t('player.control.edit')"
                    hide-mobile
                    icon="square-edit-outline"
                    tooltip-position="bottom"
                />

                <NavigationButton
                    :label="$t('player.control.leave')"
                    :to="{name: 'Dashboard'}"
                    :tooltip-text="$t('player.control.leave')"
                    hide-mobile
                    icon="exit-to-app"
                    tooltip-position="bottom"
                />
            </template>
        </Header>

        <router-view/>
    </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {useMaterialStore} from "@/stores/material";
import {usePlayerStore} from "@/stores/player";
import type Player from "@/editor/player/Player";
import Header from "@/components/design/header/Header.vue";
import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import ListItem from "@/components/design/list/ListItem.vue";
import {$t} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";

const materialStore = useMaterialStore();
const playerStore = usePlayerStore();
const player = ref<Player | null>(null);

watch(() => playerStore.getPlayer(), (value) => {
    player.value = value as Player;
});

const route = useRoute();


onMounted(async () => {
    await materialStore.load();

    let materialId = route.params.material as string;

    if (materialId) {
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
    if (cursorTimeout) clearTimeout(cursorTimeout);
    window.removeEventListener("click", click);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("mousemove", mousemove);
});

let cursorTimeout = undefined as undefined | number;
let active = ref<boolean>(false);

const click = (e: MouseEvent) => {
    const position = {x: e.clientX, y: e.clientY};
    const width = window.innerWidth;

    if (position.x > width / 4 * 3) {
        nextSlide();
    } else if (position.x < width / 4) {
        previousSlide();
    }
};

const hasNextSlide = ref<boolean>(false);
const hasPreviousSlide = ref<boolean>(false);

const nextSlide = () => {
    const current = playerStore.getActiveSlide();
    const next = playerStore.getSlides().find(s => s.position > current!.position);

    if (!next) return;

    playerStore.changeSlide(next);

    hasNextSlide.value = !!playerStore.getSlides().find(s => s.position > next!.position);
    hasPreviousSlide.value = true;
};
const previousSlide = () => {
    const current = playerStore.getActiveSlide();
    const prev = playerStore.getSlides().reverse().find(s => s.position < current!.position);

    if (!prev) return;

    playerStore.changeSlide(prev);

    hasPreviousSlide.value = !!playerStore.getSlides().reverse().find(s => s.position < prev!.position);
    hasNextSlide.value = true;
};

const keydown = (e: KeyboardEvent) => {
    const current = playerStore.getActiveSlide();

    if (!current) return;

    if (["ArrowRight", "Enter", "Space", " ", "PageUp"].includes(e.key)) {
        nextSlide();
    } else if (["ArrowLeft", "PageDown", "Backspace"].includes(e.key)) {
        previousSlide();
    } else if (["Home"].includes(e.key)) {
        playerStore.changeSlide(playerStore.getSlides()[0]);
    } else if (["End"].includes(e.key)) {
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

    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        element.requestFullscreen();
    }
};
const timeFromStart = ref<string>("00:00");
const timeFromSlide = ref<string>("00:00");
let timeInterval = undefined as undefined | number;
onMounted(() => {
    timeInterval = setInterval(() => {
        {
            const time = playerStore.playerTime;

            const diff = Date.now() - time;

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            if (hours > 0) {
                timeFromStart.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                timeFromStart.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }

        {
            const time = playerStore.slideTime;

            const diff = Date.now() - time;

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            if (hours > 0) {
                timeFromSlide.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                timeFromSlide.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }

    }, 1000) as unknown as number;
});

onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval);
});
</script>

<style lang="scss" scoped>
.underlay {
    width: 100%;
    height: 100%;
    background-color: black;
}

.meta {
    display: flex;
    flex-direction: column;
    gap: 0.1em;

    .name {
        font-size: 1.5em;
        font-weight: bold;
    }

    .time {
        font-size: 1em;
    }
}
</style>
