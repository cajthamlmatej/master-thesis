<template>
    <main class="main--menu">
        <section class="pa-2">
            <Row>
                <Col cols="12">
                    <Card fluid>
                        <p v-t class="title">page.not-found.title</p>

                        <p v-t>page.not-found.message</p>

                        <div class="flex flex-justify-start mt-1">
                            <Button :to="{ name: 'Dashboard' }" color="primary">
                                <span v-t>page.not-found.dashboard</span>
                            </Button>
                        </div>
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
