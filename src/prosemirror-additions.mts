export function registerMenuDropDowns(proseMirrorMenu, menus) {
  menus.ttbIcons = {
    title: "Through the Breach Icons",
    cssClass: "ttbIcons",
    icon: `<i class="ttb-icon-rams"></i>`,
    entries: [
      ...[
        { icon: "rams", text: "r", g: 1 },
        { icon: "crows", text: "c", g: 1 },
        { icon: "tomes", text: "t", g: 1 },
        { icon: "masks", text: "m", g: 1 },
        { icon: "plus", text: "+", g: 2 },
        { icon: "minus", text: "-", g: 2 },
        { icon: "melee", text: "1", g: 3 },
        { icon: "projectile", text: "2", g: 3 },
        { icon: "blast", text: "b", g: 3 },
        { icon: "aura", text: "a", g: 3 },
        { icon: "pulse", text: "p", g: 3 },
      ].map(({ icon, text, g: group }) => ({
        action: `insert-${icon}`,
        title: `<i class="ttb-icon-${icon}"></i>`,
        group,
        cmd: insertIcon(text),
      })),
      {
        action: "enter-icon-mode",
        title: "Write icons",
        group: 4,
        cmd: enterIconMode,
      },
      {
        action: "leave-icon-mode",
        title: "Stop writing icons",
        group: 4,
        cmd: leaveIconMode,
      },
    ],
  };

  // as simple as it claims to be, it just inserts an icon
  function insertIcon(text) {
    return function insertIconCommand(state, dispatch) {
      if (!dispatch) return true;
      // I know this looks like an ugly hack and that is because it is
      const mark = state.schema.mark("span", {
        _preserve: { class: "ttb-icon" },
      });
      dispatch(
        state.tr
          .replaceSelectionWith(state.schema.text(text, [mark]), false)
          .removeStoredMark(mark),
      );
      return true;
    };
  }

  function enterIconMode(state, dispatch) {
    if (!dispatch) return true;
    dispatch(
      state.tr.addStoredMark(
        state.schema.marks.span.create({ _preserve: { class: "ttb-icon" } }),
      ),
    );
    return true;
  }

  function leaveIconMode(state, dispatch) {
    if (!dispatch) return true;
    dispatch(
      state.tr.removeStoredMark(state.schema.marks.span).ensureMarks([]),
    );
    return true;
  }
}

// @ts-ignore
Hooks.on("getProseMirrorMenuDropDowns", registerMenuDropDowns);
