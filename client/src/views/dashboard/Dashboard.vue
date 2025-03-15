<template>
    <Card fluid>
        <div class="flex flex-justify-center flex-justify-sm-space-between flex-align-center flex-wrap gap-1">
            <span v-t="{ name: userStore.user?.name ?? '' }" class="main-title">page.dashboard.title-welcome</span>

            <div class="flex flex-align-center gap-1">
                <Dialog>
                    <template #activator="{toggle}">
                        <Button v-tooltip="$t('page.dashboard.new.tooltip')"
                                color="primary"
                                @click="toggle"
                                icon="mdi mdi-plus"/>
                    </template>
                    <template #default="{toggle}">
                        <Card dialog>
                            <div class="import-buttons">
                                <Dialog>
                                    <template #activator="{toggle}">
                                        <button @click="toggle">
                                            <span class="icon mdi mdi-file-import-outline"></span>
                                            <span class="text" v-t>page.dashboard.new.import.tooltip</span>
                                        </button>
                                    </template>
                                    <template #default="{toggle}">
                                        <Card dialog>
                                            <p class="title" v-t>page.dashboard.new.import.title</p>

                                            <p v-t>page.dashboard.new.import.description</p>

                                            <FileInput v-model:value="importFile" class="mt-1"/>

                                            <Alert type="error" v-if="importError" class="mt-1">
                                                {{ importError }}
                                            </Alert>

                                            <div class="flex flex-justify-end mt-1">
                                                <Button @click="() => processImport(toggle)" :disabled="importFile.length != 1">
                                                    <span v-t>page.dashboard.new.import.process</span>
                                                </Button>
                                            </div>
                                        </Card>
                                    </template>
                                </Dialog>
                                <button @click="router.push({name: 'Editor', params: {material: 'new'}})">
                                    <span class="icon mdi mdi-artboard"></span>
                                    <span class="text" v-t>page.dashboard.new.empty</span>
                                </button>
                            </div>
                        </Card>
                    </template>
                </Dialog>

                <Input v-model:value="search" :label="$t('page.dashboard.search')"
                       :placeholder="$t('page.dashboard.search')" dense
                       hide-error hide-label type="text"/>
            </div>
        </div>
    </Card>

    <div class="flex flex-justify-center mt-2">
        <Pagination v-model:page="page" :page-size="8" :total="Math.max(Math.ceil(materials.length/8), 1)"/>
    </div>

    <div v-if="materials.length === 0" class="mt-1">
        <Alert type="warning">
            <span v-t>page.dashboard.materials.not-found-by-criteria</span>
        </Alert>
    </div>

    <Row align="stretch" class="mt-1" :gap="1" wrap >
        <Col v-for="material in materialsOnPage" :key="material.id" cols="12" lg="3" md="4" sm="6">
            <article class="material" @click="router.push({name: 'Editor', params: {material: material.id}})">
                <div class="image-holder">
                    <img v-if="material.thumbnail"
                         :src="material.thumbnail" alt="thumbnail" class="thumbnail">
                    <div v-else class="placeholder"></div>
                </div>

                <div class="meta">
                    <div class="state">
                        <p class="title" v-tooltip="material.name">{{ material.name }}</p>

                        <p class="time">
                            <span v-t>page.dashboard.materials.modified</span> {{ material.updatedAt.fromNow() }}</p>
                        <p class="time">
                            <span v-t>page.dashboard.materials.created</span> {{ material.createdAt.fromNow() }}
                        </p>
                    </div>

                    <div class="actions">
                        <Dialog>
                            <template #activator="{toggle}">
                                <Button v-tooltip="$t('page.dashboard.materials.delete-tooltip')" :loading="processing"
                                        color="transparent"
                                        icon="mdi mdi-delete" @click.stop.capture="toggle"/>
                            </template>
                            <template #default="{toggle}">
                                <Card class="delete-dialog" dialog>
                                    <p v-t class="title">page.dashboard.materials.deletion.title</p>

                                    <p v-t>page.dashboard.materials.deletion.deletion</p>

                                    <p v-t>page.dashboard.materials.deletion.after</p>

                                    <div class="flex flex-justify-end gap-1 mt-1">
                                        <Button :loading="processing" color="neutral"
                                                @click="deleteMaterial(material.id, toggle)"><span v-t>page.dashboard.materials.deletion.sure</span>
                                        </Button>
                                        <Button @click="toggle"><span
                                            v-t>page.dashboard.materials.deletion.cancel</span></Button>
                                    </div>
                                </Card>
                            </template>
                        </Dialog>
                        <Button v-tooltip="$t('page.dashboard.materials.copy-tooltip')" :loading="processing"
                                color="transparent" icon="mdi mdi-content-copy"
                                @click.stop.capture="copyMaterial(material.id)"/>
                    </div>
                </div>
            </article>
        </Col>
    </Row>
</template>

<script lang="ts" setup>
import {useUserStore} from "@/stores/user";
import {computed, onMounted, ref, watch} from "vue";
import {useMaterialStore} from "@/stores/material";
import Pagination from "@/components/design/pagination/Pagination.vue";
import {useRouter} from "vue-router";
import {$t} from "@/translation/Translation";
import Card from "@/components/design/card/Card.vue";
import FileInput from "@/components/design/input/FileInput.vue";
import {ListItem, marked} from "marked";
import {Slide} from "@/models/Material";
import {generateUUID} from "@/utils/Generators";

const router = useRouter();

const userStore = useUserStore();
const materialStore = useMaterialStore();

onMounted(async () => {
    await materialStore.load();
});

const search = ref('');
const page = ref(1);

watch(search, () => {
    page.value = 1;
});

const materials = computed(() => {
    if (search.value.trim().length === 0) {
        return materialStore.materials;
    }

    return materialStore.materials.filter(material => material.name.toLowerCase().includes(search.value.toLowerCase()));
});

const materialsOnPage = computed(() => {
    return materials.value.slice((page.value - 1) * 8, page.value * 8);
});

const processing = ref(false);

const deleteMaterial = async (materialId: string, toggle: () => void) => {
    processing.value = true;
    await materialStore.deleteMaterial(materialId);
    processing.value = false;
    toggle();

    if(page.value > Math.max(Math.ceil(materials.value.length/8), 1)) {
        page.value = Math.max(Math.ceil(materials.value.length/8), 1);
    }
};

const copyMaterial = async (materialId: string) => {
    processing.value = true;
    await materialStore.copyMaterial(materialId);
    processing.value = false;
};

const importError = ref<string | undefined>(undefined);
const importFile = ref<File[]>([]);

const processImport = (toggle: () => void) => {
    const file = importFile.value[0];

    console.log(file);
    const mime = file.type;
    const extension = file.name.split('.').pop() ?? '';

    // JSON, markdown
    if(!["application/json"].includes(mime) && !["md"].includes(extension)) {
        console.log("Invalid mime type", mime, extension);
        importError.value = $t('page.dashboard.new.import.error');
        return;
    }

    // Read file content
    const reader = new FileReader();

    reader.addEventListener("load", async () => {
        try {
            const content = reader.result as string;
            // toggle();
            const material = await materialStore.createMaterial();
            const materialId = material.id;

            await materialStore.loadMaterial(materialId);

            const currentMaterial = materialStore.currentMaterial!;

            if(mime === "application/json") {
                try {
                    currentMaterial.slides = JSON.parse(content);
                } catch (error) {
                    console.error(error);
                    importError.value = $t('page.dashboard.new.import.json.error');
                    return;
                }
            } else if(extension === "md") {
                try {
                    type SlideData = {
                        title: string;
                        blocks: {
                            type: string;
                            html: string;
                            items?: number;
                        }[]
                    };
                    const data = marked.lexer(content);

                    let presentationTitle = '';
                    let slides = [] as SlideData[];
                    let currentSlide = null as SlideData | null;

                    for (let i = 0; i < data.length; i++) {
                        const token = data[i];

                        if (token.type === 'heading' && token.depth === 1 && !presentationTitle) {
                            presentationTitle = token.text;
                            continue;
                        }

                        if (token.type === 'heading' && token.depth > 1) {
                            if (currentSlide) {
                                // Save the current read slide
                                slides.push(currentSlide);
                            }

                            currentSlide = {
                                title: token.text,
                                blocks: []
                            };
                            continue;
                        }

                        if (currentSlide) {
                            if (token.type === 'paragraph') {
                                // Render the paragraph content as HTML
                                const html = marked.parser([token]);

                                currentSlide.blocks.push({
                                    type: 'paragraph',
                                    html: html,
                                });
                            }

                            // Handle list blocks
                            else if (token.type === 'list') {
                                // Render the entire list as HTML
                                const html = marked.parser([token]);

                                const items = token.items.length;

                                currentSlide.blocks.push({
                                    type: 'list',
                                    html: html,
                                    items: items
                                });
                            }

                            // TODO: Handle other block types
                        }
                    }

                    if (currentSlide) {
                        slides.push(currentSlide);
                    }

                    currentMaterial.name = presentationTitle;

                    const correctSlides = [] as Slide[];

                    let width = 1200;
                    let height = 800;

                    // Title slide
                    (() => {
                        let blocks = [] as any[];

                        let fontSize = 128;
                        let titleHeight = fontSize * 1.5;
                        let titleCenter = height / 2 - titleHeight / 2;
                        blocks.push({
                            type: "text",
                            content: `<p style="text-align: center">${presentationTitle}</p>`,
                            fontSize: fontSize,
                            id: generateUUID(),
                            position: {
                                x: 0,
                                y: titleCenter
                            },
                            size: {
                                width: width,
                                height: titleHeight
                            },
                            rotation: 0,
                            zIndex: 0,
                            opacity: 1,
                            locked: false,
                            interactivity: []
                        });

                        let data = `{"editor":{"size":{"width":${width},"height":${height}}},"blocks":${JSON.stringify(blocks)}}`;

                        correctSlides.push(new Slide(generateUUID(), data, undefined,0));
                    })();

                    for(let slide of slides) {
                        let blocks = [] as any[];

                        let padding = 20;
                        let gaps = 20;

                        let lastSpace = padding;

                        // TITLE
                        (() => {
                            let fontSize = 64;
                            let titleHeight = fontSize * 1.5;
                            blocks.push({
                                type: "text",
                                content: `<p style="text-align: center">${slide.title}</p>`,
                                fontSize: fontSize,
                                id: generateUUID(),
                                position: {
                                    x: padding,
                                    y: lastSpace
                                },
                                size: {
                                    width: width - padding * 2,
                                    height: titleHeight
                                },
                                rotation: 0,
                                zIndex: 0,
                                opacity: 1,
                                locked: false,
                                interactivity: []
                            });

                            lastSpace += titleHeight;
                        })();

                        lastSpace += gaps;

                        for(let block of slide.blocks) {
                            switch(block.type) {
                                case "paragraph": {
                                    let fontSize = 48;
                                    let height = fontSize * 1.5;
                                    blocks.push({
                                        type: "text",
                                        content: block.html,
                                        fontSize: fontSize,
                                        id: generateUUID(),
                                        position: {
                                            x: padding,
                                            y: lastSpace
                                        },
                                        size: {
                                            width: width - padding * 2,
                                            height: height
                                        },
                                        rotation: 0,
                                        zIndex: 0,
                                        opacity: 1,
                                        locked: false,
                                        interactivity: []
                                    });

                                    lastSpace += height + gaps;

                                    break;
                                }
                                case "list": {
                                    let fontSize = 48;
                                    let height = fontSize * 1.5 * (block.items ?? 0);

                                    blocks.push({
                                        type: "text",
                                        content: block.html,
                                        fontSize: fontSize,
                                        id: generateUUID(),
                                        position: {
                                            x: padding,
                                            y: lastSpace
                                        },
                                        size: {
                                            width: width - padding * 2,
                                            height: height
                                        },
                                        rotation: 0,
                                        zIndex: 0,
                                        opacity: 1,
                                        locked: false,
                                        interactivity: []
                                    });

                                    lastSpace += height + gaps;

                                    break;
                                }
                            }
                        }

                        let data = `{"editor":{"size":{"width":${width},"height":${height}}},"blocks":${JSON.stringify(blocks)}}`;

                        correctSlides.push(new Slide(generateUUID(), data, undefined, correctSlides.length));
                    }

                    currentMaterial.slides = correctSlides;
                } catch (error) {
                    console.error(error);
                    importError.value = $t('page.dashboard.new.import.markdown.error');
                    return;
                }

            }

            await materialStore.updateMaterial(currentMaterial);

            await router.push({name: 'Editor', params: {material: material.id}});
        } catch (e) {
            console.error(e);
            importError.value = $t('page.dashboard.new.import.saving.error');
        }
    });

    reader.readAsText(file);
}
</script>

<style lang="scss" scoped>
.main-title {
    font-size: 1.75em;
    font-weight: bold;
    line-height: 1.05em;
}

a.material {
    text-decoration: none;
}

article.material {
    //border: 1px solid #ccc;
    background-color: var(--color-background-accent);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-text);
    text-decoration: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    position: relative;

    &:before {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        //box-shadow: inset var(--shadow-accent);
        background-color: rgba(221, 250, 209, 0.04);
        z-index: 3;
        opacity: 0;
        pointer-events: none;
    }

    &:hover {
        //background-color: rgba(231, 222, 253, 0.91);
        box-shadow: var(--shadow-accent);

        &:before {
            opacity: 1;
        }

        .image-holder {
            filter: brightness(1.1);
        }
    }

    &:hover:has(.button:hover), &:hover:has(.actions:hover) {
        //background: white;

        &:before {
            opacity: 0;
        }
    }

    .meta {
        width: 100%;
        justify-content: space-between;
        align-items: end;
        padding: 1em;
        gap: 0.5em;

        display: flex;
        overflow: hidden;

        .title {
            font-size: 1.5em;
            font-weight: bold;
            line-height: 1.05em;

            margin-bottom: 0.4em;


            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .time {
            font-size: 0.75em;
            color: #666;
        }

        .state {
            flex-grow: 0;
            max-width: 70%;
        }

        .actions {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5em;

            :deep(.button) {
                font-size: 0.85em;
                padding: 0.4em 1em;
            }
        }
    }

    .image-holder {
        position: relative;
        border-radius: var(--border-radius);
        width: 100%;
        height: 10em;
        flex-grow: 1;

        background-color: #ffffff;
        overflow: hidden;
        box-shadow: var(--shadow-accent);

        transition: filter 0.2s;

        &:before {
            position: absolute;
            content: '';
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 1;
            //box-shadow: inset var(--shadow-accent);
            background-color: rgba(72, 0, 255, 0.11);
        }

        .thumbnail, .placeholder {
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -1;
        }

        .placeholder {
            width: 100%;
            height: 100%;
            background-image: linear-gradient(135deg, #f4f4f4 25%, transparent 25%), linear-gradient(225deg, #f4f4f4 25%, transparent 25%), linear-gradient(45deg, #f4f4f4 25%, transparent 25%), linear-gradient(315deg, #f4f4f4 25%, #ffffff 25%);
            background-position: 10px 0, 10px 0, 0 0, 0 0;
            background-size: 10px 10px;
            background-repeat: repeat;
        }
    }
}

.add {
    background: var(--color-primary);
    color: var(--color-text);
    border: 1px solid var(--color-primary);
    border-radius: 5px;
    padding: 10px;
    font-size: 4em;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    transition: background 0.2s;

    &:hover {
        background: var(--color-primary-dark);
    }
}

.delete-dialog {
    p:not(:last-child) {
        margin-bottom: 0.5em;
    }
}


.import-buttons {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1em;

    button {
        background: var(--color-primary);
        border-radius: 0.25em;
        padding: 1em;
        width: 100%;
        aspect-ratio: 1/1;

        border: none;

        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 1em;
        color: var(--color-text);

        .icon {
            font-size: 4em;
            transition: transform 0.2s;
        }
        .text {
            font-size: 1em;
        }
        transition: background 0.2s;

        &:hover {
            background: var(--color-primary-dark);
            cursor: pointer;

            .icon {
                transform: scale(1.1) rotate(5deg);
            }
        }
    }
}
</style>
