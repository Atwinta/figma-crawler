# Figma Crawler

Based on [figma-to-web](https://github.com/Severenit/figma-to-web)

## Preparation

Copy `.env.example` to `.env`

```sh
cp .env.example .env
```

Then change `<YOUR_TOKEN>` in `.env` file to your personal access token key.

Token key you can take in [this](https://www.figma.com/developers/docs#authentication).

You can create a temporary access token by clicking right there on `Get personal access token` or read how to make permanent access token.

## Install

```sh
npm i
```

## Run

This work with special preparation figma file.

### Generate tokens in json

You can get file_key from URL: `https://www.figma.com/file/<file_key>`

```sh
node main.js ${file_key}
```

### Build css variables by [themekit](https://github.com/bem/themekit)

```sh
npx themekit build
```

## Related links
- [Figma API](https://www.figma.com/developers/api)
- [Design tokens with Figma](https://blog.prototypr.io/design-tokens-with-figma-aef25c42430f#3207)
- [Introducing: Figma to React](https://www.figma.com/blog/introducing-figma-to-react/)
- [Figma-api-demo](https://github.com/figma/figma-api-demo)
- [Figmagic](https://github.com/mikaelvesavuori/figmagic)
- [Figma-to-web](https://github.com/Severenit/figma-to-web)
- [Figma to React: система эффективной доставки изменений дизайна в код (HolyJs)](https://www.youtube.com/watch?v=A3CamtT9VBs&list=PL8sJahqnzh8KXjvw3i0bY-fCn1abQMbv8&index=20&t=0s)
- [Figma to React: система эффективной доставки изменений дизайна в код (IT Nights)](https://www.youtube.com/watch?v=VIyd2YOUOhI&feature=youtu.be&fbclid=IwAR1EjKDrRsltbxfI8moSn3wr7pJtvDA7JRvUEAiakwI-Z1YRiap4IbmDsfk)
- [Figma-SCSS-Generator](https://github.com/KarlRombauts/Figma-SCSS-Generator)
