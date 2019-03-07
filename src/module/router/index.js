import { createHashHistory, createBrowserHistory } from "history";

/**
    *  比较推荐用createBrowserHistory, 适用于现代浏览器，基于HTML5 history API
    *  createHashHistory主要是兼容老浏览器
    * */
// const history = createHashHistory({
//   hashType: "slash" // the default
// });

export const history = createBrowserHistory({
  basename: '',             // The base URL of the app (see below)
  forceRefresh: false,      // Set true to force full page refreshes
  keyLength: 6,             // The length of location.key
  // A function to use to confirm navigation with the user (see below)
  getUserConfirmation: (message, callback) => callback(window.confirm(message))
})
export default {
  init: (config) => {



    // Get the current location.
    const location = history.location;

    // Listen for changes to the current location.
    const unlisten = history.listen((location, action) => {
      // location is an object like window.location
      console.log(action, location.pathname, location.state);

      config.forEach(item => {
        if (item.path == location.pathname) {
          item.action && item.action()
        } else {
          item.unload && item.unload()
        }

      });

    });

    // history.push("/main")
    // Use push, replace, and go to navigate around.
    history.push('/main', { some: 'state' })

    // To stop listening, call the function returned from listen().
    // unlisten();
  }
}