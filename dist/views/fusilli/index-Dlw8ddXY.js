var Gt=Object.defineProperty;var Rt=(E,I,g)=>I in E?Gt(E,I,{enumerable:!0,configurable:!0,writable:!0,value:g}):E[I]=g;var A=(E,I,g)=>Rt(E,typeof I!="symbol"?I+"":I,g);(function(){"use strict";var E=document.createElement("style");E.textContent=`main{max-width:1280px;margin:0 auto;padding:0}#wrapper{height:var(--elt-size);margin:0 auto;padding:2rem 0;aspect-ratio:1;display:flex;justify-content:center;align-items:center}#wrapper canvas{box-shadow:2px 2px 1rem #0009;border:1px solid #fff3}#wrapper.loading:after{content:"Loading ...";display:block;position:absolute;padding:.25rem .5rem;background-color:#262626;box-shadow:2px 2px 1rem #0006;border-radius:.125rem}#content{position:relative;width:var(--elt-size);margin:0 auto}#content pre{background-color:#0003;padding:.75rem 1.25rem}#content div{padding:.75rem 0 1.25rem}#content div>img{display:block;position:relative;max-width:100%;margin:0 auto 2rem}#content .col-2{display:grid;grid-template-columns:auto auto;column-gap:1rem}@media (orientation: landscape){:root{--elt-size: calc(100vh - 4rem) }}@media (orientation: portrait){:root{--elt-size: calc(100vw - 4rem) }}
`,document.head.appendChild(E);const I="#",g={SIZE:32},F=["N","E","S","W"],z=["B","L","F","R"],T={FFFF:{weight:4,hasIntersections:!0},LLLL:{weight:2,hasIntersections:!0},BBBB:{weight:2,hasIntersections:!1},RRRR:{weight:2,hasIntersections:!1},BFBF:{weight:4,hasIntersections:!1},LRLR:{weight:6,hasIntersections:!1},LFBL:{weight:8,hasIntersections:!0},BFRR:{weight:8,hasIntersections:!1},BLRB:{weight:8,hasIntersections:!1},FFRL:{weight:8,hasIntersections:!0}},J=new RegExp(`[${z.join("")}]{4,}`);Object.keys(T).forEach(t=>{if(!J.test(t))throw new TypeError("Nope")});const m=K();function K(){let t=Date.now(),e=0;const n=s=>{const r=Date.now();e=r-t,t=r,console.log(`${s} +${e}ms`)};return n.reset=()=>t=Date.now(),n}const H=document.getElementById("wrapper"),V=(H==null?void 0:H.clientHeight)??window.innerHeight,q=(H==null?void 0:H.clientWidth)??window.innerWidth,N=Math.floor(Math.min(V,q)/g.SIZE),c={SIDE_LGTH:N,HALF_SIDE_LGTH:.5*N},o={OFFSET:.3*c.HALF_SIDE_LGTH,PADDING:.05*c.HALF_SIDE_LGTH,RADIUS_SMALL:.325*c.HALF_SIDE_LGTH,RADIUS_BIG:.5*c.HALF_SIDE_LGTH,WEIGHT_THICK:Math.max(1.5,.35*c.HALF_SIDE_LGTH),WEIGHT_THIN:Math.max(1,.175*c.HALF_SIDE_LGTH)},Q=[[1,0],[0,1],[-1,0],[0,-1]],P={B:[[-o.OFFSET,-c.HALF_SIDE_LGTH],[-o.OFFSET,-c.HALF_SIDE_LGTH+o.PADDING],[-o.OFFSET+o.RADIUS_SMALL,-c.HALF_SIDE_LGTH+o.PADDING],[-o.OFFSET+o.RADIUS_SMALL,-c.HALF_SIDE_LGTH+o.PADDING+o.RADIUS_SMALL],[o.OFFSET-o.RADIUS_SMALL,-c.HALF_SIDE_LGTH+o.PADDING+o.RADIUS_SMALL],[o.OFFSET-o.RADIUS_SMALL,-c.HALF_SIDE_LGTH+o.PADDING],[o.OFFSET,-c.HALF_SIDE_LGTH+o.PADDING],[o.OFFSET,-c.HALF_SIDE_LGTH]],L:[[-o.OFFSET,-c.HALF_SIDE_LGTH],[-o.OFFSET,-c.HALF_SIDE_LGTH+o.PADDING],[-o.OFFSET+o.RADIUS_BIG,-c.HALF_SIDE_LGTH+o.PADDING],[-o.OFFSET+o.RADIUS_BIG+Math.cos(.75*Math.PI)*o.RADIUS_BIG,-c.HALF_SIDE_LGTH+o.PADDING+Math.sin(.75*Math.PI)*o.RADIUS_BIG],[c.HALF_SIDE_LGTH-o.PADDING+Math.cos(.75*Math.PI)*o.RADIUS_BIG,o.OFFSET-o.RADIUS_BIG+Math.sin(.75*Math.PI)*o.RADIUS_BIG],[c.HALF_SIDE_LGTH-o.PADDING,o.OFFSET-o.RADIUS_BIG],[c.HALF_SIDE_LGTH-o.PADDING,o.OFFSET],[c.HALF_SIDE_LGTH,o.OFFSET]],F:[[-o.OFFSET,-c.HALF_SIDE_LGTH],[-o.OFFSET,c.HALF_SIDE_LGTH]],R:[[-o.OFFSET,-c.HALF_SIDE_LGTH],[-o.OFFSET,-c.HALF_SIDE_LGTH+o.PADDING],[-o.OFFSET-o.RADIUS_SMALL,-c.HALF_SIDE_LGTH+o.PADDING],[-o.OFFSET-o.RADIUS_SMALL+Math.cos(.25*Math.PI)*o.RADIUS_SMALL,-c.HALF_SIDE_LGTH+o.PADDING+Math.sin(.25*Math.PI)*o.RADIUS_SMALL],[-c.HALF_SIDE_LGTH+o.PADDING+Math.cos(.25*Math.PI)*o.RADIUS_SMALL,-o.OFFSET-o.RADIUS_SMALL+Math.sin(.25*Math.PI)*o.RADIUS_SMALL],[-c.HALF_SIDE_LGTH+o.PADDING,-o.OFFSET-o.RADIUS_SMALL],[-c.HALF_SIDE_LGTH+o.PADDING,-o.OFFSET],[-c.HALF_SIDE_LGTH,-o.OFFSET]]},X={B:[.5*Math.PI,Math.PI,0,.5*Math.PI],L:[.75*Math.PI,Math.PI,.5*Math.PI,.75*Math.PI],F:[0,0,0,0],R:[0,.25*Math.PI,.25*Math.PI,.5*Math.PI]},Y=Object.fromEntries(Object.keys(P).map(t=>[t,et(P[t])])),y=Object.fromEntries(Object.keys(P).map(t=>[t,nt(X[t])]));function tt(t,e,n){const s=Q[n];return[t*s[0]-e*s[1],t*s[1]+e*s[0]]}function et(t){return Array.from({length:4},(e,n)=>t.map(s=>tt(...s,n)))}function nt(t){return Array.from({length:4},(e,n)=>t.map(s=>s+n*.5*Math.PI))}function ot(t,e){return[t*c.SIDE_LGTH,e*c.SIDE_LGTH]}function st(t,e){return[t*c.SIDE_LGTH+c.HALF_SIDE_LGTH,e*c.SIDE_LGTH+c.HALF_SIDE_LGTH]}const x=Object.keys(T).reduce((t,e)=>{const n=T[e].weight;return[...t,...Array.from({length:n},()=>e)]},[]);function rt(){const t=Math.floor(Math.random()*x.length);return x[t]}function it(){return Math.floor(Math.random()*4)}function ct(t,e){let n=0;for(;n<e;)t=t.slice(-1)+t.slice(0,3),n+=1;return t}function at(t,e){const n=rt(),s=it();return{type:n,lanes:ct(n,s),rotation:s,position:ot(t,e),center:st(t,e)}}function U(t,e,n){return`${t}${e}${n}`}function b(t){const e=M(t);return[e.slice(0,-2),...e.slice(-2).split("")]}function M(t){return t.includes(I)?t.split(I)[0]:t}function lt(t){return t.split(I)[1]??null}function B(t,e){const n=F.indexOf(e);return t.charAt(n)}function ht(t,e){if(e==="F")return t;const n=["F","R","B","L"],s=(F.indexOf(t)+n.indexOf(e))%F.length;return F[s]}function dt(t,e){let[n,s]=t.split(".").map(r=>parseInt(r));switch(e){case"N":s+=1;break;case"E":n-=1;break;case"S":s-=1;break;case"W":n+=1;break}if(!(n<0||s<0||n>=g.SIZE||s>=g.SIZE))return`${n}.${s}`}const{SIZE:p}=g;class It{constructor(e){A(this,"type");A(this,"config");A(this,"data",new Set);A(this,"generator");this.type=D()?"rgb":"hsl",this.config=this.type==="rgb"?v(this.type):v(this.type),this.generator=this.type==="rgb"?Lt(this.config):gt(this.config,e),m(JSON.stringify({type:this.type,vals:this.config},null,2))}process(e){const[n,s]=ut(e),[r,i,a]=this.generator(n,s,e.length),h=this.type==="rgb"?`rgb(${r}, ${i}, ${a})`:`hsl(${r}, ${i}%, ${a}%)`;return this.data.add(h),h}}function v(t){return t==="rgb"?{min:34,max:255,delta:221}:{hueOff:Math.floor(270*Math.random()),hueDelta:[90,180][Math.floor(2*Math.random())],hueJitter:30,lgtMin:20,lgtDelta:60}}function ut(t){const e=t.reduce((n,s)=>{const[r,i]=M(s).slice(0,-2).split(".").map(a=>parseInt(a));return n[0]=Math.min(n[0],r),n[1]=Math.max(n[1],r),n[2]=Math.min(n[2],i),n[3]=Math.max(n[3],i),n},[1/0,-1/0,1/0,-1/0]);return[e[0]+.5*(e[1]-e[0]),e[2]+.5*(e[3]-e[2])]}function D(t=.5){return Math.random()<t}function Lt(t){const e=[D(),D(),D()],n=D()?[e[0],!e[1],!e[2]]:[!e[0],D(),D()],s=ft([C(...e),C(...n),D()?.25:.75]),r=(i,a)=>s.map(h=>typeof h=="function"?h(i,a):h);return(i,a,h)=>(i/=p,a/=p,r(i,a).map(l=>At(t.min+l*t.delta)))}function C(t,e,n){return(s,r)=>St(t?s:r,e,n)}function St(t,e,n){return e&&(t=Math.abs(t*2-1)),t+=.2*(Math.random()*(D()?1:-1)),n?1-t:t}function ft(t){let e=t.length;for(;e!=0;){let n=Math.floor(Math.random()*e);e--,[t[e],t[n]]=[t[n],t[e]]}return t}function At(t){return Math.max(0,Math.min(255,Math.round(t)))}function gt(t,e){const n=e.reduce((s,r)=>r.length>s?r.length:s,-1/0);return(s,r,i)=>{s/=p,r/=p;const a=Math.atan2(r-.5,s-.5)/Math.PI,h=i/n,u=Math.random()*(D()?1:-1),l=t.hueOff+a*t.hueDelta+u*t.hueJitter,d=t.lgtMin+h*t.lgtDelta;return[(l+360)%360,100,d].map(S=>Math.floor(S))}}class ${constructor(e){A(this,"size");A(this,"tiles");A(this,"maxDepth");A(this,"graphs");A(this,"parsed");A(this,"colors");this.size=e,this.maxDepth=e*e*4,this.tiles=Dt(this),m("Created Grid"),this.graphs=_t(this),m("Processed Grid");const{parsed:n,colors:s}=Ft(this);this.parsed=n,this.colors=s}}function Dt({size:t}){const e=new Map;let n;for(let s=0;s<t;s+=1)for(let r=0;r<t;r+=1)n=`${r}.${s}`,e.set(n,at(r,s));return e}function _t({tiles:t,maxDepth:e}){const n=new Set,s=new Map,r=[];for(const[i,a]of t.entries())for(const h of F){let u=U(i,h,B(a.lanes,h));if(n.has(u))continue;let l=[u],d,S=0;for(;S<e&&(d=Et(t,l,n),!!d);)l.push(d),S+=1;S===e&&console.warn("Hit max depth!");const L=M(l[0]),f=lt(l[l.length-1]);if(L===f){r.push(l);continue}if(!f){s.set(L,l);continue}if(s.has(f)){l=[...l,...s.get(f)??[]],s.delete(f),s.set(L,l);continue}}return[...r,...s.values()]}function Et(t,e,n){const s=e.at(-1);if(!s){console.warn("Something went wrong");return}const r=M(s);n.add(r);const[i,a,h]=b(r),u=ht(a,h),l=dt(i,u);if(!l)return;const d=t.get(l);if(!d)return;const S=B(d.lanes,u),L=U(l,u,S);if(e[e.length-1]=`${r}${I}${L}`,L!==e[0].split(I)[0]&&!n.has(L))return L}function Ft({tiles:t,graphs:e}){const n=new Map,s=new Map,r=new It(e);return e.forEach((i,a)=>{const h=r.process(i);for(const u of i){const[l,d,S]=b(u),L=t.get(l);if(!L){console.warn("Could not get tile %o",l);continue}const f=n.get(l)??{coords:L.center,edges:{},hasIntersections:T[L.type].hasIntersections};d in f.edges&&console.warn("Möhp"),f.edges[d]={lane:S,color:h};const Z=Object.keys(f.edges);if(Z.length===4&&F.every(pt=>Z.includes(pt))){s.set(l,f),n.delete(l);continue}n.set(l,f)}}),{parsed:s,colors:r.data}}const W={B(t,e,n,s){const r="B",i=G(r,e,n,s),a=y[r][s];t.line(...i[0],...i[1]),t.arc(...i[2],o.RADIUS_SMALL,o.RADIUS_SMALL,a[0],a[1]),t.line(...i[3],...i[4]),t.arc(...i[5],o.RADIUS_SMALL,o.RADIUS_SMALL,a[2],a[3]),t.line(...i[6],...i[7])},L(t,e,n,s){const r="L",i=G(r,e,n,s),a=y[r][s];t.line(...i[0],...i[1]),t.arc(...i[2],o.RADIUS_BIG,o.RADIUS_BIG,a[0],a[1]),t.line(...i[3],...i[4]),t.arc(...i[5],o.RADIUS_BIG,o.RADIUS_BIG,a[2],a[3]),t.line(...i[6],...i[7])},F(t,e,n,s){const i=G("F",e,n,s);t.line(...i[0],...i[1])},R(t,e,n,s){const r="R",i=G(r,e,n,s),a=y[r][s];t.line(...i[0],...i[1]),t.arc(...i[2],o.RADIUS_SMALL,o.RADIUS_SMALL,a[0],a[1]),t.line(...i[3],...i[4]),t.arc(...i[5],o.RADIUS_SMALL,o.RADIUS_SMALL,a[2],a[3]),t.line(...i[6],...i[7])}};function G(t,e,n,s){return Y[t][s].map(r=>[e+r[0],n+r[1]])}const _=document.getElementById("wrapper");_==null||_.classList.add("loading");const{SIZE:R}=g,{SIDE_LGTH:k}=c,{WEIGHT_THICK:mt,WEIGHT_THIN:Ht}=o;let w=new $(R),O={};const Tt=t=>{t.setup=()=>{t.createCanvas(R*k,R*k),t.ellipseMode(t.RADIUS),t.noLoop(),O=j(t,w.colors),m("Finished Setup")},t.draw=()=>{t.background(O.background),Mt(t,w),m("Finished Draw"),_==null||_.classList.remove("loading")},t.mouseClicked=e=>{e instanceof UIEvent&&e.target instanceof HTMLCanvasElement&&(_==null||_.classList.add("loading"),setTimeout(()=>{m.reset(),w=new $(R),O=j(t,w.colors),t.redraw(1)},300))}};function j(t,e){return{background:t.color(17),...[...e].reduce((n,s)=>({...n,[s]:t.color(s)}),{})}}function Mt(t,e){const n=O.background;let s,r;t.noFill(),t.strokeWeight(Math.max(1,.1*k)),[...e.parsed.values()].forEach((a,h)=>{[s,r]=a.coords,["N","E","S","W"].forEach((u,l)=>{const{lane:d,color:S}=a.edges[u];a.hasIntersections&&(t.stroke(n),t.strokeWeight(mt),t.strokeCap(t.SQUARE),W[d](t,s,r,l)),t.stroke(S),t.strokeWeight(Ht),t.strokeCap(t.ROUND),W[d](t,s,r,l)})})}new window.p5(Tt,document.getElementById("wrapper"))})();