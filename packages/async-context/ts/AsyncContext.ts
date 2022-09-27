import { LeftJoin } from 'type-plus'
import { BlockingGetDetected, ContextAlreadyInitialized } from './errors'

export class AsyncContext<
  Init extends Record<string | symbol, any>,
  Context extends Record<string | symbol, any> = Init
  > {
  #transformers: Array<AsyncContext.Transformer<any, any>> = []
  #resolving: Promise<any> | undefined
  #resolvers: Array<((value: Promise<Context>) => void)> = []
  #transforming = false
  #init: Init | Promise<Init> | AsyncContext.Initializer<Init> | undefined
  constructor(init?: Init | Promise<Init> | AsyncContext.Initializer<Init>) {
    this.#init = init
  }
  initialize<I extends Init = Init>(init: I | Promise<I> | AsyncContext.Initializer<I>): AsyncContext<I> {
    if (this.#init) throw new ContextAlreadyInitialized({ ssf: this.initialize })
    this.#init = init

    if (this.#resolvers.length > 0) this.#resolvers.forEach(r => r(this.#buildContext()))
    return this as AsyncContext<I>
  }
  extend<
    CurrentContext extends Record<string | symbol, any> = Context,
    AdditionalContext extends Record<string | symbol, any> = Record<string | symbol, any>
  >(
    context: AdditionalContext | Promise<AdditionalContext> | AsyncContext.Transformer<CurrentContext, AdditionalContext>
  ): AsyncContext<Init, LeftJoin<CurrentContext, AdditionalContext>> {

    this.#transformers.push(isTransformer(context) ? context : () => context)
    this.#resolving = undefined
    return this as AsyncContext<Init, LeftJoin<CurrentContext, AdditionalContext>>
  }
  clone() {
    return new AsyncContext(() => this.get())
  }
  async get<C = Context>(): Promise<C> {
    if (this.#transforming) throw new BlockingGetDetected({ ssf: this.get })
    if (this.#resolving) return this.#resolving
    return this.#resolving = this.#init ? this.#buildContext() : new Promise<any>(a => this.#resolvers.push(a))
  }
  async #buildContext(): Promise<Context> {
    return this.#transformers.reduce(async (p, t) => {
      try {
        this.#transforming = true
        const c = await p
        return { ...c, ...await t(c) as any }
      }
      finally {
        this.#transforming = false
      }
    }, resolveInit(this.#init!)) as Promise<Context>
  }
}
export namespace AsyncContext {
  export type Initializer<Init> = () => Init | Promise<Init>
  export type Transformer<
    CurrentContext,
    AdditionalContext
    > = (context: CurrentContext) => AdditionalContext | Promise<AdditionalContext>
}

async function resolveInit<
  Init extends Record<string | symbol, any>,
  >(init: Init | Promise<Init> | AsyncContext.Initializer<Init>): Promise<Init> {
  return isInitializer<Init>(init) ? init() : init
}

function isTransformer<
  CurrentContext,
  AdditionalContext
>(context: unknown): context is AsyncContext.Transformer<CurrentContext, AdditionalContext> {
  return typeof context === 'function'
}

function isInitializer<T>(context: unknown): context is AsyncContext.Initializer<T> {
  return typeof context === 'function'
}
