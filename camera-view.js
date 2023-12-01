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
}