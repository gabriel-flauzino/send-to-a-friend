import type { NativeApp, WindowCache } from '../../Types';
import component from './Component.svelte';
import icon from './icon.png';

export default {
  id: "system.explorer",
  name: 'Explorador',
  type: 'native',
  icon,
	defaults: {
    maximized: true
	},
  component
} as NativeApp;
