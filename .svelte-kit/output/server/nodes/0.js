

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BE7w2r8d.js","_app/immutable/chunks/ZyFKe9iZ.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DT-sLACC.js","_app/immutable/chunks/Uz7V07a2.js"];
export const stylesheets = ["_app/immutable/assets/0.M3jRNw9Y.css"];
export const fonts = [];
