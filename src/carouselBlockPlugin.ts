import type { Plugin, Editor } from "grapesjs";

export interface CarouselBlockPluginOptions {
   category?: string;
   labelCarouselBlock?: string;
}

const carouselBlockPlugin: Plugin<CarouselBlockPluginOptions> = (
   editor: Editor,
   opts: CarouselBlockPluginOptions = {}
) => {
   const options = {
      category: "Basic",
      labelCarouselBlock: "Carousel",
      ...opts,
   };

   // Ajout du bloc de carrousel
   editor.BlockManager.add("carousel-block", {
      label: options.labelCarouselBlock,
      category: options.category,
      content: `
      <div class="carousel-container w-full px-10 py-4 relative flex items-center justify-between">
       <button class="carousel-arrow carousel-prev absolute left-8 z-10 bg-gray-200 hover:opacity-70 backdrop-blur-sm p-2 rounded-full transition-all duration-300" aria-label="Précédent">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left">
            <polyline points="15 6 9 12 15 18"></polyline>
         </svg>
         </button>
        <div class="carousel-wrapper overflow-hidden w-[calc(100%-80px)] mx-auto mb-3">
          <div class="carousel-track flex transition-transform duration-500">
            ${[1, 2, 3, 4, 5].map(() => `
              <div class="carousel-slide flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/5 px-1">
                <img src="https://placehold.co/200x100" alt="Slide" class="w-full h-full object-cover">
              </div>
            `).join('')}
          </div>
        </div>
      <button class="carousel-arrow carousel-next absolute right-8 z-10 bg-gray-200 hover:opacity-70backdrop-blur-sm p-2 rounded-full transition-all duration-300" aria-label="Suivant">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right">
            <polyline points="9 18 15 12 9 6"></polyline>
         </svg>
      </button>
        <div class="carousel-dots absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          ${[1, 2, 3, 4, 5].map(() => `
            <span class="dot w-2 h-2 bg-gray-400 rounded-full"></span>
          `).join('')}
        </div>
      </div>
    `,
      media: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M7 12H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
   });

   // Composant Carousel Container
   editor.DomComponents.addType("carousel-container", {
      isComponent: (el) => el.classList?.contains("carousel-container"),
      model: {
         defaults: {
            name: "Carousel Container",
            traits: [
               {
                  type: "select",
                  name: "slidesPerView",
                  label: "Desktop Slides",
                  options: [
                     { id: "1/2", name: "2 Slides" },
                     { id: "1/3", name: "3 Slides" },
                     { id: "1/4", name: "4 Slides" },
                     { id: "1/5", name: "5 Slides" },
                  ],
                  default: "1/5",
               },
               {
                  type: "select",
                  name: "tabletSlides",
                  label: "Tablet Slides",
                  options: [
                     { id: "1/2", name: "2 Slides" },
                     { id: "1/3", name: "3 Slides" },
                  ],
                  default: "1/3",
               },
               {
                  type: "select",
                  name: "mobileSlides",
                  label: "Mobile Slides",
                  options: [
                     { id: "1/2", name: "2 Slides" },
                  ],
                  default: "1/2",
               },
               {
                  type: "checkbox",
                  name: "showNavigation",
                  label: "Show Navigation",
                  default: true,
               },
               {
                  type: "checkbox",
                  name: "showDots",
                  label: "Show Dots",
                  default: true,
               },
            ],
         },
         init() {
            this.on("change:traits", this.updateCarouselSettings);
         },
         updateCarouselSettings() {
            const slides = this.find(".carousel-slide");
            const prevBtn = this.find(".carousel-prev")[0];
            const nextBtn = this.find(".carousel-next")[0];
            const dotsContainer = this.find(".carousel-dots")[0];

            // Mettre à jour les classes de largeur des slides
            slides.forEach((slide) => {
               ['w-1/2', 'w-1/3', 'w-1/4', 'w-1/5'].forEach(cls => slide.removeClass(cls));
               ['sm:w-1/2', 'sm:w-1/3', 'sm:w-1/4', 'sm:w-1/5'].forEach(cls => slide.removeClass(cls));
               ['md:w-1/2', 'md:w-1/3', 'md:w-1/4', 'md:w-1/5'].forEach(cls => slide.removeClass(cls));
               ['lg:w-1/2', 'lg:w-1/3', 'lg:w-1/4', 'lg:w-1/5'].forEach(cls => slide.removeClass(cls));

               slide.addClass(`w-${this.getTrait("mobileSlides")?.get("value")}`);
               slide.addClass(`md:w-${this.getTrait("tabletSlides")?.get("value")}`);
               slide.addClass(`lg:w-${this.getTrait("slidesPerView")?.get("value")}`);
            });

            // Gestion de la navigation
            const showNavigation = this.getTrait("showNavigation")?.get("value");
            if (prevBtn && nextBtn) {
               if (showNavigation) {
                  prevBtn.removeClass('hidden');
                  nextBtn.removeClass('hidden');
               } else {
                  prevBtn.addClass('hidden');
                  nextBtn.addClass('hidden');
               }
            }

            // Gestion des points de navigation
            const showDots = this.getTrait("showDots")?.get("value");
            if (dotsContainer) {
               if (showDots) {
                  dotsContainer.removeClass('hidden');
               } else {
                  dotsContainer.addClass('hidden');
               }
            }
         },
      },
      view: {
         init() {
            const model = this.model;
            const toolbar = model.get("toolbar") || [];

            toolbar.push({
               command: "carousel:add-slide",
               label: "Add Slide",
            });

            model.set("toolbar", toolbar);
         },
      },
   });

   // Composant Slide
   editor.DomComponents.addType("carousel-slide", {
      isComponent: (el) => el.classList?.contains("carousel-slide"),
      model: {
         defaults: {
            name: "Carousel Slide",
            draggable: false,
            traits: [
               {
                  type: "select",
                  name: "aspectRatio",
                  label: "Aspect Ratio",
                  options: [
                     { id: "aspect-square", name: "1:1" },
                     { id: "aspect-[2/1]", name: "2:1" },
                     { id: "aspect-[16/9]", name: "16:9" },
                  ],
                  default: "aspect-[2/1]",
               },
            ],
         },
         init() {
            this.on("change:traits", this.updateSlideSettings);
         },
         updateSlideSettings() {
            // Supprimer les classes de ratio existantes
            const classes = this.getClasses();
            const aspectClasses: string[] = classes.filter((cls: string) => cls.startsWith('aspect-'));
            this.removeClass(aspectClasses);

            // Ajouter le nouveau ratio
            this.addClass(this.getTrait("aspectRatio")?.get("value"));
         },
      },
      view: {
         events(): { [key: string]: string; } {
            return {
               "dblclick img": "replaceImage",
            };
         },
         replaceImage() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (event: Event) => {
               const target = event.target as HTMLInputElement;
               const file = target.files?.[0];
               if (!file) return;

               const reader = new FileReader();
               reader.onload = (e: ProgressEvent<FileReader>) => {
                  const img = e.target?.result as string;
                  if (e.currentTarget) {
                     const imgElement = (e.currentTarget as FileReader & { el: HTMLElement; }).el?.querySelector('img');
                     if (imgElement) {
                        imgElement.src = img;
                     }
                  }
               };
               reader.readAsDataURL(file);
            };
            input.click();
         },
      },
   });

   // Commande pour ajouter une slide
   editor.Commands.add("carousel:add-slide", {
      run(editor: Editor) {
         const selected = editor.getSelected();
         if (!selected) return;

         const track = selected.find(".carousel-track")[0];
         const dotsContainer = selected.find(".carousel-dots")[0];

         if (!track || !dotsContainer) return;

         // Ajouter une nouvelle slide
         track.append(`
        <div class="carousel-slide flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/5 px-1">
          <img src="https://placehold.co/200x100" alt="Slide" class="w-full h-full object-cover">
        </div>
      `);

         // Ajouter un point de navigation
         dotsContainer.append(`
        <span class="dot w-2 h-2 bg-gray-400 rounded-full"></span>
      `);
      },
   });
};

export default carouselBlockPlugin;