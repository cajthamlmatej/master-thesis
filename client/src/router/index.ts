import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
    ]
})

// Scroll to top on route change
router.afterEach(() => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

export default router
