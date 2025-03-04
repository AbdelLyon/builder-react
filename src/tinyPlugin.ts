import { Editor as GrapesEditor } from "grapesjs";
import tinymce, { Editor as TinyEditor, RawEditorOptions } from "tinymce";

// Types et interfaces

interface HTMLElementWithTinyMCE extends HTMLElement {
  __originalContent?: string;
}

/**
 * Classe singleton pour gérer TinyMCE comme RTE personnalisé dans GrapesJS
 */
class TinyMCECustomRTESingleton {
  private static instance: TinyMCECustomRTESingleton;
  private editor: GrapesEditor;
  private options: RawEditorOptions;
  private currentElement: HTMLElementWithTinyMCE | null = null;
  private modalContainer: HTMLDivElement | null = null;

  /**
   * Constructeur privé pour le pattern singleton
   */
  private constructor(editor: GrapesEditor, options: RawEditorOptions = {}) {
    this.editor = editor;
    this.options = {
      tinyConfig: {
        ...options.tinyConfig,
      },
    };

    this.createModalContainer();
  }

  /**
   * Obtient ou crée l'instance unique de TinyMCECustomRTESingleton
   */
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

  /**
   * Crée le conteneur modal pour l'éditeur TinyMCE
   */
  private createModalContainer(): void {
    this.modalContainer = document.createElement("div");
    this.modalContainer.innerHTML = `
        <div id="tinymce-content" style="color: black; "></div>
        <div class="tinymce-modal-buttons">
        <button class="gjs-btn-cancel text-sm" id="tinymce-cancel">Annuler</button>
          <button class="gjs-btn-prim text-sm" id="tinymce-save">Enregistrer</button>
        </div>
    `;
    document.body.appendChild(this.modalContainer);
  }

  /**
   * Active l'éditeur TinyMCE sur l'élément spécifié
   */
  public enable(el: HTMLElementWithTinyMCE): HTMLElement {
    this.currentElement = el;

    // Stocker le contenu courant comme contenu original
    el.__originalContent = el.innerHTML;

    const contentContainer =
      this.modalContainer?.querySelector("#tinymce-content");

    if (contentContainer) {
      // Toujours utiliser le contenu le plus récent de l'élément
      contentContainer.innerHTML = el.innerHTML;
    }

    this.openEditorModal();
    this.initTiny(el, contentContainer as HTMLElement);
    this.setupModalButtons();

    return el;
  }

  /**
   * Ouvre la modal d'édition
   */
  private openEditorModal(): void {
    this.editor.Modal.open({
      title: "Éditer le contenu",
      content: this.modalContainer,
      attributes: {
        class: "tinymce-modal",
      },
    });
  }

  /**
   * Initialise l'éditeur TinyMCE
   */

  private initTiny(
    el: HTMLElementWithTinyMCE,
    contentContainer: HTMLElement,
  ): void {
    // Nettoyer l'instance précédente si elle existe
    if (tinymce.activeEditor) {
      tinymce.activeEditor.remove();
    }

    // Configuration de TinyMCE
    const tinyConfig = {
      ...this.options.tinyConfig,
      target: contentContainer,
      setup: (editor: TinyEditor) => {
        editor.on("init", () => {
          // Utiliser le contenu actuel de l'élément
          editor.setContent(el.innerHTML);
          editor.focus();
        });

        // Un seul événement change ici - supprimez celui dans setupModalButtons
        editor.on("change", () => {
          if (contentContainer) {
            const content = editor.getContent();
            // Mettre à jour à la fois l'élément et le conteneur
            el.innerHTML = content;
            contentContainer.innerHTML = content;
          }
        });
      },
    };

    tinymce.init(tinyConfig);
  }

  /**
   * Enregistre les modifications et ferme l'éditeur
   */
  private saveChanges(): void {
    if (this.currentElement && tinymce.activeEditor) {
      const content = tinymce.activeEditor.getContent();

      this.currentElement.innerHTML = content;

      this.editor.Modal.close();

      tinymce.activeEditor.remove();
    }
  }

  /**
   * Annule les modifications et ferme l'éditeur
   */
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

  /**
   * Configure les boutons de la modal et leurs événements
   */

  private setupModalButtons(): void {
    const saveButton = this.modalContainer?.querySelector("#tinymce-save");
    const cancelButton = this.modalContainer?.querySelector("#tinymce-cancel");

    if (saveButton) {
      // Supprimez tous les écouteurs existants pour éviter les doublons
      const newSaveButton = saveButton.cloneNode(true);
      saveButton.parentNode?.replaceChild(newSaveButton, saveButton);
      newSaveButton.addEventListener("click", () => this.saveChanges());
    }

    if (cancelButton) {
      // Supprimez tous les écouteurs existants pour éviter les doublons
      const newCancelButton = cancelButton.cloneNode(true);
      cancelButton.parentNode?.replaceChild(newCancelButton, cancelButton);
      newCancelButton.addEventListener("click", () => this.cancelChanges());
    }
  }
  /**
   * Désactive l'éditeur
   */
  public disable(): void {
    // Méthode intentionnellement vide
  }

  /**
   * Récupère le contenu actuel de l'élément
   */
  public getContent(): string {
    return this.currentElement?.innerHTML || "";
  }
}

/**
 * Plugin TinyMCE pour GrapesJS
 */
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
