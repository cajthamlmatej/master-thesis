<template>
    <div class="underlay">
        <Header v-if="material && !rendering" v-model:menu="menu" :active="active" fixed class="player-header">
            <template #logo>
                <div class="meta">
                    <span class="name">{{ material.name }}</span>

                    <span v-t="{start: timeFromStart, slide: timeFromSlide}" class="time">player.timer</span>
                    <span v-t="{start: timeFromStart, slide: timeFromSlide}" class="time-short">player.timer-short</span>
                </div>
            </template>
            <template #navigation>
                <div class="flex gap-0-5">
                    <ChangeLanguage/>

                    <NavigationButton
                        v-if="material.method === 'MANUAL'"
                        :disabled="!hasPreviousSlide"
                        :label="$t('player.control.previous-slide')"
                        :tooltip-text="$t('player.control.previous-slide')"
                        icon="arrow-left"
                        tooltip-position="bottom"
                        @click.stop="previousSlide"
                    />
                    <NavigationButton
                        v-if="material.method === 'MANUAL'"
                        :disabled="!hasNextSlide"
                        :label="$t('player.control.next-slide')"
                        :tooltip-text="$t('player.control.next-slide')"
                        icon="arrow-right"
                        tooltip-position="bottom"
                        @click.stop="nextSlide"
                    />


                    <NavigationButton
                        v-if="material.method === 'AUTOMATIC'"
                        :icon="automaticMovement ? 'stop-circle-outline' : 'play-circle-outline'"
                        :label="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                        :tooltip-text="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                        hide-mobile
                        tooltip-position="bottom"
                        @click.stop="toggleAutomaticMovement"
                    />

                    <NavigationButton
                        v-if="material.sizing === 'MOVEMENT'"
                        :label="$t('player.control.focus')"
                        :tooltip-text="$t('player.control.focus')"
                        hide-mobile
                        icon="fit-to-screen-outline"
                        tooltip-position="bottom"
                        @click.stop="focus"
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
                        :label="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                        :tooltip-text="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                        hide-mobile
                        icon="draw-pen"
                        tooltip-position="bottom"
                        @click="drawing = !drawing"
                    />

                    <NavigationButton
                        v-if="material.user === userStore.user?.id"
                        :label="$t('player.control.edit')"
                        :to="{name: 'Editor', params: {material: route.params.material}}"
                        :tooltip-text="$t('player.control.edit')"
                        hide-mobile
                        icon="square-edit-outline"
                        tooltip-position="bottom"
                    />
                    <Dialog v-if="debugging">
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
                                v-if="material.user === userStore.user?.id"
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
                        :label="$t('player.control.leave')"
                        :to="{name: 'Dashboard'}"
                        :tooltip-text="$t('player.control.leave')"
                        hide-mobile
                        icon="exit-to-app"
                        tooltip-position="bottom"
                    />
                </div>
            </template>
        </Header>
        <Navigation v-model:menu="menu" primary full-control v-if="!rendering">
            <template #primary>
                <ChangeLanguage :header="false"/>

                <NavigationButton
                    v-if="material && material.method === 'AUTOMATIC'"
                    :icon="automaticMovement ? 'stop-circle-outline' : 'play-circle-outline'"
                    :label="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                    :tooltip-text="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                    tooltip-position="bottom"
                    @click.stop="toggleAutomaticMovement"
                />

                <NavigationButton
                    v-if="material && material.sizing === 'MOVEMENT'"
                    :label="$t('player.control.focus')"
                    :tooltip-text="$t('player.control.focus')"
                    icon="fit-to-screen-outline"
                    tooltip-position="bottom"
                    @click.stop="focus"
                />

                <NavigationButton
                    :label="$t('player.control.fullscreen')"
                    :tooltip-text="$t('player.control.fullscreen')"
                    icon="fullscreen"
                    tooltip-position="bottom"
                    @click.stop="fullscreen"
                />

                <NavigationButton
                    :label="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                    :tooltip-text="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                    icon="draw-pen"
                    tooltip-position="bottom"
                    @click="drawing = !drawing"
                />
            </template>
            <template #secondary>
                <Dialog v-if="debugging">
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
                            v-if="material && material.user === userStore.user?.id"
                            :label="$t('player.debug')"
                            :tooltip-text="$t('player.debug')"
                            icon="bug"
                            tooltip-position="bottom"
                            @click.stop="toggle"
                        />
                    </template>
                </Dialog>

                <NavigationButton
                    v-if="material && material.user === userStore.user?.id"
                    :label="$t('player.control.edit')"
                    :to="{name: 'Editor', params: {material: route.params.material}}"
                    :tooltip-text="$t('player.control.edit')"
                    icon="square-edit-outline"
                    tooltip-position="bottom"
                />

                <NavigationButton
                    :label="$t('player.control.leave')"
                    :to="{name: 'Dashboard'}"
                    :tooltip-text="$t('player.control.leave')"
                    icon="exit-to-app"
                    tooltip-position="bottom"
                />
            </template>
        </Navigation>

        <router-view/>
    </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useMaterialStore} from "@/stores/material";
import {usePlayerStore} from "@/stores/player";
import type Player from "@/editor/player/Player";
import Header from "@/components/design/header/Header.vue";
import NavigationButton from "@/components/design/navigation/NavigationButton.vue";
import ListItem from "@/components/design/list/ListItem.vue";
import {$t} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";
import {useUserStore} from "@/stores/user";

import {PlayerMode} from "@/editor/player/PlayerMode";
import {usePluginStore} from "@/stores/plugin";
import {useSeoMeta} from "unhead";

const materialStore = useMaterialStore();
const playerStore = usePlayerStore();
const userStore = useUserStore();
const pluginStore = usePluginStore();

const router = useRouter();
const route = useRoute();

const rendering = ref(route.query.rendering === 'true');
const debugging = computed(() => route.query.debug === 'true');

const menu = ref<boolean>(false);

const player = ref<Player | null>(null);

watch(() => playerStore.getPlayer(), (value) => {
    player.value = value as Player;

    if (!material) return;

    if(rendering) {
        player.value.changeMode(PlayerMode.PLAY);

        return;
    }

    if (material.value.sizing === 'MOVEMENT')
        player.value.changeMode(PlayerMode.MOVE);
    else
        player.value.changeMode(PlayerMode.PLAY);
});

const material = computed(() => materialStore.currentMaterial!);

onMounted(async () => {
    await materialStore.load();
    await pluginStore.load();

    let materialId = route.params.material as string;

    if (materialId) {
        const query = route.query.token;
        await materialStore.loadMaterial(materialId, query?.toString());
    } else {
        await router.push({name: 'Dashboard'});
        return;
    }

    useSeoMeta({
        title: $t('page.player.title', {
            name: materialStore.currentMaterial?.name ?? ''
        })
    });

    await pluginStore.loaded;
    await router.isReady();

    await playerStore.requestPlayer(route.query.slide as string, rendering.value);
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

watch(() => active.value, (value) => {
    if (!value) {
        menu.value = false;
    }
});

const click = (e: MouseEvent) => {
    if (material.value.method !== 'MANUAL') return;
    if (player.value?.getMode() === PlayerMode.DRAW) return;

    const target = e.target as HTMLElement;
    if (!target.classList.contains("player-container") && !target.classList.contains("player-content")) {
        return;
    }

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
    if (material.value.method !== 'MANUAL') return;

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

const focus = () => {
    player.value?.fitToParent();
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

const automaticMovement = ref(true);
let automaticMovementInterval = undefined as undefined | number;
let lastTime = Date.now();

const toggleAutomaticMovement = () => {
    automaticMovement.value = !automaticMovement.value;
};

onMounted(() => {
    automaticMovementInterval = setInterval(() => {
        if (material.value.method !== 'AUTOMATIC') {
            return;
        }

        if (!automaticMovement.value) {
            return;
        }

        const diff = Date.now() - lastTime;

        if (diff > material.value.automaticTime * 1000) {
            nextSlide();
            lastTime = Date.now();
        }
    }, 1000) as unknown as number;
});

onUnmounted(() => {
    if (automaticMovementInterval) clearInterval(automaticMovementInterval);
});

const drawing = ref(false);

watch(drawing, (value) => {
    const player = playerStore.getPlayer() as Player | undefined;

    if (!player) return;

    if (value) {
        player.changeMode(PlayerMode.DRAW);
    } else {
        if (material.value.sizing === 'MOVEMENT')
            player.changeMode(PlayerMode.MOVE);
        else
            player.changeMode(PlayerMode.PLAY);
    }
});

watch(() => playerStore.getActiveSlide(), (value) => {
    router.push({query: {...route.query, slide: value?.id}});
});
</script>

<style lang="scss" scoped>
.player-header {
    background-color: var(--color-background-accent);
}

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

        @media (max-width: 768px) {
            font-size: 1.2em;
        }
    }

    .time {
        font-size: 1em;

        @media (max-width: 768px) {
            display: none;
        }
    }
    .time-short {
        font-size: 0.8em;
        display: none;

        @media (max-width: 768px) {
            display: block;
        }
    }
}
</style>
