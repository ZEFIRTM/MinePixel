# Telegram Mini Apps Cache Fix

Этот шаблон решает проблемы с кэшированием в Telegram Mini Apps.

## Проблемы, которые решает этот шаблон:

1. **Старые версии игры** - пользователи видят старую версию после обновления
2. **Проблемы с iPhone** - белый экран или автоматическое закрытие приложения
3. **Кэширование в Telegram** - Telegram кэширует WebGL приложения
4. **Браузерное кэширование** - браузеры кэшируют статические файлы

## Настройка GitHub Pages

### 1. Создайте файл `.nojekyll` в корне репозитория

```bash
touch .nojekyll
```

### 2. Настройте GitHub Pages для правильного кэширования

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Create .nojekyll file
      run: touch .nojekyll
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
        force_orphan: true
        cname: your-domain.com  # если у вас есть домен
```

### 3. Настройте заголовки кэширования

Создайте файл `_headers` в папке с билдом:

```
/*
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/Build/*
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/ServiceWorker.js
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
```

## Настройка Unity

### 1. Обновите версию в Project Settings

В Unity:
1. Откройте `Edit > Project Settings > Player`
2. В разделе `Other Settings` найдите `Version`
3. Обновите версию перед каждым билдом

### 2. Добавьте VersionChecker в сцену

1. Добавьте компонент `VersionChecker` на GameObject в сцене
2. Настройте `currentVersion` в инспекторе
3. Привяжите UI элемент для отображения версии

### 3. Настройте WebGL Build Settings

В Unity:
1. `File > Build Settings > WebGL`
2. Нажмите `Player Settings`
3. В `Publishing Settings`:
   - Включите `Compression Format: Disabled`
   - Включите `Decompression Fallback`
4. В `Other Settings`:
   - Установите `Scripting Backend: IL2CPP`
   - Включите `Development Build` для отладки

## Проверка работы

### 1. Проверьте версию в консоли браузера

Откройте Developer Tools и проверьте:
```javascript
console.log('Game Version:', window.TelegramCacheFix.version);
```

### 2. Проверьте кэши

```javascript
// Проверить все кэши
caches.keys().then(keys => console.log('Caches:', keys));

// Очистить кэши
window.TelegramCacheFix.clearAllCache();
```

### 3. Принудительное обновление

```javascript
// Принудительно обновить приложение
window.TelegramCacheFix.forceTelegramUpdate();
```

## Решение проблем

### Проблема: Пользователи все еще видят старую версию

**Решение:**
1. Убедитесь, что версия в Unity обновлена
2. Проверьте, что файл `_headers` добавлен в билд
3. Попросите пользователей очистить кэш браузера

### Проблема: Белый экран на iPhone

**Решение:**
1. Проверьте мета-теги в `index.html`
2. Убедитесь, что все скрипты загружаются корректно
3. Проверьте консоль на ошибки JavaScript

### Проблема: Telegram Mini App закрывается

**Решение:**
1. Проверьте версию Telegram Web App
2. Убедитесь, что все API вызовы корректны
3. Добавьте обработку ошибок

## Дополнительные настройки

### Для продакшена

1. Отключите `Development Build`
2. Включите сжатие файлов
3. Настройте CDN для статических файлов

### Для отладки

1. Включите `Development Build`
2. Добавьте больше логирования
3. Используйте `console.log` для отслеживания версий

## Контакты

Если у вас есть вопросы или проблемы, создайте issue в репозитории. 