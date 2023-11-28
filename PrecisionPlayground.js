import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader} = defs;

export class PrecisionPlayground extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
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
                color: hex_color("#0000ff"),  // Bright blue color
                ambient: 1, diffusivity: 0.5, specularity: 0.5
            })
        };

        this.flags = {
            paused: false
        }
		
		this.sphere_positions = [];
		for (let i = 0; i < 6; i++) {
			this.sphere_positions.push(vec3(0, 0, 0)); // Initialize positions at the origin
		}

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        
    }

    // TODO: add helper functions as needed

display(context, program_state) {
    if (!context.scratchpad.controls) {
        this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
        // Define the global camera and projection matrices, which are stored in program_state.
        program_state.set_camera(Mat4.translation(0, 0, -10));
    }

    program_state.projection_transform = Mat4.perspective(
        Math.PI / 4, context.width / context.height, 1, 100);

    const light_position = vec4(10, 10, 10, 1);
    program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

    let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
    let model_transform = Mat4.identity();

    let floor_transform = model_transform.times(Mat4.scale(5, 0.1, 5))
                            .times(Mat4.translation(0, -10, 0));

    this.shapes.floor.draw(context, program_state, floor_transform, this.materials.test);

    // Set the initial position of the sphere in front of the camera
    if (!this.sphere_positions[0]) {
        this.sphere_positions[0] = vec3(0, 0, -5);
    }

    // Calculate random movement for the single sphere in x, y, and z directions
	// TODO: This is currently unbounded, so the ball could be literally anywhere
    let dx = (Math.random() - 0.5) * 10 * dt; // Random movement in x direction
    let dy = (Math.random() - 0.5) * 10 * dt; // Random movement in y direction
    let dz = (Math.random() - 0.5) * 10 * dt; // Random movement in z direction

    // Update the position of the sphere
    this.sphere_positions[0] = this.sphere_positions[0].plus(vec3(dx, dy, dz));

    // Check if 2 seconds have passed since the last position update
    if (t % 2 < dt) {
        // Change to another random position
        this.sphere_positions[0] = vec3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    }

    let target_transform = model_transform.times(Mat4.translation(...this.sphere_positions[0], 1));

    console.log("Sphere Position:", this.sphere_positions[0]);
    console.log("Target Transform:", target_transform);
    this.shapes.target.draw(context, program_state, target_transform, this.materials.blue_sphere);
}




}
