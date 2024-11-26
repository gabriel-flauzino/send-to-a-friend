import type { NativeApp } from '../../Types';
import component from './Component.svelte';
import icon from './icon.png';

export default {
  id: "system.calculator",
  name: 'Calculadora',
  type: 'native',
	icon,
	defaults: {
    width: 400,
		hieght: 900
	},
  component
} as NativeApp;
