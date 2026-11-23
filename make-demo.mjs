// Copies the built site (../thunderbolt/index.html) here as the GitHub Pages demo, with the live payment turned off.
import { readFileSync, writeFileSync } from 'node:fs';
const here = new URL('.', import.meta.url);
let h = readFileSync(new URL('../thunderbolt/index.html', here), 'utf8');
const STRIPE = 'https://buy.stripe.com/5kQ7sL3GLbas5mEeA5eIw01';
const must = (a, b) => { if (!h.includes(a)) throw new Error('missing: ' + a.slice(0, 80)); h = h.replace(a, b); };
h = h.replace(/\s*<!-- Démo : le paiement Stripe \([^)]*\) sera rebranché à la mise en ligne -->/, '');
must(`<a id="buy" href="${STRIPE}" target="_blank" rel="noopener">`, '<button id="buy" type="button" aria-describedby="buyNote">');
const s = h.indexOf('<button id="buy"'), e = h.indexOf('</a>', s);
h = h.slice(0, e) + '</button>' + h.slice(e + 4);
must('<p class="secure">Paiement sécurisé Stripe', '<p class="secure" id="buyNote" role="status">Paiement sécurisé Stripe');
const i = h.lastIndexOf('</body>');
h = h.slice(0, i) + `<script>document.getElementById('buy').addEventListener('click',function(){document.getElementById('buyNote').textContent='Version démo : le paiement sera activé à la mise en ligne du site.';});</script>\n` + h.slice(i);
if (h.includes('buy.stripe.com')) throw new Error('a payment link is left');
writeFileSync(new URL('index.html', here), h);
console.log('demo ready', Math.round(h.length / 1024), 'KB, no payment link');
