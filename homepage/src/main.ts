import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {setupTranslations} from "@/translation/VueTranslations.ts";

const app = createApp(App)

app.use(router)

setupTranslations(app);
app.mount('#app')
