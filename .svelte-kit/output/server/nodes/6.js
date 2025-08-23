

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/settings/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.gj7E_eyy.js","_app/immutable/chunks/C1FmrZbK.js","_app/immutable/chunks/ZyFKe9iZ.js","_app/immutable/chunks/IHki7fMi.js"];
export const stylesheets = [];
export const fonts = [];
