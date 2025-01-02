<template>
    <Row justify="center">
        <Col :cols="12" :lg="8" :md="10" :sm="11" :xl="6">
            <Card fluid>
                <TransitionGroup class="list-holder" name="list" tag="div">
                    <div v-if="!data.success">
                        <Form :onSubmit="handle">
                            <template #default="{ validationChange }">
                                <Input v-model:value="data.name" :validators="[
                                        (v: string) => !!v || 'Name is required',
                                        (v: string) => v.length > 3 || 'Name has to be at least 4 characters',
                                        (v: string) => v.length < 255 || 'Name has to be shorter than 255 characters'
                                    ]" label="Name you want us to call you"
                                       required type="text"
                                       @validationChange="validationChange"/>

                                <Input v-model:value="data.email" :validators="[
                                        (v: string) => !!v || 'E-mail is required',
                                        (v: string) => /.+@.+\..+/.test(v) || 'E-mail has to be in correct format',
                                        (v: string) => v.length < 255 || 'E-mail has to be shorter than 255 characters'
                                    ]" label="E-mail" required type="email" @validationChange="validationChange"/>

                                <Input v-model:value="data.password"
                                       :validators="[
                                           (v: string) => v.length >= 8 || 'Password has to be at least 8 characters',
                                           (v: string) => v.length < 255 || 'Password has to be shorter than 255 characters'
                                       ]"
                                       label="Password" required
                                       type="password"
                                       @validationChange="validationChange"/>

                                <Input v-model:value="data.passwordRepeat" :validators="[
                                (v: string) => v === data.password || 'Passwords have to match'
                                ]" label="Repeat password" required
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
                                    Register
                                </Button>
                            </template>
                        </Form>

                        <div class="mt-2">
                            <p class="text-center">After registration, you will be asked to confirm your registration
                                using the link in the
                                entered e-mail.</p>

                            <p class="text-center mt-1">
                                By registering you agree to <a>conditions of use</a> and <a>privacy policy</a>.
                            </p><!-- TODO: Add links to conditions of use and privacy policy -->

                            <p class="text-center mt-1">
                                Already have an account?
                                <router-link :to="{ name: 'Authentication' }">Sign in here.</router-link>
                            </p>
                        </div>
                    </div>
                    <div v-else>
                        <p class="title">Registrace byla úspěšná</p>

                        <p>Na e-mail by Vám měl dorazit odkaz pro potvrzení registrace. Po potvrzení se můžete
                            přihlásit.</p>

                        <Button :to="{ name: 'Authentication' }" class="mt-1" fluid>Přihlásit se</Button>
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

useHead({
    title: 'Account registration'
});

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
        data.error = 'Registration failed. An account with this e-mail probably already exists. Try different e-mail.';
        return;
    } else {
        data.error = '';

        data.success = true;
    }

    data.sending = false;
}
</script>
