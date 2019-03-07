

export const emptyImg = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E'

export const onLoad = (callback) => {
  let run = () => {
    setTimeout(callback, 16);
  }
  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }
}