// Pause the decorative motion while the hero is outside the viewport or tab hidden.
(() => {
  const hero = document.querySelector('.fc-method-hero');
  if (!hero) return;
  let visible = true;
  const sync = () => hero.classList.toggle('is-paused', !visible || document.hidden);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }).observe(hero);
  }
  sync();
})();

;
(() => {
  const section = document.querySelector('.fc-method-intro');
  if (!section) return;
  let visible = false;
  const sync = () => section.classList.toggle('is-intro-paused', !visible || document.hidden);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) section.classList.add('is-intro-visible');
      sync();
    }, {threshold: 0}).observe(section);
  } else {
    visible = true;
    section.classList.add('is-intro-visible');
  }
  sync();
})();

;
(() => {
  const section = document.querySelector('.fc-bio-diagnosis');
  if (!section) return;
  let visible = false;
  const sync = () => section.classList.toggle('is-diagnosis-paused', !visible || document.hidden);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) section.classList.add('is-diagnosis-visible');
      sync();
    }).observe(section);
  } else {
    visible = true;
    section.classList.add('is-diagnosis-visible');
  }
  sync();
})();

;
(() => {
  const section = document.querySelector('.fc-bio-work');
  if (!section) return;
  let visible = false;
  const sync = () => section.classList.toggle('is-work-paused', !visible || document.hidden);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) section.classList.add('is-work-visible');
      sync();
    }).observe(section);
  } else {
    visible = true;
    section.classList.add('is-work-visible');
  }
  sync();
})();

;
(() => {
  const section = document.querySelector('.fc-bio-prevention');
  if (!section) return;
  let visible = false;
  const sync = () => section.classList.toggle('is-prevention-paused', !visible || document.hidden);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) section.classList.add('is-prevention-visible');
      sync();
    }).observe(section);
  } else {
    visible = true;
    section.classList.add('is-prevention-visible');
  }
  sync();
})();

;
(() => {
  const section = document.querySelector('.fc-bio-image');
  if (!section) return;
  let visible = false;
  const sync = () => section.classList.toggle('is-image-paused', !visible || document.hidden);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) section.classList.add('is-image-visible');
      sync();
    }).observe(section);
  } else {
    visible = true;
    section.classList.add('is-image-visible');
  }
  sync();
})();

;
(() => {
  const section = document.querySelector('.fc-final');
  if (!section) return;
  let visible = false;
  const sync = () => section.classList.toggle('is-final-paused', !visible || document.hidden);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) section.classList.add('is-final-visible');
      sync();
    }).observe(section);
  } else {
    visible = true;
    section.classList.add('is-final-visible');
  }
  sync();
})();

;
(()=>{const root=document.querySelector('#fc-method');if(!root||root.dataset.motionReady)return;root.dataset.motionReady='true';const nodes=root.querySelectorAll('h1,h2,h3,.fc-label,.fc-method-lead,.fc-method-grid__copy,.fc-method-grid__note,.fc-method-list li,.fc-method-link,.fc-method-button');nodes.forEach((node,index)=>{if(node.closest('.fc-method-hero,.fc-method-intro,.fc-bio-essence,.fc-bio-work,.fc-bio-diagnosis,.fc-bio-prevention,.fc-bio-image,.fc-final'))return;node.classList.add('fc-reveal');node.style.setProperty('--fc-delay',String(index%4*70)+'ms')});if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){nodes.forEach(node=>node.classList.add('is-visible'));return}const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});nodes.forEach(node=>observer.observe(node))})();
;
// Russian typography: short words travel with the next word, never end a line alone.
(() => {
  const root=document.querySelector('#fc-method');
  if(!root)return;
  const shortWords='а|в|во|и|к|ко|о|об|обо|с|со|у|я|не|ни|на|по|из|за|от|до|для|без|при|над|под|про|но|или|да|же|бы|ли|то';
  const bind=new RegExp('(^|[\\s(«„])('+shortWords+')[ \\u00a0]+(?=\\S)','giu');
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode;
    if(node.parentElement.closest('script,style,svg'))continue;
    let value=node.nodeValue.replace(/[—–]/g,'-').replace(/\*/g,'');
    for(let pass=0;pass<3;pass++)value=value.replace(bind,'$1$2\u00a0');
    value=value.replace(/\s+-\s+/g,'\u00a0-\u00a0');
    node.nodeValue=value;
  }
  root.dataset.typographyReady='true';
})();
