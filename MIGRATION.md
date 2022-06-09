# Миграция

## 0.5.0

### Конфиг
Изменения конфига `tokens.config.js` -> `figmacrawler.config.json`. Подробнее в [README.md](README.md).


### Запуск

Было:
```sh
node node_modules/@5th_ru/figma-crawler/main.js <fileKey> output
```

Стало:
```sh
node node_modules/@5th_ru/figma-crawler/main.js -c ./figmacrawler.config.json
```

## 0.4.0

### Конфиг

Добавлен конфиг `tokens.config.js`. Подробнее в [README.md](README.md).

### Генерация стилей

Ожидаемым инструментом генерации стилей теперь является [Style Dictionary](https://amzn.github.io/style-dictionary) вместо [themekit](https://github.com/bem/themekit).

### Пллатформа `common`

Платформа `common` теперь генерируется отдельно, и не входит в состав остальных (`phone`, `tablet`, `desktop`, etc). Т.е. её надо импортировать отдельно:

```css
@import '<path>/common/root.css';
```

### Вынос `desktop@large` из `desktop` в отдельную платформу `desktop-large`

#### Нейминг в Figma

Текстовые стили `desktop@large` переменованы в `desktop-large`. Пример на стиле `headline-xxl`:

Было:

```
headline-xxl/desktop@large
```

Стало:
```
headline-xxl/desktop-large
```

#### Вместо ручного переопределения перменных использовать импорт `desktop-large`:

Было:

```css
@media (<media-querry>) {
  --text-headline-xxl-font-size: var(--text-headline-xxl-media-large-font-size);
  --text-headline-xxl-line-height: var(--text-headline-xxl-media-large-line-height);
  --text-headline-xxl-letter-spacing: var(--text-headline-xxl-media-large-letter-spacing);
  ...
}
```

Стало:

```css
@import '<path>/desktop-large/root.css' (<media-querry>);
```
