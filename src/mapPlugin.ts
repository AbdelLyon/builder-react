import type { Plugin, Editor, Component } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

/**
 * Options d'interface pour le plugin de carte
 */
export interface MapPluginOptions {
   /** Catégorie du bloc dans le gestionnaire de blocs */
   category?: string;
   /** Étiquette du bloc de carte */
   labelMapBlock?: string;
   /** Latitude par défaut */
   defaultLatitude?: number;
   /** Longitude par défaut */
   defaultLongitude?: number;
   /** Zoom par défaut */
   defaultZoom?: number;
   /** Hauteurs disponibles */
   heights?: Array<{ value: string; name: string; }>;
}

/**
 * Interface pour les styles de hauteur de carte
 */
interface MapHeight {
   "height": string;
}

/**
 * Interface pour les options de commande
 */
interface CommandOptions {
   component?: Component;
   [key: string]: unknown;
}

/**
 * Interface pour la réponse du géocodage
 */
interface GeocodingResult {
   lat: string;
   lon: string;
   display_name: string;
}

// Type de composant unique pour l'identification
const COMPONENT_TYPE = "custom-map";

// Définition des hauteurs de carte
const MAP_HEIGHTS: Record<string, MapHeight> = {
   "small": {
      "height": "200px"
   },
   "medium": {
      "height": "350px"
   },
   "large": {
      "height": "500px"
   },
   "full": {
      "height": "70vh"
   }
};

// Styles de base pour les cartes
const MAP_BASE_STYLES = {
   "width": "100%",
   "height": "350px",
   "border": "none",
   "border-radius": "4px",
   "box-shadow": "0 2px 4px rgba(0,0,0,0.1)"
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
      category: "Media",
      labelMapBlock: "Carte",
      defaultLatitude: 48.8566,
      defaultLongitude: 2.3522,
      defaultZoom: 13,
      heights: [
         { value: "small", name: "Petite" },
         { value: "medium", name: "Moyenne" },
         { value: "large", name: "Grande" },
         { value: "full", name: "Pleine hauteur" }
      ],
      ...opts
   };

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
      media: `<svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="none" stroke="currentColor" stroke-width="2" d="M9,4 L3,7 L3,20 L9,17 L15,20 L21,17 L21,4 L15,7 L9,4 Z"></path>
      <path fill="none" stroke="currentColor" stroke-width="2" d="M9,4 L9,17"></path>
      <path fill="none" stroke="currentColor" stroke-width="2" d="M15,7 L15,20"></path>
    </svg>`,
      content: { type: COMPONENT_TYPE }
   });
}

/**
 * Fonction pour géocoder une adresse en utilisant Nominatim
 */
async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
   try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
         return data[0] as GeocodingResult;
      }
      return null;
   } catch (error) {
      console.error('Erreur de géocodage:', error);
      return null;
   }
}

/**
 * Génère l'URL pour l'iframe Google Maps
 */
function generateMapUrl(lat: number, lng: number, zoom: number): string {
   return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

function registerCommands(
   editor: Editor,
   options: Required<MapPluginOptions>
): void {
   editor.Commands.add('open-map-settings', {
      run(editor: Editor, _, cmdOptions: CommandOptions = {}): void {
         const component = cmdOptions.component;
         if (!component) return;

         const iframeComponent = component.components().at(0);
         if (!iframeComponent) return;

         // Récupérer les paramètres actuels de la carte
         const currentAttrs = component.getAttributes();
         const currentLatitude = currentAttrs['data-latitude'] || options.defaultLatitude;
         const currentLongitude = currentAttrs['data-longitude'] || options.defaultLongitude;
         const currentZoom = currentAttrs['data-zoom'] || options.defaultZoom;
         const currentHeight = currentAttrs['data-height'] || "medium";
         const currentAddress = currentAttrs['data-address'] || "";

         // Créer le contenu de la modal
         const modalContent = document.createElement('div');
         modalContent.innerHTML = `
            <div class="map-settings">
               <form id="map-settings-form">
                  <div class="map-section">
                     <label class="map-label">Rechercher par adresse</label>
                     <div class="map-input-wrap">
                        <input type="text" class="map-input map-address-input" value="${currentAddress}" placeholder="Ex: 1 rue de Rivoli, Paris, France">
                        <div class="map-address-results"></div>
                        <button type="button" class="map-search-button">Rechercher</button>
                     </div>
                     <div class="map-address-status"></div>
                  </div>
                  
                  <div class="map-section">
                     <label class="map-label">Coordonnées</label>
                     <div class="map-location">
                        <div class="map-input-group">
                           <label class="map-sublabel">Latitude</label>
                           <div class="map-input-wrap">
                              <input class="map-input map-latitude-input" value="${currentLatitude}">
                           </div>
                        </div>
                        <div class="map-input-group">
                           <label class="map-sublabel">Longitude</label>
                           <div class="map-input-wrap">
                              <input class="map-input map-longitude-input" value="${currentLongitude}">
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div class="map-section">
                     <label class="map-label">Zoom</label>
                     <div class="map-input-wrap map-zoom-wrap">
                        <input type="range" min="1" max="18" class="map-zoom-slider" value="${currentZoom}">
                        <span class="map-zoom-value">${currentZoom}</span>
                     </div>
                  </div>
                  
                  <div class="map-section">
                     <label class="map-label">Hauteur</label>
                     <div class="map-heights">
                        ${options.heights.map(height => `
                           <div class="map-height ${currentHeight === height.value ? 'selected' : ''}" data-height="${height.value}">
                              <div class="map-height-bar" style="height: ${height.value === 'small' ? '30px' : height.value === 'medium' ? '45px' : height.value === 'large' ? '60px' : '75px'}"></div>
                              <div class="map-height-name">${height.name}</div>
                           </div>
                        `).join('')}
                     </div>
                  </div>
                  
                  <div class="map-section">
                     <button type="submit" class="map-apply-button">Appliquer</button>
                  </div>
               </form>
            </div>
         `;

         // Ajouter les styles
         const style = document.createElement('style');
         style.textContent = `
            .map-settings {
               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
               display: flex;
               flex-direction: column;
               color: #333;
            }
            
            .map-section {
               margin-bottom: 20px;
            }
            
            .map-label {
               display: block;
               font-weight: 500;
               margin-bottom: 10px;
               color: #343a40;
            }
            
            .map-sublabel {
               display: block;
               font-size: 12px;
               margin-bottom: 5px;
               color: #495057;
            }
            
            .map-input-wrap {
               position: relative;
               display: flex;
               align-items: center;
               gap: 10px;
            }
            
            .map-input {
               flex: 1;
               padding: 10px 12px;
               border: 1px solid #dee2e6;
               border-radius: 6px;
               font-size: 14px;
               transition: border-color 0.2s;
               box-sizing: border-box;
            }
            
            .map-input:focus {
               border-color: #4dabf7;
               outline: none;
               box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
            }
            
            .map-search-button {
               padding: 10px 16px;
               background-color: #0d6efd;
               color: white;
               border: none;
               border-radius: 6px;
               font-weight: 500;
               cursor: pointer;
               transition: background-color 0.2s;
            }
            
            .map-search-button:hover {
               background-color: #0b5ed7;
            }
            
            .map-address-status {
               margin-top: 8px;
               font-size: 14px;
            }
            
            .map-address-results {
               position: absolute;
               top: 100%;
               left: 0;
               right: 0;
               background: white;
               border: 1px solid #dee2e6;
               border-radius: 6px;
               margin-top: 5px;
               max-height: 200px;
               overflow-y: auto;
               z-index: 10;
               display: none;
            }
            
            .map-address-result {
               padding: 10px;
               cursor: pointer;
               border-bottom: 1px solid #f8f9fa;
            }
            
            .map-address-result:hover {
               background-color: #f8f9fa;
            }
            
            .map-location {
               display: flex;
               gap: 15px;
            }
            
            .map-input-group {
               flex: 1;
            }
            
            .map-zoom-wrap {
               display: flex;
               align-items: center;
               gap: 15px;
            }
            
            .map-zoom-slider {
               flex: 1;
               height: 6px;
               -webkit-appearance: none;
               background: #dee2e6;
               border-radius: 3px;
               outline: none;
            }
            
            .map-zoom-slider::-webkit-slider-thumb {
               -webkit-appearance: none;
               width: 18px;
               height: 18px;
               background: #4dabf7;
               border-radius: 50%;
               cursor: pointer;
            }
            
            .map-zoom-value {
               font-weight: 500;
               min-width: 30px;
               text-align: center;
            }
            
            .map-heights {
               display: flex;
               gap: 10px;
            }
            
            .map-height {
               flex: 1;
               cursor: pointer;
               padding: 10px;
               border-radius: 6px;
               background: #f8f9fa;
               transition: all 0.2s;
               text-align: center;
               display: flex;
               flex-direction: column;
               align-items: center;
            }
            
            .map-height:hover {
               background: #e9ecef;
            }
            
            .map-height.selected {
               background: rgba(13, 110, 253, 0.1);
               box-shadow: 0 0 0 2px #4dabf7;
            }
            
            .map-height-bar {
               width: 30px;
               background: #adb5bd;
               margin-bottom: 8px;
               border-radius: 2px;
            }
            
            .map-height-name {
               font-size: 12px;
               font-weight: 500;
            }
            
            .map-apply-button {
               background-color: #0d6efd;
               color: white;
               border: none;
               border-radius: 4px;
               padding: 10px 15px;
               font-size: 14px;
               font-weight: 500;
               cursor: pointer;
               width: 100%;
               transition: background-color 0.2s;
            }
            
            .map-apply-button:hover {
               background-color: #0b5ed7;
            }
            
            .map-settings-modal .gjs-mdl-dialog {
               max-width: 700px !important;
               border-radius: 8px !important;
               overflow: hidden !important;
            }
            
            .map-settings-modal .gjs-mdl-header {
               background-color: #fff !important;
               border-bottom: 1px solid #e9ecef !important;
               padding: 16px 20px !important;
            }

            .map-settings-modal .gjs-mdl-title {
               font-weight: 600 !important;
               font-size: 16px !important;
            }
            
            .map-settings-modal .gjs-mdl-content {
               padding: 20px !important;
            }
            
            .map-settings-modal .gjs-mdl-btn-close {
               font-size: 20px !important;
            }
         `;
         modalContent.appendChild(style);

         // Ouvrir la modal
         editor.Modal.open({
            title: 'Paramètres de la carte',
            content: modalContent,
            attributes: {
               class: 'map-settings-modal'
            }
         });

         // Sélectionner les éléments du formulaire
         const form = modalContent.querySelector('#map-settings-form') as HTMLFormElement;
         const addressInput = modalContent.querySelector('.map-address-input') as HTMLInputElement;
         const searchButton = modalContent.querySelector('.map-search-button') as HTMLButtonElement;
         const statusDisplay = modalContent.querySelector('.map-address-status') as HTMLElement;
         const latInput = modalContent.querySelector('.map-latitude-input') as HTMLInputElement;
         const lngInput = modalContent.querySelector('.map-longitude-input') as HTMLInputElement;
         const zoomSlider = modalContent.querySelector('.map-zoom-slider') as HTMLInputElement;
         const zoomValueDisplay = modalContent.querySelector('.map-zoom-value') as HTMLElement;
         const heightOptions = modalContent.querySelectorAll('.map-height');

         // Variables pour stocker les valeurs sélectionnées
         let selectedHeight = currentHeight;
         let selectedLat = parseFloat(currentLatitude.toString());
         let selectedLng = parseFloat(currentLongitude.toString());
         let selectedZoom = parseInt(currentZoom.toString());
         let selectedAddress = currentAddress;

         // Gestion du zoom
         zoomSlider.addEventListener('input', function () {
            selectedZoom = parseInt(this.value);
            zoomValueDisplay.textContent = selectedZoom.toString();
         });

         // Gestion des coordonnées
         latInput.addEventListener('change', function () {
            selectedLat = parseFloat(this.value);
         });

         lngInput.addEventListener('change', function () {
            selectedLng = parseFloat(this.value);
         });

         // Gestion de la recherche d'adresse
         searchButton.addEventListener('click', async function () {
            if (!addressInput.value.trim()) {
               statusDisplay.textContent = 'Veuillez entrer une adresse à rechercher.';
               statusDisplay.style.color = '#dc3545';
               return;
            }

            statusDisplay.textContent = 'Recherche en cours...';
            statusDisplay.style.color = '#6c757d';

            const result = await geocodeAddress(addressInput.value);

            if (result) {
               statusDisplay.textContent = `Adresse trouvée: ${result.display_name}`;
               statusDisplay.style.color = '#198754';

               // Mettre à jour les coordonnées
               selectedLat = parseFloat(result.lat);
               selectedLng = parseFloat(result.lon);
               selectedAddress = addressInput.value;

               latInput.value = selectedLat.toString();
               lngInput.value = selectedLng.toString();
            } else {
               statusDisplay.textContent = 'Adresse non trouvée. Veuillez essayer avec une adresse plus précise.';
               statusDisplay.style.color = '#dc3545';
            }
         });

         // Gestion des options de hauteur
         heightOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               heightOptions.forEach(el => el.classList.remove('selected'));
               this.classList.add('selected');

               // Stocker la hauteur sélectionnée
               selectedHeight = this.getAttribute('data-height') || 'medium';
            });
         });

         // Gérer la soumission du formulaire
         form.addEventListener('submit', (e) => {
            e.preventDefault();

            // 1. Mettre à jour l'iframe
            const mapUrl = generateMapUrl(selectedLat, selectedLng, selectedZoom);
            iframeComponent.set('attributes', {
               ...iframeComponent.getAttributes(),
               src: mapUrl
            });

            // 2. Mettre à jour les attributs du conteneur
            component.set('attributes', {
               ...component.getAttributes(),
               'data-latitude': selectedLat,
               'data-longitude': selectedLng,
               'data-zoom': selectedZoom,
               'data-height': selectedHeight,
               'data-address': selectedAddress
            });

            // 3. Appliquer la hauteur
            if (MAP_HEIGHTS[selectedHeight]) {
               component.setStyle({
                  ...component.getStyle(),
                  ...MAP_HEIGHTS[selectedHeight]
               });
            }

            // Fermer la modal
            editor.Modal.close();
         });
      }
   });
}

function createMapType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.tagName === 'DIV' && el.hasAttribute('data-gjs-type') &&
            el.getAttribute('data-gjs-type') === COMPONENT_TYPE) {
            return { type: COMPONENT_TYPE };
         }
         return undefined;
      },
      model: {
         defaults: {
            tagName: 'div',
            name: "Map Container",
            draggable: true,
            droppable: false,
            attributes: {
               'data-gjs-type': COMPONENT_TYPE,
               'data-size': 'medium',
               'data-border-radius': 'none',
               'data-latitude': 48.8566,
               'data-longitude': 2.3522,
               'data-zoom': 13,
               'data-height': 'medium',
               'data-address': ''
            },
            style: {
               position: 'relative',
               display: 'block',
               ...MAP_BASE_STYLES
            },
            components: [
               {
                  tagName: 'iframe',
                  attributes: {
                     src: generateMapUrl(48.8566, 2.3522, 13),
                     frameborder: "0",
                     allowfullscreen: ''
                  },
                  style: {
                     width: '100%',
                     height: '100%',
                     border: 'none',
                     'border-radius': '4px',
                     background: '#f8f9fa'
                  }
               },
               {
                  tagName: 'div',
                  draggable: false,
                  droppable: false,
                  toolbar: [],
                  attributes: {
                     class: 'map-edit-button',
                  },
                  style: {
                     "position": 'absolute',
                     "top": '10px',
                     "right": '10px',
                     "z-index": '3',
                     "background": '#0d6efd',
                     "color": 'white',
                     "border": 'none',
                     "padding": '10px 18px',
                     "font-size": '14px',
                     "font-weight": '500',
                     "cursor": 'pointer',
                     "min-width": '120px',
                     "display": 'flex',
                     "align-items": 'center',
                     "justify-content": 'center',
                     "box-shadow": '0 4px 8px rgba(0,0,0,0.15)',
                     "transition": 'all 0.2s ease',
                     "backdrop-filter": 'blur(4px)',
                     "background-color": 'rgba(13, 110, 253, 0.9)',
                     "border-radius": '7px'
                  },
                  content: `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
      <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right: 8px;">
        <path fill="white" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <span>Modifier</span>
    </div>
  `
               }
            ]
         },
         init() {
            this.on('change:attributes:data-latitude change:attributes:data-longitude change:attributes:data-zoom', this.updateMap);
            this.on('change:attributes:data-height', this.updateHeight);
         },
         updateMap() {
            const attrs = this.getAttributes();
            const lat = parseFloat(attrs['data-latitude']) || 48.8566;
            const lng = parseFloat(attrs['data-longitude']) || 2.3522;
            const zoom = parseInt(attrs['data-zoom']) || 13;


            const newSrc = generateMapUrl(lat, lng, zoom);

            // Mise à jour de l'iframe
            const iframe = this.components().at(0);
            if (iframe) {
               iframe.set('attributes', {
                  ...iframe.getAttributes(),
                  src: newSrc
               });
            }
         },
         updateHeight() {
            const height = this.getAttributes()['data-height'] || 'medium';
            if (MAP_HEIGHTS[height]) {
               this.setStyle({
                  ...this.getStyle(),
                  ...MAP_HEIGHTS[height]
               });
            }
         }
      },
      view: {
         events() {
            return {
               dblClick: 'onDblClick',
               'click .map-edit-button': 'onEditClick',
            };
         },
         onRender() {
            // S'assurer que l'iframe et le bouton sont bien visibles
            const iframe = this.el.querySelector('iframe');
            const editButton = this.el.querySelector('.map-edit-button');

            if (iframe && editButton) {
               console.log('Map iframe and edit button rendered successfully');
            }
         },
         onDblClick(e: MouseEvent) {
            this.onEditClick(e);
         },
         onEditClick(e: MouseEvent) {
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