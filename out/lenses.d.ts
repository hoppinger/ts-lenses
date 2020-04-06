declare type Fun<a, b> = (_: a) => b;
declare type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
export declare const Without: <T, K extends keyof T>(key: K, { [key]: _, ...values }: T) => Pick<T, Exclude<keyof T, K>>;
export declare const Rename: <T, KOld extends keyof T, KNew extends string>(keyOld: KOld, keyNew: KNew, { [keyOld]: value, ...values }: T) => Pick<T, Exclude<keyof T, KOld>> & { [x in KNew]: T[KOld]; };
export declare type SetField<fields, k extends keyof fields, v> = {
    [x in Exclude<keyof fields, k>]: fields[x];
} & {
    [x in k]: v;
};
export declare type RenameField<fields, k extends keyof fields, newK extends string> = Without<fields, k> & {
    [x in newK]: fields[k];
};
export declare type UpdateSort = "nested-eager" | "nested-lazy" | "inline-eager" | "inline-lazy";
export declare type UpdateInput<u extends UpdateSort, field> = u extends "nested-eager" ? Entity<field> : u extends "nested-lazy" ? Entity<field> : u extends "inline-eager" ? field : u extends "inline-lazy" ? field : never;
export declare type UpdateOutput<u extends UpdateSort, field> = u extends "nested-eager" ? field : u extends "inline-eager" ? field : u extends "nested-lazy" ? Entity<field> : u extends "inline-lazy" ? Entity<field> : never;
export interface Entity<fields extends Object> {
    get: <k extends keyof fields>(...keys: k[]) => Pick<fields, k>;
    rename: <k extends keyof fields, newK extends string, v>(key: k, newKey: newK, f: Fun<fields[k], v>) => Entity<SetField<RenameField<fields, k, newK>, newK, v>>;
    set: <k extends keyof fields, v>(key: k, f: Fun<UpdateInput<"inline-lazy", fields[k]>, v>) => UpdateOutput<"inline-lazy", SetField<fields, k, v>>;
    setIn: <k extends keyof fields, v>(key: k, f: Fun<UpdateInput<"nested-lazy", fields[k]>, Entity<v>>) => UpdateOutput<"nested-lazy", SetField<fields, k, v>>;
    nested: NestedEntity<fields>;
    inline: InlineEntity<fields>;
    commit: () => fields;
}
export interface NestedEntity<fields extends Object> {
    eager: <k extends keyof fields, v>(key: k, f: Fun<UpdateInput<"nested-eager", fields[k]>, v>) => UpdateOutput<"nested-eager", SetField<fields, k, v>>;
    lazy: <k extends keyof fields, v>(key: k, f: Fun<UpdateInput<"nested-lazy", fields[k]>, v>) => UpdateOutput<"nested-lazy", SetField<fields, k, v>>;
}
export interface InlineEntity<fields extends Object> {
    eager: <k extends keyof fields, v>(key: k, f: Fun<UpdateInput<"inline-eager", fields[k]>, v>) => UpdateOutput<"inline-eager", SetField<fields, k, v>>;
    lazy: <k extends keyof fields, v>(key: k, f: Fun<UpdateInput<"inline-lazy", fields[k]>, v>) => UpdateOutput<"inline-lazy", SetField<fields, k, v>>;
}
export declare const Entity: <fields extends Object>(fields: fields) => Entity<fields>;
export declare const NestedEntity: <fields extends Object>(fields: fields) => NestedEntity<fields>;
export declare const InlineEntity: <fields extends Object>(fields: fields) => InlineEntity<fields>;
export declare const setter: <fields extends Object, k extends keyof fields>(k: k, v: fields[k]) => (s: fields) => SetField<fields, k, fields[k]>;
export declare const Updater: <fields extends Object>() => <result>(f: Fun<Entity<fields>, result>) => Fun<fields, result>;
export {};
//# sourceMappingURL=lenses.d.ts.map