var L={4140:(i,s,l)=>{var v={"./Module":()=>l.e(189).then(()=>()=>l(4189))},S=(f,b)=>(l.R=b,b=l.o(v,f)?v[f]():Promise.resolve().then(()=>{throw new Error('Module "'+f+'" does not exist in container.')}),l.R=void 0,b),c=(f,b)=>{if(l.S){var p="default",y=l.S[p];if(y&&y!==f)throw new Error("Container initialization failed as it has already been initialized with a different share scope");return l.S[p]=f,l.I(p,b)}};l.d(s,{get:()=>S,init:()=>c})}},$={};function a(i){var s=$[i];if(void 0!==s)return s.exports;var l=$[i]={exports:{}};return L[i].call(l.exports,l,l.exports,a),l.exports}a.m=L,a.c=$,a.n=i=>{var s=i&&i.__esModule?()=>i.default:()=>i;return a.d(s,{a:s}),s},a.d=(i,s)=>{for(var l in s)a.o(s,l)&&!a.o(i,l)&&Object.defineProperty(i,l,{enumerable:!0,get:s[l]})},a.f={},a.e=i=>Promise.all(Object.keys(a.f).reduce((s,l)=>(a.f[l](i,s),s),[])),a.u=i=>i+".js",a.miniCssF=i=>{},a.o=(i,s)=>Object.prototype.hasOwnProperty.call(i,s),(()=>{var i={},s="SpaceSim:";a.l=(l,v,S,c)=>{if(i[l])i[l].push(v);else{var f,b;if(void 0!==S)for(var p=document.getElementsByTagName("script"),y=0;y<p.length;y++){var g=p[y];if(g.getAttribute("src")==l||g.getAttribute("data-webpack")==s+S){f=g;break}}f||(b=!0,(f=document.createElement("script")).type="module",f.charset="utf-8",f.timeout=120,a.nc&&f.setAttribute("nonce",a.nc),f.setAttribute("data-webpack",s+S),f.src=a.tu(l)),i[l]=[v];var m=(x,E)=>{f.onerror=f.onload=null,clearTimeout(C);var w=i[l];if(delete i[l],f.parentNode&&f.parentNode.removeChild(f),w&&w.forEach(h=>h(E)),x)return x(E)},C=setTimeout(m.bind(null,void 0,{type:"timeout",target:f}),12e4);f.onerror=m.bind(null,f.onerror),f.onload=m.bind(null,f.onload),b&&document.head.appendChild(f)}}})(),a.r=i=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(i,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(i,"__esModule",{value:!0})},(()=>{a.S={};var i={},s={};a.I=(l,v)=>{v||(v=[]);var S=s[l];if(S||(S=s[l]={}),!(v.indexOf(S)>=0)){if(v.push(S),i[l])return i[l];a.o(a.S,l)||(a.S[l]={});var c=a.S[l],b="SpaceSim",p=(m,C,x,E)=>{var w=c[m]=c[m]||{},h=w[C];(!h||!h.loaded&&(!E!=!h.eager?E:b>h.from))&&(w[C]={get:x,from:b,eager:!!E})},g=[];return"default"===l&&(p("@angular/common","13.2.1",()=>a.e(181).then(()=>()=>a(6895))),p("@angular/core","13.2.1",()=>a.e(738).then(()=>()=>a(6738))),p("@angular/router","13.2.1",()=>a.e(834).then(()=>()=>a(30)))),i[l]=g.length?Promise.all(g).then(()=>i[l]=1):1}}})(),(()=>{var i;a.tt=()=>(void 0===i&&(i={createScriptURL:s=>s},"undefined"!=typeof trustedTypes&&trustedTypes.createPolicy&&(i=trustedTypes.createPolicy("angular#bundler",i))),i)})(),a.tu=i=>a.tt().createScriptURL(i),(()=>{var i;if("string"==typeof import.meta.url&&(i=import.meta.url),!i)throw new Error("Automatic publicPath is not supported in this browser");i=i.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),a.p=i})(),(()=>{var i=e=>{var t=o=>o.split(".").map(u=>+u==u?+u:u),r=/^([^-+]+)?(?:-([^+]+))?(?:\+(.+))?$/.exec(e),n=r[1]?t(r[1]):[];return r[2]&&(n.length++,n.push.apply(n,t(r[2]))),r[3]&&(n.push([]),n.push.apply(n,t(r[3]))),n},l=e=>{var t=e[0],r="";if(1===e.length)return"*";if(t+.5){r+=0==t?">=":-1==t?"<":1==t?"^":2==t?"~":t>0?"=":"!=";for(var n=1,o=1;o<e.length;o++)n--,r+="u"==(typeof(d=e[o]))[0]?"-":(n>0?".":"")+(n=2,d);return r}var u=[];for(o=1;o<e.length;o++){var d=e[o];u.push(0===d?"not("+V()+")":1===d?"("+V()+" || "+V()+")":2===d?u.pop()+" "+u.pop():l(d))}return V();function V(){return u.pop().replace(/^\((.+)\)$/,"$1")}},v=(e,t)=>{if(0 in e){t=i(t);var r=e[0],n=r<0;n&&(r=-r-1);for(var o=0,u=1,d=!0;;u++,o++){var V,O,P=u<e.length?(typeof e[u])[0]:"";if(o>=t.length||"o"==(O=(typeof(V=t[o]))[0]))return!d||("u"==P?u>r&&!n:""==P!=n);if("u"==O){if(!d||"u"!=P)return!1}else if(d)if(P==O)if(u<=r){if(V!=e[u])return!1}else{if(n?V>e[u]:V<e[u])return!1;V!=e[u]&&(d=!1)}else if("s"!=P&&"n"!=P){if(n||u<=r)return!1;d=!1,u--}else{if(u<=r||O<P!=n)return!1;d=!1}else"s"!=P&&"n"!=P&&(d=!1,u--)}}var F=[],M=F.pop.bind(F);for(o=1;o<e.length;o++){var T=e[o];F.push(1==T?M()|M():2==T?M()&M():T?v(T,t):!M())}return!!M()},f=(e,t)=>{var r=e[t];return Object.keys(r).reduce((n,o)=>!n||!r[n].loaded&&((e,t)=>{e=i(e),t=i(t);for(var r=0;;){if(r>=e.length)return r<t.length&&"u"!=(typeof t[r])[0];var n=e[r],o=(typeof n)[0];if(r>=t.length)return"u"==o;var u=t[r],d=(typeof u)[0];if(o!=d)return"o"==o&&"n"==d||"s"==d||"u"==o;if("o"!=o&&"u"!=o&&n!=u)return n<u;r++}})(n,o)?o:n,0)},g=(e,t,r,n)=>{var o=f(e,r);if(!v(n,o))throw new Error(((e,t,r,n)=>"Unsatisfied version "+r+" from "+(r&&e[t][r].from)+" of shared singleton module "+t+" (required "+l(n)+")")(e,r,o,n));return w(e[r][o])},w=e=>(e.loaded=1,e.get()),A=(e=>function(t,r,n,o){var u=a.I(t);return u&&u.then?u.then(e.bind(e,t,a.S[t],r,n,o)):e(t,a.S[t],r,n,o)})((e,t,r,n,o)=>t&&a.o(t,r)?g(t,0,r,n):o()),j={},z={8802:()=>A("default","@angular/core",[1,13,2,0],()=>a.e(738).then(()=>()=>a(6738))),1643:()=>A("default","@angular/common",[1,13,2,0],()=>a.e(895).then(()=>()=>a(6895))),3464:()=>A("default","@angular/router",[1,13,2,0],()=>a.e(30).then(()=>()=>a(30)))},k={181:[8802],189:[1643,3464,8802],834:[1643,8802]};a.f.consumes=(e,t)=>{a.o(k,e)&&k[e].forEach(r=>{if(a.o(j,r))return t.push(j[r]);var n=d=>{j[r]=0,a.m[r]=V=>{delete a.c[r],V.exports=d()}},o=d=>{delete j[r],a.m[r]=V=>{throw delete a.c[r],d}};try{var u=z[r]();u.then?t.push(j[r]=u.then(n).catch(o)):n(u)}catch(d){o(d)}})}})(),(()=>{var i={108:0};a.f.j=(v,S)=>{var c=a.o(i,v)?i[v]:void 0;if(0!==c)if(c)S.push(c[2]);else{var f=new Promise((g,m)=>c=i[v]=[g,m]);S.push(c[2]=f);var b=a.p+a.u(v),p=new Error;a.l(b,g=>{if(a.o(i,v)&&(0!==(c=i[v])&&(i[v]=void 0),c)){var m=g&&("load"===g.type?"missing":g.type),C=g&&g.target&&g.target.src;p.message="Loading chunk "+v+" failed.\n("+m+": "+C+")",p.name="ChunkLoadError",p.type=m,p.request=C,c[1](p)}},"chunk-"+v,v)}};var s=(v,S)=>{var p,y,[c,f,b]=S,g=0;if(c.some(C=>0!==i[C])){for(p in f)a.o(f,p)&&(a.m[p]=f[p]);b&&b(a)}for(v&&v(S);g<c.length;g++)a.o(i,y=c[g])&&i[y]&&i[y][0](),i[y]=0},l=self.webpackChunkSpaceSim=self.webpackChunkSpaceSim||[];l.forEach(s.bind(null,0)),l.push=s.bind(null,l.push.bind(l))})();var U=a(4140),R=U.get,B=U.init;export{R as get,B as init};