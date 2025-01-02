<template>
    <Row justify="center">
        <Col :cols="12" :lg="8" :md="10" :sm="11" :xl="6">
            <Card fluid>
                <p class="title">Activation of your account</p>

                <p v-if="success">Account has been successfully activated. Now you can log in.</p>
                <p v-else-if="loading">Activating account, please wait...</p>
                <p v-else-if="!success">Account activation failed. Please try again later.</p>

                <Button :disabled="loading ? false : !success" :loading="loading" :to="{name: 'Authentication'}"
                        align="center" class="mt-1" fluid>
                    Log in
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

useHead({
    title: 'Account activation',
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
