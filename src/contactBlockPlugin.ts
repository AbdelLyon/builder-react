import type { Plugin, Editor } from "grapesjs";
import type { AddComponentTypeOptions } from "grapesjs";

export interface ContactPluginOptions {
  category?: string;
  labelContactBlock?: string;
}

const COMPONENT_TYPES = {
  CONTACT: "contact",
  CONTACT_FIELD: "contactField",
} as const;

const contactPlugin: Plugin<ContactPluginOptions> = (
  editor: Editor,
  opts: ContactPluginOptions = {},
) => {
  const options: Required<ContactPluginOptions> = {
    category: "Basic",
    labelContactBlock: "Contact",
    ...opts,
  };
  registerComponents(editor);
  registerBlocks(editor, options);
};

function registerComponents(editor: Editor): void {
  const domc = editor.DomComponents;
  domc.addType(COMPONENT_TYPES.CONTACT, createContactType());
}

function registerBlocks(
  editor: Editor,
  options: Required<ContactPluginOptions>,
): void {
  const bm = editor.BlockManager;

  bm.add(COMPONENT_TYPES.CONTACT, {
    label: options.labelContactBlock,
    category: options.category,
    media: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>`,
    content: { type: COMPONENT_TYPES.CONTACT },
  });
}

function createContactType(): AddComponentTypeOptions {
  return {
    isComponent: (el: HTMLElement) => {
      if (el.classList && el.classList.contains("contact-block")) {
        return { type: COMPONENT_TYPES.CONTACT };
      }
      return undefined;
    },
    model: {
      defaults: {
        name: "Contact Block",
        attributes: {
          class: "contact-block",
        },
        style: {
          width: "100%",
          "max-width": "400px",
          padding: "20px",
          border: "1px solid #e0e0e0",
          "border-radius": "8px",
          "box-sizing": "border-box",
          margin: "0 auto",
        },
        components: [
          {
            tagName: "div",
            toolbar: [],
            attributes: {
              class: "contact-header",
            },
            style: {
              "background-color": "#d9d9d9",
              padding: "15px",
              margin: "-20px -20px 20px -20px",
              "border-radius": "8px 8px 0 0",
              "font-weight": "bold",
            },
            components: [
              {
                type: "text",
                content: "Bloc contact",
                draggable: false,
                toolbar: [],
              }
            ]
          },
          {
            type: "image",
            toolbar: [],
            content: "Bloc contact",
            draggable: false,
            style: {
              width: "80px",
              height: "80px",
              "border-radius": "50%",
              overflow: "hidden",
              "margin-bottom": "20px",
              display: "block",
              "background-color": "#d9d9d9",
            },
            attributes: {
              src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjNjY2Ii8+PC9zdmc+",
              alt: "Avatar"
            },
          },
          {
            tagName: "input",
            draggable: false,
            toolbar: [],
            void: true,
            attributes: {
              class: "contact-field-input",
              type: "text",
              placeholder: "Nom Prénom...",
            },
            style: {
              width: "100%",
              "border-radius": "5px",
              padding: "10px",
              border: "1px solid #ddd",
              "box-sizing": "border-box",
              "margin-bottom": "10px"
            },
          },
          {
            tagName: "input",
            draggable: false,
            toolbar: [],
            void: true,
            attributes: {
              class: "contact-field-input",
              type: "text",
              placeholder: "Poste...",
            },
            style: {
              width: "100%",
              "border-radius": "5px",
              padding: "10px",
              border: "1px solid #ddd",
              "box-sizing": "border-box",
              "margin-bottom": "10px"
            },
          },
          {
            tagName: 'div',
            draggable: false,
            toolbar: [],
            style: {
              'position': 'relative',
              'width': '100%',
              "margin-bottom": "10px"
            },
            components: [
              {
                tagName: 'input',
                toolbar: [],
                draggable: false,
                void: true,
                attributes: {
                  class: 'contact-field-input',
                  type: 'tel',
                  placeholder: 'Téléphone...',
                  style: 'padding-left: 40px'
                },
                style: {
                  'width': '100%',
                  "border-radius": "5px",
                  padding: "10px",
                  'padding-left': '40px',
                  'border': '1px solid #ddd',
                  'box-sizing': 'border-box'
                }
              },
              {
                tagName: 'span',
                draggable: false,
                toolbar: [],
                style: {
                  'position': 'absolute',
                  'left': '10px',
                  'top': '50%',
                  'transform': 'translateY(-50%)',
                  'display': 'inline-flex',
                  'align-items': 'center'
                },
                content: `
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" style="width: 24px; height: 16px; vertical-align: middle; border-radius: 3px; overflow: hidden;">
                    <rect width="30" height="20" fill="#ED2939"/>
                    <rect width="20" height="20" fill="#FFFFFF"/>
                    <rect width="10" height="20" fill="#002395"/>
                  </svg>
                `
              }
            ]
          },
          {
            tagName: "input",
            draggable: false,
            toolbar: [],
            void: true,
            attributes: {
              class: "contact-field-input",
              type: "email",
              placeholder: "E-mail...",
            },
            style: {
              width: "100%",
              "border-radius": "5px",
              padding: "10px",
              border: "1px solid #ddd",
              "box-sizing": "border-box",
              "margin-bottom": "10px"
            },
          },
        ],
      },
    },
  };
}

export default contactPlugin;