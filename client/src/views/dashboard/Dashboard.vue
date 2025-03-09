<template>
    <Card fluid>
        <div class="flex flex-justify-space-between flex-align-center">
            <span v-t="{ name: userStore.user?.name ?? '' }" class="main-title">page.dashboard.title-welcome</span>

            <div class="flex flex-align-center gap-1">
                <Button v-tooltip="$t('page.dashboard.add-tooltip')" :to="{name: 'Editor', params: {material: 'new'}}"
                        color="primary"
                        icon="mdi mdi-plus"/>

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

    <Row align="stretch" class="mt-1" wrap>
        <Col v-for="material in materialsOnPage" :key="material.id" cols="12" lg="3" md="3" sm="4">
            <article class="material" @click="router.push({name: 'Editor', params: {material: material.id}})">
                <div class="image-holder">
                    <img v-if="material.thumbnail"
                         :src="material.thumbnail" alt="thumbnail" class="thumbnail">
                    <div v-else class="placeholder"></div>
                </div>

                <div class="meta">
                    <div class="state">
                        <p class="title">{{ material.name }}</p>

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
                                color="primary" icon="mdi mdi-content-copy"
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
};

const copyMaterial = async (materialId: string) => {
    processing.value = true;
    await materialStore.copyMaterial(materialId);
    processing.value = false;
};
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
    border: 1px solid #ccc;
    border-radius: 0.25em;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-text);
    text-decoration: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: white;

    position: relative;

    &:before {
        position: absolute;
        content: '';
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        box-shadow: inset var(--shadow-accent);
        background-color: rgba(221, 250, 209, 0.04);
        z-index: 3;
        opacity: 0;
        pointer-events: none;
    }

    &:hover {
        background-color: #f0f0f0;

        &:before {
            opacity: 1;
        }
    }

    &:hover:has(.button:hover), &:hover:has(.actions:hover) {
        background: white;

        &:before {
            opacity: 0;
        }
    }

    .meta {
        width: 100%;
        justify-content: space-between;
        align-items: end;
        padding: 0.5em;
        gap: 0.5em;

        display: flex;

        .title {
            font-size: 1.5em;
            font-weight: bold;
            line-height: 1.05em;

            margin-bottom: 0.4em;
        }

        .time {
            font-size: 0.75em;
            color: #666;
        }

        .actions {
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
        border-radius: 0.25em;
        width: 100%;
        height: 8em;
        flex-grow: 1;

        background-color: #ffffff;
        overflow: hidden;

        &:before {
            position: absolute;
            content: '';
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 1;
            box-shadow: inset var(--shadow-accent);
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
</style>
