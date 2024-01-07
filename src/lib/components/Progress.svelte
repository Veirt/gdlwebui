<script lang="ts">
	export let progress = { percentage: 0, downloadSpeed: '', downloadedSize: '' };
	export let tweenedPercentage;
</script>

{#if progress.downloadSpeed}
	<div id="progress-bar" class="relative mt-5 h-8 bg-gray-700">
		<p class="text-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
			{progress.percentage}%
		</p>
		<div
			style="width: {$tweenedPercentage}%"
			id="progress-percentage"
			class="h-full bg-gray-900"
		></div>
	</div>
	<p class="text-xl">Downloaded: {progress.downloadedSize}</p>
	<p class="text-xl">Speed: {progress.downloadSpeed}</p>
{/if}
