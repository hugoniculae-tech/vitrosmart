document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}
  });
});

document.querySelectorAll('.slider-wrap').forEach(function(wrap){
  var after = wrap.querySelector('.sl-after');
  var line = wrap.querySelector('.sl-line');

  function apply(pct){
    pct = Math.max(0, Math.min(100, pct));
    after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
    if(line) line.style.left = pct + '%';
  }
  function posFromEvent(e){
    var rect = wrap.getBoundingClientRect();
    var x = e.clientX - rect.left;
    return (x / rect.width) * 100;
  }

  wrap.addEventListener('pointerdown', function(e){
    wrap.classList.add('is-dragging');
    try{ wrap.setPointerCapture(e.pointerId); }catch(err){}
    apply(posFromEvent(e));
  });
  wrap.addEventListener('pointermove', function(e){
    if(!wrap.classList.contains('is-dragging')) return;
    apply(posFromEvent(e));
  });
  wrap.addEventListener('pointerup', function(){ wrap.classList.remove('is-dragging'); });
  wrap.addEventListener('pointercancel', function(){ wrap.classList.remove('is-dragging'); });
});

document.querySelectorAll('.vi-toggle').forEach(function(btn){
  var video = btn.parentElement.querySelector('video');
  if(!video) return;
  btn.addEventListener('click', function(){
    if(video.paused){ video.play(); btn.textContent = '⏸'; btn.setAttribute('aria-label','Mettre en pause la vidéo'); }
    else{ video.pause(); btn.textContent = '▶'; btn.setAttribute('aria-label','Lire la vidéo'); }
  });
});

// Robust autoplay for mobile: some mobile browsers ignore the autoplay
// attribute (data saver, delayed engagement, etc.) even when muted +
// playsinline are set. Force-start playback once each video is actually
// visible, and pause it when scrolled away to save battery/data.
document.querySelectorAll('video[autoplay]').forEach(function(video){
  video.muted = true;
  video.setAttribute('muted', '');
  var tryPlay = function(){ var p = video.play(); if(p && p.catch) p.catch(function(){}); };

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) tryPlay();
        else video.pause();
      });
    }, {threshold: 0.35});
    io.observe(video);
  } else {
    tryPlay();
  }

  video.addEventListener('loadedmetadata', tryPlay);
  document.addEventListener('touchstart', tryPlay, {once: true, passive: true});
});

document.querySelectorAll('form[data-netlify-ajax]').forEach(function(form){
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var data = new FormData(form);
    var encoded = Array.from(data.entries())
      .map(function(pair){ return encodeURIComponent(pair[0]) + '=' + encodeURIComponent(pair[1]); })
      .join('&');
    fetch('/', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: encoded
    }).then(function(){
      form.hidden = true;
      var success = document.getElementById(form.dataset.successTarget);
      if(success) success.hidden = false;
    }).catch(function(){
      alert('Une erreur est survenue. Merci de réessayer ou de nous contacter directement.');
    });
  });
});
