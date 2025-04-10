import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Materalist Documentation',
  tagline: 'Not every presentation is material, but yours is definitely worth presenting!',
  favicon: 'img/favicon.ico?r=2',
  staticDirectories: ['static'],

  url: 'https://docs.materalist.com',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Materalist',
      logo: {
        alt: 'Materalist',
        src: 'img/logo.png',
      },
      items: [
        {
          href: '/docs/intro',
          label: 'Introduction',
        },
        {
          type: 'docSidebar',
          sidebarId: 'usageSidebar',
          position: 'left',
          label: 'Using'
        },
        {
          type: 'docSidebar',
          sidebarId: 'extendingSidebar',
          position: 'left',
          label: 'Extending',
        },
        {
          href: 'https://app.materalist.com/',
          label: 'Application',
          position: 'right',
        },
        {
          href: 'https://materalist.com/',
          label: 'Website',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Materalist`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
