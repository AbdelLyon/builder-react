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
      media: `<svg viewBox="0 0 24 24" width="24" height="24">
      <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <polygon points="15,10 17,13 13,17 7,11 22,11 22,18" fill="currentColor"/>
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
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
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
            </div>
          </div>
          
          <div class="image-section">
            <label class="image-label">Taille</label>
            <div class="image-sizes">
              ${options.sizes.map(size => `
                <div class="image-size ${currentSize === size.value ? 'selected' : ''}" data-size="${size.value}">
                  <div class="image-size-bar" style="width: ${size.value === 'small' ? '25%' : size.value === 'medium' ? '50%' : size.value === 'large' ? '75%' : '100%'}"></div>
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
                  <div class="image-radius-preview" style="border-radius: ${radius.value === 'none' ? '0' : radius.value === 'small' ? '4px' : radius.value === 'medium' ? '8px' : radius.value === 'large' ? '16px' : '50%'}"></div>
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
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #333;
        }
        
        .image-section {
          margin-bottom: 20px;
        }
        
        .image-label {
          display: block;
          font-weight: 500;
          margin-bottom: 10px;
          color: #343a40;
        }
        
        .image-input-wrap {
          position: relative;
        }
        
        .image-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        
        .image-input:focus {
          border-color: #4dabf7;
          outline: none;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }
        
        .image-dropzone {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .image-dropzone:hover, .image-dropzone.dragover {
          border-color: #0d6efd;
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        .image-dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .image-upload-icon {
          color: #6c757d;
        }
        
        .image-upload-text {
          font-size: 16px;
          color: #343a40;
        }
        
        .image-browse-button {
          background: none;
          border: none;
          color: #0d6efd;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
        }
        
        .image-browse-button:hover {
          text-decoration: underline;
        }
        
        .image-upload-info {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
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
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-top: 10px;
        }
        
        .image-file-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .image-file-name {
          font-weight: 500;
          color: #343a40;
        }
        
        .image-file-size {
          font-size: 12px;
          color: #6c757d;
        }
        
        .image-remove-file {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .image-remove-file:hover {
          background-color: rgba(220, 53, 69, 0.1);
        }
        
        .image-sizes {
          display: flex;
          gap: 10px;
        }
        
        .image-size {
          flex: 1;
          cursor: pointer;
          padding: 10px;
          border-radius: 6px;
          background: #f8f9fa;
          transition: all 0.2s;
          text-align: center;
        }
        
        .image-size:hover {
          background: #e9ecef;
        }
        
        .image-size.selected {
          background: rgba(13, 110, 253, 0.1);
          box-shadow: 0 0 0 2px #4dabf7;
        }
        
        .image-size-bar {
          height: 6px;
          background: #adb5bd;
          border-radius: 3px;
          margin: 10px auto;
        }
        
        .image-size-name {
          font-size: 13px;
        }
        
        .image-radius-options {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }
        
        .image-radius {
          cursor: pointer;
          padding: 10px;
          border-radius: 6px;
          background: #f8f9fa;
          transition: all 0.2s;
          text-align: center;
        }
        
        .image-radius:hover {
          background: #e9ecef;
        }
        
        .image-radius.selected {
          background: rgba(13, 110, 253, 0.1);
          box-shadow: 0 0 0 2px #4dabf7;
        }
        
        .image-radius-preview {
          width: 40px;
          height: 40px;
          background: #adb5bd;
          margin: 0 auto 8px;
        }
        
        .image-radius-name {
          font-size: 12px;
        }
        
        .image-settings-modal .gjs-mdl-dialog {
          max-width: 700px !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        
        .image-settings-modal .gjs-mdl-header {
          background-color: #fff !important;
          border-bottom: 1px solid #e9ecef !important;
          padding: 16px 20px !important;
        }
        
        .image-settings-modal .gjs-mdl-title {
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .image-settings-modal .gjs-mdl-content {
          padding: 20px !important;
        }
        
        .image-settings-modal .gjs-mdl-btn-close {
          font-size: 20px !important;
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