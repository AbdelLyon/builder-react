import type { Editor, Component } from 'grapesjs';
import type { AddComponentTypeOptions } from 'grapesjs';
import { Plugin } from "grapesjs";

/**
 * Options d'interface pour le plugin de vidéo
 */
export interface VideoPluginOptions {
   /** Catégorie du bloc dans le gestionnaire de blocs */
   category?: string;
   /** Étiquette du bloc de vidéo */
   labelVideoBlock?: string;
   /** URL de la vidéo par défaut */
   defaultVideoUrl?: string;
   /** Options de taille de vidéo disponibles */
   sizes?: Array<{ value: string; name: string; }>;
   /** Options de rayon de bordure disponibles */
   borderRadiusOptions?: Array<{ value: string; name: string; }>;
}

/**
 * Interface pour les styles de taille de vidéo
 */
interface VideoSize {
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
const COMPONENT_TYPE = "custom-video";

// Définition des tailles de vidéo
const VIDEO_SIZES: Record<string, VideoSize> = {
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

// Styles de base pour les vidéos
const VIDEO_BASE_STYLES = {
   "display": "block",
   "margin": "0 auto",
   "height": "350px",
   "border": "1px solid #ddd",
   "overflow": "hidden"
};

/**
 * Fonction pour convertir une URL YouTube ou Vimeo en URL d'iframe
 */
function getEmbedUrl(url: string): string {
   if (!url) return '';

   // YouTube
   const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
   if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
   }

   // Vimeo
   const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?)([0-9]+)/);
   if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
   }

   // Return original URL if no match
   return url;
}

/**
 * Plugin de vidéo personnalisé pour GrapesJS
 */
const videoPlugin: Plugin<VideoPluginOptions> = (
   editor: Editor,
   opts: VideoPluginOptions = {}
) => {
   // Options avec valeurs par défaut
   const options: Required<VideoPluginOptions> = {
      category: "Media",
      labelVideoBlock: "Video",
      defaultVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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
   domc.addType(COMPONENT_TYPE, createVideoType());
}

function registerBlocks(
   editor: Editor,
   options: Required<VideoPluginOptions>
): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPE, {
      label: options.labelVideoBlock,
      category: options.category,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
      </svg>`,
      content: { type: COMPONENT_TYPE }
   });
}

function registerCommands(
   editor: Editor,
   options: Required<VideoPluginOptions>
): void {
   editor.Commands.add('open-video-settings', {
      run(editor: Editor, _, cmdOptions: CommandOptions = {}): void {
         const component = cmdOptions.component;
         if (!component) return;

         // Récupérer les paramètres actuels de la vidéo
         const currentVideoUrl = component.get('videoUrl') || options.defaultVideoUrl;
         const currentSize = component.getAttributes()['data-size'] || "medium";
         const currentBorderRadius = component.getAttributes()['data-border-radius'] || "none";

         // Créer le contenu de la modal
         const content = document.createElement('div');
         content.innerHTML = `
        <div class="video-settings">
          <div class="video-content">
            <div class="video-section">
              <label class="video-label">URL de la vidéo (YouTube, Vimeo ou autre)</label>
              <div class="video-input-wrap">
                <input type="text" class="video-input video-url-input" value="${currentVideoUrl}" placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ">
                <div class="video-input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="10" y1="15" x2="10" y2="9"></line>
                    <line x1="14" y1="9" x2="14" y2="15"></line>
                  </svg>
                </div>
              </div>
              <div class="video-input-help">
                Collez l'URL complète de la vidéo YouTube ou Vimeo, ou directement une URL d'iframe
              </div>
            </div>
            
            <div class="video-section">
              <label class="video-label">Taille</label>
              <div class="video-sizes">
                ${options.sizes.map(size => `
                  <div class="video-size ${currentSize === size.value ? 'selected' : ''}" data-size="${size.value}">
                    <div class="video-size-inner">
                      <div class="video-size-bar" style="width: ${size.value === 'small' ? '50%' : size.value === 'medium' ? '75%' : size.value === 'large' ? '90%' : '100%'}"></div>
                    </div>
                    <div class="video-size-name">${size.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="video-section">
              <label class="video-label">Rayon des coins</label>
              <div class="video-radius-options">
                ${options.borderRadiusOptions.map(radius => `
                  <div class="video-radius ${currentBorderRadius === radius.value ? 'selected' : ''}" data-radius="${radius.value}">
                    <div class="video-radius-inner">
                      <div class="video-radius-preview" style="border-radius: ${radius.value === 'none' ? '0' : radius.value === 'small' ? '4px' : radius.value === 'medium' ? '8px' : '16px'}"></div>
                    </div>
                    <div class="video-radius-name">${radius.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;

         // Ajouter les styles
         const style = document.createElement('style');
         style.textContent = `
        .video-settings {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #1a202c;
          padding: 0;
          max-width: 650px;
          margin: 0 auto;
        }
        
        .video-content {
          padding: 0;
        }
        
        .video-section {
          margin-bottom: 24px;
        }
        
        .video-label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: #2d3748;
          font-size: 14px;
          letter-spacing: 0.01em;
        }
        
        .video-input-wrap {
          position: relative;
        }
        
        .video-input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 40px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          background-color: #fff;
        }
        
        .video-input:focus {
          border-color: #4299e1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
        
        .video-input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }
        
        .video-input-help {
          font-size: 13px;
          color: #718096;
          margin-top: 8px;
          line-height: 1.5;
        }
        
        .video-sizes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
        .video-size {
          cursor: pointer;
          padding: 14px 10px;
          border-radius: 10px;
          background: #f7fafc;
          transition: all 0.2s ease;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        
        .video-size:hover {
          transform: translateY(-2px);
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .video-size.selected {
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .video-size-inner {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .video-size-bar {
          height: 18px;
          border-radius: 4px;
          background: #fff;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .video-size:hover .video-size-bar {
          opacity: 0.8;
        }
        
        .video-size-name {
          font-size: 13px;
          margin-top: 8px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .video-size.selected .video-size-name {
          color: #2b6cb0;
        }
        
        .video-radius-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
        .video-radius {
          cursor: pointer;
          padding: 10px;
          border-radius: 10px;
          background: #f7fafc;
          transition: all 0.2s ease;
          text-align: center;
          display:flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .video-radius:hover {
          transform: translateY(-2px);
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .video-radius.selected {
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .video-radius-inner {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .video-radius-preview {
          width: 30px;
          height: 30px;
          background: #fff;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .video-radius:hover .video-radius-preview {
          opacity: 0.8;
        }
        
        .video-radius-name {
          font-size: 13px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .video-radius.selected .video-radius-name {
          color: #2b6cb0;
        }
        
        .video-settings-modal .gjs-mdl-dialog {
          max-width: 700px !important;
          max-height: 98vh !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .video-settings-modal .gjs-mdl-header {
          background-color: #fff !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 20px !important;
        }
        
        .video-settings-modal .gjs-mdl-title {
          font-weight: 700 !important;
          font-size: 18px !important;
          color: #1a202c !important;
        }
        
        .video-settings-modal .gjs-mdl-content {
          padding: 20px !important;
          background-color: #fff !important;
        }
        
        .video-settings-modal .gjs-mdl-btn-close {
          font-size: 18px !important;
          color: #4a5568 !important;
          opacity: 0.8 !important;
          transition: opacity 0.2s ease !important;
        }
        
        .video-settings-modal .gjs-mdl-btn-close:hover {
          opacity: 1 !important;
        }
        
        .video-settings-modal .gjs-mdl-footer {
          background-color: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
          padding: 20px !important;
        }
        
        .video-settings-modal .gjs-mdl-btn {
          padding: 10px 18px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }
        
        .video-settings-modal .gjs-mdl-btn-primary {
          background-color: #4299e1 !important;
          color: #fff !important;
          border: none !important;
        }
        
        .video-settings-modal .gjs-mdl-btn-primary:hover {
          background-color: #3182ce !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
      `;
         content.appendChild(style);

         editor.Modal.open({
            title: 'Paramètres de la vidéo',
            content,
            attributes: {
               class: 'video-settings-modal'
            }
         }).onceClose(() => {
            // Appliquer les modifications au composant lorsque la modal se ferme
            const videoUrlInput = content.querySelector('.video-url-input') as HTMLInputElement;

            if (videoUrlInput) {
               const videoUrl = videoUrlInput.value.trim() || options.defaultVideoUrl;
               component.set('videoUrl', videoUrl);
            }
         });

         // Event listener pour l'URL
         const videoUrlInput = content.querySelector('.video-url-input') as HTMLInputElement;
         videoUrlInput.addEventListener('input', function () {
            // Cette fonction est conservée pour maintenir la cohérence
            // mais ne fait rien puisque l'aperçu a été retiré
         });

         // Event listeners pour les options de taille
         const sizeOptions = content.querySelectorAll('.video-size');
         sizeOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               sizeOptions.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Appliquer la taille
               const size = this.getAttribute('data-size');
               if (!size || !VIDEO_SIZES[size]) return;

               // Mettre à jour les styles
               const currentCompStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentCompStyles,
                  ...VIDEO_SIZES[size]
               });

               // Mettre à jour l'attribut
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-size': size
               });
            });
         });

         // Event listeners pour les options de rayon de bordure
         const radiusOptions = content.querySelectorAll('.video-radius');
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

function createVideoType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.getAttribute('data-gjs-type') === COMPONENT_TYPE) {
            return { type: COMPONENT_TYPE };
         }
         return undefined;
      },
      model: {
         defaults: {
            tagName: 'div',
            name: "Video",
            draggable: true,
            droppable: false,
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            attributes: {
               'data-gjs-type': COMPONENT_TYPE,
               'data-size': 'full',
               'data-border-radius': 'none'
            },
            style: {
               ...VIDEO_BASE_STYLES,
               ...BORDER_RADIUS['none']
            },
         },
         init() {
            this.on('change:videoUrl', this.updateVideoContent);
            const videoUrl = this.get('videoUrl');
            this.updateIframe(getEmbedUrl(videoUrl));
         },
         updateVideoContent() {
            const videoUrl = this.get('videoUrl');
            this.updateIframe(getEmbedUrl(videoUrl));
         },
         updateIframe(embedUrl: string) {
            const iframe = `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
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
               editor.Commands.run('open-video-settings', {
                  component: this.model
               });
            }
         }
      }
   };
}

export default videoPlugin;