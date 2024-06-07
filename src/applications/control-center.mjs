import SolidApplicationMixin from "./solid-application.mjs";

export default class ControlCenterApplication extends SolidApplicationMixin(
  foundry.applications.api.ApplicationV2,
) {
  static SOLID_COMPONENT_LOADER = () =>
    import("../components/control-center.jsx");
  static DEFAULT_OPTIONS = {
    id: "card-control-center",
    tag: "aside",
    window: {
      title: "ttb.ui.controlCenter",
      icon: "fa-solid fa-cards",
      resizable: true,
    },
    position: {
      width: 520,
    },
  };
}
