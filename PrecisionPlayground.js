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
            wall: new Cube(),
        };

        this.materials = {
            test: new Material(new Phong_Shader(), {
                color: hex_color("#ffffff"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5
            }),
            test_2: new Material(new Phong_Shader(), {
               color: hex_color("#808080"),
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
            skybox_material: new Material(new Textured_Phong(), {
                color: hex_color("#000000"), // Sky blue color
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/sky.png")
            }),
        };
        
        //New Variables (Unused)

        this.gameStart = false;
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
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
                    (Math.random() - 0.5) * 9+1,
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

        this.animation_queue = []


        this.camera = new FPSCam(0, 0, 20);
    }

    resetGame() {
        // Reset game-related variables
        this.gameStart = false;
        this.gameOver = false;
        this.timer = 0;
        this.paused = false;

        // Reset sphere positions
        this.sphere_positions = [];
        for (let i = 0; i < 10; i++) {
            let new_position;
            do {
                new_position = vec3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 9 + 1,
                    (Math.random() - 0.5) * 0.01
                );

                // Check the distance from the new position to all previously generated positions
                var valid_position = true;
                for (let j = 0; j < i; j++) {
                    let distanceSquared =
                        Math.pow(new_position[0] - this.sphere_positions[j][0], 2) +
                        Math.pow(new_position[1] - this.sphere_positions[j][1], 2) +
                        Math.pow(new_position[2] - this.sphere_positions[j][2], 2);
                    let distance = Math.sqrt(distanceSquared);

                    if (distance < 2) {
                        valid_position = false;
                        break;
                    }
                }
            } while (!valid_position);

            this.sphere_positions.push(new_position);
        }

        // Clear animation queue
        this.animation_queue = [];


    }

    shoot(pos, program_state) {
        //pos = [0,0];
        //console.log("Reached")
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

        let animation_bullet = {
            from: center_world_near,
            to: pos_world_far,
            start_time: program_state.animation_time,
            end_time: program_state.animation_time + 1000,
          };
        
        
        this.animation_queue.push(animation_bullet);
        //console.log(this.animation_queue);
    }

    startTimer() {
        this.timer = 0;
        this.timerInterval = window.setInterval(() => {
            this.timer++;
        }, 1000); // Increment timer every second (1000 milliseconds)
    }

    stopTimer() {
        if (this.timerInterval) {
            window.clearInterval(this.timerInterval);
            console.log("Game Over - Timer:", this.timer, "seconds");
        }
    }

    display(context, program_state) {
        let lookAt = this.camera.lookAt;
        let canvas = context.canvas;
        program_state.set_camera(lookAt);

        if (!context.scratchpad.controls) {
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
            vec(
              (e.clientX - (rect.left + rect.right) / 2) /
                ((rect.right - rect.left) / 2),
              (e.clientY - (rect.bottom + rect.top) / 2) /
                ((rect.top - rect.bottom) / 2)
            );
  
            
            //PointerLock API
            canvas.addEventListener("mousedown", async (e) => {
                e.preventDefault();
                if (!document.pointerLockElement && !this.paused) {
                    await canvas.requestPointerLock();
                    const initial_mouse_position = mouse_position(e);
                    this.camera.update_cam(0, 0, this.controls.sens, initial_mouse_position);
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

        let floor_transform = model_transform.times(Mat4.translation(0, -5, 0)).times(Mat4.scale(40, 0.1, 30));
        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.test);

        let wall_transform1 = model_transform.times(Mat4.translation(0, -2, -30)).times(Mat4.scale(40, 3, 0.1));
        this.shapes.wall.draw(context, program_state, wall_transform1, this.materials.test_2);

        let wall_transform2 = model_transform.times(Mat4.translation(-40, 0, -10)).times(Mat4.scale(0.1, 15, 35));
        this.shapes.wall.draw(context, program_state, wall_transform2, this.materials.test_2);

        let wall_transform3 = model_transform.times(Mat4.translation(40, 0, -10)).times(Mat4.scale(0.1, 15, 35));
        this.shapes.wall.draw(context, program_state, wall_transform3, this.materials.test_2);

        let ceiling_transform = model_transform.times(Mat4.translation(0, 15, -30)).times(Mat4.scale(40, 0.1, 15))
        this.shapes.wall.draw(context, program_state, ceiling_transform, this.materials.test_2);

        this.camera.interface(context, program_state, this.shapes, this.materials); //drawing crosshair and eventually score

        // Inserting Andrew's code
        let background_transform = model_transform.times(Mat4.scale(50, 50, 50));
        this.shapes.skybox.draw(context, program_state, background_transform, this.materials.skybox_material);

        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.test);
        
        // Draw all ten spheres
        for (let i = 0; i < 10; i++) {
            if (this.sphere_positions[i]) { // Check if this.sphere_positions[i] is defined
                let target_transform = model_transform.times(Mat4.translation(...this.sphere_positions[i], 1));
                this.shapes.target.draw(context, program_state, target_transform, this.materials.blue_sphere);
            }
        }

        t = program_state.animation_time;
        if (this.animation_queue.length > 0) {
            for (let i = 0; i < this.animation_queue.length; i++) {
                let animation_bullet = this.animation_queue[i];
                let from = animation_bullet.from;
                let to = animation_bullet.to;
                let start_time = animation_bullet.start_time;
                let end_time = animation_bullet.end_time;
                if (t <= end_time && t >= start_time) {
                    //console.log("reached")
                    let animation_process = (t - start_time) / (end_time - start_time);
                    let position = to.times(animation_process).plus(from.times(1 - animation_process));
            
                    for (let j = 0; j < this.sphere_positions.length; j++) {
                        let sphere_position = this.sphere_positions[j];
            
                        // Calculate distance of cube to ray
                        let distanceX = Math.abs(sphere_position[0] - position[0]);
                        let distanceY = Math.abs(sphere_position[1] - position[1]);
                        let distanceZ = Math.abs(sphere_position[2] - position[2]);
            
                        // Print or use the distances as needed
                        // console.log(`DistanceX to sphere ${i + 1}: ${distanceX}`);
                        // console.log(`DistanceY to sphere ${i + 1}: ${distanceY}`);
                        // console.log(`DistanceZ to sphere ${i + 1}: ${distanceZ}`);
            
                        // Check if the position is within a certain distance (e.g., 2 units) from the sphere
                        const distanceThreshold = 1;
                        if (Math.sqrt(distanceX ** 2 + distanceY ** 2 + distanceZ ** 2) < distanceThreshold) {
                            this.sphere_positions.splice(j, 1);
                            console.log(`Target ${j + 1} Hit`);
                            this.animation_queue.length = 0;
                        }
                    }
            }
            }
        }
        for (let i = 0; i < 10; i++) { //After checking for hits, print the new list
            if (this.sphere_positions[i]) { // Check if this.sphere_positions[i] is defined
                let target_transform = model_transform.times(Mat4.translation(...this.sphere_positions[i], 1));
                this.shapes.target.draw(context, program_state, target_transform, this.materials.blue_sphere);
            }
        }
        if (this.sphere_positions.length === 9 && !this.gameStart) {
            this.gameStart = true;
            this.startTimer();
        }

        if (this.sphere_positions.length === 0 && !this.gameOver) {
            this.gameOver = true;
            this.stopTimer();
            this.resetGame();
        }
        while (this.animation_queue.length > 0) {
            if (t > this.animation_queue[0].end_time) {
              this.animation_queue.length = 0;
            } else {
              break;
            }
          }

    }
    }

