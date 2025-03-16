import type { Plugin, Editor } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

export interface CarouselPluginOptions {
   category?: string;
   labelCarouselBlock?: string;
}

type CarouselState = {
   currentIndex: number;
   interval: number | null;
};

const COMPONENT_TYPES = {
   CAROUSEL: 'carousel',
   SLIDE: 'slide',
   SLIDE_IMAGE: 'slideImage'
} as const;

const NAVIGATION_BUTTON_STYLES = {
   "position": "absolute",
   "top": "50%",
   "transform": "translateY(-50%)",
   "background-color": "#0092FF",
   "color": "white",
   "border": "none",
   "border-radius": "50%",
   "width": "40px",
   "height": "40px",
   "cursor": "pointer",
   "z-index": "1",
   "display": "flex",
   "align-items": "center",
   "justify-content": "center",
   "box-shadow": "0 2px 5px rgba(0,0,0,0.2)"
};

const carouselPlugin: Plugin<CarouselPluginOptions> = (
   editor: Editor,
   opts: CarouselPluginOptions = {}
) => {
   const options: Required<CarouselPluginOptions> = {
      category: "Basic",
      labelCarouselBlock: "Carousel",
      ...opts,
   };
   registerComponents(editor);
   registerCommands(editor);
   registerBlocks(editor, options);
};

function registerComponents(editor: Editor): void {
   const domc = editor.DomComponents;

   domc.addType(COMPONENT_TYPES.SLIDE_IMAGE, createSlideImageType());
   domc.addType(COMPONENT_TYPES.SLIDE, createSlideType());
   domc.addType(COMPONENT_TYPES.CAROUSEL, createCarouselType());
}

function registerCommands(editor: Editor): void {
   // Add slide command
   editor.Commands.add("carousel:add-slide", {
      run(editor) {
         const selected = editor.getSelected();
         if (!selected) return;

         const track = selected.find(".carousel-track")[0];
         if (!track) return;

         const carousel = selected;
         const slideHeight = carousel.get("attributes")?.["data-slide-height"] || "300";

         const newSlide = {
            type: COMPONENT_TYPES.SLIDE,
            style: {
               "height": `${slideHeight}px`
            }
         };

         track.append(newSlide);
      }
   });


   editor.Commands.add("slide-change-image", {
      run(editor) {
         const selected = editor.getSelected();
         if (!selected || selected.get("type") !== COMPONENT_TYPES.SLIDE) return;

         const image = selected.find(".slide_image")[0];
         if (!image) return;

         editor.AssetManager.open({
            select: (asset) => {
               image.set("attributes", {
                  ...image.get("attributes"),
                  src: asset.get("src")
               });
               editor.AssetManager.close();
            }
         });
      }
   });
}

function registerBlocks(editor: Editor, options: Required<CarouselPluginOptions>): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPES.CAROUSEL, {
      label: options.labelCarouselBlock,
      category: options.category,
      media: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g id="Layer_40" data-name="Layer 40"><path d="M53.73,14H10.27a1.5,1.5,0,0,0-1.5,1.5V48.53a1.5,1.5,0,0,0,1.5,1.5H53.73a1.5,1.5,0,0,0,1.5-1.5V15.47A1.5,1.5,0,0,0,53.73,14ZM52.23,47H11.77V17H52.23Z"/><path d="M60,17.54A1.5,1.5,0,0,0,58.5,19V45a1.5,1.5,0,1,0,3,0V19A1.5,1.5,0,0,0,60,17.54Z"/><path d="M4,17.54A1.5,1.5,0,0,0,2.5,19V45a1.5,1.5,0,0,0,3,0V19A1.5,1.5,0,0,0,4,17.54Z"/></g></svg>`,
      content: { type: COMPONENT_TYPES.CAROUSEL }
   });
}

function createSlideImageType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.classList && el.classList.contains("slide_image")) {
            return { type: COMPONENT_TYPES.SLIDE_IMAGE };
         }
         return undefined;
      },
      extend: "image",
      model: {
         defaults: {
            toolbar: [],
            draggable: false,
            selectable: true,
            resizable: false,
            attributes: {
               width: "100%",
               height: "100%",
               src: "https://placehold.co/800x400",
               class: "slide_image"
            },
            style: {
               "object-fit": "cover",
               "width": "100%",
               "height": "100%",
               "border-radius": "10px"
            }
         }
      }
   };
}

function createSlideType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.classList && el.classList.contains("carousel-slide")) {
            return { type: COMPONENT_TYPES.SLIDE };
         }
         return undefined;
      },
      model: {
         defaults: {
            Topbar: [],
            name: "Slide",
            droppable: false,
            draggable: ".carousel-track",
            attributes: {
               class: "carousel-slide",
            },
            style: {
               "flex": "0 0 auto",
               "width": "33.333%",
               "padding": "0 8px",
               "box-sizing": "border-box",
               "height": "300px",
               "position": "relative"
            },
            components: [
               {
                  type: COMPONENT_TYPES.SLIDE_IMAGE,
               }
            ],
         },
         init() {
            this.on("removed", () => {
               const carousel = this.parent()?.parent();
               if (carousel) {
                  carousel.trigger("change:components");
               }
            });
         }
      },
   };
}

function createDefaultSlides() {
   return Array(6).fill(null).map(() => ({
      type: COMPONENT_TYPES.SLIDE
   }));
}

function createCarouselType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.classList && el.classList.contains("carousel-container")) {
            return { type: COMPONENT_TYPES.CAROUSEL };
         }
         return undefined;
      },
      model: {
         defaults: {
            toolbar: [],
            name: "Carousel",
            droppable: false,
            attributes: {
               class: "carousel-container",
            },
            style: {
               "position": "relative",
               "width": "100%",
               "overflow": "hidden",
               "padding": "0 50px",
               "box-sizing": "border-box"
            },
            traits: [
               {
                  type: "checkbox",
                  name: "autoplay",
                  label: "Autoplay",
                  value: true,
               },
               {
                  type: "number",
                  name: "interval",
                  label: "Interval (ms)",
                  value: 3000,
               },
               {
                  type: "number",
                  name: "slideHeight",
                  label: "Slide Height (px)",
                  value: 300,
               }
            ],
            components: [
               {
                  attributes: {
                     class: "carousel-track",
                  },
                  style: {
                     "display": "flex",
                     "transition": "transform 0.5s ease",
                     "margin": "0 -8px"
                  },
                  components: createDefaultSlides()
               },
               {
                  attributes: {
                     class: "carousel-prev",
                  },
                  style: {
                     ...NAVIGATION_BUTTON_STYLES,
                     "left": "10px",
                  },
                  content: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
               },
               {
                  attributes: {
                     class: "carousel-next",
                  },
                  style: {
                     ...NAVIGATION_BUTTON_STYLES,
                     "right": "10px",
                  },
                  content: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
               }
            ],
            script: function () {
               const track = this.querySelector('.carousel-track') as HTMLElement;
               const slides = this.querySelectorAll('.carousel-slide') as NodeListOf<HTMLElement>;
               const prevBtn = this.querySelector('.carousel-prev') as HTMLElement;
               const nextBtn = this.querySelector('.carousel-next') as HTMLElement;
               const slideHeight = this.getAttribute('data-slide-height') || '300';

               slides.forEach((slide: HTMLElement) => {
                  slide.style.height = `${slideHeight}px`;
               });

               const state: CarouselState = {
                  currentIndex: 0,
                  interval: null
               };

               const autoplay = this.getAttribute('data-autoplay') === 'true';
               const autoplayInterval = parseInt(this.getAttribute('data-interval') || '3000', 10);

               function updateSlidesWidth(): void {
                  if (!slides.length) return;

                  let slidesPerView = 3;

                  if (window.innerWidth < 768) {
                     slidesPerView = 1;
                  } else if (window.innerWidth < 1024) {
                     slidesPerView = 2;
                  }

                  const slideWidth = 100 / slidesPerView;
                  slides.forEach((slide: HTMLElement) => {
                     slide.style.width = `${slideWidth}%`;
                  });
               }

               updateSlidesWidth();

               window.addEventListener('resize', updateSlidesWidth);

               function getVisibleSlides(): number {
                  if (window.innerWidth < 768) return 1;
                  if (window.innerWidth < 1024) return 2;
                  return 3;
               }

               const updateCarousel = (): void => {
                  if (track) {
                     const visibleSlides = getVisibleSlides();
                     const maxIndex = Math.max(0, slides.length - visibleSlides);
                     const boundedIndex = Math.min(state.currentIndex, maxIndex);

                     const slideWidth = 100 / visibleSlides;
                     const offset = -boundedIndex * slideWidth;
                     track.style.transform = `translateX(${offset}%)`;
                  }

                  if (state.currentIndex <= 0) {
                     prevBtn.style.opacity = '0.5';
                     prevBtn.style.cursor = 'not-allowed';
                  } else {
                     prevBtn.style.opacity = '1';
                     prevBtn.style.cursor = 'pointer';
                  }

                  const visibleSlides = getVisibleSlides();
                  const maxIndex = Math.max(0, slides.length - visibleSlides);

                  if (state.currentIndex >= maxIndex) {
                     nextBtn.style.opacity = '0.5';
                     nextBtn.style.cursor = 'not-allowed';
                  } else {
                     nextBtn.style.opacity = '1';
                     nextBtn.style.cursor = 'pointer';
                  }
               };

               const nextSlide = (): void => {
                  const visibleSlides = getVisibleSlides();
                  const maxIndex = Math.max(0, slides.length - visibleSlides);
                  if (state.currentIndex < maxIndex) {
                     state.currentIndex++;
                     updateCarousel();
                  }
               };

               const prevSlide = (): void => {
                  if (state.currentIndex > 0) {
                     state.currentIndex--;
                     updateCarousel();
                  }
               };

               if (prevBtn) prevBtn.addEventListener('click', prevSlide);
               if (nextBtn) nextBtn.addEventListener('click', nextSlide);

               const startAutoplay = (): void => {
                  state.interval = window.setInterval(() => {
                     const visibleSlides = getVisibleSlides();
                     const maxIndex = Math.max(0, slides.length - visibleSlides);
                     if (state.currentIndex >= maxIndex) {
                        state.currentIndex = 0;
                     } else {
                        state.currentIndex++;
                     }
                     updateCarousel();
                  }, autoplayInterval);
               };

               if (autoplay) startAutoplay();

               this.addEventListener('mouseenter', () => {
                  if (state.interval) {
                     clearInterval(state.interval);
                     state.interval = null;
                  }
               });

               this.addEventListener('mouseleave', () => {
                  if (autoplay && !state.interval) startAutoplay();
               });

               updateCarousel();
            },
         },
         init() {
            this.on("change:traits", this.updateCarouselTraits);
         },
         updateCarouselTraits() {
            const autoplay = this.getTrait("autoplay")?.get("value");
            const interval = this.getTrait("interval")?.get("value");
            const slideHeight = this.getTrait("slideHeight")?.get("value");

            const slides = this.find(".carousel-slide");
            slides.forEach(slide => {
               slide.addStyle({ height: `${slideHeight}px` });
            });

            this.set("attributes", {
               ...this.get("attributes"),
               "data-autoplay": autoplay,
               "data-interval": interval,
               "data-slide-height": slideHeight
            });
         }
      },

   };
}

export default carouselPlugin;