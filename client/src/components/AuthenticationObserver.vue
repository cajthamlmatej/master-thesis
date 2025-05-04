<template>
    <Dialog v-model:value="logout">
        <Card dialog>
            <p class="title" v-t>page.authentication.expired.title</p>
            <p v-t>page.authentication.expired.description</p>
        </Card>
    </Dialog>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";

import * as jwt from "jsonwebtoken";
import moment from "moment";

const interval = ref(null as any);

const authenticationStore = useAuthenticationStore();
const logout = ref(false);
const token = computed(() => authenticationStore.token);

const handle = () => {
    if (interval.value) {
        clearInterval(interval.value);
    }

    if (token.value) {
        const decoded = jwt.decode(token.value) as jwt.JwtPayload;

        if (decoded && decoded.exp) {
            const exp = moment.unix(decoded.exp);

            interval.value = setInterval(() => {
                if (exp.isBefore(moment())) {
                    authenticationStore.logout();

                    logout.value = true;
                    clearInterval(interval.value);
                }
            }, 1000);
        }
        return;
    }
};

watch(() => token.value, () => {
    handle();
});

onMounted(() => {
    handle();
});

onUnmounted(() => {
    if (interval.value) {
        clearInterval(interval.value);
    }
});

</script>