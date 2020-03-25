"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lenses_1 = require("./lenses");
exports.run = () => {
    const p1 = lenses_1.Entity({ name: "John", surname: "Doe", age: 27 });
    const q1 = p1.set("age", a => a + 1).set("name", _ => "Jane").commit();
    const q2 = p1.set("age", a => a + 1).commit();
    const q3 = p1.rename("age", "birthday", x => new Date("1-1-2001")).commit();
    const p2 = lenses_1.Entity({ nesting1: { nesting2: { nesting3: { nesting4: { slightlyLessObscenelyNestedValueWeNeedToUpdate: 0, nesting5: { obscenelyNestedValueWeNeedToUpdate: 0 } } } } } });
    const q21 = p2.setIn("nesting1", e => e.setIn("nesting2", e => e.setIn("nesting3", e => e.setIn("nesting4", e => e.set("slightlyLessObscenelyNestedValueWeNeedToUpdate", v => v + 2)
        .rename("slightlyLessObscenelyNestedValueWeNeedToUpdate", "counter", x => x)
        .setIn("nesting5", e => e.set("obscenelyNestedValueWeNeedToUpdate", v => v + 1)
        .rename("obscenelyNestedValueWeNeedToUpdate", "counter", x => x)))))).commit();
    const setUserName = (newUserName) => (s0) => lenses_1.Entity(s0)
        .setIn("loginForm", e => e
        .setIn("firstPage", e => e
        .set("userName", _ => newUserName)))
        .commit();
    console.log("Done");
};
//# sourceMappingURL=samples.js.map