import { Plugin } from "grapesjs";
import { PluginOptions } from "./types";
import { loadBlocks } from "./blocks";

const basicPlugin: Plugin<PluginOptions> = (editor, opts = {}) => {
   const config: Required<PluginOptions> = {
      blocks: [
         'column1',
         'column2',
         'column3',
         'column3-7',
         'text',
         'link',
         'image',
         'video',
         'map'
      ],
      flexGrid: false,
      stylePrefix: 'gjs-',
      addBasicStyle: true,
      category: 'Basic',
      labelColumn1: '1 Column',
      labelColumn2: '2 Columns',
      labelColumn3: '3 Columns',
      labelColumn37: '2 Columns 3/7',
      labelText: 'Text',
      labelLink: 'Link',
      labelImage: 'Image',
      labelVideo: 'Video',
      labelMap: 'Map',
      rowHeight: 75,
      ...opts
   };

   loadBlocks(editor, config);
};

export default basicPlugin;