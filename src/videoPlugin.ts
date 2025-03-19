import type { Plugin, Editor, Component } from "grapesjs";

/**
 * Options d'interface pour le plugin d'iframe
 */
export interface IframePluginOptions {
   /** Catégorie du bloc dans le gestionnaire de blocs */
   category?: string;
   /** Étiquette du bloc d'iframe */
   labelIframeBlock?: string;
   /** URL de l'iframe par défaut */
   placeholderIframeUrl?: string;
   /** Options de taille d'iframe disponibles */
   sizes?: Array<{ value: string; name: string; }>;
   /** Options de rayon de bordure disponibles */
   borderRadiusOptions?: Array<{ value: string; name: string; }>;
}

/**
 * Interface pour les styles de taille d'iframe
 */
interface IframeSize {
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
const COMPONENT_TYPE = "custom-iframe";

// Définition des tailles d'iframe
const IFRAME_SIZES: Record<string, IframeSize> = {
   "small": {
      "width": "25%",
      "max-width": "320px"
   },
   "medium": {
      "width": "50%",
      "max-width": "640px"
   },
   "large": {
      "width": "75%",
      "max-width": "960px"
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
   },
   "pill": {
      "border-radius": "24px"
   }
};

// Styles de base pour les iframes
const IFRAME_BASE_STYLES = {
   "display": "block",
   "max-width": "100%",
   "height": "auto",
   "background": "#f8f9fa",
   "aspect-ratio": "16/9",
   "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
   "border": "none"
};

/**
 * Fonction pour convertir une URL YouTube en URL d'intégration
 * @param url L'URL à convertir
 * @returns L'URL convertie au format d'intégration
 */
function convertToEmbedUrl(url: string): string {
   // Si c'est déjà une URL d'intégration, la retourner telle quelle
   if (url.includes('/embed/')) {
      return url;
   }

   // Formats possibles d'URL YouTube
   const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^\/?]+)/i
   ];

   for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
         return `https://www.youtube.com/embed/${match[1]}`;
      }
   }

   // Vimeo
   const vimeoPattern = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)(?:\?.*)?$/i;
   const vimeoMatch = url.match(vimeoPattern);
   if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
   }

   // Si l'URL ne correspond à aucun format connu, retourner l'URL originale
   return url;
}

/**
 * Plugin d'iframe personnalisé pour GrapesJS
 */
const iframePlugin: Plugin<IframePluginOptions> = (
   editor: Editor,
   opts: IframePluginOptions = {}
) => {
   // Options avec valeurs par défaut
   const options: Required<IframePluginOptions> = {
      category: "Media",
      labelIframeBlock: "Iframe",
      placeholderIframeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      sizes: [
         { value: "small", name: "Petite" },
         { value: "medium", name: "Moyenne" },
         { value: "large", name: "Grande" },
         { value: "full", name: "Pleine largeur" }
      ],
      borderRadiusOptions: [
         { value: "none", name: "Aucun" },
         { value: "small", name: "Petit" },
         { value: "medium", name: "Moyen" },
         { value: "large", name: "Grand" },
         { value: "pill", name: "Arrondi" }
      ],
      ...opts
   };

   registerComponents(editor);
   registerBlocks(editor, options);
   registerCommands(editor, options);
};

/**
 * Enregistre le type de composant personnalisé
 */
function registerComponents(editor: Editor): void {
   const domc = editor.DomComponents;

   // Enregistrer le composant conteneur
   domc.addType(COMPONENT_TYPE, {
      model: {
         defaults: {
            tagName: 'div',
            name: "Iframe Container",
            draggable: true,
            droppable: false,
            attributes: {
               'data-gjs-type': COMPONENT_TYPE,
               'data-size': 'medium',
               'data-border-radius': 'none',
            },
            style: {
               position: 'relative',
               display: 'block',
               ...IFRAME_SIZES['medium']
            },
            components: [
               {
                  tagName: 'iframe',
                  attributes: {
                     src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                     frameborder: "0",
                     allowfullscreen: ''
                  },
                  style: {
                     ...IFRAME_BASE_STYLES,
                     ...BORDER_RADIUS['none'],
                     width: '100%'
                  }
               },
               {
                  tagName: 'div',
                  draggable: false,
                  droppable: false,
                  toolbar: [],
                  attributes: {
                     class: 'iframe-edit-button',
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
        <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      <span>Modifier</span>
    </div>
  `
               }
            ]
         },
         init() {
            this.on('change:attributes:data-size', this.updateSize);
            this.on('change:attributes:data-border-radius', this.updateBorderRadius);
         },
         updateSize() {
            const size = this.getAttributes()['data-size'] || 'medium';
            if (IFRAME_SIZES[size]) {
               this.setStyle({ ...this.getStyle(), ...IFRAME_SIZES[size] });
            }
         },
         updateBorderRadius() {
            const radius = this.getAttributes()['data-border-radius'] || 'none';
            const iframe = this.components().at(0);
            if (iframe && BORDER_RADIUS[radius]) {
               iframe.setStyle({ ...iframe.getStyle(), ...BORDER_RADIUS[radius] });
            }
         }
      },
      view: {
         events() {
            return {
               'click': 'onClick'
            };
         },

         onClick(e: MouseEvent) {
            // Si le clic est sur le bouton d'édition, ouvrir la modal
            if ((e.target as HTMLElement).closest('.iframe-edit-button')) {
               this.onEditClick(e);
            }
            // Si le clic est sur le composant lui-même, également ouvrir la modal
            else if (e.target === this.el || this.el.contains(e.target as Node)) {
               this.onEditClick(e);
            }
         },

         onEditClick(e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
            const editor = this.model.em?.get('Editor');
            if (editor) {
               editor.Commands.run('open-iframe-settings', {
                  component: this.model
               });
            }
         },

         init() {
            this.listenTo(this.model, 'change:attributes:src', this.updateIframeSrc);
         },

         updateIframeSrc() {
            const iframe = this.el.querySelector('iframe');
            const iframeComponent = this.model.components().at(0);
            if (iframe && iframeComponent) {
               const src = iframeComponent.getAttributes().src;
               iframe.setAttribute('src', src);
            }
         }
      }
   });
}

/**
 * Enregistre le bloc dans le gestionnaire de blocs
 */
function registerBlocks(
   editor: Editor,
   options: Required<IframePluginOptions>
): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPE, {
      label: options.labelIframeBlock,
      category: options.category,
      media: `<svg viewBox="0 0 24 24" width="24" height="24">
         <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
         <rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      content: { type: COMPONENT_TYPE }
   });
}

/**
 * Enregistre les commandes pour interagir avec le composant
 */
function registerCommands(
   editor: Editor,
   options: Required<IframePluginOptions>
): void {
   editor.Commands.add('open-iframe-settings', {
      run(editor: Editor, _, cmdOptions: CommandOptions = {}): void {
         const component = cmdOptions.component;
         if (!component) return;

         const iframeComponent = component.components().at(0);
         if (!iframeComponent) return;

         // Récupérer les paramètres actuels
         const currentSrc = iframeComponent.getAttributes().src || options.placeholderIframeUrl;
         const currentSize = component.getAttributes()['data-size'] || "medium";
         const currentBorderRadius = component.getAttributes()['data-border-radius'] || "none";
         const currentAllowFullscreen = iframeComponent.getAttributes().allowfullscreen !== undefined;

         // Créer le contenu de la modal
         const modalContent = document.createElement('div');
         modalContent.innerHTML = `
            <div class="iframe-settings">
               <form id="iframe-settings-form">
                  <div class="iframe-section">
                     <label class="iframe-label">URL de l'iframe</label>
                     <div class="iframe-input-wrap">
                        <input type="text" class="iframe-input iframe-src-input" value="${currentSrc}" placeholder="https://exemple.com/embed">
                     </div>
                     <div class="iframe-url-info">
                        Vous pouvez coller n'importe quelle URL YouTube ou Vimeo, elle sera automatiquement convertie au format d'intégration.
                     </div>
                  </div>
                  
                  <div class="iframe-section">
                     <label class="iframe-label">Taille</label>
                     <div class="iframe-sizes">
                        ${options.sizes.map(size => `
                           <div class="iframe-size ${currentSize === size.value ? 'selected' : ''}" data-size="${size.value}">
                              <div class="iframe-size-bar" style="width: ${size.value === 'small' ? '25%' : size.value === 'medium' ? '50%' : size.value === 'large' ? '75%' : '100%'}"></div>
                              <div class="iframe-size-name">${size.name}</div>
                           </div>
                        `).join('')}
                     </div>
                  </div>
                  
                  <div class="iframe-section">
                     <label class="iframe-label">Rayon des coins</label>
                     <div class="iframe-radius-options">
                        ${options.borderRadiusOptions.map(radius => `
                           <div class="iframe-radius ${currentBorderRadius === radius.value ? 'selected' : ''}" data-radius="${radius.value}">
                              <div class="iframe-radius-preview" style="border-radius: ${radius.value === 'none' ? '0' : radius.value === 'small' ? '4px' : radius.value === 'medium' ? '8px' : radius.value === 'large' ? '16px' : '24px'}"></div>
                              <div class="iframe-radius-name">${radius.name}</div>
                           </div>
                        `).join('')}
                     </div>
                  </div>
                  
                  <div class="iframe-section">
                     <label class="iframe-label">Options</label>
                     <div class="iframe-options">
                        <label class="iframe-option">
                           <input type="checkbox" class="iframe-fullscreen-input" ${currentAllowFullscreen ? 'checked' : ''}>
                           <span>Autoriser le plein écran</span>
                        </label>
                     </div>
                  </div>
                  
                  <div class="iframe-section">
                     <button type="submit" class="iframe-apply-button">Appliquer</button>
                  </div>
               </form>
            </div>
         `;

         // Ajouter les styles
         const style = document.createElement('style');
         style.textContent = `
            .iframe-settings {
               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
               display: flex;
               flex-direction: column;
               color: #333;
            }
            
            .iframe-section {
               margin-bottom: 20px;
            }
            
            .iframe-label {
               display: block;
               font-weight: 500;
               margin-bottom: 10px;
               color: #343a40;
            }
            
            .iframe-input-wrap {
               position: relative;
            }
            
            .iframe-input {
               width: 100%;
               padding: 10px 12px;
               border: 1px solid #dee2e6;
               border-radius: 6px;
               font-size: 14px;
               transition: border-color 0.2s;
               box-sizing: border-box;
            }
            
            .iframe-input:focus {
               border-color: #4dabf7;
               outline: none;
               box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
            }
            
            .iframe-url-info {
               font-size: 12px;
               color: #6c757d;
               margin-top: 8px;
            }
            
            .iframe-sizes {
               display: flex;
               gap: 10px;
            }
            
            .iframe-size {
               flex: 1;
               cursor: pointer;
               padding: 10px;
               border-radius: 6px;
               background: #f8f9fa;
               transition: all 0.2s;
               text-align: center;
            }
            
            .iframe-size:hover {
               background: #e9ecef;
            }
            
            .iframe-size.selected {
               background: rgba(13, 110, 253, 0.1);
               box-shadow: 0 0 0 2px #4dabf7;
            }
            
            .iframe-size-bar {
               height: 6px;
               background: #adb5bd;
               border-radius: 3px;
               margin: 10px auto;
            }
            
            .iframe-size-name {
               font-size: 13px;
            }
            
            .iframe-radius-options {
               display: grid;
               grid-template-columns: repeat(5, 1fr);
               gap: 10px;
            }
            
            .iframe-radius {
               cursor: pointer;
               padding: 10px;
               border-radius: 6px;
               background: #f8f9fa;
               transition: all 0.2s;
               text-align: center;
            }
            
            .iframe-radius:hover {
               background: #e9ecef;
            }
            
            .iframe-radius.selected {
               background: rgba(13, 110, 253, 0.1);
               box-shadow: 0 0 0 2px #4dabf7;
            }
            
            .iframe-radius-preview {
               width: 40px;
               height: 40px;
               background: #adb5bd;
               margin: 0 auto 8px;
            }
            
            .iframe-radius-name {
               font-size: 12px;
            }
            
            .iframe-options {
               display: grid;
               grid-template-columns: repeat(2, 1fr);
               gap: 12px;
            }
            
            .iframe-option {
               display: flex;
               align-items: center;
               gap: 8px;
               cursor: pointer;
               font-size: 14px;
            }
            
            .iframe-option input[type="checkbox"] {
               width: 16px;
               height: 16px;
               cursor: pointer;
            }
            
            .iframe-apply-button {
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
            
            .iframe-apply-button:hover {
               background-color: #0b5ed7;
            }
            
            .iframe-settings-modal .gjs-mdl-dialog {
               max-width: 700px !important;
               border-radius: 8px !important;
               overflow: hidden !important;
            }
            
            .iframe-settings-modal .gjs-mdl-header {
               background-color: #fff !important;
               border-bottom: 1px solid #e9ecef !important;
               padding: 16px 20px !important;
            }
            
            .iframe-settings-modal .gjs-mdl-title {
               font-weight: 600 !important;
               font-size: 16px !important;
            }
            
            .iframe-settings-modal .gjs-mdl-content {
               padding: 20px !important;
            }
            
            .iframe-settings-modal .gjs-mdl-btn-close {
               font-size: 20px !important;
            }
         `;
         modalContent.appendChild(style);

         // Ouvrir la modal
         editor.Modal.open({
            title: 'Paramètres d\'Iframe',
            content: modalContent,
            attributes: {
               class: 'iframe-settings-modal'
            }
         });

         // Sélectionner les éléments du formulaire
         const form = modalContent.querySelector('#iframe-settings-form') as HTMLFormElement;
         const srcInput = modalContent.querySelector('.iframe-src-input') as HTMLInputElement;
         const sizeOptions = modalContent.querySelectorAll('.iframe-size');
         const radiusOptions = modalContent.querySelectorAll('.iframe-radius');
         const fullscreenInput = modalContent.querySelector('.iframe-fullscreen-input') as HTMLInputElement;

         // Variables pour stocker les valeurs sélectionnées
         let selectedSize = currentSize;
         let selectedRadius = currentBorderRadius;

         // Gérer les clics sur les options de taille
         sizeOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               sizeOptions.forEach(el => el.classList.remove('selected'));
               this.classList.add('selected');
               selectedSize = this.getAttribute('data-size') || 'medium';
            });
         });

         // Gérer les clics sur les options de rayon
         radiusOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               radiusOptions.forEach(el => el.classList.remove('selected'));
               this.classList.add('selected');
               selectedRadius = this.getAttribute('data-radius') || 'none';
            });
         });

         // Gérer la soumission du formulaire
         form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Récupérer les valeurs
            let src = srcInput.value || options.placeholderIframeUrl;

            // Convertir l'URL si nécessaire
            src = convertToEmbedUrl(src);

            const allowFullscreen = fullscreenInput.checked;

            // 1. Mettre à jour l'iframe
            const iframeAttrs = { ...iframeComponent.getAttributes() };
            iframeAttrs.src = src;

            if (allowFullscreen) {
               iframeAttrs.allowfullscreen = '';
            } else {
               delete iframeAttrs.allowfullscreen;
            }

            iframeComponent.set('attributes', iframeAttrs);

            // 2. Mettre à jour le conteneur
            component.set('attributes', {
               ...component.getAttributes(),
               'data-size': selectedSize,
               'data-border-radius': selectedRadius
            });

            // 3. Appliquer les styles
            if (IFRAME_SIZES[selectedSize]) {
               component.setStyle({
                  ...component.getStyle(),
                  ...IFRAME_SIZES[selectedSize]
               });
            }

            if (BORDER_RADIUS[selectedRadius]) {
               iframeComponent.setStyle({
                  ...iframeComponent.getStyle(),
                  ...BORDER_RADIUS[selectedRadius]
               });
            }

            // Fermer la modal
            editor.Modal.close();
         });
      }
   });
}

export default iframePlugin;