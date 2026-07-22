# Nest.js

Source repos: `dnc02-nestjs-basic` (scaffold + Prisma/DTOs),
`dnc02-nestjs-imdb-lab` (adds bcrypt + JWT issuing), `dnc02-nestjs-advanced`
(adds the guard/metadata enforcement layer + path aliases). The progression is
consistent — what's added later never contradicts the base.

## Stack (identical across all three)
- **Nest v11**, **pnpm**, **Prisma** as the only ORM (`@prisma/adapter-pg`,
  Postgres; client generated to a custom `src/.../generated/prisma` path). Never
  TypeORM/Mongoose.
- **Two-validator split (signature convention):** `class-validator` +
  `class-transformer` for **DTOs**, but **`zod` for env/config** validation, wired
  as `ConfigModule.forRoot({ isGlobal: true, validate })`.
- `@nestjs/jwt` + `bcrypt` for auth. `@nestjs/config` global.
- **Flat-config ESLint** (`eslint.config.mjs`) on `typescript-eslint`
  `recommendedTypeChecked` + `eslint-plugin-prettier`; disables `no-explicit-any`,
  downgrades `no-floating-promises`/`no-unsafe-argument` to warnings.
- Prettier: `singleQuote: true` always.

## Folder & file layout
```
src/
  <feature>/
    <feature>.controller.ts
    <feature>.service.ts
    <feature>.module.ts
    dtos/<action>-<feature>.dto.ts     # plural "dtos" folder
    types/<name>.type.ts               # export type X = {…}  (never interface)
    constants/<name>.constant.ts       # const object + typeof (never enum)
  database/                            # @Global() DatabaseModule
  config/
  common/decorators/                   # custom decorators (@Trim, @Public, @CurrentUser)
  shared|infrastructure/               # wrapped third-party concerns (hash, jwt)
```
- **No `*.entity.ts` anywhere** — the Prisma schema is the sole model source.
- `DatabaseModule` is `@Global()` and wraps `PrismaService extends PrismaClient`.
- Third-party concerns get their own tiny module+service (a `SecurityModule`
  wrapping hashing + JWT in the advanced repo).
- `kebab-case` multi-word filenames throughout.

## Controllers, services, DI
- **Constructor DI only, always `private readonly`.** No field injection.
  ```ts
  constructor(private readonly productService: ProductService) {}
  ```
- `@Controller('kebab-plural')`; HTTP-verb decorators with `:id` params;
  `@Body()` / `@Param()` / `@Query()` bound to typed DTOs.
- `@HttpCode(HttpStatus.OK)` to override Nest's default 201 on login-style POSTs.
- Explicit return types on **service** async methods (`Promise<void>`,
  `Promise<User | null>`); often omitted on thin controller handlers.

## DTOs
Class-based with stacked `class-validator` decorators, commonly ordered
format-validator → `@IsString` → `@IsNotEmpty`/`@IsOptional`:
```ts
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @IsOptional()
  price?: number
}
```
Update DTOs **`extends PartialType(CreateDto)`** (imported from `@nestjs/swagger`,
even where Swagger isn't otherwise wired up).

## Validation & errors
- Global **`ValidationPipe({ transform: true, whitelist: true })`** in `main.ts`.
- **Error handling is built-in `HttpException` subclasses thrown directly in
  services** — `ConflictException`, `UnauthorizedException`, `ForbiddenException`,
  `BadRequestException`, `NotFoundException`. **No custom exception filters,
  interceptors, or pipes exist** in any repo — don't add them unless asked.
- `bootstrap()` is guarded to satisfy the floating-promises rule
  (`void bootstrap()` or `.catch(...)`).

## Auth (advanced-repo pattern)
- Real bcrypt hashing + JWT signing in an `AuthService` / `AccessTokenService`.
- **Global guard via `APP_GUARD`**, opting individual routes out with a custom
  `@Public()` decorator read through `Reflector`:
  ```ts
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private readonly accessTokenService: AccessTokenService,
                private readonly reflector: Reflector) {}
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,
        [ctx.getHandler(), ctx.getClass()])
      if (isPublic) return true
      // …verify Bearer token, attach user
    }
  }
  ```
  Registered as `{ provide: APP_GUARD, useClass: AuthGuard }` in `AppModule`; a
  `@CurrentUser()` param decorator reads the attached user.

## Types & constants
- Types live in `types/<name>.type.ts` as **`export type` (never `interface`)**.
- Constants use the **const-object + `typeof` union** pattern in
  `constants/<name>.constant.ts`, **not** a TS `enum` (matches the wider course
  `as const` convention — see [typescript.md](typescript.md)).

## Voice
100% English comments (no Thai in these repos). Distinctive ALL-CAPS instructional
comments (`// READ METADATA`, `// Controller Level`), large commented-out
alternative implementations left in place, and empty-body stub methods
(`updateProduct() {}`) + stray `console.log`s as deliberate student exercises.
Semicolons and single quotes always.
