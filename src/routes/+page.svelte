<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { dev } from '$app/environment';
	import NavBar from '$lib/components/NavBar.svelte';
	import UrlInput from '$lib/components/URLInput.svelte';
	import Error from '$lib/components/Error.svelte';
	import OutputLog from '$lib/components/OutputLog.svelte';
	import Progress from '$lib/components/Progress.svelte';

	let isSocketOpen = false;

	type Data = {
		output?: string;
		progress?: string;
		error?: string;
	};

	let error = '';
	let output = '';

	let progress = {
		percentage: 0,
		downloadedSize: '',
		downloadSpeed: ''
	};

	let tweenedPercentage = tweened(0);
	$: if (browser) tweenedPercentage.set(progress.percentage);

	let outputElement: HTMLDivElement;
	let isScrollToBottomActive = true;
	let scrollToBottom: (node: HTMLDivElement) => void;

	let socket: WebSocket;
	onMount(() => {
		let websocketUrl;
		if (dev) {
			websocketUrl = 'ws://localhost:8080';
		} else {
			websocketUrl = `ws://${window.location.hostname}/ws`;
		}
		socket = new WebSocket(websocketUrl);
		socket.addEventListener('error', () => {
			error = "Can't connect to the server.";
			return;
		});
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

	function download(e: CustomEvent<{ urls: string }>) {
		progress = { percentage: 0, downloadSpeed: '', downloadedSize: '' };

		const message = {
			action: 'download',
			data: {
				urls: e.detail.urls.split('\n')
			}
		};

		socket.send(JSON.stringify(message));
	}
</script>

<NavBar />
<main class="flex flex-col items-center md:flex-row md:justify-around md:items-start">
	<section class="w-[90%] md:w-[40%]">
		{#if error}
			<Error bind:message={error} />
		{/if}
		<UrlInput on:download={download} bind:error {isSocketOpen} on:submit={download} />
	</section>

	<section id="output" class="w-[90%] my-5 md:mt-0 md:w-1/2">
		<OutputLog bind:outputElement bind:isScrollToBottomActive bind:scrollToBottom {output} />
		<Progress bind:progress bind:tweenedPercentage />
	</section>
</main>
