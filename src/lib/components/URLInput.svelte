<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let urls: string = '';

	export let error: string;
	export let isSocketOpen: boolean;

	function isUrlValid(urls: string) {
		const urlArray = urls.trimEnd().split('\n');

		for (const url of urlArray) {
			// regex to validate url
			if (!url.match(/(\w+:)?http?s:\/\/.*/)) return false;
		}

		return true;
	}

	function handleSubmit() {
		error = '';
		if (!isUrlValid(urls)) {
			error = 'URL(s) is not valid.';
			return;
		}

		dispatch('download', { urls });
	}
</script>

<form on:submit={handleSubmit} class="flex flex-col">
	<label class="p-1 mb-2 text-gray-200" for="url">URL(s)</label>
	<textarea bind:value={urls} class="p-2 bg-gray-700 rounded" id="url" cols="30" rows="10"
	></textarea>
	<button
		disabled={!isSocketOpen}
		class:loading={!isSocketOpen}
		class:cursor-not-allowed={!isSocketOpen}
		class="p-2 h-full bg-gray-900 rounded">Download</button
	>
</form>
