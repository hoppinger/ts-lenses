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
const Without = (key, _a) => {
    var _b = key, _ = _a[_b], values = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
    return values;
};
const Rename = (keyOld, keyNew, _a) => {
    var _b = keyOld, value = _a[_b], values = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
    return (Object.assign(Object.assign({}, values), { [keyNew]: value }));
};
const Entity = (fields) => ({
    get: (...keys) => keys.reduce((acc, k) => (Object.assign(Object.assign({}, acc), fields[k])), {}),
    rename: (key, newKey, f) => Entity(Rename(key, newKey, Entity(fields).update(key, f).value())),
    set: (key, value) => Entity(Object.assign(Object.assign({}, fields), { [key]: value })),
    update: (key, f) => Entity(Object.assign(Object.assign({}, fields), { [key]: f(fields[key]) })),
    updateIn: (key, f) => (Object.assign(Object.assign({}, fields), { [key]: f(Entity(fields[key])) })),
    withIn: (key, f) => Entity(Object.assign(Object.assign({}, fields), { [key]: f(Entity(fields[key])) })),
    value: () => fields,
});
const p1 = Entity({ name: "John", surname: "Doe", age: 27 });
const q1 = p1.update("age", a => a + 1).set("name", "Jane").value();
const q2 = p1.update("age", a => a + 1).value();
const q3 = p1.rename("age", "birthday", x => new Date()).value();
const p2 = Entity({ nesting1: { nesting2: { nesting3: { nesting4: { nesting5: { obscenelyNestedValueWeNeedToUpdate: 0 } } } } } });
const q21 = p2.updateIn("nesting1", e => e.updateIn("nesting2", e => e.updateIn("nesting3", e => e.updateIn("nesting4", e => e.updateIn("nesting5", e => e.update("obscenelyNestedValueWeNeedToUpdate", v => v + 1).value())))));
console.log("Done");
//# sourceMappingURL=app.js.map