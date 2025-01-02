import 'reflect-metadata';

import './assets/reset.css'
import './assets/variables.scss'
import './assets/helpers.scss'
import './assets/main.scss'
import './assets/editor.scss'

import {createApp, defineAsyncComponent} from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router);


(() => {
    app.component("Button", defineAsyncComponent(() => import("@/components/design/button/Button.vue")));

    app.component("Dialog", defineAsyncComponent(() => import("@/components/design/dialog/Dialog.vue")));
    app.component("Card", defineAsyncComponent(() => import("@/components/design/card/Card.vue")));

})();

app.mount('#app')
