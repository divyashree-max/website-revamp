import {defineConfig} from 'vite';

export default defineConfig({
 base:'./',
 plugins:[{
  name:'production-import-map',
  apply:'build',
  transformIndexHtml(html){return html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'')},
 }],
});
