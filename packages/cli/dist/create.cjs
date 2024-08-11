#!/usr/bin/env node
"use strict";var v=Object.defineProperty;var c=(s,e)=>v(s,"name",{value:e,configurable:!0});var n=require("node:path"),i=require("node:fs"),h=require("node:util"),g=require("@internal/cdn");const a={sketches:"sketches",templates:"templates"},f={isoDate:/^\d{4}-\d{1,2}-\d{1,2}/,targetFolder:/^\d{4}-\d{1,2}-\d{1,2}-\w+/};(async()=>{const s={name:{type:"string",short:"n"},tmpl:{type:"string",short:"t"},source:{type:"string"},src:{type:"string",short:"s"}},e=h.parseArgs({args:process.argv.slice(2),options:s,strict:!1,allowPositionals:!0}),o=y(e),t=e.values.src??e.values.source,r=t?x(t):k(e);await w(r,o),j(o),console.log("\u2705 Done")})();function y({values:s,positionals:e}){const o=e[0]===process.argv[2]?e[0]:s.name;if(o||(console.log("Please submit a name to create a new project"),console.log("e.g. %o, %o or %o","npx create foo","npx create --name foo","npx create --name=foo"),process.exit(1)),s.name&&e[0]===process.argv[2]&&console.log("Too much arguments were passed. Using %o",o),typeof o=="string"){const r=f.targetFolder.test(o)?o:`${new Date().toISOString().split("T")[0]}-${o}`;if(!d(a.sketches).includes(r))return n.resolve("./",a.sketches,r);console.log("project %o already exists",r),process.exit(1)}const t=["--name","-n"].find(r=>process.argv.includes(r))??"name";console.log("Invalid value for argument %o",t),process.exit(1)}c(y,"getTargetPath");function k({values:s}){const e=s.tmpl;if(!e)return n.resolve("./",a.templates,"instance");const o=d(a.templates);if(typeof e=="string"){if(o.includes(e))return n.resolve("./",a.templates,e);console.log("Could not determine template project %o",e),console.log(u(o),...o),process.exit(1)}const t=["--tmpl","-t"].find(r=>process.argv.includes(r));console.log("Invalid value for argument %o",t),console.log(u(o),...o),process.exit(1)}c(k,"getTemplatePath");function x(s){const e=d(a.sketches);if(typeof s=="string"){if(e.includes(s))return n.resolve("./",a.sketches,s);console.log("Could not determine source project %o",s),console.log(u(e),...e),process.exit(1)}const o=["--source","--src","-s"].find(t=>process.argv.includes(t));console.log("Invalid value for argument %o",o),console.log(u(e),...e),process.exit(1)}c(x,"getSourcePath");function u(s){return`Use one of these ${Array.from({length:s.length},()=>"%o").join(", ")}`}c(u,"getFoldersMessage");async function w(s,e){console.log("Creating new sketch in %o",e);try{i.mkdirSync(e);let o,t;const r=i.readdirSync(s).filter(l=>typeof l=="string").filter(l=>!/^node_module|^dist|^\.vite/.test(l)).map(l=>(o=n.resolve(s,l),t=n.resolve(e,l),i.promises.cp(o,t,{recursive:!0})));await Promise.all(r)}catch(o){g.logError(o),process.exit(1)}}c(w,"copySourceFiles");function j(s){const e=n.join(s,"package.json"),o=g.parseJson(e),t=P();let r=n.basename(s).replace(f.isoDate,"").slice(1);if(t.includes(r)){let m=1,p=`${r}${m}`;for(;t.includes(p);)m+=1,p=`${r}${m}`;console.warn("Project name %o is already in use. Renaming Project to %o",r,p),console.warn("Consider to rename the project manually"),r=p}const l=Object.assign(o,{name:r});g.writeJson(e,l)}c(j,"updatePackageJson");function P(){return d(a.sketches).map(s=>n.resolve("./",a.sketches,s,"package.json")).filter(s=>i.existsSync(s)).map(s=>g.parseJson(s).name)}c(P,"getPackageNames");function d(s,e){const o={recursive:!1,withFileTypes:!0,...e};try{return i.readdirSync(n.resolve(s),o).filter(t=>t.isDirectory()).map(t=>t.name)}catch(t){g.logError(t)}return[]}c(d,"getFolders");
