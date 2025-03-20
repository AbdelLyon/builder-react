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
      text: "#ffff",
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
      base: "#ffff",
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
      "background-color": "#ffff",
      "border-color": BUTTON_COLORS[color].base === "#ffff" ? "#555555" : BUTTON_COLORS[color].base,
      "color": BUTTON_COLORS[color].base === "#ffff" ? "#555555" : BUTTON_COLORS[color].base
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
                <div class="btn-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="btn-section">
              <label class="btn-label">Taille</label>
              <div class="btn-sizes">
                ${options.sizes.map(size => `
                  <div class="btn-size ${currentSize === size.value ? 'selected' : ''}" data-size="${size.value}">
                    <div class="btn-size-inner">
                      <div class="btn-size-bar" style="height: ${size.value === 'small' ? '20px' : size.value === 'medium' ? '30px' : '40px'}"></div>
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #1a202c;
          padding: 0;
          max-width: 650px;
          margin: 0 auto;
        }
        
        .btn-preview-wrap {
          background: #f7fafc;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 20px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .btn-preview-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #718096;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .btn-preview {
          min-height: 50px;
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
          cursor: pointer;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          transition: all 0.2s ease;
          font-weight: 500;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .btn-content {
          padding: 0;
        }
        
        .btn-section {
          margin-bottom: 20px;
        }
        
        .btn-label {
          display: block;
          font-weight: 600;
          margin-bottom: 10px;
          color: #2d3748;
          font-size: 14px;
          letter-spacing: 0.01em;
        }
        
        .btn-input-wrap {
          position: relative;
        }
        
        .btn-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          background-color: #fff;
        }
        
        .btn-input-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
        }
        
        .button-link-input {
          padding-right: 40px;
        }
        
        .btn-input:focus {
          border-color: #4299e1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        }
        
        .btn-sizes {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        
        .btn-size {
          cursor: pointer;
          padding: 14px 10px;
          border-radius: 10px;
          background: #f7fafc;
          transition: all 0.2s ease;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        
        .btn-size:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .btn-size.selected {
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .btn-size-inner {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-size-bar {
          width: 60%;
          background: #ffff;
          border-radius: 4px;
          transition: all 0.2s ease;
          border: 1px solid #e2e8f0;
        }
        
        .btn-size:hover .btn-size-bar {
          opacity: 0.8;
        }
        
        .btn-size-name {
          font-size: 13px;
          margin-top: 8px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .btn-size.selected .btn-size-name {
          color: #2b6cb0;
        }
        
        .btn-style-tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
          gap: 8px;
        }
        
        .btn-style-tab {
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          color: #718096;
          font-weight: 500;
        }
        
        .btn-style-tab:hover {
          color: #4299e1;
        }
        
        .btn-style-tab.active {
          border-bottom-color: #4299e1;
          color: #2b6cb0;
          font-weight: 600;
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
          gap: 12px;
        }
        
        .btn-style {
          cursor: pointer;
          padding: 10px;
          border-radius: 10px;
          background: #f7fafc;
          transition: all 0.2s ease;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        
        .btn-style:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .btn-style.selected {
          background: #ebf8ff;
          box-shadow: 0 0 0 1px rgba(66, 153, 225, 0.3);
        }
        
        .btn-style-color {
          height: 30px;
          border-radius: 6px;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .btn-style-name {
          font-size: 13px;
          font-weight: 500;
          color: #4a5568;
          transition: color 0.2s ease;
        }
        
        .btn-style.selected .btn-style-name {
          color: #2b6cb0;
        }
        
        .button-settings-modal .gjs-mdl-dialog {
          max-width: 700px !important;
          max-height: 98vh !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .button-settings-modal .gjs-mdl-header {
          background-color: #fff !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 20px !important;
        }
        
        .button-settings-modal .gjs-mdl-title {
          font-weight: 700 !important;
          font-size: 18px !important;
          color: #1a202c !important;
        }
        
        .button-settings-modal .gjs-mdl-content {
          padding: 20px !important;
          background-color: #fff !important;
        }
        
        .button-settings-modal .gjs-mdl-btn-close {
          font-size: 18px !important;
          color: #4a5568 !important;
          opacity: 0.8 !important;
          transition: opacity 0.2s ease !important;
        }
        
        .button-settings-modal .gjs-mdl-btn-close:hover {
          opacity: 1 !important;
        }
        
        .button-settings-modal .gjs-mdl-footer {
          background-color: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
          padding: 20px !important;
        }
        
        .button-settings-modal .gjs-mdl-btn {
          padding: 10px 18px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }
        
        .button-settings-modal .gjs-mdl-btn-primary {
          background-color: #4299e1 !important;
          color: #fff !important;
          border: none !important;
        }
        
        .button-settings-modal .gjs-mdl-btn-primary:hover {
          background-color: #3182ce !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
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
   const styleStr = Object.entries(style).map(([key, value]) => `${key}: ${value};`).join(' ');

   // Styles spécifiques selon le type de bouton
   if (styleValue.startsWith('outline-')) {
      return styleStr + 'border-width: 1px;';
   } else if (styleValue.startsWith('ghost-')) {
      // Pour les styles ghost, ajouter un effet de hover subtil
      return styleStr + 'transition: background-color 0.2s ease; border-width: 1px; background-color: #ffff;';
   } else if (styleValue.startsWith('flat-')) {
      // Pour les styles flat, assurer une bonne visibilité de la couleur de fond
      return styleStr + 'border-width: 0; opacity: 0.8;';
   }

   return styleStr;
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