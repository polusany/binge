// Shared public announcement and social section. All copy is rendered as text.
(() => {
  const icons={telegram:'➤',tiktok:'♪',x:'𝕏',instagram:'◎',youtube:'▶',facebook:'f',whatsapp:'◉'};
  const labels={telegram:'Telegram',tiktok:'TikTok',x:'X',instagram:'Instagram',youtube:'YouTube',facebook:'Facebook',whatsapp:'WhatsApp'};
  const main=document.querySelector('main');if(!main)return;
  const notice=document.createElement('aside');notice.className='public-notice';notice.hidden=true;notice.setAttribute('aria-label','Notice from Binge');
  notice.innerHTML='<div class="notice-symbol" aria-hidden="true">i</div><div><p class="notice-eyebrow">NOTICE BOARD</p><h2></h2><p class="notice-message"></p></div>';
  main.before(notice);
  const social=document.createElement('section');social.className='public-social';social.hidden=true;
  social.innerHTML='<div class="social-section-heading"><p class="notice-eyebrow">STAY CONNECTED</p><h2></h2><p>New episodes, fresh stories and updates from Binge.</p></div><div class="social-card-grid"></div>';
  const footer=document.querySelector('#site-footer')||document.querySelector('footer');if(footer)footer.before(social);else main.after(social);
  let loading=false;
  async function refresh(){
    if(loading)return;loading=true;
    try{
      const response=await fetch('/api/site-settings',{cache:'no-store'});if(!response.ok)throw Error();const value=await response.json();
      notice.hidden=!value.notice.enabled||!value.notice.message;
      notice.querySelector('h2').textContent=value.notice.title||'Notice';notice.querySelector('.notice-message').textContent=value.notice.message;
      social.querySelector('h2').textContent=value.social_heading||'Find us on social media';
      const grid=social.querySelector('.social-card-grid');grid.replaceChildren();
      for(const [id,url] of Object.entries(value.socials)){
        if(!labels[id])continue;
        const address=new URL(url);if(address.protocol!=='https:')continue;
        const card=document.createElement('a');card.className='social-card';card.href=address.href;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label','Follow Binge on '+labels[id]);
        const badge=document.createElement('span');badge.className='social-icon';badge.textContent=icons[id];badge.setAttribute('aria-hidden','true');
        const text=document.createElement('span');text.className='social-card-text';
        const name=document.createElement('strong');name.textContent=labels[id];
        const caption=document.createElement('small');caption.textContent=id==='whatsapp'?'Get in touch':'Follow our official account';text.append(name,caption);
        const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');card.append(badge,text,arrow);grid.append(card);
      }
      social.hidden=!grid.children.length;
    }catch{ /* Preserve the last published display if the connection drops. */ }
    finally{loading=false;}
  }
  refresh();window.addEventListener('focus',refresh);window.addEventListener('storage',event=>{if(event.key==='binge-settings-updated')refresh();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(()=>{if(!document.hidden)refresh();},30000);
})();
