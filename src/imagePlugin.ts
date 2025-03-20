import type { Plugin, Editor, Component } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

/**
 * Options d'interface pour le plugin d'image
 */
export interface ImagePluginOptions {
   /** Catégorie du bloc dans le gestionnaire de blocs */
   category?: string;
   /** Étiquette du bloc d'image */
   labelImageBlock?: string;
   /** URL de l'image par défaut */
   placeholderImageUrl?: string;
   /** Options de taille d'image disponibles */
   sizes?: Array<{ value: string; name: string; }>;
   /** Options de rayon de bordure disponibles */
   borderRadiusOptions?: Array<{ value: string; name: string; }>;
   /** Taille maximale du fichier en Mo (défaut: 5Mo) */
   maxFileSize?: number;
}

/**
 * Interface pour les styles de taille d'image
 */
interface ImageSize {
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
const COMPONENT_TYPE = "custom-image";

// Définition des tailles d'image
const IMAGE_SIZES: Record<string, ImageSize> = {
   "small": {
      "width": "25%",
      "max-width": "300px"
   },
   "medium": {
      "width": "50%",
      "max-width": "500px"
   },
   "large": {
      "width": "75%",
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
   },
   "circle": {
      "border-radius": "50%"
   }
};

// Styles de base pour les images
const IMAGE_BASE_STYLES = {
   "display": "block",
   "max-width": "100%",
   "height": "auto",
   "object-fit": "cover"
};

/**
 * Plugin d'image personnalisé pour GrapesJS
 */
const imagePlugin: Plugin<ImagePluginOptions> = (
   editor: Editor,
   opts: ImagePluginOptions = {}
) => {
   // Options avec valeurs par défaut
   const options: Required<ImagePluginOptions> = {
      category: "Media",
      labelImageBlock: "Image",
      placeholderImageUrl: "https://placehold.co/600x400",
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
         { value: "large", name: "Large" },
         { value: "circle", name: "Circle" }
      ],
      maxFileSize: 5, // 5 Mo par défaut
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
   domc.addType(COMPONENT_TYPE, createImageType());
}

function registerBlocks(
   editor: Editor,
   options: Required<ImagePluginOptions>
): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPE, {
      label: options.labelImageBlock,
      category: options.category,
      media: `<svg viewBox="0 0 24 24">
        <path fill="currentColor" d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M5,17L8.5,12.5L11,15.5L14.5,11L19,17H5Z" />
      </svg>`,
      content: { type: COMPONENT_TYPE }
   });
}

function registerCommands(
   editor: Editor,
   options: Required<ImagePluginOptions>
): void {
   editor.Commands.add('open-image-settings', {
      run(editor: Editor, _, cmdOptions: CommandOptions = {}): void {
         const component = cmdOptions.component;
         if (!component) return;

         // Récupérer les paramètres actuels de l'image
         const currentSrc = component.getAttributes().src || options.placeholderImageUrl;
         const currentSize = component.getAttributes()['data-size'] || "medium";
         const currentBorderRadius = component.getAttributes()['data-border-radius'] || "none";

         // Créer le contenu de la modal
         const content = document.createElement('div');
         content.innerHTML = `
        <div class="image-settings">
          <div class="image-section">
            <div class="image-dropzone" id="image-dropzone">
              <input type="file" class="image-file-input" accept="image/*">
              <div class="image-dropzone-content">
                <div class="image-upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M7 16.2V14.2H17V16.2H7Z" fill="currentColor"/>
                    <path d="M12 12.5V4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M9 7.5L12 4.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 14.5V19.5H19V14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="image-upload-text">
                  <span>Glissez une image ou</span>
                  <button class="image-browse-button">Parcourir</button>
                </div>
                <div class="image-upload-info">
                  Formats acceptés: JPG, PNG, GIF, SVG<br>
                  Taille max: ${options.maxFileSize}MB
                </div>
              </div>
            </div>
            <div class="image-file-preview">
              <div class="image-file-info">
                <div class="image-file-name">filename.jpg</div>
                <div class="image-file-size">123 KB</div>
              </div>
              <button class="image-remove-file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="image-section">
            <label class="image-label">URL de l'image</label>
            <div class="image-input-wrap">
              <input type="text" class="image-input image-src-input" value="${currentSrc}" placeholder="https://exemple.com/image.jpg">
              <div class="image-input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            </div>
          </div>
          
          <div class="image-section">
            <label class="image-label">Taille</label>
            <div class="image-sizes">
              ${options.sizes.map(size => `
                <div class="image-size ${currentSize === size.value ? 'selected' : ''}" data-size="${size.value}">
                  <div class="image-size-inner">
                    <div class="image-size-bar" style="width: ${size.value === 'small' ? '25%' : size.value === 'medium' ? '50%' : size.value === 'large' ? '75%' : '100%'}"></div>
                  </div>
                  <div class="image-size-name">${size.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="image-section">
            <label class="image-label">Rayon des coins</label>
            <div class="image-radius-options">
              ${options.borderRadiusOptions.map(radius => `
                <div class="image-radius ${currentBorderRadius === radius.value ? 'selected' : ''}" data-radius="${radius.value}">
                  <div class="image-radius-inner">
                    <div class="image-radius-preview" style="border-radius: ${radius.value === 'none' ? '0' : radius.value === 'small' ? '4px' : radius.value === 'medium' ? '8px' : radius.value === 'large' ? '16px' : '50%'}"></div>
                  </div>
                  <div class="image-radius-name">${radius.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

         // Ajouter les styles
         const style = document.createElement('style');
         style.textContent = `
        .image-settings {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #1a202c;
          padding: 0;
          max-width: 650px;
          margin: 0 auto;
        }
        
        .image-section {
          margin-bottom: 24px;
        }
        
        .image-label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: #2d3748;
          font-size: 14px;
          letter-spacing: 0.01em;
        }
        
        .image-input-wrap {
          position: relative;
        }
        
        .image-input {
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
        
        .image-input:focus {
          border-color: #4299e1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
        
        .image-input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }
        
        .image-dropzone {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 36px 24px;
          text-align: center;
          transition: all 0.25s ease;
          cursor: pointer;
          background-color: #f8fafc;
        }
        
        .image-dropzone:hover, .image-dropzone.dragover {
          border-color: #4299e1;
          background-color: rgba(66, 153, 225, 0.05);
        }
        
        .image-dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .image-upload-icon {
          color: #a0aec0;
          transition: color 0.2s ease;
        }
        
        .image-dropzone:hover .image-upload-icon {
          color: #4299e1;
        }
        
        .image-upload-text {
          font-size: 16px;
          color: #4a5568;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .image-browse-button {
          background: none;
          border: none;
          color: #3182ce;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
          transition: color 0.2s ease;
        }
        
        .image-browse-button:hover {
          color: #2b6cb0;
          text-decoration: underline;
        }
        
        .image-upload-info {
          font-size: 13px;
          color: #718096;
          margin-top: 6px;
          line-height: 1.5;
        }
        
        .image-file-input {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          z-index: -1;
        }
        
        .image-file-preview {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: #f7fafc;
          border-radius: 10px;
          margin-top: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .image-file-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .image-file-name {
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
        }
        
        .image-file-size {
          font-size: 12px;
          color: #718096;
        }
        
        .image-remove-file {
          background: none;
          border: none;
          color: #e53e3e;
          cursor: pointer;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .image-remove-file:hover {
          background-color: rgba(229, 62, 62, 0.1);
        }
        
        .image-sizes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
        .image-size {
          cursor: pointer;
          padding: 10px;
          border-radius: 10px;
          background: #f7fafc;
          transition: all 0.2s ease;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        
        .image-size:hover {
          background: #ebf8ff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
       .image-size.selected  {
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .image-size-inner {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-size-bar {
          height: 18px;
          border-radius: 4px;
          background: #fff;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .image-size:hover .image-size-bar {
          opacity: 0.8;
        }
        
        .image-size-name {
          font-size: 13px;
          margin-top: 10px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .image-size.selected .image-size-name {
          color: #2b6cb0;
        }

        .image-radius-options {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        
        .image-radius {
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
        
        .image-radius:hover {
          background: #ebf8ff;
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .image-radius.selected {
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .image-radius-inner {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-radius-preview {
          width: 30px;
          height: 30px;
          background: #fff;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        
        .image-radius:hover .image-radius-preview {
          opacity: 0.8;
        }
        
        .image-radius-name {
          font-size: 13px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .image-radius.selected .image-radius-name {
          color: #2b6cb0;
        }
        
        .image-settings-modal .gjs-mdl-dialog {
          max-width: 700px !important;
          max-height: 98vh !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .image-settings-modal .gjs-mdl-header {
          background-color: #fff !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 20px !important;
        }
        
        .image-settings-modal .gjs-mdl-title {
          font-weight: 700 !important;
          font-size: 18px !important;
          color: #1a202c !important;
        }
        
        .image-settings-modal .gjs-mdl-content {
          padding: 20px !important;
          background-color: #fff !important;
        }
        
        .image-settings-modal .gjs-mdl-btn-close {
          font-size: 18px !important;
          color: #4a5568 !important;
          opacity: 0.8 !important;
          transition: opacity 0.2s ease !important;
        }
        
        .image-settings-modal .gjs-mdl-btn-close:hover {
          opacity: 1 !important;
        }
        
        .image-settings-modal .gjs-mdl-footer {
          background-color: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
          padding: 20px !important;
        }
        
        .image-settings-modal .gjs-mdl-btn {
          padding: 10px 18px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }
        
        .image-settings-modal .gjs-mdl-btn-primary {
          background-color: #4299e1 !important;
          color: #fff !important;
          border: none !important;
        }
        
        .image-settings-modal .gjs-mdl-btn-primary:hover {
          background-color: #3182ce !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
      `;
         content.appendChild(style);

         editor.Modal.open({
            title: 'Paramètres d\'Image',
            content,
            attributes: {
               class: 'image-settings-modal'
            }
         });

         // Gestion du téléchargement de fichier
         const dropzone = content.querySelector('#image-dropzone') as HTMLElement;
         const fileInput = content.querySelector('.image-file-input') as HTMLInputElement;
         const browseButton = content.querySelector('.image-browse-button') as HTMLButtonElement;
         const filePreview = content.querySelector('.image-file-preview') as HTMLElement;
         const fileName = content.querySelector('.image-file-name') as HTMLElement;
         const fileSize = content.querySelector('.image-file-size') as HTMLElement;
         const removeButton = content.querySelector('.image-remove-file') as HTMLButtonElement;

         // Ouvrir le sélecteur de fichier en cliquant sur le bouton
         browseButton.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
         });

         // Clic sur la zone de dépôt
         dropzone.addEventListener('click', () => {
            fileInput.click();
         });

         // Gérer le glisser-déposer
         dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
         });

         dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
         });

         dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');

            if (e.dataTransfer && e.dataTransfer.files.length) {
               handleFile(e.dataTransfer.files[0]);
            }
         });

         // Gérer la sélection de fichier
         fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
               handleFile(this.files[0]);
            }
         });

         // Gérer la suppression du fichier
         removeButton.addEventListener('click', () => {
            filePreview.style.display = 'none';
            dropzone.style.display = 'block';
            fileInput.value = '';
         });

         // Gestion des fichiers
         const handleFile = (file: File) => {
            // Vérifier la taille du fichier
            if (file.size > options.maxFileSize * 1024 * 1024) {
               alert(`Le fichier est trop volumineux. La taille maximale est de ${options.maxFileSize}MB.`);
               return;
            }

            // Mettre à jour les informations du fichier
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);

            // Afficher la prévisualisation du fichier
            dropzone.style.display = 'none';
            filePreview.style.display = 'flex';

            // Convertir l'image en base64
            const reader = new FileReader();
            reader.onload = function (e) {
               const base64Img = e.target?.result as string;

               // Mettre à jour le champ d'URL avec l'image base64
               const srcInput = content.querySelector('.image-src-input') as HTMLInputElement;
               if (srcInput) {
                  srcInput.value = base64Img;
               }

               // Mettre à jour le composant
               component.set('attributes', {
                  ...component.getAttributes(),
                  src: base64Img
               });
            };

            reader.readAsDataURL(file);
         };

         // Event listener pour l'URL
         const srcInput = content.querySelector('.image-src-input') as HTMLInputElement;
         srcInput.addEventListener('change', function () {
            const src = this.value || options.placeholderImageUrl;
            component.set('attributes', {
               ...component.getAttributes(),
               src
            });
         });

         // Event listeners pour les options de taille
         const sizeOptions = content.querySelectorAll('.image-size');
         sizeOptions.forEach(option => {
            option.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               sizeOptions.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Appliquer la taille
               const size = this.getAttribute('data-size');
               if (!size || !IMAGE_SIZES[size]) return;

               // Mettre à jour les styles
               const currentCompStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentCompStyles,
                  ...IMAGE_SIZES[size]
               });

               // Mettre à jour l'attribut
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-size': size
               });
            });
         });

         // Event listeners pour les options de rayon de bordure
         const radiusOptions = content.querySelectorAll('.image-radius');
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

function createImageType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.tagName === 'IMG') {
            return { type: COMPONENT_TYPE };
         }
         return undefined;
      },
      model: {
         defaults: {
            tagName: 'img',
            name: "Image",
            draggable: true,
            droppable: false,
            attributes: {
               src: "https://placehold.co/600x400",
               alt: "Image description",
               'data-size': 'medium',
               'data-border-radius': 'none'
            },
            style: {
               ...IMAGE_BASE_STYLES,
               ...IMAGE_SIZES['medium'],
               ...BORDER_RADIUS['none']
            },
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
               editor.Commands.run('open-image-settings', {
                  component: this.model
               });
            }
         }
      }
   };
}

function formatFileSize(bytes: number): string {
   if (bytes < 1024) return bytes + ' B';
   else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
   else return (bytes / 1048576).toFixed(1) + ' MB';
}

export default imagePlugin;