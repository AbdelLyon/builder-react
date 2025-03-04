import { EditorConfig } from "grapesjs";
import { RawEditorOptions } from "tinymce";

/**
 * Configuration de l'éditeur TinyMCE
 */
export const tinyConfig: RawEditorOptions = {
  // Paramètres d'apparence
  skin: "oxide",
  statusbar: false,
  toolbar_mode: "sliding",

  // Configuration du gestionnaire de fichiers
  file_picker_callback: (callback, value, meta) => {
    handleFilePicker(callback, value, meta);
  },
  // automatic_uploads: true,
  // file_picker_types: "image",
  // paste_data_images: true,
  // image_advtab: true,
  // image_caption: true,

  // resize: true,
  // resize_img_proportional: true, // Garde les proportions lors du redimensionnement
  // image_dimensions: true,
  // autoresize_bottom_margin: 20, // Marge en bas (en pixels)
  // autoresize_min_height: 300, // Hauteur minimale
  // autoresize_max_height: 500, // Hauteur maximale (0 = pas de limite)
  // autoresize_overflow_padding: 0,
  // autoresize_on_init: true,
  // Plugins et fonctionnalités
  plugins: [
    // Formatage de texte
    "advlist",
    "autolink",
    "lists",

    // Média et contenu
    "link",
    "image",
    "charmap",
    "table",
    "media",
    "emoticons", // Ajout du plugin emoticons pour les emojis

    // Outils et visualisation
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "directionality",
    "autoresize",
  ],

  // Barres d'outils
  toolbar: [
    "undo redo selectAll | styles | bold italic underline inlinecode",
    "fontfamily fontsize | forecolor backcolor | emoticons", // Ajout de emoticons à la barre d'outils
    "alignleft aligncenter alignright alignjustify",
    "bullist numlist tasklist outdent indent",
    "textDirPlugins | link image table media code",
  ].join(" | "),

  // Barres d'outils contextuelles
  quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote",
  quickbars_insert_toolbar: "quickimage quicktable",
  contextmenu: "link image table",

  // Options de formatage du texte
  fontsize_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",
  font_family_formats: buildFontFamilyFormats(),

  // Styles du contenu
  content_style: `
    body { 
      font-family: Lato, Arial, sans-serif; 
      height: 500px;
      padding: 10px; 
     overflow-y: scroll;
    }

    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
  `,
};

/**
 * Configuration de l'éditeur GrapesJS
 */
export const grapesConfig: EditorConfig = {
  height: "100vh",
  undoManager: { trackSelection: true },
  selectorManager: { componentFirst: true },
  storageManager: {
    type: "local",
    id: "gjs-",
    autosave: true,
  },
  projectData: {
    assets: [],
    pages: [
      {
        name: "Home page",
        component: `<h1>GrapesJS React Custom UI</h1>`,
      },
    ],
  },
};

// Définir les types conformes à TinyMCE
type FilePickerCallback = (
  value: string,
  meta?: Record<string, string>,
) => void;

/**
 * Gestionnaire de sélection de fichiers pour TinyMCE
 */
function handleFilePicker(
  callback: FilePickerCallback,
  _value: string,
  meta: Record<string, string>,
): void {
  // Créer un élément input file temporaire
  const input = document.createElement("input");
  input.setAttribute("type", "file");

  // Configurer les types de fichiers acceptés selon le contexte
  configureInputAcceptTypes(input, meta.filetype);

  // Déclencher le dialogue de sélection de fichier
  input.click();

  // Gérer la sélection de fichier
  input.onchange = () => {
    if (!input.files || input.files.length === 0) return;
    processSelectedFile(input.files[0], callback, meta.filetype);
  };
}

/**
 * Configure les types de fichiers acceptés pour l'input
 */
function configureInputAcceptTypes(
  input: HTMLInputElement,
  filetype: string,
): void {
  switch (filetype) {
    case "image":
      input.setAttribute("accept", "image/*");
      break;
    case "media":
      input.setAttribute("accept", "video/*,audio/*");
      break;
    // Pour les autres types de fichiers, pas de restriction
  }
}

/**
 * Traite le fichier sélectionné et appelle le callback avec le résultat
 */
function processSelectedFile(
  file: File,
  callback: FilePickerCallback,
  filetype: string,
): void {
  const reader = new FileReader();

  reader.onload = () => {
    const result = reader.result as string;

    switch (filetype) {
      case "image":
        callback(result, {
          alt: file.name,
          title: file.name,
        });
        break;
      case "media":
        callback(result, {
          source2: "",
          poster: "",
        });
        break;
      default:
        callback(result, {
          text: file.name,
        });
    }
  };

  // Lire le fichier comme une URL data
  reader.readAsDataURL(file);
}

/**
 * Construit la chaîne de format des polices
 */
function buildFontFamilyFormats(): string {
  const fonts = [
    "Lato=lato,sans-serif",
    "Andale Mono=andale mono,monospace",
    "Arial=arial,helvetica,sans-serif",
    "Arial Black=arial black,sans-serif",
    "Book Antiqua=book antiqua,palatino,serif",
    "Comic Sans MS=comic sans ms,sans-serif",
    "Courier New=courier new,courier,monospace",
    "Georgia=georgia,palatino,serif",
    "Helvetica=helvetica,arial,sans-serif",
    "Impact=impact,sans-serif",
    "Roboto=roboto,sans-serif",
    "Symbol=symbol",
    "Tahoma=tahoma,arial,helvetica,sans-serif",
    "Terminal=terminal,monaco,monospace",
    "Times New Roman=times new roman,times,serif",
    "Trebuchet MS=trebuchet ms,geneva,sans-serif",
    "Verdana=verdana,geneva,sans-serif",
  ];

  return fonts.join(";");
}
