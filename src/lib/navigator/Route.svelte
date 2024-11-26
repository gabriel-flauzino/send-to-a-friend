<script lang="ts">
	import { navigation } from './Navigator.svelte';
	const {
    children,
		path,
    stack = false
	}: {
		path: string;
		children: any;
    stack?: boolean;
	} = $props();

	let rendered = $state(false);
  let displayed = $state(false);

	$inspect(navigation.currentPathname).with(() => {
		if (new RegExp(path, 'g').test(navigation.currentPathname)) {
      rendered = true;
      displayed = true;
    } else {
      displayed = false;
    }
	});
</script>

{#if (stack && rendered) || navigation.currentPathname === path}
	<div class="route" style:--display={displayed ? 'block' : 'none'}>
		{navigation.currentPathname}
		{@render children?.()}
	</div>
{/if}

<style>
	.route {
		display: var(--display, 'none');
	}
</style>
