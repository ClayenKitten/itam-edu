<script lang="ts">
    let { data } = $props();
</script>

<div class="flex flex-col p-10">
    <header class="flex mb-7">
        <h2>{data.homework.title}</h2>
    </header>
    <div>{data.homework.content}</div>
</div>
