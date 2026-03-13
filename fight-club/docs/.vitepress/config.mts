import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Fight Club Docs",
  description: "Architecture, combat system reference, and engineering docs for Fight Club.",
  base: "/Mfight/",
  srcExclude: ["**/backup-points/**", "**/balance/*.json"],
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    siteTitle: "Fight Club Docs",
    nav: [
      { text: "Home", link: "/" },
      { text: "Architecture", link: "/architecture/" },
      { text: "Decisions", link: "/decisions/" },
      { text: "GitBook Setup", link: "/gitbook-publish-setup" },
    ],
    sidebar: {
      "/architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Overview", link: "/architecture/" },
            { text: "Combat Design Reference", link: "/architecture/combat-design-reference" },
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
          text: "Docs",
          items: [
            { text: "Home", link: "/" },
            { text: "Architecture", link: "/architecture/" },
            { text: "GitBook Publish Setup", link: "/gitbook-publish-setup" },
          ],
        },
      ],
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
