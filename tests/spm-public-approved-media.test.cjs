'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const base = path.resolve(__dirname,'../public-web');
const media = {
  'assets/site/app-movil.webp':'179b9d4cc68be8',
  'assets/site/hero-comprende.webp':'0d81baac0f1ace',
  'assets/site/institucional.webp':'c44b5d3a301922',
  'assets/site/ruta-28-dias.webp':'dea508596d4a25',
  'assets/site/silencio.webp':'20c244a3dc6937',
  'assets/site/videos/SPM_Web_Cinematic_V2_editado.mp4':'e6ac4e901ef2f7c39b788b5da814c08693a841149058e7ffe70f063bb877d799'
};

test('All six owner-approved media assets are included in the public-web publish directory',()=>{
  const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
  for(const [relative,expectedHash] of Object.entries(media)){
    assert(html.includes(relative), 'Missing HTML reference: '+relative);
    const filename=path.join(base,relative);
    assert(fs.existsSync(filename),'Missing approved binary asset: '+relative);
    const buf=fs.readFileSync(filename);
    const actual=crypto.createHash('sha256').update(buf).digest('hex');
    assert(actual.startsWith(expectedHash),'Unexpected replacement for approved asset: '+relative);
    if(relative.endsWith('.webp')){
      assert.equal(buf.toString('ascii',0,4),'RIFF','Invalid WebP header: '+relative);
      assert.equal(buf.toString('ascii',8,12),'WEBP','Invalid WebP signature: '+relative);
    }
  }
  assert.doesNotMatch(html,/_jwt=|caption_7023f4273bde4bdbb0e1a6d7826b298a\.mp4/);
});

test('Approved SPM institutional MP4 is the FINAL narrated cut, not its silent predecessor',()=>{
  const file=path.join(base,'assets/site/videos/SPM_Web_Cinematic_V2_editado.mp4');
  assert(fs.existsSync(file),'Final narrated MP4 has not been uploaded');
  const buf=fs.readFileSync(file);
  assert.equal(buf.toString('ascii',4,8),'ftyp');
  assert(buf.includes(Buffer.from('vide')),'Missing video stream metadata');
  assert(buf.includes(Buffer.from('soun')),'Missing sound stream metadata');
  assert(buf.includes(Buffer.from('mp4a')),'Missing AAC stream metadata');
  assert.equal(buf.length,4992756,'Wrong cut/length: use narrated 25.5s final');
});
