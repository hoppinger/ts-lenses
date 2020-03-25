import { Entity } from "./lenses"

export const run = () => {
  interface Person {
    name:string,
    surname:string,
    age:number
  }

  const p1 = Entity<Person>({ name:"John", surname:"Doe", age:27 })
  const q1 = p1.set("age", a => a+1).set("name", _ => "Jane").commit()
  const q2 = p1.set("age", a => a+1).commit()
  const q3 = p1.rename("age", "birthday", x => new Date("1-1-2001")).commit()

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
  const q21 = p2.setIn("nesting1", e => 
    e.setIn("nesting2", e => 
      e.setIn("nesting3", e => 
      e.setIn("nesting4", e => 
        e.set("slightlyLessObscenelyNestedValueWeNeedToUpdate", v => v + 2)
          .rename("slightlyLessObscenelyNestedValueWeNeedToUpdate", "counter", x => x)
          .setIn("nesting5", e => 
            e.set("obscenelyNestedValueWeNeedToUpdate", v => v+1)
             .rename("obscenelyNestedValueWeNeedToUpdate", "counter", x => x)
          )
        )
      )
    )
  ).commit()


  interface AppState {
    loginForm:{
      firstPage:{
        userName:string
        password:string
      },
      secondPage:{
        email:string
        accountType:number
      }
    }
  }
  
  const setUserName = (newUserName:string) => (s0:AppState) : AppState => 
    Entity(s0)
      .setIn("loginForm", e => e
      .setIn("firstPage", e => e
      .set("userName", _ => newUserName)))
      .commit()

  console.log("Done")
}
