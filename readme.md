# Type\-safe lenses in TypeScript
_By Dr. Giuseppe Maggiore_

Modern Single Page Applications (SPA's) built in TypeScript and JavaScript need to manage more and more complex and nested data structures. For example, we could need to manage a state such as the following\:

```ts
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
```

Whenever we have to _immutably_ update the `userName` as a result of a user action, we might end up writing code looking like the following\:

```ts
const setUserName = (newUserName:string) => (s0:AppState) : AppState => ({
  ...s0,
  loginForm:{
    ...s0.loginForm,
    firstPage:{
      ...s0.loginForm.firstPage,
      userName:newUserName
    }
  }
})
```

While it is, I believe, pretty awesome that TypeScript offers us a type\-safe spread operator, the nesting is a bit painful to watch. The fact that we cannot take advantage of the implicit context that we are copying `s0`, and as such we want to stick to it when updating its nested objects such as `loginForm` and `firstPage` requires repetition, which increases cognitive load when maintaining the code, and is error\-prone (one might mistakenly write `s1.loginForm.firstPage` if the scope contains another state, which sometimes is the case, without the compiler being able to offer any helpful warnings).

In order to tackle this problem, I have built a simple lenses library that takes on the task of performing updates on TypeScript records in a way that is type\-safe, and as contextually smart as possible.


## Simple example
> In order to run this example, please first install the package via `npm install ts-lenses`, and add `import { Entity } from "ts-lenses"` to the top of your file!

Consider a simple, shallow type such as\:

```ts
interface Person {
  name:string,
  surname:string,
  age:number
}
```

We can wrap an object of type `Person` into a lazy `Entity` that can be updated with some smarter operators\:

```ts
const p1 = Entity<Person>({ name:"John", surname:"Doe", age:27 })
```

We can now set values as follows\:

```ts
const q1 = p1.set("age", a => a+1).set("name", _ => "Jane")
```

Notice that, in order to enable method chaining, the `set` operator does not return the final result, but rather a new `Entity` on which further operations can be performed. Of course, `set` is type\-safe\: `"age"` must be a valid attribute, and the setter function that updates the value must process an input and produce an output of the correct type.

When we are done with chaining operations, we can commit and then we get the resulting object with the values set correctly\:

```ts
const q1 = p1.set("age", a => a+1).set("name", _ => "Jane").commit()
```

We can also do some nice things like change the structure (and thus the type) of the resulting record\:

```ts
const q2 = p1.rename("age", "birthday", x => new Date("1-1-2001")).commit()
```

The type of `q2` now has no `age` attribute anymore, and instead has a `birthday` of type `Date`\:

```ts
q2 : {
  name:string,
  surname:string,
  birthday:Date
}
```

This means that further operator chaining after a rename cannot access the old attribute, but rather only the new\:

![IntelliSense after rename](./media/TypeSafetyOfRename.gif)

## More complex example
We can also work on nested objects. For example, consider a fictitious type such as\:

```ts
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
```

Imagine that we were tasked with incrementing both nested numbers by `1`. A bit of a daunting task, especially if we consider the amount of repetition involved. Writing something like `{...s0.nesting1.nesting2.nesting3.nesting4.nesting5, obscenelyNestedValueWeNeedToUpdate:s0.nesting1.nesting2.nesting3.nesting4.nesting5.obscenelyNestedValueWeNeedToUpdate+1}` is not exactly that paragon of elegance that gives most developers that feeling of "yes! I love my job" :)

The library can help us a bit. The `setIn` operator facilitates setting nested values. The resulting code would look as follows\:

```ts
const p2 = Entity<NestedState>({ nesting1:{ nesting2:{ nesting3:{ nesting4:{ slightlyLessObscenelyNestedValueWeNeedToUpdate:0, nesting5:{ obscenelyNestedValueWeNeedToUpdate:0 } } } } } })
const q21 = p2.setIn("nesting1", e => 
  e.setIn("nesting2", e => 
    e.setIn("nesting3", e => 
    e.setIn("nesting4", e => 
      e.set("slightlyLessObscenelyNestedValueWeNeedToUpdate", v => v + 2)
        .setIn("nesting5", e => 
          e.set("obscenelyNestedValueWeNeedToUpdate", v => v+1)
        )
      )
    )
  )
).commit()
```

Of course, we enjoy type\-safety all the way down, and we can mix and match `set` and `setIn` as needed. We could even rename some of the nested attributes, in order to both update and restructure the input state for update\-and\-convert tasks:

![IntelliSense, nesting, and renaming](./media/TypeSafetyOfNesting.gif)


## The original issue
The original "challenging" bit of code then becomes\:

```ts
const setUserName = (newUserName:string) => (s0:AppState) : AppState => 
  Entity(s0)
    .setIn("loginForm", e => e
    .setIn("firstPage", e => e
    .set("userName", _ => newUserName)))
    .commit()
```

Of course, it is a matter of personal preference, but I find this much more attractive than the original version!

# Conclusion
Managing immutable update operations on complex nested states is a recurring challenge. In this article I present a small, new library that wraps these operations in a type\-safe way, inspired from the _lenses_ concept from Haskell.

Thanks to this library, [which can be found on `npm`](https://www.npmjs.com/package/ts-lenses), you can process data quickly and easily, with enhanced productivity and less bugs.

Thank you for coming all the way to the end, I hope you enjoyed reading this article as much as I enjoyed writing it ;)


# Appendix\: about the author
Hi! I am Giuseppe Maggiore. I have an academic background (PhD) in Computer Science, specifically compilers and functional programming (not so surprising eh...). I am now CTO of [Hoppinger](https://www.hoppinger.com/), a wonderful software development company in the heart of Rotterdam (Netherlands).

I am always looking for talented software engineers who get excited at the thought of type safety, reliable software, functional programming, and so on. If that is the case, do get in touch with us, [we always have open positions for smart people](https://www.hoppinger.com/vacatures/)!
