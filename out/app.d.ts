declare type Fun<a, b> = (_: a) => b;
declare type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
declare const Without: <T, K extends keyof T>(key: K, { [key]: _, ...values }: T) => Pick<T, Exclude<keyof T, K>>;
declare const Rename: <T, KOld extends keyof T, KNew extends string>(keyOld: KOld, keyNew: KNew, { [keyOld]: value, ...values }: T) => Pick<T, Exclude<keyof T, KOld>> & { [x in KNew]: T[KOld]; };
declare type SetField<fields, k extends keyof fields, v> = {
    [x in Exclude<keyof fields, k>]: fields[x];
} & {
    [x in k]: v;
};
declare type RenameField<fields, k extends keyof fields, newK extends string> = Without<fields, k> & {
    [x in newK]: fields[k];
};
interface Entity<fields extends Object> {
    get: <k extends keyof fields>(...keys: k[]) => Pick<fields, k>;
    rename: <k extends keyof fields, newK extends string, v>(key: k, newKey: newK, f: Fun<fields[k], v>) => Entity<SetField<RenameField<fields, k, newK>, newK, v>>;
    set: <k extends keyof fields, v>(key: k, value: v) => Entity<SetField<fields, k, v>>;
    update: <k extends keyof fields, v>(key: k, f: Fun<fields[k], v>) => Entity<SetField<fields, k, v>>;
    updateIn: <k extends keyof fields, v>(key: k, f: Fun<Entity<fields[k]>, v>) => SetField<fields, k, v>;
    withIn: <k extends keyof fields, v>(key: k, f: Fun<Entity<fields[k]>, v>) => Entity<SetField<fields, k, v>>;
    value: () => fields;
}
declare const Entity: <fields extends Object>(fields: fields) => Entity<fields>;
interface Person {
    name: string;
    surname: string;
    age: number;
}
declare const p1: Entity<Person>;
declare const q1: SetField<SetField<Person, "age", number>, "name", string>;
declare const q2: SetField<Person, "age", number>;
declare const q3: SetField<RenameField<Person, "age", "birthday">, "birthday", Date>;
interface NestedState {
    nesting1: {
        nesting2: {
            nesting3: {
                nesting4: {
                    nesting5: {
                        obscenelyNestedValueWeNeedToUpdate: number;
                    };
                };
            };
        };
    };
}
declare const p2: Entity<NestedState>;
declare const q21: SetField<NestedState, "nesting1", SetField<{
    nesting2: {
        nesting3: {
            nesting4: {
                nesting5: {
                    obscenelyNestedValueWeNeedToUpdate: number;
                };
            };
        };
    };
}, "nesting2", SetField<{
    nesting3: {
        nesting4: {
            nesting5: {
                obscenelyNestedValueWeNeedToUpdate: number;
            };
        };
    };
}, "nesting3", SetField<{
    nesting4: {
        nesting5: {
            obscenelyNestedValueWeNeedToUpdate: number;
        };
    };
}, "nesting4", SetField<{
    nesting5: {
        obscenelyNestedValueWeNeedToUpdate: number;
    };
}, "nesting5", SetField<{
    obscenelyNestedValueWeNeedToUpdate: number;
}, "obscenelyNestedValueWeNeedToUpdate", number>>>>>>;
//# sourceMappingURL=app.d.ts.map