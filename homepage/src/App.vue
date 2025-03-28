<template>
    <header :class="{ scrolled: scrollAmount > 0 }">
        <div class="container">
            <nav>
                <ul>
                    <li><a href=""><span class="logo"></span></a></li>
                </ul>

                <ul>
                    <li><a href="">O Materalist</a></li>
                    <li><a href="">Porovnání</a></li>
                    <li><a href="">XD</a></li>
                    <li><a href="">Ukázkové materiály</a></li>
                </ul>

                <ul>
                    <li><a href="">Do aplikace</a></li>
                </ul>
            </nav>
        </div>
    </header>

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

        <section>

        </section>
    </main>

    <RouterView/>
</template>

<script setup lang="ts">
import {RouterView} from 'vue-router'
import {useScrollReact} from "@/composables/scrollReact.ts";
import {ref} from "vue";

const scrollAmount = ref(0);

useScrollReact((amount) => {
    scrollAmount.value = amount;
});
</script>

<style scoped lang="scss">
.container {
    width: 1200px;
    margin: 0 auto;
    padding: 0 2em;
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
                }

                span.logo {
                    display: block;
                    width: 140px;
                    height: 90px;
                    background-image: url('/logo.png');
                    background-size: contain;
                    background-repeat: no-repeat;
                }
            }
        }
    }

    &.scrolled {
        background-color: rgba(89, 75, 93, 0.25);
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

            .container {
                position: relative;
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
                        gap: 1em;

                        li {
                            display: block;

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
            }

            .star {
                position: absolute;
                bottom: -100px;
                left: -100px;
                width: 400px;
                height: 400px;
                opacity: 0.2;
                user-select: none;

                img {
                    width: 100%;
                    height: 100%;
                }
            }


            .dots {
                position: absolute;
                top: 10%;
                right: -50px;
                width: 100px;
                height: 200px;
                opacity: 0.2;
                user-select: none;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
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
            }
        }
    }
}
</style>