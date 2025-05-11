# PromptMD Chrome Extension

A Chrome Extension companion for PromptMD, a collaborative library of AI tools for healthcare professionals.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PLASMO_PUBLIC_SUPABASE_URL=your_supabase_url_here
PLASMO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
PLASMO_PUBLIC_ENVIRONMENT=development
```

3. Development:
```bash
pnpm dev
```

4. Build:
```bash
pnpm build
```

5. Package for distribution:
```bash
pnpm package
```

## Environment Variables

- `PLASMO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `PLASMO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `PLASMO_PUBLIC_ENVIRONMENT`: Set to 'development' or 'production'

## Development

The extension is built using:
- Plasmo Framework
- React
- TypeScript
- Supabase for backend services

## Security

The extension uses restricted host permissions to only access the PromptMD domain. This ensures the extension only operates on trusted domains.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About

This is the Chrome Extension companion for [PromptMD](https://github.com/ben-minari/promptmd.git), a collaborative library of AI tools for healthcare professionals. The extension provides quick access to prompts and maintains design consistency with the web application.

## Design Consistency

This extension maintains design consistency with the main PromptMD web application. Key design elements are shared between both projects:
- Color scheme and typography
- Component design patterns
- User interaction patterns
- State management approaches

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
