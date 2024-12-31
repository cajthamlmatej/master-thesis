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
  <path d="M50 0C30 0 20 30 20 50C20 70 35 100 50 100C65 100 80 70 80 50C80 30 70 0 50 0Z" fill="var(--color)" />
</svg>
`,
        nonProportionalResizing: false
    },
    {
        name: "star",
        label: "Star",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <polygon points="50,0 61,33 100,33 67,61 78,100 50,75 22,100 33,61 0,33 39,33" fill="var(--color)" />
</svg>`,
        nonProportionalResizing: true
    },
    {
        name: "heart",
        label: "Heart",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5 5 90 90" preserveAspectRatio="none">
              <path d="M50 91S5 55 5 30C5 10 30 0 50 30C70 0 95 10 95 30C95 55 50 91 50 91Z" fill="var(--color)" />
           </svg>`,
        nonProportionalResizing: true
    },
    {
        name: "pentagon",
        label: "Pentagon",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,0 100,38 81,100 19,100 0,38" fill="var(--color)" />
           </svg>`,
        nonProportionalResizing: true
    },
    {
        name: "hexagon",
        label: "Hexagon",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="var(--color)" />
           </svg>`,
        nonProportionalResizing: true
    },
    {
        name: "crescent",
        label: "Crescent",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M100 50A50 50 0 1 1 50 0A40 40 0 1 0 100 50Z" fill="var(--color)" />
           </svg>`,
        nonProportionalResizing: true
    },
    {
        name: "ladder",
        label: "Ladder",
        class: ["one-line", "grow-2"],
        html: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 100" preserveAspectRatio="none">
  <rect x="0" y="0" width="10" height="100" fill="var(--color)" />
</svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <rect x="0" y="20" width="100" height="20" fill="var(--color)" />
  <rect x="0" y="60" width="100" height="20" fill="var(--color)" />
</svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 100" preserveAspectRatio="none">
  <rect x="0" y="0" width="10" height="100" fill="var(--color)" />
</svg>
`,
        nonProportionalResizing: true
    }

] as {
    name: string;
    label: string;
    class?: string[];
    html: string;
    nonProportionalResizing: boolean;
}[];
