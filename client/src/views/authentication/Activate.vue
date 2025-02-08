<template>
    <Row justify="center">
        <Col :cols="12" :lg="8" :md="10" :sm="11" :xl="6">
            <Card fluid>
                <p v-t class="title">page.activate.activation</p>

                <p v-if="success" v-t>page.activation.success</p>
                <p v-else-if="loading" v-t>page.activation.loading</p>
                <p v-else-if="!success" v-t>page.activation.fail</p>

                <Button :disabled="loading ? false : !success" :loading="loading" :to="{name: 'Authentication'}"
                        align="center" class="mt-1" fluid>
                    <span v-t>page.activation.sign-in</span>
                </Button>
            </Card>
        </Col>
    </Row>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import {useRoute, useRouter} from "vue-router";
import {useHead} from "unhead";
import {$t} from "@/translation/Translation";

useHead({
    title: $t("page.activate.title")
});

const authenticationStore = useAuthenticationStore();

const route = useRoute();
const router = useRouter();

if (!route.params.token) {
    router.push({name: 'Authentication'});
}

const success = ref<boolean>(false);
const loading = ref<boolean>(true);

onMounted(async () => {
    if (!route.params.token) return;
    if (!route.params.token.length) return;
    if (Array.isArray(route.params.token)) return;

    const result = await authenticationStore.activate(route.params.token);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (result) {
        success.value = true;
    }

    loading.value = false;
})

</script>
