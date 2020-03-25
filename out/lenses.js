"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Without = (key, _a) => {
    var _b = key, _ = _a[_b], values = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
    return values;
};
exports.Rename = (keyOld, keyNew, _a) => {
    var _b = keyOld, value = _a[_b], values = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
    return (Object.assign(Object.assign({}, values), { [keyNew]: value }));
};
exports.Entity = (fields) => ({
    get: (...keys) => keys.reduce((acc, k) => (Object.assign(Object.assign({}, acc), fields[k])), {}),
    nested: exports.NestedEntity(fields),
    inline: exports.InlineEntity(fields),
    rename: (key, newKey, f) => exports.Entity(exports.Rename(key, newKey, Object.assign(Object.assign({}, fields), { [key]: f(fields[key]) }))),
    set: function (key, f) {
        return this.inline.lazy(key, f);
    },
    setIn: function (key, f) {
        return this.nested.lazy(key, x => f(x).commit());
    },
    commit: () => fields,
});
exports.NestedEntity = (fields) => ({
    eager: (key, f) => (Object.assign(Object.assign({}, fields), { [key]: f(exports.Entity(fields[key])) })),
    lazy: (key, f) => exports.Entity(Object.assign(Object.assign({}, fields), { [key]: f(exports.Entity(fields[key])) }))
});
exports.InlineEntity = (fields) => ({
    eager: (key, f) => (Object.assign(Object.assign({}, fields), { [key]: f(fields[key]) })),
    lazy: (key, f) => exports.Entity(Object.assign(Object.assign({}, fields), { [key]: f(fields[key]) }))
});
//# sourceMappingURL=lenses.js.map