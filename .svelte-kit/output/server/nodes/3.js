

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/chat/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.DR2orlJT.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/ZyFKe9iZ.js","_app/immutable/chunks/D6YF6ztN.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = [];
export const fonts = [];
