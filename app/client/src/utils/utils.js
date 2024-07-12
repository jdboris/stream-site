export const API_URL = import.meta.env.VITE_USE_EMULATORS
  ? import.meta.env.VITE_LOCAL_API_URL
  : import.meta.env.VITE_API_URL;
export async function tryOperation(
  operation,
  setErrors = (e) => {
    if (Array.isArray(e)) {
      for (let error of e) {
        console.error(error);
      }
    } else {
      console.error(e);
    }
  },
  setLoading = () => {}
) {
  try {
    setErrors([]);
    setLoading(true);
    await operation();
  } catch (e) {
    if (Array.isArray(e)) {
      for (let error of e) {
        console.error(error);
      }
    } else {
      console.error(e);
    }

    if (Array.isArray(e)) {
      setErrors(e.map((error) => error.message));
    } else {
      setErrors([e.message]);
    }
  } finally {
    setLoading(false);
  }
}

export function resetAnimations(element) {
  // NOTE: Reset the CSS animation by "triggering reflow"
  element.current.style.animation = "none";
  element.current.offsetHeight;
  element.current.style.animation = null;
}
