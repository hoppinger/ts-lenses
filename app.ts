type Fun<a,b> = (_:a) => b
type Without<T, K> = Pick<T, Exclude<keyof T, K>>

const Without = <T, K extends keyof T>(key: K, { [key]: _, ...values }: T): Without<T, K> => values
const Rename = <T, KOld extends keyof T, KNew extends string>(keyOld: KOld, keyNew: KNew, { [keyOld]: value, ...values }: T):
  Without<T, KOld> & { [x in KNew]: T[KOld] } => 
  ({ ...values, ...{ [keyNew]: value } as { [x in KNew]: T[KOld] } })

type SetField<fields, k extends keyof fields, v> = { [x in Exclude<keyof fields, k>]:fields[x] } & { [x in k]:v }
type RenameField<fields, k extends keyof fields, newK extends string> = Without<fields, k> & { [x in newK]: fields[k] }

type UpdateSort = "nested-eager" | "nested-lazy" | "inline-eager" | "inline-lazy"
type UpdateInput<u extends UpdateSort, field> = 
  u extends "nested-eager" ? Entity<field> : 
  u extends "nested-lazy" ? Entity<field> : 
  u extends "inline-eager" ? field : 
  u extends "inline-lazy" ? field : 
  never
type UpdateOutput<u extends UpdateSort, field> = 
  u extends "nested-eager" ? field : 
  u extends "inline-eager" ? field : 
  u extends "nested-lazy" ? Entity<field> : 
  u extends "inline-lazy" ? Entity<field> : 
  never

interface Entity<fields extends Object> {
  get: <k extends keyof fields>(...keys:k[]) => Pick<fields, k>
  rename: <k extends keyof fields, newK extends string, v>(key:k, newKey:newK, f:Fun<fields[k], v>) => Entity<SetField<RenameField<fields, k, newK>, newK, v>>
  set: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-lazy", fields[k]>, v>) => UpdateOutput<"inline-lazy", SetField<fields, k, v>>
  nested:NestedEntity<fields>,
  inline:InlineEntity<fields>,
  commit:() => fields
}

interface NestedEntity<fields extends Object> {
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-eager", fields[k]>, v>) => UpdateOutput<"nested-eager", SetField<fields, k, v>>,
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-lazy", fields[k]>, v>) => UpdateOutput<"nested-lazy", SetField<fields, k, v>>
}

interface InlineEntity<fields extends Object> {
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-eager", fields[k]>, v>) => UpdateOutput<"inline-eager", SetField<fields, k, v>>,
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-lazy", fields[k]>, v>) => UpdateOutput<"inline-lazy", SetField<fields, k, v>>
}

const Entity = <fields extends Object>(fields:fields) : Entity<fields> => ({
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
  commit:() : fields => fields,
})

const NestedEntity = <fields extends Object>(fields:fields) : NestedEntity<fields> => ({
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-eager", fields[k]>, v>) 
    : UpdateOutput<"nested-eager", SetField<fields, k, v>> => 
    ({...fields, [key]:f(Entity(fields[key]))}),
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"nested-lazy", fields[k]>, v>) 
    : UpdateOutput<"nested-lazy", SetField<fields, k, v>> => 
    Entity({...fields, [key]:f(Entity(fields[key]))})
})
const InlineEntity = <fields extends Object>(fields:fields) : InlineEntity<fields> => ({
  eager: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-eager", fields[k]>, v>) 
    : UpdateOutput<"inline-eager", SetField<fields, k, v>> => 
    ({...fields, [key]:f(fields[key])}),
  lazy: <k extends keyof fields, v>(key:k, f:Fun<UpdateInput<"inline-lazy", fields[k]>, v>) 
    : UpdateOutput<"inline-lazy", SetField<fields, k, v>> =>
    Entity({...fields, [key]:f(fields[key])})
})


interface Person {
  name:string,
  surname:string,
  age:number
}

const p1 = Entity<Person>({ name:"John", surname:"Doe", age:27 })
const q1 = p1.set("age", a => a+1).set("name", _ => "Jane").commit()
const q2 = p1.set("age", a => a+1).commit()
const q3 = p1.rename("age", "birthday", x => new Date()).commit()

interface NestedState {
  nesting1:{
    nesting2:{
      nesting3:{
        nesting4:{
          nesting5:{
            obscenelyNestedValueWeNeedToUpdate:number
          },
          slightlyLessObscenelyNestedValueWeNeedToUpdate:number
        }
      }
    }
  }
}

const p2 = Entity<NestedState>({ nesting1:{ nesting2:{ nesting3:{ nesting4:{ slightlyLessObscenelyNestedValueWeNeedToUpdate:0, nesting5:{ obscenelyNestedValueWeNeedToUpdate:0 } } } } } })
const q21 = p2.nested.eager("nesting1", e => 
  e.nested.eager("nesting2", e => 
    e.nested.eager("nesting3", e => 
      e.nested.eager("nesting4", e => 
        e.nested.lazy("nesting5", e => 
          e.inline.eager("obscenelyNestedValueWeNeedToUpdate", v => v+1)
        ).inline.eager("slightlyLessObscenelyNestedValueWeNeedToUpdate", v => v + 2)
      )
    )
  )
)

console.log("Done")

/* TODO:
* readme
* npm package
* article
*/
