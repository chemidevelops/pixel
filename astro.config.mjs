// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'http://178.105.214.12',
  output: 'static',
  integrations: [mdx()],
});
