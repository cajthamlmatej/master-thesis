import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: {
                name: 'home',
                params: {
                    lang: 'en'
                }
            }
        },

        {
            path: '/:lang/',
            name: 'home',
            component: HomeView,
        },

        {
            path: '/:lang/terms-of-service',
            name: 'terms-of-service',
            component: () => import('../views/TermsView.vue'),
        },
        

        {
            path: '/:lang/privacy-policy',
            name: 'privacy-policy',
            component: () => import('../views/PrivacyView.vue'),
        }
    ],
})

export default router
