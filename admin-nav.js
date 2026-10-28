// Section navigation for the phone-sized BINGERET dashboard.
(() => {
  const button=document.querySelector('#admin-nav-toggle'),dialog=document.querySelector('#admin-nav-dialog');
  const phone=window.matchMedia('(max-width:767px)');
  const titles={content:'Videos, books & stories',notices:'Notice board',social:'Official social accounts',visitors:'Visitors record',blocked:'Blocked visitors'};
  function select(view,scroll=true){
    if(!titles[view])return;
    document.body.dataset.adminView=view;
    dialog.querySelectorAll('[data-admin-section]').forEach(link=>{
      if(link.dataset.adminSection===view)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    document.querySelector('#admin-current-section').textContent=titles[view];
    document.querySelector('#site-settings-heading').textContent=phone.matches&&['notices','social'].includes(view)?titles[view]:'Notices & social media';
    if(scroll)document.querySelector('#dashboard').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function close(){if(dialog.open)dialog.close();button.setAttribute('aria-expanded','false');}
  button.addEventListener('click',()=>{if(!phone.matches)return;dialog.showModal();button.setAttribute('aria-expanded','true');});
  document.querySelector('#admin-nav-close').addEventListener('click',close);
  dialog.addEventListener('close',()=>button.setAttribute('aria-expanded','false'));
  dialog.addEventListener('click',event=>{
    if(event.target===dialog){close();return;}
    const link=event.target.closest('[data-admin-section]');if(!link)return;
    event.preventDefault();select(link.dataset.adminSection);close();
  });
  document.querySelector('#admin-menu-signout').addEventListener('click',()=>{close();document.querySelector('#logout').click();});
  document.addEventListener('binge-admin-state',event=>{button.hidden=!event.detail.authenticated;if(!event.detail.authenticated)close();});
  phone.addEventListener('change',()=>{close();select(document.body.dataset.adminView||'content',false);});
  button.hidden=document.querySelector('#dashboard').hidden;
  select('content',false);
})();
