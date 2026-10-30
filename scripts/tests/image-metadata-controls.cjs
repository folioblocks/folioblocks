const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),babel=require('@babel/core');
const source=fs.readFileSync('src/image-block/premium.js','utf8');
const component=source.slice(source.indexOf('const ImageMetadataSyncControl ='),source.indexOf("\naddFilter(\n\t'folioBlocks.imageBlock.metadataSyncControl'"));
let slots=[],cursor=0,effects=[],pending=[],writes=[],permission=true,refresh,sync;
const sandbox={AbortController,React:{createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity).filter(Boolean)})},BaseControl:'BaseControl',Button:'Button',Notice:'Notice',__:text=>text,
useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],value=>slots[i]=value];},
useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
useEffect(fn,deps){const i=cursor++;if(!effects[i]||deps.some((dep,j)=>dep!==effects[i].deps[j]))pending.push(()=>{effects[i]?.cleanup?.();effects[i]={deps,cleanup:fn()};});},
useSelect:()=>permission,
refreshImageMetadataFromMedia:(...args)=>refresh(...args),syncImageMetadataToMedia:(...args)=>sync(...args)};
vm.runInNewContext(babel.transformSync(component+'\nthis.render=ImageMetadataSyncControl;',{babelrc:false,configFile:false,plugins:['@babel/plugin-transform-react-jsx']}).code,sandbox);
const render=id=>{cursor=0;const tree=sandbox.render({attributes:{id,title:'Local'},setAttributes:value=>writes.push(value)});pending.splice(0).forEach(fn=>fn());return tree;};
const buttons=tree=>tree.children[0].children[0].children;
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
(async()=>{
let tree=render(12);assert.deepEqual(buttons(tree).map(b=>b.children[0]),['Sync','Refresh']);
assert.equal(buttons(tree)[0].props.style.flex,buttons(tree)[1].props.style.flex);
assert.equal(buttons(tree)[1].props.title,'Refresh from Media Library');
assert.equal(buttons(tree)[0].props.variant,'primary');
assert.equal(buttons(tree)[1].props.variant,'secondary');
assert.equal(tree.children[0].type,'BaseControl');
assert(tree.children[0].props.help.includes('Sync saves'));
let call=deferred(),signal;refresh=(id,options)=>{assert.equal(id,12);signal=options.signal;return call.promise;};
const action=buttons(tree)[1].props.onClick();tree=render(12);assert(buttons(tree).every(b=>b.props.disabled));
call.resolve({title:'Library',alt:'Alt'});await action;assert.equal(writes.length,1);assert.equal(writes[0].title,'Library');
tree=render(12);assert(tree.children.some(el=>el.type==='Notice'&&el.props.status==='success'));
call=deferred();const stale=buttons(tree)[1].props.onClick();render(13);assert(signal.aborted);call.resolve({title:'Wrong image'});await stale;assert.equal(writes.length,1);
refresh=()=>Promise.reject(new Error('Network failure'));tree=render(13);await buttons(tree)[1].props.onClick();tree=render(13);assert(tree.children.some(el=>el.type==='Notice'&&el.props.status==='error'));assert.equal(writes.length,1);
call=deferred();refresh=(id,options)=>{signal=options.signal;return call.promise;};const unmounted=buttons(tree)[1].props.onClick();effects.forEach(effect=>effect?.cleanup?.());assert(signal.aborted);call.resolve({title:'Unmounted'});await unmounted;assert.equal(writes.length,1);
permission=undefined;tree=render(13);assert(buttons(tree).every(b=>b.props.disabled));
permission=false;assert.equal(render(13),null);
console.log('Passed: equal-width compact controls, busy states, successful single update, errors, attachment-change/unmount cancellation, and permission gating.');
})().catch(error=>{console.error(error);process.exitCode=1;});
