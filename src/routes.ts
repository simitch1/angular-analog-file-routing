import type { Type } from '@angular/core';
import type { Route } from '@angular/router';

type RouteConfigFunc = { (): Route };

type Module = {
  default: Type<any>;
  getRouteConfig: RouteConfigFunc | undefined;
};

const FILES = import.meta.glob<Module>([
  './pages/**/*.ts',
  '!./pages/**/*.config.ts',
]);

const ROUTES = Object.keys(FILES).sort((a, b) => a.length - b.length);

const routeConfigs = await ROUTES.reduce<Promise<Route[]>>(
  async (_routes: Promise<Route[]>, key: string) => {
    const routes = await _routes;
    const module = await FILES[key]();
    const routeConfig = module.getRouteConfig
      ? module.getRouteConfig() || {}
      : {};

    const route: Route = {
      loadComponent: () => module.default,
      ...routeConfig,
    };

    const segments = key
      .replace(/\.\/pages|\.(js|ts)$/g, '')
      .replace(/\[\.{3}.+\]/, '**')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .split('/')
      .filter(Boolean);

    segments.reduce((parent, segment, index) => {
      const path = segment.replace(/index|\./g, '');
      const isIndex = !path;
      const isCatchall = path === '**';
      const pathMatch = isIndex ? 'full' : undefined;
      const root = index === 0;
      const leaf = index === segments.length - 1 && segments.length > 1;
      const node = !root && !leaf;
      const insert = /^\w|\//.test(path) && !isCatchall ? 'unshift' : 'push';

      if (root) {
        const dynamic = path.startsWith(':');
        if (dynamic) return parent;

        const last = segments.length === 1;
        if (last) {
          const newRoute = { path, pathMatch, ...route };

          routes?.[insert](newRoute as Route);

          return parent;
        }
      }

      if (root || node) {
        const current = root ? routes : parent.children;
        const found = current?.find((route) => route.path === path);

        if (found) {
          found.children ??= [];
          found.pathMatch = pathMatch;
        } else
          current?.[insert]({
            path,
            pathMatch,
            children: [],
          });

        return (
          found ||
          (current?.[insert === 'unshift' ? 0 : current.length - 1] as Route)
        );
      }

      if (leaf) {
        parent?.children?.[insert]({
          path,
          pathMatch,
          ...route,
        });
      }

      return parent;
    }, {} as Route);

    return routes;
  },
  Promise.resolve([])
);

export const routes: Route[] = [...routeConfigs];
