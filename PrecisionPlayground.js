import FPSCam from './camera-view.js';
import { defs, tiny } from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Cube, Square, Subdivision_Sphere, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader } = defs;

export class PrecisionPlayground extends Scene {
    constructor() {
        super();

        this.shapes = {
            floor: new Cube(),
            target: new defs.Subdivision_Sphere(4),
            crosshair: new Square(),
            skybox: new Cube(),
        };

        this.materials = {
            test: new Material(new Phong_Shader(), {
                color: hex_color("#ffffff"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5
            }),
            blue_sphere: new Material(new Phong_Shader(), {
                color: hex_color("#0000ff"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5
            }),
            crosshair: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/crosshair.png")
            }),
            skybox_material: new Material(new Phong_Shader(), { 
                color: hex_color("#87CEEB"), // Sky blue color
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                // texture: new Texture("assets/cracks.jpg"), //placeholder, change in the future
            }),
        };
        
        //New Variables (Unused)
        this.curScore = 0;
        this.paused = false; //for pause and play (may wanna change it to be game states)

        this.controls = {
            sens: 1
        }
        //Spawn 10 Spheres in random locations
        this.sphere_positions = [];
        for (let i = 0; i < 10; i++) {
            let new_position;

            do {
                new_position = vec3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 9+2,
                    (Math.random() - 0.5) * 0.01
                );

                // Check the distance from the new position to all previously generated positions
                var valid_position = true;
                for (let j = 0; j < i; j++) {
                    let distanceSquared = Math.pow(new_position[0] - this.sphere_positions[j][0], 2) +
                                        Math.pow(new_position[1] - this.sphere_positions[j][1], 2) +
                                        Math.pow(new_position[2] - this.sphere_positions[j][2], 2);
                    let distance = Math.sqrt(distanceSquared);

                    if (distance < 2) { //Change this to make spheres farther apart (higher number causes more lag)
                        valid_position = false;
                        break;
                    }
                }
            } while (!valid_position);

            this.sphere_positions.push(new_position);
        }




        this.camera = new FPSCam(0, 0, 20);
    }

    shoot(pos, program_state) {
        pos = [0,0];

        let pos_ndc_near = vec4(pos[0], pos[1], -1.0, 1.0);
        let pos_ndc_far = vec4(pos[0], pos[1], 1.0, 1.0);
        let center_ndc_near = vec4(0.0, 0.0, -1.0, 1.0);
        let P = program_state.projection_transform;
        let V = program_state.camera_inverse;
        let pos_world_near = Mat4.inverse(P.times(V)).times(pos_ndc_near);
        let pos_world_far = Mat4.inverse(P.times(V)).times(pos_ndc_far);
        let center_world_near = Mat4.inverse(P.times(V)).times(center_ndc_near);
        pos_world_near.scale_by(1/pos_world_near[3]);
        pos_world_far.scale_by(1/pos_world_far[3]);
        center_world_near.scale_by(1/center_world_near[3]);
    }

    display(context, program_state) {
        let lookAt = this.camera.lookAt;
        let canvas = context.canvas;
        program_state.set_camera(lookAt);

        if (!context.scratchpad.controls) {
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
                vec(
                    (e.clientX - (rect.left + rect.right)/2) /
                        ((rect.right - rect.left)/2),
                    (e.clientY - (rect.bottom + rect.top)/2) /
                        ((rect.top - rect.bottom)/2)
                );

            //PointerLock API
            canvas.addEventListener("mousedown", async (e) => {
                e.preventDefault();
                if (!document.pointerLockElement && !this.paused) {
                    await canvas.requestPointerLock();
                }
                canvas.addEventListener("mousemove", (e) => {
                    let del_x = e.movementX;
                    let del_y = e.movementY;

                    if (!this.paused) {
                        this.camera.update_cam(del_x, del_y, this.controls.sens);
                    }            

                });
                this.shoot(mouse_position(e), program_state);
            }, {once: true});
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        let floor_transform = model_transform.times(Mat4.translation(0, -5, 0)).times(Mat4.scale(20, 0.1, 20));
        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.test);

        this.camera.interface(context, program_state, this.shapes, this.materials); //drawing crosshair and eventually score

        // Inserting Andrew's code
        let background_transform = model_transform.times(Mat4.scale(50, 50, 50));
        this.shapes.skybox.draw(context, program_state, background_transform, this.materials.skybox_material);

        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.test);

        // Inserting Andrew's code p.2
        let scale_factor = 1;
        if (!this.randomize_sizing) {
            scale_factor = 0.1 + Math.random() * 3; // Random scale between 0.5 and 1.5
        }
        // Update the scale factor for all spheres (assuming it's the same for all spheres)
        let sphere_scale = vec3(scale_factor, scale_factor, scale_factor);
        // Uncomment the line below if you want to use the same scale for all spheres
        // this.sphere_scale = sphere_scale;
        
        
        // Draw all ten spheres
        for (let i = 0; i < 10; i++) {
            let target_transform = model_transform.times(Mat4.translation(...this.sphere_positions[i], 1));
            this.shapes.target.draw(context, program_state, target_transform, this.materials.blue_sphere);
        }
    }
}
