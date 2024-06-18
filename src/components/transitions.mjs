export function softFade(options) {
  return {
    onEnter: (el, done) => {
      const a = el.animate(
        [
          { opacity: 0, transform: "scale(.98)", easing: "ease-out" },
          { opacity: 1, transform: "scale(1)" },
        ],
        options,
      );
      a.finished.then(done);
    },

    onExit: (el, done) => {
      const a = el.animate(
        [
          { opacity: 1, transform: "scale(1)", easing: "ease-out" },
          { opacity: 0, transform: "scale(.96)", easing: "ease-out" },
        ],
        options,
      );
      a.finished.then(done);
    },
  };
}

export function slide(options) {
  return {
    onEnter: (el, done) => {
      const a = el.animate(
        [
          { opacity: 0, transform: "translateY(-20px)", easing: "ease-out" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        options,
      );
      a.finished.then(done);
    },

    onExit: (el, done) => {
      const a = el.animate(
        [
          { opacity: 1, transform: "translateY(0)", easing: "ease-out" },
          { opacity: 0, transform: "translateY(-20px)", easing: "ease-out" },
        ],
        options,
      );
      a.finished.then(done);
    },
  };
}

export function grow(options){
  return {
    onEnter: (el, done) => {
      const height = getComputedStyle(el).height;
      const a = el.animate(
        [
          { opacity: 0, height: 0, easing: "ease-out" },
          { opacity: 1, height: height },
        ],
        options,
      );
      a.finished.then(done);
    },

    onExit: (el, done) => {
      const height = getComputedStyle(el).height;
      const a = el.animate(
        [
          { opacity: 1, height: height, easing: "ease-out" },
          { opacity: 0, height: 0 },
        ],
        options,
      );
      a.finished.then(done);
    },
  };
}
