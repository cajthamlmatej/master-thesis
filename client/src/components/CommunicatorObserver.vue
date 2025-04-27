<template>
    <Dialog v-model:value="loading" v-if="type === 'editor'" persitent>
        <Card dialog>
            <div class="flex flex-justify-center">
                <span class="mdi mdi-loading mdi-spin"></span>
            </div>
        </Card>
    </Dialog>

    <Dialog v-model:value="disconnected" persistent>
        <Card dialog>
            <p class="title" v-t>{{ props.type }}.disconnected.title</p>

            <p v-t>{{ props.type }}.disconnected.help</p>
        </Card>
    </Dialog>
</template>

<script lang="ts" setup>
import { communicator } from '@/api/websockets';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    type: {
        type: String,
        required: true
    }
});

const disconnected = ref(false);
const loading = ref(true);

onMounted(async () => {
    console.log(props.type);
    communicator.DISCONNECTED.on(() => {
        disconnected.value = true;
    });
    await communicator.readyPromise;

    if(props.type !== 'editor') {
        await communicator.getPlayerRoom()?.joined
    }

    loading.value = false;
})
</script>