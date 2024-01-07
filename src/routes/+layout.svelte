<script lang="ts">
	import '../app.css';
</script>

<slot />

<style lang="postcss">
	:global(body) {
		background: theme(colors.gray.800);
		color: theme(colors.white);
	}
</style>
