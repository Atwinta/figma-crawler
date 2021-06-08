# Figma Crawler

Based on [figma-to-web](https://github.com/Severenit/figma-to-web)

## Use as dependecy in another project

### Preinstallation

Set `@5th_ru` registry by [instruction](https://docs.gitlab.com/ee/user/packages/npm_registry/index.html#instance-level-npm-endpoint).

**TL;DR**

Get [personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html): with scopes: `api`, `read_registry`.

```sh
npm config set @5th_ru:registry https://gitlab.com/api/v4/packages/npm/
npm config set -- '//gitlab.com/api/v4/packages/npm/:_authToken' "<your_token>"
```

### Installation

```sh
npm i @5th_ru/figma-crawler
```

### Generate tokens in json

You can get file_key from URL: `https://www.figma.com/file/<file_key>`

Optional argument `$dir`. Default `tokens`

```sh
node node_modules/@5th_ru/figma-crawler/main.js ${file_key} $dir
```

When the tokens are ready you will be able to create css variables by [themekit](https://github.com/bem/themekit).

## Use in this repository

### Preparation

Copy `.env.example` to `.env`

```sh
cp .env.example .env
```

Then change `<YOUR_TOKEN>` in `.env` file to your personal Figma access token key.

Token key you can take in [this](https://www.figma.com/developers/docs#authentication).

You can create a temporary access token by clicking right there on `Get personal access token` or read how to make permanent access token.

### Installation

```sh
npm i
```

### Run

This work with special preparation figma file.

#### Generate tokens in json

You can get file_key from URL: `https://www.figma.com/file/<file_key>`

Optional argument `$dir`. Default `tokens`

```sh
node main.js ${file_key} $dir
```

#### Build css variables by [themekit](https://github.com/bem/themekit)

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
