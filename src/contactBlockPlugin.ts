import type { Plugin } from "grapesjs";

export type ContactBlockPluginOptions = {
  /**
   * Category for the blocks
   * @default 'Basic'
   */
  category?: string;

  /**
   * Label for contact block
   * @default 'Contact Block'
   */
  labelContactBlock?: string;
};

const contactBlockPlugin: Plugin<ContactBlockPluginOptions> = (
  editor,
  opts = {},
) => {
  const options = {
    category: "Basic",
    labelContactBlock: "Contact Block",
    ...opts,
  };

  // Add block
  editor.BlockManager.add("contact-block", {
    label: options.labelContactBlock,
    category: options.category,
    content: `
      <div class="contact-block">
        <div class="block-header">Bloc contact</div>
        <div class="avatar-container">
          <div class="avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 20V19C4 16.2386 6.23858 14 9 14H15C17.7614 14 20 16.2386 20 19V20M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="contact-form">
          <div class="form-group">
            <label>Nom Prénom</label>
            <input type="text" name="name" placeholder="Nom Prénom">
          </div>
          <div class="form-group">
            <label>Poste</label>
            <input type="text" name="position" placeholder="Poste">
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <div class="phone-input">
              <div class="country-flag">🇫🇷</div>
              <input type="text" name="phone" placeholder="Téléphone">
            </div>
          </div>
          <div class="form-group">
            <label>Mail</label>
            <input type="email" name="email" placeholder="exemple@domaine.fr">
          </div>
        </div>
        <style>
          .contact-block {
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            background-color: #fff;
            margin-bottom: 20px;
            width: 340px;
          }
          .block-header {
            background-color: #0092ff;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
          }
          .avatar-container {
            display: flex;
            justify-content: center;
            margin: 15px 0;
          }
          .avatar-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color: #f1f1f1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .avatar-placeholder svg {
            width: 40px;
            height: 40px;
            color: #ccc;
          }
          .contact-form {
            padding: 0 15px 15px;
          }
          .form-group {
            margin-bottom: 10px;
          }
          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .form-group input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            background-color: #f9f9f9;
          }
          .phone-input {
            display: flex;
            align-items: center;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            background-color: #f9f9f9;
          }
          .country-flag {
            padding: 0 8px;
          }
          .phone-input input {
            border: none;
            background-color: transparent;
          }
        </style>
      </div>
    `,
    media: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 11C9.10457 11 10 10.1046 10 9C10 7.89543 9.10457 7 8 7C6.89543 7 6 7.89543 6 9C6 10.1046 6.89543 11 8 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 15C16 13.9391 15.5786 12.9217 14.8284 12.1716C14.0783 11.4214 13.0609 11 12 11H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 8H17.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  });

  // Add component type
  editor.DomComponents.addType("contact-block", {
    isComponent: (el) => el.classList && el.classList.contains("contact-block"),
    model: {
      defaults: {
        name: "Contact Block",
        droppable: false,
        traits: [
          {
            type: "text",
            name: "name",
            label: "Name",
          },
          {
            type: "text",
            name: "position",
            label: "Position",
          },
          {
            type: "text",
            name: "phone",
            label: "Phone",
          },
          {
            type: "text",
            name: "email",
            label: "Email",
          },
          {
            type: "checkbox",
            name: "preview",
            label: "Preview Mode",
          },
        ],
      },

      init() {
        this.on("change:traits", this.onTraitsChange);
        this.on("change:attributes:preview", this.togglePreviewMode);
      },

      onTraitsChange() {
        // Update the view if in preview mode
        if (this.get("attributes")?.preview) {
          this.togglePreviewMode();
        }
      },

      togglePreviewMode() {
        const isPreview = this.get("attributes")?.preview;
        const name = this.getTrait("name")?.get("value") || "";
        const position = this.getTrait("position")?.get("value") || "";
        const phone = this.getTrait("phone")?.get("value") || "";
        const email = this.getTrait("email")?.get("value") || "";

        if (isPreview) {
          // Switch to preview mode
          this.set(
            "content",
            `
            <div class="block-header">Bloc contact</div>
            <div class="contact-info">
              <div class="avatar">
                <img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgMjBWMTlDNCAxNi4yMzg2IDYuMjM4NTggMTQgOSAxNEgxNUMxNy43NjE0IDE0IDIwIDE2LjIzODYgMjAgMTlWMjBNMTYgN0MxNiA5LjIwOTE0IDE0LjIwOTEgMTEgMTIgMTFDOS43OTA4NiAxMSA4IDkuMjA5MTQgOCA3QzggNC43OTA4NiA5Ljc5MDg2IDMgMTIgM0MxNC4yMDkxIDMgMTYgNC43OTA4NiAxNiA3WiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==" alt="Avatar">
              </div>
              <div class="details">
                <h3 class="contact-name">${name}</h3>
                <p class="contact-position">${position}</p>
                <div class="communication">
                  <div class="contact-phone">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.896.34 1.84.574 2.8.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${phone}</span>
                  </div>
                  <div class="contact-email">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${email}</span>
                  </div>
                </div>
              </div>
            </div>
            <style>
              .contact-block {
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
                background-color: #fff;
                margin-bottom: 20px;
                width: 340px;
              }
              .block-header {
                background-color: #0092ff;
                color: white;
                padding: 10px 15px;
                font-weight: bold;
              }
              .contact-info {
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
              }
              .avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;
                background-color: #f1f1f1;
              }
              .avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .details {
                flex: 1;
              }
              .contact-name {
                margin: 0 0 5px 0;
                font-size: 16px;
                font-weight: bold;
              }
              .contact-position {
                margin: 0 0 10px 0;
                color: #666;
                font-size: 14px;
              }
              .communication {
                display: flex;
                flex-direction: column;
                gap: 8px;
              }
              .contact-phone, .contact-email {
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .contact-phone svg, .contact-email svg {
                color: #666;
              }
              .contact-phone span, .contact-email span {
                font-size: 14px;
              }
            </style>
          `,
          );
        } else {
          // Switch to edit mode
          this.set(
            "content",
            `
            <div class="block-header">Bloc contact</div>
            <div class="avatar-container">
              <div class="avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 20V19C4 16.2386 6.23858 14 9 14H15C17.7614 14 20 16.2386 20 19V20M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="contact-form">
              <div class="form-group">
                <label>Nom Prénom</label>
                <input type="text" name="name" placeholder="Nom Prénom" value="${name}">
              </div>
              <div class="form-group">
                <label>Poste</label>
                <input type="text" name="position" placeholder="Poste" value="${position}">
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <div class="phone-input">
                  <div class="country-flag">🇫🇷</div>
                  <input type="text" name="phone" placeholder="Téléphone" value="${phone}">
                </div>
              </div>
              <div class="form-group">
                <label>Mail</label>
                <input type="email" name="email" placeholder="exemple@domaine.fr" value="${email}">
              </div>
            </div>
            <style>
              .contact-block {
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                overflow: hidden;
                background-color: #fff;
                margin-bottom: 20px;
              }
              .block-header {
                background-color: #0092ff;
                color: white;
                padding: 10px 15px;
                font-weight: bold;
              }
              .avatar-container {
                display: flex;
                justify-content: center;
                margin: 15px 0;
              }
              .avatar-placeholder {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background-color: #f1f1f1;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .avatar-placeholder svg {
                width: 40px;
                height: 40px;
                color: #ccc;
              }
              .contact-form {
                padding: 0 15px 15px;
              }
              .form-group {
                margin-bottom: 10px;
              }
              .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                font-size: 14px;
              }
              .form-group input {
                width: 100%;
                padding: 8px 10px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                background-color: #f9f9f9;
              }
              .phone-input {
                display: flex;
                align-items: center;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                background-color: #f9f9f9;
              }
              .country-flag {
                padding: 0 8px;
              }
              .phone-input input {
                border: none;
                background-color: transparent;
              }
            </style>
          `,
          );
        }
      },
    },

    view: {
      events() {
        return {
          "change input": "handleInputChange",
        };
      },

      handleInputChange(e: InputEvent) {
        const input = e.target as HTMLInputElement;
        const name = input.getAttribute("name");
        if (!name) return;

        // Update corresponding trait
        const trait = this.model.getTrait(name);
        if (trait) {
          trait.set("value", input.value);
        }
      },

      init() {
        // Add custom toolbar button for toggling preview mode
        const model = this.model;
        const toolbar = model.get("toolbar") || [];

        // Add toggle button to toolbar
        toolbar.push({
          command: "contact-block:toggle-preview",
          label: "Toggle Preview",
          attributes: { title: "Toggle Preview Mode" },
        });

        model.set("toolbar", toolbar);
      },
    },
  });

  // Add command to toggle preview mode
  editor.Commands.add("contact-block:toggle-preview", {
    run(editor) {
      const selectedComponent = editor.getSelected();
      if (!selectedComponent) return;

      const isPreview = selectedComponent.get("attributes")?.preview;
      selectedComponent.set("attributes", {
        ...selectedComponent.get("attributes"),
        preview: !isPreview,
      });
    },
  });

  // Listen for input changes to update traits
  editor.on("component:update", (component) => {
    if (component.get("tagName") === "INPUT") {
      const parent = component.parent();
      const grandparent = parent && parent.parent();

      if (grandparent && grandparent.is("contact-block")) {
        const name = component.get("attributes").name;
        if (name) {
          const trait = grandparent.getTrait(name);
          if (trait) {
            trait.set("value", component.get("attributes").value);
          }
        }
      }
    }
  });
};

export default contactBlockPlugin;
