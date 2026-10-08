(async()=>{
  const parts=['./payload/code-00.txt', './payload/code-01.txt', './payload/code-02.txt', './payload/code-03.txt', './payload/code-04.txt', './payload/code-05.txt', './payload/code-06.txt', './payload/code-07.txt'];
  try{
    if(!('DecompressionStream' in window)) throw new Error('Seu navegador está desatualizado. Atualize o Chrome, Edge ou outro navegador moderno para abrir o curso.');
    const texts=await Promise.all(parts.map(async p=>{const r=await fetch(p);if(!r.ok)throw new Error(`Falha ao carregar ${p}: ${r.status}`);return (await r.text()).trim();}));
    const b64=texts.join(''); const bin=atob(b64); const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const source=await new Response(stream).text(); (0,eval)(source);
  }catch(err){console.error(err);const msg=String(err?.message||err);document.body.innerHTML=`<div style="max-width:760px;margin:60px auto;padding:24px;font:16px system-ui;background:#fff3cd;color:#4b3b00;border-radius:16px"><h2>Não foi possível iniciar o curso</h2><p>${msg}</p><p>Atualize a página. Na primeira abertura, mantenha conexão com a internet para que os arquivos sejam salvos no aparelho.</p></div>`;}
})();