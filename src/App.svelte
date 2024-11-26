<script lang="ts">
	import Window from './lib/Window.svelte';
	import svelteLogo from './assets/svelte.svg';
	import { v4 } from 'uuid';
	import _ from 'lodash';
	import type { APIs, App, WindowCache } from './lib/Types';
	import Calculator from './lib/apps/system.calculator';
	import Explorer from './lib/apps/system.explorer';
	import DevTests from './lib/apps/system.devtests';
	import Cube from 'carbon-icons-svelte/lib/Cube.svelte';
	import { onMount } from 'svelte';

	let windowCache = $state<{
		[appId: string]: WindowCache;
	}>({});

	let apps = $state<{ [k: string]: App }>({
		svelte: {
			id: 'svelte',
			name: 'Svelte',
			icon: svelteLogo,
			type: 'url',
			url: 'https://svelte.dev'
		},
		conexo: {
			id: 'conexo',
			name: 'Conexo',
			icon: 'https://conexo.ws/favicon.ico',
			type: 'url',
			url: 'https://conexo.ws'
		},
		termo: {
			id: 'termo',
			name: 'Termo',
			icon: 'https://term.ooo/icon.png',
			type: 'url',
			url: 'https://term.ooo'
		},
		explorer: Explorer,
		calculator: Calculator,
    devtests: DevTests
	});

	let windows = $state<{
		[k: string]: {
			id: string;
			app: App;
			minimize?: Function;
      isMinimized?: Function;
      toolbarIcon?: HTMLElement;
      getIconRect(): DOMRect | undefined;
		};
	}>({});

	let zIndexes: string[] = $state([]);

	/* let desktop: HTMLElement; */

	let apis: APIs = {
		openWindow(app: App) {
			const uuid = v4();

			zIndexes.push(uuid);

			windows[uuid] = {
				id: uuid,
				app,
        getIconRect() {
            return this.toolbarIcon?.getBoundingClientRect?.();
        },
			};
		},

		saveWindowCache(app: App, props: (typeof windowCache)[0]) {
			windowCache[app.id] = _.defaultsDeep({}, props, windowCache[app.id]);
		},

		getWindowCache(app: App) {
			return windowCache[app.id];
		},

		/* get desktop() {
			return desktop?.getBoundingClientRect?.();
		} */
	};

	function setFocus(id: string) {
		let newZIndexes = zIndexes.filter((x) => x !== id);
		newZIndexes.push(id);
		zIndexes = newZIndexes;
	}
</script>

<main>
	<div class="desktop" bind:contentRect={apis.desktop}>
		<h1>Navigator</h1>
		<div class="apps-list">
			{#each _.entries(apps) as [id, app] (id)}
				<button
					class="app-lauch"
					title={(app.description || '') + (app.type === 'url' ? '\n\n' + app.url : '')}
					ondblclick={() => apis.openWindow(app)}
					onpointerup={(ev) => ev.pointerType === 'touch' && apis.openWindow(app)}
				>
					<div class="app-icon">
						<img draggable="false" src={app.icon} alt="{app.name} Icon" />
					</div>
					<span>{app.name}</span>
				</button>
			{/each}
		</div>

		{#each _.values(windows) as window (window.id)}
			<Window
				focused={zIndexes[zIndexes.length - 1] === window.id}
				onkill={() => {
					delete windows[window.id];
					zIndexes = zIndexes.filter((x) => x !== window.id);
				}}
				onfocus={() => setFocus(window.id)}
				zIndex={zIndexes.indexOf(window.id)}
				windowData={window}
				app={window.app}
				bind:minimize={windows[window.id].minimize}
				bind:isMinimized={windows[window.id].isMinimized}
				{apis}
			></Window>
		{/each}
	</div>
	<div class="toolbar">
		<button class="toolbar-button menu-button" title="Menu">
			<Cube style="width: 100%; height: 100%;" />
		</button>

		{#each _.values(windows) as window (window.id)}
			<button
				class="toolbar-button app-button"
				class:app-focused={zIndexes.indexOf(window.id) === zIndexes.length - 1}
				onclick={() => {
          let index = zIndexes.indexOf(window.id);

          if (index === zIndexes.length - 1 || window.isMinimized?.()) {
            let minimized = window.minimize?.();
            if (minimized) {
              setFocus(zIndexes[index - 1]);
            } else {
              setFocus(window.id);
            }
          } else {
            setFocus(window.id);
          }
				}}
				title={window.app.name}
				bind:this={windows[window.id].toolbarIcon}
			>
				<img src={window.app.icon} alt="{window.app.name}'s Icon" draggable="false" />
			</button>
		{/each}
	</div>
</main>

<style>
	main {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.desktop {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;

		& .apps-list {
			display: flex;
			align-items: flex-start;
			flex-wrap: wrap;
			gap: 10px;

			& .app-lauch {
				display: flex;
				flex-direction: column;
				width: 80px;
				padding: 5px;
				gap: 3px;
				align-items: center;
				text-align: center;

				&:focus,
				&:hover {
					outline: 1px rgb(212, 232, 255) dotted;
					background-color: rgba(177, 211, 250, 0.26);
				}

				&:hover:is(:focus) {
					background-color: rgba(149, 180, 216, 0.26);
				}

				& .app-icon {
					width: 46px;
					height: 46px;
					pointer-events: none;

					& img {
						width: 100%;
						padding: 5px;
					}
				}

				& span {
					pointer-events: none;
					width: fit-content;
					text-overflow: ellipsis;
					overflow: hidden;
					word-break: break-word;
					display: -webkit-box;
					line-clamp: 2;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					line-height: 1.4;

					font-weight: 400;
				}
			}
		}
	}

	.toolbar {
		z-index: 2;
		height: 40px;
		width: 100%;
		background-color: #161616;
		display: flex;

		& button.toolbar-button {
			width: 48px;
			height: 40px;
			padding: 8px 12px;
			transition: 20ms ease-in;
			cursor: default;

			&:hover {
				background-color: rgba(255, 255, 255, 0.08);
			}

			&:active {
				background-color: rgba(255, 255, 255, 0.04);
			}

			&.menu-button {
				margin-right: 3px;
			}

			&.app-button {
				margin-right: 1px;

				& img {
					max-width: 24px; /* Define o tamanho máximo em largura */
					max-height: 24px; /* Define o tamanho máximo em altura */
					width: auto; /* Ajusta automaticamente a largura */
					height: auto; /* Ajusta automaticamente a altura */
				}

				&.app-focused {
					background-color: rgba(255, 255, 255, 0.12);

					&:hover {
						background-color: rgba(255, 255, 255, 0.17);
					}

					&:active {
						background-color: rgba(255, 255, 255, 0.1);
					}
				}
			}
		}
	}
</style>
