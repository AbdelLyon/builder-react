import type { Plugin, Editor, Component } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

export interface ButtonPluginOptions {
   category?: string;
   labelButtonBlock?: string;
   styles?: Array<{ value: string; name: string; group?: string; }>;
   sizes?: Array<{ value: string; name: string; }>;
}

interface ButtonStyle {
   "background-color": string;
   "border-color": string;
   "color": string;
}

interface ButtonSize {
   "padding": string;
   "font-size": string;
   "border-radius": string;
}

interface ButtonColorSet {
   base: string;
   text: string;
   hover: string;
}

type StyleGroupName = 'Filled' | 'Outline' | 'Ghost' | 'Flat';
type SizeValue = 'small' | 'medium' | 'large';

const COMPONENT_TYPE = "custom-button";

// Couleurs de base
const BUTTON_COLORS: Record<string, ButtonColorSet> = {
   "primary": {
      base: "#0d6efd",
      text: "white",
      hover: "#0b5ed7"
   },
   "secondary": {
      base: "#6c757d",
      text: "white",
      hover: "#5c636a"
   },
   "success": {
      base: "#198754",
      text: "white",
      hover: "#157347"
   },
   "danger": {
      base: "#dc3545",
      text: "white",
      hover: "#bb2d3b"
   },
   "warning": {
      base: "#ffc107",
      text: "#212529",
      hover: "#ffca2c"
   },
   "info": {
      base: "#0dcaf0",
      text: "#212529",
      hover: "#31d2f2"
   },
   "light": {
      base: "#f8f9fa",
      text: "#212529",
      hover: "#e9ecef"
   },
   "dark": {
      base: "#212529",
      text: "white",
      hover: "#1a1e21"
   }
};

// Générer tous les styles de boutons
const BUTTON_STYLES: Record<string, ButtonStyle> = {};

// Ajouter les styles standard
Object.keys(BUTTON_COLORS).forEach(color => {
   BUTTON_STYLES[color] = {
      "background-color": BUTTON_COLORS[color].base,
      "border-color": BUTTON_COLORS[color].base,
      "color": BUTTON_COLORS[color].text
   };
});

// Ajouter les styles outline
Object.keys(BUTTON_COLORS).forEach(color => {
   BUTTON_STYLES[`outline-${color}`] = {
      "background-color": "transparent",
      "border-color": BUTTON_COLORS[color].base,
      "color": BUTTON_COLORS[color].base
   };
});

// Ajouter les styles ghost
Object.keys(BUTTON_COLORS).forEach(color => {
   BUTTON_STYLES[`ghost-${color}`] = {
      "background-color": "transparent",
      "border-color": "transparent",
      "color": BUTTON_COLORS[color].base
   };
});

// Ajouter les styles flat
Object.keys(BUTTON_COLORS).forEach(color => {
   BUTTON_STYLES[`flat-${color}`] = {
      "background-color": `${BUTTON_COLORS[color].base}20`,  // 20% opacité
      "border-color": "transparent",
      "color": BUTTON_COLORS[color].base
   };
});

const BUTTON_SIZES: Record<SizeValue, ButtonSize> = {
   "small": {
      "padding": "0.25rem 0.5rem",
      "font-size": "0.875rem",
      "border-radius": "0.2rem"
   },
   "medium": {
      "padding": "0.375rem 0.75rem",
      "font-size": "1rem",
      "border-radius": "0.25rem"
   },
   "large": {
      "padding": "0.5rem 1rem",
      "font-size": "1.25rem",
      "border-radius": "0.3rem"
   }
};

const BUTTON_BASE_STYLES: Record<string, string> = {
   "display": "inline-block",
   "font-weight": "400",
   "line-height": "1.5",
   "text-align": "center",
   "text-decoration": "none",
   "vertical-align": "middle",
   "cursor": "pointer",
   "user-select": "none",
   "border": "1px solid transparent",
   "transition": "color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out"
};

interface StyleEntry {
   value: string;
   name: string;
   group: StyleGroupName;
}

const buttonPlugin: Plugin<ButtonPluginOptions> = (
   editor: Editor,
   opts: ButtonPluginOptions = {}
) => {
   // Générer les options de style disponibles
   const defaultStyles: StyleEntry[] = [
      // Styles standard
      ...Object.keys(BUTTON_COLORS).map(color => ({
         value: color,
         name: color.charAt(0).toUpperCase() + color.slice(1),
         group: 'Filled'
      })),
      // Styles outline
      ...Object.keys(BUTTON_COLORS).map(color => ({
         value: `outline-${color}`,
         name: `Outline ${color.charAt(0).toUpperCase() + color.slice(1)}`,
         group: 'Outline'
      })),
      // Styles ghost
      ...Object.keys(BUTTON_COLORS).map(color => ({
         value: `ghost-${color}`,
         name: `Ghost ${color.charAt(0).toUpperCase() + color.slice(1)}`,
         group: 'Ghost'
      })),
      // Styles flat
      ...Object.keys(BUTTON_COLORS).map(color => ({
         value: `flat-${color}`,
         name: `Flat ${color.charAt(0).toUpperCase() + color.slice(1)}`,
         group: 'Flat'
      }))
   ] as StyleEntry[];

   const options: Required<ButtonPluginOptions> = {
      category: "Basic",
      labelButtonBlock: "Button",
      styles: opts.styles || defaultStyles,
      sizes: [
         { value: "small", name: "Small" },
         { value: "medium", name: "Medium" },
         { value: "large", name: "Large" }
      ],
   };

   registerComponents(editor);
   registerBlocks(editor, options);
   registerCommands(editor, options);
};

function registerComponents(editor: Editor): void {
   const domc = editor.DomComponents;
   domc.addType(COMPONENT_TYPE, createButtonType());
}

function registerBlocks(
   editor: Editor,
   options: Required<ButtonPluginOptions>
): void {
   const bm = editor.BlockManager;

   bm.add(COMPONENT_TYPE, {
      label: options.labelButtonBlock,
      category: options.category,
      media: `<svg viewBox="0 0 24 24" width="24" height="24">
      <rect x="2" y="6" width="20" height="12" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
    </svg>`,
      content: { type: COMPONENT_TYPE }
   });
}

interface StyleGroupCollection {
   [key: string]: Array<{
      value: string;
      name: string;
      group?: string;
   }>;
}

interface CommandOptions {
   component?: Component;
   [key: string]: unknown;
}

function registerCommands(editor: Editor, options: Required<ButtonPluginOptions>): void {
   editor.Commands.add('open-button-settings', {
      run(editor: Editor, _, cmdOptions: CommandOptions = {}): void {
         const component = cmdOptions.component;
         if (!component) return;

         // Récupérer les paramètres actuels
         const currentStyle = component.getAttributes()['data-style'] || "primary";
         const currentSize = component.getAttributes()['data-size'] || "medium";
         const currentText = component.get('content') || "Button";
         const currentLink = component.getAttributes().href || '';

         // Regrouper les styles par catégorie
         const styleGroups: StyleGroupCollection = {};
         options.styles.forEach(style => {
            const group = style.group || 'Standard';
            if (!styleGroups[group]) {
               styleGroups[group] = [];
            }
            styleGroups[group].push(style);
         });

         // Créer le contenu de la modal
         const content = document.createElement('div');
         content.innerHTML = `
        <div class="btn-settings">
          <div class="btn-preview-wrap">
            <div class="btn-preview-label">Aperçu</div>
            <div class="btn-preview">
              <button class="btn-preview-btn" id="preview-button">${currentText}</button>
            </div>
          </div>
          
          <div class="btn-content">
            <div class="btn-section">
              <label class="btn-label">Texte du bouton</label>
              <div class="btn-input-wrap">
                <input type="text" class="btn-input button-text-input" value="${currentText}" placeholder="Texte du bouton">
              </div>
            </div>
            
            <div class="btn-section">
              <label class="btn-label">Lien URL (optionnel)</label>
              <div class="btn-input-wrap">
                <input type="text" class="btn-input button-link-input" value="${currentLink}" placeholder="https://exemple.fr">
              </div>
            </div>
            
            <div class="btn-section">
              <label class="btn-label">Taille</label>
              <div class="btn-sizes">
                ${options.sizes.map(size => `
                  <div class="btn-size ${currentSize === size.value ? 'selected' : ''}" data-size="${size.value}">
                    <div class="btn-size-inner">
                      <div class="btn-size-bar" style="height: ${size.value === 'small' ? '4px' : size.value === 'medium' ? '6px' : '8px'}"></div>
                    </div>
                    <div class="btn-size-name">${size.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="btn-section">
              <label class="btn-label">Style</label>
              <div class="btn-style-tabs">
                ${Object.keys(styleGroups).map((groupName, index) =>
            `<div class="btn-style-tab ${index === 0 ? 'active' : ''}" data-group="${groupName}">${groupName}</div>`
         ).join('')}
              </div>
              
              <div class="btn-style-panels">
                ${Object.keys(styleGroups).map((groupName, index) => `
                  <div class="btn-style-panel ${index === 0 ? 'active' : ''}" data-group="${groupName}">
                    <div class="btn-styles">
                      ${styleGroups[groupName].map(style => `
                        <div class="btn-style ${currentStyle === style.value ? 'selected' : ''}" data-style="${style.value}">
                          <div class="btn-style-color" style="${getPreviewStyle(style.value)}"></div>
                          <div class="btn-style-name">${style.name.split(' ').pop()}</div>
                        </div>
                      `).join('')}
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
        .btn-settings {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #333;
        }
        
        .btn-preview-wrap {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          text-align: center;
        }
        
        .btn-preview-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6c757d;
          margin-bottom: 15px;
        }
        
        .btn-preview {
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-preview-btn {
          padding: 0.375rem 0.75rem;
          font-size: 1rem;
          border-radius: 0.25rem;
          background-color: #0d6efd;
          color: white;
          border: 1px solid #0d6efd;
        }
        
        .btn-content {
          padding: 0 10px;
        }
        
        .btn-section {
          margin-bottom: 20px;
        }
        
        .btn-label {
          display: block;
          font-weight: 500;
          margin-bottom: 10px;
          color: #343a40;
        }
        
        .btn-input-wrap {
          position: relative;
        }
        
        .btn-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        
        .btn-input:focus {
          border-color: #4dabf7;
          outline: none;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }
        
        .btn-sizes {
          display: flex;
          gap: 15px;
        }
        
        .btn-size {
          flex: 1;
          cursor: pointer;
          padding: 10px;
          border-radius: 6px;
          background: #f8f9fa;
          transition: all 0.2s;
          text-align: center;
        }
        
        .btn-size:hover {
          background: #e9ecef;
        }
        
        .btn-size.selected {
          background: rgba(13, 110, 253, 0.1);
          box-shadow: 0 0 0 2px #4dabf7;
        }
        
        .btn-size-inner {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-size-bar {
          width: 60%;
          background: #adb5bd;
          border-radius: 4px;
        }
        
        .btn-size-label {
          font-size: 13px;
          margin-top: 8px;
        }
        
        .btn-style-tabs {
          display: flex;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 15px;
        }
        
        .btn-style-tab {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }
        
        .btn-style-tab:hover {
          color: #4dabf7;
        }
        
        .btn-style-tab.active {
          border-bottom-color: #4dabf7;
          color: #0d6efd;
          font-weight: 500;
        }
        
        .btn-style-panel {
          display: none;
        }
        
        .btn-style-panel.active {
          display: block;
        }
        
        .btn-styles {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        
        .btn-style {
          cursor: pointer;
          padding: 10px;
          border-radius: 6px;
          background: #fff;
          transition: all 0.2s;
          text-align: center;
          border: 1px solid #e9ecef;
        }
        
        .btn-style:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 10px rgba(0,0,0,0.05);
        }
        
        .btn-style.selected {
          box-shadow: 0 0 0 2px #4dabf7;
        }
        
        .btn-style-color {
          height: 30px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .btn-style-name {
          font-size: 12px;
          font-weight: 500;
        }
        
        .button-settings-modal .gjs-mdl-dialog {
          max-width: 700px !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        
        .button-settings-modal .gjs-mdl-header {
          background-color: #fff !important;
          border-bottom: 1px solid #e9ecef !important;
          padding: 16px 20px !important;
        }
        
        .button-settings-modal .gjs-mdl-title {
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .button-settings-modal .gjs-mdl-content {
          padding: 20px !important;
        }
        
        .button-settings-modal .gjs-mdl-btn-close {
          font-size: 20px !important;
        }
      `;
         content.appendChild(style);

         editor.Modal.open({
            title: 'Paramètres du bouton',
            content,
            attributes: {
               class: 'button-settings-modal'
            }
         });

         // Aperçu du bouton
         const previewButton = content.querySelector('#preview-button') as HTMLButtonElement;
         const updatePreview = (): void => {
            if (!previewButton) return;
            // Màj du texte
            const textInput = content.querySelector('.button-text-input') as HTMLInputElement;
            if (textInput) {
               previewButton.textContent = textInput.value;
            }

            // Récupérer style actuel
            const selectedStyle = content.querySelector('.btn-style.selected') as HTMLElement;
            if (selectedStyle) {
               const styleValue = selectedStyle.getAttribute('data-style');
               if (styleValue && BUTTON_STYLES[styleValue]) {
                  Object.entries(BUTTON_STYLES[styleValue]).forEach(([prop, value]) => {
                     previewButton.style.setProperty(prop, value);

                  });
               }
            }

            // Récupérer taille actuelle
            const selectedSize = content.querySelector('.btn-size.selected') as HTMLElement;
            if (selectedSize) {
               const sizeValue = selectedSize.getAttribute('data-size') as SizeValue;
               if (sizeValue && BUTTON_SIZES[sizeValue]) {
                  Object.entries(BUTTON_SIZES[sizeValue]).forEach(([prop, value]) => {

                     previewButton.style.setProperty(prop, value);

                  });
               }
            }
         };

         // Mise à jour initiale de l'aperçu
         updatePreview();

         // Gestion des onglets
         const tabs = content.querySelectorAll('.btn-style-tab');
         tabs.forEach(tab => {
            tab.addEventListener('click', function (this: HTMLElement) {
               const group = this.getAttribute('data-group');

               // Mettre à jour les onglets
               tabs.forEach(t => t.classList.remove('active'));
               this.classList.add('active');

               // Mettre à jour les panneaux
               const panels = content.querySelectorAll('.btn-style-panel');
               panels.forEach(p => {
                  if (p.getAttribute('data-group') === group) {
                     p.classList.add('active');
                  } else {
                     p.classList.remove('active');
                  }
               });
            });
         });

         // Ajout des event listeners pour les styles
         const styleCards = content.querySelectorAll('.btn-style');
         styleCards.forEach(card => {
            card.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               styleCards.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Appliquer le style au composant
               const style = this.getAttribute('data-style');
               if (!style) return;

               // Important: conserver tous les styles existants et ne changer que le style du bouton
               const currentCompStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentCompStyles,
                  ...BUTTON_STYLES[style]
               });

               // Mettre à jour l'attribut data-style
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-style': style
               });

               // Mettre à jour l'aperçu
               updatePreview();
            });
         });

         // Event listeners pour les tailles
         const sizeCards = content.querySelectorAll('.btn-size');
         sizeCards.forEach(card => {
            card.addEventListener('click', function (this: HTMLElement) {
               // Mise à jour visuelle
               sizeCards.forEach(el => {
                  el.classList.remove('selected');
               });
               this.classList.add('selected');

               // Appliquer la taille au composant
               const size = this.getAttribute('data-size') as SizeValue;
               if (!size || !BUTTON_SIZES[size]) return;

               // Important: conserver tous les styles existants et ne changer que la taille
               const currentCompStyles = { ...component.getStyle() };
               component.setStyle({
                  ...currentCompStyles,
                  ...BUTTON_SIZES[size]
               });

               // Mettre à jour l'attribut data-size
               component.set('attributes', {
                  ...component.getAttributes(),
                  'data-size': size
               });

               // Mettre à jour l'aperçu
               updatePreview();
            });
         });

         // Event listener pour le texte
         const textInput = content.querySelector('.button-text-input') as HTMLInputElement;
         textInput.addEventListener('input', function () {
            component.set('content', this.value);
            // Mettre à jour l'aperçu
            updatePreview();
         });

         // Event listener pour le lien
         const linkInput = content.querySelector('.button-link-input') as HTMLInputElement;
         linkInput.addEventListener('change', function () {
            if (this.value) {
               // Si un lien est fourni, changer en tag <a>
               component.set('tagName', 'a');
               component.set('attributes', {
                  ...component.getAttributes(),
                  href: this.value
               });
            } else {
               // Si pas de lien, revenir au tag <button>
               component.set('tagName', 'button');
               const attrs = { ...component.getAttributes() };
               delete attrs.href;
               component.set('attributes', attrs);
            }
         });
      }
   });
}

// Fonction pour générer le style de prévisualisation
function getPreviewStyle(styleValue: string): string {
   if (!BUTTON_STYLES[styleValue]) return '';

   const style = BUTTON_STYLES[styleValue];
   return Object.entries(style).map(([key, value]) => `${key}: ${value};`).join(' ');
}

interface ButtonModel extends Component {
   handleHrefChange: () => void;
}

interface ButtonView {
   model: ButtonModel;
   onDblClick: (e: MouseEvent) => void;
}

function createButtonType(): AddComponentTypeOptions {
   return {
      isComponent: (el: HTMLElement) => {
         if (el.tagName === 'BUTTON' || (el.tagName === 'A' && el.classList.contains('btn'))) {
            return { type: COMPONENT_TYPE };
         }
         return undefined;
      },
      model: {
         defaults: {
            tagName: 'button',
            name: "Button",
            draggable: true,
            droppable: false,
            attributes: {
               class: "btn",
               'data-style': 'primary',
               'data-size': 'medium'
            },
            style: {
               ...BUTTON_BASE_STYLES,
               ...BUTTON_STYLES['primary'],
               ...BUTTON_SIZES['medium']
            },
            content: "Button"
         },
         init(this: ButtonModel) {
            this.on('change:attributes:href', this.handleHrefChange);
         },
         handleHrefChange(this: ButtonModel) {
            const href = this.getAttributes().href;

            // If href is provided, change to <a> tag
            if (href && href !== '') {
               this.set('tagName', 'a');
            } else {
               this.set('tagName', 'button');
            }
         }
      },
      view: {
         events() {
            return {
               dblclick: 'onDblClick'
            };
         },
         onDblClick(this: ButtonView, e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();

            const editor = this.model.em?.get('Editor');
            if (editor) {
               editor.Commands.run('open-button-settings', {
                  component: this.model
               });
            }
         }
      }
   };
}

export default buttonPlugin;