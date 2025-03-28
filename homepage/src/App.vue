<template>
    <header :class="{ scrolled: scrollAmount > 0 }">
        <div class="container">
            <nav>
                <ul>
                    <li><a href=""><span class="logo"></span></a></li>
                </ul>

                <ul class="main">
                    <li><a href="">O Materalist</a></li>
                    <li><a href="">Porovnání</a></li>
<!--                    <li><a href="">XD</a></li>-->
                    <li><a href="">Ukázkové materiály</a></li>
                </ul>

                <ul>
                    <li><a href="">Do aplikace</a></li>
                    <li  id="menu-activator"><a  @click="menu = true"><img src="/icons/hamburger.svg"></a></li>
                </ul>
            </nav>
        </div>
    </header>

    <nav class="menu" :class="{ visible: menu }">
        <div id="menu-deactivator"><a @click="menu = false"><img src="/icons/hamburger.svg"></a></div>
        <ul>
            <li><a href="">O Materalist</a></li>
            <li><a href="">Porovnání</a></li>
            <li><a href="">Ukázkové materiály</a></li>
            <li><a href="">Do aplikace</a></li>
        </ul>
    </nav>

    <main>
        <section class="landing">
            <div class="container">
                <div class="content">
                    <h1>Tvoření materiálů s jasným cílem</h1>

                    <p>Každý vytvořený materiál pro výuku je důležitý. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam consequatur delectus, deleniti ducimus enim eos esse est fugiat fugit incidunt nulla quas quis quod reiciendis, repellat sint suscipit tenetur vero.</p>

                    <nav class="buttons">
                        <ul>
                            <li><a href="" class="button primary">Začít vytvářet</a></li>
                            <li><a href="" class="button">Proč Materalist</a></li>
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

                    <div class="content">
                        Editor v akci
                    </div>

                    <div class="dots">
                        <img src="/icons/dots.svg" alt="" :style="{
                    transform: `rotate(${0 + scrollAmount*-0.05}deg)`
                }"></div>
                </div>
            </div>
        </section>

        <section class="two-sides">
            <div class="side">
                <h2></h2>
            </div>
            <div class="side">
                <img src="" alt="">
            </div>
        </section>
    </main>

    <RouterView/>
</template>

<script setup lang="ts">
import {RouterView} from 'vue-router'
import {useScrollReact} from "@/composables/scrollReact.ts";
import {ref, watch} from "vue";

const scrollAmount = ref(0);

useScrollReact((amount) => {
    scrollAmount.value = amount;
});

const menu = ref(false);
</script>

<style scoped lang="scss">
.container {
    width: 1200px;
    margin: 0 auto;
    padding: 0 2em;

    @media (max-width: 1200px) {
        width: 100%;
    }

    @media (max-width: 768px) {
        padding: 0 1em;
    }

    @media (max-width: 480px) {
        padding: 0 0.5em;
    }
}

header {
    backdrop-filter: blur(17px);
    position: fixed;
    top: 0;
    z-index: 100;
    width: 100%;
    transition: background-color 0.3s;

    nav {
        display: flex;
        justify-content: space-between;

        ul {
            display: flex;
            align-items: center;
            gap: 1.5em;
            list-style: none;

            li {
                display: block;
                text-align: center;

                a {
                    display: block;
                    color: white;
                    text-decoration: none;
                    font-size: 1.2rem;
                    padding: 0.8em 1.5em;
                    border-radius: 0.5em;
                    transition: background-color 0.3s;

                    &:hover {
                        background-color: rgba(255, 255, 255, 0.1);
                    }

                    @media (max-width: 1200px) {
                        padding: 0.4em 0.8em;
                        font-size: 1rem;
                    }
                }

                span.logo {
                    display: block;
                    width: 140px;
                    height: 90px;
                    background-image: url('/logo.png');
                    background-size: contain;
                    background-repeat: no-repeat;

                    @media (max-width: 1200px) {
                        width: 100px;
                        height: 60px;
                    }
                }

                &#menu-activator {
                    display: none;

                    a {
                        img {
                            width: 30px;
                            height: 30px;
                        }
                    }

                    @media (max-width: 768px) {
                        display: flex;
                    }
                }
            }

            &.main {
                @media (max-width: 768px) {
                    display: none;
                }
            }

            @media (max-width: 1200px) {
                gap: 0.75em;
            }

            @media (max-width: 768px) {
                gap: 0.5em;
            }

            @media (max-width: 480px) {
                gap: 0.25em;
            }
        }
    }

    &.scrolled {
        background-color: rgba(89, 75, 93, 0.25);
    }
}

nav.menu {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;

    width: 100%;
    height: 100vh;
    background-color: rgba(89, 75, 93, 0.9);

    visibility: hidden;
    padding: 8em 0;
    text-align: center;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    touch-action: none;
    user-select: none;
    pointer-events: none;


    &.visible {
        visibility: visible;
        opacity: 1;
        touch-action: auto;
        user-select: auto;
        pointer-events: auto;
    }

    ul {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        justify-content: space-between;

        list-style: none;

        li a {
            display: block;
            color: white;
            text-decoration: none;
            font-size: 1.5rem;
            padding: 0.8em 1.5em;
            border-radius: 0.5em;
            transition: background-color 0.3s;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        }
    }

    #menu-deactivator {
        position: absolute;
        top: 1em;
        right: 1em;

        a {
            display: block;
            color: white;
            text-decoration: none;
            font-size: 1.2rem;
            padding: 0.8em 1.5em;
            border-radius: 0.5em;
            transition: background-color 0.3s;

            &:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            @media (max-width: 1200px) {
                padding: 0.4em 0.8em;
                font-size: 1rem;
            }

            img {
                transform: rotate(90deg);
                width: 30px;
                height: 30px;
            }
        }
    }
}

main {
    section {
        min-height: 100vh;

        &.landing {
            background-color: #907eb3;
            background: linear-gradient(204deg, rgba(189,168,235,1) 19%, #b6a7d7 100%);
            color: white;
            display: flex;
            align-items: center;
            padding: 7em 0;
            overflow: hidden;

            .container {
                position: relative;

                @media (max-width: 1200px) {
                    display: flex;
                    flex-direction: column;
                    gap: 2em;
                }
            }

            .container > .content {
                position: relative;
                z-index: 10;
                max-width: 50%;
                padding: 1em;

                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1.5em;
                }

                p {
                    font-size: 1.2rem;
                    margin-bottom: 1.5em;
                }

                .buttons {
                    ul {
                        list-style: none;
                        display: flex;
                        align-content: center;
                        flex-wrap: wrap;
                        gap: 1em;

                        li {
                            display: block;
                            text-align: center;

                            a {
                                border-radius: 0.5em;
                                padding: 0.5em 2.5em;
                                text-decoration: none;
                                color: white;
                                display: block;

                                border: 2px solid #7b57c4;
                                background-color: rgba(110, 79, 169, 0.25);
                                transition: background-color 0.3s;
                                backdrop-filter: blur(17px);

                                &.primary {
                                    background-color: rgba(110, 79, 169, 0.89);
                                }

                                &:hover {
                                    background-color: #7b57c4;
                                }
                            }
                        }
                    }
                }

                @media (max-width: 1200px) {
                    max-width: 100%;
                }
            }

            .star {
                position: absolute;
                bottom: -100px;
                left: -100px;
                width: 400px;
                height: 400px;
                opacity: 0.4;
                user-select: none;

                img {
                    width: 100%;
                    height: 100%;
                    backdrop-filter: blur(17px);
                }
            }


            .dots {
                position: absolute;
                top: 10%;
                right: -50px;
                width: 100px;
                height: 200px;
                opacity: 0.4;
                user-select: none;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    backdrop-filter: blur(17px);
                }

                @media (max-width: 1200px) {
                    top: -100px;
                    right: 10%;
                    transform: rotate(90deg);
                }
            }

            .video {
                position: absolute;
                top: -20%;
                right: 10%;
                width: 40%;
                height: 180%;
                //overflow: hidden;
                border: 2px solid #7b57c4;

                border-radius: 1em;

                display: flex;
                flex-direction: column;

                video {
                    width: 100%;
                    flex-grow: 2;
                    object-fit: cover;
                    border-top-left-radius: 1rem;
                    border-top-right-radius: 1rem;
                }

                .content {
                    background-color: #7b57c4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    line-height: 1em;
                    padding: 1em;
                    border-bottom-left-radius: 1rem;
                    border-bottom-right-radius: 1rem;
                }

                @media (max-width: 1200px) {
                    position: relative;
                    width: 100%;
                    top: 0;
                    left: 0;
                }

                @media (max-height: 500px) {
                    top: 10%;
                    height: 90%;
                }

                @media (max-height: 800px) {
                    top: 0%;
                    height: 100%;
                }

                @media (max-height: 1000px) {
                    top: -5%;
                    height: 110%;
                }
            }
        }
    }
}
</style>