
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/messages" | "/chat" | "/contacts" | "/database" | "/groups" | "/settings";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/messages": Record<string, never>;
			"/chat": Record<string, never>;
			"/contacts": Record<string, never>;
			"/database": Record<string, never>;
			"/groups": Record<string, never>;
			"/settings": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/messages" | "/api/messages/" | "/chat" | "/chat/" | "/contacts" | "/contacts/" | "/database" | "/database/" | "/groups" | "/groups/" | "/settings" | "/settings/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}