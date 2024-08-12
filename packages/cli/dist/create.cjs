#!/usr/bin/env node
"use strict";var v=Object.defineProperty;var c=(o,e)=>v(o,"name",{value:e,configurable:!0});var n=require("node:path"),i=require("node:fs"),h=require("node:util"),g=require("@internal/cdn");const a={sketches:"sketches",templates:"templates"},f={isoDate:/^\d{4}-\d{1,2}-\d{1,2}/,targetFolder:/^\d{4}-\d{1,2}-\d{1,2}-\w+/};(async()=>{const o={name:{type:"string",short:"n"},tmpl:{type:"string",short:"t"},source:{type:"string"},src:{type:"string",short:"s"}},e=h.parseArgs({args:process.argv.slice(2),options:o,strict:!1,allowPositionals:!0}),s=y(e),t=e.values.src??e.values.source,r=t?x(t):k(e);await w(r,s),j(s),console.log("\u2705 Done")})();function y({values:o,positionals:e}){const s=e[0]===process.argv[2]?e[0]:o.name;if(s||(console.log("Please provide a name to create a new project"),console.log("e.g. %o, %o or %o","npx create foo","npx create --name foo","npx create --name=foo"),process.exit(1)),o.name&&e[0]===process.argv[2]&&console.log("Too much arguments were passed. Using %o",s),typeof s=="string"){const r=f.targetFolder.test(s)?s:`${new Date().toISOString().split("T")[0]}-${s}`;if(!d(a.sketches).includes(r))return n.resolve("./",a.sketches,r);console.log("project %o already exists",r),process.exit(1)}const t=["--name","-n"].find(r=>process.argv.includes(r))??"name";console.log("Invalid value for argument %o",t),process.exit(1)}c(y,"getTargetPath");function k({values:o}){const e=o.tmpl;if(!e)return n.resolve("./",a.templates,"instance");const s=d(a.templates);if(typeof e=="string"){if(s.includes(e))return n.resolve("./",a.templates,e);console.log("Could not determine template project %o",e),console.log(u(s),...s),process.exit(1)}const t=["--tmpl","-t"].find(r=>process.argv.includes(r));console.log("Invalid value for argument %o",t),console.log(u(s),...s),process.exit(1)}c(k,"getTemplatePath");function x(o){const e=d(a.sketches);if(typeof o=="string"){if(e.includes(o))return n.resolve("./",a.sketches,o);console.log("Could not determine source project %o",o),console.log(u(e),...e),process.exit(1)}const s=["--source","--src","-s"].find(t=>process.argv.includes(t));console.log("Invalid value for argument %o",s),console.log(u(e),...e),process.exit(1)}c(x,"getSourcePath");function u(o){return`Use one of these ${Array.from({length:o.length},()=>"%o").join(", ")}`}c(u,"getFoldersMessage");async function w(o,e){console.log("Creating new sketch in %o",e);try{i.mkdirSync(e);let s,t;const r=i.readdirSync(o).filter(l=>typeof l=="string").filter(l=>!/^node_module|^dist|^\.vite/.test(l)).map(l=>(s=n.resolve(o,l),t=n.resolve(e,l),i.promises.cp(s,t,{recursive:!0})));await Promise.all(r)}catch(s){g.logError(s),process.exit(1)}}c(w,"copySourceFiles");function j(o){const e=n.join(o,"package.json"),s=g.parseJson(e),t=P();let r=n.basename(o).replace(f.isoDate,"").slice(1);if(t.includes(r)){let m=1,p=`${r}${m}`;for(;t.includes(p);)m+=1,p=`${r}${m}`;console.warn("Project name %o is already in use. Renaming Project to %o",r,p),console.warn("Consider to rename the project manually"),r=p}const l=Object.assign(s,{name:r});g.writeJson(e,l)}c(j,"updatePackageJson");function P(){return d(a.sketches).map(o=>n.resolve("./",a.sketches,o,"package.json")).filter(o=>i.existsSync(o)).map(o=>g.parseJson(o).name)}c(P,"getPackageNames");function d(o,e){const s={recursive:!1,withFileTypes:!0,...e};try{return i.readdirSync(n.resolve(o),s).filter(t=>t.isDirectory()).map(t=>t.name)}catch(t){g.logError(t)}return[]}c(d,"getFolders");
