import type { Preview } from "@storybook/react-vite";
import '../src/index.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },

        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: "todo",
        },

        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#0f172a' },
                { name: 'very-dark', value: '#020617' },
                { name: 'medium', value: '#e2e8f0' },
                { name: 'light', value: '#ffffff' },
            ],
        },

        layout: 'centered',
    },

    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: 'dark',
            toolbar: {
                icon: 'paintbrush',
                items: [
                    { value: 'light', title: 'Light', icon: 'sun' },
                    { value: 'medium', title: 'Medium', icon: 'circle' },
                    { value: 'dark', title: 'Dark', icon: 'moon' },
                    { value: 'veryDark', title: 'Very Dark', icon: 'starhollow' },
                ],
                dynamicTitle: true,
            },
        },
    },

    decorators: [
        (Story, context) => {
            const theme = context.globals.theme || 'dark';
            document.documentElement.dataset.theme = theme;
            return <Story />;
        },
    ],
};

export default preview;
