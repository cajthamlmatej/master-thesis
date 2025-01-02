import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: HomeView
        },
        {
            path: '/player',
            name: 'Player',
            component: () => import('../views/PlayerView.vue'),
        },

        {
            path: "/authentication",
            component: () => import("../views/authentication/Layout.vue"),

            children: [
                {
                    path: "",
                    name: "Authentication",
                    component: () => import("../views/authentication/Authentication.vue"),
                },
                {
                    path: "register",
                    name: "Authentication/Register",
                    component: () => import("../views/authentication/Register.vue"),
                },
                {
                    path: "activate/:token",
                    name: "Authentication/Activate",
                    component: () => import("../views/authentication/Activate.vue"),
                }
            ]
        },

        // Not found
        {
            path: "/:pathMatch(.*)*",
            name: "NotFound",
            component: () => import("../views/NotFound.vue")
        }
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
