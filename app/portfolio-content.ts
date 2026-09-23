export type WorkTone = "violet" | "sand" | "blue" | "rose";
export type VideoFormat = "portrait" | "landscape";

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
};

export const siteContent = {
  name: "Виктор Острецов",
  shortName: "виктор",
  role: "Видеомонтажёр",
  headline: "Монтаж, который держит внимание",
  intro:
    "Собираю горизонтальные и вертикальные видео. Выстраиваю темп, субтитры, звук и движение так, чтобы ролик хотелось досмотреть.",
  about:
    "Я Виктор, видеомонтажёр. Работаю с Reels, Shorts и рекламными роликами. Беру черновой материал и собираю из него цельную историю с ритмом, аккуратной типографикой, саунд-дизайном и цветокоррекцией.",
  contactText:
    "Расскажи, какой ролик нужен, какой у него хронометраж и срок. Я посмотрю материалы и предложу подход к монтажу.",
  telegramUrl: "https://t.me/Ostretsovv",
  email: "",
};

export const works: PortfolioWork[] = [
  {
    id: "work-01",
    format: "portrait",
    title: "Работа 01",
    category: "Рекламный ролик",
    duration: "0:38",
    description:
      "Вертикальный монтаж с плотным ритмом, акцентными субтитрами и звуковыми деталями.",
    details: ["Монтаж", "Субтитры", "Саунд-дизайн","Цвет"],
    videoUrl: "/videos/cond-port.mp4",
    posterUrl: "/posters/cond-port.png",
    tone: "violet",
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
  },
  // Шаблон горизонтального кейса. Заполни тексты и пути к своим файлам.
  {
    id: "work-03",
    format: "landscape",
    title: "Горизонтальный проект",
    category: "Новый проект",
    duration: "",
    description: "Скоро здесь появится новый проект.",
    details: [],
    videoUrl: "", // Например: "/videos/work-03.mp4"
    posterUrl: "", // Например: "/posters/work-03.webp"
    tone: "blue",
  },
  // Шаблон вертикального кейса. Пустые пути не вызывают загрузку файлов.
  {
    id: "work-04",
    format: "portrait",
    title: "Вертикальный проект",
    category: "Новый проект",
    duration: "",
    description: "Скоро здесь появится новый проект.",
    details: [],
    videoUrl: "", // Например: "/videos/work-04.mp4"
    posterUrl: "", // Например: "/posters/work-04.webp"
    tone: "rose",
  },
];
