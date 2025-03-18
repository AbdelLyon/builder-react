import "./tinySetup";
import { useGrapesditor } from "./components/useGrapesditor";
import { grapesConfig, tinyConfig } from "./components/config";
import { MAIN_BORDER_COLOR } from "./components/common";
import { RightSidebar } from "./components/RightSidebar";
import GjsEditor, { Canvas } from "@grapesjs/react";
import Topbar from "./components/Topbar";
import contactBlockPlugin from "./contactBlockPlugin";
import galleryBlockPlugin from "./galleryBlockPlugin";
import carouselBlockPlugin from "./carouselPlugin";
import basicPlugin from "./basicPlugin";
import spacerPlugin from "./spacerPlugin";
import buttonPlugin from "./buttonPlugin";
import imagePlugin from "./imagePlugin";
import mapPlugin from "./mapPlugin";

const LoadingComponent = (): JSX.Element => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-primary-color border-gray-200 rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-xl">Chargement de l'éditeur...</p>
    </div>
  </div>
);

export default function App(): JSX.Element {
  const { onEditor, onUpdate, onReady } = useGrapesditor({
    grapesConfig,
    tinyConfig,
  });

  return (
    <GjsEditor
      grapesjs="https://unpkg.com/grapesjs"
      grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
      options={grapesConfig}
      plugins={[
        // contactBlockPlugin,
        // galleryBlockPlugin,
        // carouselBlockPlugin,
        // spacerPlugin,
        buttonPlugin,
        // pluginTailwind,
        imagePlugin,
        mapPlugin,
      ]}
      onEditor={onEditor}
      onReady={onReady}
      onUpdate={onUpdate}
      waitReady={<LoadingComponent />}
    >
      <Topbar onSave={() => {}} />
      <div className={`flex h-full border-t ${MAIN_BORDER_COLOR}`}>
        <RightSidebar
          className={`gjs-column-l w-[300px] border-r ${MAIN_BORDER_COLOR}`}
        />
        <div className="gjs-column-m flex flex-col flex-grow">
          <Canvas className="flex-grow gjs-custom-editor-canvas" />
        </div>
      </div>
    </GjsEditor>
  );
}
