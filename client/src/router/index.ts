import {createRouter, createWebHistory} from 'vue-router'
import {useAuthenticationStore} from "@/stores/authentication";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('../views/BaseLayout.vue'),

            children: [
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('../views/dashboard/Dashboard.vue'),
                }
            ]
        },
        {
            path: '/editor',
            component: () => import('../views/editor/Layout.vue'),

            children: [
                {
                    path: ':material',
                    name: 'Editor',
                    component: () => import('../views/editor/Editor.vue'),
                }
            ]
        },
        {
            path: '/player',
            name: 'Player',
            component: () => import('../views/PlayerView.vue'),
        },

        {
            path: "/authentication",
            component: () => import("../views/authentication/Layout.vue"),
            meta: {
                isAuthentication: true
            },

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

// Force user to log in before accessing the route
router.beforeResolve((to, from, next) => {
    if (to.meta.isAuthentication) {
        return next();
    }

    // Is user authenticated?
    const isAuthenticated = useAuthenticationStore().isLogged;

    if (!isAuthenticated) {
        return next({name: "Authentication"});
    }

    next();
});

// Scroll to top on route change
router.afterEach(() => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

export default router
