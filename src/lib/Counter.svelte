<script lang="ts">
	let count: number = $state(0);
	let showThing = $state(false);
	let set = $state(false);
	const increment = () => {
		count += 1;

		if (count >= 10) {
			setTimeout(() => {
				showThing = true;

				setInterval(() => (set = !set), 500);
			}, 1000);
		}
	};
</script>

<div class="container">
	{#if count < 10}
		<button onclick={increment}>
			count is {count}
		</button>
	{:else if showThing}
		<h1 class="bg">
			🎉🎉🎉🎉🎉🎉🎉<br />
			🎉🎉🎉🎉🎉🎉🎉<br />
			🎉🎉🎉🎉🎉🎉🎉<br />
			🎉🎉🎉🎉🎉🎉🎉<br />
			🎉🎉🎉🎉🎉🎉🎉<br />
			🎉🎉🎉🎉🎉🎉🎉
		</h1>
		<h1 class="thing" class:set>PARABENS PARA O MELHOR PAI DO MUNDO</h1>
	{/if}
</div>

<style>
	.container {
		width: 100%;
	}

	button {
		padding: 15px;
	}

	.thing {
		position: absolute;
		left: 50%;
		translate: -50%;
		z-index: 2;
		font-family: 'Comic Sans MS';
		font-weight: 900;
	}

	.thing.set {
		color: rgb(58, 58, 245);
	}

	.bg {
		z-index: 1;
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		width: 100%;
		rotate: 45deg;
		line-height: 2;
		letter-spacing: 40px;
	}
</style>
