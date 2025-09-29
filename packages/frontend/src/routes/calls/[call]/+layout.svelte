<script lang="ts">
    import type { LayoutProps } from "./$types";

    import "./calls.css";

    let { children }: LayoutProps = $props();
</script>

<div class="contents" data-page-scope="calls">
    {@render children()}
</div>
