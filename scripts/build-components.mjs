import {readFileSync,writeFileSync,readdirSync,cpSync,mkdirSync} from 'node:fs';
import ts from 'typescript';
for (const dir of readdirSync('packages/components',{withFileTypes:true}).filter(d=>d.isDirectory())) {
 const path=`packages/components/${dir.name}`;
 const manifest=JSON.parse(readFileSync(`${path}/component.manifest.json`,'utf8'));
 writeFileSync(`${path}/${manifest.bundle}`,ts.transpileModule(readFileSync(`${path}/${manifest.entry}`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
}
if(process.argv.includes('--publish')){mkdirSync('dist/components',{recursive:true});for(const dir of readdirSync('packages/components',{withFileTypes:true}).filter(d=>d.isDirectory())){for(const sub of ['demo','dist'])cpSync(`packages/components/${dir.name}/${sub}`,`dist/components/${dir.name}/${sub}`,{recursive:true});}}
console.log('C01–C04 ESM components built');
