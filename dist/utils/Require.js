"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}
exports.requireUncached = requireUncached;
