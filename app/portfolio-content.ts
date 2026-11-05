export type WorkTone = "violet" | "sand" | "blue" | "rose";
export type VideoFormat = "portrait" | "landscape";
export type Language = "ru" | "en";

export type WorkTranslation = {
  title: string;
  category: string;
  description: string;
  details: string[];
};

export type PortfolioWork = {
  id: string;
  title: string;
  category: string;
  duration?: string;
  // portrait: вертикальный ролик; landscape: горизонтальный.
  // Если поле не указано, используется portrait.
  format?: VideoFormat;
  description: string;
  details: string[];
  videoUrl?: string;
  posterUrl?: string;
  tone: WorkTone;
  // Английская версия текстов. Видео, обложка и длительность общие.
  en?: WorkTranslation;
};

export const siteContent = {
  name: "Виктор Острецов",
  shortName: "виктор",
  role: "Видеомонтажёр",
  headline: "Монтаж, который держит внимание",
  headlineLead: "Монтаж, который",
  headlineAccent: "держит внимание",
  intro:
    "Собираю горизонтальные и вертикальные видео. Выстраиваю темп, субтитры, звук и движение так, чтобы ролик хотелось досмотреть.",
  aboutTitle: "Делаю монтаж проще для вас и понятнее для зрителя.",
  about:
    "Работаю с вертикальными и горизонтальными роликами любого жанра. Беру черновой материал и прохожу путь: от создания идеи до полноценной её реализации. Создаю видео с историей и с живым ритмом.",
  benefits: [
    "От идеи до готового видео",
    "Согласованные сроки",
    "Больше времени на ваше дело",
  ],
  contactTitle: "Хочешь облегчить монтаж?",
  contactText:
    "Расскажи, какой ролик нужен, какой у него хронометраж и срок. Я посмотрю материалы и предложу подход к монтажу.",
  telegramLabel: "Освободить время от монтажа",
  telegramUrl: "https://t.me/viktor_ovn",
  email: "",
  featuredWorkId: "work-04",
  metadataTitle: "Виктор Острецов | Видеомонтаж",
  metadataDescription:
    "Портфолио видеомонтажёра Виктора Острецова. Вертикальные и горизонтальные видео: от идеи до готового ролика.",
  en: {
    name: "Viktor Ostretsov",
    shortName: "viktor",
    role: "Video editor",
    headline: "Editing that holds attention",
    headlineLead: "Editing that",
    headlineAccent: "holds attention",
    intro:
      "I edit landscape and vertical videos, bringing pacing, captions, sound and motion together to keep people watching.",
    aboutTitle: "I make editing easier for you and your videos clearer for your audience.",
    about:
      "I work with vertical and landscape videos across genres. I take raw footage all the way from the initial idea to a finished video, creating a clear story with a lively rhythm.",
    benefits: [
      "From idea to finished video",
      "Agreed deadlines",
      "More time for your business",
    ],
    contactTitle: "Want to make editing easier?",
    contactText:
      "Tell me what kind of video you need, its length and your deadline. I’ll review your footage and suggest an approach to the edit.",
    telegramLabel: "Save time on editing",
    metadataTitle: "Viktor Ostretsov | Video Editing",
    metadataDescription:
      "Viktor Ostretsov’s video editing portfolio. Vertical and landscape videos, from the first idea to the final edit.",
  },
};

export const works: PortfolioWork[] = [
  {
    id: "work-01",
    format: "portrait",
    title: "Рекламный ролик: до и после",
    category: "Рекламный ролик",
    duration: "0:38",
    description:
      "Вертикальный монтаж с плотным ритмом, акцентными субтитрами и звуковыми деталями.",
    details: ["Монтаж", "Субтитры", "Саунд-дизайн","Цвет"],
    videoUrl: "/videos/sravnenie-port.mp4",
    posterUrl: "/posters/sravnenie-port.jpg",
    tone: "violet",
    en: {
      title: "Promotional video: before and after",
      category: "Promotional video",
      description:
        "A vertical edit with tight pacing, expressive captions and detailed sound design.",
      details: ["Editing", "Captions", "Sound design", "Color grading"],
    },
  },
  {
    id: "work-02",
    format: "portrait",
    title: "Работа 02",
    category: "Reels для соцсетей",
    duration: "0:28",
    description:
      "Короткий клип, в котором склейки, движение кадра и звук работают как единый темп.",
    details: ["Монтаж", "Динамика кадра", "Цвет", "Субтитры", "Саунд-дизайн"],
    videoUrl: "/videos/first.mp4",
    posterUrl: "/posters/first.png",
    tone: "sand",
    en: {
      title: "Project 02",
      category: "Social media reel",
      description:
        "A short clip where cuts, camera movement and sound come together in one cohesive rhythm.",
      details: ["Editing", "Frame animation", "Color grading", "Captions", "Sound design"],
    },
  },
  {
    id: "work-03",
    format: "landscape",
    title: "История метро",
    category: "Видео для YouTube",
    duration: "0:13",
    description:
      "Фрагмент познавательного видео об истории метро. Монтаж, цветокоррекция и моушн-дизайн помогают наглядно раскрыть тему.",
    details: ["Монтаж", "Цветокоррекция", "Моушн-дизайн"],
    videoUrl: "/videos/metro.mp4",
    posterUrl: "/posters/metro.jpg",
    tone: "blue",
    en: {
      title: "Metro history",
      category: "YouTube video",
      description:
        "An excerpt from an educational video about metro history, combining editing, color grading and motion design to bring the story to life.",
      details: ["Editing", "Color grading", "Motion design"],
    },
  },
  {
    id: "work-04",
    format: "portrait",
    title: "Охватный рилс",
    category: "Reels для соцсетей",
    duration: "0:10",
    description:
      "Короткий рилс с динамичным монтажом, цветокоррекцией и акцентными субтитрами.",
    details: ["Монтаж", "Цветокоррекция", "Субтитры"],
    videoUrl: "/videos/reach-reel.mp4",
    posterUrl: "/posters/reach-reel.jpg",
    tone: "rose",
    en: {
      title: "Discovery reel",
      category: "Social media reel",
      description:
        "A short reel with dynamic editing, color grading and expressive captions.",
      details: ["Editing", "Color grading", "Captions"],
    },
  },
];
