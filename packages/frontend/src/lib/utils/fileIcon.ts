/** Returns PhosphorIcon icon name based on filename. */
export function getFileIcon(filename: string) {
    const ext = filename.split(".").pop();
    if (!ext) return "file";
    return (iconsByExtension as Record<string, string>)[ext] ?? "file";
}

const iconsByExtension = {
    // Media
    png: "file-png",
    jpg: "file-jpg",
    jpeg: "file-jpg",
    svg: "file-svg",
    mp4: "file-video",
    webm: "file-video",
    mkv: "file-video",
    // Word
    docx: "file-doc",
    doc: "file-doc",
    odt: "file-doc",
    // Powerpoint
    ppt: "file-ppt",
    pptx: "file-ppt",
    odp: "file-ppt",
    // Excel
    xls: "file-xls",
    xlsx: "file-xls",
    ods: "file-xls",
    csv: "file-csv",
    // Misc
    pdf: "file-pdf",
    md: "file-md",
    // Archives
    zip: "file-archive",
    rar: "file-archive",
    tar: "file-archive",
    // Code
    html: "file-html",
    css: "file-css",
    js: "file-js",
    jsx: "file-jsx",
    ts: "file-ts",
    tsx: "file-tsx",
    vue: "file-vue",
    c: "file-c",
    cpp: "file-cpp",
    cs: "file-csharp",
    sql: "file-sql",
    py: "file-py",
    rs: "file-rs",
    go: "file-code",
    java: "file-code",
    kt: "file-code"
} as const;
