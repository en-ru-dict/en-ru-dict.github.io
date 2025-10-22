UTF-8 Ru
# EngRead: Адаптивное чтение для изучения языков

**EngRead** — это простое веб-приложение для изучения слов любого языка через чтение текстов. Оно помогает запоминать новые слова, закреплять выученные и подбирать тексты, понятные на 70–90%. Работает локально в браузере (ПК или планшет), бесплатно и без регистрации.

## Что умеет программа
- **Поддержка любого языка**: Загружайте словари для английского, французского, немецкого или других языков.
- **Выбор словаря**:
  - A1: 600 базовых слов (начальный уровень).
  - A2: 3000 частых слов (средний уровень).
  - B2: 5000+ словоформ (уверенное чтение).
- **Чтение с переводом**:
  - Вставьте текст, и слова подсветятся с переводом.
  - Режимы: перевод всего текста (Google Translate), перевод всех слов или только незнакомых.
  - Клик по слову добавляет его в список выученных (перевод исчезает) и наоборот. Помогает очень быстро составить список выученных слов, который потом везде нужен.
  - Двойной клик показывает подробный перевод из большого словаря или если его нет, то ввод перевода и добавление.
- **Работа с редкими словами**:
  - Слова, которых нет в словаре, помечаются как редкие.
  - Если их много, то текст сложный — найдите проще (90% слов должны быть знакомы).
- **Большой словарь**:
  - Загрузите словарь на 100 тыс. слов (или свой) для подробных переводов.
  - Просмотрите подробные переводы с примерами для всех слов из текста.
- **Ручной перевод**: Добавляйте переводы для имён, терминов или названий.
- **Сохранение**:
  - Список выученных слов сохраняется в браузере (localStorage).
  - Можно скачать или загрузить этот список в файл.
- **Закрепление слов**:
  - Вставьте 10–50 слов (например, из Anki) в поле «Активные слова».
  - Сгенерируйте текст через чат-бота, чтобы эти слова встречались в контексте.
- **Озвучка**: Слушайте текст или выделенный фрагмент (голос браузера).
- **Мультиязычный интерфейс**: Выберите язык интерфейса (русский, английский, французский, немецкий, испанский и др.).
- **Статистика**: Показывает общее количество слов, выученные, активные и редкие.

## Как пользоваться
1. **Скачайте программу**:
   - Перейдите на [GitHub](https://github.com/en-ru-dict/).
   - Нажмите зелёную кнопку «Code» → «Download ZIP» (вверху страницы).
   - Распакуйте архив и откройте файл `index.html` в браузере (Chrome, Firefox, Safari).
2. **Выберите язык интерфейса**:
   - Нажмите кнопку «RU» (или другой язык) вверху и выберите нужный.
3. **Выберите словарь**:
   - A1 (600 слов), A2 (3000 слов) или B2 (5000+ слов). Для других языков загрузите свой словарь.
4. **Найдите текст**:
   - Возьмите текст вашего уровня, например, с сайтов [ESL Fast](https://www.eslfast.com/) или [Breaking News English](https://breakingnewsenglish.com/) для английского.
   - Вставьте текст в левое поле.
5. **Выберите режим чтения**:
   - **Полный перевод**: Открывает Google Translate.
   - **Все слова**: Перевод в скобках для каждого слова.
   - **Только незнакомые**: Перевод только для невыученных слов.
6. **Работайте с текстом**:
   - Двойной клик по слову отмечает его как выученное или убирает из списка.
   - Если много редких слов (выделены цветом), найдите текст попроще.
7. **Закрепите слова**:
   - Вставьте 10–50 слов (например, из Anki) в поле «Активные слова».
   - Сгенерируйте текст через чат-бота (например, ChatGPT) с запросом: «Напиши учебный текст уровня A2, включи слова: [ваш список]».
8. **Озвучка и перевод**:
   - Нажмите «Speak» для озвучивания текста или выделенного фрагмента.
   - Добавьте свой перевод для терминов через всплывающее окно.
9. **Сохраните прогресс**:
   - Выученные слова сохраняются автоматически.
   - Скачайте список слов через меню или загрузите свой.

## Советы по запоминанию слов
EngRead использует **адаптивное чтение**: вы закрепляете знакомые слова и собираете новые для изучения в Anki, Quizlet или Duolingo. Как запоминать быстрее:
- **Аналогии**: Связывайте слова с русским (например, диггер *dig* — копать, фейверк *firework* — огонь+работа).
- **Фонетические ассоциации**: (когда другие способы не помогают)
  - *Less* — «чем *меньше* ЛЕС, тем толще партизаны» или *topless* (без верха, без=меньше).
  - *Puddle* — «ты ПАДАЛ в *лужу* с крокодилами и кричал что плавать не умеешь, но они тебя всё равно съели..».
  - *Smooth* — «ты гулял С МУСором по *гладкой* свалке, мимо *спокойных* крыс людоедов, они недавно уже съели кого-то, поэтому сытые и на тебя внимания не обращают» или Смузи (мягкий, однородный) напиток.
  - *Bit* - «купил *немного* БИТкоинов на последние шиши, а он упал в три раза, пришлось застрелица»
- **Истории**: Придумайте историю со словом и разыграйте её как в театре, чтобы запомнить через эмоции.
- **Другие способы**: Используйте песни, стихи, фильмы или игры. Подробности в [17 способов запомнить слова от Штирлица или 17 мгновений весны](https://en-ru-dict.github.io)

## Установка
1. Скачайте ZIP-архив с [GitHub](https://github.com/en-ru-dict) (кнопка «Code» → «Download ZIP»).
2. Распакуйте архив.
3. Откройте `index.html` в браузере (Chrome, Firefox, Safari).
4. (Опционально) Разместите на своём сайте.

**Важно**: Работает на ПК и планшетах. На телефонах (экран <600px) интерфейс может быть тесным.

## Требования
- Браузер: Chrome 58+, Firefox 55+, Safari 12.1+ или Edge 79+.
- Интернет нужен только для загрузки словарей или перевода (Google Translate).
- Экран: Если мелко, крупно, не влазит, то меняйте размеры под себя, если не умеете, то попросите чат бота.

## Скриншоты
Нету. Рабочая демо версия на сайте https://en-ru-dict.github.io/text/en_text.htm для экрана 1280х800, остальные идите лесом.

## Почему EngRead?
- **Бесплатно**: Никаких подписок или регистраций.
- **Локально**: Работает без интернета после загрузки словарей.
- **Универсально**: Подходит для любого языка с вашим словарем.
- **Просто**: Легко скачать и использовать даже новичкам.

## Лицензия
Программа бесплатна для всех (MIT License). Вы можете использовать, изменять, копировать и делиться ею без ограничений. См. [LICENSE](LICENSE).

---

# EngRead: Adaptive Reading for Language Learning

**EngRead** is a simple web app for learning words in any language through reading. It helps you memorize new words, reinforce known ones, and pick texts that are 70–90% understandable. Runs locally in your browser (PC or tablet), free, and without registration.

## What it does
- **Any language**: Load dictionaries for English, French, German, or others.
- **Choose a dictionary**:
  - A1: 600 basic words (beginner).
  - A2: 3000 frequent words (intermediate).
  - B2: 5000+ word forms (confident reading).
- **Reading with translations**:
  - Paste a text, and words are highlighted with translations.
  - Modes: full text translation (Google Translate), translations for all words, or only unlearned words.
  - Double-click a word to mark it as learned (hides translation) or remove it.
- **Rare words**:
  - Words not in the dictionary are marked as rare.
  - If many are rare, try an easier text (90% of words should be known).
- **Large dictionary**:
  - Load an 80,000-word dictionary (or your own) for detailed translations.
  - View translations for all words in the text.
- **Manual translation**: Add translations for names, terms, or titles.
- **Saving progress**:
  - Learned words are saved in the browser (localStorage).
  - Export or import word lists as files.
- **Reinforce words**:
  - Enter 10–50 words (e.g., from Anki) in the “Active words” field.
  - Generate a practice text via a chatbot to use these words in context.
- **Text-to-speech**: Listen to the text or selected parts (browser voice).
- **Multilingual interface**: Choose interface language (English, Russian, French, German, Spanish, etc.).
- **Statistics**: Shows total, learned, active, and rare words.

## How to use
1. **Download the app**:
   - Go to [GitHub](https://github.com/en-ru-dict/).
   - Click the green “Code” button → “Download ZIP” (top of the page).
   - Unzip the file and open `index.html` in a browser (Chrome, Firefox, Safari).
2. **Select interface language**:
   - Click the “EN” (or other) button at the top and choose a language.
3. **Select a dictionary**:
   - A1 (600 words), A2 (3000 words), or B2 (5000+ words). Load your own for other languages.
4. **Find a text**:
   - Pick a text for your level, e.g., from [ESL Fast](https://www.eslfast.com/) or [Breaking News English](https://breakingnewsenglish.com/) for English.
   - Paste it into the left field.
5. **Choose a mode**:
   - **Full translation**: Opens Google Translate.
   - **All words**: Shows translations in parentheses for all words.
   - **Unlearned only**: Shows translations only for unlearned words.
6. **Work with the text**:
   - Double-click a word to mark it as learned or remove it.
   - If many words are rare (highlighted), try an easier text.
7. **Reinforce words**:
   - Enter 10–50 words (e.g., from Anki) in the “Active words” field.
   - Generate a text via a chatbot (e.g., ChatGPT) with a prompt: “Write a practice text for A2 level, including words: [your list].”
8. **Speech and translation**:
   - Click “Speak” to hear the text or selected part.
   - Add manual translations for terms via the pop-up window.
9. **Save progress**:
   - Learned words are saved automatically.
   - Export or import word lists via the menu.

## Tips for learning words
EngRead uses **adaptive reading** to reinforce known words and collect new ones for study in Anki, Quizlet, or Duolingo. Tips to memorize faster:
- **Analogies**: Link words to your language (e.g., *digger* — dig, *firework* — fire+work).
- **Phonetic associations**:
  - *Less* — “the less forest, the thicker the partisans” or *topless* (without top).
  - *Puddle* — “you fell into a puddle with crocodiles.”
  - *Smooth* — “you walked with trash on a smooth dump” or *smoothie* (soft, uniform).
- **Stories**: Create a story with the word and act it out to remember through emotions.
- **Other methods**: Try songs, poems, movies, or games. See [17 ways to learn words]().

## Installation
1. Download the ZIP file from [GitHub](https://github.com/en-ru-dict) (“Code” → “Download ZIP”).
2. Unzip the file.
3. Open `index.html` in a browser (Chrome, Firefox, Safari).
4. (Optional) Host on your website.

**Note**: Works on PCs and tablets. On phones (<600px screens), the interface may be cramped.

## Requirements
- Browser: Chrome 58+, Firefox 55+, Safari 12.1+, or Edge 79+.
- Internet needed only for dictionaries or translation (Google Translate).
- Screen: At least 600px wide.

## Screenshots
Demo: https://en-ru-dict.github.io/text/en_text.htm

## Why EngRead?
- **Free**: No subscriptions or registration.
- **Local**: Works offline after loading dictionaries.
- **Universal**: Supports any language with your dictionary.
- **Simple**: Easy to download and use, even for beginners.

## License
Free for everyone (MIT License). You can use, copy, and share it, keeping the author’s credit. See [LICENSE](LICENSE).
