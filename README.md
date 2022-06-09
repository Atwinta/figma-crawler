# Figma Crawler

Выгрузка стилей из приготовленого для сего действа файла [Figma](https://www.figma.com) на базе [шаблона](https://www.figma.com/file/vuTgbOSDxzY6pryHtZavBU).

Основано на [figma-to-web](https://github.com/Severenit/figma-to-web)

## Выгружаемые категории токенов

| Название   | Описание                                                      | Зависимость
| :--------- | :------------------------------------------------------------ | :--------------------------------------- |
| typography | Названия семейств шрифтов для: текста, заголовков и контролов |                                          |
| text       | Текстовые стили                                               |                                          |
| color      | Цвета                                                         |                                          |
| effect     | Эффекты                                                       |                                          |
| grid       | Сетка                                                         |                                          |
| button     | Компонент кнопка                                              | typography <br>text <br>color <br>effect |
| references | Набор референсов (алиасов)                                    |                                          |

`references` используется в параметре `include` [Style Dictionary](https://amzn.github.io/style-dictionary) для предотвращения ошибки о несуществующем алиасе при генерации стилей платформ. Создаётся только при необходимости.

## Сеты

Токены делятся на сеты. Наименования и состав сетов зависят от исходного файла Figma. Наменование сета содержится в имени токена, например `text@common.tokens.json`

На текущий момент используются два вида сетов:

1. Сет платформ. Позволяет собрать токены:

  * под конкретные платформы, режим `split`:

| Платформа       | Уровень
| :-------------- | :--------------------- |
| common          | common                 |
| phone           | common + phone         |
| tablet          | common + tablet        |
| desktop         | common + desktop       |
| desktop-large   | common + desktop-large |

  * наследуемые (адаптив), режим `join`:

| Платформа       | Уровень
| :-------------- | :------------------------------------------------ |
| common          | common                                            |
| phone           | common + phone                                    |
| tablet          | common + phone + tablet                           |
| desktop         | common + phone + tablet + desktop                 |
| desktop-large   | common + phone + tablet + desktop + desktop-large |

2. Сеты цветов

| Сет     | Уровень          |
| :------ | :--------------- |
| common  | common           |
| inverse | common + inverse |

**[Да кто такие эти ваши уровни](https://ru.bem.info/methodology/redefinition-levels/)**

## Конфиг

Файл `figmacrawler.config.json`

```json
{
  "fileKey": "",
  "output": "tokens",
  "clear": false,
  "type": "files",
  "colorFormat": "css",
  "platformsMode": "split",
  "platformsOrder": [
    "desktop-large",
    "desktop",
    "tablet",
    "phone"
  ],
  "filter": []
}
```

<table>
  <thead>
    <tr>
      <th>Параметр</th>
      <th>Тип</td>
      <th>Описание</th>
      <th>Значение по-умолчанию</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>fileKey</td>
      <td>String</td>
      <td>Id Figma файла. Находится в урле: `https://www.figma.com/file/< fileKey >`</td>
      <td>""</td>
    </tr>
    <tr>
      <td>output</td>
      <td>String</td>
      <td>Путь вывода</td>
      <td>tokens</td>
    </tr>
    <tr>
      <td>clear</td>
      <td>Boolean</td>
      <td>Флаг рекурсивного удаления пути вывода перед записью</td>
      <td>false</td>
    </tr>
    <tr>
      <td>type</td>
      <td>String<'files' | 'teams'></td>
      <td>Тип Figma проекта. Тип `teams` не тестировался</td>
      <td>files</td>
    </tr>
    <tr>
      <td>colorFormat</td>
      <td>String<'css' | 'postcss'></td>
      <td>Формат цвета</td>
      <td>css</td>
    </tr>
    <tr>
      <td>platformsMode</td>
      <td>String<'split' | 'join'></td>
      <td>
        Режим генерации сетов платформ:
        <br>`split` &mdash; для отдельных платформ. В нём набор платформ отстаётся неизменным;
        <br>`join` &mdash; для адаптивных (медиа-запросы) платформ. В данном режиме из платформы большей по ширине вьюпорта, исключаются токены с значением, совпадающим у следующей нижестоящей платформы. Для определения порядка использует параметр `platformsOrder`.
        <br>Пример: набор платформ <code>sets: { desktop: { a: 1, b: 2 }, tablet: { a: 1, b: 1 }, phone: {  a: 3, b: 1, c: 8 } }</code> в режиме `join` станет: <code>sets: { desktop: { b: 2 }, tablet: { a: 1 }, phone: {  a: 3, b: 1, c: 8 } }</code>
      </td>
      <td>split</td>
    </tr>
    <tr>
      <td>platformsOrder</td>
      <td>String[]</td>
      <td>Массив платформ в порядке убывания ширины вьюпорта. Используется при platformsMode === "join"</td>
      <td>["desktop-large", "desktop", "tablet", "phone"]</td>
    </tr>
    <tr>
      <td>filter</td>
      <td>String|String[]</td>
      <td>Фильтр категорий токенов, в случае передачи будут выгружены только переданные категории (и из зависимости), остальные &mdash; проигнорируются. По-умолчанию выгружаются все. Не влияет на категорию references</td>
      <td>[]</td>
    </tr>
  </tbody>
</table>

## Установка

Должен быть [настроен](https://g.5th.ru/5th_ru/tips-tricks-and-docs/-/blob/master/nodejs/@5th_ru.md) `@5th_ru` npm package registry.

```sh
npm i -D @5th_ru/figma-crawler
```

## Использование

### TL;TR

Перед запуском:
1. Добавить девелоперский токен Figma в качестве переменной окружения `FIGMA_DEV_TOKEN`
2. Создать конфиг `figmacrawler.config.json`.

```sh
USAGE
  $ node figma-crawler/main.js

OPTIONS
  -c, --config    Путь к конфигу. Значение по-умолчанию: figmacrawler.config.json
  -f, --file-key  Id Figma файла. В случае передачи переопределяет значение из конфига.
  -t, --type      Тип Figma проекта. В случае передачи переопределяет значение из конфига. Значение по-умолчанию: files
  -o, --output    Путь вывода. В случае передачи переопределяет значение из конфига. Значение по-умолчанию: tokens
```

Пример использования находится в директории [example](example)

### Подробнее

1. Создать девелоперский токен в `Figma` [подробнее см. здесь](https://www.figma.com/developers/docs#authentication)

2. В корне проекта создать в случае отсутсвия `.env` файл (можно скопировать `.env.example` из примера):
```sh
cp ./node_modules/@5th_ru/figma-crawler/example/.env.example ./.env
```
3. Добавить переменную `FIGMA_DEV_TOKEN` в файл `.env` со значением своего девелоперского токена от `Figma`:
```
FIGMA_DEV_TOKEN=<YOUR_TOKEN>
```
4. Создать конфиг `figmacrawler.config.json`.

5. Запускаем:
```sh
node node_modules/@5th_ru/figma-crawler/main.js -c figmacrawler.config.json
```

## Генерация стилей

Пример генерации с помощью [Style Dictionary](https://amzn.github.io/style-dictionary) находится в директории [example](example)

## Полезные ссылки
- [Figma API](https://www.figma.com/developers/api)
- [Style Dictionary](https://amzn.github.io/style-dictionary)
- [Design tokens with Figma](https://blog.prototypr.io/design-tokens-with-figma-aef25c42430f#3207)
- [Introducing: Figma to React](https://www.figma.com/blog/introducing-figma-to-react/)
- [Figma-api-demo](https://github.com/figma/figma-api-demo)
- [Figmagic](https://github.com/mikaelvesavuori/figmagic)
- [Figma-to-web](https://github.com/Severenit/figma-to-web)
- [Figma to React: система эффективной доставки изменений дизайна в код (HolyJs)](https://www.youtube.com/watch?v=A3CamtT9VBs&list=PL8sJahqnzh8KXjvw3i0bY-fCn1abQMbv8&index=20&t=0s)
- [Figma to React: система эффективной доставки изменений дизайна в код (IT Nights)](https://www.youtube.com/watch?v=VIyd2YOUOhI&feature=youtu.be&fbclid=IwAR1EjKDrRsltbxfI8moSn3wr7pJtvDA7JRvUEAiakwI-Z1YRiap4IbmDsfk)
- [Figma-SCSS-Generator](https://github.com/KarlRombauts/Figma-SCSS-Generator)
- [themekit](https://github.com/bem/themekit)
