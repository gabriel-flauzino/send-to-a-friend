<script lang="ts">
	import SubtractLarge from 'carbon-icons-svelte/lib/SubtractLarge.svelte';
	import Checkbox from 'carbon-icons-svelte/lib/Checkbox.svelte';
	import ShapeIntersect from 'carbon-icons-svelte/lib/ShapeIntersect.svelte';
	import CloseLarge from 'carbon-icons-svelte/lib/CloseLarge.svelte';
	import type { APIs, App } from './Types';
	import Vibrant from 'node-vibrant';
	import { onMount } from 'svelte';
	import _ from 'lodash';

	let {
		onkill,
		onfocus,
		focused = false,
		app,
		zIndex,
		apis,
		minimize = $bindable(),
		isMinimized = $bindable(),
		windowData,
		...props
	}: {
		[k: string]: any;

		onkill?: () => any;
		onfocus?: () => any;
		focused?: boolean;
		app: App;
		zIndex: number;
		apis: APIs;
	} = $props();

	let windowCache = _.defaultsDeep(apis.getWindowCache(app), {
		x: (apis.desktop?.width || window.innerWidth) / 2 - 600 / 2,
		y: (apis.desktop?.height || window.innerHeight) / 2 - 400 / 2,
		width: 600,
		height: 400,
		maximized: false
	});

	(async () => {
		let vibrant = new Vibrant(app.icon);
		console.log(vibrant);
		let palette = await vibrant.getPalette();
		console.log(palette);
		color = palette.Vibrant?.hex;
	})();

	let x = $state<number>(windowCache.x);
	let y = $state<number>(windowCache.y);
	let width = $state<number>(windowCache.width);
	let height = $state<number>(windowCache.height);
	let color = $state<string | undefined>(undefined);
	let resizingType = $state('');
	let movingWindow = $state(false);
	let minimized = $state(false);
	let maximized = $state<boolean>(windowCache.maximized);
	let dying = $state(false);
	let minimizing = $state(false);
	let maximizing = $state(false);
	let entering = $state(false);
	let started = $state(false);
	let smartResizeActive = $state(false);
	let smartResizingAnim = $state<string[]>([]);
	let recentSide = $state('');
	let iconRect = $state<DOMRect | undefined>(undefined);

	function startFollowingMouse(ev: any) {
		if ((ev.target as HTMLElement).classList[0] !== 'top') {
			return;
		}

		movingWindow = true;

		let clientX: number;
		let clientY: number;
		let offsetX = 0;
		let offsetY = 0;

		if (ev.touches) {
			let touch = ev.touches[0];
			clientX = touch.clientX;
			clientY = touch.clientY;
		} else {
			clientX = ev.clientX;
			clientY = ev.clientY;
		}

		let initialX = x;
		let initialY = y;
		let initialPointerX = clientX;
		let initialPointerY = clientY;

		window.addEventListener('mousemove', onPointerMove);
		window.addEventListener('touchmove', onPointerMove);
		window.addEventListener('mouseup', stopFollowingMouse);
		window.addEventListener('touchend', stopFollowingMouse);

		function onPointerMove(ev: any) {
			if (ev.buttons != undefined && !(ev.buttons & 1)) {
				stopFollowingMouse();
				return;
			}

			if (maximized) {
				maximized = false;
				x = ev.clientX - (width * ev.clientX) / (apis.desktop?.width || window.innerWidth);
				y = ev.clientY - 16;

				initialX = x;
				initialY = y;
			}

			if (ev.touches) {
				let touch = ev.touches[0];
				clientX = touch.clientX;
				clientY = touch.clientY;
			} else {
				clientX = ev.clientX;
				clientY = ev.clientY;
			}

			offsetX = initialPointerX - clientX;
			offsetY = initialPointerY - clientY;

			let resizeAnim: string[] = [];
			let newSide = recentSide;

			if (clientX < 10) {
				resizeAnim.push('left');
				newSide = 'left';
			} else if (clientX > (apis.desktop?.width || window.innerWidth) - 10) {
				resizeAnim.push('right');
				newSide = 'right';
			}

			if (clientX < 15 || clientX > (apis.desktop?.width || window.innerWidth) - 15) {
				if (clientY < 15) {
					resizeAnim.push('top');
				} else if (clientY > (apis.desktop?.height || window.innerHeight) - 15) {
					resizeAnim.push('bottom');
				}
			}

			if (
				clientY < 15 &&
				!smartResizingAnim.includes('right') &&
				!smartResizingAnim.includes('left')
			) {
				resizeAnim.push('full');
				newSide = 'full';
			}

			if (smartResizingAnim.length && !resizeAnim.length) {
				smartResizeActive = false;

				setTimeout(() => {
					smartResizingAnim = resizeAnim;
				}, 100);
			} else {
				smartResizeActive = !!resizeAnim.length;
				recentSide = newSide;

				setTimeout(() => {
					smartResizingAnim = resizeAnim;
				}, 20);
			}

			if (clientX >= 0 && clientX <= (apis.desktop?.width || window.innerWidth)) {
				x = initialX - offsetX;
			}

			if (clientY >= 0 && clientY <= (apis.desktop?.height || window.innerHeight)) {
				y = initialY - offsetY;
			}
		}

		function stopFollowingMouse() {
			movingWindow = false;

			smartResizingAnim = [];
			recentSide = '';

			if (clientX <= 10) {
				x = 0;
				width = (apis.desktop?.width || window.innerWidth) / 2;
				adjustHeight();
			} else if (clientX >= (apis.desktop?.width || window.innerWidth) - 10) {
				x = (apis.desktop?.width || window.innerWidth) / 2;
				width = (apis.desktop?.width || window.innerWidth) / 2;
				adjustHeight();
			}

			if (
				clientY < 15 &&
				clientX > 10 &&
				clientX < (apis.desktop?.width || window.innerWidth) - 10
			) {
				toggleMaximize();
			}

			function adjustHeight() {
				if (clientY < 15) {
					height = (apis.desktop?.height || window.innerHeight) / 2;
					y = 0;
				} else if (clientY > (apis.desktop?.height || window.innerHeight) - 15) {
					height = (apis.desktop?.height || window.innerHeight) / 2;
					y = (apis.desktop?.height || window.innerHeight) - height;
				} else {
					height = apis.desktop?.height || window.innerHeight;
					y = 0;
				}
			}

			window.removeEventListener('mousemove', onPointerMove);
			window.removeEventListener('touchmove', onPointerMove);
			window.removeEventListener('mouseup', stopFollowingMouse);
			window.removeEventListener('touchend', stopFollowingMouse);
			y = Math.max(y, 0);
		}
	}

	function startResizing(ev: any) {
		let clientX: number;
		let clientY: number;

		if (ev.touches) {
			let touch = ev.touches[0];
			clientX = touch.clientX;
			clientY = touch.clientY;
		} else {
			clientX = ev.clientX;
			clientY = ev.clientY;
		}

		let initialX = x;
		let initialY = y;
		let initialWidth = width;
		let initialHeight = height;
		let initialPointerX = clientX;
		let initialPointerY = clientY;

		resizingType = (ev.target as HTMLElement).classList[1];
		window.addEventListener('mousemove', onResize);
		window.addEventListener('mouseup', stopResizing);
		window.addEventListener('touchmove', onResize);
		window.addEventListener('touchend', stopResizing);

		function onResize(ev: any) {
			if (ev.buttons != undefined && !(ev.buttons & 1)) {
				stopResizing();
				return;
			}

			let clientX: number;
			let clientY: number;

			if (ev.touches) {
				let touch = ev.touches[0];
				clientX = touch.clientX;
				clientY = touch.clientY;
			} else {
				clientX = ev.clientX;
				clientY = ev.clientY;
			}

			let movementX = -(initialPointerX - clientX);
			let movementY = -(initialPointerY - clientY);

			let newX = x;
			let newY = y;
			let newWidth = width;
			let newHeight = height;

			switch (resizingType) {
				case 'resize-top':
					newY = initialY + movementY;
					newHeight = initialHeight - movementY;
					break;

				case 'resize-right':
					newWidth = initialWidth + movementX;
					break;

				case 'resize-bottom':
					newHeight = initialHeight + movementY;
					break;

				case 'resize-left':
					newX = initialX + movementX;
					newWidth = initialWidth - movementX;
					break;

				case 'resize-top-left':
					newX = initialX + movementX;
					newY = initialY + movementY;
					newWidth = initialWidth - movementX;
					newHeight = initialHeight - movementY;
					break;

				case 'resize-top-right':
					newY = initialY + movementY;
					newHeight = initialHeight - movementY;
					newWidth = initialWidth + movementX;
					break;

				case 'resize-bottom-left':
					newX = initialX + movementX;
					newWidth = initialWidth - movementX;
					newHeight = initialHeight + movementY;
					break;

				case 'resize-bottom-right':
					newWidth = initialWidth + movementX;
					newHeight = initialHeight + movementY;
					break;
			}

			if (
				newWidth >= 300 &&
				newX >= 0 &&
				newX + newWidth <= (apis.desktop?.width || window.innerWidth)
			) {
				x = newX;
				width = newWidth;
			}

			if (
				newHeight >= 32 &&
				newY >= 0 &&
				newY + newHeight <= (apis.desktop?.height || window.innerHeight)
			) {
				y = newY;
				height = newHeight;
			}
		}

		function stopResizing() {
			resizingType = '';
			window.removeEventListener('mousemove', onResize);
			window.removeEventListener('mouseup', stopResizing);
			window.removeEventListener('touchmove', onResize);
			window.removeEventListener('touchend', stopResizing);
		}
	}

	let minTimeout;

	minimize = function toggleMinimize() {
		iconRect = windowData.getIconRect();

		minimizing = true;
		minimized = !minimized;

		clearTimeout(minTimeout);

		minTimeout = setTimeout(() => {
			minimizing = false;
		}, 200);

    return minimized;
	};

  isMinimized = function isMinimized() {
    return minimized;
  }

	function toggleMaximize() {
		maximized = !maximized;
		maximizing = true;

		setTimeout(() => {
			maximizing = false;
		}, 120);
	}

	function killWindow() {
		dying = true;

		apis.saveWindowCache(app, {
			x,
			y,
			width,
			height,
			maximized
		});

		setTimeout(() => {
			onkill?.();
		}, 200);
	}

	function completeLoading() {
		if (started) {
			return;
		}

		started = true;
		entering = true;

		setTimeout(() => {
			entering = false;
		}, 200);
	}

	onMount(() => {
		if (app.type === 'native') {
			completeLoading();
		}
	});
</script>

<div
	class="window"
	class:blocked={dying || minimizing || maximizing || entering || !started}
	class:minimizing
	class:maximizing
	class:dying
	class:entering
	class:focused
	class:maximized
	class:min-enter={minimized}
	class:min-leave={!minimized && minimizing}
	style:--theme-color={color}
	style:display={started ? 'block' : 'none'}
	style:--x={x + 'px'}
	style:--y={y + 'px'}
	style:--width={width + 'px'}
	style:--height={height + 'px'}
	style:--icon-x={Math.min(maximized ? 0 : x, iconRect?.x || 0) + 'px'}
	style:--icon-y={Math.max((maximized ? 0 : y) + height, iconRect?.y || 0) + 'px'}
	style:z-index={zIndex}
	onpointerdown={() => !focused && onfocus?.()}
	role="button"
	tabindex="-1"
	{...props}
>
	<div class="container">
		<div
			class="top"
			role="button"
			tabindex="-1"
			onmousedown={startFollowingMouse}
			ontouchstart={startFollowingMouse}
			ondblclick={toggleMaximize}
		>
			<div class="info">
				<div class="icon">
					<img draggable="false" src={app.icon} alt="Svelte Logo" />
				</div>
				<span class="title">{app.longName || app.name}</span>
			</div>
			<div class="actions">
				<button class="action minimize" onclick={minimize}>
					<SubtractLarge style="width: 100%; height: 100%;" />
				</button>
				<button class="action maximize" onclick={toggleMaximize}>
					{#if maximized}
						<ShapeIntersect style="width: 100%; height: 100%;" />
					{:else}
						<Checkbox style="width: 100%; height: 100%;" />
					{/if}
				</button>
				<button class="action close" onclick={killWindow}>
					<CloseLarge style="width: 100%; height: 100%;" />
				</button>
			</div>
		</div>
		<div class="content">
			{#if app.type === 'url'}
				<iframe
					title={app.name}
					src={app.url}
					style:display={maximizing ? 'none' : 'block'}
					style:pointer-events={resizingType || movingWindow || !focused ? 'none' : ''}
					width="100%"
					height="100%"
					frameborder="0"
					onload={completeLoading}
				></iframe>
			{:else}
				<app.component />
			{/if}
		</div>
	</div>
	<div
		class="resize resize-top"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div
		class="resize resize-right"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div
		class="resize resize-bottom"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div
		class="resize resize-left"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div
		class="resize resize-top-left"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div
		class="resize resize-top-right"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div
		class="resize resize-bottom-left"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div
		class="resize resize-bottom-right"
		role="button"
		tabindex="-1"
		onmousedown={startResizing}
		ontouchstart={startResizing}
	></div>
	<div class="resize smart-resizing-container">
		<div
			class="smart-resizing-frame"
			class:prepare-left={recentSide === 'left'}
			class:prepare-right={recentSide === 'right'}
			class:prepare-full={recentSide === 'full'}
			class:resize-active={smartResizeActive}
			class:resize-animate={!!smartResizingAnim.length}
			class:resize-left={smartResizingAnim.includes('left')}
			class:resize-right={smartResizingAnim.includes('right')}
			class:resize-top={smartResizingAnim.includes('top')}
			class:resize-bottom={smartResizingAnim.includes('bottom')}
			class:resize-full={smartResizingAnim.includes('full')}
		></div>
	</div>
</div>

<style>
	@keyframes fadeInAndOut {
		0% {
			opacity: 1;
			scale: 1;
		}

		100% {
			opacity: 0;
			scale: 0.9;
		}
	}

	@keyframes resizeLeft {
		0% {
			top: 50%;
			left: 0;
			width: 0;
			height: 0;
		}

		100% {
			top: 0;
			left: 0;
			width: 50%;
			height: 100%;
		}
	}

	@keyframes FadeOut {
		0% {
			opacity: 1;
		}

		99% {
			opacity: 0;
		}

		100% {
			opacity: 0;
			display: none;
		}
	}

	@keyframes MinimizeEnter {
		0% {
			left: var(--x);
			top: var(--y);
			opacity: 1;
			scale: 1;
		}

		70% {
			opacity: 0;
			scale: 0.6;
		}

		100% {
			left: var(--icon-x, 0) !important;
			top: calc(var(--icon-y, 0) - var(--height)) !important;
			opacity: 0;
			scale: 0.6;
		}
	}

	@keyframes MinimizeLeave {
		0% {
			left: var(--icon-x, 0) !important;
			top: calc(var(--icon-y, 0) - var(--height)) !important;
			opacity: 0;
			scale: 0;
		}

		70% {
			opacity: 0;
			scale: 0.6;
		}

		100% {
			left: var(--x);
			top: var(--y);
			opacity: 1;
			scale: 1;
		}
	}

	.window {
		position: absolute;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
		left: var(--x);
		top: var(--y);
		width: var(--width);
		height: var(--height);

		&:focus {
			outline: none;
		}

		&.focused {
			outline: 1px solid var(--theme-color, #161616);

			& .container .top {
				color: white;

				background-color: var(--theme-color, #161616);
			}
		}

		&.dying {
			animation: fadeInAndOut ease-in 200ms forwards;
		}

		&.entering {
			animation: fadeInAndOut ease-in 200ms forwards reverse;
		}

		&.maximizing {
			transition: 120ms cubic-bezier(0, 1, 0, 1);
		}

		&.minimizing {
			transform-origin: left bottom;
		}

		&.maximized {
			width: 100% !important;
			height: 100% !important;
			left: 0 !important;
			top: 0 !important;
			border: none !important;
		}

		&.min-enter {
			animation: MinimizeEnter 200ms ease-out forwards;
		}

		&.min-leave {
			animation: MinimizeLeave 200ms ease-out forwards;
		}

		&.min-enter:not(.minimizing) {
			display: none;
		}

		&.blocked {
			pointer-events: none;
		}

		& .container {
			display: flex;
			flex-direction: column;
			overflow: hidden;
			width: 100%;
			height: 100%;

			& .top {
				display: flex;
				align-items: center;
				justify-content: space-between;
				background-color: #202020;
				color: rgb(179, 179, 179);

				&:focus {
					outline: none;
				}

				& .info {
					display: flex;
					align-items: center;
					pointer-events: none;
					gap: 0.4rem;

					& .icon {
						display: flex;
						align-items: center;
						justify-content: center;
						width: 20px;
						height: 20px;
						margin-left: 8px;
						border-radius: 50%;
						background-color: white;
						border-radius: 50%;
						padding: 3px;

						& img {
							width: 100%;
							height: 100%;
						}
					}

					& .title {
						pointer-events: none;
						width: fit-content;
						text-overflow: ellipsis;
						overflow: hidden;
						word-break: break-word;
						display: -webkit-box;
						line-clamp: 1;
						-webkit-line-clamp: 1;
						-webkit-box-orient: vertical;
						line-height: 1.4;
						margin: 0;
						color: inherit;
					}
				}

				& .actions {
					display: flex;

					& .action {
						width: 48px;
						height: 32px;
						padding: 6px 0;
						color: inherit;

						&.maximize {
							padding: 7px 0 9px;
						}
					}

					& .action:hover {
						background-color: #0000001f;
					}

					& .action:focus {
						outline: none;
					}

					& .close:hover {
						background-color: rgb(252, 40, 40);
					}
				}
			}

			& .content {
				position: relative;
				width: 100%;
				height: 100%;
				container-type: inline-size;
				overflow: hidden;
				background-color: black;
			}
		}

		& .resize {
			position: absolute;

			&.resize-top,
			&.resize-bottom {
				cursor: n-resize;
			}

			&.resize-left,
			&.resize-right {
				cursor: e-resize;
			}

			&.resize-top-left,
			&.resize-bottom-right {
				cursor: nw-resize;
			}

			&.resize-top-right,
			&.resize-bottom-left {
				cursor: ne-resize;
			}

			&.resize-top {
				top: -4px;
				left: 0;
				width: 100%;
				height: 4px;
			}

			&.resize-right {
				top: 0;
				right: -4px;
				width: 4px;
				height: 100%;
			}

			&.resize-bottom {
				bottom: -4px;
				left: 0;
				width: 100%;
				height: 4px;
			}

			&.resize-left {
				top: 0;
				left: -4px;
				width: 4px;
				height: 100%;
			}

			&.resize-top-left {
				top: -5px;
				left: -5px;
				width: 8px;
				height: 8px;
			}

			&.resize-top-right {
				top: -5px;
				right: -5px;
				width: 8px;
				height: 8px;
			}

			&.resize-bottom-left {
				bottom: -5px;
				left: -5px;
				width: 8px;
				height: 8px;
			}

			&.resize-bottom-right {
				bottom: -5px;
				right: -5px;
				width: 8px;
				height: 8px;
			}

			&.smart-resizing-container {
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: calc(100% - 40px);
				z-index: -1;
				pointer-events: none;

				& .smart-resizing-frame {
					position: absolute;
					top: 50%;
					translate: -50%;
					width: 0;
					height: 0;
					border: 1px solid rgba(255, 255, 255, 0.07);
					box-shadow: 0 2px 4px rgba(22, 22, 22, 0.7);
					background-color: rgba(255, 255, 255, 0.03);
					animation: FadeOut 100ms ease-in;

					&.prepare-left,
					&.prepare-right,
					&.prepare-full {
						translate: unset;
					}

					&.prepare-left {
						left: 5px;
					}

					&.prepare-right {
						left: calc(100% - 5px);
					}

					&.prepare-full {
						top: 5px;
						left: 50%;
					}

					&.resize-active {
						animation: none;
					}

					&.resize-animate {
						transition: 100ms ease-in;
					}

					&.resize-left,
					&.resize-right {
						top: 5px;
						left: 5px;
						width: calc(50% - 5px);
						height: calc(100% - 10px);
					}

					&.resize-right {
						left: 50%;
					}

					&.resize-top,
					&.resize-bottom {
						height: calc(50% - 5px);
					}

					&.resize-bottom {
						top: 50%;
					}

					&.resize-full {
						visibility: visible;
						translate: unset;
						left: 5px;
						width: calc(100% - 10px);
						height: calc(100% - 10px);
					}
				}
			}
		}
	}
</style>
