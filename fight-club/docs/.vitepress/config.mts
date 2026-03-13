import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Fight Club Docs",
  description: "Architecture, combat system reference, and engineering docs for Fight Club.",
  base: "/Mfight/",
  srcExclude: [
    "**/backup-points/**",
    "**/balance/*.json",
    "README.md",
    "SUMMARY.md",
    "architecture/README.md",
    "decisions/README.md",
  ],
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    siteTitle: "Fight Club Docs",
    nav: [
      { text: "Home", link: "/" },
      { text: "Gameplay", link: "/gameplay/" },
      { text: "Systems", link: "/systems/" },
      { text: "Architecture", link: "/architecture/" },
      { text: "Decisions", link: "/decisions/" },
      { text: "Publishing", link: "/gitbook-publish-setup" },
    ],
    sidebar: {
      "/gameplay/": [
        {
          text: "Gameplay",
          items: [
            { text: "Gameplay Hub", link: "/gameplay/" },
            { text: "Combat Design Reference", link: "/architecture/combat-design-reference" },
            { text: "Combat System Roadmap", link: "/architecture/combat-system-roadmap" },
          ],
        },
      ],
      "/systems/": [
        {
          text: "Systems",
          items: [
            { text: "Systems Hub", link: "/systems/" },
            { text: "Architecture Overview", link: "/architecture/overview" },
            { text: "ADR-001: Modular Headless Core", link: "/decisions/ADR-001-architecture" },
            { text: "GitBook Publish Setup", link: "/gitbook-publish-setup" },
          ],
        },
      ],
      "/architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Architecture Hub", link: "/architecture/" },
            { text: "Overview", link: "/architecture/overview" },
            { text: "Combat Design Reference", link: "/architecture/combat-design-reference" },
            { text: "Combat System", link: "/architecture/combat/" },
            { text: "Combat Model And Flow", link: "/architecture/combat/model-and-flow" },
            { text: "Combat Formulas And Effects", link: "/architecture/combat/formulas-and-effects" },
            { text: "Combat Integrations And Verification", link: "/architecture/combat/integrations-and-verification" },
            { text: "Combat Verification And Tests", link: "/architecture/combat/tests-and-traceability" },
            { text: "Combat System Roadmap", link: "/architecture/combat-system-roadmap" },
          ],
        },
      ],
      "/decisions/": [
        {
          text: "Architecture Decisions",
          items: [
            { text: "Index", link: "/decisions/" },
            { text: "ADR-001: Modular Headless Core", link: "/decisions/ADR-001-architecture" },
          ],
        },
      ],
      "/": [
        {
          text: "Documentation",
          items: [
            { text: "Home", link: "/" },
            { text: "Gameplay", link: "/gameplay/" },
            { text: "Systems", link: "/systems/" },
            { text: "Architecture", link: "/architecture/" },
            { text: "Decisions", link: "/decisions/" },
            { text: "GitBook Publish Setup", link: "/gitbook-publish-setup" },
          ],
        },
      ],
    },
    outline: {
      level: [2, 3],
      label: "On This Page",
    },
    docFooter: {
      prev: "Previous",
      next: "Next",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/dtphsd/Mfight" }],
    search: {
      provider: "local",
    },
    footer: {
      message: "Fight Club documentation lives in the repository and ships with the code.",
      copyright: "Fight Club Project",
    },
  },
});
