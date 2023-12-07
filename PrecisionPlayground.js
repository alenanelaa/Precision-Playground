import FPSCam from './camera-view.js';
import { defs, tiny } from './examples/common.js';
import { Text_Line } from "./examples/text-demo.js";
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
            wall1: new Cube(),
            wall2: new Cube(), // Shorter wall
            ceiling: new Cube(),
            tire: new defs.Torus(15, 15),
            crate: new Cube(),
            text: new Text_Line(35)
        };

        // Multiply tile on floor
        this.shapes.floor.arrays.texture_coord = this.shapes.floor.arrays.texture_coord.map(x => x.times(12));

        // Wall texture
        this.shapes.wall1.arrays.texture_coord = this.shapes.wall1.arrays.texture_coord.map(x => x.times(12));
        this.shapes.wall2.arrays.texture_coord = this.shapes.wall2.arrays.texture_coord.map(x => x.times(3));

        // Skybox texture
        this.shapes.skybox.arrays.texture_coord = this.shapes.skybox.arrays.texture_coord.map(x => x.times(2));

        this.materials = {
            floor: new Material(new Textured_Phong(), {
            color: hex_color("#000000"),
            ambient: 1, diffusivity: 0.5, specularity: 0.5,
            texture: new Texture("assets/tile.jpg")
        }),
            timer_text: new Material(new defs.Textured_Phong(1), {
                ambient: 0.5,
                texture: new Texture("assets/text.png"),
                color: hex_color("#FF0000"),
            }),
            test: new Material(new Phong_Shader(), {
                color: hex_color("#ffffff"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5
            }),
            wall_1: new Material(new Textured_Phong(), { // Normal Walls
               color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/wall.jpg")
            }),
            wall_2: new Material(new Textured_Phong(), { // Short Front Wall
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/shortwall.jpg")
            }),
            ceiling: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/ceiling1.jpg")
            }),
            tire: new Material(new Phong_Shader(), {
                color: hex_color("#040309"),
                ambient: 1, diffusivity: 0.5, specularity: 0.4
            }),
            crate: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/crate.png")
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
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/nightsky.png")
            }),
        };
        
        //New Variables 
        this.highScore = Infinity;
        this.gameStart = false;
        this.gameOver = false;
        this.previousTime = 0;
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
                    (Math.random() - 0.5) * 18,
                    (Math.random() - 0.5) * 10 + 2,
                    (Math.random() - 0.5) * 0.01-5
                );

                // Check the distance from the new position to all previously generated positions
                var valid_position = true;
                for (let j = 0; j < i; j++) {
                    let distanceSquared =
                        Math.pow(new_position[0] - this.sphere_positions[j][0], 2) +
                        Math.pow(new_position[1] - this.sphere_positions[j][1], 2) +
                        Math.pow(new_position[2] - this.sphere_positions[j][2], 2);
                    let distance = Math.sqrt(distanceSquared);

                    if (distance < 3) {
                        valid_position = false;
                        break;
                    }
                }
            } while (!valid_position);

            this.sphere_positions.push(new_position);

        }

        this.animation_queue = []
        this.start_time = performance.now();

        this.camera = new FPSCam(0, 0, 20);
    }

    resetGame() {
        if (this.timer < this.highScore) {
            this.highScore = this.timer;
        }

        this.gameStart = false;
        this.gameOver = false;
        this.previousTime = this.timer;
        this.timer = 0;
        this.paused = false;

        // Reset sphere positions
        this.sphere_positions = [];
        for (let i = 0; i < 10; i++) {
            let new_position;
            do {
                new_position = vec3(
                    (Math.random() - 0.5) * 18,
                    (Math.random() - 0.5) * 10 + 2,
                    (Math.random() - 0.5) * 0.01-5
                );

                // Check the distance from the new position to all previously generated positions
                var valid_position = true;
                for (let j = 0; j < i; j++) {
                    let distanceSquared =
                        Math.pow(new_position[0] - this.sphere_positions[j][0], 2) +
                        Math.pow(new_position[1] - this.sphere_positions[j][1], 2) +
                        Math.pow(new_position[2] - this.sphere_positions[j][2], 2);
                    let distance = Math.sqrt(distanceSquared);

                    if (distance < 3) {
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



    // Inside the startTimer() function
    startTimer() {
        this.timer = 0;
        this.start_time = performance.now(); // Update the start time with performance.now()
        this.timerInterval = window.setInterval(() => {
            this.timer = (performance.now() - this.start_time) / 1000; // Calculate elapsed time in seconds
        }, 16); // Using 16 milliseconds for smoother updates
    }

    stopTimer() {
        if (this.timerInterval) {
            window.clearInterval(this.timerInterval);
            console.log("Game Over - Timer:", this.timer.toFixed(3), "seconds");
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
                let lastCallTime = 0;
                canvas.addEventListener("mousemove", (e) => {
                    const currentTime = Date.now();
                    const elapsedTime = currentTime - lastCallTime;

                    // Throttle the function to be called at most once every 16 milliseconds
                    if (elapsedTime > 16) {
                        let del_x = e.movementX;
                        let del_y = e.movementY;

                        if (!this.paused) {
                            this.camera.update_cam(del_x, del_y, this.controls.sens);
                        }

                        lastCallTime = currentTime;
                    }

                    // Other logic related to mouse movement
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

        // Floor
        let floor_transform = model_transform.times(Mat4.translation(0, -5, 0)).times(Mat4.scale(40, 0.1, 30));
        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.floor);

        // Shorter back Wall
        let wall_transform1 = model_transform.times(Mat4.translation(0, -2, -27)).times(Mat4.scale(40, 3, 0.1));
        this.shapes.wall2.draw(context, program_state, wall_transform1, this.materials.wall_2);

        // Left Wall
        let wall_transform2 = model_transform.times(Mat4.translation(-40, 0, -10)).times(Mat4.scale(0.1, 15, 40));
        this.shapes.wall1.draw(context, program_state, wall_transform2, this.materials.wall_1);

        // Right Wall
        let wall_transform3 = model_transform.times(Mat4.translation(40, 0, -10)).times(Mat4.scale(0.1, 15, 40));
        this.shapes.wall1.draw(context, program_state, wall_transform3, this.materials.wall_1);

        // Furthest back wall
        let wall_transform4 = model_transform.times(Mat4.translation(0, 0, -40)).times(Mat4.scale(40, 15, 0.1));
        this.shapes.wall1.draw(context, program_state, wall_transform4, this.materials.wall_1);

        // Wall behind camera
        let wall_transform5 = model_transform.times(Mat4.translation(0, 0, 30)).times(Mat4.scale(40, 15, 0.1));
        this.shapes.wall1.draw(context, program_state, wall_transform5, this.materials.wall_1);

        // Ceiling
        let ceiling_transform = model_transform.times(Mat4.translation(0, 15, -30)).times(Mat4.scale(40, 0.4, 14))
        this.shapes.ceiling.draw(context, program_state, ceiling_transform, this.materials.ceiling);

        // Tires
        let tire_transform1 = model_transform.times(Mat4.translation(-20, -4, -20)).times(Mat4.scale(2, 2, 1)).times(Mat4.rotation(80, 1, 0, 0))
        this.shapes.tire.draw(context, program_state, tire_transform1, this.materials.tire);

        let tire_transform2 = model_transform.times(Mat4.translation(-22, -3, -19)).times(Mat4.scale(2, 2, 1)).times(Mat4.rotation(80, 1, 0, 0)).times(Mat4.rotation(-10, 0, 1, 0))
        this.shapes.tire.draw(context, program_state, tire_transform2, this.materials.tire);

        let tire_transform3 = model_transform.times(Mat4.translation(-20, -2, -20)).times(Mat4.scale(2, 2, 1)).times(Mat4.rotation(80, 1, 0, 0)).times(Mat4.rotation(10, 0, 1, 0))
        this.shapes.tire.draw(context, program_state, tire_transform3, this.materials.tire);

        // Crates
        let crate_transform1 = model_transform.times(Mat4.translation(26, -2.5, -24)).times(Mat4.scale(2.5, 2.5, 2.5))
        this.shapes.crate.draw(context, program_state, crate_transform1, this.materials.crate);

        let crate_transform2 = model_transform.times(Mat4.translation(21.75, -3.25, -24)).times(Mat4.scale(1.75, 1.75, 1.75))
        this.shapes.crate.draw(context, program_state, crate_transform2, this.materials.crate);

        this.camera.interface(context, program_state, this.shapes, this.materials); //drawing crosshair and eventually score

        // Skybox
        let background_transform = model_transform.times(Mat4.scale(50, 50, 50));
        this.shapes.skybox.draw(context, program_state, background_transform, this.materials.skybox_material);

        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.floor);
        
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
        let score_header = "Time:";
        let score_color = hex_color("#00FF00");
        let score_header_transform = Mat4.identity()
            .times(Mat4.translation(-20, 1+5, -15))
            .times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.text.set_string(score_header, context.context);
        this.shapes.text.draw(
            context,
            program_state,
            score_header_transform,
            this.materials.timer_text.override({ color: score_color })
        );
        let score_actual = " " + this.timer.toFixed(3);
        let score_actual_transform = score_header_transform.times(
            Mat4.translation(0, -2, -5)
        );
        this.shapes.text.set_string(score_actual, context.context);
        this.shapes.text.draw(
            context,
            program_state,
            score_actual_transform,
            this.materials.timer_text.override({ color: score_color })
        );
        let prev_score_header = "Previous Time:";
        let prev_score_color = hex_color("#00FF00");
        let prev_score_header_transform = Mat4.identity()
            .times(Mat4.translation(-20, 1+2, -15))
            .times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.text.set_string(prev_score_header, context.context);
        this.shapes.text.draw(
            context,
            program_state,
            prev_score_header_transform,
            this.materials.timer_text.override({ color: score_color })
        );
        let prev_score_actual = " " + this.previousTime.toFixed(3);
        let prev_score_actual_transform = prev_score_header_transform.times(
            Mat4.translation(0, -2, -5)
        );
        this.shapes.text.set_string(prev_score_actual, context.context);
        this.shapes.text.draw(
            context,
            program_state,
            prev_score_actual_transform,
            this.materials.timer_text.override({ color: score_color })
        );
        let high_score_header = "Best Time:";
        let high_score_color = hex_color("#00FF00");
        let high_score_header_transform = Mat4.identity()
            .times(Mat4.translation(-20, 1 + 8, -15)) 
            .times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.text.set_string(high_score_header, context.context);
        this.shapes.text.draw(
            context,
            program_state,
            high_score_header_transform,
            this.materials.timer_text.override({ color: high_score_color })
        );
    
        let high_score_actual = " " + this.highScore.toFixed(3); 
        let high_score_actual_transform = high_score_header_transform.times(
            Mat4.translation(0, -2, -5)
        );
        this.shapes.text.set_string(high_score_actual, context.context);
        this.shapes.text.draw(
            context,
            program_state,
            high_score_actual_transform,
            this.materials.timer_text.override({ color: high_score_color })
        );
        while (this.animation_queue.length > 0) {
            if (t > this.animation_queue[0].end_time) {
              this.animation_queue.length = 0;
            } else {
              break;
            }
          }

    }
    }

