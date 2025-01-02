export const objectToCsv = (data: Record<string, any> | undefined, includeHeaders: boolean = true, delimiter: string = ";") => {
    let csv = "";

    if (!data) return csv;

    if (includeHeaders) {
        csv += Object.keys(data).join(delimiter) + "\n";
    }

    csv += Object.values(data).map((v) => {
        if (v === undefined || v === null) return `""`;

        return `"${v.toString().replace(new RegExp(delimiter, "g"), "(semicolon)")}"`;
    }).join(delimiter) + "\n";

    return `\uFEFF` + csv;
}

export const arrayToCsv = (data: Record<string, any>[] | undefined, includeHeaders: boolean = true, delimiter: string = ";") => {
    let csv = "";

    if (!data) return csv;
    if (data.length === 0) return csv;

    if (includeHeaders) {
        csv += Object.keys(data[0]).join(delimiter) + "\n";
    }

    data.forEach((row) => {
        csv += Object.values(row).map((v) => {
            if (v === undefined || v === null) return `""`;

            return `"${v.toString().replace(new RegExp(delimiter, "g"), "(semicolon)")}"`;
        }).join(delimiter) + "\n";
    });

    return `\uFEFF` + csv;
}
