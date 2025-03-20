import type { Plugin, Editor } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

export interface SpacerPluginOptions {
   category?: string;
   labelSpacerBlock?: string;
   sizes?: Array<{ value: string; name: string; }>;
}

const COMPONENT_TYPE = "spacer";

const spacerPlugin: Plugin<SpacerPluginOptions> = (
   editor: Editor,
   opts: SpacerPluginOptions = {}
) => {
   const options: Required<SpacerPluginOptions> = {
      category: "Basic",
      labelSpacerBlock: "Espacement",
      sizes: [
         { value: "5px", name: "2XS" },
         { value: "10px", name: "XS" },
         { value: "15px", name: "S" },
         { value: "20px", name: "M" },
         { value: "30px", name: "L" },
         { value: "40px", name: "XL" },
         { value: "60px", name: "2XL" },
         { value: "80px", name: "3XL" },
         { value: "100px", name: "4XL" },
         { value: "120px", name: "5XL" },
      ],
      ...opts,
   };

   registerComponents(editor);
   registerBlocks(editor, options);
   registerCommands(editor, options);
};

function registerComponents(editor: Editor): void {
   const domc = editor.DomComponents;
   domc.addType(COMPONENT_TYPE, createSpacerType());
}

function registerBlocks(
   editor: Editor,
   options: Required<SpacerPluginOptions>
): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPE, {
      label: options.labelSpacerBlock,
      category: options.category,
      media: `<svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="currentColor" d="M20,10h-2V8h2V10z M20,6h-2V4h2V6z M20,2h-2V0h2V2z M18,14h2v-2h-2V14z M18,18h2v-2h-2V18z M18,22h2v-2h-2V22z M16,22h-4v2h4V22z M12,22H8v2h4V22z M4,22h4v-2H4V22z M2,22H0v2h2V22z M2,18H0v4h2V18z M2,14H0v4h2V14z M2,10H0v4h2V10z M2,6H0v4h2V6z M2,2H0v4h2V2z M6,0H2v2h4V0z M10,0H6v2h4V0z M14,0h-4v2h4V0z M18,0h-4v2h4V0z"></path>
    </svg>`,
      content: { type: COMPONENT_TYPE },
   });
}

function registerCommands(editor: Editor, options: Required<SpacerPluginOptions>) {
   editor.Commands.add('open-spacer-settings', {
      run(editor, sender, cmdOptions = {}) {
         const component = cmdOptions.component;
         if (!component) return;

         // Récupérer la hauteur actuelle
         const currentHeight = component.getStyle().height || "20px";

         // Créer le contenu de la modal
         const content = document.createElement('div');
         content.innerHTML = `
            <div class="modern-spacer-settings">
               <div class="modern-spacer-preview-wrap">
                  <div class="modern-spacer-preview-label">Aperçu</div>
                  <div class="modern-spacer-preview">
                     <div class="modern-spacer-preview-element" id="preview-spacer" style="height: ${currentHeight};"></div>
                  </div>
               </div>
               
               <div class="modern-spacer-content">
                  <div class="modern-spacer-section">
                     <label class="modern-spacer-label">Hauteur</label>
                     <div class="modern-spacer-sizes">
                        ${options.sizes.map(size => `
                           <div class="modern-spacer-size ${currentHeight === size.value ? 'selected' : ''}" 
                                data-height="${size.value}">
                              <div class="modern-spacer-size-inner">
                                 <div class="modern-spacer-size-bar" style="height: ${parseInt(size.value) / 3}px"></div>
                              </div>
                              <div class="modern-spacer-size-info">
                                 <div class="modern-spacer-size-name">${size.name}</div>
                                 <div class="modern-spacer-size-value">${size.value}</div>
                              </div>
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
            .modern-spacer-settings {
               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
               display: flex;
               flex-direction: column;
               color: #333;
            }
            
            .modern-spacer-preview-wrap {
               background: #f8f9fa;
               padding: 20px;
               border-radius: 8px;
               margin-bottom: 24px;
               text-align: center;
            }
            
            .modern-spacer-preview-label {
               font-size: 12px;
               text-transform: uppercase;
               letter-spacing: 0.5px;
               color: #6c757d;
               margin-bottom: 15px;
            }
            
            .modern-spacer-preview {
               min-height: 100px;
               display: flex;
               align-items: center;
               justify-content: center;
               padding: 10px 0;
            }
            
            .modern-spacer-preview-element {
               width: 80%;
               background: repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #e8e8e8 10px, #e8e8e8 20px);
               border: 1px dashed #ccc;
               border-radius: 4px;
               transition: height 0.3s ease;
            }
            
            .modern-spacer-content {
               padding: 0 10px;
            }
            
            .modern-spacer-section {
               margin-bottom: 20px;
            }
            
            .modern-spacer-label {
               display: block;
               font-weight: 500;
               margin-bottom: 15px;
               color: #343a40;
               font-size: 14px;
            }
            
            .modern-spacer-sizes {
               display: grid;
               grid-template-columns: repeat(2, 1fr);
               gap: 12px;
            }
            
            .modern-spacer-size {
               cursor: pointer;
               padding: 12px;
               border-radius: 6px;
               background: #f8f9fa;
               transition: all 0.2s;
               display: flex;
               align-items: center;
               border: 1px solid #e9ecef;
            }
            
            .modern-spacer-size:hover {
               background: #e9ecef;
               transform: translateY(-2px);
               box-shadow: 0 5px 10px rgba(0,0,0,0.05);
            }
            
            .modern-spacer-size.selected {
               background: rgba(15, 120, 230, 0.2);
               box-shadow: 0 0 0 2px rgba(15, 120, 230, 0.6);;
            }
            
            .modern-spacer-size-inner {
               width: 30px;
               height: 30px;
               display: flex;
               align-items: center;
               justify-content: center;
               margin-right: 10px;
            }
            
            .modern-spacer-size-bar {
               width: 20px;
               background: #adb5bd;
               border-radius: 4px;
            }
            
            .modern-spacer-size-info {
               flex: 1;
            }
            
            .modern-spacer-size-name {
               font-size: 13px;
               font-weight: 600;
               color: #212529;
            }
            
            .modern-spacer-size-value {
               font-size: 11px;
               color: #6c757d;
               margin-top: 3px;
            }
            
            .spacer-settings-modal .gjs-mdl-dialog {
               max-width: 450px !important;
               border-radius: 8px !important;
               overflow: hidden !important;
            }
            
            .spacer-settings-modal .gjs-mdl-header {
               background-color: #fff !important;
               border-bottom: 1px solid #e9ecef !important;
               padding: 16px 20px !important;
            }
            
            .spacer-settings-modal .gjs-mdl-title {
               font-weight: 600 !important;
               font-size: 16px !important;
            }
            
            .spacer-settings-modal .gjs-mdl-content {
               padding: 20px !important;
            }
            
            .spacer-settings-modal .gjs-mdl-btn-close {
               font-size: 20px !important;
            }
         `;
         content.appendChild(style);

         // Ouvrir la modal
         editor.Modal.open({
            title: 'Hauteur de l\'espacement',
            content,
            attributes: {
               class: 'spacer-settings-modal'
            }
         });

         // Aperçu de l'espacement
         const previewSpacer = content.querySelector('#preview-spacer') as HTMLElement;

         // Mise à jour de l'aperçu
         const updatePreview = (height: string): void => {
            if (previewSpacer) {
               previewSpacer.style.height = height;
            }
         };

         // Ajout des event listeners
         const sizeCards = content.querySelectorAll('.modern-spacer-size');
         sizeCards.forEach(card => {
            card.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               sizeCards.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Récupérer la hauteur
               const height = this.getAttribute('data-height');
               if (!height) return;

               // Mettre à jour l'aperçu
               updatePreview(height);

               // Appliquer au composant
               const currentStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentStyles,
                  height,
                  background: "repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #e8e8e8 10px, #e8e8e8 20px)",
                  border: "1px dashed #ccc",
               });
            });
         });
      }
   });
}
function createSpacerType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.classList && el.classList.contains("spacer")) {
            return { type: COMPONENT_TYPE };
         }
         return undefined;
      },
      model: {
         defaults: {
            name: "Espacement",
            draggable: true,
            attributes: {
               class: "spacer",
            },
            style: {
               height: "20px",
               width: "100%",
               display: "block",
               background: "repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #e8e8e8 10px, #e8e8e8 20px)",
               border: "1px dashed #ccc",
               "box-sizing": "border-box",
            },
            traits: []
         },
         init() {
            this.on('change:style', this.ensureVisualStyle);
         },
         ensureVisualStyle() {
            const currentStyle = this.getStyle();
            if (!currentStyle.background || !currentStyle.border) {
               this.setStyle({
                  ...currentStyle,
                  background: "repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #e8e8e8 10px, #e8e8e8 20px)",
                  border: "1px dashed #ccc",
               });
            }
         }
      },
      view: {
         events(): { [key: string]: string; } {
            return {
               'dblclick': 'onDblClick'
            };
         },
         onDblClick(e: MouseEvent): void {
            e.preventDefault();
            e.stopPropagation();

            const editor: Editor | undefined = this.model.em?.get('Editor');
            if (editor) {
               editor.Commands.run('open-spacer-settings', {
                  component: this.model
               });
            }
         },
         onRender() {
            const model = this.model;
            const currentStyle = model.getStyle();
            if (!currentStyle.background || !currentStyle.border) {
               model.setStyle({
                  ...currentStyle,
                  background: "repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 10px, #e8e8e8 10px, #e8e8e8 20px)",
                  border: "1px dashed #ccc",
               });
            }
         }
      }
   };
}

export default spacerPlugin;