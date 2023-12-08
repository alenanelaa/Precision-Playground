import {defs, tiny} from './examples/common.js';
import {PrecisionPlayground} from "./PrecisionPlayground.js";
// Pull these names into this module's scope for convenience:
const {
    Canvas_Widget
} = tiny;

Object.assign(defs,
    {PrecisionPlayground}
);

// ******************** End extra step

const Main_Scene = PrecisionPlayground;
const Additional_Scenes = [];

export {Main_Scene, Additional_Scenes, Canvas_Widget, defs}