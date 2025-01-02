<template>
    <Dialog v-model:value="visible" persistent>
        <template #default>
            <Card dialog>
                <p class="title">Information about local files and cookies</p>

                <p class="mb-1">When you visit this site, local files and cookies are stored for the purposes of the site. <b>The files are necessary for the operation of the site</b>. These include:</p>

                <ul class="mb-1">
                    <li>login tokens</li>
                    <li>information about the logged-in user</li>
                    <li>and more</li>
                </ul>

                <p class="mb-1">If you do not agree to the processing of cookies, please leave the site <u>immediately</u>.</p>

                <div class="flex flex-justify-end">
                    <Button @click="accept">I agree</Button>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";

const visible = ref(false);

onMounted(() => {
    visible.value = localStorage.getItem("cookies") !== "true";
});

function accept() {
    localStorage.setItem("cookies", "true");
    visible.value = false;
}
</script>
