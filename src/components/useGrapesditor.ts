import type { Editor, EditorConfig, ProjectData } from "grapesjs";

import { useCallback } from "react";
import tinyPlugin from "../tinyPlugin";
import { RawEditorOptions } from "tinymce";

interface UseGrapesJSEditorConfig {
  grapesConfig: EditorConfig;
  tinyConfig: RawEditorOptions;
}

interface UseGrapesditorResult {
  onEditor: (editor: Editor) => void;
  onUpdate: (projectData: ProjectData, editor: Editor) => void;
  onReady: (editor: Editor) => void;
}

// Hook personnalisé pour la gestion de l'éditeur GrapesJS
export const useGrapesditor = (
  config: UseGrapesJSEditorConfig,
): UseGrapesditorResult => {
  // Handler pour l'initialisation de l'éditeur
  const onEditor = useCallback(
    (editor: Editor) => {
      console.log("Editor loaded");
      (window as Window & typeof globalThis & { editor: Editor; }).editor =
        editor;

      // Configuration du type de composant texte
      editor.DomComponents.addType("text", {
        model: {
          defaults: {
            stylable: true,
            style: {
              "font-family": "'Lato', sans-serif",
            },
          },
        },
      });

      // Initialisation du plugin TinyMCE
      tinyPlugin(editor, {
        tinyConfig: config.tinyConfig,
      });
    },
    [config.tinyConfig],
  );

  // Handler pour les mises à jour du projet
  const onUpdate = useCallback((projectData: ProjectData, editor: Editor) => {
    console.log(editor.getHtml());

    console.log({
      name: "onUpdate methode",
      comonents: projectData.pages,
    });
  }, []);

  // Handler pour l'événement "ready" de l'éditeur
  const onReady = useCallback((editor: Editor) => {
    console.log({
      name: "onReady methode",
      editor,
    });
  }, []);

  return { onEditor, onUpdate, onReady };
};
