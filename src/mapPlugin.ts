import type { Editor, Component } from 'grapesjs';
import type { AddComponentTypeOptions } from 'grapesjs';
import { Plugin } from "grapesjs";

/**
 * Options d'interface pour le plugin de carte
 */
export interface MapPluginOptions {
   /** Catégorie du bloc dans le gestionnaire de blocs */
   category?: string;
   /** Étiquette du bloc de carte */
   labelMapBlock?: string;
   /** Adresse par défaut pour la carte */
   defaultAddress?: string;
   /** Niveau de zoom par défaut */
   defaultZoom?: number;
   /** Options de taille de carte disponibles */
   sizes?: Array<{ value: string; name: string; }>;
   /** Options de rayon de bordure disponibles */
   borderRadiusOptions?: Array<{ value: string; name: string; }>;
}

/**
 * Interface pour les styles de taille de carte
 */
interface MapSize {
   "width": string;
   "max-width": string;
}

/**
 * Interface pour les styles de rayon de bordure
 */
interface BorderRadius {
   "border-radius": string;
}

/**
 * Interface pour les options de commande
 */
interface CommandOptions {
   component?: Component;
   [key: string]: unknown;
}

// Type de composant unique pour l'identification
const COMPONENT_TYPE = "map";

// Définition des tailles de carte
const MAP_SIZES: Record<string, MapSize> = {
   "small": {
      "width": "50%",
      "max-width": "400px"
   },
   "medium": {
      "width": "75%",
      "max-width": "600px"
   },
   "large": {
      "width": "90%",
      "max-width": "800px"
   },
   "full": {
      "width": "100%",
      "max-width": "100%"
   }
};

// Définition des rayons de bordure
const BORDER_RADIUS: Record<string, BorderRadius> = {
   "none": {
      "border-radius": "0"
   },
   "small": {
      "border-radius": "4px"
   },
   "medium": {
      "border-radius": "8px"
   },
   "large": {
      "border-radius": "16px"
   }
};

// Styles de base pour les cartes
const MAP_BASE_STYLES = {
   "display": "block",
   "margin": "0 auto",
   "height": "350px",
   "border": "1px solid #ddd",
   "overflow": "hidden"
};

/**
 * Plugin de carte personnalisé pour GrapesJS
 */
const mapPlugin: Plugin<MapPluginOptions> = (
   editor: Editor,
   opts: MapPluginOptions = {}
) => {
   // Options avec valeurs par défaut
   const options: Required<MapPluginOptions> = {
      category: "Map",
      labelMapBlock: "Map",
      defaultAddress: "Paris, France",
      defaultZoom: 10,
      sizes: [
         { value: "small", name: "Small" },
         { value: "medium", name: "Medium" },
         { value: "large", name: "Large" },
         { value: "full", name: "Full Width" }
      ],
      borderRadiusOptions: [
         { value: "none", name: "None" },
         { value: "small", name: "Small" },
         { value: "medium", name: "Medium" },
         { value: "large", name: "Large" }
      ],
      ...opts
   };

   if (!options.sizes || !Array.isArray(options.sizes)) {
      throw new Error('Options "sizes" must be an array of objects');
   }

   if (!options.borderRadiusOptions || !Array.isArray(options.borderRadiusOptions)) {
      throw new Error('Options "borderRadiusOptions" must be an array of objects');
   }

   registerComponents(editor);
   registerBlocks(editor, options);
   registerCommands(editor, options);
};

function registerComponents(editor: Editor): void {
   const domc = editor.DomComponents;
   domc.addType(COMPONENT_TYPE, createMapType());
}

function registerBlocks(
   editor: Editor,
   options: Required<MapPluginOptions>
): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPE, {
      label: options.labelMapBlock,
      category: options.category,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3M10,5.47L14,6.87V18.53L10,17.13V5.47M5,6.46L8,5.45V17.15L5,18.31V6.46M19,17.54L16,18.55V6.86L19,5.7V17.54Z" />
      </svg>`,
      content: { type: COMPONENT_TYPE }
   });
}

function registerCommands(
   editor: Editor,
   options: Required<MapPluginOptions>
): void {
   editor.Commands.add('open-map-settings', {
      run(editor: Editor, _, cmdOptions: CommandOptions = {}): void {
         const component = cmdOptions.component;
         if (!component) return;

         // Récupérer les paramètres actuels de la carte
         const currentAddress = component.get('address') || options.defaultAddress;
         const currentZoom = component.get('zoom') || options.defaultZoom;
         const currentSize = component.getAttributes()['data-size'] || "medium";
         const currentBorderRadius = component.getAttributes()['data-border-radius'] || "none";

         // Créer le contenu de la modal
         const content = document.createElement('div');
         content.innerHTML = `
        <div class="map-settings">
          <div class="map-section">
            <label class="map-label">Adresse</label>
            <div class="map-input-wrap">
              <input type="text" class="map-input map-address-input" value="${currentAddress}" placeholder="Ex: Paris, France">
              <div class="map-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="map-section">
            <label class="map-label">Niveau de zoom (1-20)</label>
            <div class="map-zoom-container">
              <input type="range" class="map-zoom-slider" min="1" max="20" step="1" value="${currentZoom}">
              <div class="map-zoom-value">${currentZoom}</div>
            </div>
          </div>
          
          <div class="map-section">
            <label class="map-label">Taille</label>
            <div class="map-sizes">
              ${options.sizes.map(size => `
                <div class="map-size ${currentSize === size.value ? 'selected' : ''}" data-size="${size.value}">
                  <div class="map-size-bar" style="width: ${size.value === 'small' ? '50%' : size.value === 'medium' ? '75%' : size.value === 'large' ? '90%' : '100%'}"></div>
                  <div class="map-size-name">${size.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="map-section">
            <label class="map-label">Rayon des coins</label>
            <div class="map-radius-options">
              ${options.borderRadiusOptions.map(radius => `
                <div class="map-radius ${currentBorderRadius === radius.value ? 'selected' : ''}" data-radius="${radius.value}">
                  <div class="map-radius-preview" style="border-radius: ${radius.value === 'none' ? '0' : radius.value === 'small' ? '4px' : radius.value === 'medium' ? '8px' : '16px'}"></div>
                  <div class="map-radius-name">${radius.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

         // Ajouter les styles
         const style = document.createElement('style');
         style.textContent = `
        .map-settings {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #1a202c;
          padding: 0;
          max-width: 650px;
          margin: 0 auto;
        }
        
        .map-section {
          margin-bottom: 24px;
        }
        
        .map-label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: #2d3748;
          font-size: 14px;
          letter-spacing: 0.01em;
        }
        
        .map-input-wrap {
          position: relative;
        }
        
        .map-input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 40px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          ;
          background-color: #fff;
        }
        
        .map-input:focus {
          border-color: #4299e1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
        
        .map-input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }
        
        .map-zoom-container {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 4px;
        }
        
        .map-zoom-slider {
          flex-grow: 1;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: #e2e8f0;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
        }
        
        .map-zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #4299e1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        
        .map-zoom-slider::-webkit-slider-thumb:hover {
          background: #3182ce;
          transform: scale(1.1);
        }
        
        .map-zoom-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #4299e1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
          border: none;
        }
        
        .map-zoom-slider::-moz-range-thumb:hover {
          background: #3182ce;
          transform: scale(1.1);
        }
        
        .map-zoom-slider:focus {
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
        
        .map-zoom-value {
          width: 40px;
          text-align: center;
          font-weight: 600;
          font-size: 16px;
          color: #2d3748;
          background: #f7fafc;
          padding: 5px 0;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        
        .map-sizes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
        .map-size {
          cursor: pointer;
          padding: 14px 10px;
          border-radius: 10px;
          background: #f7fafc;
          transition: all 0.2s ease;
          text-align: center;
          border: 1px solid #e2e8f0;
     }
        
        .map-size:hover {
          background: #ebf8ff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .map-size.selected {
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .map-size-bar {
          height: 18px;
          border-radius: 4px;
          margin: 8px auto;
          background: #fff;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .map-size:hover .map-size-bar,
        .map-size.selected .map-size-bar {
          border-color: #4299e1;
        }
        
        .map-size-name {
          font-size: 13px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .map-size.selected .map-size-name {
          color: #2b6cb0;
        }
        
        .map-radius-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
      .map-radius {
         cursor: pointer;
         padding: 14px 10px;
         border-radius: 10px;
         background: #f7fafc;
         transition: all 0.2s ease;
         text-align: center;
         border: 1px solid #e2e8f0;
         display: flex;
         flex-direction: column;
         align-items: center;  /* Centre horizontalement */
         justify-content: center; /* Centre verticalement */
         gap: 8px;
      }

        .map-radius:hover {
          background: #ebf8ff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .map-radius.selected {
          background: #ebf8ff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .map-radius-preview {
         width: 30px;
         height: 30px;
         background: #fff;
         margin: 0 auto; /* Garantit le centrage horizontal */
         border: 1px solid #e2e8f0;
         transition: all 0.2s ease;
        }
        
        .map-radius:hover .map-radius-preview,
        .map-radius.selected .map-radius-preview {
          border-color: #4299e1;
        }
        
        .map-radius-name {
          font-size: 13px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .map-radius.selected .map-radius-name {
          color: #2b6cb0;
        }
        
        .map-settings-modal .gjs-mdl-dialog {
          max-width: 700px !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .map-settings-modal .gjs-mdl-header {
          background-color: #fff !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 20px 24px !important;
        }
        
        .map-settings-modal .gjs-mdl-title {
          font-weight: 700 !important;
          font-size: 18px !important;
          color: #1a202c !important;
        }
        
        .map-settings-modal .gjs-mdl-content {
          padding: 24px !important;
          background-color: #fff !important;
        }
        
        .map-settings-modal .gjs-mdl-btn-close {
          font-size: 18px !important;
          color: #4a5568 !important;
          opacity: 0.8 !important;
          transition: opacity 0.2s ease !important;
        }
        
        .map-settings-modal .gjs-mdl-btn-close:hover {
          opacity: 1 !important;
        }
        
        .map-settings-modal .gjs-mdl-footer {
          background-color: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
          padding: 16px 24px !important;
        }
        
        .map-settings-modal .gjs-mdl-btn {
          padding: 10px 18px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }
        
        .map-settings-modal .gjs-mdl-btn-primary {
          background-color: #4299e1 !important;
          color: #fff !important;
          border: none !important;
        }
        
        .map-settings-modal .gjs-mdl-btn-primary:hover {
          background-color: #3182ce !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
      `;
         content.appendChild(style);

         editor.Modal.open({
            title: 'Paramètres de la carte',
            content,
            attributes: {
               class: 'map-settings-modal'
            }
         }).onceClose(() => {
            // Appliquer les modifications au composant lorsque la modal se ferme
            const addressInput = content.querySelector('.map-address-input') as HTMLInputElement;
            const zoomSlider = content.querySelector('.map-zoom-slider') as HTMLInputElement;

            if (addressInput && zoomSlider) {
               const address = addressInput.value.trim() || options.defaultAddress;
               const zoom = parseInt(zoomSlider.value) || options.defaultZoom;

               component.set('address', address);
               component.set('zoom', zoom);
            }
         });

         // Event listener pour le zoom
         const zoomSlider = content.querySelector('.map-zoom-slider') as HTMLInputElement;
         const zoomValue = content.querySelector('.map-zoom-value') as HTMLElement;
         zoomSlider.addEventListener('input', function () {
            zoomValue.textContent = this.value;
         });

         // Event listeners pour les options de taille
         const sizeOptions = content.querySelectorAll('.map-size');
         sizeOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               sizeOptions.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Appliquer la taille
               const size = this.getAttribute('data-size');
               if (!size || !MAP_SIZES[size]) return;

               // Mettre à jour les styles
               const currentCompStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentCompStyles,
                  ...MAP_SIZES[size]
               });

               // Mettre à jour l'attribut
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-size': size
               });
            });
         });

         // Event listeners pour les options de rayon de bordure
         const radiusOptions = content.querySelectorAll('.map-radius');
         radiusOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               radiusOptions.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Appliquer le rayon
               const radius = this.getAttribute('data-radius');
               if (!radius || !BORDER_RADIUS[radius]) return;

               // Mettre à jour les styles
               const currentCompStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentCompStyles,
                  ...BORDER_RADIUS[radius]
               });

               // Mettre à jour l'attribut
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-border-radius': radius
               });
            });
         });
      }
   });
}

function createMapType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.getAttribute('data-gjs-type') === COMPONENT_TYPE) {
            return { type: COMPONENT_TYPE };
         }
         return undefined;
      },
      model: {
         defaults: {
            tagName: 'iframe',
            name: "Map",
            draggable: true,
            droppable: false,
            address: "Paris, France",
            zoom: 10,
            attributes: {
               'data-gjs-type': COMPONENT_TYPE,
               'data-size': 'medium',
               'data-border-radius': 'none'
            },
            style: {
               ...MAP_BASE_STYLES,
               ...BORDER_RADIUS['none']
            },
         },
         init() {
            this.on('change:address change:zoom', this.updateMap);
            this.updateMap();
         },
         updateMap() {
            const address = this.get('address');
            const zoom = this.get('zoom');
            const iframe = `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed"></iframe>`;
            this.components(iframe);
         }
      },
      view: {
         events() {
            return {
               dblclick: 'onDblClick'
            };
         },
         onDblClick(e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();

            const editor = this.model.em?.get('Editor');
            if (editor) {
               editor.Commands.run('open-map-settings', {
                  component: this.model
               });
            }
         }
      }
   };
}

export default mapPlugin;