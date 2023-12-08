// First person camera view that mouse can control is defined here

import { tiny } from "./examples/common.js";

const {
    vec3, Mat4
} = tiny;

export default class FPSCam {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.at = vec3(0, 0, 1);
        this.lookAt = Mat4.look_at(vec3(x, y, z), this.at, vec3(0, 1, 0));
        this.default = Mat4.look_at(vec3(x, y, z), vec3(0, 0, 1), vec3(0, 1, 0));

        this.t = 0;
        this.p = 0;
    }

    update_cam(del_x, del_y, sensitivity) {
        this.t += del_x * sensitivity / 50000;
        this.p += (-1) * del_y * sensitivity / 50000;
        this.at = vec3(this.t, this.p, 1)
        this.lookAt = Mat4.look_at(vec3(this.x, this.y, this.z), this.at, vec3(0, 1, 0));
        return this.lookAt;
    }

    interface(context, program_state, shapes, materials) {
        let cam_matrix = Mat4.inverse(this.lookAt);

        // crosshair
        let ch_transform = cam_matrix.times(Mat4.translation(0, 0, -1)).times(Mat4.scale(0.02, 0.02, 0.02));
        shapes.crosshair.draw(context, program_state, ch_transform, materials.crosshair);
    }
}