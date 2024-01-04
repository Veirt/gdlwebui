<script lang="ts">
	import NavBar from '$lib/components/NavBar.svelte';
</script>

<NavBar />
<main class="flex h-screen justify-around flex-col md:flex-row">
	<section id="input-options" class="w-[40%]">
		<div class="flex flex-col">
			<label class="text-gray-200 mb-2" for="link">Link</label>
			<textarea class="bg-gray-700 p-2 rounded" id="link" cols="30" rows="10"></textarea>

			<button class="h-full bg-gray-900 p-2 rounded">Download</button>
		</div>
	</section>
	<section id="output" class="w-1/2">
		<label class="text-gray-200" for="output">Output</label>
		<div id="output" class="mt-2 bg-gray-900 p-1 rounded h-96"></div>
	</section>
</main>
