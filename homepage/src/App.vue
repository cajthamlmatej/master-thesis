<template>
    <router-view></router-view>

    <footer v-if="loaded">
        <div class="container">
            <div class="copyright">
                <p v-t="{year: 2025}">footer.copyright</p>
                <p v-t>footer.love</p>
            </div>
            <div class="links">
                <ul>
                    <li><router-link :to="{name: 'privacy-policy'}"><span v-t>privacy.title</span></router-link></li>
                    <li><router-link :to="{name: 'terms-of-service'}"><span v-t>terms.title</span></router-link></li>
                </ul>
            </div>
            <div class="links">
                <ul>
                    <li><a :href="DOCS_LINK" class="icon education"></a></li>
                    <li><a :href="APP_LINK" class="icon blackboard"></a></li>
                    <li><a href="https://discord.gg/YRxt4yex4G" class="icon discord"></a></li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const DOCS_LINK = import.meta.env.VITE_DOCS;
const APP_LINK = import.meta.env.VITE_APP;
const API_LINK = import.meta.env.VITE_API;

const router = useRouter();
const loaded = ref(false);

onMounted(async () => {
    await router.isReady();
    loaded.value = true;
}) 
</script>