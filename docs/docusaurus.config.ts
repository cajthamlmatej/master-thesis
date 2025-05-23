import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import 'dotenv/config';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Materalist Documentation',
  tagline: 'Not every presentation is material, but yours is definitely worth presenting!',
  favicon: 'img/favicon.ico?r=2',
  staticDirectories: ['static'],

  url: process.env.DOCS_LINK ?? 'https://materalist.com',
  baseUrl: '/',

  onBrokenLinks: 'warn',
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
    image: 'img/logo.png',
    navbar: {
      title: 'Materalist Documentation',
      logo: {
        alt: 'Materalist Documentation',
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
          href: process.env.APP_LINK ?? `http://localhost:5173`,
          label: 'Application',
          position: 'right',
        },
        {
          href: process.env.HOME_LINK ?? `http://localhost:5174`,
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
    metadata: [
      {
        name: 'keywords',
        content: 'Materalist, documentation, presentation, materials, school work, study, interactive materials, interactive presentation, interactive study, interactive school work, interactive materials',
      },
      {
        name: 'description',
        content: 'Materalist is a presentation tool that allows you to create interactive materials for school work, study, and presentations.',
      },
      {
        name: 'og:image',
        content: 'https://materalist.com/img/logo.png',
      },
      {
        name: 'og:title',
        content: 'Materalist Documentation',
      },
      {
        name: 'og:description',
        content: 'Materalist is a presentation tool that allows you to create interactive materials for school work, study, and presentations.',
      }
    ]
  } satisfies Preset.ThemeConfig,
};

export default config;
