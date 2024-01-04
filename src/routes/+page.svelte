<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte';
	import { onMount } from 'svelte';

	let isSocketOpen = false;

	let urls = '';

	let error = '';

	let data: { urls: string[] } = {
		urls: []
	};

	let output = '';

	let socket: WebSocket;
	onMount(() => {
		socket = new WebSocket('ws://localhost:8080');
		socket.addEventListener('open', () => {
			isSocketOpen = true;
		});

		socket.addEventListener('message', (event) => {
			console.log(event.data);
			output += event.data;
		});
	});

	function isUrlValid(urls: string) {
		const urlArray = urls.split('\n');

		for (const url of urlArray) {
			if (!url.startsWith('http')) {
				return false;
			}

			data.urls.push(url);
		}

		return true;
	}

	function download() {
		data.urls = [];
		error = '';
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
<main class="flex h-screen justify-around flex-col md:flex-row">
	<section id="input-options" class="w-[40%]">
		{#if error}
			<h1>{error}</h1>
		{/if}
		<form on:submit={download} class="flex flex-col">
			<label class="text-gray-200 mb-2" for="url">URL(s)</label>
			<textarea bind:value={urls} class="bg-gray-700 p-2 rounded" id="url" cols="30" rows="10"
			></textarea>
			<button
				class:loading={!isSocketOpen}
				disabled={!isSocketOpen}
				class="h-full bg-gray-900 p-2 rounded">Download</button
			>
		</form>
	</section>
	<section id="output" class="w-1/2">
		<label class="text-gray-200" for="output">Output</label>
		<div id="output" class="mt-2 bg-gray-900 p-1 rounded h-96 whitespace-pre-line overflow-auto">
			{output}
		</div>
	</section>
</main>
