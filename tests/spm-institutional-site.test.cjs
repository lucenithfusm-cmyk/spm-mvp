const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'../public-web');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
test('website has indexable public educational pages without broken Premium relative routes',()=>{
 const html=read('index.html');
 assert.match(html,/name="robots" content="index,follow"/);
 assert.match(html,/id="nosotros"/);
 assert.match(html,/id="recursos"/);
 assert.match(html,/href="contenidos\.html"/);
 assert.doesNotMatch(html,/href="\.\.\/premium-v2\//);
 assert.doesNotMatch(html,/Conocealuaci[oó]n/);
});
test('public website never exposes financial or editorial permissions and does not link to admin',()=>{
 for(const f of ['index.html','resources.html','contenidos.html']){
  const h=read(f);
  assert.doesNotMatch(h,/href=["'][^"']*\/admin\//);
  assert.doesNotMatch(h,/spm_finance_movements|spm_finance_sales|spm_is_site_editor/);
 }
 assert.match(read('admin/editor.html'),/spm_is_site_editor/);
 assert.match(read('admin/editor.html'),/signInWithPassword/);
 assert.match(read('admin/editor.html'),/noindex,nofollow,noarchive/);
});
test('visible local HTML links on public home page resolve into publish directory',()=>{
 const html=read('index.html'),links=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
 for(const href of links){
  if(href.startsWith('#')||/^(https?:|mailto:|tel:)/.test(href))continue;
  const raw=href.split(/[?#]/)[0];
  assert(!raw.startsWith('../'),'Parent directory link not available from Netlify publish dir: '+href);
  assert(fs.existsSync(path.join(base,raw)),'Broken website link: '+href);
 }
});
test('CMS publication requires editor role and storage policy protects uploads',()=>{
 const sql=fs.readFileSync(path.join(__dirname,'../internal-site/sql/001_editorial_cms_v1.sql'),'utf8');
 assert.match(sql,/ALTER TABLE public\.spm_site_posts ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/spm_site_posts_public_read/);
 assert.match(sql,/status='published' AND published_at<=now\(\)/);
 assert.match(sql,/spm_site_posts_editor_insert/);
 assert.match(sql,/spm_is_site_editor\(\)/);
 assert.match(sql,/spm_site_images_editor_upload/);
 assert.doesNotMatch(sql,/GRANT\s+DELETE\s+ON public\.spm_site_posts/i);
});
test('public content uses safe text nodes, not unsanitized author HTML',()=>{
 const html=read('contenidos.html');
 assert.match(html,/para\.textContent=text\.trim\(\)/);
 assert.match(html,/a\.textContent=p\.title/);
 assert.doesNotMatch(html,/innerHTML\s*=\s*p\.(?:title|content|summary)/);
});
test('Netlify publishes only public-web and hides admin from search engines',()=>{
 const cfg=fs.readFileSync(path.join(__dirname,'../netlify.toml'),'utf8');
 assert.match(cfg,/publish = "public-web"/);
 assert.match(read('_headers'),/\/admin\/\*/);
 assert.match(read('robots.txt'),/Disallow: \/admin\//);
});