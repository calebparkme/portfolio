export type Dictionary = {
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  nav: {
    about: string;
    gallery: string;
    contact: string;
  };
  languageSwitch: {
    label: string;
  };
  hero: {
    kicker: string;
    name: string;
    description: string[];
  };
  about: {
    kicker: string;
    heading: string[];
    body: string[];
  };
  gallery: {
    kicker: string;
    closeLabel: string;
    prevLabel: string;
    nextLabel: string;
  };
  contact: {
    kicker: string;
    heading: string;
    links: {
      youtube: string;
      instagram: string;
      email: string;
    };
  };
  footer: {
    rights: string;
  };
};
