<script lang="ts">
    const { data } = $props();
</script>

<h1>{data.course.title}</h1>
<div class="raw-html">
    {@html data.course.description}
</div>
