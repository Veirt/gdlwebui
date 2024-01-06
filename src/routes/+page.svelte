<script lang="ts">
	import { browser } from '$app/environment';
	import NavBar from '$lib/components/NavBar.svelte';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';

	let isSocketOpen = false;

	type Data = {
		output?: string;
		progress?: string;
		error?: string;
	};

	let urls = '';
	let error = '';
	let output = '';

	let progress = {
		percentage: 0,
		downloadedSize: '',
		downloadSpeed: ''
	};

	let tweenedPercentage = tweened(0);
	$: if (browser) tweenedPercentage.set(progress.percentage);

	let data: { urls: string[] } = {
		urls: []
	};

	let outputElement: HTMLDivElement;
	let isScrollToBottomActive = true;
	const scrollToBottom = (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	let socket: WebSocket;
	onMount(() => {
		socket = new WebSocket('ws://localhost:8080');
		socket.addEventListener('open', () => {
			isSocketOpen = true;
		});

		socket.addEventListener('message', (event: MessageEvent<string>) => {
			const data: Data = JSON.parse(event.data);

			if (data.output) {
				output += data.output;
				if (isScrollToBottomActive) {
					requestAnimationFrame(() => scrollToBottom(outputElement));
				}
			}

			if (data.progress) {
				// handle when the data comes many at once
				const splitted = (data.progress as string).split('\n');
				const lastData = splitted[splitted.length - 1].trim();

				const temp = lastData.split(' ').filter((data) => Boolean(data));
				progress.percentage = parseInt(temp[0]);
				progress.downloadedSize = temp[1];
				progress.downloadSpeed = temp[2];
			}

			if (data.error) {
				error = data.error;
			}
		});
	});

	function isUrlValid(urls: string) {
		const urlArray = urls.trimEnd().split('\n');

		for (const url of urlArray) {
			// regex to validate url
			if (!url.match(/(\w+:)?http?s:\/\/.*/)) return false;

			data.urls.push(url.trim());
		}

		return true;
	}

	function download() {
		data.urls = [];
		error = '';
		progress = { percentage: 0, downloadSpeed: '', downloadedSize: '' };
		if (!isUrlValid(urls)) {
			error = 'URL(s) is not valid.';
			return;
		}

		const message = {
			action: 'download',
			data
		};

		socket.send(JSON.stringify(message));
	}
</script>

<NavBar />
<main class="flex justify-around flex-col md:flex-row">
	<section id="input-options" class="w-[40%]">
		{#if error}
			<div class="bg-red-800 p-1 rounded flex justify-between">
				<p>{error}</p>
				<button on:click={() => (error = '')}>
					<svg
						class="fill-white cursor-pointer"
						xmlns="http://www.w3.org/2000/svg"
						width="24px"
						height="24px"
						viewBox="0 0 24 24"
						><g>
							<path
								d="M9.525,13.765c-0.46,0.46,0.25,1.17,0.71,0.71c0.59-0.59,1.175-1.18,1.765-1.76l1.765,1.76
                    c0.46,0.46,1.17-0.25,0.71-0.71c-0.59-0.58-1.18-1.175-1.76-1.765c0.41-0.42,0.82-0.825,1.23-1.235c0.18-0.18,0.35-0.36,0.53-0.53
                    c0.45-0.46-0.25-1.17-0.71-0.71L12,11.293l-1.765-1.768c-0.46-0.45-1.17,0.25-0.71,0.71L11.293,12L9.525,13.765z"
							/>
							<path
								d="M12,21.933c-5.478,0-9.934-4.456-9.934-9.933S6.522,2.067,12,2.067S21.934,6.523,21.934,12
                    S17.478,21.933,12,21.933z M12,3.067c-4.926,0-8.934,4.007-8.934,8.933S7.074,20.933,12,20.933s8.934-4.007,8.934-8.933
                    S16.926,3.067,12,3.067z"
							/>
						</g></svg
					>
				</button>
			</div>
		{/if}
		<form on:submit={download} class="flex flex-col">
			<label class="text-gray-200 mb-2 p-1" for="url">URL(s)</label>
			<textarea bind:value={urls} class="bg-gray-700 p-2 rounded" id="url" cols="30" rows="10"
			></textarea>
			<button
				class:loading={!isSocketOpen}
				disabled={!isSocketOpen}
				class:cursor-not-allowed={!isSocketOpen}
				class="h-full bg-gray-900 p-2 rounded">Download</button
			>
		</form>
	</section>
	<section id="output" class="w-1/2">
		<div class="flex justify-between">
			<label class="text-gray-200" for="output">Output</label>
			<button
				class:bg-green-800={isScrollToBottomActive}
				class:bg-gray-600={!isScrollToBottomActive}
				on:click={() => {
					isScrollToBottomActive = !isScrollToBottomActive;
					if (isScrollToBottomActive) scrollToBottom(outputElement);
				}}
				class="p-1 px-2 rounded">Scroll to Bottom</button
			>
		</div>
		<div
			bind:this={outputElement}
			id="output"
			class="mt-2 bg-gray-900 p-1 rounded h-96 whitespace-pre overflow-auto overflow-x-scroll font-mono text-sm"
		>
			{output}
		</div>
		{#if progress.downloadSpeed}
			<div id="progress-bar" class="mt-5 bg-gray-700 h-8 relative">
				<p class="text-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
					{progress.percentage}%
				</p>
				<div
					style="width: {$tweenedPercentage}%"
					id="progress-percentage"
					class="bg-gray-900 h-full"
				></div>
			</div>
			<p class="text-xl">Downloaded: {progress.downloadedSize}</p>
			<p class="text-xl">Speed: {progress.downloadSpeed}</p>
		{/if}
	</section>
</main>
