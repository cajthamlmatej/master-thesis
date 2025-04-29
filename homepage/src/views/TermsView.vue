<template>
    <header class="scrolled">
        <div class="container">
            <nav>
                <ul class="logo">
                    <li><a href="/"><span class="logo"></span></a></li>
                </ul>

                <ul class="main">
                    <li><a href="/" v-t>navigation.home</a></li>
                </ul>

                <ul>
                    <change-language></change-language>
                    <li><a :href="APP_LINK" v-t>navigation.application</a></li>
                    <li id="menu-activator" :class="{ 'active': menu }"><a @click="menu = true"><img
                                src="/icons/hamburger.svg"></a></li>
                </ul>
            </nav>
        </div>
    </header>

    <nav class="menu" :class="{ visible: menu }">
        <div id="menu-deactivator"><a @click="menu = false"><img src="/icons/times.svg"></a></div>
        <ul>
            <li><a href="/" v-t>navigation.home</a></li>
            <li><a :href="APP_LINK" v-t>navigation.application</a></li>
        </ul>
    </nav>

    <main>
        <section class="terms">
            <div class="container">
                <p class="subtitle" v-t>terms.subtitle</p>

                <h2 v-t>terms.title</h2>

                <div class="warning">
                    <p v-t>terms.warning</p>
                </div>


                <p class="date"><strong>Effective Date:</strong> 17. 4. 2025</p>

                <p>Welcome to Materalist ("we", "us", or "our"). By accessing or using our platform for creating and
                    sharing custom interactive study materials (the "Service"), you agree to be bound by the following
                    Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.</p>

                <h3>1. Use of the Service</h3>
                <p>The Service is provided <strong>free of charge</strong> and is intended for educational and personal
                    use. You may create, share, and interact with study materials using our platform in accordance with
                    these Terms and all applicable laws and regulations.</p>

                <h3>2. No Data Reliability</h3>
                <p>We do <strong>not guarantee the availability, accuracy, integrity, or security of any data</strong>
                    you create, upload, or store using the Service. You are solely responsible for backing up your
                    content. We are not liable for any loss, corruption, or inaccessibility of your data.</p>

                <h3>3. No Guarantees of Availability</h3>
                <p>We <strong>do not guarantee</strong> that the Service will be available at all times. The Service may
                    be suspended or discontinued <strong>at any time</strong>, with or without notice, for any reason or
                    no reason at all. This includes but is not limited to maintenance, updates, technical issues, or
                    project termination.</p>

                <h3>4. No Warranty</h3>
                <p>The Service is provided on an "<strong>as is</strong>" and "<strong>as available</strong>" basis,
                    <strong>without any warranties</strong>, express or implied. We disclaim all warranties, including
                    but not limited to warranties of merchantability, fitness for a particular purpose, and
                    non-infringement.</p>

                <h3>5. Limitation of Liability</h3>
                <p>To the fullest extent permitted by law, in <strong>no event shall we be liable</strong> for any
                    direct, indirect, incidental, special, consequential, or punitive damages arising out of or relating
                    to your use of or inability to use the Service, including but not limited to any loss of data, loss
                    of content, or loss of profits, even if we have been advised of the possibility of such damages.</p>

                <h3>6. Indemnity</h3>
                <p>You agree to <strong>indemnify and hold harmless</strong> the Service owner(s), developers,
                    affiliates, and contributors from any claim, liability, loss, expense, or demand, including
                    reasonable attorneys' fees, arising from your use of the Service or violation of these Terms.</p>

                <h3>7. No Support or Maintenance</h3>
                <p>We are <strong>not obligated</strong> to provide any support, maintenance, updates, bug fixes, or
                    other enhancements to the Service. However, if you need to contact us, you may reach us at <a
                        href="mailto:support@materalist.com">support@materalist.com</a>.</p>

                <h3>8. Intellectual Property</h3>
                <p>You retain ownership of any content you create. By using the Service, you grant us a non-exclusive
                    license to host, display, and distribute your content solely for the purpose of providing the
                    Service.</p>

                <h3>9. Termination</h3>
                <p>We reserve the right to terminate or suspend access to the Service <strong>at any time</strong>,
                    without notice, for conduct that we believe violates these Terms or is harmful to other users or the
                    integrity of the Service.</p>

                <h3>10. Governing Law</h3>
                <p>These Terms shall be governed by and construed in accordance with the laws of
                    <strong>Czechia</strong>. Any disputes arising under these Terms shall be subject to the exclusive
                    jurisdiction of the courts in <strong>Czechia</strong>.</p>

                <h3>11. Changes to Terms</h3>
                <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon
                    posting on the website. Continued use of the Service constitutes acceptance of the revised Terms.
                </p>
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

const menu = ref(false);

</script>