import p1 from './content/data-1.js';
import p2 from './content/data-2.js';
import p3 from './content/data-3.js';
import p4 from './content/data-4.js';
import p5 from './content/data-5.js';
import p6 from './content/data-6.js';
import p7 from './content/data-7.js';
import p8 from './content/data-8.js';

const encoded = [p1, p2, p3, p4, p5, p6, p7, p8].join('');

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function loadLearningContent() {
  if (!('DecompressionStream' in globalThis)) {
    throw new Error('このブラウザでは詳細解説データの展開に対応していません。');
  }
  const stream = new Blob([decodeBase64(encoded)])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  const text = await new Response(stream).text();
  return JSON.parse(text);
}
