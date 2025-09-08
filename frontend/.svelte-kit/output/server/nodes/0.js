

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.RvGsVHrN.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/DbVienwh.js","_app/immutable/chunks/CPPbwToL.js","_app/immutable/chunks/mMo-1mwx.js","_app/immutable/chunks/BHg-NSlc.js","_app/immutable/chunks/DDa8g7bR.js","_app/immutable/chunks/E-bCMokw.js"];
export const stylesheets = ["_app/immutable/assets/0.7hhRj-ao.css"];
export const fonts = [];
