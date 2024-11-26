export const navigation = $state({
  routes: [],
  currentPathname: location.pathname
});

window.addEventListener("popstate", updatePathname);

function updatePathname() {
  navigation.currentPathname = location.pathname;
}

export function navigate(path: string) {
  history.pushState({}, "", path);
  updatePathname();
}

export { default as Route } from "./Route.svelte";