import type { Plugin } from "grapesjs";

export type GalleryBlockPluginOptions = {
   /**
    * Category for the blocks
    * @default 'Basic'
    */
   category?: string;

   /**
    * Label for gallery block
    * @default 'Gallery'
    */
   labelGalleryBlock?: string;
};

const galleryBlockPlugin: Plugin<GalleryBlockPluginOptions> = (
   editor,
   opts = {},
) => {
   const options: GalleryBlockPluginOptions = {
      category: "Basic",
      labelGalleryBlock: "Gallery",
      ...opts,
   };

   // Add gallery block
   editor.BlockManager.add("gallery-block", {
      label: options.labelGalleryBlock as string,
      category: options.category,
      content: `
      <div class="gallery-container w-full px-4 py-6">
        <div class="gallery-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <!-- Large image spanning 2 columns and 2 rows -->
          <div class="gallery-item relative overflow-hidden rounded-md shadow-sm row-span-2 col-span-2">
            <img src="https://placehold.co/600x600" alt="Gallery image" class="w-full h-full object-cover">
          </div>
          
          <!-- Regular images -->
          <div class="gallery-item relative overflow-hidden rounded-md shadow-sm">
            <img src="https://placehold.co/300x300" alt="Gallery image" class="w-full h-full object-cover">
          </div>
          
          <div class="gallery-item relative overflow-hidden rounded-md shadow-sm">
            <img src="https://placehold.co/300x300" alt="Gallery image" class="w-full h-full object-cover">
          </div>
          
          <!-- Span 2 columns -->
          <div class="gallery-item relative overflow-hidden rounded-md shadow-sm col-span-2">
            <img src="https://placehold.co/600x300" alt="Gallery image" class="w-full h-full object-cover">
          </div>
          
          <!-- Regular image -->
          <div class="gallery-item relative overflow-hidden rounded-md shadow-sm">
            <img src="https://placehold.co/300x300" alt="Gallery image" class="w-full h-full object-cover">
          </div>
          
          <!-- Span 2 columns -->
          <div class="gallery-item relative overflow-hidden rounded-md shadow-sm col-span-2">
            <img src="https://placehold.co/600x300" alt="Gallery image" class="w-full h-full object-cover">
          </div>
          
          <!-- Regular image -->
          <div class="gallery-item relative overflow-hidden rounded-md shadow-sm">
            <img src="https://placehold.co/300x300" alt="Gallery image" class="w-full h-full object-cover">
          </div>
        </div>
      </div>
    `,
      media: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM5 5H19V11H5V5ZM5 19V13H11V19H5ZM19 19H13V13H19V19Z" fill="currentColor"/>
    </svg>`,
   });

   // Type pour un élément du DOM
   type HTMLElementWithClasses = HTMLElement & { classList: DOMTokenList; };

   // Add component type for gallery container
   editor.DomComponents.addType("gallery-container", {
      isComponent: (el: HTMLElementWithClasses): boolean =>
         Boolean(el.classList && el.classList.contains("gallery-container")),
      model: {
         defaults: {
            name: "Gallery Container",
            traits: [
               {
                  type: "select",
                  name: "gap",
                  label: "Grid Gap",
                  options: [
                     { id: "gap-1", name: "Extra Small" },
                     { id: "gap-2", name: "Small" },
                     { id: "gap-3", name: "Medium" },
                     { id: "gap-4", name: "Large" },
                     { id: "gap-6", name: "Extra Large" },
                  ],
                  default: "gap-4",
               },
               {
                  type: "select",
                  name: "mobile",
                  label: "Mobile Columns",
                  options: [
                     { id: "grid-cols-1", name: "1 Column" },
                     { id: "grid-cols-2", name: "2 Columns" },
                  ],
                  default: "grid-cols-1",
               },
               {
                  type: "select",
                  name: "tablet",
                  label: "Tablet Columns",
                  options: [
                     { id: "sm:grid-cols-2", name: "2 Columns" },
                     { id: "sm:grid-cols-3", name: "3 Columns" },
                  ],
                  default: "sm:grid-cols-2",
               },
               {
                  type: "select",
                  name: "desktop",
                  label: "Desktop Columns",
                  options: [
                     { id: "md:grid-cols-3", name: "3 Columns" },
                     { id: "md:grid-cols-4", name: "4 Columns" },
                     { id: "md:grid-cols-5", name: "5 Columns" },
                  ],
                  default: "md:grid-cols-3",
               },
               {
                  type: "select",
                  name: "large",
                  label: "Large Screen Columns",
                  options: [
                     { id: "lg:grid-cols-4", name: "4 Columns" },
                     { id: "lg:grid-cols-5", name: "5 Columns" },
                     { id: "lg:grid-cols-6", name: "6 Columns" },
                  ],
                  default: "lg:grid-cols-4",
               },
            ],
         },
         init(): void {
            this.on("change:traits", this.updateGridSettings);
         },
         updateGridSettings(): void {
            const grid = this.find(".gallery-grid")[0];
            if (!grid) return;

            // Get traits values
            const gap: string =
               (this.getTrait("gap")?.get("value") as string) || "gap-4";
            const mobile: string =
               (this.getTrait("mobile")?.get("value") as string) || "grid-cols-1";
            const tablet: string =
               (this.getTrait("tablet")?.get("value") as string) || "sm:grid-cols-2";
            const desktop: string =
               (this.getTrait("desktop")?.get("value") as string) ||
               "md:grid-cols-3";
            const large: string =
               (this.getTrait("large")?.get("value") as string) || "lg:grid-cols-4";

            // Get current classes
            const classes: string[] = grid.getClasses();

            // Filter out classes we're going to replace
            const filteredClasses: string[] = classes.filter(
               (cls: string): boolean =>
                  !cls.startsWith("gap-") &&
                  !cls.startsWith("grid-cols-") &&
                  !cls.startsWith("sm:grid-cols-") &&
                  !cls.startsWith("md:grid-cols-") &&
                  !cls.startsWith("lg:grid-cols-"),
            );

            // Set new classes
            grid.setClass([
               ...filteredClasses,
               gap,
               mobile,
               tablet,
               desktop,
               large,
            ]);
         },
      },
   });

   // Add component type for gallery item
   editor.DomComponents.addType("gallery-item", {
      isComponent: (el: HTMLElementWithClasses): boolean =>
         Boolean(el.classList && el.classList.contains("gallery-item")),
      model: {
         defaults: {
            name: "Gallery Item",
            draggable: false, // Empêche de déplacer l'élément
            droppable: false, // Empêche de déposer des éléments à l'intérieur
            selectable: true, // Mais permet de sélectionner pour édition
            traits: [
               {
                  type: "select",
                  name: "size",
                  label: "Item Size",
                  options: [
                     { id: "normal", name: "Normal (1x1)" },
                     { id: "wide", name: "Wide (2x1)" },
                     { id: "tall", name: "Tall (1x2)" },
                     { id: "large", name: "Large (2x2)" },
                  ],
                  default: "normal",
               },
            ],
         },
         init(): void {
            this.on("change:traits", this.updateItemSize);
         },
         updateItemSize(): void {
            // Get the size trait value
            const size: string =
               (this.getTrait("size")?.get("value") as string) || "normal";

            // Get current classes
            const classes: string[] = this.getClasses();

            // Remove span classes
            const filteredClasses: string[] = classes.filter(
               (cls: string): boolean =>
                  !cls.includes("col-span-") && !cls.includes("row-span-"),
            );

            const newClasses: string[] = [...filteredClasses];

            // Add appropriate classes based on size
            switch (size) {
               case "wide":
                  newClasses.push("col-span-2");
                  break;
               case "tall":
                  newClasses.push("row-span-2");
                  break;
               case "large":
                  newClasses.push("col-span-2", "row-span-2");
                  break;
               // Normal size doesn't need additional classes
            }

            this.setClass(newClasses);
         },
      },
      view: {
         events(): { [key: string]: string; } {
            return {
               "dblclick img": "handleImageClick",
            };
         },

         handleImageClick(e: MouseEvent): void {
            e.stopPropagation();

            // Get the clicked image
            const img = e.target as HTMLImageElement;
            if (!img || !(img instanceof HTMLImageElement)) return;

            // Create a file input dialog
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            // When a file is selected
            input.onchange = (event: Event): void => {
               const target = event.target as HTMLInputElement;
               const file = target.files?.[0];
               if (!file) return;

               // Read as data URL and update the image
               const reader = new FileReader();
               reader.onload = (e: ProgressEvent<FileReader>): void => {
                  if (e.target && typeof e.target.result === "string") {
                     img.src = e.target.result;
                  }
               };
               reader.readAsDataURL(file);
            };

            // Open file dialog
            input.click();
         },
      },
   });

   // Add command to add new gallery item
   editor.Commands.add("gallery-add-item", {
      run(editor): void {
         const selected = editor.getSelected();
         if (!selected) return;

         // Find the gallery grid
         let grid;
         if (selected.find(".gallery-grid").length > 0) {
            grid = selected.find(".gallery-grid")[0];
         } else {
            return;
         }

         if (!grid) return;

         // Add a new gallery item
         grid.append(`
        <div class="gallery-item relative overflow-hidden rounded-md shadow-sm">
          <img src="https://placehold.co/300x300" alt="Gallery image" class="w-full h-full object-cover">
        </div>
      `);
      },
   });

   // Add toolbar buttons
   editor.on("component:selected", (component): void => {
      if (!component) return;

      // For gallery container
      if (component.getClasses().includes("gallery-container")) {
         component.set("toolbar", [
            { command: "gallery-add-item", label: "+ Item" },
         ]);
      }
   });
};

export default galleryBlockPlugin;
