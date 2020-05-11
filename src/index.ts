import http, { IncomingMessage, OutgoingMessage } from 'http';

export type Middleware = (ctx: any, next: Function) => void;

export interface Context {
  request: IncomingMessage;
  response: OutgoingMessage;
}

export default class Appication {
  private middlewares: Middleware[] = [];

  private runMiddlewares(context: Context) {
    const latestIndex = this.middlewares.length - 1;
    const latestNext = async () => Promise.resolve();
    const run = (curIndex: number) => {
      const curMiddleware = this.middlewares[curIndex];
      const next: Function = curIndex === latestIndex ? latestNext : run(curIndex + 1);
      return () => curMiddleware(context, next);
    };
    return run(0)();
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  listen(port: number) {
    http
      .createServer((request: IncomingMessage, response: OutgoingMessage) => {
        const context = { request, response };
        this.runMiddlewares(context);
      })
      .listen(port);
  }
}
