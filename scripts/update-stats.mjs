import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const username = 'Sukeerth-v9474';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': username + '-profile' };
// Optional repository-scoped Actions token; never printed or written.
if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
async function api(endpoint) {
  const response = await fetch('https://api.github.com' + endpoint, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('GitHub API ' + response.status + ' for public endpoint ' + endpoint);
  return response.json();
}
const profile = await api('/users/' + username);
const repositories = [];
for (let page = 1; ; page++) {
  const batch = await api('/users/' + username + '/repos?type=owner&per_page=100&page=' + page);
  if (!Array.isArray(batch)) throw new Error('Unexpected public repository response');
  // Only explicitly public repositories belonging to this user can enter the output.
  repositories.push(...batch.filter(repo => repo.private === false && repo.owner?.login.toLowerCase() === username.toLowerCase()));
  if (batch.length < 100) break;
}
const counts = new Map();
const languageRepos = repositories.filter(repo => repo.name.toLowerCase() !== username.toLowerCase());
// Read language metadata only: no source, commit contents, or private account inventory.
for (let start = 0; start < languageRepos.length; start += 4) {
  const batch = languageRepos.slice(start, start + 4);
  const results = await Promise.all(batch.map(repo => api('/repos/' + username + '/' + encodeURIComponent(repo.name) + '/languages')));
  for (const result of results) for (const [language, bytes] of Object.entries(result)) {
    if (typeof bytes === 'number' && bytes > 0) counts.set(language, (counts.get(language) || 0) + 1);
  }
}
const languages = [...counts].map(([name, repositories]) => ({ name, repositories })).sort((a,b) => b.repositories-a.repositories || a.name.localeCompare(b.name));
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }).format(new Date());
const snapshot = { username, scope: 'Public repositories only; includes forks. Profile repository excluded from language counts.', publicRepositories: repositories.length, memberSince: profile.created_at.slice(0,4), languages, updated: date };
const esc = value => String(value).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const palette = ['#8db8a1','#dab07b','#82aecd','#c5a0c1','#b4bd81','#b6afb1'];
const shown = languages.slice(0,6), max = Math.max(1,...shown.map(x=>x.repositories));
const height = 210 + shown.length * 37;
const rows = shown.map((language,i)=>{
  const y=191+i*37;
  return '<text x="34" y="' + (y+5) + '" fill="#cbd7da" font-size="14">' + esc(language.name) + '</text><rect x="226" y="' + (y-7) + '" width="480" height="11" rx="5.5" fill="#223641"/><rect x="226" y="' + (y-7) + '" width="' + (480*language.repositories/max).toFixed(1) + '" height="11" rx="5.5" fill="' + palette[i] + '"/><text x="810" y="' + (y+5) + '" fill="#b7c8cd" font-size="12" text-anchor="end">' + language.repositories + (language.repositories===1?' repo':' repos') + '</text>';
}).join('');
const metrics = [[snapshot.publicRepositories,'PUBLIC REPOSITORIES',34],[languages.length,'LANGUAGES REPRESENTED',310],[snapshot.memberSince,'ON GITHUB SINCE',590]].map(([value,label,x])=>'<text x="' + x + '" y="82" fill="#eef5f3" font-size="34" font-weight="600">' + value + '</text><text x="' + x + '" y="106" fill="#9bb2b8" font-size="9" letter-spacing="1.2">' + label + '</text>').join('');
const description = snapshot.publicRepositories + ' public repositories; ' + languages.length + ' languages; member since ' + snapshot.memberSince + '. Includes forks and excludes private code. ' + languages.map(x=>x.name + ': ' + x.repositories + ' repositories').join('; ');
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="850" height="' + height + '" viewBox="0 0 850 ' + height + '" role="img" aria-labelledby="title desc"><title id="title">Public GitHub snapshot for ' + username + '</title><desc id="desc">' + esc(description) + '</desc><rect x="1" y="1" width="848" height="' + (height-2) + '" rx="13" fill="#111f2a" stroke="#304951"/><g font-family="-apple-system,BlinkMacSystemFont,\'Segoe UI\',Arial,sans-serif"><text x="34" y="32" fill="#b3c7ca" font-size="10" letter-spacing="1.7">PUBLIC GITHUB SNAPSHOT</text><text x="810" y="32" fill="#91a8af" font-size="10" text-anchor="end">Updated ' + esc(date) + '</text>' + metrics + '<path d="M34 128h776" stroke="#304951"/><text x="34" y="157" fill="#adbec3" font-size="11">Public repositories containing each language · includes forks</text>' + rows + '<text x="34" y="' + (height-16) + '" fill="#91a8af" font-size="10">Private research code excluded · language presence, not proficiency</text></g></svg>';
await mkdir(path.join(root,'assets'), { recursive: true });
// Preserve the last good card when any API read fails.
await writeFile(path.join(root,'assets/github-snapshot.svg'),svg+'\n');
await writeFile(path.join(root,'assets/public-github-snapshot.json'),JSON.stringify(snapshot,null,2)+'\n');
console.log('Updated public snapshot: ' + repositories.length + ' repositories; ' + languages.length + ' languages. No private repository data used.');
