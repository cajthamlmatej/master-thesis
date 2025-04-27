<template>
    <div data-cy=dashboard>
        <Card fluid class="mb-1">
            <div class="flex flex-justify-center flex-justify-sm-space-between flex-align-center flex-wrap gap-1">
                <span v-t="{ name: userStore.user?.name ?? '' }" class="main-title">page.dashboard.title-welcome</span>

                <div class="flex flex-align-center gap-1">
                    <Dialog>
                        <template #activator="{toggle}">
                            <Button v-tooltip="$t('page.dashboard.new.tooltip')"
                                    :label="$t('page.dashboard.new.tooltip')"
                                    color="primary"
                                    data-cy="new-material"
                                    @click="toggle"
                                    icon="plus"/>
                        </template>
                        <template #default="{toggle}">
                            <Card dialog data-cy="new-material-modal">
                                <div class="import-buttons">
                                    <Dialog>
                                        <template #activator="{toggle}">
                                            <button @click="toggle" data-cy="import-material">
                                                <span class="icon mdi mdi-file-import-outline"></span>
                                                <span class="text" v-t>page.dashboard.new.import.tooltip</span>
                                            </button>
                                        </template>
                                        <template #default="{toggle}">
                                            <Card dialog data-cy="import-material-modal">
                                                <p class="title" v-t>page.dashboard.new.import.title</p>

                                                <p v-t>page.dashboard.new.import.description</p>

                                                <FileInput v-model:value="importFile" class="mt-1" data-cy="import-material-file"/>

                                                <Alert type="error" v-if="importError" class="mt-1" data-cy="import-material-error">
                                                    {{ importError }}
                                                </Alert>

                                                <div class="flex flex-justify-end mt-1">
                                                    <Button @click="() => processImport(toggle)" :disabled="importFile.length != 1" data-cy="import-material-process">
                                                        <span v-t>page.dashboard.new.import.process</span>
                                                    </Button>
                                                </div>
                                            </Card>
                                        </template>
                                    </Dialog>
                                    <button @click="router.push({name: 'Editor', params: {material: 'new'}})" data-cy="new-empty-material">
                                        <span class="icon mdi mdi-artboard"></span>
                                        <span class="text" v-t>page.dashboard.new.empty</span>
                                    </button>
                                </div>
                            </Card>
                        </template>
                    </Dialog>

                    <Input v-model:value="search" :label="$t('page.dashboard.search')"
                           data-cy="search-materials"
                           :placeholder="$t('page.dashboard.search')" dense
                           hide-error hide-label type="text"/>
                </div>
            </div>
        </Card>

        <Tabs fluid v-model:selected="selected" :items="[
            {
                value: 'OWN',
                text: $t('page.dashboard.materials.own')
            },
            {
                value: 'SHARED',
                text: $t('page.dashboard.materials.shared')
            }
        ]"></Tabs>

        <Card fluid>
            <div class="flex flex-justify-center">
                <Pagination v-model:page="page" :page-size="8" :total="Math.max(Math.ceil(materials.length/8), 1)"/>
            </div>

            <div v-if="materials.length === 0" class="mt-1">
                <Alert type="info">
                    <span v-t>page.dashboard.materials.not-found-by-criteria</span>
                </Alert>
            </div>

            <Row align="stretch" :gap="1" wrap :class="{'mt-1': materialsOnPage.length > 0}" data-cy="materials">
                <Col v-for="material in materialsOnPage" :key="material.id" cols="12" lg="4" md="4" sm="6">
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
                                <Dialog v-if="selected === 'OWN'">
                                    <template #activator="{toggle}">
                                        <Button v-tooltip="$t('page.dashboard.materials.delete-tooltip')"
                                                :label="$t('page.dashboard.materials.delete-tooltip')"
                                                 :loading="processing"
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
                                </Dialog >
                                <Button 
                                        v-tooltip="$t('page.dashboard.materials.copy-tooltip')"
                                        :label="$t('page.dashboard.materials.copy-tooltip')"
                                        :loading="processing"
                                        color="transparent" icon="mdi mdi-content-copy"
                                        @click.stop.capture="copyMaterial(material.id)"/>
                            </div>
                        </div>
                    </article>
                </Col>
            </Row>
        </Card>
    </div>
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
import {marked} from "marked";
import Material, {Slide} from "@/models/Material";
import {generateUUID} from "@/utils/Generators";
import {useHead, useSeoMeta} from "unhead";
import {MaterialImporter} from "@/editor/import/MaterialImporter";
import {JsonMaterialImporter} from "@/editor/import/JsonMaterialImporter";
import {MarkdownMaterialImporter} from "@/editor/import/MarkdownMaterialImporter";

useSeoMeta({
    title: $t('page.dashboard.title')
});

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
    let materials = materialStore.materials;

    if(selected.value === 'OWN') {
        materials = materials.filter(material => material.user === userStore.user?.id);
    } else if (selected.value === 'SHARED') {
        materials = materials.filter(material => material.user !== userStore.user?.id);
    }

    if (search.value.trim().length === 0) {
        return materials;
    }

    return materials.filter(material => material.name.toLowerCase().includes(search.value.toLowerCase()));
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

            await materialStore.loadMaterial(materialId, undefined);

            let importer: MaterialImporter;

            if(mime === "application/json") {
                importer = new JsonMaterialImporter();
            } else if(extension === "md") {
                importer = new MarkdownMaterialImporter();
            } else {
                throw new Error("Invalid mime type");
            }

            try {
                await importer.process(content, material);
            } catch (e) {
                console.error(e);
                importError.value = $t(`page.dashboard.new.import.${extension == "md" ? "markdown" : "json"}.error`);
                await materialStore.deleteMaterial(materialId);
                return;
            }

            await materialStore.updateMaterial(material);

            await router.push({name: 'Editor', params: {material: material.id}});
        } catch (e) {
            console.error(e);
            importError.value = $t('page.dashboard.new.import.saving.error');
        }
    });

    reader.readAsText(file);
}

const selected = ref('OWN');

watch(() => selected.value, () => {
    page.value = 1;
})
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
