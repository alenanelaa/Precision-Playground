import {defs, tiny} from './examples/common.js';

//import into scope for convenience
const { vec3, vec4, Vector, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene } = tiny;
const { Triangle, Square, Tetrahedron, Torus, Windmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong, Textured_Phong_text, Phong_Shader } = defs;

export class PrecisionPlayground extends Scene {
    constructor() {
        super();

        this.shapes = {

        };

        this.materials ={

        };

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel(){

    }

    //TODO: helper functions

    display(context, program_state) {

    }
}