<template>
    <header :class="{ scrolled: scrollAmount > 0 }">
        <div class="container">
            <nav>
                <ul class="logo">
                    <li><a href="/"><span class="logo"></span></a></li>
                </ul>

                <ul class="main">
                    <li><a href="#why-use" v-t>navigation.why-use</a></li>
                    <li><a href="#about-us" v-t>navigation.about-us</a></li>
                    <li><a href="#join" v-t>navigation.join</a></li>
                    <li><a href="#examples" v-t>navigation.examples</a></li>
                    <li><a :href="DOCS_LINK" v-t>navigation.documentation</a></li>
                </ul>

                <ul>
                    <change-language></change-language>
                    <li><a :href="APP_LINK" v-t>navigation.application</a></li>
                    <li  id="menu-activator" :class="{'active': menu }"><a  @click="menu = true"><img src="/icons/hamburger.svg"></a></li>
                </ul>
            </nav>
        </div>
    </header>

    <nav class="menu" :class="{ visible: menu }">
        <div id="menu-deactivator"><a @click="menu = false"><img src="/icons/times.svg"></a></div>
        <ul>
            <li><a href="#why-use" v-t>navigation.why-use</a></li>
            <li><a href="#about-us" v-t>navigation.about-us</a></li>
            <li><a href="#join" v-t>navigation.join</a></li>
            <li><a href="#examples" v-t>navigation.examples</a></li>
            <li><a :href="DOCS_LINK" v-t>navigation.documentation</a></li>
            <li><a :href="APP_LINK" v-t>navigation.application</a></li>
        </ul>
    </nav>

    <main>
        <section class="landing">
            <div class="container">
                <div class="content">
                    <h1 v-t>landing.title</h1>

                    <p v-t>landing.about</p>

                    <nav class="buttons">
                        <ul>
                            <li><a :href="APP_LINK" class="button primary" v-t>landing.start</a></li>
                            <li><a href="#why-use" class="button" v-t>landing.why-use</a></li>
                        </ul>
                    </nav>
                </div>

                <div class="star">
                    <img src="/icons/star.svg" alt="" :style="{
                    transform: `rotate(${35 + scrollAmount*0.2}deg)`
                }">
                </div>
                <div class="video">
                    <video src="/thesis10.webm"
                           autoplay
                           loop
                           muted
                           playsinline
                    ></video>

                    <div class="content" v-t>landing.label</div>

                    <div class="dots">
                        <img src="/icons/dots.svg" alt="" :style="{
                    transform: `rotate(${19 + scrollAmount*-0.45}deg)`
                }"></div>
                </div>
            </div>
        </section>

        <section class="" id="why-use">
            <div class="container">

                <p class="subtitle" v-t>why-use.subtitle</p>
                <h2 v-t>why-use.title</h2>

                <div class="two-sides">
                    <div class="side">
<!--                        <img src="/img/using.webp" alt="Učitel používající Materalist k výuce, studenti používají počítače a své telefony ke sledování a odpovědím" class="cover">-->
                        <img src="/img/join.webp" :alt="$t('why-use.image-label')" class="cover">
                    </div>
                    <div class="side">
                        <div class="keypoints">
                            <div class="point" v-for="i in 4">
                                <h3 v-t>why-use.keypoints.{{i-1}}.title</h3>

                                <p v-t>why-use.keypoints.{{i-1}}.description</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="" id="about-us">
            <div class="container">
                <div class="two-sides">
                    <div class="side">
                        <p class="subtitle" v-t>about-us.subtitle</p>
                        <h2 v-t>about-us.title</h2>

                        <div class="about">
                            <p v-for="i in 4" v-t>about-us.text.{{i-1}}</p>
                        </div>
                    </div>
                    <div class="side">
                        <img src="/img/us.webp" :alt="$t('about-us.image-label')" class="cover">
                    </div>
                </div>
            </div>
        </section>

        <section class="join" id="join">
            <div class="container">
                <div class="callToAction">
                    <h2 v-t>join.title</h2>
                    <p v-t>join.text</p>

                    <a :href="APP_LINK"  class="button">
                        <span v-t>join.start</span>
                    </a>
                </div>
            </div>
        </section>

        <section id="examples">
            <div class="container">
                <p class="subtitle" v-t>examples.subtitle</p>
                <h2 v-t>examples.title</h2>
                
                <div v-if="items.length > 0">
                    <Slider :items="items[0]" />

                    <Slider :items="items[1]" start-direction="right" />
                </div>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import {useScrollReact} from "@/composables/scrollReact.ts";
import {computed, onMounted, ref, watch} from "vue";
import Slider from "@/components/Slider.vue";
import {$t} from "@/translation/Translation.ts";
import ChangeLanguage from "@/components/ChangeLanguage.vue";

const DOCS_LINK = import.meta.env.VITE_DOCS;
const APP_LINK = import.meta.env.VITE_APP;
const API_LINK = import.meta.env.VITE_API;

const scrollAmount = ref(0);

useScrollReact((amount) => {
    scrollAmount.value = amount;
});

const menu = ref(false);

onMounted(() => {
    const hrefs = document.querySelectorAll("a[href^='#']");

    for(const href of [...hrefs]) {
        href.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(href.getAttribute("href") || "") as HTMLElement;
            if (target) {
                target.scrollIntoView({behavior: "smooth"});
            }

            menu.value = false;
        });
    }
});

onMounted(async() => {
    const response = await fetch(`${API_LINK}material/featured`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
    }).then(a => a.json());

    let itemsParsed = [];

    for(let material of response.materials) {
        itemsParsed.push({
            author: material.user,
            name: material.name,
            thumbnail: material.thumbnail,
            link: `${APP_LINK}player/${material.id}`
        })
    }

    while(itemsParsed.length < 20) {
        itemsParsed.push(itemsParsed[Math.floor(Math.random() * itemsParsed.length)]);
    }

    items.value = [
        itemsParsed.slice(0, 10),
        itemsParsed.slice(10, 20)
    ];
}) 

const items = ref([] as ({
    author: string,
    name: string,
    thumbnail: string | undefined,
    link: string
}[])[]);
</script>