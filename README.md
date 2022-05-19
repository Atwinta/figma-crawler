# Figma Crawler

Основано на [figma-to-web](https://github.com/Severenit/figma-to-web)

## Конфиг

Файл `tokens.config.js` используется при генерации токенов и генерации стилей.

Содержит объект `platformMap`, представляющий собой перечень уровней (платформ), для которых генерируются токены (и стили). Ключом является имя платформы в `Figma`, значением — имя платформы в сгенерируемых файлах (по-умолчанию, совпадают). При необходимости, можно менять как сам состав платформ в зависимости от дизайна, так и имя используемое в файлах.

## Использование

1. Создать токен в `Figma` [см. здесь](https://www.figma.com/developers/docs#authentication)
2. В случае отсутсвия `.env` файла копируем его из шаблона `.env.example`:
```sh
cp ./.env.example ./.env
```
3. Добавить переменную `FIGMA_DEV_TOKEN` в файл `.env` со значением своего токена от `Figma`:
```
FIGMA_DEV_TOKEN=<YOUR_TOKEN>
```
### Предустановка

[Настроить](https://g.5th.ru/5th_ru/tips-tricks-and-docs/-/blob/master/nodejs/@5th_ru.md) `@5th_ru` npm package registry

### Установка

```sh
npm i -D @5th_ru/figma-crawler
```

### Генерация токенов

1. Копируем себе в проект конфиг `tokens.config.js`, и при необходимости меняем уровни (платформы)
```sh
cp ./node_modules/@5th_ru/figma-crawler/tokens.config.js ./
```
2. Запускаем команду для получения построения токенов, указав `<file_key>` (id проекта) и путь для выгрузки (опционально, дефолтное значение: `./tokens`):
```sh
node node_modules/@5th_ru/figma-crawler/main.js $file_key $path
```

Id проекта (`file_key`) можно получить из урла: `https://www.figma.com/file/<file_key>`

### Генерация `css` файлов с переменными из токенов

Генерация производится с помощью [Style Dictionary](https://amzn.github.io/style-dictionary)

1. Устанавливаем в проект `Style Dictionary`:
```sh
npm i -D style-dictionary
```

2. Копируем себе в проект пример конфиг билда
```sh
cp ./node_modules/@5th_ru/figma-crawler/style-dictionary.config.js ./
```

3. Меняем в конфиге пути до токенов и генерируемых файлов, а также при необходимости и с полным пониманием происходящего другие параметры.

4. Запускаем:
```sh
node ./style-dictionary.config.js
```

## Полезные ссылки
- [Figma API](https://www.figma.com/developers/api)
- [Design tokens with Figma](https://blog.prototypr.io/design-tokens-with-figma-aef25c42430f#3207)
- [Introducing: Figma to React](https://www.figma.com/blog/introducing-figma-to-react/)
- [Figma-api-demo](https://github.com/figma/figma-api-demo)
- [Figmagic](https://github.com/mikaelvesavuori/figmagic)
- [Figma-to-web](https://github.com/Severenit/figma-to-web)
- [Figma to React: система эффективной доставки изменений дизайна в код (HolyJs)](https://www.youtube.com/watch?v=A3CamtT9VBs&list=PL8sJahqnzh8KXjvw3i0bY-fCn1abQMbv8&index=20&t=0s)
- [Figma to React: система эффективной доставки изменений дизайна в код (IT Nights)](https://www.youtube.com/watch?v=VIyd2YOUOhI&feature=youtu.be&fbclid=IwAR1EjKDrRsltbxfI8moSn3wr7pJtvDA7JRvUEAiakwI-Z1YRiap4IbmDsfk)
- [Figma-SCSS-Generator](https://github.com/KarlRombauts/Figma-SCSS-Generator)
- [Style Dictionary](https://amzn.github.io/style-dictionary)
- [themekit](https://github.com/bem/themekit)
