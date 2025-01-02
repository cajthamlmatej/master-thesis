<template>
    <Row justify="center">
        <Col :cols="12" :lg="8" :md="10" :sm="11" :xl="8">
            <Card fluid>
                <Row align="stretch" wrap>
                    <Col :cols="12" :md="7">
                        <Tabs v-model:selected="data.tab" :items="data.tabs" fluid></Tabs>

                        <TransitionGroup class="authentication-holder" name="authentication-fade" tag="div" :duration="40000">
                            <Form v-if="data.tab === 'EMAIL_PASSWORD'" class="form" :onSubmit="() => handle('EMAIL_PASSWORD')">
                                <template #default="{ validationChange }">
                                    <Input v-model:value="data.email" :validators="[
                                    (v: string) => !!v || 'E-mail is required',
                                    (v: string) => /.+@.+\..+/.test(v) || 'E-mail has to be in correct format.'
                                ]" label="E-mail" required type="email" @validationChange="validationChange"/>

                                    <Input v-model:value="data.password"
                                           :validators="[(v: string) => v.length > 3 || 'Password has to be at least 4 characters.']"
                                           label="Password" required
                                           type="password"
                                           @validationChange="validationChange"/>
                                </template>

                                <template #submit="{ isValid, onSubmit }">
                                    <Button :align="'center'" :disabled="!isValid" :loading="data.sending" fluid
                                            type="submit"
                                            @click="onSubmit">
                                        Login
                                    </Button>
                                </template>
                            </Form>

                            <Form v-if="data.tab === 'EMAIL'" class="form" :onSubmit="() => handle('EMAIL')">
                                <template #default="{ validationChange }">
                                    <Input v-model:value="data.email" :disabled="data.emailStage === 1" :validators="[
                                    (v: string) => !!v || 'E-mail is required',
                                    (v: string) => /.+@.+\..+/.test(v) || 'E-mail has to be in correct format.'
                                ]" label="E-mail" required type="email" @validationChange="validationChange"/>

                                    <Input v-if="data.emailStage === 1" v-model:value="data.code"
                                           :validators="[(v: string) => v.length == 6 || 'Code has to be 6 characters.']"
                                           label="Kód"
                                           required type="text" @validationChange="validationChange"/>

                                    <p>
                                        <a v-if="data.emailStage == 0" @click="data.emailStage = 1">I already have a code.</a>
                                        <a v-if="data.emailStage == 1" @click="data.emailStage = 0">I need code again.</a>
                                    </p>
                                </template>

                                <template #submit="{ isValid, onSubmit }">
                                    <Button :align="'center'" :disabled="!isValid" :loading="data.sending" fluid
                                            type="submit"
                                            @click="onSubmit">
                                        Login
                                    </Button>
                                </template>
                            </Form>
                        </TransitionGroup>
                    </Col>

                    <Col :cols="12" :md="5" class="flex mt-2 mt-md-0">
                        <Divider class="d-none d-md-block" vertical></Divider>

                        <div class="flex flex-column flex-justify-space-between">
                            <div>
                                <h2>Materials</h2>

                                <p class="mb-1">
                                    This app...
                                </p>
                                <p class="mb-1">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aspernatur aut culpa dolore doloremque earum eos eveniet, ex impedit maxime modi officiis pariatur praesentium quas recusandae sint temporibus tenetur vel?
                                </p>
                                <p>
                                    Learn more about this app <a href="#">here</a>.<!-- TODO: Add link -->
                                </p>
                            </div>

                            <Button :icon-size="1.4" :to="{ name: 'Authentication/Register'}" class="mt-1"
                                    fluid icon="account-plus-outline">
                                Create an account
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

useHead({
    title: 'Login'
});

const data = reactive({
    tab: "EMAIL_PASSWORD",
    tabs: [
        {
            value: "EMAIL_PASSWORD",
            text: "E-mail and Password"
        },
        {
            value: "EMAIL",
            text: "E-mail Login"
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
            error = "Login failed. Make sure you entered correct account details.";
        }
    } else if (type === 'EMAIL') {
        if (data.emailStage === 0) {
            const result = await authenticationStore.loginEmail(data.email, undefined);

            if (result) {
                data.emailStage = 1;
            } else {
                error = "You entered wrong e-mail or there is already a request for login. Check your e-mail and try again.";
            }
        } else if (data.emailStage === 1) {
            const result = await authenticationStore.loginEmail(data.email, data.code);

            if (result) {
                await router.push({name: "Dashboard"});
            } else {
                error = "You entered wrong code. Check your e-mail and try again.";
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
