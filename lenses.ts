type Fun<a,b> = (_:a) => b
type Without<T, K> = Pick<T, Exclude<keyof T, K>>

export const Without = <T, K extends keyof T>(key: K, { [key]: _, ...values }: T): Without<T, K> => values
export const Rename = <T, KOld extends keyof T, KNew extends string>(keyOld: KOld, keyNew: KNew, { [keyOld]: value, ...values }: T):
  Without<T, KOld> & { [x in KNew]: T[KOld] } => 
  ({ ...values, ...{ [keyNew]: value } as { [x in KNew]: T[KOld] } })

export type SetField<fields, k extends keyof fields, v> = { [x in Exclude<keyof fields, k>]:fields[x] } & { [x in k]:v }
export type RenameField<fields, k extends keyof fields, newK extends string> = Without<fields, k> & { [x in newK]: fields[k] }

export type UpdateSort = "nested-eager" | "nested-lazy" | "inline-eager" | "inline-lazy"
export type UpdateInput<u extends UpdateSort, field> = 
  u extends "nested-eager" ? Entity<field> : 
  u extends "nested-lazy" ? Entity<field> : 
  u extends "inline-eager" ? field : 
  u extends "inline-lazy" ? field : 
  never
export type UpdateOutput<u extends UpdateSort, field> = 
  u extends "nested-eager" ? field : 
  u extends "inline-eager" ? field : 
  u extends "nested-lazy" ? Entity<field> : 
  u extends "inline-lazy" ? Entity<field> : 
  never

export interface Entity<fields extends Object> {
  get: <k extends keyof fields>(...keys:k[]) => Pick<fields, k>
  rename: <k extends keyof fields, newK extends string, v>(key:k, newKey:newK, f:Fun<fields[k], v>) => Entity<SetField<RenameField<fields, k, newK>, newK, v>>
  set: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-lazy", fields[k]>, v>) => UpdateOutput<"inline-lazy", SetField<fields, k, v>>
  setIn: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-lazy", fields[k]>, Entity<v>>) => UpdateOutput<"nested-lazy", SetField<fields, k, v>>
  nested:NestedEntity<fields>,
  inline:InlineEntity<fields>,
  commit:() => fields
}

export interface NestedEntity<fields extends Object> {
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-eager", fields[k]>, v>) => UpdateOutput<"nested-eager", SetField<fields, k, v>>,
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-lazy", fields[k]>, v>) => UpdateOutput<"nested-lazy", SetField<fields, k, v>>
}

export interface InlineEntity<fields extends Object> {
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-eager", fields[k]>, v>) => UpdateOutput<"inline-eager", SetField<fields, k, v>>,
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-lazy", fields[k]>, v>) => UpdateOutput<"inline-lazy", SetField<fields, k, v>>
}

export const Entity = <fields extends Object>(fields:fields) : Entity<fields> => ({
  get: <k extends keyof fields>(...keys:k[]) : Pick<fields, k> => 
    keys.reduce((acc, k) => ({...acc, ...fields[k] }), {} as Pick<fields,k>),
  nested:NestedEntity(fields),
  inline:InlineEntity(fields),
  rename: <k extends keyof fields, newK extends string, v>(key:k, newKey:newK, f:Fun<fields[k], v>) : 
    Entity<SetField<RenameField<fields, k, newK>, newK, v>> => 
    Entity(Rename(key, newKey, {...fields, [key]:f(fields[key])})) as any,
  set : function<k extends keyof fields, v>(this:Entity<fields>, key:k, f:Fun<UpdateInput<"inline-lazy", fields[k]>, v>)
    : UpdateOutput<"inline-lazy", SetField<fields, k, v>> {
    return this.inline.lazy(key, f)
  },
  setIn: function<k extends keyof fields, v>(this:Entity<fields>, key:k, f:Fun<UpdateInput<"nested-lazy", fields[k]>, Entity<v>>) 
    : UpdateOutput<"nested-lazy", SetField<fields, k, v>> {
    return this.nested.lazy(key, x => f(x).commit())
  },
  commit:() : fields => fields,
})

export const NestedEntity = <fields extends Object>(fields:fields) : NestedEntity<fields> => ({
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-eager", fields[k]>, v>) 
    : UpdateOutput<"nested-eager", SetField<fields, k, v>> => 
    ({...fields, [key]:f(Entity(fields[key]))}),
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-lazy", fields[k]>, v>) 
    : UpdateOutput<"nested-lazy", SetField<fields, k, v>> => 
    Entity({...fields, [key]:f(Entity(fields[key]))})
})
export const InlineEntity = <fields extends Object>(fields:fields) : InlineEntity<fields> => ({
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-eager", fields[k]>, v>) 
    : UpdateOutput<"inline-eager", SetField<fields, k, v>> => 
    ({...fields, [key]:f(fields[key])}),
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-lazy", fields[k]>, v>) 
    : UpdateOutput<"inline-lazy", SetField<fields, k, v>> =>
    Entity({...fields, [key]:f(fields[key])})
})

export const setter = function<fields extends Object, k extends keyof fields>(k:k, v:fields[k]) {
  return (s:fields) => Entity<fields>(s).inline.eager<k, fields[k]>(k, _ => v)
}
