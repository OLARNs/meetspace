# Express (backend)

Source repos: `dnc02-express-exercise`, `dnc02-express-learning`,
`dnc02-prisma-introspection`, `dnc02-authentication-lab`/`-learning`,
`dnc02-express-auth`, `dnc02-express-connect` (plain JS), plus the TS variants
`dnc02-express-ts` / `dnc02-ts-express` (see notes at the bottom +
[typescript.md](typescript.md)). `dnc02-express-connect` is the mature reference
implementation of the house style.

## Toolchain
- **Express 5**, **ESM** (`"type": "module"`, zero `require()`), **pnpm**,
  `nodemon` for dev, `dotenv/config` for env. No `.eslintrc`/`.prettierrc` in most
  — style is by example (single quotes, semicolons, 2-space).

## Layered structure (once past the intro "learning" files)
```
src/
  app.js                     # builds & exports the app
  config/env.js              # reads process.env once
  db/prisma.js               # Prisma client singleton
  routes/<resource>.route.js
  controllers/<resource>.controller.js
  services/<resource>.service.js
  middlewares/<name>.middleware.js
  schemas/<resource>.schema.js   # Zod (older repos: validators/)
  utils/create-error.js
```
Intro/"learning" repos instead keep one flat file per concept
(`routing.js`, `error.js`, `query-params-body.js`).

## `app.js` — identical shape everywhere
```js
const app = express()
app.use(express.json())
app.use(cors())            // added in later repos
app.use(morgan('dev'))     // added in later repos
app.use('/auth', authRouter)
app.use('/todos', todoRouter)
app.use(notFoundMiddleware) // always second-to-last
app.use(errorMiddleware)    // always last
```
`server.js`/entry then `app.listen(env.PORT, (err) => { if (err) console.error(err); else console.log('server running on port: ' + env.PORT) })`.
`notFound` then `error` middleware are **always the final two, always in that
order.**

## Router pattern
One file per resource, `Router()` exported as a named `xRouter`. Validation and
auth middleware are passed **inline as args before the controller**:
```js
export const authRouter = Router()
authRouter.post('/register', validate({ body: registerSchema }), authController.register)
authRouter.get('/me', authenticate, authController.me)
```

## Controllers & services — object literals, not classes
```js
export const authController = {}
authController.register = async (req, res) => {
  const user = await authService.register(req.body)
  res.status(201).json({ user })
}
```
Same object-literal pattern for services. **Controllers call services; services
call Prisma.** Do not put Prisma calls directly in controllers.

## Error handling
- **No try/catch in controllers.** Rely on Express 5 auto-forwarding rejected
  async-handler promises to the error middleware. Use try/catch *only* to
  translate a specific error (JWT verify failure, Prisma `P2002` unique
  constraint).
- Throwing is done in services/middleware via a shared util:
  ```js
  // utils/create-error.js
  export const createError = (statusCode, message, details) => {
    const err = new Error(message)
    err.statusCode = statusCode
    err.details = details
    return err
  }
  ```
  (`throw createError(404, 'User not found')`).
- Global error middleware:
  ```js
  export const errorMiddleware = (err, req, res, next) => {
    console.error(err)
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message, details: err.details })
    res.status(500).json({ message: 'Internal Server Error' })
  }
  ```

## Response shape
Always `res.status(N).json({ ... })` with a **named key wrapping the payload** —
`{ message }`, `{ user }`, `{ todo }`, `{ todos }`, `{ access_token, user }`.
**Never** return a bare array or bare object.

## Validation
Zod only. A `validate({ body, params, query })` middleware factory runs
`.safeParse` and surfaces errors with `z.flattenError`:
```js
export const validate = (schemas) => (req, res, next) => {
  for (const key of ['body', 'params', 'query']) {
    if (!schemas[key]) continue
    const result = schemas[key].safeParse(req[key])
    if (!result.success) return res.status(400).json({ message: 'Validation error', details: z.flattenError(result.error) })
    req[key] = result.data
  }
  next()
}
```

## Auth
- `bcrypt`, `SALT_ROUNDS` 10–12.
- JWT payload `{ sub: user.id, email, role }`, `jwt.sign(payload, env.JWT_SECRET, { expiresIn })`.
- `authenticate` middleware: parse `Authorization: Bearer <token>` → verify →
  load user via `userService` → set `req.user`.
- `checkRole(...roles)` factory middleware for RBAC.
- Mature repos add soft-delete (`deletedAt`) and per-record ownership checks.

## Database
Postgres + Prisma (`@prisma/adapter-pg` driver adapter, client generated to a
custom gitignored path). See [SKILL.md](../SKILL.md) "Data & validation" for the
schema-naming convention (`@@map`/`@map` to snake_case, `Timestamptz(3)` audit
pair). `dnc02-prisma-introspection` shows `prisma db pull` against an existing DB.

## TypeScript Express variants
`dnc02-express-ts` (production-like) keeps the **object-literal** controllers/
services, typed `export const authService = { … } as const` and handlers via
`satisfies Record<string, RequestHandler>`; input types are Zod-derived
(`type RegisterInput = z.infer<typeof registerSchema>`); NodeNext ESM needs
explicit `.js` import extensions; `Express.Request.user` is added by module
augmentation in `src/@types/express.d.ts`. `dnc02-ts-express` is the alternate
**class/SOLID/DI** teaching variant (`class AuthController`, parameter-property
injection) — use classes there only because that repo's lesson is about DI.
