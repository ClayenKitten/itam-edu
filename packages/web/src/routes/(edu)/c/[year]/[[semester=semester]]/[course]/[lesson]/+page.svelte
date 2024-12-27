<script lang="ts">
    const { data } = $props();
</script>

<h1>{data.lesson.title}</h1>
<div class="raw-html">
    {@html data.lesson.content}
</div>
