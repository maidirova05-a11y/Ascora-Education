/**
 * Политика конфиденциальности ASCORA Education (оператор — ТОО «AZ GROUP LLC»).
 * Описывает то, что сайт делает на самом деле: поля форм и /api/inquiries,
 * база заявок, Битрикс24 (server/bitrix.js), Google Таблицы (server/sheets.js),
 * Яндекс.Метрика и Google Analytics (index.html). Поменялось что-то из этого —
 * поправьте текст здесь же. Форма та же, что у content/oferta.js.
 */
export const PRIVACY = {
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Последнее обновление: 12 октября 2026 г.',
    sections: [
      {
        title: '1. Общие положения',
        blocks: [
          '1.1. Настоящая Политика описывает, какие персональные данные собирает сайт ascora.education, с какой целью они обрабатываются, где хранятся и как вы можете ими управлять.',
          '1.2. Оператор персональных данных — ТОО «AZ GROUP LLC» (бренд ASCORA Education), БИН 241140003039, Республика Казахстан, г. Астана, ул. Аскара Токпанова, д. 27.',
          '1.3. Данные обрабатываются в соответствии с Законом Республики Казахстан «О персональных данных и их защите». Отправляя заявку на сайте, вы даёте согласие на обработку персональных данных на условиях этой Политики.',
        ],
      },
      {
        title: '2. Какие данные мы собираем',
        blocks: [
          '2.1. Через формы заявки на сайте:',
          [
            'имя;',
            'номер телефона или WhatsApp;',
            'адрес электронной почты — если вы его указали;',
            'выбранная программа или тема обращения, а при записи на конкретный лагерь — его название и стоимость;',
            'комментарий — если вы его написали;',
            'язык сайта, на котором отправлена заявка.',
          ],
          '2.2. Чтобы защитить формы от спама, сервер учитывает IP-адрес отправителя и ограничивает число заявок с одного адреса. В базе заявок IP-адрес не сохраняется.',
          '2.3. На сайте мы не запрашиваем паспортные данные, платёжные реквизиты и документы. Если они понадобятся для оформления поездки — например, для визы или бронирования, — мы запросим их отдельно.',
        ],
      },
      {
        title: '3. Цели обработки',
        blocks: [
          '3.1. Данные используются, чтобы:',
          [
            'связаться с вами и ответить на вопросы;',
            'подобрать лагерь по возрасту, интересам и бюджету;',
            'оформить участие ребёнка в выбранной программе;',
            'вести учёт обращений.',
          ],
          '3.2. Мы не продаём персональные данные и не используем их для рекламных рассылок без вашего отдельного согласия.',
        ],
      },
      {
        title: '4. Где хранятся данные и кому они передаются',
        blocks: [
          '4.1. Заявки сохраняются в базе данных на сервере сайта и передаются в сервисы, с которыми работают наши менеджеры:',
          [
            'CRM-система Битрикс24 — для обработки заявок;',
            'Google Таблицы (Google LLC) — для учёта обращений.',
          ],
          '4.2. Организатору выбранного лагеря данные передаются только при оформлении участия и только в объёме, необходимом для бронирования.',
          '4.3. Данные могут быть предоставлены государственным органам в случаях, предусмотренных законодательством Республики Казахстан.',
        ],
      },
      {
        title: '5. Аналитика и файлы cookie',
        blocks: [
          '5.1. Для статистики посещаемости сайт использует Яндекс.Метрику (включая Вебвизор) и Google Analytics. Эти сервисы сохраняют в браузере свои cookie и собирают обезличенные сведения о посещении: какие страницы открывались, переходы и действия на странице, тип устройства и браузера.',
          '5.2. Эти сведения помогают делать сайт удобнее. Отключить их сбор можно в настройках браузера, запретив cookie, или с помощью блокировщика.',
        ],
      },
      {
        title: '6. Сроки хранения',
        blocks: [
          '6.1. Данные заявок хранятся, пока они нужны для целей из раздела 3, либо до отзыва вами согласия на обработку, если более долгий срок не требуется по закону.',
        ],
      },
      {
        title: '7. Защита данных',
        blocks: [
          '7.1. Сайт работает по защищённому протоколу HTTPS. Поля форм проверяются на сервере, частота отправки заявок ограничена. Доступ к заявкам есть только у сотрудников, которые работают с клиентами.',
        ],
      },
      {
        title: '8. Данные детей',
        blocks: [
          '8.1. Заявку на участие ребёнка в лагере оставляет родитель или законный представитель. Отправляя данные ребёнка, он подтверждает своё право действовать в его интересах.',
        ],
      },
      {
        title: '9. Ваши права',
        blocks: [
          '9.1. Вы вправе узнать, какие ваши данные у нас хранятся, потребовать их исправления или удаления, а также отозвать согласие на обработку.',
          '9.2. Для этого напишите на info@az-group.kz или позвоните по номеру +7 700 312 79 12.',
        ],
      },
      {
        title: '10. Изменения Политики',
        blocks: [
          '10.1. Мы можем обновлять Политику. Актуальная редакция всегда опубликована на этой странице.',
        ],
      },
    ],
    details: {
      title: '11. Контакты оператора',
      rows: [
        { label: 'Компания', value: 'ТОО «AZ GROUP LLC»', href: '' },
        { label: 'Бренд', value: 'ASCORA Education', href: '' },
        { label: 'Адрес', value: 'Республика Казахстан, г. Астана, ул. Аскара Токпанова, д. 27', href: '' },
        { label: 'Телефон', value: '+7 700 312 79 12', href: 'tel:+77003127912' },
        { label: 'Электронная почта', value: 'info@az-group.kz', href: 'mailto:info@az-group.kz' },
      ],
    },
  },
  kz: {
    title: 'Құпиялылық саясаты',
    updated: 'Соңғы жаңарту: 2026 жылғы 12 қазан',
    sections: [
      {
        title: '1. Жалпы ережелер',
        blocks: [
          '1.1. Осы Саясат ascora.education сайты қандай дербес деректерді жинайтынын, олар қандай мақсатта өңделетінін, қайда сақталатынын және оларды қалай басқаруға болатынын сипаттайды.',
          '1.2. Дербес деректердің операторы — «AZ GROUP LLC» ЖШС (ASCORA Education бренді), БСН 241140003039, Қазақстан Республикасы, Астана қ., Асқар Тоқпанов к-сі, 27 үй.',
          '1.3. Деректер «Дербес деректер және оларды қорғау туралы» Қазақстан Республикасының Заңына сәйкес өңделеді. Сайтта өтінім жіберу арқылы сіз осы Саясаттың шарттарымен дербес деректеріңізді өңдеуге келісім бересіз.',
        ],
      },
      {
        title: '2. Қандай деректерді жинаймыз',
        blocks: [
          '2.1. Сайттағы өтінім формалары арқылы:',
          [
            'аты;',
            'телефон немесе WhatsApp нөмірі;',
            'электрондық пошта мекенжайы — егер көрсетсеңіз;',
            'таңдалған бағдарлама немесе өтініш тақырыбы, ал нақты лагерьге жазылғанда — оның атауы мен құны;',
            'пікір — егер жазсаңыз;',
            'өтінім жіберілген сайт тілі.',
          ],
          '2.2. Формаларды спамнан қорғау үшін сервер жіберушінің IP мекенжайын ескеріп, бір мекенжайдан келетін өтінімдер санын шектейді. Өтінімдер базасында IP мекенжай сақталмайды.',
          '2.3. Сайтта төлқұжат деректерін, төлем деректемелерін және құжаттарды сұрамаймыз. Егер олар сапарды рәсімдеуге — мысалы, визаға немесе брондауға — қажет болса, оларды бөлек сұраймыз.',
        ],
      },
      {
        title: '3. Өңдеу мақсаттары',
        blocks: [
          '3.1. Деректер мыналар үшін пайдаланылады:',
          [
            'сізбен байланысып, сұрақтарға жауап беру;',
            'лагерьді жасына, қызығушылығына және бюджетке қарай таңдау;',
            'баланың таңдалған бағдарламаға қатысуын рәсімдеу;',
            'өтініштерді есепке алу.',
          ],
          '3.2. Біз дербес деректерді сатпаймыз және сіздің жеке келісіміңізсіз жарнамалық таратылымдарға пайдаланбаймыз.',
        ],
      },
      {
        title: '4. Деректер қайда сақталады және кімге беріледі',
        blocks: [
          '4.1. Өтінімдер сайт серверіндегі дерекқорда сақталады және менеджерлеріміз жұмыс істейтін сервистерге беріледі:',
          [
            'Битрикс24 CRM жүйесі — өтінімдерді өңдеу үшін;',
            'Google Кестелері (Google LLC) — өтініштерді есепке алу үшін.',
          ],
          '4.2. Таңдалған лагерь ұйымдастырушысына деректер тек қатысуды рәсімдеу кезінде және тек брондауға қажетті көлемде беріледі.',
          '4.3. Деректер Қазақстан Республикасының заңнамасында көзделген жағдайларда мемлекеттік органдарға берілуі мүмкін.',
        ],
      },
      {
        title: '5. Аналитика және cookie файлдары',
        blocks: [
          '5.1. Сайтқа кіру статистикасы үшін Яндекс.Метрика (Вебвизорды қоса) және Google Analytics пайдаланылады. Бұл сервистер браузерде өз cookie файлдарын сақтап, кіру туралы иесіздендірілген мәліметтерді жинайды: қандай беттер ашылғаны, өтулер мен беттегі әрекеттер, құрылғы мен браузер түрі.',
          '5.2. Бұл мәліметтер сайтты ыңғайлы етуге көмектеседі. Оларды жинауды браузер баптауларында cookie файлдарына тыйым салу арқылы немесе блоктаушы көмегімен өшіруге болады.',
        ],
      },
      {
        title: '6. Сақтау мерзімдері',
        blocks: [
          '6.1. Өтінім деректері 3-бөлімдегі мақсаттарға қажет болғанша немесе сіз өңдеуге келісімді кері қайтарып алғанға дейін сақталады, егер заң бойынша ұзағырақ мерзім талап етілмесе.',
        ],
      },
      {
        title: '7. Деректерді қорғау',
        blocks: [
          '7.1. Сайт қорғалған HTTPS хаттамасы бойынша жұмыс істейді. Форма өрістері серверде тексеріледі, өтінім жіберу жиілігі шектелген. Өтінімдерге тек клиенттермен жұмыс істейтін қызметкерлердің ғана қолжетімділігі бар.',
        ],
      },
      {
        title: '8. Балалардың деректері',
        blocks: [
          '8.1. Баланың лагерьге қатысуына өтінімді ата-анасы немесе заңды өкілі қалдырады. Баланың деректерін жібере отырып, ол оның мүддесінде әрекет ету құқығын растайды.',
        ],
      },
      {
        title: '9. Сіздің құқықтарыңыз',
        blocks: [
          '9.1. Сіз бізде қандай деректеріңіз сақталғанын білуге, оларды түзетуді немесе жоюды талап етуге, сондай-ақ өңдеуге берген келісіміңізді кері қайтарып алуға құқылысыз.',
          '9.2. Ол үшін info@az-group.kz мекенжайына жазыңыз немесе +7 700 312 79 12 нөміріне қоңырау шалыңыз.',
        ],
      },
      {
        title: '10. Саясаттағы өзгерістер',
        blocks: [
          '10.1. Біз Саясатты жаңартуымыз мүмкін. Өзекті редакциясы әрдайым осы бетте жарияланады.',
        ],
      },
    ],
    details: {
      title: '11. Оператордың байланыс деректері',
      rows: [
        { label: 'Компания', value: '«AZ GROUP LLC» ЖШС', href: '' },
        { label: 'Бренд', value: 'ASCORA Education', href: '' },
        { label: 'Мекенжайы', value: 'Қазақстан Республикасы, Астана қ., Асқар Тоқпанов к-сі, 27 үй', href: '' },
        { label: 'Телефон', value: '+7 700 312 79 12', href: 'tel:+77003127912' },
        { label: 'Электрондық пошта', value: 'info@az-group.kz', href: 'mailto:info@az-group.kz' },
      ],
    },
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 12 October 2026',
    sections: [
      {
        title: '1. General provisions',
        blocks: [
          '1.1. This Policy describes what personal data the ascora.education website collects, why it is processed, where it is stored and how you can control it.',
          '1.2. The personal data operator is AZ GROUP LLC (brand: ASCORA Education), BIN 241140003039, 27 Askar Tokpanov St., Astana, Republic of Kazakhstan.',
          '1.3. Data is processed in accordance with the Law of the Republic of Kazakhstan “On Personal Data and Their Protection”. By submitting a request on the website you consent to the processing of your personal data under this Policy.',
        ],
      },
      {
        title: '2. What data we collect',
        blocks: [
          '2.1. Through the request forms on the website:',
          [
            'your name;',
            'phone or WhatsApp number;',
            'email address — if you provide one;',
            'the programme or topic you chose, and when you sign up for a specific camp — its name and price;',
            'your comment — if you write one;',
            'the language of the site the request was sent from.',
          ],
          '2.2. To protect the forms from spam, the server takes the sender’s IP address into account and limits the number of requests from one address. The IP address is not stored in the request database.',
          '2.3. We do not ask for passport details, payment details or documents on the website. If they are needed to arrange the trip — for example, for a visa or a booking — we will ask for them separately.',
        ],
      },
      {
        title: '3. Purposes of processing',
        blocks: [
          '3.1. The data is used to:',
          [
            'contact you and answer your questions;',
            'choose a camp by age, interests and budget;',
            'arrange your child’s participation in the chosen programme;',
            'keep a record of requests.',
          ],
          '3.2. We do not sell personal data or use it for advertising mailings without your separate consent.',
        ],
      },
      {
        title: '4. Where data is stored and who receives it',
        blocks: [
          '4.1. Requests are stored in a database on the website’s server and passed to the services our managers work in:',
          [
            'Bitrix24 CRM — to handle requests;',
            'Google Sheets (Google LLC) — to keep a record of requests.',
          ],
          '4.2. The organiser of the chosen camp receives data only when participation is being arranged, and only to the extent needed for the booking.',
          '4.3. Data may be provided to public authorities in cases established by the legislation of the Republic of Kazakhstan.',
        ],
      },
      {
        title: '5. Analytics and cookies',
        blocks: [
          '5.1. For visitor statistics the website uses Yandex Metrica (including Webvisor) and Google Analytics. These services store their own cookies in your browser and collect anonymised information about the visit: which pages were opened, clicks and actions on the page, device and browser type.',
          '5.2. This information helps us make the site more convenient. You can turn its collection off by blocking cookies in your browser settings or with a content blocker.',
        ],
      },
      {
        title: '6. Retention',
        blocks: [
          '6.1. Request data is kept for as long as it is needed for the purposes in section 3, or until you withdraw your consent, unless the law requires a longer period.',
        ],
      },
      {
        title: '7. Data protection',
        blocks: [
          '7.1. The website works over HTTPS. Form fields are validated on the server and the request rate is limited. Only staff who work with clients have access to requests.',
        ],
      },
      {
        title: '8. Children’s data',
        blocks: [
          '8.1. A request for a child to attend a camp is submitted by a parent or legal guardian, who thereby confirms their right to act in the child’s interests.',
        ],
      },
      {
        title: '9. Your rights',
        blocks: [
          '9.1. You have the right to find out what data we hold about you, to have it corrected or deleted, and to withdraw your consent to processing.',
          '9.2. To do so, email info@az-group.kz or call +7 700 312 79 12.',
        ],
      },
      {
        title: '10. Changes to this Policy',
        blocks: [
          '10.1. We may update this Policy. The current version is always published on this page.',
        ],
      },
    ],
    details: {
      title: '11. Operator contacts',
      rows: [
        { label: 'Company', value: 'AZ GROUP LLC', href: '' },
        { label: 'Brand', value: 'ASCORA Education', href: '' },
        { label: 'Address', value: '27 Askar Tokpanov St., Astana, Republic of Kazakhstan', href: '' },
        { label: 'Phone', value: '+7 700 312 79 12', href: 'tel:+77003127912' },
        { label: 'Email', value: 'info@az-group.kz', href: 'mailto:info@az-group.kz' },
      ],
    },
  },
};
