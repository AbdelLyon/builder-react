import { Editor as GrapesEditor } from "grapesjs";
import tinymce, { Editor as TinyEditor, RawEditorOptions } from "tinymce";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface HTMLElementWithTinyMCE extends HTMLElement {
  __originalContent?: string;
}

const AI_CONFIG = {
  model: "gemini-2.0-flash-001",
  apiKey: "AIzaSyBq0Fncy7OF3ktGBMhPla-tkk-XkOX_kcE",
};

class TinyMCECustomRTESingleton {
  private static instance: TinyMCECustomRTESingleton;
  private editor: GrapesEditor;
  private options: RawEditorOptions;
  private currentElement: HTMLElementWithTinyMCE | null = null;
  private modalContainer: HTMLDivElement | null = null;
  private genAI: GoogleGenerativeAI;

  private constructor (editor: GrapesEditor, options: RawEditorOptions = {}) {
    this.editor = editor;
    this.genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.options = {
      tinyConfig: {
        ...options.tinyConfig,
      },
    };

    this.createModalContainer();
  }

  public static getInstance(
    editor: GrapesEditor,
    options?: RawEditorOptions,
  ): TinyMCECustomRTESingleton {
    if (!TinyMCECustomRTESingleton.instance) {
      TinyMCECustomRTESingleton.instance = new TinyMCECustomRTESingleton(
        editor,
        options,
      );
    }
    return TinyMCECustomRTESingleton.instance;
  }

  private createModalContainer(): void {
    this.modalContainer = document.createElement("div");
    this.modalContainer.innerHTML = `
      <div id="tinymce-content" style="color: black;"></div>
      <div class="tinymce-modal-buttons">
        <button class="gjs-btn-ai text-sm" id="tinymce-ai">Générer avec IA</button>
        <button class="gjs-btn-cancel text-sm" id="tinymce-cancel">Annuler</button>
        <button class="gjs-btn-prim text-sm" id="tinymce-save">Enregistrer</button>
      </div>
    `;
    document.body.appendChild(this.modalContainer);
  }

  public enable(el: HTMLElementWithTinyMCE): HTMLElement {
    this.currentElement = el;
    el.__originalContent = el.innerHTML;

    const contentContainer =
      this.modalContainer?.querySelector("#tinymce-content");

    if (contentContainer) {
      contentContainer.innerHTML = el.innerHTML;
    }

    this.openEditorModal();
    this.initTiny(el, contentContainer as HTMLElement);
    this.setupModalButtons();
    this.setupAIButton();

    return el;
  }

  private openEditorModal(): void {
    this.editor.Modal.open({
      title: "Éditer le contenu",
      content: this.modalContainer,
      attributes: {
        class: "tinymce-modal",
      },
    });
  }

  private initTiny(
    el: HTMLElementWithTinyMCE,
    contentContainer: HTMLElement,
  ): void {
    if (tinymce.activeEditor) {
      tinymce.activeEditor.remove();
    }

    const tinyConfig = {
      ...this.options.tinyConfig,
      target: contentContainer,
      setup: (editor: TinyEditor) => {
        editor.on("init", () => {
          editor.setContent(el.innerHTML);
          editor.focus();
        });

        editor.on("change", () => {
          if (contentContainer) {
            const content = editor.getContent();
            el.innerHTML = content;
            contentContainer.innerHTML = content;
          }
        });
      },
    };

    tinymce.init(tinyConfig);
  }

  private setupAIButton(): void {
    const aiButton = this.modalContainer?.querySelector("#tinymce-ai");

    aiButton?.addEventListener("click", async () => {
      const description = prompt("Que voulez-vous générer ? (ex: 'liste de 5 compétences en développement', 'tableau comparatif', 'paragraphe sur...', 'titre et sous-titre')");

      if (description) {
        try {
          const model = this.genAI.getGenerativeModel({ model: AI_CONFIG.model });
          const prompt = `
          Génère le contenu suivant : ${description}
          
          Règles :
          - Structure HTML propre et sémantique
          - Utiliser les balises appropriées (<ul>, <ol>, <table>, <h1>, etc.)
          - Contenu professionnel et précis
          - Maximum 300 mots
          - Répondre UNIQUEMENT avec du HTML et css valide
        `;

          const result = await model.generateContent(prompt);
          const generatedHTML = result.response.text();

          if (tinymce.activeEditor) {
            tinymce.activeEditor.setContent(generatedHTML);
          }

          const contentContainer = this.modalContainer?.querySelector("#tinymce-content");
          if (contentContainer) {
            contentContainer.innerHTML = generatedHTML;
          }
        } catch (error) {
          console.error("Erreur de génération IA :", error);
          alert("Une erreur est survenue lors de la génération du contenu.");
        }
      }
    });
  }
  private saveChanges(): void {
    if (this.currentElement && tinymce.activeEditor) {
      const content = tinymce.activeEditor.getContent();
      this.currentElement.innerHTML = content;
      this.editor.Modal.close();
      tinymce.activeEditor.remove();
    }
  }

  private cancelChanges(): void {
    if (this.currentElement) {
      this.currentElement.innerHTML =
        this.currentElement.__originalContent || "";
      this.editor.Modal.close();
      if (tinymce.activeEditor) {
        tinymce.activeEditor.remove();
      }
    }
  }

  private setupModalButtons(): void {
    const saveButton = this.modalContainer?.querySelector("#tinymce-save");
    const cancelButton = this.modalContainer?.querySelector("#tinymce-cancel");

    saveButton?.addEventListener("click", () => this.saveChanges());
    cancelButton?.addEventListener("click", () => this.cancelChanges());
  }

  public disable(): void { }

  public getContent(): string {
    return this.currentElement?.innerHTML || "";
  }
}

const tinyPlugin = (editor: GrapesEditor, opts: RawEditorOptions = {}) => {
  if (!tinymce) {
    console.error("TinyMCE n'est pas disponible.");
    return;
  }

  const customRTE = TinyMCECustomRTESingleton.getInstance(editor, opts);

  editor.setCustomRte({
    enable: (el: HTMLElementWithTinyMCE) => customRTE.enable(el),
    disable: () => customRTE.disable(),
    getContent: () => customRTE.getContent(),
  });
};

export default tinyPlugin;