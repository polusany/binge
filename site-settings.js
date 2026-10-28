// Admin editor for public announcements and official social profiles.
(() => {
  const form=document.querySelector('#site-settings-form');
  const platforms=[['telegram','Telegram'],['tiktok','TikTok'],['x','X'],['instagram','Instagram'],['youtube','YouTube'],['facebook','Facebook'],['whatsapp','WhatsApp']];
  const status=document.querySelector('#settings-status');
  document.querySelector('#social-fields').innerHTML=platforms.map(([id,label])=>`<label>${label}<input name="social_${id}" type="text" maxlength="500" placeholder="${id==='whatsapp'?'Phone number or https://wa.me/…':'@handle or full profile URL'}" autocomplete="off"></label>`).join('');
  async function request(path,options={}) {
    const response=await fetch(path,{cache:'no-store',...options,headers:{'X-Binge-Request':'1',...options.headers}});
    let value;try{value=await response.json();}catch{throw Error('Unable to read site settings. Please reload and try again.');}
    if(!response.ok)throw Error(value.error||'Could not save settings.');return value;
  }
  function preview(){
    const enabled=form.elements.notice_enabled.checked,message=form.elements.notice_message.value.trim();
    const notice=document.querySelector('#notice-preview');notice.hidden=!enabled||!message;
    document.querySelector('#notice-preview-title').textContent=form.elements.notice_title.value.trim()||'Notice';
    document.querySelector('#notice-preview-text').textContent=message;
    document.querySelector('#social-preview').textContent=platforms.filter(([id])=>form.elements['social_'+id].value.trim()).map(([,label])=>label).join(' · ')||'Add your official accounts below. Empty accounts stay hidden on the public site.';
  }
  async function load(){try{
    const value=await request('/api/site-settings');
    form.elements.notice_enabled.checked=value.notice.enabled;
    form.elements.notice_title.value=value.notice.title;
    form.elements.notice_message.value=value.notice.message;
    form.elements.social_heading.value=value.social_heading;
    for(const [id] of platforms)form.elements['social_'+id].value=value.socials[id]||'';
    preview();status.textContent='';
  }catch(error){status.textContent=error.message;}}
  form.addEventListener('input',preview);
  form.addEventListener('submit',async event=>{
    event.preventDefault();const button=document.querySelector('#save-site-settings');if(button.disabled)return;
    button.disabled=true;status.textContent='Publishing your updates…';
    try{
      const payload={notice:{enabled:form.elements.notice_enabled.checked,title:form.elements.notice_title.value,message:form.elements.notice_message.value},social_heading:form.elements.social_heading.value,socials:Object.fromEntries(platforms.map(([id])=>[id,form.elements['social_'+id].value]))};
      await request('/api/site-settings',{method:'POST',body:JSON.stringify(payload)});
      try{localStorage.setItem('binge-settings-updated',String(Date.now()));}catch{}
      status.textContent='Published. Your notice and social links are now visible on the website.';
    }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
  });
  document.addEventListener('binge-admin-ready',load);
  if(!document.querySelector('#dashboard').hidden)load();
  preview();
})();
