import 'reflect-metadata';

import './assets/reset.css'
import './assets/variables.scss'
import './assets/main.scss'
import './assets/editor.scss'
import './assets/player.scss'
import './assets/editor-ui.scss'
import './assets/helpers.scss'

import {createApp, defineAsyncComponent} from 'vue'

import {createPinia} from 'pinia'
import App from './App.vue'
import router from './router'
import FloatingVue from 'floating-vue'
import {setupTranslations} from "@/translation/VueTranslations";

const app = createApp(App)

app.use(createPinia())
app.use(router);

setupTranslations(app);

app.use(FloatingVue);

(() => {
    app.component("Alert", defineAsyncComponent(() => import("@/components/design/alert/Alert.vue")));
    app.component("Button", defineAsyncComponent(() => import("@/components/design/button/Button.vue")));
    app.component("Divider", defineAsyncComponent(() => import("@/components/design/divider/Divider.vue")));

    app.component("Row", defineAsyncComponent(() => import("@/components/design/grid/Row.vue")));
    app.component("Col", defineAsyncComponent(() => import("@/components/design/grid/Col.vue")));

    app.component("Dialog", defineAsyncComponent(() => import("@/components/design/dialog/Dialog.vue")));
    app.component("Card", defineAsyncComponent(() => import("@/components/design/card/Card.vue")));

    app.component("List", defineAsyncComponent(() => import("@/components/design/list/List.vue")));
    app.component("ListItem", defineAsyncComponent(() => import("@/components/design/list/ListItem.vue")));
    app.component("Tabs", defineAsyncComponent(() => import("@/components/design/tabs/Tabs.vue")));
    app.component("Pagination", defineAsyncComponent(() => import("@/components/design/pagination/Pagination.vue")));

    app.component("Tooltip", defineAsyncComponent(() => import("@/components/design/tooltip/Tooltip.vue")));

    app.component("Header", defineAsyncComponent(() => import("@/components/design/header/Header.vue")));
    app.component("Navigation", defineAsyncComponent(() => import("@/components/design/navigation/Navigation.vue")));
    app.component("NavigationButton", defineAsyncComponent(() => import("@/components/design/navigation/NavigationButton.vue")));
    app.component("NavigationItem", defineAsyncComponent(() => import("@/components/design/navigation/NavigationItem.vue")));

    app.component("Form", defineAsyncComponent(() => import("@/components/design/form/Form.vue")));
    app.component("Input", defineAsyncComponent(() => import("@/components/design/input/Input.vue")));
    app.component("Checkbox", defineAsyncComponent(() => import("@/components/design/checkbox/Checkbox.vue")));
    app.component("Select", defineAsyncComponent(() => import("@/components/design/select/Select.vue")));
})();

app.mount('#app')


const calculateHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

calculateHeight();
window.addEventListener('resize', calculateHeight);
