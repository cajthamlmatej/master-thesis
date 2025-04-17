<template>
    <router-view></router-view>

    <footer>
        <div class="container">
            <div class="copyright">
                <p v-t="{year: 2025}">footer.copyright</p>
                <p v-t>footer.love</p>
            </div>
            <div class="links">
                <ul>
                    <li><a :href="DOCS_LINK" class="education"></a></li>
                    <li><a :href="APP_LINK" class="blackboard"></a></li>
                    <li><a href="https://discord.gg/YRxt4yex4G" class="discord"></a></li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const DOCS_LINK = import.meta.env.VITE_DOCS;
const APP_LINK = import.meta.env.VITE_APP;
const API_LINK = import.meta.env.VITE_API;
</script>