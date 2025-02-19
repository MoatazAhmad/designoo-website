/**
 * @fileoverview Improved code for navigation toggling, image loading effects, theme switching, and language selection.
 * Improvements include enhanced quality, efficiency, readability, and error handling.
 * References: [MDN Web Docs on DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event),
 * [MDN Web Docs on addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
 */

// Wrap all code to ensure the DOM is loaded before running scripts.
document.addEventListener("DOMContentLoaded", () => {
  // --- Element Selections with Null Checks ---
  const menuToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector("#main-navigation");
  const hamburgerImg = document.querySelector(".hamburger-img");
  const hamburgerImgClosed = document.querySelector(".hamburger-img-closed");
  const themeToggleImages = document.querySelectorAll("#themeToggleImages");
  const themeToggleButton = document.getElementById("theme-toggle");
  const htmlElement = document.documentElement;
  const languageSelector = document.querySelector(".language-selector");

  // --- Navigation Menu Functionality ---
  if (menuToggle && mainNav && hamburgerImg && hamburgerImgClosed) {
    /**
     * Toggle the menu visibility.
     */
    const toggleMenu = () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      // Ensure the attribute is set as a string.
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      mainNav.classList.toggle("hidden");
      hamburgerImg.classList.toggle("hidden");
      hamburgerImgClosed.classList.toggle("hidden");
    };

    // Toggle menu on button click.
    menuToggle.addEventListener("click", toggleMenu);

    // Close menu when clicking outside.
    document.addEventListener("click", (event) => {
      if (
        !menuToggle.contains(event.target) &&
        !mainNav.contains(event.target)
      ) {
        menuToggle.setAttribute("aria-expanded", "false");
        mainNav.classList.add("hidden");
        hamburgerImg.classList.remove("hidden");
        hamburgerImgClosed.classList.add("hidden");
      }
    });

    // Close menu on ESC key press.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menuToggle.setAttribute("aria-expanded", "false");
        mainNav.classList.add("hidden");
        hamburgerImg.classList.remove("hidden");
        hamburgerImgClosed.classList.add("hidden");
      }
    });
  }

  // --- Blurred Image Loading Effect ---
  const blurredImageDivs = document.querySelectorAll(".blurred-img");
  blurredImageDivs.forEach((div) => {
    const img = div.querySelector("img");
    const loaded = () => div.classList.add("loaded");
    if (img) {
      if (img.complete) {
        loaded();
      } else {
        img.addEventListener("load", loaded);
      }
    }
  });

  // --- Theme Toggle Functionality ---
  /**
   * Update the theme images based on the current theme.
   * @param {string} theme - "light" or "dark"
   */
  const updateThemeImages = (theme) => {
    themeToggleImages.forEach((element) => {
      element.src =
        theme === "light"
          ? removeWhiteSuffix(element.src)
          : addWhiteSuffix(element.src);
    });
  };

  /**
   * Update the text of the theme toggle button.
   */
  const updateButtonText = () => {
    const currentTheme = htmlElement.getAttribute("data-theme");
    if (themeToggleButton) {
      themeToggleButton.textContent = currentTheme === "dark" ? "☀️" : "🌙";
    }
  };

  /**
   * Toggle the theme between dark and light.
   */
  const toggleTheme = () => {
    const currentTheme = htmlElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    htmlElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeImages(newTheme);
    updateButtonText();
    document.body.classList.toggle("dark-theme", newTheme === "dark");
  };

  // Apply saved theme or default to light.
  const savedTheme = localStorage.getItem("theme") || "light";
  htmlElement.setAttribute("data-theme", savedTheme);
  updateThemeImages(savedTheme);
  updateButtonText();

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
  }

  // Listen for system color scheme changes.
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  systemDark.addEventListener("change", (e) => {
    const newTheme = e.matches ? "dark" : "light";
    htmlElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeImages(newTheme);
    updateButtonText();
    document.body.classList.toggle("dark-theme", newTheme === "dark");
  });

  // --- Language Selection and Translation ---
  // Assumes that `translatePage`, `translateImageAlts`, and `translateAriaLabels` functions,
  // as well as the `translations` object, are defined elsewhere.
  const savedLanguage = localStorage.getItem("preferredLanguage");
  if (languageSelector) {
    if (savedLanguage) {
      languageSelector.value = savedLanguage;
      translatePage(savedLanguage);
    } else {
      // Auto-detect browser language.
      const browserLang = navigator.language.slice(0, 2);
      if (translations && translations[browserLang]) {
        languageSelector.value = browserLang;
        translatePage(browserLang);
      } else {
        translatePage("en");
      }
    }
  }

  // Update alt attributes and ARIA labels based on the current language.
  translateImageAlts(document.documentElement.lang);
  translateAriaLabels(document.documentElement.lang);

  // Change language on selection.
  if (languageSelector) {
    languageSelector.addEventListener("change", (e) => {
      const selectedLang = e.target.value;
      translatePage(selectedLang);
      localStorage.setItem("preferredLanguage", selectedLang);
      // Update image alt texts and aria labels after language change.
      translateImageAlts(selectedLang);
      translateAriaLabels(selectedLang);
    });
  }
});

/**
 * Modify the white suffix in image URLs.
 * @param {string} src - The image source URL.
 * @param {string} action - "toggle", "add", or "remove"
 * @returns {string} The modified image URL.
 */
function modifyWhiteSuffix(src, action) {
  const pathParts = src.split("/");
  const fullFilename = pathParts.pop();
  const [filename, extension] = fullFilename.split(".");

  if (!extension) {
    throw new Error("Filename must have an extension");
  }

  const suffix = "-white";
  let newFilename;

  switch (action) {
    case "toggle":
      newFilename = filename.endsWith(suffix)
        ? filename.slice(0, -suffix.length)
        : filename + suffix;
      break;
    case "add":
      newFilename = filename + suffix;
      break;
    case "remove":
      newFilename = filename.endsWith(suffix)
        ? filename.slice(0, -suffix.length)
        : filename;
      break;
    default:
      throw new Error("Invalid action");
  }

  const newFullFilename = `${newFilename}.${extension}`;
  pathParts.push(newFullFilename);
  return pathParts.join("/");
}

function toggleWhiteSuffix(src) {
  return modifyWhiteSuffix(src, "toggle");
}

function addWhiteSuffix(src) {
  return modifyWhiteSuffix(src, "add");
}

function removeWhiteSuffix(src) {
  return modifyWhiteSuffix(src, "remove");
}

// Translation content

/**
 * @fileoverview Translation data for the Designo website.
 * Contains translations, attribute labels, and image alt texts for supported languages.
 * All objects are frozen to ensure immutability and prevent accidental modifications.
 *
 * References:
 * - MDN: Object.freeze – https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 * - JSDoc Documentation – https://jsdoc.app/
 */

const translations = Object.freeze({
  en: Object.freeze({
    title: "Designo - Custom Web Design and Digital Branding Solutions",
    metaDescription:
      "Designo offers award-winning custom web design and digital branding solutions. With over 10 years of experience, we create fully responsive websites, app designs, and engaging brand experiences. Contact us to learn more.",
    ogTitle: "Designo - Custom Web Design and Digital Branding Solutions",
    ogDescription:
      "Designo offers award-winning custom web design and digital branding solutions. With over 10 years of experience, we create fully responsive websites, app designs, and engaging brand experiences. Contact us to learn more.",
    header: Object.freeze({
      navItems: Object.freeze({
        aboutUs: "About Us",
        locations: "Locations",
        contact: "Contact",
        toggleTheme: "🌓",
      }),
    }),
    heroSection: Object.freeze({
      heading: "Award-winning custom designs and digital branding solutions",
      description:
        "With over 10 years in the industry, we are experienced in creating fully responsive websites, app design, and engaging brand experiences. Find out more about our services.",
      learnMore: "Learn More",
    }),
    projectsSection: Object.freeze({
      webDesign: Object.freeze({
        title: "Web Design",
        viewProjects: "View Projects",
      }),
      appDesign: Object.freeze({
        title: "App Design",
        viewProjects: "View Projects",
      }),
      graphicDesign: Object.freeze({
        title: "Graphic Design",
        viewProjects: "View Projects",
      }),
    }),
    companyValues: Object.freeze({
      passionate: Object.freeze({
        title: "Passionate",
        description:
          "Each project starts with an in-depth brand research to ensure we only create products that serve a purpose. We merge art, design, and technology into exciting new solutions.",
      }),
      resourceful: Object.freeze({
        title: "Resourceful",
        description:
          "Everything that we do has a strategic purpose. We use an agile approach in all of our projects and value customer collaboration. It guarantees superior results that fulfill our clients’ needs.",
      }),
      friendly: Object.freeze({
        title: "Friendly",
        description:
          "We are a group of enthusiastic folks who know how to put people first. Our success depends on our customers, and we strive to give them the best experience a company can provide.",
      }),
    }),
    ctaSection: Object.freeze({
      heading: "Let’s talk about your project",
      description:
        "Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.",
      getInTouch: "Get in Touch",
    }),
    footer: Object.freeze({
      address: Object.freeze({
        office: "Designo Central Office",
        street: "3886 Wellington Street",
        city: "Toronto, Ontario M9C 3J5",
        contactUs: "Contact Us (Central Office)",
        phone: "P: +1 253-863-8967",
        email: "M: contact@designo.com",
      }),
      socialLinks: Object.freeze({
        facebook: "Visit our Facebook page",
        youtube: "Watch our YouTube videos",
        twitter: "Follow us on Twitter",
        pinterest: "Explore our Pinterest boards",
        instagram: "See our Instagram photos",
      }),
      navItems: Object.freeze({
        aboutUs: "About Us",
        locations: "Locations",
        contact: "Contact",
        toggleTheme: "🌓",
      }),
    }),
    loadingText: "Loading...",
    graphicDesignProjects: Object.freeze({
      title: "Graphic Design",
      header: Object.freeze({
        aboutUs: "About Us",
        locations: "Locations",
        contact: "Contact",
        toggleTheme: "🌓",
      }),
      heroSection: Object.freeze({
        heading: "Graphic Design",
        description:
          "We deliver eye-catching branding materials that are tailored to meet your business objectives.",
      }),
      projects: Object.freeze([
        Object.freeze({
          title: "Eyecam",
          description:
            "Product that lets you edit your favorite photos and videos at any time",
        }),
        Object.freeze({
          title: "Faceit",
          description:
            "Get to meet your favorite internet superstar with the faceit app",
        }),
        Object.freeze({
          title: "Todo",
          description:
            "A todo app that features cloud sync with light and dark mode",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "Let’s talk about your project",
        description:
          "Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.",
        getInTouch: "Get in Touch",
      }),
      footer: Object.freeze({
        address: Object.freeze({
          office: "Designo Central Office",
          street: "3886 Wellington Street",
          city: "Toronto, Ontario M9C 3J5",
          contactUs: "Contact Us (Central Office)",
          phone: "P: +1 253-863-8967",
          email: "M: contact@designo.com",
        }),
        socialLinks: Object.freeze({
          facebook: "Visit our Facebook page",
          youtube: "Watch our YouTube videos",
          twitter: "Follow us on Twitter",
          pinterest: "Explore our Pinterest boards",
          instagram: "See our Instagram photos",
        }),
        navItems: Object.freeze({
          aboutUs: "About Us",
          locations: "Locations",
          contact: "Contact",
        }),
      }),
    }),
    aboutUs: Object.freeze({
      title: "About Us - Designo Creative Agency",
      metaDescription:
        "Founded in 2010, Designo is a creative agency that produces lasting results. We craft innovative brands, products, and digital experiences for startups, corporations, and nonprofits.",
      heroSection: Object.freeze({
        heading: "About Us",
        description:
          "Founded in 2010, we are a creative agency that produces lasting results for our clients. We’ve partnered with many startups, corporations, and nonprofits alike to craft designs that make real impact. We’re always looking forward to creating brands, products, and digital experiences that connect with our clients' audiences.",
      }),
      worldClassTalent: Object.freeze({
        heading: "World-class talent",
        description1:
          "We are a crew of strategists, problem-solvers, and technologists. Every design is thoughtfully crafted from concept to launch, ensuring success in its given market. We are constantly updating our skills in a myriad of platforms.",
        description2:
          "Our team is multi-disciplinary and we are not merely interested in form — content and meaning are just as important. We give great importance to craftsmanship, service, and prompt delivery. Clients have always been impressed with our high-quality outcomes that encapsulate their brand’s story and mission.",
      }),
      theRealDeal: Object.freeze({
        heading: "The real deal",
        description1:
          "As strategic partners in our clients’ businesses, we are ready to take on any challenge as our own. Solving real problems requires empathy and collaboration, and we strive to bring a fresh perspective to every opportunity. We make design and technology more accessible and give you tools to measure success.",
        description2:
          "We are visual storytellers in appealing and captivating ways. By combining business and marketing strategies, we inspire audiences to take action and drive real results.",
      }),
      ctaSection: Object.freeze({
        heading: "Let’s talk about your project",
        description:
          "Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.",
        getInTouch: "Get in Touch",
      }),
    }),
    webDesignProjects: Object.freeze({
      title: "Designo Web Design Projects - Innovative Digital Solutions",
      metaDescription:
        "Designo offers innovative web design projects that deliver exceptional digital experiences. Explore our portfolio of creative websites, from multi-carrier shipping solutions to dynamic media players.",
      heroSection: Object.freeze({
        heading: "Our Web Design Projects",
        description:
          "We build websites that serve as powerful marketing tools and bring memorable brand experiences.",
      }),
      projects: Object.freeze([
        Object.freeze({
          title: "Express",
          description:
            "A multi-carrier shipping website for ecommerce businesses",
        }),
        Object.freeze({
          title: "Transfer",
          description:
            "Site for low-cost money transfers and sending money within seconds",
        }),
        Object.freeze({
          title: "Photon",
          description:
            "A state-of-the-art music player with high-resolution audio and DSP effects",
        }),
        Object.freeze({
          title: "Builder",
          description:
            "A responsive website builder tool designed for ease of use and modern design trends",
        }),
        Object.freeze({
          title: "Blogr",
          description:
            "Blogr is a platform for creating an online blog or publication",
        }),
        Object.freeze({
          title: "Camp",
          description:
            "Get expert training in coding, data, design, and digital marketing",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "Let’s talk about your project",
        description:
          "Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.",
        getInTouch: "Get in Touch",
      }),
    }),
    appDesignProjects: Object.freeze({
      title: "App Design | Designo",
      metaDescription:
        "App Design – Mobile designs that bring intuitive digital solutions right at your fingertips. Discover our innovative projects at Designo.",
      heroSection: Object.freeze({
        heading: "App Design",
        description:
          "Our mobile designs bring intuitive digital solutions to your customers right at their fingertips.",
      }),
      projects: Object.freeze([
        Object.freeze({
          title: "Airfilter",
          description:
            "Solving the problem of poor indoor air quality by filtering the air",
        }),
        Object.freeze({
          title: "Eyecam",
          description:
            "Product that lets you edit your favorite photos and videos at any time",
        }),
        Object.freeze({
          title: "Faceit",
          description:
            "Get to meet your favorite internet superstar with the faceit app",
        }),
        Object.freeze({
          title: "Todo",
          description:
            "A todo app that features cloud sync with light and dark mode",
        }),
        Object.freeze({
          title: "Loopstudios",
          description: "A VR experience app made for Loopstudios",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "Let’s talk about your project",
        description:
          "Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.",
        getInTouch: "Get in Touch",
      }),
    }),
    contactTranslations: Object.freeze({
      title: "Contact Us | Designo",
      metaDescription:
        "Get in touch with Designo. We are here to help you with your web design and digital branding needs.",
      heroSection: Object.freeze({
        heading: "Contact Us",
        description:
          "Get in touch with Designo. We are here to help you with your web design and digital branding needs.",
      }),
      contactForm: Object.freeze({
        name: "Name",
        email: "Email",
        phone: "Phone",
        message: "Message",
        submit: "Submit",
      }),
      ctaSection: Object.freeze({
        heading: "Let’s talk about your project",
        description:
          "Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.",
        getInTouch: "Get in Touch",
      }),
    }),
    locationsTranslations: Object.freeze({
      title: "Our Locations | Designo",
      metaDescription:
        "Find Designo's offices around the world. We have locations in Canada, Australia, and the United Kingdom.",
      heroSection: Object.freeze({
        heading: "Our Locations",
        description:
          "Find Designo's offices around the world. We have locations in Canada, Australia, and the United Kingdom.",
      }),
      locations: Object.freeze([
        Object.freeze({
          country: "Canada",
          office: "Designo Central Office",
          address1: "3886 Wellington Street, Toronto, Ontario M9C 3J5",
          address2: "Toronto, Ontario M9C 3J5",
          contact: "Contact Us (Central Office)",
          phone: "P: +1 253-863-8967",
          email: "M: contact@designo.com",
        }),
        Object.freeze({
          country: "Australia",
          office: "Designo AU Office",
          address: "19 Balonne Street, New South Wales 2443",
          contact: "Contact Us (AU Office)",
          phone: "P: (02) 6720 9092",
          email: "M: contact@designo.au",
        }),
        Object.freeze({
          country: "United Kingdom",
          office: "Designo UK Office",
          address1: "13 Colorado Way",
          address2: "Rhyd-y-fro SA8 9GA",
          contact: "Contact Us (UK Office)",
          phone: "P: 078 3115 1400",
          email: "M: contact@designo.uk",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "Let’s talk about your project",
        description:
          "Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.",
        getInTouch: "Get in Touch",
      }),
    }),
  }),
  ar: Object.freeze({
    title: "ديزينو - تصميم مواقع ويب مخصص وحلول العلامات التجارية الرقمية",
    metaDescription:
      "تقدم ديزينو تصميم مواقع ويب مخصص وحلول العلامات التجارية الرقمية الحائزة على جوائز. مع أكثر من 10 سنوات من الخبرة، نقوم بإنشاء مواقع ويب متجاوبة بالكامل، وتصميم التطبيقات، وتجارب العلامات التجارية الجذابة. اتصل بنا لمعرفة المزيد.",
    ogTitle: "ديزينو - تصميم مواقع ويب مخصص وحلول العلامات التجارية الرقمية",
    ogDescription:
      "تقدم ديزينو تصميم مواقع ويب مخصص وحلول العلامات التجارية الرقمية الحائزة على جوائز. مع أكثر من 10 سنوات من الخبرة، نقوم بإنشاء مواقع ويب متجاوبة بالكامل، وتصميم التطبيقات، وتجارب العلامات التجارية الجذابة. اتصل بنا لمعرفة المزيد.",
    ogUrl: "https://www.yourwebsite.com",
    ogType: "موقع ويب",
    header: Object.freeze({
      navItems: Object.freeze({
        aboutUs: "معلومات عنا",
        locations: "الاماكن",
        contact: "اتصل بنا",
        toggleTheme: "🌓",
      }),
    }),
    heroSection: Object.freeze({
      heading: "تصاميم مخصصة حائزة على جوائز وحلول العلامات التجارية الرقمية",
      description:
        "مع أكثر من 10 سنوات في الصناعة، نحن متمرسون في إنشاء مواقع ويب متجاوبة بالكامل، وتصميم التطبيقات، وتجارب العلامات التجارية الجذابة. اكتشف المزيد عن خدماتنا.",
      learnMore: "تعرف على المزيد",
    }),
    projectsSection: Object.freeze({
      webDesign: Object.freeze({
        title: "تصميم مواقع ويب",
        viewProjects: "عرض المشاريع",
      }),
      appDesign: Object.freeze({
        title: "تصميم التطبيقات",
        viewProjects: "عرض المشاريع",
      }),
      graphicDesign: Object.freeze({
        title: "تصميم الجرافيك",
        viewProjects: "عرض المشاريع",
      }),
    }),
    companyValues: Object.freeze({
      passionate: Object.freeze({
        title: "شغوف",
        description:
          "يبدأ كل مشروع ببحث معمق عن العلامة التجارية لضمان أننا نصنع منتجات تخدم غرضًا. نحن نمزج الفن والتصميم والتكنولوجيا في حلول جديدة ومثيرة.",
      }),
      resourceful: Object.freeze({
        title: "مورد",
        description:
          "كل ما نقوم به له غرض استراتيجي. نحن نستخدم نهجًا مرنًا في جميع مشاريعنا ونقدر التعاون مع العملاء. يضمن ذلك نتائج متفوقة تلبي احتياجات عملائنا.",
      }),
      friendly: Object.freeze({
        title: "ودود",
        description:
          "نحن مجموعة من الأشخاص المتحمسين الذين يعرفون كيفية وضع الناس في المقام الأول. يعتمد نجاحنا على عملائنا، ونسعى جاهدين لتقديم أفضل تجربة يمكن أن توفرها الشركة.",
      }),
    }),
    ctaSection: Object.freeze({
      heading: "دعنا نتحدث عن مشروعك",
      description:
        "هل أنت مستعد للانتقال إلى المستوى التالي؟ اتصل بنا اليوم واكتشف كيف يمكن لخبرتنا أن تساعد عملك على النمو.",
      getInTouch: "تواصل معنا",
    }),
    footer: Object.freeze({
      address: Object.freeze({
        office: "المكتب المركزي لديزينو",
        street: "3886 شارع ويلينغتون",
        city: "تورونتو، أونتاريو M9C 3J5",
        contactUs: "اتصل بنا (المكتب المركزي)",
        phone: "هاتف: +1 253-863-8967",
        email: "البريد الإلكتروني: contact@designo.com",
      }),
      socialLinks: Object.freeze({
        facebook: "قم بزيارة صفحتنا على فيسبوك",
        youtube: "شاهد مقاطع الفيديو الخاصة بنا على يوتيوب",
        twitter: "تابعنا على تويتر",
        pinterest: "استكشف لوحاتنا على بينتيريست",
        instagram: "شاهد صورنا على إنستغرام",
      }),
      navItems: Object.freeze({
        aboutUs: "معلومات عنا",
        locations: "الاماكن",
        contact: "اتصل بنا",
        toggleTheme: "🌓",
      }),
    }),
    loadingText: "جار التحميل...",
    graphicDesignProjects: Object.freeze({
      title: "تصميم الجرافيك",
      header: Object.freeze({
        aboutUs: "معلومات عنا",
        locations: "الاماكن",
        contact: "اتصل بنا",
        toggleTheme: "🌓",
      }),
      heroSection: Object.freeze({
        heading: "تصميم الجرافيك",
        description:
          "نقدم مواد العلامة التجارية الجذابة التي تم تصميمها لتلبية أهداف عملك.",
      }),
      projects: Object.freeze([
        Object.freeze({
          title: "Eyecam",
          description:
            "منتج يتيح لك تحرير صورك ومقاطع الفيديو المفضلة لديك في أي وقت",
        }),
        Object.freeze({
          title: "Faceit",
          description: "تعرف على نجم الإنترنت المفضل لديك مع تطبيق faceit",
        }),
        Object.freeze({
          title: "Todo",
          description:
            "تطبيق المهام الذي يتميز بمزامنة السحابة مع الوضعين الفاتح والداكن",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "دعنا نتحدث عن مشروعك",
        description:
          "هل أنت مستعد للانتقال إلى المستوى التالي؟ اتصل بنا اليوم واكتشف كيف يمكن لخبرتنا أن تساعد عملك على النمو.",
        getInTouch: "تواصل معنا",
      }),
      footer: Object.freeze({
        address: Object.freeze({
          office: "المكتب المركزي لديزينو",
          street: "3886 شارع ويلينغتون",
          city: "تورونتو، أونتاريو M9C 3J5",
          contactUs: "اتصل بنا (المكتب المركزي)",
          phone: "هاتف: +1 253-863-8967",
          email: "البريد الإلكتروني: contact@designo.com",
        }),
        socialLinks: Object.freeze({
          facebook: "قم بزيارة صفحتنا على فيسبوك",
          youtube: "شاهد مقاطع الفيديو الخاصة بنا على يوتيوب",
          twitter: "تابعنا على تويتر",
          pinterest: "استكشف لوحاتنا على بينتيريست",
          instagram: "شاهد صورنا على إنستغرام",
        }),
        navItems: Object.freeze({
          aboutUs: "معلومات عنا",
          locations: "الاماكن",
          contact: "اتصل بنا",
        }),
      }),
    }),
    aboutUs: Object.freeze({
      title: "معلومات عنا - وكالة ديزينو الإبداعية",
      metaDescription:
        "تأسست ديزينو في عام 2010، وهي وكالة إبداعية تنتج نتائج دائمة. نصنع علامات تجارية مبتكرة ومنتجات وتجارب رقمية للشركات الناشئة والشركات والمؤسسات غير الربحية.",
      heroSection: Object.freeze({
        heading: "معلومات عنا",
        description:
          "تأسست في عام 2010، نحن وكالة إبداعية تنتج نتائج دائمة لعملائنا. لقد تعاوننا مع العديد من الشركات الناشئة والشركات والمؤسسات غير الربحية على حد سواء لصياغة تصاميم تحدث تأثيرًا حقيقيًا. نحن نتطلع دائمًا إلى إنشاء علامات تجارية ومنتجات وتجارب رقمية تتواصل مع جماهير عملائنا.",
      }),
      worldClassTalent: Object.freeze({
        heading: "مواهب عالمية المستوى",
        description1:
          "نحن فريق من الاستراتيجيين وحلالي المشاكل والتقنيين. كل تصميم يتم صياغته بعناية من الفكرة إلى الإطلاق، مما يضمن النجاح في السوق المعني. نحن نحدث مهاراتنا باستمرار في مجموعة متنوعة من المنصات.",
        description2:
          "فريقنا متعدد التخصصات ونحن لا نهتم بالشكل فقط - المحتوى والمعنى مهمان بنفس القدر. نحن نعطي أهمية كبيرة للحرفية والخدمة والتسليم الفوري. لقد أعجب العملاء دائمًا بنتائجنا عالية الجودة التي تجسد قصة ومهمة علامتهم التجارية.",
      }),
      theRealDeal: Object.freeze({
        heading: "الصفقة الحقيقية",
        description1:
          "بصفتنا شركاء استراتيجيين في أعمال عملائنا، نحن مستعدون لمواجهة أي تحدي كأنه تحدينا الخاص. يتطلب حل المشكلات الحقيقية التعاطف والتعاون، ونسعى جاهدين لتقديم منظور جديد لكل فرصة. نجعل التصميم والتكنولوجيا أكثر سهولة ونمنحك الأدوات لقياس النجاح.",
        description2:
          "نحن رواة قصص بصرية بطرق جذابة ومثيرة. من خلال الجمع بين استراتيجيات الأعمال والتسويق، نلهم الجماهير لاتخاذ الإجراءات وتحقيق نتائج حقيقية.",
      }),
      ctaSection: Object.freeze({
        heading: "دعنا نتحدث عن مشروعك",
        description:
          "هل أنت مستعد للانتقال إلى المستوى التالي؟ اتصل بنا اليوم واكتشف كيف يمكن لخبرتنا أن تساعد عملك على النمو.",
        getInTouch: "تواصل معنا",
      }),
    }),
    webDesignProjects: Object.freeze({
      title: "مشاريع تصميم الويب من ديزينو - حلول رقمية مبتكرة",
      metaDescription:
        "تقدم ديزينو مشاريع تصميم ويب مبتكرة توفر تجارب رقمية استثنائية. استكشف محفظتنا من المواقع الإبداعية، من حلول الشحن متعددة الناقلات إلى مشغلات الوسائط الديناميكية.",
      heroSection: Object.freeze({
        heading: "مشاريع تصميم الويب الخاصة بنا",
        description:
          "نحن نبني مواقع ويب تعمل كأدوات تسويقية قوية وتقدم تجارب علامة تجارية لا تُنسى.",
      }),
      projects: Object.freeze([
        Object.freeze({
          title: "إكسبريس",
          description: "موقع شحن متعدد الناقلات للأعمال التجارية الإلكترونية",
        }),
        Object.freeze({
          title: "ترانسفير",
          description:
            "موقع لتحويل الأموال بتكلفة منخفضة وإرسال الأموال في غضون ثوانٍ",
        }),
        Object.freeze({
          title: "فوتون",
          description: "مشغل موسيقى متطور مع صوت عالي الدقة وتأثيرات DSP",
        }),
        Object.freeze({
          title: "بيلدر",
          description:
            "أداة إنشاء مواقع ويب متجاوبة مصممة لسهولة الاستخدام واتجاهات التصميم الحديثة",
        }),
        Object.freeze({
          title: "بلوجر",
          description: "بلوجر هو منصة لإنشاء مدونة أو منشور عبر الإنترنت",
        }),
        Object.freeze({
          title: "كامب",
          description:
            "احصل على تدريب احترافي في البرمجة والبيانات والتصميم والتسويق الرقمي",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "دعنا نتحدث عن مشروعك",
        description:
          "هل أنت مستعد للانتقال إلى المستوى التالي؟ اتصل بنا اليوم واكتشف كيف يمكن لخبرتنا أن تساعد عملك على النمو.",
        getInTouch: "تواصل معنا",
      }),
    }),
    appDesignProjects: Object.freeze({
      title: "تصميم التطبيقات | ديزينو",
      metaDescription:
        "تصميم التطبيقات – تصاميم الجوال التي تجلب الحلول الرقمية البديهية مباشرة إلى متناول يدك. اكتشف مشاريعنا المبتكرة في ديزينو.",
      heroSection: Object.freeze({
        heading: "تصميم التطبيقات",
        description:
          "تصاميمنا للجوال تجلب الحلول الرقمية البديهية لعملائك مباشرة إلى متناول أيديهم.",
      }),
      projects: Object.freeze([
        Object.freeze({
          title: "Airfilter",
          description:
            "حل مشكلة جودة الهواء الداخلي الرديئة عن طريق تنقية الهواء",
        }),
        Object.freeze({
          title: "Eyecam",
          description:
            "منتج يتيح لك تحرير صورك ومقاطع الفيديو المفضلة لديك في أي وقت",
        }),
        Object.freeze({
          title: "Faceit",
          description: "تعرف على نجم الإنترنت المفضل لديك مع تطبيق faceit",
        }),
        Object.freeze({
          title: "Todo",
          description:
            "تطبيق المهام الذي يتميز بمزامنة السحابة مع الوضعين الفاتح والداكن",
        }),
        Object.freeze({
          title: "Loopstudios",
          description: "تطبيق تجربة الواقع الافتراضي المصمم لـ Loopstudios",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "دعنا نتحدث عن مشروعك",
        description:
          "هل أنت مستعد للانتقال إلى المستوى التالي؟ اتصل بنا اليوم واكتشف كيف يمكن لخبرتنا أن تساعد عملك على النمو.",
        getInTouch: "تواصل معنا",
      }),
    }),
    contactTranslations: Object.freeze({
      title: "اتصل بنا | ديزينو",
      metaDescription:
        "تواصل مع ديزينو. نحن هنا لمساعدتك في احتياجات تصميم الويب والعلامات التجارية الرقمية.",
      heroSection: Object.freeze({
        heading: "اتصل بنا",
        description:
          "تواصل مع ديزينو. نحن هنا لمساعدتك في احتياجات تصميم الويب والعلامات التجارية الرقمية.",
      }),
      contactForm: Object.freeze({
        name: "الاسم",
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        message: "الرسالة",
        submit: "إرسال",
      }),
      ctaSection: Object.freeze({
        heading: "دعنا نتحدث عن مشروعك",
        description:
          "هل أنت مستعد للانتقال إلى المستوى التالي؟ اتصل بنا اليوم واكتشف كيف يمكن لخبرتنا أن تساعد عملك على النمو.",
        getInTouch: "تواصل معنا",
      }),
    }),
    locationsTranslations: Object.freeze({
      title: "اماكننا | ديزينو",
      metaDescription:
        "اعثر على مكاتب ديزينو حول العالم. لدينا مواقع في كندا وأستراليا والمملكة المتحدة.",
      heroSection: Object.freeze({
        heading: "مواقعنا",
        description:
          "اعثر على مكاتب ديزينو حول العالم. لدينا مواقع في كندا وأستراليا والمملكة المتحدة.",
      }),
      locations: Object.freeze([
        Object.freeze({
          country: "كندا",
          office: "المكتب المركزي لديزينو",
          address: "3886 شارع ويلينغتون، تورونتو، أونتاريو M9C 3J5",
          contact: "اتصل بنا (المكتب المركزي)",
          phone: "هاتف: +1 253-863-8967",
          email: "البريد الإلكتروني: contact@designo.com",
        }),
        Object.freeze({
          country: "أستراليا",
          office: "مكتب ديزينو في أستراليا",
          address: "19 شارع بالون، نيو ساوث ويلز 2443",
          contact: "اتصل بنا (مكتب أستراليا)",
          phone: "هاتف: (02) 6720 9092",
          email: "البريد الإلكتروني: contact@designo.au",
        }),
        Object.freeze({
          country: "المملكة المتحدة",
          office: "مكتب ديزينو في المملكة المتحدة",
          address: "13 طريق كولورادو، Rhyd-y-fro SA8 9GA",
          contact: "اتصل بنا (مكتب المملكة المتحدة)",
          phone: "هاتف: 078 3115 1400",
          email: "البريد الإلكتروني: contact@designo.uk",
        }),
      ]),
      ctaSection: Object.freeze({
        heading: "دعنا نتحدث عن مشروعك",
        description:
          "هل أنت مستعد للانتقال إلى المستوى التالي؟ اتصل بنا اليوم واكتشف كيف يمكن لخبرتنا أن تساعد عملك على النمو.",
        getInTouch: "تواصل معنا",
      }),
    }),
  }),
});

/**
 * Attribute translations for accessible labels.
 * @type {Readonly<Object>}
 */
const attributeTranslations = Object.freeze({
  en: Object.freeze({
    header: Object.freeze({
      ariaLabel: "Designo - Home",
      navToggleAriaLabel: "Toggle navigation menu",
    }),
  }),
  ar: Object.freeze({
    header: Object.freeze({
      ariaLabel: "ديزينو - الصفحة الرئيسية",
      navToggleAriaLabel: "تبديل قائمة التنقل",
    }),
  }),
});

/**
 * Image alt attribute translations.
 * @type {Readonly<Object>}
 */
const imgAltTranslations = Object.freeze({
  en: Object.freeze({
    footer: Object.freeze({
      socialLinks: Object.freeze({
        facebook: "Visit our Facebook page",
        youtube: "Watch our YouTube videos",
        twitter: "Follow us on Twitter",
        pinterest: "Explore our Pinterest boards",
        instagram: "See our Instagram photos",
      }),
    }),
    graphicDesignProjects: Object.freeze({
      footer: Object.freeze({
        socialLinks: Object.freeze({
          facebook: "Visit our Facebook page",
          youtube: "Watch our YouTube videos",
          twitter: "Follow us on Twitter",
          pinterest: "Explore our Pinterest boards",
          instagram: "See our Instagram photos",
        }),
      }),
    }),
  }),
  ar: Object.freeze({
    footer: Object.freeze({
      socialLinks: Object.freeze({
        facebook: "قم بزيارة صفحتنا على فيسبوك",
        youtube: "شاهد مقاطع الفيديو الخاصة بنا على يوتيوب",
        twitter: "تابعنا على تويتر",
        pinterest: "استكشف لوحاتنا على بينتيريست",
        instagram: "شاهد صورنا على إنستغرام",
      }),
    }),
    graphicDesignProjects: Object.freeze({
      footer: Object.freeze({
        socialLinks: Object.freeze({
          facebook: "قم بزيارة صفحتنا على فيسبوك",
          youtube: "شاهد مقاطع الفيديو الخاصة بنا على يوتيوب",
          twitter: "تابعنا على تويتر",
          pinterest: "استكشف لوحاتنا على بينتيريست",
          instagram: "شاهد صورنا على إنستغرام",
        }),
      }),
    }),
  }),
});

("use strict");

/**
 * Retrieves a nested translation using a key that can contain dot and array notation.
 * Example keys: "projects[0].title" or "title"
 *
 * @param {Object} translationObj - The translation object for the language.
 * @param {string} key - The translation key.
 * @returns {string|null} The translation value, or null if not found.
 */
function getNestedTranslation(translationObj, key) {
  const tokens = [];
  const regex = /([^\.\[\]]+)|\[(\d+)\]/g;
  let match;
  while ((match = regex.exec(key)) !== null) {
    tokens.push(match[1] || match[2]);
  }
  let translation = translationObj;
  for (const token of tokens) {
    if (translation && translation[token] !== undefined) {
      translation = translation[token];
    } else {
      return null;
    }
  }
  return translation;
}

/**
 * Retrieves a nested translation using dot-separated keys.
 *
 * @param {Object} translationObj - The translation object.
 * @param {string} key - The translation key (e.g., "header.navToggleAriaLabel").
 * @returns {string|null} The translation value, or null if not found.
 */
function getNestedTranslationByDot(translationObj, key) {
  const tokens = key.split(".");
  let translation = translationObj;
  for (const token of tokens) {
    if (translation && translation[token] !== undefined) {
      translation = translation[token];
    } else {
      return null;
    }
  }
  return translation;
}

/**
 * Translates page content for elements with data-i18n and data-i18n-placeholder attributes.
 *
 * @param {string} lang - The language code ("en", "ar", etc.).
 */
function translatePage(lang) {
  // Update lang and direction attributes for accessibility and SEO.
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Translate elements with a data-i18n attribute.
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const translationKey = el.getAttribute("data-i18n");
    const translation = getNestedTranslation(
      translations[lang],
      translationKey
    );
    // Use fallback if translation is missing.
    el.textContent = translation || el.textContent;
  });

  // Translate elements with a data-i18n-placeholder attribute.
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const translationKey = el.getAttribute("data-i18n-placeholder");
    const translation = getNestedTranslation(
      translations[lang],
      translationKey
    );
    el.setAttribute(
      "placeholder",
      translation || el.getAttribute("placeholder")
    );
  });
}

/**
 * Translates aria-label attributes for elements with data-i18n-aria.
 *
 * @param {string} lang - The language code.
 */
function translateAriaLabels(lang) {
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const translationKey = el.getAttribute("data-i18n-aria");
    const translation = getNestedTranslationByDot(
      attributeTranslations[lang],
      translationKey
    );
    el.setAttribute("aria-label", translation || el.getAttribute("aria-label"));
  });
}

/**
 * Translates alt attributes for images for elements with data-i18n-alt.
 *
 * @param {string} lang - The language code.
 */
function translateImageAlts(lang) {
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const translationKey = el.getAttribute("data-i18n-alt");
    const translation = getNestedTranslationByDot(
      imgAltTranslations[lang],
      translationKey
    );
    el.setAttribute("alt", translation || el.getAttribute("alt"));
  });
}

/**
 * Initializes translations based on saved preference or browser language.
 */
function initTranslations() {
  const savedLanguage = localStorage.getItem("preferredLanguage");
  const languageSelector = document.querySelector(".language-selector");
  let lang;

  if (savedLanguage) {
    lang = savedLanguage;
    if (languageSelector) languageSelector.value = savedLanguage;
  } else {
    const browserLang = navigator.language.slice(0, 2);
    lang = translations[browserLang] ? browserLang : "en";
    if (languageSelector) languageSelector.value = lang;
  }

  translatePage(lang);
  translateImageAlts(lang);
  translateAriaLabels(lang);
}

// Initialize translations on page load.
initTranslations();

// Attach event listener for language selector changes.
const languageSelector = document.querySelector(".language-selector");
if (languageSelector) {
  languageSelector.addEventListener("change", (e) => {
    const selectedLang = e.target.value;
    translatePage(selectedLang);
    translateImageAlts(selectedLang);
    translateAriaLabels(selectedLang);
    localStorage.setItem("preferredLanguage", selectedLang);
  });
}
