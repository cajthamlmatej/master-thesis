<template>
    <div class="underlay">
        <Header v-if="material && !rendering" v-model:menu="menu" :active="active" class="player-header" fixed>
            <template #logo>
                <div class="meta">
                    <span class="name">{{ material.name }}</span>

                    <span class="addition">
                        <span v-if="!watching" class="time">
                            <span class="mdi mdi-timer"></span>
                            {{ timeFromStart }}
                        </span>
                        <span v-if="material.slides.length > 1" class="count">
                            <span class="mdi mdi-cards-variant"></span>
                            {{ currentSlide + 1 }} / {{ material.slides.length }}
                        </span>
                        <span v-if="!watching && material.slides.length > 1" class="time">
                            <span class="mdi mdi-cards-variant"></span>
                            {{ timeFromSlide }}
                        </span>
                        <!-- <span v-t="{start: timeFromStart, slide: timeFromSlide}" class="time">player.timer</span>
                        <span v-t="{start: timeFromStart, slide: timeFromSlide}" class="time-short">player.timer-short</span> -->
                        <span v-if="watchStarted" class="watchers">
                            <span class="mdi mdi-account-multiple"></span>
                            {{ watcherCount }}
                        </span>
                    </span>
                </div>
            </template>
            <template #navigation>
                <div class="flex gap-0-5">
                    <ChangeLanguage/>

                    <Dialog
                        v-if="!watching && canStartWatch">
                        <template #activator={toggle}>
                            <NavigationButton
                                :label="$t('player.control.share')"
                                :tooltip-text="$t('player.control.share')"
                                icon="share-variant"
                                tooltip-position="bottom"
                                @click.stop="toggle"
                            />
                        </template>
                        <template #default>
                            <Card v-if="material.visibility === 'PUBLIC'" dialog>
                                <Tabs
                                    v-model:selected="shareType"
                                    :items="[
                                    {
                                        text: $t('player.share.share-link.title'),
                                        value: 'SHARE_LINK'
                                    },
                                    {
                                        text: $t('player.share.watch-link.title'),
                                        value: 'WATCH_LINK'
                                    }
                                ]"
                                    fluid
                                ></Tabs>

                                <div v-if="shareType === 'SHARE_LINK'">
                                    <p v-t class="description">player.share.share-link.description</p>
                                </div>
                                <div v-else-if="watchStarted">
                                    <p v-t class="description">player.share.watch-link.description</p>

                                    <div v-if="link" class="flex flex-justify-center  pt-1">
                                        <qrcode-vue :margin="3" :size="200" :value="link"
                                                    background="white"
                                                    foreground="black"
                                                    level="H"
                                                    render-as="svg"
                                        ></qrcode-vue>
                                    </div>

                                    <p class="code">
                                        {{ watchCode }}
                                    </p>
                                </div>
                                <div v-else>
                                    <p v-t class="description">player.share.watch-link.description</p>

                                    <Button
                                        class="mt-1"
                                        color="primary"
                                        icon="transit-connection-variant"
                                        @click="watchStarted = true"
                                    >
                                        <span v-t>player.share.watch-link.button</span>
                                    </Button>
                                </div>


                                <div
                                    v-if="link && (shareType === 'SHARE_LINK' || watchStarted)"
                                    class="flex flex-justify-space-between flex-align-center gap-2 pt-1">
                                    <div class="flex-grow">
                                        <Input v-model:value="link" :readonly="true" hide-error
                                               hide-label></Input>
                                    </div>

                                    <div>
                                        <Button
                                            color="primary"
                                            icon="content-copy"
                                            @click="copyLink"
                                        ></Button>
                                    </div>
                                </div>
                            </Card>
                            <Card v-else dialog>
                                <p v-t class="title">player.share.notPublic.title</p>
                                <p v-t>player.share.notPublic.description</p>
                            </Card>
                        </template>
                    </Dialog>

                    <Dialog
                        v-if="!watching && !canStartWatch">
                        <template #activator={toggle}>
                            <NavigationButton
                                :label="$t('player.control.watch')"
                                :tooltip-text="$t('player.control.watch')"
                                icon="share-variant"
                                tooltip-position="bottom"
                                @click.stop="toggle"
                            />
                        </template>
                        <template #default="{toggle}">
                            <Card dialog>
                                <p v-t class="title">player.share.join.title</p>

                                <p v-t>player.share.join.description</p>

                                <Input v-model:value="watchCode"
                                       :label="$t('player.share.join.code')"
                                       :validators="[
                                            (value: string) => value.length === 9 || $t('player.share.join.error')
                                       ]"
                                       class="mt-1"
                                ></Input>

                                <div class="flex flex-justify-end mt-1">
                                    <Button
                                        :disabled="watchCode?.length !== 9"
                                        color="primary"
                                        icon="transit-connection-variant"
                                        @click="() => {joinWithCode(); toggle()}">
                                        <span v-t>player.share.join.join</span>
                                    </Button>
                                </div>
                            </Card>
                        </template>
                    </Dialog>

                    <NavigationButton
                        v-if="material.method === 'MANUAL' && !watching"
                        :disabled="!hasPreviousSlide"
                        :label="$t('player.control.previous-slide')"
                        :tooltip-text="$t('player.control.previous-slide')"
                        icon="arrow-left"
                        tooltip-position="bottom"
                        @click.stop="previousSlide"
                    />
                    <NavigationButton
                        v-if="material.method === 'MANUAL' && !watching"
                        :disabled="!hasNextSlide"
                        :label="$t('player.control.next-slide')"
                        :tooltip-text="$t('player.control.next-slide')"
                        icon="arrow-right"
                        tooltip-position="bottom"
                        @click.stop="nextSlide"
                    />


                    <NavigationButton
                        v-if="material.method === 'AUTOMATIC' && !watching"
                        :icon="automaticMovement ? 'stop-circle-outline' : 'play-circle-outline'"
                        :label="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                        :tooltip-text="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                        hide-mobile
                        tooltip-position="bottom"
                        @click.stop="toggleAutomaticMovement"
                    />

                    <NavigationButton
                        v-if="material.sizing === 'MOVEMENT' && !watching"
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
                        v-if="!watching"
                        :label="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                        :tooltip-text="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                        hide-mobile
                        icon="draw-pen"
                        tooltip-position="bottom"
                        @click="drawing = !drawing"
                    />

                    <NavigationButton
                        v-if="canStartWatch && !watching"
                        :label="$t('player.control.edit')"
                        :to="{name: 'Editor', params: {material: route.params.material}}"
                        :tooltip-text="$t('player.control.edit')"
                        hide-mobile
                        icon="square-edit-outline"
                        tooltip-position="bottom"
                        @click="communicator.getPlayerRoom()?.destroy()"
                    />
                    <Dialog v-if="debugging && !watching">
                        <template #default>
                            <Card dialog>
                                <p v-t class="title">player.debug.variables.title</p>

                                <List class="mb-2">
                                    <ListItem v-for="variable in Object.keys(playerStore.variables) ?? []"
                                              :key="variable">
                                        <span>{{ variable }}</span>
                                        <pre><code>{{ playerStore.variables[variable] }}</code></pre>
                                    </ListItem>
                                    <ListItem v-if="Object.keys(playerStore.variables).length === 0">
                                        <span v-t>player.debug.variables.not-found</span>
                                    </ListItem>
                                </List>

                                <p v-t class="title">player.debug.plugin.title</p>

                                <Dialog>
                                    <template #default="{toggle}">
                                        <Card dialog>
                                            <PluginLocalImport @done="() => {toggle(); refresh();}"/>
                                        </Card>
                                    </template>
                                    <template #activator="{toggle}">
                                        <Button
                                            class="mt-1"
                                            icon="package-variant-plus"
                                            @click="toggle"
                                        >
                                            <span v-t>player.debug.plugin.addLocal</span>
                                        </Button>
                                    </template>
                                </Dialog>
                            </Card>
                        </template>
                        <template #activator="{toggle}">
                            <NavigationButton
                                v-if="material && material.user === userStore.user?.id"
                                :label="$t('player.debug.title')"
                                :tooltip-text="$t('player.debug.title')"
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
                        @click="communicator.getPlayerRoom()?.destroy()"
                    />
                </div>
            </template>
        </Header>
        <Navigation v-if="!rendering" v-model:menu="menu" full-control primary>
            <template #primary>
                <ChangeLanguage :header="false"/>

                <NavigationButton
                    v-if="material && material.method === 'AUTOMATIC' && !watching"
                    :icon="automaticMovement ? 'stop-circle-outline' : 'play-circle-outline'"
                    :label="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                    :tooltip-text="automaticMovement ? $t('player.control.automatic-stop') : $t('player.control.automatic-play')"
                    tooltip-position="bottom"
                    @click.stop="toggleAutomaticMovement"
                />

                <NavigationButton
                    v-if="material && material.sizing === 'MOVEMENT' && !watching"
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
                    v-if="!watching"
                    :label="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                    :tooltip-text="player?.getMode() !== PlayerMode.DRAW ? $t('player.control.enable-draw') : $t('player.control.disable-draw')"
                    icon="draw-pen"
                    tooltip-position="bottom"
                    @click="drawing = !drawing"
                />
            </template>
            <template #secondary>
                <Dialog v-if="debugging && !watching">
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


                        <Dialog>
                            <template #default>
                                <Card dialog>
                                    <PluginLocalImport/>
                                </Card>
                            </template>
                            <template #activator="{toggle}">
                                <Button
                                    class="mt-1"
                                    icon="package-variant-plus"
                                    @click="toggle"
                                >
                                    <span v-t>upload</span>
                                </Button>
                            </template>
                        </Dialog>
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
                    v-if="material && canStartWatch && !watching"
                    :label="$t('player.control.edit')"
                    :to="{name: 'Editor', params: {material: route.params.material}}"
                    :tooltip-text="$t('player.control.edit')"
                    icon="square-edit-outline"
                    tooltip-position="bottom"
                    @click="communicator.getPlayerRoom()?.destroy()"
                />

                <NavigationButton
                    :label="$t('player.control.leave')"
                    :to="{name: 'Dashboard'}"
                    :tooltip-text="$t('player.control.leave')"
                    icon="exit-to-app"
                    tooltip-position="bottom"
                    @click="communicator.getPlayerRoom()?.destroy()"
                />
            </template>
        </Navigation>

        <router-view/>

        <Dialog v-model:value="watchFailed" persistent>
            <Card dialog>
                <p v-t class="title">player.share.watch.failed.title</p>
                <p v-t>player.share.watch.failed.description</p>

                <Button class="mt-1" @click="tryWithoutCode">
                    <span v-t>player.share.watch.failed.button</span>
                </Button>
            </Card>
        </Dialog>

        <Dialog :value="joining && !watchFailed" persistent>
            <Card dialog>
                <p v-t class="title">player.share.watch.loading.title</p>

                <div class="flex flex-justify-center loader">
                    <span class="mdi mdi-loading mdi-spin"></span>
                </div>
            </Card>
        </Dialog>

        <Dialog v-model:value="playerStore.watchEnded" persistent>
            <Card dialog>
                <p v-t class="title">player.share.watch.ended.title</p>
                <p v-t>player.share.watch.ended.description</p>

                <Button class="mt-1" @click="tryWithoutCode">
                    <span v-t>player.share.watch.ended.button</span>
                </Button>
            </Card>
        </Dialog>

        <div v-if="watchStarted" class="watch">
            <qrcode-vue
                :margin="3"
                :size="200"
                :value="link"
                background="white"
                foreground="black"
                level="H"
                render-as="svg"
            ></qrcode-vue>

            <span class="watch--code">{{ watchCode }}</span>
        </div>
    </div>

    <CommunicatorObserver type="player"/>
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
import {$t, translation} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";
import {useUserStore} from "@/stores/user";

import {PlayerMode} from "@/editor/player/PlayerMode";
import {usePluginStore} from "@/stores/plugin";
import {useSeoMeta} from "unhead";
import {generateToken} from "@/utils/Generators";
import QrcodeVue from 'qrcode.vue'
import {communicator} from "@/api/websockets";
import Card from "@/components/design/card/Card.vue";
import PluginLocalImport from "@/components/plugin/manage/PluginLocalImport.vue";
import {useEditorStore} from "@/stores/editor";
import CommunicatorObserver from "@/components/CommunicatorObserver.vue";

const materialStore = useMaterialStore();
const playerStore = usePlayerStore();
const userStore = useUserStore();
const pluginStore = usePluginStore();

const router = useRouter();
const route = useRoute();

const rendering = computed(() => route.query.rendering === 'true');
const debugging = computed(() => route.query.debug === 'true');

const joining = ref(false);

const watching = ref(false);
const watchCode = ref<string | null>(null);
const watchFailed = ref(false);
const shareType = ref<string>('SHARE_LINK');
const canStartWatch = computed(() => {
    return materialStore.currentMaterial?.user === userStore.user?.id || materialStore.currentMaterial?.attendees.find(a => typeof a == "object" ? a.id === userStore.user?.id : false) !== undefined;
});
const watchStarted = ref(false);

onUnmounted(() => {
    communicator.getPlayerRoom()?.destroy();
});

const link = computed(() => {
    if (!watchCode.value) {
        return undefined;
    }

    const domain = window.location.origin;
    if (shareType.value === 'SHARE_LINK') {
        const url = router.resolve({
            name: "Player",
            params: {
                material: materialStore.currentMaterial?.id,
                language: translation.getLanguage(),
            },
        })

        return new URL(url.href, domain).href
    } else {
        const url = router.resolve({
            name: "Player",
            params: {
                material: materialStore.currentMaterial?.id,
                language: translation.getLanguage(),
            },
            query: {
                watch: watchCode.value,
            }
        });

        return new URL(url.href, domain).href
    }
})
const copyLink = () => {
    navigator.clipboard.writeText(link.value ?? '');
};

const menu = ref<boolean>(false);

const player = ref<Player | null>(null);

watch(() => playerStore.getPlayer(), async (value) => {
    player.value = value as Player;

    if (!material) return;

    if (rendering) {
        player.value.changeMode(PlayerMode.PLAY);

        return;
    }

    if (material.value.sizing === 'MOVEMENT')
        player.value.changeMode(PlayerMode.MOVE);
    else
        player.value.changeMode(PlayerMode.PLAY);

    drawing.value = false;
});

const material = computed(() => materialStore.currentMaterial!);

const isPresenter = ref<boolean>(false);

const editorStore = useEditorStore();
onMounted(async () => {
    // if(editorStore.getEditor()) {
    //     // Reload the page
    //     window.location.reload();
    //     return;
    // }

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

    await router.isReady();

    await playerStore.requestPlayer(route.query.slide as string, rendering.value);
    hasNextSlide.value = !!playerStore.getSlides().find(s => s.position > playerStore.getActiveSlide()!.position);
    hasPreviousSlide.value = !!playerStore.getSlides().reverse().find(s => s.position < playerStore.getActiveSlide()!.position);

    currentSlide.value = playerStore.getActiveSlide()!.position;

    window.addEventListener("click", click);
    window.addEventListener("keydown", keydown);
    window.addEventListener("mousemove", mousemove);

    isPresenter.value = !!(canStartWatch);

    if (route.query.watch) {
        watching.value = true;
        watchCode.value = route.query.watch as string;
        isPresenter.value = false;
    } else {
        if (userStore.user && canStartWatch) {
            watchCode.value = generateToken(9, "123456789ABCDEFGHKMNPQRSTUVWXYZ");
        }
    }

    if (!watchCode.value) {
        return;
    }

    joinWatch();
});

const joinWatch = async () => {
    joining.value = true;

    if (!isPresenter.value) {
        setTimeout(() => {
            if (joining.value) {
                watchFailed.value = true;
            }
        }, 3000);
    }


    await communicator.setupPlayerRoom(material.value, watchCode.value!.toUpperCase(), isPresenter.value, playerStore.getActiveSlide()!.id);
    await communicator.getPlayerRoom()?.joined;

    joining.value = false;

    setInterval(() => {
        watcherCount.value = communicator.getPlayerRoom()?.getWatcherCount() ?? 0;
    }, 1000);

    player.value?.redrawBlocks();
}

const watcherCount = ref<number>(0);

const tryWithoutCode = async () => {
    const url = router.resolve({
        name: 'Player',
        params: {material: materialStore.currentMaterial?.id, language: translation.getLanguage()}
    });

    // Force redirect to the player refresh, using just dom
    window.location.href = url.href;
};
const joinWithCode = async () => {
    if (!watchCode.value) {
        return;
    }

    isPresenter.value = false;
    router.push({
        name: 'Player',
        params: {material: materialStore.currentMaterial?.id, language: translation.getLanguage()},
        query: {watch: watchCode.value}
    });
    joinWatch();
};

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
    if (watching.value) return;

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
const currentSlide = ref<number>(0);

const nextSlide = () => {
    if (watching.value) return;

    const current = playerStore.getActiveSlide();
    const next = playerStore.getSlides().find(s => s.position > current!.position);

    if (!next) return;

    playerStore.changeSlide(next);

    hasNextSlide.value = !!playerStore.getSlides().find(s => s.position > next!.position);
    hasPreviousSlide.value = true;

    currentSlide.value = next.position;

    if (!watching.value) {
        communicator.getPlayerRoom()?.changeSlide(next.id);
    }
};
const previousSlide = () => {
    if (watching.value) return;

    const current = playerStore.getActiveSlide();
    const prev = playerStore.getSlides().reverse().find(s => s.position < current!.position);

    if (!prev) return;

    playerStore.changeSlide(prev);

    hasPreviousSlide.value = !!playerStore.getSlides().reverse().find(s => s.position < prev!.position);
    hasNextSlide.value = true;

    currentSlide.value = prev.position;

    if (!watching.value) {
        communicator.getPlayerRoom()?.changeSlide(prev.id);
    }
};

const keydown = (e: KeyboardEvent) => {
    if (watching.value) return;

    const current = playerStore.getActiveSlide();

    if (!current) return;
    if (material.value.method !== 'MANUAL') return;

    const target = e.target as HTMLElement;

    if(target && target.tagName === 'INPUT') {
        return;
    }

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
        if (watching.value) return;

        {
            const time = playerStore.playerTime;

            const diff = Date.now() - time;

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
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
        if (material.value.method !== 'AUTOMATIC' || watching.value) {
            return;
        }

        if (!automaticMovement.value) {
            return;
        }

        if (watching.value) return;

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
    if (watching.value) return;

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

const refresh = () => {
    playerStore.changeSlide(playerStore.getActiveSlide()!);
};
</script>

<style lang="scss" scoped>
.watch {
    position: fixed;
    bottom: 0.5em;
    left: 0.5em;
    width: 10em;
    height: 12em;
    border-radius: 1em;
    overflow: hidden;
    z-index: 1000;
    background-color: white;
    display: flex;
    justify-items: center;
    align-items: center;
    flex-direction: column;
    box-shadow: var(--shadow-primary);
    opacity: 0.9;
    padding: 0.5rem 0;
    transition: opacity 0.3s ease-in-out;

    svg {
        width: 100%;
        height: 100%;
    }

    &--code {
        font-size: 1.5em;
        text-align: center;
    }

    &:hover {
        opacity: 0;
    }
}

.player-header {
    background-color: var(--color-background-accent);
}

.loader {
    font-size: 2em;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 50vw;

        @media (max-width: 768px) {
            font-size: 1.2em;
        }
    }

    .time {
        font-size: 1em;
    }

    .addition {
        display: flex;
        align-items: center;
        gap: 1em;
        font-size: 0.8em;
    }
}

.code {
    font-size: 2.8em;
    color: var(--color-text);
    text-align: center;
    margin-top: 1rem;
}
</style>
