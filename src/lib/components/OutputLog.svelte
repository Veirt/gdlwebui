<script lang="ts">
	export let outputElement: HTMLDivElement;
	export let isScrollToBottomActive = true;
	export let scrollToBottom = (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	export let output: string = '';
</script>

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
	class="overflow-auto overflow-x-scroll p-1 mt-2 h-96 font-mono text-sm whitespace-pre bg-gray-900 rounded"
>
	{output}
</div>
