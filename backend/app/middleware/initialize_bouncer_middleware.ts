import policies from '#policies/main'
import abilities from '#abilities/main'

import { Bouncer } from '@adonisjs/bouncer'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class InitializeBouncerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.bouncer = new Bouncer(
      () => ctx.authUser || null,
      abilities,
      policies
    ).setContainerResolver(ctx.containerResolver)

    if ('view' in ctx && ctx.view) {
      ;(ctx.view as unknown as { share: (helpers: unknown) => void }).share(ctx.bouncer.edgeHelpers)
    }

    return next()
  }
}

declare module '@adonisjs/core/http' {
  export interface HttpContext {
    bouncer: Bouncer<NonNullable<HttpContext['authUser']>, typeof abilities, typeof policies>
  }
}
