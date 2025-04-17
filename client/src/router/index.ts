import {createRouter, createWebHistory} from 'vue-router'
import {useAuthenticationStore} from "@/stores/authentication";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: {
                name: 'Dashboard',
                params: {
                    lang: 'en'
                }
            }
        },

        {
            path: '/:lang/',
            component: () => import('../views/BaseLayout.vue'),

            children: [
                {
                    path: '',
                    redirect: {
                        name: 'Dashboard'
                    }
                },
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('../views/dashboard/Dashboard.vue'),
                },
                {
                    path: 'plugins',
                    name: 'Plugins',
                    component: () => import('../views/plugins/Plugins.vue'),
                },
                {
                    path: 'featured',
                    name: 'Featured',
                    component: () => import('../views/featured/Featured.vue'),
                }
            ]
        },
        {
            path: '/:lang/editor',
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
            path: '/:lang/player',
            component: () => import('../views/player/Layout.vue'),
            meta: {
                withoutAuthentication: true
            },

            children: [
                {
                    path: ':material',
                    name: 'Player',
                    component: () => import('../views/player/Player.vue'),
                }
            ]
        },

        {
            path: "/:lang/authentication",
            component: () => import("../views/authentication/Layout.vue"),
            meta: {
                withoutAuthentication: true
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

        {
            path: '/:lang/user/settings',
            component: () => import('../views/settings/Layout.vue'),

            children: [
                {
                    path: '',
                    name: 'UserSettings',
                    component: () => import('../views/settings/Base.vue'),
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
    if (to.meta.withoutAuthentication) {
        return next();
    }

    // Is user authenticated?
    const isAuthenticated = useAuthenticationStore().isLogged;

    if (!isAuthenticated) {
        return next({
            name: "Authentication",
            params: {
                lang: to.params.lang ?? "en"
            }
        });
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
