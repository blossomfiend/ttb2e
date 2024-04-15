/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            backgroundImage: {
                "parchment": "url(/ui/parchment.jpg)",
                "parchment-white": "url(/ui/parchment-white.jpg)",
            }
        },
    },
    plugins: [],
    prefix: 'tw-',
}
