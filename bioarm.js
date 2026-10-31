/* Keep the section independently mountable in Tilda T123. */
(() => {
  const root = document.getElementById('fc-bio');
  if (!root) return;
  // Keep short Russian function words with the next word without changing the copy.
  const shortWord = /(^|[\s(«„])([авикосуя]|во|ко|об|со|на|не|ни|но|от|по|до|за|из|без|для|при)[ \t]+(?=\S)/giu;
  root.querySelectorAll('h1,h2,h3,p,li').forEach(element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      let value = node.nodeValue;
      for (let pass = 0; pass < 4; pass++) {
        const next = value.replace(shortWord, '$1$2\u00a0');
        if (next === value) break;
        value = next;
      }
      node.nodeValue = value;
    }
  });
  const disclosures = [];
  root.querySelectorAll('.bio-expandable').forEach(disclosure => {
    const button = disclosure.querySelector('.bio-more');
    const panel = disclosure.querySelector('.bio-expandable-text');
    if (!button || !panel || button.dataset.initialized) return;
    button.dataset.initialized = 'true';
    const subject = button.getAttribute('aria-label')?.replace(/^Подробнее(?: об |: )/i, '') || disclosure.closest('article')?.querySelector('h3')?.textContent || 'пояснение';
    let expanded = false;
    const renderButton = () => {
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', (expanded ? 'Свернуть: ' : 'Подробнее: ') + subject);
      button.querySelector('span').textContent = expanded ? 'Свернуть' : 'Подробнее';
    };
    const measure = () => {
      const previousTransition = panel.style.transition;
      panel.style.transition = 'none';
      disclosure.classList.add('is-ready');
      disclosure.classList.remove('is-expanded');
      const style = getComputedStyle(panel);
      const previewHeight = parseFloat(style.maxHeight);
      const lineHeight = parseFloat(style.lineHeight);
      const wordCount = panel.textContent.trim().split(/\s+/u).length;
      // A disclosure must save at least two full lines in a genuinely long explanation.
      const needed = wordCount >= 30 && Number.isFinite(previewHeight) &&
        panel.scrollHeight - previewHeight >= lineHeight * 2 - 1;
      disclosure.classList.toggle('is-ready', needed);
      if (!needed) expanded = false;
      disclosure.classList.toggle('is-expanded', needed && expanded);
      button.hidden = !needed;
      renderButton();
      if (!needed && document.activeElement === button) {
        panel.tabIndex = -1;
        panel.focus({preventScroll: true});
      }
      void panel.offsetHeight;
      panel.style.transition = previousTransition;
    };
    button.addEventListener('click', () => {
      expanded = !expanded;
      renderButton();
      disclosure.classList.toggle('is-expanded', expanded);
    });
    let width = -1, pending = 0;
    new ResizeObserver(entries => {
      const nextWidth = entries[0].contentRect.width;
      if (Math.abs(nextWidth - width) < .5) return;
      width = nextWidth;
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(measure);
    }).observe(disclosure);
    disclosures.push(measure);
  });
  document.fonts.ready.then(() => disclosures.forEach(measure => measure()));
  root.querySelectorAll('.bio-button').forEach(button => {
    button.addEventListener('pointerdown', () => button.dataset.pressed = 'true');
    ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(event => {
      button.addEventListener(event, () => delete button.dataset.pressed);
    });
  });
})();

(() => {
  const root=document.getElementById('fc-bio');
  const section=root?.querySelector('.bio-mechanism');
  const canvas=section?.querySelector('.bio-membrane-canvas');
  const video=section?.querySelector('.bio-membrane-video');
  const media=section?.querySelector('.bio-mechanism-media');
  const stage=section?.querySelector('.bio-mechanism-stage');
  if(!canvas||!video||canvas.dataset.initialized)return;
  canvas.dataset.initialized='true';
  const desktop=matchMedia('(min-width: 701px)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const connection=navigator.connection;
  let visible=false,model=null,loading=false,failed=false,videoFailed=false,attempting=false;
  let frame=0,lastFrame=0,elapsed=0;
  const allowed=()=>desktop.matches&&fine.matches&&!reduced.matches&&!connection?.saveData;
  const wanted=()=>visible&&!document.hidden&&allowed();
  const pause=()=>{
    cancelAnimationFrame(frame);frame=0;lastFrame=0;
    model?.clearPointer(true);video.pause();
    section.classList.remove('is-bubble-hover');
    canvas.dataset.state='paused';
  };
  const fallback=()=>{
    if(!wanted()||videoFailed)return;
    if(!video.getAttribute('src')){video.muted=true;video.src=video.dataset.src;video.load();}
    if(attempting||!video.paused)return;
    attempting=true;
    video.play()?.then(()=>{if(wanted())video.classList.add('is-playing');else video.pause();})
      .catch(()=>video.classList.remove('is-playing')).finally(()=>{attempting=false;});
    canvas.dataset.state='video-fallback';
  };
  const fail=()=>{
    pause();failed=true;loading=false;
    canvas.classList.remove('is-live');
    model?.dispose();model=null;delete canvas.__membrane;
    if(wanted())fallback();
  };
  const tick=now=>{
    frame=0;
    if(!wanted()||!model){sync();return;}
    // Use each display frame and advance time once, without a 30 fps gate.
    const delta=lastFrame?(now-lastFrame)/1000:0;
    lastFrame=now;
    elapsed+=delta;
    try{model.renderAt(elapsed);canvas.dataset.state='active';}catch{fail();return;}
    frame=requestAnimationFrame(tick);
  };
  const resize=()=>{
    if(!model)return;
    const box=media.getBoundingClientRect();
    // Render a sharp, native WebGL image; cap the backing buffer for bounded GPU use.
    const ratio=Math.min(devicePixelRatio||1,1.25,1920/Math.max(box.width,1));
    model.resize(Math.round(box.width),Math.round(box.height),ratio);
  };
  const load=async()=>{
    if(loading||failed||model)return;
    loading=true;canvas.dataset.state='loading';
    try{
      const source=new URL(canvas.dataset.sceneSrc,document.baseURI).href;
      const {createMembraneScene}=await import(source);
      if(!wanted()){loading=false;canvas.dataset.state='paused';return;}
      const box=media.getBoundingClientRect();
      const ratio=Math.min(devicePixelRatio||1,1.25,1920/Math.max(box.width,1));
      model=createMembraneScene({canvas,width:Math.round(box.width),height:Math.round(box.height),pixelRatio:ratio,interactive:true});
      canvas.__membrane=model;
      model.renderAt(elapsed);loading=false;
      canvas.classList.add('is-live');video.pause();video.classList.remove('is-playing');
      sync();
    }catch{fail();}
  };
  const sync=()=>{
    if(!wanted()){
      pause();
      if(!allowed()){
        canvas.classList.remove('is-live');video.classList.remove('is-playing');
        model?.dispose();model=null;delete canvas.__membrane;
      }
      return;
    }
    if(failed){fallback();return;}
    if(model){video.pause();canvas.classList.add('is-live');if(!frame)frame=requestAnimationFrame(tick);}
    else load();
  };
  const pointFromEvent=event=>{
    const box=media.getBoundingClientRect();
    const x=(event.clientX-box.left)/box.width,y=(event.clientY-box.top)/box.height;
    return x>=0&&x<=1&&y>=0&&y<=1?{x:x*2-1,y:1-y*2}:null;
  };
  section.addEventListener('pointermove',event=>{
    if(!model||!wanted()||!fine.matches||event.pointerType==='touch')return;
    const point=pointFromEvent(event);
    if(!point||event.target.closest('a,button,summary')){model.clearPointer();section.classList.remove('is-bubble-hover');return;}
    const overCopy=event.target.closest('.bio-mechanism-header,.bio-mechanism-callout');
    if(overCopy)model.clearPointer();else model.setPointer(point.x,point.y,true);
    section.classList.toggle('is-bubble-hover',model.hitBubble(point.x,point.y));
  },{passive:true});
  section.addEventListener('pointerleave',()=>{model?.clearPointer();section.classList.remove('is-bubble-hover');});
  section.addEventListener('click',event=>{
    if(!model||!wanted()||!fine.matches||event.target.closest('a,button,summary'))return;
    const point=pointFromEvent(event);
    if(point)model.popBubble(point.x,point.y);
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(model)fail();});
  video.addEventListener('error',()=>{videoFailed=true;video.classList.remove('is-playing');});
  new ResizeObserver(resize).observe(media);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(section);
  desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);
  fine.addEventListener('change',sync);
  connection?.addEventListener?.('change',sync);
  document.addEventListener('visibilitychange',sync);
})();

/* Decorative video: only download and play while its section is visible. */
(() => {
  const video = document.querySelector('#fc-bio .bio-final-background');
  if (!video || video.tagName !== 'VIDEO' || video.dataset.initialized) return;
  video.dataset.initialized = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let visible = false;
  let pending = false;
  let failed = false;
  const wanted = () => visible && !document.hidden && !reduced.matches && !connection?.saveData;
  const sync = () => {
    if (!wanted() || failed) { video.pause(); return; }
    if (!video.getAttribute('src')) {
      video.muted = true;
      video.src = video.dataset.src;
      video.load();
    }
    if (pending || !video.paused) return;
    pending = true;
    video.play().then(() => { if (!wanted()) video.pause(); })
      .catch(() => { /* The video poster remains visible if autoplay is blocked. */ })
      .finally(() => { pending = false; });
  };
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); })
    .observe(video.closest('.bio-final'));
  video.addEventListener('error', () => {
    failed = true;
    video.pause();
    video.removeAttribute('src');
    video.load();
  });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  connection?.addEventListener?.('change', sync);
})();
