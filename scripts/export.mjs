// CLI: npm run export -- posts/founder/x.yaml [more.yaml …]   |   npm run export -- --all
import { createServer } from '../server.mjs';
import { exportPosts, closeBrowser } from './exporter.mjs';

const args = process.argv.slice(2);
const server = createServer().listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://localhost:${server.address().port}`;

let posts = args.filter((a) => !a.startsWith('--'));
if (args.includes('--all') || posts.length === 0) {
  posts = (await (await fetch(`${base}/api/posts`)).json()).map((p) => p.path);
}

const results = await exportPosts(posts, { base });
for (const r of results) console.log(r.ok ? `✓ ${r.post} → ${r.files.length} slides (out/${r.post.replace(/^posts\//, '').replace(/\.ya?ml$/, '')}/)` : `✗ ${r.post}: ${r.error}`);
await closeBrowser();
server.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
