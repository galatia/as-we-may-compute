if (Meteor.isClient) {
  /* https://github.com/d3/d3-timer Copyright 2015 Mike Bostock */
  "undefined"==typeof requestAnimationFrame&&(requestAnimationFrame="undefined"!=typeof window&&(window.msRequestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.oRequestAnimationFrame)||function(e){return setTimeout(e,17)}),function(e,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n(e.timer={})}(this,function(e){"use strict";function n(){r=m=0,c=1/0,t(u())}function t(e){if(!r){var t=e-Date.now();t>24?c>e&&(m&&clearTimeout(m),m=setTimeout(n,t),c=e):(m&&(m=clearTimeout(m),c=1/0),r=requestAnimationFrame(n))}}function i(e,n,i){i=null==i?Date.now():+i,null!=n&&(i+=+n);var o={callback:e,time:i,flush:!1,next:null};a?a.next=o:f=o,a=o,t(i)}function o(e,n,t){t=null==t?Date.now():+t,null!=n&&(t+=+n),l.callback=e,l.time=t}function u(e){e=null==e?Date.now():+e;var n=l;for(l=f;l;)e>=l.time&&(l.flush=l.callback(e-l.time,e)),l=l.next;l=n,e=1/0;for(var t,i=f;i;)i.flush?i=t?t.next=i.next:f=i.next:(i.time<e&&(e=i.time),i=(t=i).next);return a=t,e}var a,m,r,f,l,c=1/0;e.timer=i,e.timerReplace=o,e.timerFlush=u});

Meteor.startup(function() {

  // TODO small canvas on right side of other pages, one group tumbles through on average every 30s
    var tau = 2 * Math.PI,
        radius = 2.5,
        n,
        particles=[],
  // TODO sliders for vf, density, min, max would be cool
  // TODO also max should increase over time
        vf      = 0.2,
        density = 0.00012,
        minDistance = 40,
        maxDistance = 150,
        minDistance2 = minDistance * minDistance,
        maxDistance2 = maxDistance * maxDistance;

    var canvas, context, width, height;

    timer.timer(function(elapsed) {

      var draw = function(elapsed) {
        context.save();
        context.clearRect(0, 0, width, height);
        context.fillStyle  ="#ffffff";
        context.strokeStyle="#f0f0f0";

        for (var i = 0; i < n; ++i) {
          var p = particles[i];
          p.x += p.vx; if (p.x < -maxDistance) p.x += width + maxDistance * 2; else if (p.x > width + maxDistance) p.x -= width + maxDistance * 2;
          p.y += p.vy; if (p.y < -maxDistance) p.y += height + maxDistance * 2; else if (p.y > height + maxDistance) p.y -= height + maxDistance * 2;
          p.vx += vf * (Math.random() - .5) - 0.01 * p.vx;
          p.vy += vf * (Math.random() - .5) - 0.01 * p.vy;
          context.beginPath();
          context.arc(p.x, p.y, radius, 0, tau);
          context.fill();
        }

        for (var i = 0; i < n; ++i) {
          for (var j = i + 1; j < n; ++j) {
            var pi = particles[i],
                pj = particles[j],
                dx = pi.x - pj.x,
                dy = pi.y - pj.y,
                d2 = dx * dx + dy * dy;
            if (d2 < maxDistance2) {
              context.globalAlpha = d2 > minDistance2 ? (maxDistance2 - d2) / (maxDistance2 - minDistance2) : 1;
              context.beginPath();
              context.moveTo(pi.x, pi.y);
              context.lineTo(pj.x, pj.y);
              context.stroke();
            }
          }
        }

        context.restore();
      }

      if(!(canvas && canvas.parentNode)) {
        canvas = document.querySelector("canvas");
        width = window.innerWidth;
        height = window.innerHeight;

        if(canvas) {
          context = canvas.getContext("2d");

          resizeCanvas = function() {
            width  = canvas.width  = window.innerWidth;
            height = canvas.height = window.innerHeight;
            n = width * height * density;

            for (var i = 0; i < n; ++i) {
              if(!particles[i]) {
                particles[i] = {
                  x: Math.random() * width,
                  y: Math.random() * height,
                  vx: 0,
                  vy: 0
                };
              }
            }
            draw(elapsed);
          }
          window.addEventListener('resize', resizeCanvas, false);
          resizeCanvas();
        }
      }
      if(context) {
        draw(elapsed);
      }
    });
  });
}
