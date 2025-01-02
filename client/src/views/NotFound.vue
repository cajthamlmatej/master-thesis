<template>
    <main class="main--menu">
        <section class="pa-2">
            <Row>
                <Col cols="12">
                    <Card fluid>
                        <p class="title">Not Found</p>

                        <p>
                            The page you are looking for does not exist. Please check the URL and try again.
                            You can also go back to the <router-link :to="{ name: 'Dashboard' }">dashboard</router-link>.
                        </p>
                    </Card>
                </Col>
            </Row>
        </section>
    </main>
</template>

<script lang="ts" setup>
import {useHead} from "unhead";

useHead({
    title: 'Not Found'
});

</script>

<style lang="scss" scoped>
</style>
