<template>
    <header class="scrolled">
        <div class="container">
            <nav>
                <ul class="logo">
                    <li><a href="/"><span class="logo"></span></a></li>
                </ul>

                <ul>
                    <change-language></change-language>
                    <li><a href="/" v-t>navigation.home</a></li>
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
                <p class="subtitle" v-t>privacy.subtitle</p>

                <h2 v-t>privacy.title</h2>

                <div class="warning">
                    <p v-t>privacy.warning</p>
                </div>

                <p class="date"><strong>Effective Date:</strong> 17. 4. 2025</p>

                <p>This Privacy Policy explains how Materalist ("we", "us", or "our") collects, uses, and protects your information when you use our platform for creating and sharing interactive study materials.</p>

                <h3>1. Data Storage and Hosting</h3>
                <p>All data is securely stored within the European Union, specifically in Czechia. We take reasonable technical and organizational measures to protect your data, including encryption in transit and at rest where appropriate.</p>

                <h3>2. No Liability for Data Loss</h3>
                <p>While we strive to maintain a reliable and secure service, we make <strong>no guarantees about data reliability or retention</strong>. We are <strong>not liable</strong> for any data loss, corruption, unauthorized access, or service downtime. Users are encouraged to export and back up their data regularly.</p>

                <h3>3. Data Export</h3>
                <p>You may request to export your content and account data at any time via the app interface. Export links are valid for <strong>7 days</strong> after generation, and the request can be made within <strong>30 days</strong> from the time you initiate it.</p>

                <h3>4. Account Security</h3>
                <p>Your password is stored securely using one-way cryptographic hashing. We do not store your plaintext password and cannot recover it. If you forget your password, a reset option is available via your registered email address.</p>

                <h3>5. Local Storage</h3>
                <p>The app uses <strong>LocalStorage</strong> (a browser-based feature) to save temporary or session-related data that enhances performance and usability. This may include UI preferences, editor states, or unsaved changes. No sensitive or personally identifiable information is stored in LocalStorage.</p>

                <h3>6. Data Sharing</h3>
                <p>We do not sell, trade, or rent your personal information to third parties. Your data is not shared with third parties except where necessary to provide core functionality (e.g., hosting providers) or where required by law.</p>

                <h3>7. Your Rights</h3>
                <p>If you are located in the European Union, you have rights under the General Data Protection Regulation (GDPR), including the right to access, correct, or delete your personal data. For any requests, contact us at <a href="mailto:support@materalist.com">support@materalist.com</a>.</p>

                <h3>8. Data Retention</h3>
                <p>We retain user-generated content and account information for as long as your account is active. Upon deletion of your account, your data will be permanently removed from our systems within a reasonable timeframe.</p>

                <h3>9. Changes to This Policy</h3>
                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Effective Date." Continued use of the service after any such updates constitutes acceptance of the new terms.</p>

                <h3>10. Contact</h3>
                <p>If you have questions or concerns regarding this Privacy Policy or your personal data, please contact us at <a href="mailto:support@materalist.com">support@materalist.com</a>.</p>

            </div>
        </section>

    </main>
</template>

<script setup lang="ts">
</script>

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