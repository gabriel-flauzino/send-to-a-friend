export interface BaseApp {
  id: string;
  name: string;
	longName?: string;
	description?: string;
	icon: string;
	type: 'url' | 'native';
	defaults?: WindowCache;
}

export interface URLApp extends BaseApp {
	type: 'url';
	url: string;
}

export interface NativeApp extends BaseApp {
	type: 'native';
  component: any;
}

export type App = URLApp | NativeApp;

export interface WindowCache {
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		maximized?: boolean;
}

export interface APIs {
	openWindow(app: App): void;
	saveWindowCache(
		app: App,
		props: WindowCache
	): void;

	getWindowCache(app: App): WindowCache;

	/* get desktop(): DOMRect | undefined; */
  desktop?: DOMRect;
}
