import { Component, importProvidersFrom } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Route } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

export function getRouteConfig(): Route {
  return {
    canActivate: [() => true],
    providers: [importProvidersFrom(HttpClientModule)],
  };
}

@Component({
  template: `
    <h1>Products</h1>

    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [RouterOutlet],
})
export default class About {}
