import { Editor as GrapesEditor } from "grapesjs";
import tinymce, { Editor as TinyEditor, RawEditorOptions } from "tinymce";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Interfaces et types
interface HTMLElementWithTinyMCE extends HTMLElement {
  __originalContent?: string;
}

interface AIConfig {
  model: string;
  apiKey: string;
}

interface TinyMCEModalElements {
  container: HTMLDivElement;
  contentContainer: HTMLElement;
  aiButton: HTMLButtonElement;
  saveButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  aiStatus: HTMLElement;
}

interface AIPromptElements {
  overlay: HTMLDivElement;
  input: HTMLInputElement;
  generateButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
}

// Configuration de l'IA
const AI_CONFIG: AIConfig = {
  model: "gemini-2.0-flash-001",
  apiKey: "AIzaSyBq0Fncy7OF3ktGBMhPla-tkk-XkOX_kcE",
};

/**
 * Gestionnaire de l'éditeur TinyMCE personnalisé pour GrapesJS
 * Implémenté en tant que singleton
 */
class TinyMCECustomRTESingleton {
  private static instance: TinyMCECustomRTESingleton;
  private editor: GrapesEditor;
  private options: RawEditorOptions;
  private currentElement: HTMLElementWithTinyMCE | null = null;
  private modalElements: TinyMCEModalElements | null = null;
  private genAI: GoogleGenerativeAI;
  private generativeModel: GenerativeModel | null = null;
  private currentUpdatedContent: string = '';
  private isGeneratingContent: boolean = false;

  private constructor (editor: GrapesEditor, options: RawEditorOptions = {}) {
    this.editor = editor;
    this.genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.generativeModel = this.genAI.getGenerativeModel({ model: AI_CONFIG.model });

    this.options = {
      tinyConfig: {
        ...options.tinyConfig,
        promotion: false
      },
    };

    this.createModalElements();
  }

  /**
   * Obtient l'instance du singleton
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
   * Crée les éléments de l'interface modale
   */
  private createModalElements(): void {
    const container = document.createElement("div");
    container.className = "modern-tinymce-container";
    container.innerHTML = this.getModalHTML();
    document.body.appendChild(container);

    this.modalElements = {
      container,
      contentContainer: container.querySelector("#tinymce-content") as HTMLElement,
      aiButton: container.querySelector("#tinymce-ai") as HTMLButtonElement,
      saveButton: container.querySelector("#tinymce-save") as HTMLButtonElement,
      cancelButton: container.querySelector("#tinymce-cancel") as HTMLButtonElement,
      aiStatus: container.querySelector("#ai-status") as HTMLElement
    };
  }

  /**
   * Active l'éditeur sur un élément
   */
  public enable(el: HTMLElementWithTinyMCE): HTMLElement {
    this.currentElement = el;
    el.__originalContent = el.innerHTML;

    if (this.modalElements) {
      this.modalElements.contentContainer.innerHTML = el.innerHTML;
      this.openEditorModal();
      this.initTinyMCE(el);
      this.setupEventListeners();
    }

    return el;
  }

  /**
   * Initialise l'éditeur TinyMCE
   */
  private initTinyMCE(el: HTMLElementWithTinyMCE): void {
    if (!this.modalElements) return;

    if (tinymce.activeEditor) {
      tinymce.activeEditor.remove();
    }

    const tinyConfig = {
      ...this.options.tinyConfig,
      target: this.modalElements.contentContainer,
      height: 500,
      menubar: true,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
      setup: (editor: TinyEditor) => {
        editor.on("init", () => {
          editor.setContent(el.innerHTML);
          editor.focus();
        });
        editor.on("change", () => {
          this.currentUpdatedContent = editor.getContent();
        });
      },
    };

    tinymce.init(tinyConfig);
  }

  /**
   * Ouvre la modal d'édition
   */
  private openEditorModal(): void {
    this.editor.Modal.open({
      title: "Éditer le contenu",
      content: this.modalElements?.container,
      attributes: {
        class: "tinymce-modal",
      },
    });
  }

  /**
   * Configure les écouteurs d'événements
   */
  private setupEventListeners(): void {
    if (!this.modalElements) return;

    this.modalElements.saveButton.addEventListener("click", () => this.saveChanges());
    this.modalElements.cancelButton.addEventListener("click", () => this.cancelChanges());
    this.modalElements.aiButton.addEventListener("click", () => this.showAIPrompt());
  }

  /**
   * Affiche la boîte de dialogue pour la génération IA
   */
  private showAIPrompt(): void {
    const overlay = document.createElement('div');
    overlay.className = 'ai-prompt-overlay';
    overlay.innerHTML = this.getAIPromptHTML();
    document.body.appendChild(overlay);

    const promptElements: AIPromptElements = {
      overlay,
      input: overlay.querySelector('.ai-prompt-input') as HTMLInputElement,
      generateButton: overlay.querySelector('.ai-prompt-generate') as HTMLButtonElement,
      cancelButton: overlay.querySelector('.ai-prompt-cancel') as HTMLButtonElement
    };

    promptElements.input.focus();

    // Configurer les écouteurs d'événements
    promptElements.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.generateContent(promptElements);
      }
    });

    promptElements.cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    promptElements.generateButton.addEventListener('click', () => {
      this.generateContent(promptElements);
    });
  }

  /**
   * Génère du contenu à l'aide de l'IA
   */
  private async generateContent(promptElements: AIPromptElements): Promise<void> {
    const description = promptElements.input.value.trim();

    if (!description || this.isGeneratingContent) return;
    this.isGeneratingContent = true;

    // Mettre à jour l'interface pour montrer que la génération est en cours
    const originalText = promptElements.generateButton.textContent || 'Générer';
    promptElements.generateButton.innerHTML = '<span class="ai-loading"></span> Génération...';
    promptElements.generateButton.disabled = true;

    if (this.modalElements?.aiStatus) {
      this.modalElements.aiStatus.innerHTML = '<span class="ai-loading"></span> Génération en cours...';
    }

    try {
      if (!this.generativeModel) {
        this.generativeModel = this.genAI.getGenerativeModel({ model: AI_CONFIG.model });
      }

      const prompt = this.createAIPrompt(description);
      const result = await this.generativeModel.generateContent(prompt);
      const generatedHTML = result.response.text();

      if (tinymce.activeEditor) {
        tinymce.activeEditor.setContent(generatedHTML);
        this.currentUpdatedContent = generatedHTML;
      }

      if (this.modalElements?.aiStatus) {
        this.modalElements.aiStatus.textContent = `✓ Contenu généré : "${this.truncateString(description, 30)}"`;
      }

      // Fermer l'overlay
      document.body.removeChild(promptElements.overlay);

    } catch (error) {
      console.error("Erreur de génération IA :", error);
      this.handleGenerationError(promptElements, originalText);
    }

    this.isGeneratingContent = false;
  }

  /**
   * Gère les erreurs de génération
   */
  private handleGenerationError(promptElements: AIPromptElements, originalButtonText: string): void {
    if (this.modalElements?.aiStatus) {
      this.modalElements.aiStatus.textContent = "⚠️ Erreur lors de la génération du contenu.";
    }

    // Restaurer le bouton
    promptElements.generateButton.innerHTML = originalButtonText;
    promptElements.generateButton.disabled = false;

    // Afficher une alerte dans l'overlay
    const actionsDiv = promptElements.overlay.querySelector('.ai-prompt-actions');
    if (actionsDiv) {
      const errorMsg = document.createElement('div');
      errorMsg.style.color = '#dc3545';
      errorMsg.style.marginBottom = '10px';
      errorMsg.textContent = "Une erreur est survenue lors de la génération du contenu.";
      actionsDiv.parentNode?.insertBefore(errorMsg, actionsDiv);
    }
  }

  /**
   * Sauvegarde les changements
   */
  private saveChanges(): void {
    if (!this.currentElement || !tinymce.activeEditor) return;

    const content = tinymce.activeEditor.getContent();
    this.currentElement.innerHTML = content;

    const selectedComponent = this.editor.getSelected();
    if (selectedComponent) {
      selectedComponent.set('content', content, { silent: false });
      selectedComponent.trigger('change:content');
    }

    this.cleanup();
    this.editor.Canvas.refresh();
  }

  /**
   * Annule les changements
   */
  private cancelChanges(): void {
    if (this.currentElement) {
      this.currentElement.innerHTML = this.currentElement.__originalContent || "";
      this.cleanup();
    }
  }

  /**
   * Nettoie les ressources après utilisation
   */
  private cleanup(): void {
    this.editor.Modal.close();
    if (tinymce.activeEditor) {
      tinymce.activeEditor.remove();
    }
  }

  /**
   * Désactive l'éditeur
   */
  public disable(): void {
    // Méthode requise par l'interface mais non utilisée
  }

  /**
   * Récupère le contenu actuel
   */
  public getContent(): string {
    return this.currentElement?.innerHTML || "";
  }

  /**
   * Tronque une chaîne à la longueur spécifiée
   */
  private truncateString(str: string, maxLength: number): string {
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
  }

  /**
   * Crée le prompt pour l'IA
   */
  private createAIPrompt(description: string): string {
    return `
      Génère le contenu suivant : ${description}
      
      Règles :
      - Structure HTML propre et sémantique
      - Utiliser les balises appropriées (<ul>, <ol>, <table>, <h1>, etc.)
      - Contenu professionnel et précis
      - Maximum 300 mots
      - Répondre UNIQUEMENT avec du HTML et css valide
    `;
  }

  /**
   * Retourne le HTML pour la modale
   */
  private getModalHTML(): string {
    return `
      <div class="modern-tinymce-wrapper">
        <div id="tinymce-content" class="modern-tinymce-content"></div>
      </div>
      
      <div class="modern-tinymce-actions">
        <button class="modern-tinymce-ai" id="tinymce-ai">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a5 5 0 0 0-5 5v14a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"></path>
            <circle cx="12" cy="9" r="3"></circle>
            <line x1="8" y1="17" x2="16" y2="17"></line>
          </svg>
          <span>Générer avec IA</span>
        </button>
        <div class="modern-tinymce-ai-status" id="ai-status"></div>
        <div class="modern-tinymce-buttons">
          <button class="modern-btn-cancel" id="tinymce-cancel">Annuler</button>
          <button class="modern-btn-save" id="tinymce-save">Enregistrer</button>
        </div>
      </div>
      ${this.getStyles()}
    `;
  }

  /**
   * Retourne le HTML pour le prompt d'IA
   */
  private getAIPromptHTML(): string {
    return `
      <div class="ai-prompt-container">
        <div class="ai-prompt-title">Générer du contenu avec l'IA</div>
        <input type="text" class="ai-prompt-input" placeholder="Ex: 'liste de 5 compétences en développement', 'tableau comparatif'..." />
        <div class="ai-prompt-actions">
          <button class="ai-prompt-cancel">Annuler</button>
          <button class="ai-prompt-generate">Générer</button>
        </div>
      </div>
    `;
  }

  /**
   * Retourne les styles CSS
   */
  private getStyles(): string {
    return `
      <style>
        /* Styles pour l'éditeur TinyMCE */
        .modern-tinymce-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          color: #333;
        }
        
        .modern-tinymce-content {
          min-height: 300px;
          background: #fff;
          color: #333;
        }
        
        .modern-tinymce-ai {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .modern-tinymce-ai:hover {
          background: #0b5ed7;
          transform: translateY(-1px);
        }
        
        .modern-tinymce-ai svg {
          width: 16px;
          height: 16px;
        }
        
        .modern-tinymce-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        
        .modern-tinymce-ai-status {
          color: #6c757d;
          font-size: 14px;
        }
        
        .modern-tinymce-buttons {
          display: flex;
          gap: 10px;
        }
        
        .modern-btn-cancel, .modern-btn-save {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .modern-btn-cancel {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #ced4da;
        }
        
        .modern-btn-cancel:hover {
          background: #e9ecef;
        }
        
        .modern-btn-save {
          background: #0d6efd;
          color: white;
        }
        
        .modern-btn-save:hover {
          background: #0b5ed7;
          transform: translateY(-1px);
        }
        
        /* Style pour la modal TinyMCE */
        .tinymce-modal .gjs-mdl-dialog {
          max-width: 90% !important;
          border-radius: 8px !important;
          height: 80vh !important;
          overflow: hidden !important;
        }
        
        .tinymce-modal .gjs-mdl-header {
          background-color: #fff !important;
          border-bottom: 1px solid #e9ecef !important;
          padding: 16px 20px !important;
        }
        
        .tinymce-modal .gjs-mdl-title {
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .tinymce-modal .gjs-mdl-content {
          padding: 20px !important;
        }
        
        .tinymce-modal .gjs-mdl-btn-close {
          font-size: 20px !important;
        }
        
        /* Styles pour la fenêtre de prompt IA */
        .ai-prompt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .ai-prompt-container {
          background: white;
          border-radius: 8px;
          padding: 24px;
          width: 500px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .ai-prompt-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #212529;
        }
        
        .ai-prompt-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
          margin-bottom: 16px;
        }
        
        .ai-prompt-input:focus {
          border-color: rgba(15, 120, 230, 0.6);;
          outline: none;
          box-shadow: 0 0 0 1px rgba(15, 120, 230, 0.2);
        }
        
        .ai-prompt-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .ai-prompt-cancel, .ai-prompt-generate {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          border: none;
        }
        
        .ai-prompt-cancel {
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #ced4da;
        }
        
        .ai-prompt-generate {
          background: #0d6efd;
          color: white;
        }
        
        .ai-loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: ai-spin 1s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes ai-spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }
}

/**
 * Plugin TinyMCE pour GrapesJS
 */
const tinyPlugin = (editor: GrapesEditor, opts: RawEditorOptions = {}): void => {
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