import type { Plugin, Editor } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

export interface GalleryPluginOptions {
   category?: string;
   labelGalleryBlock?: string;
}

interface TraitOption {
   id: string;
   name: string;
   [key: string]: string;
}

type GalleryItemSize = 'normal' | 'wide' | 'tall' | 'large';
type MobileLayoutStyle = 'standard' | 'quincunx';
type GridGap = '8px' | '12px' | '16px' | '24px' | '32px';
type ColumnCount = '1' | '2' | '3' | '4' | '5' | '6';

// Component type constants
const COMPONENT_TYPES = {
   GALLERY: 'gallery',
   GALLERY_ITEM: 'gallery-item',
   GALLERY_IMAGE: 'gallery-image',
   GALLERY_GRID: 'gallery-grid'
} as const;

const GALLERY_ITEM_SIZES: Record<GalleryItemSize, Partial<CSSStyleDeclaration>> = {
   normal: {},
   wide: { gridColumn: 'span 2' },
   tall: { gridRow: 'span 2' },
   large: { gridColumn: 'span 2', gridRow: 'span 2' }
};

const GRID_GAP_OPTIONS: TraitOption[] = [
   { id: '8px', name: 'Extra Small' },
   { id: '12px', name: 'Small' },
   { id: '16px', name: 'Medium' },
   { id: '24px', name: 'Large' },
   { id: '32px', name: 'Extra Large' }
];

const MOBILE_COLS_OPTIONS: TraitOption[] = [
   { id: '1', name: '1 Column' },
   { id: '2', name: '2 Columns' }
];

const TABLET_COLS_OPTIONS: TraitOption[] = [
   { id: '2', name: '2 Columns' },
   { id: '3', name: '3 Columns' }
];

const DESKTOP_COLS_OPTIONS: TraitOption[] = [
   { id: '3', name: '3 Columns' },
   { id: '4', name: '4 Columns' },
   { id: '5', name: '5 Columns' }
];

const LARGE_COLS_OPTIONS: TraitOption[] = [
   { id: '4', name: '4 Columns' },
   { id: '5', name: '5 Columns' },
   { id: '6', name: '6 Columns' }
];

const MOBILE_LAYOUT_OPTIONS: TraitOption[] = [
   { id: 'standard', name: 'Standard Grid' },
   { id: 'quincunx', name: 'Quincunx (Staggered)' }
];

const ITEM_SIZE_OPTIONS: TraitOption[] = [
   { id: 'normal', name: 'Normal (1x1)' },
   { id: 'wide', name: 'Wide (2x1)' },
   { id: 'tall', name: 'Tall (1x2)' },
   { id: 'large', name: 'Large (2x2)' }
];

const galleryPlugin: Plugin<GalleryPluginOptions> = (
   editor: Editor,
   opts: GalleryPluginOptions = {}
) => {
   const options = {
      category: "Basic",
      labelGalleryBlock: "Gallery",
      ...opts,
   };
   registerComponents(editor);
   registerCommands(editor);
   registerBlocks(editor, options);
};

function registerComponents(editor: Editor): void {
   const domc = editor.DomComponents;
   domc.addType(COMPONENT_TYPES.GALLERY_IMAGE, createGalleryImageType());
   domc.addType(COMPONENT_TYPES.GALLERY_ITEM, createGalleryItemType());
   domc.addType(COMPONENT_TYPES.GALLERY_GRID, createGalleryGridType());
   domc.addType(COMPONENT_TYPES.GALLERY, createGalleryType());
}

function registerCommands(editor: Editor): void {
   editor.Commands.add("gallery:add-item", {
      run(editor) {
         const selected = editor.getSelected();
         if (!selected) return;

         const grid = selected.find(`.${COMPONENT_TYPES.GALLERY_GRID}`)[0];
         if (!grid) return;

         const newItem = createDefaultGalleryItem();
         grid.append(newItem);
      }
   });

   editor.Commands.add("gallery-item-change-image", {
      run(editor) {
         const selected = editor.getSelected();
         if (!selected || selected.get("type") !== COMPONENT_TYPES.GALLERY_ITEM) return;

         const image = selected.find(".gallery-image")[0];
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

function registerBlocks(editor: Editor, options: GalleryPluginOptions): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPES.GALLERY, {
      label: options.labelGalleryBlock || "Gallery",
      category: options.category,
      media: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM5 5H19V11H5V5ZM5 19V13H11V19H5ZM19 19H13V13H19V19Z" fill="currentColor"/>
    </svg>`,
      content: { type: COMPONENT_TYPES.GALLERY }
   });
}

function createGalleryImageType(): AddComponentTypeOptions {
   return {
      isComponent: (el) => {
         if (el.classList && el.classList.contains("gallery-image")) {
            return { type: COMPONENT_TYPES.GALLERY_IMAGE };
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
               src: "https://placehold.co/400x400",
               class: "gallery-image",
               alt: "Gallery image"
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

function createGalleryItemType(): AddComponentTypeOptions {
   return {
      isComponent: (el) => {
         if (el.classList && el.classList.contains("gallery-item")) {
            return { type: COMPONENT_TYPES.GALLERY_ITEM };
         }
         return undefined;
      },
      model: {
         defaults: {
            toolbar: [],
            name: "Gallery Item",
            draggable: false,
            droppable: false,
            selectable: true,
            attributes: {
               class: "gallery-item",
            },
            style: {
               "position": "relative",
               "overflow": "hidden",
               "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
               "border-radius": "10spx",
               "min-height": "100px"
            },
            traits: [
               {
                  type: "select",
                  name: "size",
                  label: "Item Size",
                  options: ITEM_SIZE_OPTIONS,
                  value: "normal",
               }
            ],
            components: [
               {
                  type: COMPONENT_TYPES.GALLERY_IMAGE,
               }
            ],
         },
         init() {
            this.on("change:traits", this.updateItemSize);
         },
         updateItemSize() {
            const size = this.getTrait("size")?.get("value") as GalleryItemSize || "normal";
            const currentStyle = { ...this.getStyle() };
            delete currentStyle["grid-column"];
            delete currentStyle["grid-row"];
            const sizeStyles = GALLERY_ITEM_SIZES[size];
            for (const [property, value] of Object.entries(sizeStyles)) {
               currentStyle[property] = String(value);
            }

            this.setStyle(currentStyle);
         }
      },

   };
}

function createGalleryGridType(): AddComponentTypeOptions {
   return {
      isComponent: (el) => {
         if (el.classList && el.classList.contains("gallery-grid")) {
            return { type: COMPONENT_TYPES.GALLERY_GRID };
         }
         return undefined;
      },
      model: {
         defaults: {
            toolbar: [],
            name: "Gallery Grid",
            attributes: {
               class: "gallery-grid",
            },
            style: {
               "display": "grid",
               "grid-template-columns": "repeat(4, 1fr)",
               "gap": "16px",
            }
         }
      }
   };
}

function createGalleryType(): AddComponentTypeOptions {
   return {
      isComponent: (el) => {
         if (el.classList && el.classList.contains("gallery-container")) {
            return { type: COMPONENT_TYPES.GALLERY };
         }
         return undefined;
      },
      model: {
         defaults: {
            name: "Gallery",
            droppable: false,
            attributes: {
               class: "gallery-container",
            },
            style: {
               "width": "100%",
               "padding": "16px 16px"
            },
            traits: [
               {
                  type: "select",
                  name: "gap",
                  label: "Grid Gap",
                  options: GRID_GAP_OPTIONS,
                  value: "16px",
               },
               {
                  type: "select",
                  name: "mobileCols",
                  label: "Mobile Columns",
                  options: MOBILE_COLS_OPTIONS,
                  value: "1",
               },
               {
                  type: "select",
                  name: "mobileLayout",
                  label: "Mobile Layout Style",
                  options: MOBILE_LAYOUT_OPTIONS,
                  value: "standard",
               },
               {
                  type: "select",
                  name: "tabletCols",
                  label: "Tablet Columns",
                  options: TABLET_COLS_OPTIONS,
                  value: "2",
               },
               {
                  type: "select",
                  name: "desktopCols",
                  label: "Desktop Columns",
                  options: DESKTOP_COLS_OPTIONS,
                  value: "3",
               },
               {
                  type: "select",
                  name: "largeCols",
                  label: "Large Screen Columns",
                  options: LARGE_COLS_OPTIONS,
                  value: "4",
               }
            ],
            components: [
               {
                  type: COMPONENT_TYPES.GALLERY_GRID,
                  components: createDefaultGalleryItems()
               }
            ],
            script: function () {

               const grid = this.querySelector('.gallery-grid') as HTMLElement;

               if (grid) {
                  const gap = this.getAttribute('data-gap') || '16px';
                  const mobileCols = parseInt(this.getAttribute('data-mobile-cols') || '1');
                  const mobileLayout = this.getAttribute('data-mobile-layout') || 'standard';
                  const tabletCols = parseInt(this.getAttribute('data-tablet-cols') || '2');
                  const desktopCols = parseInt(this.getAttribute('data-desktop-cols') || '3');
                  const largeCols = parseInt(this.getAttribute('data-large-cols') || '4');

                  function updateGridLayout() {
                     let columns;
                     const isQuincunxActive = mobileLayout === 'quincunx' && mobileCols === 2;

                     const items = grid.querySelectorAll('.gallery-item');
                     items.forEach(item => {
                        const element = item as HTMLElement;
                        element.style.transform = '';
                     });

                     if (window.innerWidth < 768) {
                        columns = mobileCols;

                        if (isQuincunxActive) {
                           items.forEach((item, index) => {
                              const element = item as HTMLElement;
                              if (index % 2 === 1) {
                                 element.style.transform = 'translateY(50%)';
                              }
                           });
                        }
                     } else if (window.innerWidth < 1024) {
                        columns = tabletCols;
                     } else if (window.innerWidth < 1280) {
                        columns = desktopCols;
                     } else {
                        columns = largeCols;
                     }

                     grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                     grid.style.gap = gap;
                  }

                  updateGridLayout();

                  window.addEventListener('resize', updateGridLayout);
               }
            }
         },
         init() {
            this.on("change:traits", this.updateGridSettings);
         },
         updateGridSettings() {
            const grid = this.find(`.${COMPONENT_TYPES.GALLERY_GRID}`)[0];
            if (!grid) return;

            const gap = this.getTrait("gap")?.get("value") as GridGap || "16px";
            const mobileCols = this.getTrait("mobileCols")?.get("value") as ColumnCount || "1";
            const mobileLayout = this.getTrait("mobileLayout")?.get("value") as MobileLayoutStyle || "standard";
            const tabletCols = this.getTrait("tabletCols")?.get("value") as ColumnCount || "2";
            const desktopCols = this.getTrait("desktopCols")?.get("value") as ColumnCount || "3";
            const largeCols = this.getTrait("largeCols")?.get("value") as ColumnCount || "4";

            this.set("attributes", {
               ...this.get("attributes"),
               "data-gap": gap,
               "data-mobile-cols": mobileCols,
               "data-mobile-layout": mobileLayout,
               "data-tablet-cols": tabletCols,
               "data-desktop-cols": desktopCols,
               "data-large-cols": largeCols
            });

            grid.setStyle({
               "gap": gap,
               "grid-template-columns": `repeat(${largeCols}, 1fr)`
            });
         }
      },
   };
}

function createDefaultGalleryItems() {
   return [
      {
         type: COMPONENT_TYPES.GALLERY_ITEM,
         style: {
            "grid-column": "span 2",
            "grid-row": "span 2"
         },
         traits: [{ type: "select", name: "size", value: "large" }],
         components: [
            {
               type: COMPONENT_TYPES.GALLERY_IMAGE,
               attributes: {
                  src: "https://placehold.co/600x600"
               }
            }
         ]
      },
      createDefaultGalleryItem("https://placehold.co/300x300"),
      createDefaultGalleryItem("https://placehold.co/300x300"),
      {
         type: COMPONENT_TYPES.GALLERY_ITEM,
         style: {
            "grid-column": "span 2"
         },
         traits: [{ type: "select", name: "size", value: "wide" }],
         components: [
            {
               type: COMPONENT_TYPES.GALLERY_IMAGE,
               attributes: {
                  src: "https://placehold.co/600x300"
               }
            }
         ]
      },
      createDefaultGalleryItem("https://placehold.co/300x300"),
      {
         type: COMPONENT_TYPES.GALLERY_ITEM,
         style: {
            "grid-column": "span 2"
         },
         traits: [{ type: "select", name: "size", value: "wide" }],
         components: [
            {
               type: COMPONENT_TYPES.GALLERY_IMAGE,
               attributes: {
                  src: "https://placehold.co/600x300"
               }
            }
         ]
      },
      // Regular image 4
      createDefaultGalleryItem("https://placehold.co/300x300")
   ];
}

function createDefaultGalleryItem(imageUrl: string = "https://placehold.co/300x300") {
   return {
      type: COMPONENT_TYPES.GALLERY_ITEM,
      components: [
         {
            type: COMPONENT_TYPES.GALLERY_IMAGE,
            attributes: {
               src: imageUrl
            }
         }
      ]
   };
}

export default galleryPlugin;