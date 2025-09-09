<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { coursePath } from "$lib/path";
    import { doOnce } from "$lib/utils/doOnce";

    export function show() {
        dialog.showModal();
    }
    let dialog: HTMLDialogElement;

    let title: string = $state("");
    let slug: string = $state("");
    let year: number = $state(new Date().getFullYear());
    let semester: "autumn" | "spring" = $state(
        new Date().getMonth() <= 4 || new Date().getMonth() === 11
            ? "spring"
            : "autumn"
    );

    const minSlugLength = 3;
    const maxSlugLength = 24;
    const maxTitleLength = 32;

    let autoSlug = $derived.by(() => {
        // prettier-ignore
        const translitMap: Record<string, string> = {
            а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
            ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
            н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
            ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
            ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
        };

        let slug = title
            .toLowerCase()
            .split("")
            .map(ch => translitMap[ch] ?? ch) // Transliterate Russian letters
            .join("")
            .replace(/[^a-z0-9]+/g, "-") // Replace non-allowed characters with dash
            .replace(/^-+|-+$/g, "") // Trim leading/trailing dashes
            .replace(/--+/g, "-"); // Collapse multiple dashes

        if (slug.length !== 0 && slug.length < minSlugLength) {
            slug = slug + "-course";
        } else if (slug.length > maxSlugLength) {
            slug = slug.slice(0, maxSlugLength).replace(/^-+|-+$/g, "");
        }

        return slug;
    });

    const valid = $derived(
        title.length > 0 &&
            title.length <= maxTitleLength &&
            (slug.length === 0 ||
                (slug.length >= minSlugLength &&
                    slug.length <= maxSlugLength)) &&
            year >= 2000
    );

    async function createCourse() {
        const result = await api({ fetch }).courses.post({
            title,
            slug: slug.length > 0 ? slug : autoSlug,
            year,
            semester
        });
        if (result.error) {
            if (result.status === 409) {
                alert(
                    "Курс с таким идентификатором, годом и семестром уже существует."
                );
            } else {
                alert(result.error.status);
            }
            return;
        }
        await Promise.all([invalidate("app:courses"), invalidate("app:user")]);
        await goto(coursePath(result.data));
    }
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-5 w-150 px-10 pt-10 pb-12.5 m-auto text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    bind:this={dialog}
>
    <header class="flex flex-col">
        <button
            class="self-end flex justify-center items-center h-8 w-8 border border-primary rounded-[8px]"
            aria-label="Закрыть"
            onclick={() => dialog.close()}
        >
            <i class="ph ph-x text-[12.5px]"></i>
        </button>
        <h2 class="self-center">Новый курс</h2>
    </header>
    <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-1">
            <span>Название</span>
            <input
                class="input"
                bind:value={title}
                minlength={1}
                maxlength={maxTitleLength}
                required
                placeholder={'Например, "Бекенд на Python"'}
            />
        </label>
        <section class="flex gap-4">
            <label class="flex-1 flex flex-col gap-1">
                <span>Идентификатор</span>
                <input
                    class="input"
                    onbeforeinput={e => {
                        if (e.data && !/^[a-zA-Z0-9- ]+$/.test(e.data)) {
                            e.preventDefault();
                        }
                    }}
                    bind:value={slug}
                    oninput={() => {
                        slug = slug.replaceAll(" ", "-").toLowerCase();
                    }}
                    minlength={minSlugLength}
                    maxlength={maxSlugLength}
                    placeholder={autoSlug || "python"}
                />
            </label>
            <label class="flex flex-col gap-1">
                <span>Год</span>
                <input
                    class="input"
                    type="number"
                    step={1}
                    min={2000}
                    max={new Date().getFullYear() + 10}
                    required
                    bind:value={year}
                />
            </label>
            <label class="flex flex-col gap-1">
                <span>Семестр</span>
                <select class="input" bind:value={semester}>
                    <option value={"autumn"}>Осень</option>
                    <option value={"spring"}>Весна</option>
                </select>
            </label>
        </section>
        <button
            class="btn big"
            disabled={!valid}
            onclick={doOnce("createCourse", createCourse)}
        >
            Создать курс
        </button>
    </div>
</dialog>
