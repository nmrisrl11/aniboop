export const SPLASH_STORAGE_KEY = "aniboop-splash-seen";

export const splashInitScript = `(()=>{try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&sessionStorage.getItem("${SPLASH_STORAGE_KEY}")!=="1"){document.documentElement.dataset.splash="active"}}catch{}})()`;
