import { defs, tiny } from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Cube, Axis_Arrows, Textured_Phong, Phong_Shader } = defs;

export class PrecisionPlayground extends Scene {
    constructor() {
        super();

        this.shapes = {
            floor: new Cube(),
            target: new defs.Subdivision_Sphere(4)
        };

        this.materials = {
            test: new Material(new Phong_Shader(), {
                color: hex_color("#ffffff"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5
            }),
            blue_sphere: new Material(new Phong_Shader(), {
                color: hex_color("#0000ff"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5
            })
        };

        this.flags = {
            paused: false
        };

        this.sphere_positions = [];
        for (let i = 0; i < 6; i++) {
            this.sphere_positions.push(vec3(0, 0, 0));
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, -22.36), vec3(0, 0, 0), vec3(0, 1, 0));


        // Initialize controls in the constructor
        this.make_control_panel();
        this.children.push(this.mouse_controls = new defs.Movement_Controls());
    }

    //all this code doesn't even do anything because the object doesn't have a canvas element what even is the fucking point where did this come from
    make_control_panel() {
        this.mouse = { "from_center": vec(0, 0) };
        
        // Assuming this.canvas is your canvas element
        if (this.canvas) {
            this.mouse_controls = new defs.Movement_Controls();
            this.add_pointer_lock();
            this.mouse_controls.add_canvas_listener(this.canvas, (e) => this.locked_mouse_handler(e));
        } else {
            console.error("Canvas element not found. Make sure you have a canvas element in your HTML.");
        }
    }

    mouse_handler(event) {
        this.mouse.from_center = vec(event.movementX, event.movementY);

        const sensitivity = 0.01;
        
        // Rotate the camera based on mouse movements
        const rotation = Mat4.rotation(sensitivity * this.mouse.from_center[0], vec3(0, 1, 0))
            .times(Mat4.rotation(sensitivity * this.mouse.from_center[1], vec3(1, 0, 0)));

        // Update the camera's transformation
        program_state.camera_transform = rotation.times(program_state.camera_transform);
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        let floor_transform = model_transform.times(Mat4.translation(0, -5, 0)).times(Mat4.scale(20, 0.1, 20));



        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.test);

        // Check if two seconds have passed
        if (t % 1 < dt) {
            // Update the sphere's position only every two seconds
            let dx = (Math.random() - 0.5) * 10;
            let dy = (Math.random() - 0.5) * 10;
            let dz = (Math.random() - 0.5) * 10;
            this.sphere_positions[0] = vec3(dx, dy, dz);
        }

        let target_transform = model_transform.times(Mat4.translation(...this.sphere_positions[0], 1));


        // console.log("Sphere Position:", this.sphere_positions[0]);
        // console.log("Target Transform:", target_transform);
        this.shapes.target.draw(context, program_state, target_transform, this.materials.blue_sphere);
    }
}
