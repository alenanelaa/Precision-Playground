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
            target: new Subdivision_Sphere(4),
            crosshair: new Square()
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
            })
        };

        this.paused = false; //for pause and play (may wanna change it to be game states)

        this.controls = {
            sens: 1
        }
        this.sphere_positions = [];
        for (let i = 0; i < 6; i++) {
            this.sphere_positions.push(vec3(0, 0, 0));
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
