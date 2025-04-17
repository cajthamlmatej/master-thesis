<template>
    <Row justify="center">
        <Col :cols="12" :lg="8" :md="10" :sm="11" :xl="6">
            <Card fluid>
                <TransitionGroup class="list-holder" name="list" tag="div">
                    <div v-if="!data.success">
                        <Form :onSubmit="handle">
                            <template #default="{ validationChange }">
                                <Input v-model:value="data.name" :label="$t('page.register.fields.name.label')"
                                       :validators="[
                                        (v: string) => !!v || $t('page.register.fields.name.required'),
                                        (v: string) => v.length > 3 || $t('page.register.fields.name.short'),
                                        (v: string) => v.length < 255 || $t('page.register.fields.name.long')
                                    ]"
                                       required type="text"
                                       @validationChange="validationChange"/>

                                <Input v-model:value="data.email" :label="$t('page.register.fields.email.label')"
                                       :validators="[
                                        (v: string) => !!v || $t('page.register.fields.email.required'),
                                        (v: string) => /.+@.+\..+/.test(v) || $t('page.register.fields.email.invalid'),
                                        (v: string) => v.length < 255 || $t('page.register.fields.email.long')
                                    ]" required type="email"
                                       @validationChange="validationChange"/>

                                <Input v-model:value="data.password"
                                       :label="$t('page.register.fields.password.label')"
                                       :validators="[
                                           (v: string) => v.length >= 8 || $t('page.register.fields.password.short'),
                                           (v: string) => v.length < 255 || $t('page.register.fields.password.long')
                                       ]"
                                       required
                                       type="password"
                                       @validationChange="validationChange"/>

                                <Input v-model:value="data.passwordRepeat"
                                       :label="$t('page.register.fields.password-repeat.label')"
                                       :validators="[
                                        (v: string) => v === data.password || $t('page.register.fields.password-repeat.not-match')
                                    ]"
                                       required
                                       type="password"
                                       @validationChange="validationChange"/>
                            </template>

                            <template #submit="{ isValid, onSubmit }">
                                <Transition name="fade">
                                    <Alert v-if="data.error" type="error">
                                        {{ data.error }}
                                    </Alert>
                                </Transition>

                                <Button :align="'center'" :disabled="!isValid" :loading="data.sending" fluid
                                        type="submit"
                                        @click="onSubmit">
                                    <span v-t>page.register.register</span>
                                </Button>
                            </template>
                        </Form>

                        <div class="mt-2">
                            <p v-t class="text-center">page.register.after-register</p>

                            <p v-t class="text-center mt-1">page.register.by-registering</p>

                            <div class="flex flex-justify-center gap-1 flex-wrap mt-1">
                                <Button :href="`${homepage}${route.params.lang}/terms-of-service`" target="_blank">
                                    <span v-t>page.register.terms-of-service</span>
                                </Button>
                                <Button :href="`${homepage}${route.params.lang}/privacy-policy`" target="_blank">
                                    <span v-t>page.register.privacy-policy</span>
                                </Button>
                            </div>

                            <p class="text-center mt-1">
                                <span v-t>page.register.already-account</span>
                                &nbsp;
                                <router-link :to="{ name: 'Authentication' }">
                                    <span v-t>page.register.sign-in</span>
                                </router-link>
                            </p>
                        </div>
                    </div>
                    <div v-else>
                        <p v-t class="title">page.register.success.title</p>

                        <p v-t>page.register.success.message</p>

                        <Button :to="{ name: 'Authentication' }" class="mt-1" fluid>
                            <span v-t>page.register.success.sign-in</span>
                        </Button>
                    </div>
                </TransitionGroup>
            </Card>
        </Col>
    </Row>
</template>

<script lang="ts" setup>
import {reactive} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import Card from "@/components/design/card/Card.vue";
import {useHead} from "unhead";
import {$t} from "@/translation/Translation";
import {useRoute} from "vue-router";

useHead({
    title: $t("page.register.title")
});

const homepage = import.meta.env.VITE_HOME;

const route = useRoute();

const data = reactive({
    name: '',
    email: '',
    password: '',
    passwordRepeat: '',
    sending: false,

    error: '',
    success: false
});

const authenticationStore = useAuthenticationStore();

const handle = async () => {
    data.sending = true;

    const response = await authenticationStore.register(data.name, data.email, data.password);

    if (!response) {
        data.sending = false;
        data.error = $t('page.register.fail.failed');
        return;
    } else {
        data.error = '';

        data.success = true;
    }

    data.sending = false;
}
</script>
