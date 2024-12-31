export const shapes = [
    {
        name: "ellipse",
        label: "Ellipse",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <ellipse cx="50" cy="50" rx="50" ry="50" fill="var(--color)" />
                </svg>`,
        nonProportionalResizing: true
    },
    {
        name: "rectangle",
        label: "Rectangle",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect x="0" y="0" width="100" height="100" fill="var(--color)" />
                </svg>`,
        nonProportionalResizing: true
    },
    {
        name: "triangle",
        label: "Triangle",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <polygon points="50,0 100,100 0,100" fill="var(--color)" />
</svg>`,
        nonProportionalResizing: true
    },
    {
        name: "arrow-1",
        label: "Arrow 1",
        class: ["one-line","grow-2"],
        html:
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100" preserveAspectRatio="none">
  <polygon points="0,50 50,0 50,100" fill="var(--color)" />
</svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <rect x="0" y="45" width="100" height="10" fill="var(--color)" />
</svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100" preserveAspectRatio="none">
  <polygon points="0,0 0,100 50,50" fill="var(--color)" />
</svg>`,
        nonProportionalResizing: true
    },
    {
        name: "egg",
        label: "Egg",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <path d="M50 5C30 5 20 35 20 55C20 75 35 95 50 95C65 95 80 75 80 55C80 35 70 5 50 5Z" fill="var(--color)" />
</svg>`,
        nonProportionalResizing: false
    },
    {
        name: "star",
        label: "Star",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <polygon points="50,0 61,33 100,33 67,61 78,100 50,75 22,100 33,61 0,33 39,33" fill="var(--color)" />
</svg>`,
        nonProportionalResizing: true
    }
] as {
    name: string;
    label: string;
    class?: string[];
    html: string;
    nonProportionalResizing: boolean;
}[];
