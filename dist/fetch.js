"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("request"));
request('https://raw.githubusercontent.com/ros/rosdistro/master/melodic/distribution.yaml', (err, res, body) => {
    console.log(body);
    request('https://api.github.com/repos/rospilot/rospilot/issues', { json: true }, (err, res, body) => {
        console.log(JSON.parse(body));
    });
});
//# sourceMappingURL=fetch.js.map