import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EditorView from '../views/EditorView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView
        },
        {
            path: '/player',
            name: 'Player',
            component: () => import('../views/PlayerView.vue'),
        },
        {
            path: '/old',
            component: EditorView
        },
    ]
})

export default router
