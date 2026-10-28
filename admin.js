const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let visitorRecords = [], selectedVisitorRecord = null, visitorDeleteBusy = false;
let items = [], current = null, previewURL = '', episodeRows = [], busy = false, cachedPoster = '', seriesTemplate = null;
function syncSeries(){
  const f=$('#edit-form'), active=f.elements.kind.value==='video'&&f.elements.format.value==='Series', batch=active&&!current;
  $('#series-fields').hidden=!active;$('#series-help').hidden=!active;$('#episode-batch').hidden=!batch;
  $('#single-episode-label').hidden=batch;$('#single-file-label').hidden=batch;$('#file').disabled=batch;
  f.elements.season.disabled=!active;f.elements.season.required=active;
  f.elements.episode.disabled=!active||batch;f.elements.episode.required=active&&!batch;
  for(const input of $('#episode-batch').querySelectorAll('input'))input.disabled=!batch||!!input.closest('[data-saved]');
  if(batch&&!episodeRows.length)buildEpisodes();updateEpisodeSummary();
}
function buildEpisodes(replaceWithoutPrompt=false){
  if(busy)return;
  const count=Number($('#episode-count').value),start=Number($('#episode-start').value);
  if(!Number.isInteger(count)||count<1||count>9999||!Number.isInteger(start)||start<1||start+count-1>9999){$('#edit-status').textContent='Choose 1–9,999 episodes and valid episode numbers (1–9999).';return;}
  if(episodeRows.some(row=>row.saved)){ $('#edit-status').textContent='Some episodes are already published. Retry the remaining uploads, or close and add another batch.';return; }
  if(count<episodeRows.length&&episodeRows.slice(count).some(row=>row.file)&&!confirm('Remove the extra selected episode videos from this batch?')){$('#episode-count').value=episodeRows.length;return;}
  const previous=episodeRows;episodeRows=[];$('#episode-rows').replaceChildren();
  for(let i=0;i<count;i++){
    let row=previous[i];
    if(!row){
      const element=document.createElement('div');element.className='episode-upload-row';
      element.innerHTML=`<label>Episode number<input class="episode-number" type="number" min="1" max="9999" value="${start+i}" required></label><label>Episode video<input class="episode-video" type="file" accept=".mp4,.webm,.ogg" required></label><span class="episode-result" role="status"></span>`;
      row={element,number:start+i,file:null,saved:null,uploaded:null};
      element.querySelector('.episode-video').onchange=e=>{row.file=e.target.files[0]||null;row.uploaded=null;e.target.required=!row.file;element.querySelector('.episode-result').textContent=row.file?row.file.name:'';updateEpisodeSummary();};
      element.querySelector('.episode-number').oninput=e=>{row.number=Number(e.target.value);};
    }
    row.number=start+i;row.element.querySelector('.episode-number').value=row.number;
    episodeRows.push(row);$('#episode-rows').append(row.element);
  }
  $('#edit-status').textContent=`Choose ${count} episode video${count===1?'':'s'} below.`;updateEpisodeSummary();
}
$('#build-episodes').onclick=()=>buildEpisodes();
$('#episode-count').onchange=()=>buildEpisodes();
$('#episode-start').onchange=()=>buildEpisodes();

function updateEpisodeSummary(){
 const chosen=episodeRows.filter(row=>row.file||row.saved).length;
 $('#episode-selection-summary').textContent=`${chosen} video${chosen===1?'':'s'} selected for ${episodeRows.length} episode${episodeRows.length===1?'':'s'}.`;
 $('#save').textContent=$('#episode-batch').hidden?(current?'Save changes':'Save & publish'):`Publish ${episodeRows.length} episode${episodeRows.length===1?'':'s'}`;
}
$('#bulk-episodes').onchange=()=>{
 if(busy)return;
 if(episodeRows.some(row=>row.saved)){ $('#edit-status').textContent='Retry the remaining uploads before adding another batch.';return; }
 const files=Array.from($('#bulk-episodes').files).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
 if(!files.length)return;
 const start=Number($('#episode-start').value);
 if(files.length>9999||!Number.isInteger(start)||start<1||start+files.length-1>9999){$('#edit-status').textContent='Choose a valid starting episode and at most 9,999 videos.';return;}
 if(files.some(file=>!file.size||file.size>1024*1024*1024||!/\.(mp4|webm|ogg)$/i.test(file.name))){$('#edit-status').textContent='Each episode must be an MP4, WebM or OGG video between 1 byte and 1 GB.';return;}
 $('#episode-count').value=files.length;buildEpisodes(true);
 episodeRows.forEach((row,i)=>{row.file=files[i];row.element.querySelector('.episode-video').required=false;row.element.querySelector('.episode-result').textContent=files[i].name;});
 updateEpisodeSummary();
};
function addEpisodes(item){
 edit(null);seriesTemplate=item;
 const form=$('#edit-form');
 for(const key of ['kind','title','description','genre','year','author','format','section','season'])form.elements.namedItem(key).value=item[key]??'';
 const existing=items.filter(x=>x.kind==='video'&&x.format==='Series'&&x.title===item.title&&Number(x.season)===Number(item.season));
 $('#episode-start').value=Math.max(0,...existing.map(x=>Number(x.episode)||0))+1;
 episodeRows=[];$('#episode-rows').replaceChildren();syncSeries();
 showPoster(item.poster_file?'/media/'+encodeURIComponent(item.poster_file):'');
 $('#remove-poster-wrap').hidden=!item.poster_file;
 $('#editor-title').textContent='Add episodes to '+item.title;
 updateEpisodeSummary();
}

$('#editor').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
function showPoster(url){$('#poster-preview').src=url;$('#poster-preview').hidden=!url;}
$('#edit-form').elements.format.onchange=syncSeries;
$('#edit-form').elements.kind.onchange=syncSeries;
$('#poster-file').onchange=()=>{cachedPoster='';if(previewURL)URL.revokeObjectURL(previewURL);const file=$('#poster-file').files[0];previewURL=file?URL.createObjectURL(file):'';showPoster(previewURL|| (current?.poster_file&&!$('#remove-poster').checked?'/media/'+encodeURIComponent(current.poster_file):''));};
$('#remove-poster').onchange=()=>{if(!$('#poster-file').files.length)showPoster($('#remove-poster').checked?'':current?.poster_file?'/media/'+encodeURIComponent(current.poster_file):'');};
async function api(path,options={}) {
  const response=await fetch(path,{cache:'no-store',...options,headers:{'X-Binge-Request':'1',...options.headers}});
  const raw=await response.text();
  if(!raw.trim())throw Error('The server returned an empty response. Restart the Binge server from the correct folder, then reload this page.');
  let value;try{value=JSON.parse(raw);}catch{throw Error('The server returned an invalid response. Restart Binge using python server.py, then reload this page.');}
  if(!response.ok)throw Error(value.error||`Request failed (${response.status})`);return value;
}
function notifyCatalog(){try{localStorage.setItem('binge-content-updated',String(Date.now()));}catch{ /* Focus and polling still refresh other tabs. */ }}
function error(e){$('#status').textContent=e.message;}
function renderManagedItems(){
 const query=$('#manage-query').value.trim().toLowerCase(),kind=$('#manage-kind').value;
 const visible=items.filter(x=>(kind==='all'||x.kind===kind)&&`${x.title} ${x.author||''} ${x.genre} ${x.season?'season '+x.season:''} ${x.episode?'episode '+x.episode:''}`.toLowerCase().includes(query));
 $('#manage-count').textContent=`${visible.length} of ${items.length} published uploads`;
 $('#items').innerHTML=visible.length?visible.map(x=>`<div class="item-row"><div class="managed-title">${x.poster_file?`<img class="managed-thumb" alt="" src="/media/${encodeURIComponent(x.poster_file)}" loading="lazy">`:''}<div><strong>${esc(x.title)}</strong><small>${esc(x.kind)} · ${esc(x.genre)} · ${esc(x.year)}${x.format==='Series'&&x.season?` · Season ${esc(x.season)}, Episode ${esc(x.episode)}`:''}</small></div></div><div class="actions"><a class="manage-preview" href="/media/${encodeURIComponent(x.file)}" target="_blank" rel="noopener">Preview ↗</a><button data-edit="${esc(x.id)}">Edit details</button>${x.kind==='video'&&x.format==='Series'?`<button data-add-episodes="${esc(x.id)}">Add episodes</button>`:''}<button data-delete="${esc(x.id)}">Delete</button></div></div>`).join(''):items.length?'<p>No matching uploads. Try another search or content type.</p>':'<p>No uploads in this project yet. Publish a video, book or story to manage it here.</p>';
}
$('#manage-query').oninput=renderManagedItems;
$('#manage-kind').onchange=renderManagedItems;

async function load(){
  items=await api('/api/content'); const visits=await api('/api/visits');visitorRecords=visits;
  $('#stats').innerHTML=[['Videos',items.filter(x=>x.kind==='video').length],['Books & stories',items.filter(x=>x.kind!=='video').length],['Visitors record',visits.length]].map(([label,n])=>`<div class="stat"><strong>${n}</strong>${label}</div>`).join('');
  renderManagedItems();await loadBlockedVisitors();
  $('#visits').innerHTML=visits.length?visits.map(x=>`<tr><td>${esc(x.ip)}</td><td>${esc(x.path)}</td><td>${esc(x.seen)}</td><td><button data-visit="${x.id}">Delete</button></td></tr>`).join(''):'<tr><td colspan="4">No visitors recorded yet.</td></tr>';
}
async function boot(){try{const session=await api('/api/session');$('#status').textContent='';$('#login').hidden=session.authenticated;$('#dashboard').hidden=!session.authenticated;document.dispatchEvent(new CustomEvent('binge-admin-state',{detail:{authenticated:session.authenticated}}));if(session.authenticated){await load();document.dispatchEvent(new Event('binge-admin-ready'));}}catch(e){error(e);}}
$('#login').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');if(button.disabled)return;button.disabled=true;try{await api('/api/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});e.target.password.value='';$('#status').textContent='';await boot();}catch(e){error(e);}finally{button.disabled=false;}};
$('#logout').onclick=async()=>{try{await api('/api/logout',{method:'POST'});await boot();}catch(e){error(e);}};
function edit(item){seriesTemplate=null;current=item;episodeRows=[];cachedPoster='';$('#episode-rows').replaceChildren();$('#edit-form').reset();if(item)for(const [key,value]of Object.entries(item)){const field=$('#edit-form').elements.namedItem(key);if(field && key!=='file')field.value=value;}$('#editor-title').textContent=item?'Edit '+item.title:'Add content';$('#current-upload').hidden=!item;$('#current-upload').innerHTML=item?`<strong>Current upload</strong><p>${esc(item.title)}${item.season?` · Season ${esc(item.season)}, Episode ${esc(item.episode)}`:''}</p><a href="/media/${encodeURIComponent(item.file)}" target="_blank" rel="noopener">Preview current file ↗</a><p>You can save details without choosing a new file. Only choose a file below when replacing this upload.</p>`:'';$('#edit-status').textContent=item?'Current file: '+item.file:'';syncSeries(); showPoster(item?.poster_file ? '/media/'+encodeURIComponent(item.poster_file) : '');$('#remove-poster-wrap').hidden=!item?.poster_file;$('#remove-poster').checked=false;updateEpisodeSummary();$('#editor').showModal();}
$('#new').onclick=()=>edit(null);
$('#new-series').onclick=()=>{edit(null);$('#edit-form').elements.kind.value='video';$('#edit-form').elements.format.value='Series';syncSeries();$('#editor-title').textContent='Upload series episodes';};$('#close').onclick=()=>{if(!busy)$('#editor').close();};
$('#items').onclick=async e=>{const b=e.target.closest('button');if(!b)return;try{if(b.dataset.edit)edit(items.find(x=>x.id===b.dataset.edit));if(b.dataset.addEpisodes)addEpisodes(items.find(x=>x.id===b.dataset.addEpisodes));if(b.dataset.delete&&confirm('Delete this title and its uploaded file?')){await api('/api/content/'+b.dataset.delete,{method:'DELETE'});notifyCatalog();await load();}}catch(e){error(e);}};
$('#visits').onclick=event=>{
 const button=event.target.closest('[data-visit]');if(!button)return;
 selectedVisitorRecord=visitorRecords.find(record=>String(record.id)===button.dataset.visit);if(!selectedVisitorRecord)return;
 $('#visitor-delete-description').textContent=`IP address: ${selectedVisitorRecord.ip} · Page: ${selectedVisitorRecord.path}`;
 $('#visitor-delete-status').textContent='';$('#visitor-delete-title').textContent='Choose a visitor action';$('#visitor-action-choices').hidden=false;$('#visitor-block-confirmation').hidden=true;$('#visitor-delete-dialog').showModal();$('#cancel-visitor-delete').focus();
};
function closeVisitorDelete(){if(visitorDeleteBusy)return;$('#visitor-delete-dialog').close();selectedVisitorRecord=null;}
$('#cancel-visitor-delete').onclick=closeVisitorDelete;
$('#visitor-delete-dialog').addEventListener('cancel',event=>{if(visitorDeleteBusy)event.preventDefault();else selectedVisitorRecord=null;});
async function deleteVisitorChoice(allRecords){
 if(visitorDeleteBusy||!selectedVisitorRecord)return;
 visitorDeleteBusy=true;
 const buttons=['#delete-visitor','#delete-visit-record','#cancel-visitor-delete','#block-visitor'];buttons.forEach(selector=>$(selector).disabled=true);
 $('#visitor-delete-status').textContent='Deleting…';
 try{
  const result=await api((allRecords?'/api/visitors/':'/api/visits/')+selectedVisitorRecord.id,{method:'DELETE'});
  $('#visitor-delete-dialog').close();selectedVisitorRecord=null;
  $('#status').textContent=allRecords?`Visitor removed: ${result.deleted} record${result.deleted===1?'':'s'} deleted.`:'The selected visitor record was deleted.';
  await load().catch(error);
 }catch(error){$('#visitor-delete-status').textContent=error.message;}
 finally{visitorDeleteBusy=false;buttons.forEach(selector=>$(selector).disabled=false);}
}
$('#delete-visitor').onclick=()=>deleteVisitorChoice(true);
$('#delete-visit-record').onclick=()=>deleteVisitorChoice(false);
$('#block-visitor').onclick=()=>{
 if(visitorDeleteBusy||!selectedVisitorRecord)return;
 $('#visitor-delete-title').textContent='Block this visitor?';$('#visitor-action-choices').hidden=true;$('#visitor-block-confirmation').hidden=false;$('#cancel-block-visitor').focus();
};
$('#cancel-block-visitor').onclick=closeVisitorDelete;
$('#confirm-block-visitor').onclick=async()=>{
 if(visitorDeleteBusy||!selectedVisitorRecord)return;
 visitorDeleteBusy=true;$('#confirm-block-visitor').disabled=true;$('#cancel-block-visitor').disabled=true;$('#visitor-delete-status').textContent='Blocking…';
 try{
  await api('/api/visitors/'+selectedVisitorRecord.id+'/block',{method:'POST',body:JSON.stringify({confirm:true})});
  $('#visitor-delete-dialog').close();selectedVisitorRecord=null;$('#status').textContent='Visitor blocked. Future visits from this IP address are now blocked.';
  await load().catch(error);
 }catch(e){$('#visitor-delete-status').textContent=e.message;}
 finally{visitorDeleteBusy=false;$('#confirm-block-visitor').disabled=false;$('#cancel-block-visitor').disabled=false;}
};
async function loadBlockedVisitors(){
 const blocks=await api('/api/blocks');
 $('#blocked-visitors').innerHTML=blocks.length?blocks.map(block=>`<div class="item-row"><div><strong>${esc(block.ip)}</strong><small>Blocked ${esc(block.blocked_at)} UTC</small></div><button data-unblock="${block.id}">Unblock visitor</button></div>`).join(''):'<p>No blocked visitors.</p>';
}
$('#blocked-visitors').onclick=async event=>{
 const button=event.target.closest('[data-unblock]');if(!button||button.disabled)return;
 if(!confirm('Unblock this visitor and allow future visits from this IP address?'))return;
 button.disabled=true;
 try{await api('/api/blocks/'+button.dataset.unblock,{method:'DELETE'});$('#status').textContent='Visitor unblocked. This IP address can visit again.';await loadBlockedVisitors();}catch(e){error(e);button.disabled=false;}
};
$('#clear').onclick=async()=>{if(confirm('Delete all visitor records?'))try{await api('/api/visits/all',{method:'DELETE'});await load();}catch(e){error(e);}};
$('#refresh').onclick=()=>load().catch(error);
$('#edit-form').onsubmit=async e=>{
  e.preventDefault();if(busy)return;
  const form=e.target, v=Object.fromEntries(new FormData(form));
  const batch=v.kind==='video'&&v.format==='Series'&&!current;
  const poster=$('#poster-file').files[0], file=$('#file').files[0];
  const progress=message=>{$('#edit-status').textContent=message;};
  try{
    if(batch){
      if(Number($('#episode-count').value)!==episodeRows.length)throw Error('The episode count does not match the upload rows. Click Set episode uploads first.');
      EpisodeUploads.validate(episodeRows);
      const existing=await api('/api/content');
      for(const row of episodeRows){if(!row.saved&&row.uploaded){const saved=existing.find(x=>x.file===row.uploaded);if(saved)row.saved=saved.id;}}
      const duplicate=episodeRows.find(row=>!row.saved&&existing.some(x=>x.kind==='video'&&x.format==='Series'&&x.section===v.section&&x.title.trim().toLowerCase()===v.title.trim().toLowerCase()&&Number(x.season)===Number(v.season)&&Number(x.episode)===Number(row.number)));
      if(duplicate)throw Error(`Season ${v.season}, episode ${duplicate.number} already exists. Edit that episode or choose a different episode number.`);
    }
    if(poster&&(!['image/jpeg','image/png','image/webp'].includes(poster.type)||poster.size>10*1024*1024))throw Error('Choose a JPG, PNG or WebP poster up to 10 MB.');
    if(!batch&&!file&&!current?.file)throw Error('Choose a file to upload.');
    busy=true;form.inert=true;$('#save').disabled=true;
    v.poster_file=$('#remove-poster').checked?'':current?.poster_file||seriesTemplate?.poster_file||'';
    if(poster){progress('Uploading poster…');cachedPoster=cachedPoster||(await api('/api/upload',{method:'POST',headers:{'X-Kind':'poster','X-Filename':encodeURIComponent(poster.name)},body:poster})).file;v.poster_file=cachedPoster;}
    const upload=async(video,kind='video')=>(await api('/api/upload',{method:'POST',headers:{'X-Kind':kind,'X-Filename':encodeURIComponent(video.name)},body:video})).file;
    const save=value=>api('/api/content',{method:'POST',body:JSON.stringify(value)});
    let count=1;
    if(batch){
      count=await EpisodeUploads.publish(episodeRows,v,upload,async value=>{const result=await save(value);notifyCatalog();return result;},progress);
    }else{
      progress('Saving content…');v.file=file?await upload(file,v.kind):current.file;
      await save(v);notifyCatalog();
    }
    $('#editor').close();$('#status').textContent=batch?`${count} episodes published. They are now available on the site.`:current?'Changes saved. The existing content has been updated on the site.':'Content published. Your content is now available on the site.';
    await load().catch(error);
  }catch(e){
    const completed=episodeRows.filter(row=>row.saved).length;
    progress(e.message+(batch&&completed?` ${completed} episodes already published. Press Save & publish to retry the remaining episodes without duplicating completed ones.`:''));
    for(const row of episodeRows)if(row.saved){row.element.dataset.saved='true';row.element.querySelector('.episode-result').textContent='Published';for(const input of row.element.querySelectorAll('input'))input.disabled=true;}
    if(completed){notifyCatalog();load().catch(error);}
  }finally{busy=false;form.inert=false;$('#save').disabled=false;}
};
boot();
