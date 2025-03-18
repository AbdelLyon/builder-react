import type { Plugin, Editor, Component } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

interface MapModel extends Component {
   updateMap: () => void;
}

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
const COMPONENT_TYPE = "map";

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

function registerCommands(
   editor: Editor,
   options: Required<MapPluginOptions>
): void {
   editor.Commands.add('open-map-settings', {
      run(editor: Editor, _, cmdOptions: CommandOptions = {}): void {
         const component = cmdOptions.component;
         if (!component) return;

         // Récupérer les paramètres actuels de la carte
         const currentMap = component.getAttributes();
         const currentLatitude = currentMap['data-latitude'] || options.defaultLatitude;
         const currentLongitude = currentMap['data-longitude'] || options.defaultLongitude;
         const currentZoom = currentMap['data-zoom'] || options.defaultZoom;
         const currentHeight = currentMap['data-height'] || "medium";
         const currentAddress = currentMap['data-address'] || "";

         // Créer le contenu de la modal
         const content = document.createElement('div');
         content.innerHTML = `
        <div class="map-settings">
          <div class="map-section">
            <label class="map-label">Rechercher par adresse</label>
            <div class="map-input-wrap">
              <input type="text" class="map-input map-address-input" value="${currentAddress}" placeholder="Ex: 1 rue de Rivoli, Paris, France">
              <div class="map-address-results"></div>
              <button class="map-search-button">Rechercher</button>
            </div>
            <div class="map-address-status"></div>
          </div>
          
          <div class="map-section">
            <label class="map-label">Coordonnées</label>
            <div class="map-location">
              <div class="map-input-group">
                <label class="map-sublabel">Latitude</label>
                <div class="map-input-wrap">
                  <input type="number" step="0.0001" class="map-input map-latitude-input" value="${currentLatitude}">
                </div>
              </div>
              <div class="map-input-group">
                <label class="map-sublabel">Longitude</label>
                <div class="map-input-wrap">
                  <input type="number" step="0.0001" class="map-input map-longitude-input" value="${currentLongitude}">
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
         content.appendChild(style);

         editor.Modal.open({
            title: 'Paramètres de la carte',
            content,
            attributes: {
               class: 'map-settings-modal'
            }
         });

         // Gestion du zoom
         const zoomSlider = content.querySelector('.map-zoom-slider') as HTMLInputElement;
         const zoomValueDisplay = content.querySelector('.map-zoom-value') as HTMLElement;

         zoomSlider.addEventListener('input', function () {
            const zoomValue = parseInt(this.value);
            zoomValueDisplay.textContent = zoomValue.toString();

            // Mettre à jour l'attribut
            component.set('attributes', {
               ...component.getAttributes(),
               'data-zoom': zoomValue
            });

            // Mettre à jour la carte
            updateMapIframe(component);
         });

         // Gestion des coordonnées
         const latInput = content.querySelector('.map-latitude-input') as HTMLInputElement;
         const lngInput = content.querySelector('.map-longitude-input') as HTMLInputElement;

         latInput.addEventListener('change', function () {
            component.set('attributes', {
               ...component.getAttributes(),
               'data-latitude': parseFloat(this.value)
            });
            updateMapIframe(component);
         });

         lngInput.addEventListener('change', function () {
            component.set('attributes', {
               ...component.getAttributes(),
               'data-longitude': parseFloat(this.value)
            });
            updateMapIframe(component);
         });

         // Gestion de la recherche d'adresse
         const addressInput = content.querySelector('.map-address-input') as HTMLInputElement;
         const searchButton = content.querySelector('.map-search-button') as HTMLButtonElement;
         const statusDisplay = content.querySelector('.map-address-status') as HTMLElement;

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
               const lat = parseFloat(result.lat);
               const lng = parseFloat(result.lon);

               latInput.value = lat.toString();
               lngInput.value = lng.toString();

               // Mettre à jour les attributs
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-latitude': lat,
                  'data-longitude': lng,
                  'data-address': addressInput.value
               });

               // Mettre à jour la carte
               updateMapIframe(component);
            } else {
               statusDisplay.textContent = 'Adresse non trouvée. Veuillez essayer avec une adresse plus précise.';
               statusDisplay.style.color = '#dc3545';
            }
         });

         // Event listeners pour les options de hauteur
         const heightOptions = content.querySelectorAll('.map-height');
         heightOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               heightOptions.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Appliquer la hauteur
               const height = this.getAttribute('data-height');
               if (!height || !MAP_HEIGHTS[height]) return;

               // Mettre à jour les styles
               const currentCompStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentCompStyles,
                  ...MAP_HEIGHTS[height]
               });

               // Mettre à jour l'attribut
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-height': height
               });
            });
         });
      }
   });
}


function createMapType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if ((el.tagName === 'DIV' && el.classList.contains('map-container')) ||
            (el.tagName === 'IFRAME' && el.classList.contains('map'))) {
            return { type: COMPONENT_TYPE };
         }
         return undefined;
      },
      model: {
         defaults: {
            tagName: 'div',
            name: "Carte",
            draggable: true,
            droppable: false,
            attributes: {
               class: 'map-container',
               'data-latitude': 48.8566,
               'data-longitude': 2.3522,
               'data-zoom': 13,
               'data-height': 'medium',
               'data-address': ''
            },
            style: {
               ...MAP_BASE_STYLES,
               position: 'relative',

            },
            components: [
               {
                  tagName: 'iframe',
                  attributes: {
                     class: 'map',
                     frameborder: '0',
                     allowfullscreen: 'true',
                     src: generateMapUrl(48.8566, 2.3522, 13),
                     style: 'width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1;'
                  }
               },
               {
                  // Ajouter une couche transparente pour intercepter les clics
                  tagName: 'div',
                  attributes: {
                     class: 'map-overlay',
                     style: 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; background: transparent; cursor: pointer;'
                  }
               }
            ]
         },
         init() {
            this.on('change:attributes:data-latitude change:attributes:data-longitude change:attributes:data-zoom', this.updateMap);
         },
         updateMap() {
            const lat = parseFloat(this.getAttributes()['data-latitude']) || 48.8566;
            const lng = parseFloat(this.getAttributes()['data-longitude']) || 2.3522;
            const zoom = parseInt(this.getAttributes()['data-zoom']) || 13;

            const newSrc = generateMapUrl(lat, lng, zoom);

            // Trouver et mettre à jour l'iframe
            const iframe: Component | undefined = this.components().filter((comp: Component) => comp.get('tagName') === 'iframe')[0];
            if (iframe) {
               iframe.set('attributes', {
                  ...iframe.getAttributes(),
                  src: newSrc
               });
            }
         }
      },
      view: {
         onRender() {
            // Forcer le rafraîchissement de l'iframe après le rendu
            const model = this.model as MapModel;

            // Utiliser setTimeout pour s'assurer que le DOM est complètement chargé
            setTimeout(() => {
               if (typeof model.updateMap === 'function') {
                  model.updateMap();
               }
            }, 100);

            // Ajouter un écouteur d'événements à la couche de superposition
            const overlay = this.el.querySelector('.map-overlay');
            if (overlay) {
               overlay.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // Si on est en mode édition, ouvrir les paramètres de la carte
                  const editor = this.model.em?.get('Editor');
                  if (editor) {
                     editor.Commands.run('open-map-settings', {
                        component: this.model
                     });
                  }
               });
            }
         },
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
/**
 * Génère l'URL pour l'iframe OpenStreetMap
 */
function generateMapUrl(lat: number, lng: number, zoom: number): string {
   return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

/**
 * Met à jour l'iframe de la carte avec les nouvelles valeurs
 */
function updateMapIframe(component: Component): void {
   const attributes = component.getAttributes();
   const lat = parseFloat(attributes['data-latitude']) || 48.8566;
   const lng = parseFloat(attributes['data-longitude']) || 2.3522;
   const zoom = parseInt(attributes['data-zoom']) || 13;

   // Générer la nouvelle URL Google Maps
   const newSrc = generateMapUrl(lat, lng, zoom);

   // Mettre à jour l'attribut src dans le modèle
   component.set('attributes', {
      ...component.getAttributes(),
      src: newSrc
   });

   // Accéder à l'élément iframe
   const iframe = component.view?.el;
   if (iframe) {
      // Créer un nouvel iframe
      const newIframe = document.createElement('iframe');

      // Copier tous les attributs de l'ancien iframe
      Array.from(iframe.attributes).forEach(attr => {
         newIframe.setAttribute(attr.name, attr.value);
      });

      // Définir explicitement la nouvelle source
      newIframe.src = newSrc;

      // Remplacer l'ancien iframe par le nouveau
      if (iframe.parentNode) {
         iframe.parentNode.replaceChild(newIframe, iframe);

         // Important: mettre à jour la référence de l'élément dans la vue
         if (component.view) {
            component.view.el = newIframe;
         }
      }
   }
}
export default mapPlugin;