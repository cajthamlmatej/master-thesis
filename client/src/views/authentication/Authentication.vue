<template>
    <Row justify="center">
        <Col :cols="12" :lg="8" :md="10" :sm="11" :xl="8">
            <Card fluid>
                <Row align="stretch" wrap>
                    <Col :cols="12" :md="7">
                        <Tabs v-model:selected="data.tab" :items="data.tabs" fluid></Tabs>

                        <TransitionGroup :duration="40000" class="authentication-holder" name="authentication-fade"
                                         tag="div">
                            <Form v-if="data.tab === 'EMAIL_PASSWORD'" :onSubmit="() => handle('EMAIL_PASSWORD')"
                                  class="form">
                                <template #default="{ validationChange }">
                                    <Input v-model:value="data.email"
                                           :label="$t('page.authentication.fields.email.label')"
                                           :validators="[
                                                (v: string) => !!v || $t('page.authentication.fields.email.required'),
                                                (v: string) => /.+@.+\..+/.test(v) || $t('page.authentication.fields.email.invalid')
                                           ]"
                                           required
                                           type="email"
                                           @validationChange="validationChange"/>

                                    <Input v-model:value="data.password"
                                           :label="$t('page.authentication.fields.password.label')"
                                           :validators="[(v: string) => v.length > 3 || $t('page.authentication.fields.password.invalid')]"
                                           required
                                           type="password"
                                           @validationChange="validationChange"/>
                                </template>

                                <template #submit="{ isValid, onSubmit }">
                                    <Button :align="'center'" :disabled="!isValid" :loading="data.sending" fluid
                                            type="submit"
                                            @click="onSubmit">
                                        <span v-t>page.authentication.login</span>
                                    </Button>
                                </template>
                            </Form>

                            <Form v-if="data.tab === 'EMAIL'" :onSubmit="() => handle('EMAIL')" class="form">
                                <template #default="{ validationChange }">
                                    <Input v-model:value="data.email" :disabled="data.emailStage === 1"
                                           :label="$t('page.authentication.fields.email.label')"
                                           :validators="[
                                        (v: string) => !!v || $t('page.authentication.fields.email.required'),
                                        (v: string) => /.+@.+\..+/.test(v) || $t('page.authentication.fields.email.invalid')
                                    ]"
                                           required type="email" @validationChange="validationChange"/>

                                    <Input v-if="data.emailStage === 1" v-model:value="data.code"
                                           :label="$t('page.authentication.fields.code.label')"
                                           :validators="[(v: string) => v.length == 6 || $t('page.authentication.fields.code.invalid')]"
                                           required type="text" @validationChange="validationChange"/>

                                    <p>
                                        <a v-if="data.emailStage == 0" v-t @click="data.emailStage = 1">page.authentication.already-code</a>
                                        <a v-if="data.emailStage == 1" v-t @click="data.emailStage = 0">page.authentication.no-code</a>
                                    </p>
                                </template>

                                <template #submit="{ isValid, onSubmit }">
                                    <Button :align="'center'" :disabled="!isValid" :loading="data.sending" fluid
                                            type="submit"
                                            @click="onSubmit">
                                        <span v-t>page.authentication.login</span>
                                    </Button>
                                </template>
                            </Form>
                        </TransitionGroup>
                    </Col>

                    <Col :cols="12" :md="5" class="flex mt-2 mt-md-0">
                        <Divider class="d-none d-md-block" vertical></Divider>

                        <div class="flex flex-column flex-justify-space-between">
                            <div>
                                <h2 v-t>web.name</h2>

                                <p class="mb-1">
                                    ...
                                </p>
                                <p class="mb-1">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aspernatur aut
                                    culpa dolore doloremque earum eos eveniet, ex impedit maxime modi officiis pariatur
                                    praesentium quas recusandae sint temporibus tenetur vel?
                                </p>
                                <p>
                                    TODO: <a href="#">here</a>.<!-- TODO: Add link -->
                                </p>
                            </div>

                            <Button :icon-size="1.4" :to="{ name: 'Authentication/Register'}" class="mt-1"
                                    fluid icon="account-plus-outline">
                                <span v-t>page.authentication.create-account</span>
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        </Col>
    </Row>
</template>

<script lang="ts" setup>
import router from "@/router";
import {useAuthenticationStore} from "@/stores/authentication";
import {reactive} from "vue";
import Button from "@/components/design/button/Button.vue";
import {useHead} from "unhead";
import {$t} from "@/translation/Translation";

useHead({
    title: $t("page.authentication.title")
});

const data = reactive({
    tab: "EMAIL_PASSWORD",
    tabs: [
        {
            value: "EMAIL_PASSWORD",
            text: $t("page.authentication.type.email-password")
        },
        {
            value: "EMAIL",
            text: $t("page.authentication.type.email")
        }
    ],
    email: "",
    password: "",
    code: "",

    sending: false,
    emailStage: 0
});

const authenticationStore = useAuthenticationStore();

const handle = async (type: 'EMAIL_PASSWORD' | 'EMAIL') => {
    if (data.sending) return;

    let error = "";
    data.sending = true;

    if (type === 'EMAIL_PASSWORD') {
        const result = await authenticationStore.loginEmailAndPassword(data.email, data.password);

        if (result) {
            await router.push({name: "Dashboard"});
        } else {
            error = $t("page.authentication.fail.failed");
        }
    } else if (type === 'EMAIL') {
        if (data.emailStage === 0) {
            const result = await authenticationStore.loginEmail(data.email, undefined);

            if (result) {
                data.emailStage = 1;
            } else {
                error = $t("page.authentication.fail.wrong-email");
            }
        } else if (data.emailStage === 1) {
            const result = await authenticationStore.loginEmail(data.email, data.code);

            if (result) {
                await router.push({name: "Dashboard"});
            } else {
                error = $t("page.authentication.fail.wrong-code");
            }
        }
    }

    data.sending = false;
    return error;
};
</script>

<style lang="scss" scoped>
.authentication-holder {
    height: 100%;
    min-height: 345px;
    overflow: hidden;

    position: relative;

    > .form {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}

.authentication-fade-move,
.authentication-fade-leave-active {
    transition: all 0.4s ease;
}

.authentication-fade-enter-active {
    transition: all 0.6s ease;
}

.authentication-fade-enter,
.authentication-fade-leave-to {
    opacity: 0;
    transform: translatey(-50px);
}

.authentication-fade-enter-from {
    opacity: 0;
    transform: translatey(50px);
}
</style>
