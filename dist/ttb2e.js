var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value2) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
var __publicField = (obj, key, value2) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
  return value2;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value2) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value2);
};
var _svelteState;
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const UNOWNED = 1 << 7;
const CLEAN = 1 << 8;
const DIRTY = 1 << 9;
const MAYBE_DIRTY = 1 << 10;
const INERT = 1 << 11;
const DESTROYED = 1 << 12;
const EFFECT_RAN = 1 << 14;
const STATE_SYMBOL = Symbol("$state");
var is_array = Array.isArray;
var array_from = Array.from;
var is_frozen = Object.isFrozen;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
function equals(value2) {
  return value2 === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? (
    // eslint-disable-next-line eqeqeq
    b == b
  ) : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value2) {
  return !safe_not_equal(value2, this.v);
}
const TEMPLATE_FRAGMENT = 1;
const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
const UNINITIALIZED = Symbol();
const PassiveDelegatedEvents = ["touchstart", "touchmove", "touchend"];
// @__NO_SIDE_EFFECTS__
function source(value2) {
  const source2 = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    reactions: null,
    equals,
    v: value2,
    version: 0
  };
  return source2;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value) {
  const s = /* @__PURE__ */ source(initial_value);
  s.equals = safe_equals;
  if (current_component_context) {
    (current_component_context.d ?? (current_component_context.d = [])).push(s);
  }
  return s;
}
function set(signal, value2) {
  var initialized = signal.v !== UNINITIALIZED;
  if (!current_untracking && initialized && current_reaction !== null && is_runes() && (current_reaction.f & DERIVED) !== 0) {
    throw new Error(
      "ERR_SVELTE_UNSAFE_MUTATION"
    );
  }
  if (!signal.equals(value2)) {
    signal.v = value2;
    signal.version++;
    if (is_runes() && initialized && current_effect !== null && (current_effect.f & CLEAN) !== 0 && (current_effect.f & BRANCH_EFFECT) === 0) {
      if (current_dependencies !== null && current_dependencies.includes(signal)) {
        set_signal_status(current_effect, DIRTY);
        schedule_effect(current_effect);
      } else {
        if (current_untracked_writes === null) {
          set_current_untracked_writes([signal]);
        } else {
          current_untracked_writes.push(signal);
        }
      }
    }
    mark_reactions(signal, DIRTY, true);
  }
  return value2;
}
function create_fragment_from_html(html) {
  var elem = document.createElement("template");
  elem.innerHTML = html;
  return elem.content;
}
function remove(current) {
  if (is_array(current)) {
    for (var i = 0; i < current.length; i++) {
      var node2 = current[i];
      if (node2.isConnected) {
        node2.remove();
      }
    }
  } else if (current.isConnected) {
    current.remove();
  }
}
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn, sync) {
  var is_root = (type & ROOT_EFFECT) !== 0;
  var effect2 = {
    ctx: current_component_context,
    deps: null,
    dom: null,
    f: type | DIRTY,
    first: null,
    fn,
    last: null,
    next: null,
    parent: is_root ? null : current_effect,
    prev: null,
    teardown: null,
    transitions: null
  };
  if (current_reaction !== null && !is_root) {
    push_effect(effect2, current_reaction);
  }
  if (sync) {
    var previously_flushing_effect = is_flushing_effect;
    try {
      set_is_flushing_effect(true);
      execute_effect(effect2);
      effect2.f |= EFFECT_RAN;
    } finally {
      set_is_flushing_effect(previously_flushing_effect);
    }
  } else {
    schedule_effect(effect2);
  }
  return effect2;
}
function effect_active() {
  return current_effect ? (current_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 : false;
}
function effect_root(fn) {
  const effect2 = create_effect(ROOT_EFFECT, () => untrack(fn), true);
  return () => {
    destroy_effect(effect2);
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn, false);
}
function render_effect(fn) {
  return create_effect(RENDER_EFFECT, fn, true);
}
function branch(fn) {
  return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true);
}
function destroy_effect(effect2) {
  var _a;
  destroy_effect_children(effect2);
  remove_reactions(effect2, 0);
  set_signal_status(effect2, DESTROYED);
  if (effect2.transitions) {
    for (const transition of effect2.transitions) {
      transition.stop();
    }
  }
  (_a = effect2.teardown) == null ? void 0 : _a.call(effect2);
  if (effect2.dom !== null) {
    remove(effect2.dom);
  }
  var parent = effect2.parent;
  if (parent !== null && (effect2.f & BRANCH_EFFECT) !== 0 && parent.first !== null) {
    var previous = effect2.prev;
    var next = effect2.next;
    if (previous !== null) {
      if (next !== null) {
        previous.next = next;
        next.prev = previous;
      } else {
        previous.next = null;
        parent.last = previous;
      }
    } else if (next !== null) {
      next.prev = null;
      parent.first = next;
    } else {
      parent.first = null;
      parent.last = null;
    }
  }
  effect2.first = effect2.last = effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.dom = effect2.deps = effect2.parent = // @ts-expect-error
  effect2.fn = null;
}
let updating_derived = false;
// @__NO_SIDE_EFFECTS__
function derived(fn) {
  let flags = DERIVED | DIRTY;
  if (current_effect === null)
    flags |= UNOWNED;
  const signal = {
    deps: null,
    deriveds: null,
    equals,
    f: flags,
    first: null,
    fn,
    last: null,
    reactions: null,
    v: (
      /** @type {V} */
      null
    ),
    version: 0
  };
  if (current_reaction !== null && (current_reaction.f & DERIVED) !== 0) {
    var current_derived = (
      /** @type {import('#client').Derived<V>} */
      current_reaction
    );
    if (current_derived.deriveds === null) {
      current_derived.deriveds = [signal];
    } else {
      current_derived.deriveds.push(signal);
    }
  }
  return signal;
}
function destroy_derived_children(signal) {
  destroy_effect_children(signal);
  var deriveds = signal.deriveds;
  if (deriveds !== null) {
    signal.deriveds = null;
    for (var i = 0; i < deriveds.length; i += 1) {
      destroy_derived(deriveds[i]);
    }
  }
}
function update_derived(derived2, force_schedule) {
  var previous_updating_derived = updating_derived;
  updating_derived = true;
  destroy_derived_children(derived2);
  var value2 = execute_reaction_fn(derived2);
  updating_derived = previous_updating_derived;
  var status = (current_skip_reaction || (derived2.f & UNOWNED) !== 0) && derived2.deps !== null ? MAYBE_DIRTY : CLEAN;
  set_signal_status(derived2, status);
  if (!derived2.equals(value2)) {
    derived2.v = value2;
    mark_reactions(derived2, DIRTY, force_schedule);
  }
}
function destroy_derived(signal) {
  destroy_derived_children(signal);
  remove_reactions(signal, 0);
  set_signal_status(signal, DESTROYED);
  signal.first = signal.last = signal.deps = signal.reactions = // @ts-expect-error `signal.fn` cannot be `null` while the signal is alive
  signal.fn = null;
}
function proxy(value2, immutable = true, owners) {
  if (typeof value2 === "object" && value2 != null && !is_frozen(value2)) {
    if (STATE_SYMBOL in value2) {
      const metadata = (
        /** @type {import('#client').ProxyMetadata<T>} */
        value2[STATE_SYMBOL]
      );
      if (metadata.t === value2 || metadata.p === value2) {
        return metadata.p;
      }
    }
    const prototype = get_prototype_of(value2);
    if (prototype === object_prototype || prototype === array_prototype) {
      const proxy2 = new Proxy(value2, state_proxy_handler);
      define_property(value2, STATE_SYMBOL, {
        value: (
          /** @type {import('#client').ProxyMetadata} */
          {
            s: /* @__PURE__ */ new Map(),
            v: /* @__PURE__ */ source(0),
            a: is_array(value2),
            i: immutable,
            p: proxy2,
            t: value2
          }
        ),
        writable: true,
        enumerable: false
      });
      return proxy2;
    }
  }
  return value2;
}
function update_version(signal, d = 1) {
  set(signal, signal.v + d);
}
const state_proxy_handler = {
  defineProperty(target, prop, descriptor) {
    if (descriptor.value) {
      const metadata = target[STATE_SYMBOL];
      const s = metadata.s.get(prop);
      if (s !== void 0)
        set(s, proxy(descriptor.value, metadata.i, metadata.o));
    }
    return Reflect.defineProperty(target, prop, descriptor);
  },
  deleteProperty(target, prop) {
    const metadata = target[STATE_SYMBOL];
    const s = metadata.s.get(prop);
    const is_array2 = metadata.a;
    const boolean = delete target[prop];
    if (is_array2 && boolean) {
      const ls = metadata.s.get("length");
      const length = target.length - 1;
      if (ls !== void 0 && ls.v !== length) {
        set(ls, length);
      }
    }
    if (s !== void 0)
      set(s, UNINITIALIZED);
    if (boolean) {
      update_version(metadata.v);
    }
    return boolean;
  },
  get(target, prop, receiver) {
    var _a;
    if (prop === STATE_SYMBOL) {
      return Reflect.get(target, STATE_SYMBOL);
    }
    const metadata = target[STATE_SYMBOL];
    let s = metadata.s.get(prop);
    if (s === void 0 && (effect_active() || updating_derived) && (!(prop in target) || ((_a = get_descriptor(target, prop)) == null ? void 0 : _a.writable))) {
      s = (metadata.i ? source : mutable_source)(proxy(target[prop], metadata.i, metadata.o));
      metadata.s.set(prop, s);
    }
    if (s !== void 0) {
      const value2 = get(s);
      return value2 === UNINITIALIZED ? void 0 : value2;
    }
    return Reflect.get(target, prop, receiver);
  },
  getOwnPropertyDescriptor(target, prop) {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
    if (descriptor && "value" in descriptor) {
      const metadata = target[STATE_SYMBOL];
      const s = metadata.s.get(prop);
      if (s) {
        descriptor.value = get(s);
      }
    }
    return descriptor;
  },
  has(target, prop) {
    var _a;
    if (prop === STATE_SYMBOL) {
      return true;
    }
    const metadata = target[STATE_SYMBOL];
    const has = Reflect.has(target, prop);
    let s = metadata.s.get(prop);
    if (s !== void 0 || effect_active() && (!has || ((_a = get_descriptor(target, prop)) == null ? void 0 : _a.writable))) {
      if (s === void 0) {
        s = (metadata.i ? source : mutable_source)(
          has ? proxy(target[prop], metadata.i, metadata.o) : UNINITIALIZED
        );
        metadata.s.set(prop, s);
      }
      const value2 = get(s);
      if (value2 === UNINITIALIZED) {
        return false;
      }
    }
    return has;
  },
  set(target, prop, value2, receiver) {
    const metadata = target[STATE_SYMBOL];
    let s = metadata.s.get(prop);
    if (s === void 0 && effect_active()) {
      untrack(() => receiver[prop]);
      s = metadata.s.get(prop);
    }
    if (s !== void 0) {
      set(s, proxy(value2, metadata.i, metadata.o));
    }
    const is_array2 = metadata.a;
    const not_has = !(prop in target);
    if (is_array2 && prop === "length") {
      for (let i = value2; i < target.length; i += 1) {
        const s2 = metadata.s.get(i + "");
        if (s2 !== void 0)
          set(s2, UNINITIALIZED);
      }
    }
    target[prop] = value2;
    if (not_has) {
      if (is_array2) {
        const ls = metadata.s.get("length");
        const length = target.length;
        if (ls !== void 0 && ls.v !== length) {
          set(ls, length);
        }
      }
      update_version(metadata.v);
    }
    return true;
  },
  ownKeys(target) {
    const metadata = target[STATE_SYMBOL];
    get(metadata.v);
    return Reflect.ownKeys(target);
  }
};
function flush_tasks() {
}
const FLUSH_MICROTASK = 0;
const FLUSH_SYNC = 1;
let current_scheduler_mode = FLUSH_MICROTASK;
let is_micro_task_queued = false;
let is_flushing_effect = false;
function set_is_flushing_effect(value2) {
  is_flushing_effect = value2;
}
let current_queued_root_effects = [];
let flush_count = 0;
let current_reaction = null;
let current_effect = null;
let current_dependencies = null;
let current_dependencies_index = 0;
let current_untracked_writes = null;
function set_current_untracked_writes(value2) {
  current_untracked_writes = value2;
}
let current_untracking = false;
let current_skip_reaction = false;
let current_component_context = null;
function is_runes() {
  return current_component_context !== null && current_component_context.r;
}
function check_dirtiness(reaction) {
  var flags = reaction.f;
  if ((flags & DIRTY) !== 0) {
    return true;
  }
  if ((flags & MAYBE_DIRTY) !== 0) {
    var dependencies = reaction.deps;
    if (dependencies !== null) {
      var length = dependencies.length;
      for (var i = 0; i < length; i++) {
        var dependency = dependencies[i];
        if (check_dirtiness(
          /** @type {import('#client').Derived} */
          dependency
        )) {
          update_derived(
            /** @type {import('#client').Derived} **/
            dependency,
            true
          );
          if ((reaction.f & DIRTY) !== 0) {
            return true;
          }
        }
        var is_unowned = (flags & UNOWNED) !== 0;
        var version = dependency.version;
        if (is_unowned && version > /** @type {import('#client').Derived} */
        reaction.version) {
          reaction.version = version;
          return true;
        }
      }
    }
    set_signal_status(reaction, CLEAN);
  }
  return false;
}
function execute_reaction_fn(signal) {
  const previous_dependencies = current_dependencies;
  const previous_dependencies_index = current_dependencies_index;
  const previous_untracked_writes = current_untracked_writes;
  const previous_reaction = current_reaction;
  const previous_skip_reaction = current_skip_reaction;
  const previous_untracking = current_untracking;
  current_dependencies = /** @type {null | import('./types.js').Value[]} */
  null;
  current_dependencies_index = 0;
  current_untracked_writes = null;
  current_reaction = signal;
  current_skip_reaction = !is_flushing_effect && (signal.f & UNOWNED) !== 0;
  current_untracking = false;
  try {
    let res = signal.fn();
    let dependencies = (
      /** @type {import('./types.js').Value<unknown>[]} **/
      signal.deps
    );
    if (current_dependencies !== null) {
      let i;
      if (dependencies !== null) {
        const deps_length = dependencies.length;
        const full_current_dependencies = current_dependencies_index === 0 ? current_dependencies : dependencies.slice(0, current_dependencies_index).concat(current_dependencies);
        const current_dep_length = full_current_dependencies.length;
        const full_current_dependencies_set = current_dep_length > 16 && deps_length - current_dependencies_index > 1 ? new Set(full_current_dependencies) : null;
        for (i = current_dependencies_index; i < deps_length; i++) {
          const dependency = dependencies[i];
          if (full_current_dependencies_set !== null ? !full_current_dependencies_set.has(dependency) : !full_current_dependencies.includes(dependency)) {
            remove_reaction(signal, dependency);
          }
        }
      }
      if (dependencies !== null && current_dependencies_index > 0) {
        dependencies.length = current_dependencies_index + current_dependencies.length;
        for (i = 0; i < current_dependencies.length; i++) {
          dependencies[current_dependencies_index + i] = current_dependencies[i];
        }
      } else {
        signal.deps = /** @type {import('./types.js').Value<V>[]} **/
        dependencies = current_dependencies;
      }
      if (!current_skip_reaction) {
        for (i = current_dependencies_index; i < dependencies.length; i++) {
          const dependency = dependencies[i];
          const reactions = dependency.reactions;
          if (reactions === null) {
            dependency.reactions = [signal];
          } else if (reactions[reactions.length - 1] !== signal) {
            reactions.push(signal);
          }
        }
      }
    } else if (dependencies !== null && current_dependencies_index < dependencies.length) {
      remove_reactions(signal, current_dependencies_index);
      dependencies.length = current_dependencies_index;
    }
    return res;
  } finally {
    current_dependencies = previous_dependencies;
    current_dependencies_index = previous_dependencies_index;
    current_untracked_writes = previous_untracked_writes;
    current_reaction = previous_reaction;
    current_skip_reaction = previous_skip_reaction;
    current_untracking = previous_untracking;
  }
}
function remove_reaction(signal, dependency) {
  const reactions = dependency.reactions;
  let reactions_length = 0;
  if (reactions !== null) {
    reactions_length = reactions.length - 1;
    const index = reactions.indexOf(signal);
    if (index !== -1) {
      if (reactions_length === 0) {
        dependency.reactions = null;
      } else {
        reactions[index] = reactions[reactions_length];
        reactions.pop();
      }
    }
  }
  if (reactions_length === 0 && (dependency.f & UNOWNED) !== 0) {
    set_signal_status(dependency, DIRTY);
    remove_reactions(
      /** @type {import('./types.js').Derived} **/
      dependency,
      0
    );
  }
}
function remove_reactions(signal, start_index) {
  const dependencies = signal.deps;
  if (dependencies !== null) {
    const active_dependencies = start_index === 0 ? null : dependencies.slice(0, start_index);
    let i;
    for (i = start_index; i < dependencies.length; i++) {
      const dependency = dependencies[i];
      if (active_dependencies === null || !active_dependencies.includes(dependency)) {
        remove_reaction(signal, dependency);
      }
    }
  }
}
function destroy_effect_children(signal) {
  let effect2 = signal.first;
  signal.first = null;
  signal.last = null;
  var sibling2;
  while (effect2 !== null) {
    sibling2 = effect2.next;
    destroy_effect(effect2);
    effect2 = sibling2;
  }
}
function execute_effect(effect2) {
  var _a;
  var flags = effect2.f;
  if ((flags & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var component_context = effect2.ctx;
  var previous_effect = current_effect;
  var previous_component_context = current_component_context;
  current_effect = effect2;
  current_component_context = component_context;
  try {
    if ((flags & BLOCK_EFFECT) === 0) {
      destroy_effect_children(effect2);
    }
    (_a = effect2.teardown) == null ? void 0 : _a.call(effect2);
    var teardown = execute_reaction_fn(effect2);
    effect2.teardown = typeof teardown === "function" ? teardown : null;
  } finally {
    current_effect = previous_effect;
    current_component_context = previous_component_context;
  }
}
function infinite_loop_guard() {
  if (flush_count > 1e3) {
    flush_count = 0;
    throw new Error(
      "ERR_SVELTE_TOO_MANY_UPDATES"
    );
  }
  flush_count++;
}
function flush_queued_root_effects(root_effects) {
  for (var i = 0; i < root_effects.length; i++) {
    var signal = root_effects[i];
    flush_nested_effects(signal, RENDER_EFFECT | EFFECT);
  }
}
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0)
    return;
  infinite_loop_guard();
  for (var i = 0; i < length; i++) {
    var effect2 = effects[i];
    if ((effect2.f & (DESTROYED | INERT)) === 0 && check_dirtiness(effect2)) {
      execute_effect(effect2);
    }
  }
}
function process_microtask() {
  is_micro_task_queued = false;
  if (flush_count > 101) {
    return;
  }
  const previous_queued_root_effects = current_queued_root_effects;
  current_queued_root_effects = [];
  flush_queued_root_effects(previous_queued_root_effects);
  if (!is_micro_task_queued) {
    flush_count = 0;
  }
}
function schedule_effect(signal) {
  if (current_scheduler_mode === FLUSH_MICROTASK) {
    if (!is_micro_task_queued) {
      is_micro_task_queued = true;
      queueMicrotask(process_microtask);
    }
  }
  var effect2 = signal;
  while (effect2.parent !== null) {
    effect2 = effect2.parent;
    var flags = effect2.f;
    if ((flags & BRANCH_EFFECT) !== 0) {
      if ((flags & CLEAN) === 0)
        return;
      set_signal_status(effect2, MAYBE_DIRTY);
    }
  }
  current_queued_root_effects.push(effect2);
}
function recursively_process_effects(effect2, filter_flags, shallow, collected_user) {
  var current_child = effect2.first;
  var user = [];
  while (current_child !== null) {
    var child2 = current_child;
    current_child = child2.next;
    var flags = child2.f;
    var is_inactive = (flags & (DESTROYED | INERT)) !== 0;
    if (is_inactive)
      continue;
    var is_branch = flags & BRANCH_EFFECT;
    var is_clean = (flags & CLEAN) !== 0;
    if (is_branch) {
      if (is_clean)
        continue;
      set_signal_status(child2, CLEAN);
    }
    if ((flags & RENDER_EFFECT) !== 0) {
      if (is_branch) {
        if (shallow)
          continue;
        recursively_process_effects(child2, filter_flags, false, collected_user);
      } else {
        if (check_dirtiness(child2)) {
          execute_effect(child2);
        }
        recursively_process_effects(child2, filter_flags, false, collected_user);
      }
    } else if ((flags & EFFECT) !== 0) {
      if (is_branch || is_clean) {
        if (shallow)
          continue;
        recursively_process_effects(child2, filter_flags, false, collected_user);
      } else {
        user.push(child2);
      }
    }
  }
  if (user.length > 0) {
    if ((filter_flags & EFFECT) !== 0) {
      collected_user.push(...user);
    }
    if (!shallow) {
      for (var i = 0; i < user.length; i++) {
        recursively_process_effects(user[i], filter_flags, false, collected_user);
      }
    }
  }
}
function flush_nested_effects(effect2, filter_flags, shallow = false) {
  var user_effects = [];
  var previously_flushing_effect = is_flushing_effect;
  is_flushing_effect = true;
  try {
    if (effect2.first === null && (effect2.f & BRANCH_EFFECT) === 0) {
      flush_queued_effects([effect2]);
    } else {
      recursively_process_effects(effect2, filter_flags, shallow, user_effects);
      flush_queued_effects(user_effects);
    }
  } finally {
    is_flushing_effect = previously_flushing_effect;
  }
}
function flush_sync(fn, flush_previous = true) {
  var previous_scheduler_mode = current_scheduler_mode;
  var previous_queued_root_effects = current_queued_root_effects;
  try {
    infinite_loop_guard();
    const root_effects = [];
    current_scheduler_mode = FLUSH_SYNC;
    current_queued_root_effects = root_effects;
    if (flush_previous) {
      flush_queued_root_effects(previous_queued_root_effects);
    }
    var result2 = fn == null ? void 0 : fn();
    if (current_queued_root_effects.length > 0 || root_effects.length > 0) {
      flush_sync();
    }
    flush_tasks();
    flush_count = 0;
    return result2;
  } finally {
    current_scheduler_mode = previous_scheduler_mode;
    current_queued_root_effects = previous_queued_root_effects;
  }
}
function get(signal) {
  const flags = signal.f;
  if ((flags & DESTROYED) !== 0) {
    return signal.v;
  }
  if (current_reaction !== null && (current_reaction.f & BRANCH_EFFECT) === 0 && !current_untracking) {
    const unowned = (current_reaction.f & UNOWNED) !== 0;
    const dependencies = current_reaction.deps;
    if (current_dependencies === null && dependencies !== null && dependencies[current_dependencies_index] === signal && !(unowned && current_effect !== null)) {
      current_dependencies_index++;
    } else if (dependencies === null || current_dependencies_index === 0 || dependencies[current_dependencies_index - 1] !== signal) {
      if (current_dependencies === null) {
        current_dependencies = [signal];
      } else {
        current_dependencies.push(signal);
      }
    }
    if (current_untracked_writes !== null && current_effect !== null && (current_effect.f & CLEAN) !== 0 && (current_effect.f & BRANCH_EFFECT) === 0 && current_untracked_writes.includes(signal)) {
      set_signal_status(current_effect, DIRTY);
      schedule_effect(current_effect);
    }
  }
  if ((flags & DERIVED) !== 0 && check_dirtiness(
    /** @type {import('#client').Derived} */
    signal
  )) {
    {
      update_derived(
        /** @type {import('./types.js').Derived} **/
        signal,
        false
      );
    }
  }
  return signal.v;
}
function mark_reactions(signal, to_status, force_schedule) {
  var reactions = signal.reactions;
  if (reactions === null)
    return;
  var runes = is_runes();
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    if ((!force_schedule || !runes) && reaction === current_effect) {
      continue;
    }
    var flags = reaction.f;
    set_signal_status(reaction, to_status);
    var maybe_dirty = (flags & MAYBE_DIRTY) !== 0;
    var unowned = (flags & UNOWNED) !== 0;
    if ((flags & CLEAN) !== 0 || maybe_dirty && unowned) {
      if ((reaction.f & DERIVED) !== 0) {
        mark_reactions(
          /** @type {import('#client').Derived} */
          reaction,
          MAYBE_DIRTY,
          force_schedule
        );
      } else {
        schedule_effect(
          /** @type {import('#client').Effect} */
          reaction
        );
      }
    }
  }
}
function untrack(fn) {
  const previous_untracking = current_untracking;
  try {
    current_untracking = true;
    return fn();
  } finally {
    current_untracking = previous_untracking;
  }
}
const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function push(props, runes = false, fn) {
  current_component_context = {
    // exports (and props, if `accessors: true`)
    x: null,
    // context
    c: null,
    // effects
    e: null,
    // mounted
    m: false,
    // parent
    p: current_component_context,
    // signals
    d: null,
    // props
    s: props,
    // runes
    r: runes,
    // legacy $:
    l1: [],
    l2: /* @__PURE__ */ source(false),
    // update_callbacks
    u: null
  };
}
function pop(component) {
  const context_stack_item = current_component_context;
  if (context_stack_item !== null) {
    if (component !== void 0) {
      context_stack_item.x = component;
    }
    const effects = context_stack_item.e;
    if (effects !== null) {
      context_stack_item.e = null;
      for (let i = 0; i < effects.length; i++) {
        effect(effects[i]);
      }
    }
    current_component_context = context_stack_item.p;
    context_stack_item.m = true;
  }
  return component || /** @type {T} */
  {};
}
let hydrating = false;
var node_prototype;
var element_prototype;
var text_prototype;
var clone_node_method;
var first_child_get;
var next_sibling_get;
var class_name_set;
function init_operations() {
  if (node_prototype !== void 0) {
    return;
  }
  node_prototype = Node.prototype;
  element_prototype = Element.prototype;
  text_prototype = Text.prototype;
  node_prototype.appendChild;
  clone_node_method = node_prototype.cloneNode;
  element_prototype.__click = void 0;
  text_prototype.__nodeValue = " ";
  element_prototype.__className = "";
  element_prototype.__attributes = null;
  first_child_get = /** @type {(this: Node) => ChildNode | null} */
  // @ts-ignore
  get_descriptor(node_prototype, "firstChild").get;
  next_sibling_get = /** @type {(this: Node) => ChildNode | null} */
  // @ts-ignore
  get_descriptor(node_prototype, "nextSibling").get;
  // @ts-ignore
  get_descriptor(node_prototype, "textContent").set;
  class_name_set = /** @type {(this: Element, class_name: string) => void} */
  // @ts-ignore
  get_descriptor(element_prototype, "className").set;
}
// @__NO_SIDE_EFFECTS__
function clone_node(node2, deep) {
  return (
    /** @type {N} */
    clone_node_method.call(node2, deep)
  );
}
function empty() {
  return document.createTextNode("");
}
// @__NO_SIDE_EFFECTS__
function child(node2) {
  const child2 = first_child_get.call(node2);
  return child2;
}
// @__NO_SIDE_EFFECTS__
function sibling(node2, is_text = false) {
  const next_sibling = next_sibling_get.call(node2);
  {
    return next_sibling;
  }
}
function set_class_name(node2, class_name) {
  class_name_set.call(node2, class_name);
}
function event(event_name, dom, handler, capture, passive) {
  var options = { capture, passive };
  function target_handler(event2) {
    if (!capture) {
      handle_event_propagation(dom, event2);
    }
    if (!event2.cancelBubble) {
      return handler.call(this, event2);
    }
  }
  dom.addEventListener(event_name, target_handler, options);
  if (dom === document.body || dom === window || dom === document) {
    render_effect(() => {
      return () => {
        dom.removeEventListener(event_name, target_handler, options);
      };
    });
  }
}
function handle_event_propagation(handler_element, event2) {
  var _a;
  var owner_document = handler_element.ownerDocument;
  var event_name = event2.type;
  var path2 = ((_a = event2.composedPath) == null ? void 0 : _a.call(event2)) || [];
  var current_target = (
    /** @type {null | Element} */
    path2[0] || event2.target
  );
  if (event2.target !== current_target) {
    define_property(event2, "target", {
      configurable: true,
      value: current_target
    });
  }
  var path_idx = 0;
  var handled_at = event2.__root;
  if (handled_at) {
    var at_idx = path2.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2.__root = handler_element;
      return;
    }
    var handler_idx = path2.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx + 1;
    }
  }
  current_target = /** @type {Element} */
  path2[path_idx] || event2.target;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  while (current_target !== null) {
    var parent_element = current_target.parentNode || /** @type {any} */
    current_target.host || null;
    var internal_prop_name = "__" + event_name;
    var delegated = current_target[internal_prop_name];
    if (delegated !== void 0 && !/** @type {any} */
    current_target.disabled) {
      if (is_array(delegated)) {
        var [fn, ...data2] = delegated;
        fn.apply(current_target, [event2, ...data2]);
      } else {
        delegated.call(current_target, event2);
      }
    }
    if (event2.cancelBubble || parent_element === handler_element || current_target === handler_element) {
      break;
    }
    current_target = parent_element;
  }
  event2.__root = handler_element;
  current_target = handler_element;
}
const all_registered_events = /* @__PURE__ */ new Set();
const root_event_handles = /* @__PURE__ */ new Set();
let should_intro = true;
function mount(component, options) {
  const anchor = options.target.appendChild(empty());
  return flush_sync(() => _mount(component, { ...options, anchor }), false);
}
function _mount(Component, { target, anchor, props = (
  /** @type {Props} */
  {}
), events, context, intro = false }) {
  init_operations();
  const registered_events = /* @__PURE__ */ new Set();
  const bound_event_listener = handle_event_propagation.bind(null, target);
  const bound_document_event_listener = handle_event_propagation.bind(null, document);
  const event_handle = (events2) => {
    for (let i = 0; i < events2.length; i++) {
      const event_name = events2[i];
      if (!registered_events.has(event_name)) {
        registered_events.add(event_name);
        target.addEventListener(
          event_name,
          bound_event_listener,
          PassiveDelegatedEvents.includes(event_name) ? {
            passive: true
          } : void 0
        );
        document.addEventListener(
          event_name,
          bound_document_event_listener,
          PassiveDelegatedEvents.includes(event_name) ? {
            passive: true
          } : void 0
        );
      }
    }
  };
  event_handle(array_from(all_registered_events));
  root_event_handles.add(event_handle);
  let component = void 0;
  const unmount = effect_root(() => {
    branch(() => {
      untrack(() => {
        if (context) {
          push({});
          var ctx = (
            /** @type {import('#client').ComponentContext} */
            current_component_context
          );
          ctx.c = context;
        }
        if (events) {
          props.$$events = events;
        }
        should_intro = intro;
        component = Component(anchor, props) || {};
        should_intro = true;
        if (context) {
          pop();
        }
      });
    });
    return () => {
      for (const event_name of registered_events) {
        target.removeEventListener(event_name, bound_event_listener);
      }
      root_event_handles.delete(event_handle);
    };
  });
  mounted_components.set(component, unmount);
  return component;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function set_attribute(element, attribute, value2) {
  value2 = value2 == null ? null : value2 + "";
  var attributes = element.__attributes ?? (element.__attributes = {});
  if (attributes[attribute] === (attributes[attribute] = value2))
    return;
  if (value2 === null) {
    element.removeAttribute(attribute);
  } else {
    element.setAttribute(attribute, value2);
  }
}
function set_class(dom, value2) {
  var prev_class_name = dom.__className;
  var next_class_name = to_class(value2);
  if (prev_class_name !== next_class_name || hydrating) {
    if (value2 == null) {
      dom.removeAttribute("class");
    } else {
      set_class_name(dom, next_class_name);
    }
    dom.__className = next_class_name;
  }
}
function to_class(value2) {
  return value2 == null ? "" : value2;
}
// @__NO_SIDE_EFFECTS__
function template(content, flags) {
  var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node2;
  return () => {
    if (!node2) {
      node2 = create_fragment_from_html(content);
      if (!is_fragment)
        node2 = /** @type {Node} */
        node2.firstChild;
    }
    return use_import_node ? document.importNode(node2, true) : /* @__PURE__ */ clone_node(node2, true);
  };
}
function append(anchor, dom) {
  var current = dom;
  {
    var node2 = (
      /** @type {Node} */
      dom
    );
    if (node2.nodeType === 11) {
      current = /** @type {import('#client').Dom} */
      [...node2.childNodes];
    }
    anchor.before(node2);
  }
  current_effect.dom = current;
}
const PUBLIC_VERSION = "5";
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
var root$1 = /* @__PURE__ */ template(`<div class="tw-flex tw-flex-col"><header class="sheet-header tw-flex tw-flex-row tw-gap-2 tw-mb-3"><img data-edit="img" height="100" width="100" alt="portrait of the character"> <div class="tw-flex tw-flex-col tw-gap-2"><h1><input name="name" class="tw-text-2xl" type="text" placeholder="Name"></h1> <div class="flexrow tw-flex tw-flex-row tw-justify-between tw-gap-2"><div class="flex-1 flex tw-flex tw-flex-col tw-text-center tw-gap-1"><label for="system.health.value" class="resource-label">Wounds</label> <div class="resource-content tw-flex tw-flex-row tw-justify-between tw-items-center"><input type="text" name="system.wounds.value" data-dtype="Number"> <span class="tw-mx-2">/</span> <input type="text" name="system.wounds.max" data-dtype="Number"></div></div> <div class="flex-1 flex tw-flex tw-flex-col tw-text-center tw-gap-1"><label for="system.power.value" class="resource-label">XP</label> <div class="resource-content tw-flex tw-flex-row tw-justify-between tw-items-center"><input type="text" name="system.xp" data-dtype="Number"></div></div> <div class="flex-1 flex tw-flex tw-flex-col tw-text-center tw-gap-1"><label for="system.attributes.level.value" class="resource-label">Level</label> <div class="resource-content tw-flex tw-flex-row tw-justify-between tw-items-center"><input type="text" name="system.attributes.level.value" value="1" data-dtype="Number"></div></div></div></div></header> <nav class="sheet-tabs tabs" data-group="primary"><a class="item" data-tab="features">Features</a> <a class="item" data-tab="description">Description</a> <a class="item" data-tab="items">Items</a> <a class="item" data-tab="spells">Spells</a> <a class="item" data-tab="effects">Effects</a></nav> <main class="sheet-body"><div class="tab" data-group="primary" data-tab="features">Features <button type="button">Test</button></div> <div class="tab" data-group="primary" data-tab="description">Description</div> <div class="tab" data-group="primary" data-tab="items">Items</div> <div class="tab" data-group="primary" data-tab="spells">Spells</div> <div class="tab" data-group="primary" data-tab="effects">Effects</div></main></div>`);
function ActorSheetComponent($$anchor, $$props) {
  push($$props, true);
  let system = /* @__PURE__ */ derived(() => $$props.actor.system);
  game.cards;
  function test() {
    get(system).cards.deck.sheet.render(true);
  }
  var div = root$1();
  var header = /* @__PURE__ */ child(div);
  var img = /* @__PURE__ */ child(header);
  set_class(img, "");
  var div_1 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(img, true));
  var h1 = /* @__PURE__ */ child(div_1);
  set_class(h1, "");
  var input2 = /* @__PURE__ */ child(h1);
  var div_2 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(h1, true));
  var div_3 = /* @__PURE__ */ child(div_2);
  var label = /* @__PURE__ */ child(div_3);
  var div_4 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(label, true));
  var input_1 = /* @__PURE__ */ child(div_4);
  var span = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(input_1, true));
  var input_2 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(span, true));
  var div_5 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(div_3, true));
  var label_1 = /* @__PURE__ */ child(div_5);
  var div_6 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(label_1, true));
  var input_3 = /* @__PURE__ */ child(div_6);
  var nav = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(header, true));
  var main = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(nav, true));
  var div_9 = /* @__PURE__ */ child(main);
  var button = /* @__PURE__ */ sibling(/* @__PURE__ */ child(div_9));
  render_effect(() => {
    set_attribute(img, "src", $$props.actor.img);
    set_attribute(img, "title", $$props.actor.name);
    input2.value = $$props.actor.name;
    input_1.value = get(system).wounds.value;
    input_2.value = get(system).wounds.max;
    input_3.value = get(system).xp;
  });
  event("click", button, test, false);
  append($$anchor, div);
  pop();
}
const SYSTEM_ID = "ttb2e";
class TtbActorSheetSvelte extends ActorSheet {
  constructor(data2, options) {
    super(data2, options);
    __privateAdd(this, _svelteState, /* @__PURE__ */ source(proxy({})));
    this.svelte = null;
  }
  get svelteState() {
    return get(__privateGet(this, _svelteState));
  }
  set svelteState(value2) {
    set(__privateGet(this, _svelteState), proxy(value2));
  }
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["fated", "sheet", "actor"],
      template: `systems/${SYSTEM_ID}/templates/svelte_form.hbs`,
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features"
        }
      ]
    });
  }
  /** @override */
  getData(options = {}) {
    return { actor: this.actor };
  }
  // // Injects Svelte app when initializing HTML
  // async _injectHTML(element) {
  //     return super._injectHTML(element);
  //     // this.svelte = new ActorSheetComponent({
  //     //     target: document.body,
  //     //     props: this.getData(),
  //     // });
  // }
  //
  // // Injects Svelte app when replacing innerHTML
  // async _replaceHTML(element, html) {
  //     // TODO: fix this because Foundry code right now always expects fresh DOM to attach listeners to, which kinda sucks
  //     this.svelte.$set(this.getData());
  // }
  /** @override */
  async _render(force = false, options = {}) {
    const states = Application.RENDER_STATES;
    this._priorState = this._state;
    if ([states.CLOSING, states.RENDERING].includes(this._state))
      return;
    if (!force && this._state <= states.NONE)
      return;
    if ([states.NONE, states.CLOSED, states.ERROR].includes(this._state)) {
      console.log(`${vtt} | Rendering ${this.constructor.name}`);
    }
    this._state = states.RENDERING;
    foundry.utils.mergeObject(this.options, options, { insertKeys: false });
    options.focus ?? (options.focus = force);
    const element = this.element;
    const data2 = await this.getData(this.options);
    const inner = await this._renderInner(data2);
    let html = inner;
    if (element.length) {
      this.svelteState = data2;
      html = this.element;
    } else {
      if (this.popOut) {
        html = await this._renderOuter();
        html.find(".window-content").append(inner);
        ui.windows[this.appId] = this;
      }
      this._injectHTML(html);
      this.svelteState = data2;
      this.svelte = mount(ActorSheetComponent, {
        target: this.element.find(".svelte-container")[0],
        props: this.svelteState
      });
    }
    if (!this.popOut && this.options.resizable)
      new Draggable(this, html, false, this.options.resizable);
    const innerElement = this.element.find(".svelte-container");
    this.form = innerElement[0];
    this._activateCoreListeners(innerElement);
    this.activateListeners(innerElement);
    if (!this._minimized) {
      foundry.utils.mergeObject(this.position, options, { insertKeys: false });
      this.setPosition(this.position);
    }
    if (this.popOut && options.focus === true)
      this.maximize().then(() => this.bringToTop());
    for (let cls of this.constructor._getInheritanceChain()) {
      Hooks.callAll(`render${cls.name}`, this, html, data2);
    }
    this._state = states.RENDERED;
  }
  /** @override */
  async close(options = {}) {
    return super.close(options);
  }
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }
  _getSubmitData(updateData = {}) {
    return super._getSubmitData(updateData);
  }
}
_svelteState = new WeakMap();
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f2 = n.default;
  if (typeof f2 == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f2, arguments, this.constructor);
      }
      return f2.apply(this, arguments);
    };
    a.prototype = f2.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
const require$$0 = [
  {
    name: "nodejs",
    version: "0.2.0",
    date: "2011-08-26",
    lts: false,
    security: false,
    v8: "2.3.8.0"
  },
  {
    name: "nodejs",
    version: "0.3.0",
    date: "2011-08-26",
    lts: false,
    security: false,
    v8: "2.5.1.0"
  },
  {
    name: "nodejs",
    version: "0.4.0",
    date: "2011-08-26",
    lts: false,
    security: false,
    v8: "3.1.2.0"
  },
  {
    name: "nodejs",
    version: "0.5.0",
    date: "2011-08-26",
    lts: false,
    security: false,
    v8: "3.1.8.25"
  },
  {
    name: "nodejs",
    version: "0.6.0",
    date: "2011-11-04",
    lts: false,
    security: false,
    v8: "3.6.6.6"
  },
  {
    name: "nodejs",
    version: "0.7.0",
    date: "2012-01-17",
    lts: false,
    security: false,
    v8: "3.8.6.0"
  },
  {
    name: "nodejs",
    version: "0.8.0",
    date: "2012-06-22",
    lts: false,
    security: false,
    v8: "3.11.10.10"
  },
  {
    name: "nodejs",
    version: "0.9.0",
    date: "2012-07-20",
    lts: false,
    security: false,
    v8: "3.11.10.15"
  },
  {
    name: "nodejs",
    version: "0.10.0",
    date: "2013-03-11",
    lts: false,
    security: false,
    v8: "3.14.5.8"
  },
  {
    name: "nodejs",
    version: "0.11.0",
    date: "2013-03-28",
    lts: false,
    security: false,
    v8: "3.17.13.0"
  },
  {
    name: "nodejs",
    version: "0.12.0",
    date: "2015-02-06",
    lts: false,
    security: false,
    v8: "3.28.73.0"
  },
  {
    name: "nodejs",
    version: "4.0.0",
    date: "2015-09-08",
    lts: false,
    security: false,
    v8: "4.5.103.30"
  },
  {
    name: "nodejs",
    version: "4.1.0",
    date: "2015-09-17",
    lts: false,
    security: false,
    v8: "4.5.103.33"
  },
  {
    name: "nodejs",
    version: "4.2.0",
    date: "2015-10-12",
    lts: "Argon",
    security: false,
    v8: "4.5.103.35"
  },
  {
    name: "nodejs",
    version: "4.3.0",
    date: "2016-02-09",
    lts: "Argon",
    security: false,
    v8: "4.5.103.35"
  },
  {
    name: "nodejs",
    version: "4.4.0",
    date: "2016-03-08",
    lts: "Argon",
    security: false,
    v8: "4.5.103.35"
  },
  {
    name: "nodejs",
    version: "4.5.0",
    date: "2016-08-16",
    lts: "Argon",
    security: false,
    v8: "4.5.103.37"
  },
  {
    name: "nodejs",
    version: "4.6.0",
    date: "2016-09-27",
    lts: "Argon",
    security: true,
    v8: "4.5.103.37"
  },
  {
    name: "nodejs",
    version: "4.7.0",
    date: "2016-12-06",
    lts: "Argon",
    security: false,
    v8: "4.5.103.43"
  },
  {
    name: "nodejs",
    version: "4.8.0",
    date: "2017-02-21",
    lts: "Argon",
    security: false,
    v8: "4.5.103.45"
  },
  {
    name: "nodejs",
    version: "4.9.0",
    date: "2018-03-28",
    lts: "Argon",
    security: true,
    v8: "4.5.103.53"
  },
  {
    name: "nodejs",
    version: "5.0.0",
    date: "2015-10-29",
    lts: false,
    security: false,
    v8: "4.6.85.28"
  },
  {
    name: "nodejs",
    version: "5.1.0",
    date: "2015-11-17",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.2.0",
    date: "2015-12-09",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.3.0",
    date: "2015-12-15",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.4.0",
    date: "2016-01-06",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.5.0",
    date: "2016-01-21",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.6.0",
    date: "2016-02-09",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.7.0",
    date: "2016-02-23",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.8.0",
    date: "2016-03-09",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.9.0",
    date: "2016-03-16",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.10.0",
    date: "2016-04-01",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.11.0",
    date: "2016-04-21",
    lts: false,
    security: false,
    v8: "4.6.85.31"
  },
  {
    name: "nodejs",
    version: "5.12.0",
    date: "2016-06-23",
    lts: false,
    security: false,
    v8: "4.6.85.32"
  },
  {
    name: "nodejs",
    version: "6.0.0",
    date: "2016-04-26",
    lts: false,
    security: false,
    v8: "5.0.71.35"
  },
  {
    name: "nodejs",
    version: "6.1.0",
    date: "2016-05-05",
    lts: false,
    security: false,
    v8: "5.0.71.35"
  },
  {
    name: "nodejs",
    version: "6.2.0",
    date: "2016-05-17",
    lts: false,
    security: false,
    v8: "5.0.71.47"
  },
  {
    name: "nodejs",
    version: "6.3.0",
    date: "2016-07-06",
    lts: false,
    security: false,
    v8: "5.0.71.52"
  },
  {
    name: "nodejs",
    version: "6.4.0",
    date: "2016-08-12",
    lts: false,
    security: false,
    v8: "5.0.71.60"
  },
  {
    name: "nodejs",
    version: "6.5.0",
    date: "2016-08-26",
    lts: false,
    security: false,
    v8: "5.1.281.81"
  },
  {
    name: "nodejs",
    version: "6.6.0",
    date: "2016-09-14",
    lts: false,
    security: false,
    v8: "5.1.281.83"
  },
  {
    name: "nodejs",
    version: "6.7.0",
    date: "2016-09-27",
    lts: false,
    security: true,
    v8: "5.1.281.83"
  },
  {
    name: "nodejs",
    version: "6.8.0",
    date: "2016-10-12",
    lts: false,
    security: false,
    v8: "5.1.281.84"
  },
  {
    name: "nodejs",
    version: "6.9.0",
    date: "2016-10-18",
    lts: "Boron",
    security: false,
    v8: "5.1.281.84"
  },
  {
    name: "nodejs",
    version: "6.10.0",
    date: "2017-02-21",
    lts: "Boron",
    security: false,
    v8: "5.1.281.93"
  },
  {
    name: "nodejs",
    version: "6.11.0",
    date: "2017-06-06",
    lts: "Boron",
    security: false,
    v8: "5.1.281.102"
  },
  {
    name: "nodejs",
    version: "6.12.0",
    date: "2017-11-06",
    lts: "Boron",
    security: false,
    v8: "5.1.281.108"
  },
  {
    name: "nodejs",
    version: "6.13.0",
    date: "2018-02-10",
    lts: "Boron",
    security: false,
    v8: "5.1.281.111"
  },
  {
    name: "nodejs",
    version: "6.14.0",
    date: "2018-03-28",
    lts: "Boron",
    security: true,
    v8: "5.1.281.111"
  },
  {
    name: "nodejs",
    version: "6.15.0",
    date: "2018-11-27",
    lts: "Boron",
    security: true,
    v8: "5.1.281.111"
  },
  {
    name: "nodejs",
    version: "6.16.0",
    date: "2018-12-26",
    lts: "Boron",
    security: false,
    v8: "5.1.281.111"
  },
  {
    name: "nodejs",
    version: "6.17.0",
    date: "2019-02-28",
    lts: "Boron",
    security: true,
    v8: "5.1.281.111"
  },
  {
    name: "nodejs",
    version: "7.0.0",
    date: "2016-10-25",
    lts: false,
    security: false,
    v8: "5.4.500.36"
  },
  {
    name: "nodejs",
    version: "7.1.0",
    date: "2016-11-08",
    lts: false,
    security: false,
    v8: "5.4.500.36"
  },
  {
    name: "nodejs",
    version: "7.2.0",
    date: "2016-11-22",
    lts: false,
    security: false,
    v8: "5.4.500.43"
  },
  {
    name: "nodejs",
    version: "7.3.0",
    date: "2016-12-20",
    lts: false,
    security: false,
    v8: "5.4.500.45"
  },
  {
    name: "nodejs",
    version: "7.4.0",
    date: "2017-01-04",
    lts: false,
    security: false,
    v8: "5.4.500.45"
  },
  {
    name: "nodejs",
    version: "7.5.0",
    date: "2017-01-31",
    lts: false,
    security: false,
    v8: "5.4.500.48"
  },
  {
    name: "nodejs",
    version: "7.6.0",
    date: "2017-02-21",
    lts: false,
    security: false,
    v8: "5.5.372.40"
  },
  {
    name: "nodejs",
    version: "7.7.0",
    date: "2017-02-28",
    lts: false,
    security: false,
    v8: "5.5.372.41"
  },
  {
    name: "nodejs",
    version: "7.8.0",
    date: "2017-03-29",
    lts: false,
    security: false,
    v8: "5.5.372.43"
  },
  {
    name: "nodejs",
    version: "7.9.0",
    date: "2017-04-11",
    lts: false,
    security: false,
    v8: "5.5.372.43"
  },
  {
    name: "nodejs",
    version: "7.10.0",
    date: "2017-05-02",
    lts: false,
    security: false,
    v8: "5.5.372.43"
  },
  {
    name: "nodejs",
    version: "8.0.0",
    date: "2017-05-30",
    lts: false,
    security: false,
    v8: "5.8.283.41"
  },
  {
    name: "nodejs",
    version: "8.1.0",
    date: "2017-06-08",
    lts: false,
    security: false,
    v8: "5.8.283.41"
  },
  {
    name: "nodejs",
    version: "8.2.0",
    date: "2017-07-19",
    lts: false,
    security: false,
    v8: "5.8.283.41"
  },
  {
    name: "nodejs",
    version: "8.3.0",
    date: "2017-08-08",
    lts: false,
    security: false,
    v8: "6.0.286.52"
  },
  {
    name: "nodejs",
    version: "8.4.0",
    date: "2017-08-15",
    lts: false,
    security: false,
    v8: "6.0.286.52"
  },
  {
    name: "nodejs",
    version: "8.5.0",
    date: "2017-09-12",
    lts: false,
    security: false,
    v8: "6.0.287.53"
  },
  {
    name: "nodejs",
    version: "8.6.0",
    date: "2017-09-26",
    lts: false,
    security: false,
    v8: "6.0.287.53"
  },
  {
    name: "nodejs",
    version: "8.7.0",
    date: "2017-10-11",
    lts: false,
    security: false,
    v8: "6.1.534.42"
  },
  {
    name: "nodejs",
    version: "8.8.0",
    date: "2017-10-24",
    lts: false,
    security: false,
    v8: "6.1.534.42"
  },
  {
    name: "nodejs",
    version: "8.9.0",
    date: "2017-10-31",
    lts: "Carbon",
    security: false,
    v8: "6.1.534.46"
  },
  {
    name: "nodejs",
    version: "8.10.0",
    date: "2018-03-06",
    lts: "Carbon",
    security: false,
    v8: "6.2.414.50"
  },
  {
    name: "nodejs",
    version: "8.11.0",
    date: "2018-03-28",
    lts: "Carbon",
    security: true,
    v8: "6.2.414.50"
  },
  {
    name: "nodejs",
    version: "8.12.0",
    date: "2018-09-10",
    lts: "Carbon",
    security: false,
    v8: "6.2.414.66"
  },
  {
    name: "nodejs",
    version: "8.13.0",
    date: "2018-11-20",
    lts: "Carbon",
    security: false,
    v8: "6.2.414.72"
  },
  {
    name: "nodejs",
    version: "8.14.0",
    date: "2018-11-27",
    lts: "Carbon",
    security: true,
    v8: "6.2.414.72"
  },
  {
    name: "nodejs",
    version: "8.15.0",
    date: "2018-12-26",
    lts: "Carbon",
    security: false,
    v8: "6.2.414.75"
  },
  {
    name: "nodejs",
    version: "8.16.0",
    date: "2019-04-16",
    lts: "Carbon",
    security: false,
    v8: "6.2.414.77"
  },
  {
    name: "nodejs",
    version: "8.17.0",
    date: "2019-12-17",
    lts: "Carbon",
    security: true,
    v8: "6.2.414.78"
  },
  {
    name: "nodejs",
    version: "9.0.0",
    date: "2017-10-31",
    lts: false,
    security: false,
    v8: "6.2.414.32"
  },
  {
    name: "nodejs",
    version: "9.1.0",
    date: "2017-11-07",
    lts: false,
    security: false,
    v8: "6.2.414.32"
  },
  {
    name: "nodejs",
    version: "9.2.0",
    date: "2017-11-14",
    lts: false,
    security: false,
    v8: "6.2.414.44"
  },
  {
    name: "nodejs",
    version: "9.3.0",
    date: "2017-12-12",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.4.0",
    date: "2018-01-10",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.5.0",
    date: "2018-01-31",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.6.0",
    date: "2018-02-21",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.7.0",
    date: "2018-03-01",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.8.0",
    date: "2018-03-07",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.9.0",
    date: "2018-03-21",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.10.0",
    date: "2018-03-28",
    lts: false,
    security: true,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "9.11.0",
    date: "2018-04-04",
    lts: false,
    security: false,
    v8: "6.2.414.46"
  },
  {
    name: "nodejs",
    version: "10.0.0",
    date: "2018-04-24",
    lts: false,
    security: false,
    v8: "6.6.346.24"
  },
  {
    name: "nodejs",
    version: "10.1.0",
    date: "2018-05-08",
    lts: false,
    security: false,
    v8: "6.6.346.27"
  },
  {
    name: "nodejs",
    version: "10.2.0",
    date: "2018-05-23",
    lts: false,
    security: false,
    v8: "6.6.346.32"
  },
  {
    name: "nodejs",
    version: "10.3.0",
    date: "2018-05-29",
    lts: false,
    security: false,
    v8: "6.6.346.32"
  },
  {
    name: "nodejs",
    version: "10.4.0",
    date: "2018-06-06",
    lts: false,
    security: false,
    v8: "6.7.288.43"
  },
  {
    name: "nodejs",
    version: "10.5.0",
    date: "2018-06-20",
    lts: false,
    security: false,
    v8: "6.7.288.46"
  },
  {
    name: "nodejs",
    version: "10.6.0",
    date: "2018-07-04",
    lts: false,
    security: false,
    v8: "6.7.288.46"
  },
  {
    name: "nodejs",
    version: "10.7.0",
    date: "2018-07-18",
    lts: false,
    security: false,
    v8: "6.7.288.49"
  },
  {
    name: "nodejs",
    version: "10.8.0",
    date: "2018-08-01",
    lts: false,
    security: false,
    v8: "6.7.288.49"
  },
  {
    name: "nodejs",
    version: "10.9.0",
    date: "2018-08-15",
    lts: false,
    security: false,
    v8: "6.8.275.24"
  },
  {
    name: "nodejs",
    version: "10.10.0",
    date: "2018-09-06",
    lts: false,
    security: false,
    v8: "6.8.275.30"
  },
  {
    name: "nodejs",
    version: "10.11.0",
    date: "2018-09-19",
    lts: false,
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.12.0",
    date: "2018-10-10",
    lts: false,
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.13.0",
    date: "2018-10-30",
    lts: "Dubnium",
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.14.0",
    date: "2018-11-27",
    lts: "Dubnium",
    security: true,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.15.0",
    date: "2018-12-26",
    lts: "Dubnium",
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.16.0",
    date: "2019-05-28",
    lts: "Dubnium",
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.17.0",
    date: "2019-10-22",
    lts: "Dubnium",
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.18.0",
    date: "2019-12-17",
    lts: "Dubnium",
    security: true,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.19.0",
    date: "2020-02-05",
    lts: "Dubnium",
    security: true,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.20.0",
    date: "2020-03-26",
    lts: "Dubnium",
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.21.0",
    date: "2020-06-02",
    lts: "Dubnium",
    security: true,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.22.0",
    date: "2020-07-21",
    lts: "Dubnium",
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.23.0",
    date: "2020-10-27",
    lts: "Dubnium",
    security: false,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "10.24.0",
    date: "2021-02-23",
    lts: "Dubnium",
    security: true,
    v8: "6.8.275.32"
  },
  {
    name: "nodejs",
    version: "11.0.0",
    date: "2018-10-23",
    lts: false,
    security: false,
    v8: "7.0.276.28"
  },
  {
    name: "nodejs",
    version: "11.1.0",
    date: "2018-10-30",
    lts: false,
    security: false,
    v8: "7.0.276.32"
  },
  {
    name: "nodejs",
    version: "11.2.0",
    date: "2018-11-15",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.3.0",
    date: "2018-11-27",
    lts: false,
    security: true,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.4.0",
    date: "2018-12-07",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.5.0",
    date: "2018-12-18",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.6.0",
    date: "2018-12-26",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.7.0",
    date: "2019-01-17",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.8.0",
    date: "2019-01-24",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.9.0",
    date: "2019-01-30",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.10.0",
    date: "2019-02-14",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.11.0",
    date: "2019-03-05",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.12.0",
    date: "2019-03-14",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.13.0",
    date: "2019-03-28",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.14.0",
    date: "2019-04-10",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "11.15.0",
    date: "2019-04-30",
    lts: false,
    security: false,
    v8: "7.0.276.38"
  },
  {
    name: "nodejs",
    version: "12.0.0",
    date: "2019-04-23",
    lts: false,
    security: false,
    v8: "7.4.288.21"
  },
  {
    name: "nodejs",
    version: "12.1.0",
    date: "2019-04-29",
    lts: false,
    security: false,
    v8: "7.4.288.21"
  },
  {
    name: "nodejs",
    version: "12.2.0",
    date: "2019-05-07",
    lts: false,
    security: false,
    v8: "7.4.288.21"
  },
  {
    name: "nodejs",
    version: "12.3.0",
    date: "2019-05-21",
    lts: false,
    security: false,
    v8: "7.4.288.27"
  },
  {
    name: "nodejs",
    version: "12.4.0",
    date: "2019-06-04",
    lts: false,
    security: false,
    v8: "7.4.288.27"
  },
  {
    name: "nodejs",
    version: "12.5.0",
    date: "2019-06-26",
    lts: false,
    security: false,
    v8: "7.5.288.22"
  },
  {
    name: "nodejs",
    version: "12.6.0",
    date: "2019-07-03",
    lts: false,
    security: false,
    v8: "7.5.288.22"
  },
  {
    name: "nodejs",
    version: "12.7.0",
    date: "2019-07-23",
    lts: false,
    security: false,
    v8: "7.5.288.22"
  },
  {
    name: "nodejs",
    version: "12.8.0",
    date: "2019-08-06",
    lts: false,
    security: false,
    v8: "7.5.288.22"
  },
  {
    name: "nodejs",
    version: "12.9.0",
    date: "2019-08-20",
    lts: false,
    security: false,
    v8: "7.6.303.29"
  },
  {
    name: "nodejs",
    version: "12.10.0",
    date: "2019-09-04",
    lts: false,
    security: false,
    v8: "7.6.303.29"
  },
  {
    name: "nodejs",
    version: "12.11.0",
    date: "2019-09-25",
    lts: false,
    security: false,
    v8: "7.7.299.11"
  },
  {
    name: "nodejs",
    version: "12.12.0",
    date: "2019-10-11",
    lts: false,
    security: false,
    v8: "7.7.299.13"
  },
  {
    name: "nodejs",
    version: "12.13.0",
    date: "2019-10-21",
    lts: "Erbium",
    security: false,
    v8: "7.7.299.13"
  },
  {
    name: "nodejs",
    version: "12.14.0",
    date: "2019-12-17",
    lts: "Erbium",
    security: true,
    v8: "7.7.299.13"
  },
  {
    name: "nodejs",
    version: "12.15.0",
    date: "2020-02-05",
    lts: "Erbium",
    security: true,
    v8: "7.7.299.13"
  },
  {
    name: "nodejs",
    version: "12.16.0",
    date: "2020-02-11",
    lts: "Erbium",
    security: false,
    v8: "7.8.279.23"
  },
  {
    name: "nodejs",
    version: "12.17.0",
    date: "2020-05-26",
    lts: "Erbium",
    security: false,
    v8: "7.8.279.23"
  },
  {
    name: "nodejs",
    version: "12.18.0",
    date: "2020-06-02",
    lts: "Erbium",
    security: true,
    v8: "7.8.279.23"
  },
  {
    name: "nodejs",
    version: "12.19.0",
    date: "2020-10-06",
    lts: "Erbium",
    security: false,
    v8: "7.8.279.23"
  },
  {
    name: "nodejs",
    version: "12.20.0",
    date: "2020-11-24",
    lts: "Erbium",
    security: false,
    v8: "7.8.279.23"
  },
  {
    name: "nodejs",
    version: "12.21.0",
    date: "2021-02-23",
    lts: "Erbium",
    security: true,
    v8: "7.8.279.23"
  },
  {
    name: "nodejs",
    version: "12.22.0",
    date: "2021-03-30",
    lts: "Erbium",
    security: false,
    v8: "7.8.279.23"
  },
  {
    name: "nodejs",
    version: "13.0.0",
    date: "2019-10-22",
    lts: false,
    security: false,
    v8: "7.8.279.17"
  },
  {
    name: "nodejs",
    version: "13.1.0",
    date: "2019-11-05",
    lts: false,
    security: false,
    v8: "7.8.279.17"
  },
  {
    name: "nodejs",
    version: "13.2.0",
    date: "2019-11-21",
    lts: false,
    security: false,
    v8: "7.9.317.23"
  },
  {
    name: "nodejs",
    version: "13.3.0",
    date: "2019-12-03",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.4.0",
    date: "2019-12-17",
    lts: false,
    security: true,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.5.0",
    date: "2019-12-18",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.6.0",
    date: "2020-01-07",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.7.0",
    date: "2020-01-21",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.8.0",
    date: "2020-02-05",
    lts: false,
    security: true,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.9.0",
    date: "2020-02-18",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.10.0",
    date: "2020-03-04",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.11.0",
    date: "2020-03-12",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.12.0",
    date: "2020-03-26",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.13.0",
    date: "2020-04-14",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "13.14.0",
    date: "2020-04-29",
    lts: false,
    security: false,
    v8: "7.9.317.25"
  },
  {
    name: "nodejs",
    version: "14.0.0",
    date: "2020-04-21",
    lts: false,
    security: false,
    v8: "8.1.307.30"
  },
  {
    name: "nodejs",
    version: "14.1.0",
    date: "2020-04-29",
    lts: false,
    security: false,
    v8: "8.1.307.31"
  },
  {
    name: "nodejs",
    version: "14.2.0",
    date: "2020-05-05",
    lts: false,
    security: false,
    v8: "8.1.307.31"
  },
  {
    name: "nodejs",
    version: "14.3.0",
    date: "2020-05-19",
    lts: false,
    security: false,
    v8: "8.1.307.31"
  },
  {
    name: "nodejs",
    version: "14.4.0",
    date: "2020-06-02",
    lts: false,
    security: true,
    v8: "8.1.307.31"
  },
  {
    name: "nodejs",
    version: "14.5.0",
    date: "2020-06-30",
    lts: false,
    security: false,
    v8: "8.3.110.9"
  },
  {
    name: "nodejs",
    version: "14.6.0",
    date: "2020-07-20",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.7.0",
    date: "2020-07-29",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.8.0",
    date: "2020-08-11",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.9.0",
    date: "2020-08-27",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.10.0",
    date: "2020-09-08",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.11.0",
    date: "2020-09-15",
    lts: false,
    security: true,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.12.0",
    date: "2020-09-22",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.13.0",
    date: "2020-09-29",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.14.0",
    date: "2020-10-15",
    lts: false,
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.15.0",
    date: "2020-10-27",
    lts: "Fermium",
    security: false,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.16.0",
    date: "2021-02-23",
    lts: "Fermium",
    security: true,
    v8: "8.4.371.19"
  },
  {
    name: "nodejs",
    version: "14.17.0",
    date: "2021-05-11",
    lts: "Fermium",
    security: false,
    v8: "8.4.371.23"
  },
  {
    name: "nodejs",
    version: "14.18.0",
    date: "2021-09-28",
    lts: "Fermium",
    security: false,
    v8: "8.4.371.23"
  },
  {
    name: "nodejs",
    version: "14.19.0",
    date: "2022-02-01",
    lts: "Fermium",
    security: false,
    v8: "8.4.371.23"
  },
  {
    name: "nodejs",
    version: "14.20.0",
    date: "2022-07-07",
    lts: "Fermium",
    security: true,
    v8: "8.4.371.23"
  },
  {
    name: "nodejs",
    version: "14.21.0",
    date: "2022-11-01",
    lts: "Fermium",
    security: false,
    v8: "8.4.371.23"
  },
  {
    name: "nodejs",
    version: "15.0.0",
    date: "2020-10-20",
    lts: false,
    security: false,
    v8: "8.6.395.16"
  },
  {
    name: "nodejs",
    version: "15.1.0",
    date: "2020-11-04",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.2.0",
    date: "2020-11-10",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.3.0",
    date: "2020-11-24",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.4.0",
    date: "2020-12-09",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.5.0",
    date: "2020-12-22",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.6.0",
    date: "2021-01-14",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.7.0",
    date: "2021-01-25",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.8.0",
    date: "2021-02-02",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.9.0",
    date: "2021-02-18",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.10.0",
    date: "2021-02-23",
    lts: false,
    security: true,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.11.0",
    date: "2021-03-03",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.12.0",
    date: "2021-03-17",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.13.0",
    date: "2021-03-31",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "15.14.0",
    date: "2021-04-06",
    lts: false,
    security: false,
    v8: "8.6.395.17"
  },
  {
    name: "nodejs",
    version: "16.0.0",
    date: "2021-04-20",
    lts: false,
    security: false,
    v8: "9.0.257.17"
  },
  {
    name: "nodejs",
    version: "16.1.0",
    date: "2021-05-04",
    lts: false,
    security: false,
    v8: "9.0.257.24"
  },
  {
    name: "nodejs",
    version: "16.2.0",
    date: "2021-05-19",
    lts: false,
    security: false,
    v8: "9.0.257.25"
  },
  {
    name: "nodejs",
    version: "16.3.0",
    date: "2021-06-03",
    lts: false,
    security: false,
    v8: "9.0.257.25"
  },
  {
    name: "nodejs",
    version: "16.4.0",
    date: "2021-06-23",
    lts: false,
    security: false,
    v8: "9.1.269.36"
  },
  {
    name: "nodejs",
    version: "16.5.0",
    date: "2021-07-14",
    lts: false,
    security: false,
    v8: "9.1.269.38"
  },
  {
    name: "nodejs",
    version: "16.6.0",
    date: "2021-07-29",
    lts: false,
    security: true,
    v8: "9.2.230.21"
  },
  {
    name: "nodejs",
    version: "16.7.0",
    date: "2021-08-18",
    lts: false,
    security: false,
    v8: "9.2.230.21"
  },
  {
    name: "nodejs",
    version: "16.8.0",
    date: "2021-08-25",
    lts: false,
    security: false,
    v8: "9.2.230.21"
  },
  {
    name: "nodejs",
    version: "16.9.0",
    date: "2021-09-07",
    lts: false,
    security: false,
    v8: "9.3.345.16"
  },
  {
    name: "nodejs",
    version: "16.10.0",
    date: "2021-09-22",
    lts: false,
    security: false,
    v8: "9.3.345.19"
  },
  {
    name: "nodejs",
    version: "16.11.0",
    date: "2021-10-08",
    lts: false,
    security: false,
    v8: "9.4.146.19"
  },
  {
    name: "nodejs",
    version: "16.12.0",
    date: "2021-10-20",
    lts: false,
    security: false,
    v8: "9.4.146.19"
  },
  {
    name: "nodejs",
    version: "16.13.0",
    date: "2021-10-26",
    lts: "Gallium",
    security: false,
    v8: "9.4.146.19"
  },
  {
    name: "nodejs",
    version: "16.14.0",
    date: "2022-02-08",
    lts: "Gallium",
    security: false,
    v8: "9.4.146.24"
  },
  {
    name: "nodejs",
    version: "16.15.0",
    date: "2022-04-26",
    lts: "Gallium",
    security: false,
    v8: "9.4.146.24"
  },
  {
    name: "nodejs",
    version: "16.16.0",
    date: "2022-07-07",
    lts: "Gallium",
    security: true,
    v8: "9.4.146.24"
  },
  {
    name: "nodejs",
    version: "16.17.0",
    date: "2022-08-16",
    lts: "Gallium",
    security: false,
    v8: "9.4.146.26"
  },
  {
    name: "nodejs",
    version: "16.18.0",
    date: "2022-10-12",
    lts: "Gallium",
    security: false,
    v8: "9.4.146.26"
  },
  {
    name: "nodejs",
    version: "16.19.0",
    date: "2022-12-13",
    lts: "Gallium",
    security: false,
    v8: "9.4.146.26"
  },
  {
    name: "nodejs",
    version: "16.20.0",
    date: "2023-03-28",
    lts: "Gallium",
    security: false,
    v8: "9.4.146.26"
  },
  {
    name: "nodejs",
    version: "17.0.0",
    date: "2021-10-19",
    lts: false,
    security: false,
    v8: "9.5.172.21"
  },
  {
    name: "nodejs",
    version: "17.1.0",
    date: "2021-11-09",
    lts: false,
    security: false,
    v8: "9.5.172.25"
  },
  {
    name: "nodejs",
    version: "17.2.0",
    date: "2021-11-30",
    lts: false,
    security: false,
    v8: "9.6.180.14"
  },
  {
    name: "nodejs",
    version: "17.3.0",
    date: "2021-12-17",
    lts: false,
    security: false,
    v8: "9.6.180.15"
  },
  {
    name: "nodejs",
    version: "17.4.0",
    date: "2022-01-18",
    lts: false,
    security: false,
    v8: "9.6.180.15"
  },
  {
    name: "nodejs",
    version: "17.5.0",
    date: "2022-02-10",
    lts: false,
    security: false,
    v8: "9.6.180.15"
  },
  {
    name: "nodejs",
    version: "17.6.0",
    date: "2022-02-22",
    lts: false,
    security: false,
    v8: "9.6.180.15"
  },
  {
    name: "nodejs",
    version: "17.7.0",
    date: "2022-03-09",
    lts: false,
    security: false,
    v8: "9.6.180.15"
  },
  {
    name: "nodejs",
    version: "17.8.0",
    date: "2022-03-22",
    lts: false,
    security: false,
    v8: "9.6.180.15"
  },
  {
    name: "nodejs",
    version: "17.9.0",
    date: "2022-04-07",
    lts: false,
    security: false,
    v8: "9.6.180.15"
  },
  {
    name: "nodejs",
    version: "18.0.0",
    date: "2022-04-18",
    lts: false,
    security: false,
    v8: "10.1.124.8"
  },
  {
    name: "nodejs",
    version: "18.1.0",
    date: "2022-05-03",
    lts: false,
    security: false,
    v8: "10.1.124.8"
  },
  {
    name: "nodejs",
    version: "18.2.0",
    date: "2022-05-17",
    lts: false,
    security: false,
    v8: "10.1.124.8"
  },
  {
    name: "nodejs",
    version: "18.3.0",
    date: "2022-06-02",
    lts: false,
    security: false,
    v8: "10.2.154.4"
  },
  {
    name: "nodejs",
    version: "18.4.0",
    date: "2022-06-16",
    lts: false,
    security: false,
    v8: "10.2.154.4"
  },
  {
    name: "nodejs",
    version: "18.5.0",
    date: "2022-07-06",
    lts: false,
    security: true,
    v8: "10.2.154.4"
  },
  {
    name: "nodejs",
    version: "18.6.0",
    date: "2022-07-13",
    lts: false,
    security: false,
    v8: "10.2.154.13"
  },
  {
    name: "nodejs",
    version: "18.7.0",
    date: "2022-07-26",
    lts: false,
    security: false,
    v8: "10.2.154.13"
  },
  {
    name: "nodejs",
    version: "18.8.0",
    date: "2022-08-24",
    lts: false,
    security: false,
    v8: "10.2.154.13"
  },
  {
    name: "nodejs",
    version: "18.9.0",
    date: "2022-09-07",
    lts: false,
    security: false,
    v8: "10.2.154.15"
  },
  {
    name: "nodejs",
    version: "18.10.0",
    date: "2022-09-28",
    lts: false,
    security: false,
    v8: "10.2.154.15"
  },
  {
    name: "nodejs",
    version: "18.11.0",
    date: "2022-10-13",
    lts: false,
    security: false,
    v8: "10.2.154.15"
  },
  {
    name: "nodejs",
    version: "18.12.0",
    date: "2022-10-25",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.15"
  },
  {
    name: "nodejs",
    version: "18.13.0",
    date: "2023-01-05",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.23"
  },
  {
    name: "nodejs",
    version: "18.14.0",
    date: "2023-02-01",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.23"
  },
  {
    name: "nodejs",
    version: "18.15.0",
    date: "2023-03-05",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.26"
  },
  {
    name: "nodejs",
    version: "18.16.0",
    date: "2023-04-12",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.26"
  },
  {
    name: "nodejs",
    version: "18.17.0",
    date: "2023-07-18",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.26"
  },
  {
    name: "nodejs",
    version: "18.18.0",
    date: "2023-09-18",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.26"
  },
  {
    name: "nodejs",
    version: "18.19.0",
    date: "2023-11-29",
    lts: "Hydrogen",
    security: false,
    v8: "10.2.154.26"
  },
  {
    name: "nodejs",
    version: "19.0.0",
    date: "2022-10-17",
    lts: false,
    security: false,
    v8: "10.7.193.13"
  },
  {
    name: "nodejs",
    version: "19.1.0",
    date: "2022-11-14",
    lts: false,
    security: false,
    v8: "10.7.193.20"
  },
  {
    name: "nodejs",
    version: "19.2.0",
    date: "2022-11-29",
    lts: false,
    security: false,
    v8: "10.8.168.20"
  },
  {
    name: "nodejs",
    version: "19.3.0",
    date: "2022-12-14",
    lts: false,
    security: false,
    v8: "10.8.168.21"
  },
  {
    name: "nodejs",
    version: "19.4.0",
    date: "2023-01-05",
    lts: false,
    security: false,
    v8: "10.8.168.25"
  },
  {
    name: "nodejs",
    version: "19.5.0",
    date: "2023-01-24",
    lts: false,
    security: false,
    v8: "10.8.168.25"
  },
  {
    name: "nodejs",
    version: "19.6.0",
    date: "2023-02-01",
    lts: false,
    security: false,
    v8: "10.8.168.25"
  },
  {
    name: "nodejs",
    version: "19.7.0",
    date: "2023-02-21",
    lts: false,
    security: false,
    v8: "10.8.168.25"
  },
  {
    name: "nodejs",
    version: "19.8.0",
    date: "2023-03-14",
    lts: false,
    security: false,
    v8: "10.8.168.25"
  },
  {
    name: "nodejs",
    version: "19.9.0",
    date: "2023-04-10",
    lts: false,
    security: false,
    v8: "10.8.168.25"
  },
  {
    name: "nodejs",
    version: "20.0.0",
    date: "2023-04-17",
    lts: false,
    security: false,
    v8: "11.3.244.4"
  },
  {
    name: "nodejs",
    version: "20.1.0",
    date: "2023-05-03",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.2.0",
    date: "2023-05-16",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.3.0",
    date: "2023-06-08",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.4.0",
    date: "2023-07-04",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.5.0",
    date: "2023-07-19",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.6.0",
    date: "2023-08-23",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.7.0",
    date: "2023-09-18",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.8.0",
    date: "2023-09-28",
    lts: false,
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.9.0",
    date: "2023-10-24",
    lts: "Iron",
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "20.10.0",
    date: "2023-11-22",
    lts: "Iron",
    security: false,
    v8: "11.3.244.8"
  },
  {
    name: "nodejs",
    version: "21.0.0",
    date: "2023-10-17",
    lts: false,
    security: false,
    v8: "11.8.172.13"
  },
  {
    name: "nodejs",
    version: "21.1.0",
    date: "2023-10-24",
    lts: false,
    security: false,
    v8: "11.8.172.15"
  },
  {
    name: "nodejs",
    version: "21.2.0",
    date: "2023-11-14",
    lts: false,
    security: false,
    v8: "11.8.172.17"
  },
  {
    name: "nodejs",
    version: "21.3.0",
    date: "2023-11-30",
    lts: false,
    security: false,
    v8: "11.8.172.17"
  }
];
var agents$3 = {};
var browsers$4 = {};
var browsers$3 = { A: "ie", B: "edge", C: "firefox", D: "chrome", E: "safari", F: "opera", G: "ios_saf", H: "op_mini", I: "android", J: "bb", K: "op_mob", L: "and_chr", M: "and_ff", N: "ie_mob", O: "and_uc", P: "samsung", Q: "and_qq", R: "baidu", S: "kaios" };
browsers$4.browsers = browsers$3;
var browserVersions$1 = {};
var browserVersions = { "0": "112", "1": "113", "2": "114", "3": "115", "4": "116", "5": "117", "6": "118", "7": "119", "8": "120", "9": "121", A: "10", B: "11", C: "12", D: "7", E: "8", F: "9", G: "15", H: "80", I: "122", J: "4", K: "6", L: "13", M: "14", N: "16", O: "17", P: "18", Q: "79", R: "81", S: "83", T: "84", U: "85", V: "86", W: "87", X: "88", Y: "89", Z: "90", a: "91", b: "92", c: "93", d: "94", e: "95", f: "96", g: "97", h: "98", i: "99", j: "100", k: "101", l: "102", m: "103", n: "104", o: "105", p: "106", q: "107", r: "108", s: "123", t: "20", u: "21", v: "22", w: "23", x: "109", y: "110", z: "111", AB: "5", BB: "19", CB: "24", DB: "25", EB: "26", FB: "27", GB: "28", HB: "29", IB: "30", JB: "31", KB: "32", LB: "33", MB: "34", NB: "35", OB: "36", PB: "37", QB: "38", RB: "39", SB: "40", TB: "41", UB: "42", VB: "43", WB: "44", XB: "45", YB: "46", ZB: "47", aB: "48", bB: "49", cB: "50", dB: "51", eB: "52", fB: "53", gB: "54", hB: "55", iB: "56", jB: "57", kB: "58", lB: "60", mB: "62", nB: "63", oB: "64", pB: "65", qB: "66", rB: "67", sB: "68", tB: "69", uB: "70", vB: "71", wB: "72", xB: "73", yB: "74", zB: "75", "0B": "76", "1B": "77", "2B": "78", "3B": "11.1", "4B": "12.1", "5B": "15.5", "6B": "16.0", "7B": "17.0", "8B": "3", "9B": "59", AC: "61", BC: "82", CC: "124", DC: "125", EC: "126", FC: "3.2", GC: "10.1", HC: "15.2-15.3", IC: "15.4", JC: "16.1", KC: "16.2", LC: "16.3", MC: "16.4", NC: "16.5", OC: "17.1", PC: "17.2", QC: "17.3", RC: "17.4", SC: "11.5", TC: "4.2-4.3", UC: "5.5", VC: "2", WC: "127", XC: "3.5", YC: "3.6", ZC: "3.1", aC: "5.1", bC: "6.1", cC: "7.1", dC: "9.1", eC: "13.1", fC: "14.1", gC: "15.1", hC: "15.6", iC: "16.6", jC: "TP", kC: "9.5-9.6", lC: "10.0-10.1", mC: "10.5", nC: "10.6", oC: "11.6", pC: "4.0-4.1", qC: "5.0-5.1", rC: "6.0-6.1", sC: "7.0-7.1", tC: "8.1-8.4", uC: "9.0-9.2", vC: "9.3", wC: "10.0-10.2", xC: "10.3", yC: "11.0-11.2", zC: "11.3-11.4", "0C": "12.0-12.1", "1C": "12.2-12.5", "2C": "13.0-13.1", "3C": "13.2", "4C": "13.3", "5C": "13.4-13.7", "6C": "14.0-14.4", "7C": "14.5-14.8", "8C": "15.0-15.1", "9C": "15.6-15.8", AD: "16.6-16.7", BD: "all", CD: "2.1", DD: "2.2", ED: "2.3", FD: "4.1", GD: "4.4", HD: "4.4.3-4.4.4", ID: "5.0-5.4", JD: "6.2-6.4", KD: "7.2-7.4", LD: "8.2", MD: "9.2", ND: "11.1-11.2", OD: "12.0", PD: "13.0", QD: "14.0", RD: "15.0", SD: "18.0", TD: "19.0", UD: "14.9", VD: "13.52", WD: "2.5", XD: "3.0-3.1" };
browserVersions$1.browserVersions = browserVersions;
var agents$2 = { A: { A: { K: 0, D: 0, E: 0.0155495, F: 0.0466486, A: 0, B: 0.450937, UC: 0 }, B: "ms", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "UC", "K", "D", "E", "F", "A", "B", "", "", ""], E: "IE", F: { UC: 962323200, K: 998870400, D: 1161129600, E: 1237420800, F: 1300060800, A: 1346716800, B: 1381968e3 } }, B: { A: { "0": 7602e-6, "1": 0.015204, "2": 0.019005, "3": 0.011403, "4": 0.011403, "5": 0.015204, "6": 0.022806, "7": 0.133035, "8": 0.277473, "9": 3.58054, C: 3801e-6, L: 0, M: 3801e-6, G: 3801e-6, N: 0, O: 7602e-6, P: 0.011403, Q: 0, H: 0, R: 0, S: 0, T: 0, U: 0, V: 0, W: 0.053214, X: 0, Y: 0, Z: 0, a: 0, b: 0.011403, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0.011403, j: 0, k: 0, l: 0, m: 0, n: 0, o: 0, p: 3801e-6, q: 7602e-6, r: 7602e-6, x: 0.068418, y: 7602e-6, z: 7602e-6, I: 0.551145, s: 0 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "C", "L", "M", "G", "N", "O", "P", "Q", "H", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "I", "s", "", "", ""], E: "Edge", F: { "0": 1680825600, "1": 1683158400, "2": 1685664e3, "3": 1689897600, "4": 1692576e3, "5": 1694649600, "6": 1697155200, "7": 1698969600, "8": 1701993600, "9": 1706227200, C: 1438128e3, L: 1447286400, M: 1470096e3, G: 1491868800, N: 1508198400, O: 1525046400, P: 1542067200, Q: 1579046400, H: 1581033600, R: 1586736e3, S: 1590019200, T: 1594857600, U: 1598486400, V: 1602201600, W: 1605830400, X: 161136e4, Y: 1614816e3, Z: 1618358400, a: 1622073600, b: 1626912e3, c: 1630627200, d: 1632441600, e: 1634774400, f: 1637539200, g: 1641427200, h: 1643932800, i: 1646265600, j: 1649635200, k: 1651190400, l: 1653955200, m: 1655942400, n: 1659657600, o: 1661990400, p: 1664755200, q: 1666915200, r: 1670198400, x: 1673481600, y: 1675900800, z: 1678665600, I: 1708732800, s: 1711152e3 }, D: { C: "ms", L: "ms", M: "ms", G: "ms", N: "ms", O: "ms", P: "ms" } }, C: { A: { "0": 3801e-6, "1": 7602e-6, "2": 7602e-6, "3": 0.429513, "4": 3801e-6, "5": 0.011403, "6": 0.095025, "7": 0.110229, "8": 0.106428, "9": 0.064617, VC: 0, "8B": 0, J: 3801e-6, AB: 0, K: 0, D: 0, E: 0, F: 0, A: 0, B: 0.034209, C: 0.019005, L: 0, M: 0, G: 0, N: 0, O: 0, P: 0, BB: 0, t: 0, u: 0, v: 0, w: 0, CB: 0, DB: 0, EB: 0, FB: 0, GB: 0, HB: 0, IB: 0, JB: 0, KB: 0, LB: 0, MB: 0, NB: 0, OB: 0, PB: 0, QB: 0, RB: 0, SB: 0, TB: 0, UB: 0, VB: 7602e-6, WB: 7602e-6, XB: 3801e-6, YB: 0, ZB: 0, aB: 0, bB: 0, cB: 7602e-6, dB: 0, eB: 0.053214, fB: 7602e-6, gB: 7602e-6, hB: 3801e-6, iB: 0.019005, jB: 0, kB: 0, "9B": 3801e-6, lB: 0, AC: 0, mB: 0, nB: 0, oB: 0, pB: 0, qB: 0, rB: 0, sB: 0, tB: 0, uB: 0, vB: 0, wB: 3801e-6, xB: 0, yB: 0, zB: 0, "0B": 0, "1B": 0, "2B": 0.015204, Q: 0, H: 0, R: 0, BC: 0, S: 0, T: 0, U: 0, V: 0, W: 0, X: 0.011403, Y: 0, Z: 0, a: 7602e-6, b: 0, c: 0, d: 3801e-6, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0, k: 3801e-6, l: 0.022806, m: 0.030408, n: 0, o: 3801e-6, p: 0, q: 3801e-6, r: 3801e-6, x: 7602e-6, y: 3801e-6, z: 0, I: 1.1593, s: 0.349692, CC: 0, DC: 0, EC: 0, WC: 0, XC: 0, YC: 0 }, B: "moz", C: ["VC", "8B", "XC", "YC", "J", "AB", "K", "D", "E", "F", "A", "B", "C", "L", "M", "G", "N", "O", "P", "BB", "t", "u", "v", "w", "CB", "DB", "EB", "FB", "GB", "HB", "IB", "JB", "KB", "LB", "MB", "NB", "OB", "PB", "QB", "RB", "SB", "TB", "UB", "VB", "WB", "XB", "YB", "ZB", "aB", "bB", "cB", "dB", "eB", "fB", "gB", "hB", "iB", "jB", "kB", "9B", "lB", "AC", "mB", "nB", "oB", "pB", "qB", "rB", "sB", "tB", "uB", "vB", "wB", "xB", "yB", "zB", "0B", "1B", "2B", "Q", "H", "R", "BC", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "I", "s", "CC", "DC", "EC", "WC"], E: "Firefox", F: { "0": 1681171200, "1": 1683590400, "2": 1686009600, "3": 1688428800, "4": 1690848e3, "5": 1693267200, "6": 1695686400, "7": 1698105600, "8": 1700524800, "9": 1702944e3, VC: 1161648e3, "8B": 1213660800, XC: 124632e4, YC: 1264032e3, J: 1300752e3, AB: 1308614400, K: 1313452800, D: 1317081600, E: 1317081600, F: 1320710400, A: 1324339200, B: 1327968e3, C: 1331596800, L: 1335225600, M: 1338854400, G: 1342483200, N: 1346112e3, O: 1349740800, P: 1353628800, BB: 1357603200, t: 1361232e3, u: 1364860800, v: 1368489600, w: 1372118400, CB: 1375747200, DB: 1379376e3, EB: 1386633600, FB: 1391472e3, GB: 1395100800, HB: 1398729600, IB: 1402358400, JB: 1405987200, KB: 1409616e3, LB: 1413244800, MB: 1417392e3, NB: 1421107200, OB: 1424736e3, PB: 1428278400, QB: 1431475200, RB: 1435881600, SB: 1439251200, TB: 144288e4, UB: 1446508800, VB: 1450137600, WB: 1453852800, XB: 1457395200, YB: 1461628800, ZB: 1465257600, aB: 1470096e3, bB: 1474329600, cB: 1479168e3, dB: 1485216e3, eB: 1488844800, fB: 149256e4, gB: 1497312e3, hB: 1502150400, iB: 1506556800, jB: 1510617600, kB: 1516665600, "9B": 1520985600, lB: 1525824e3, AC: 1529971200, mB: 1536105600, nB: 1540252800, oB: 1544486400, pB: 154872e4, qB: 1552953600, rB: 1558396800, sB: 1562630400, tB: 1567468800, uB: 1571788800, vB: 1575331200, wB: 1578355200, xB: 1581379200, yB: 1583798400, zB: 1586304e3, "0B": 1588636800, "1B": 1591056e3, "2B": 1593475200, Q: 1595894400, H: 1598313600, R: 1600732800, BC: 1603152e3, S: 1605571200, T: 1607990400, U: 1611619200, V: 1614038400, W: 1616457600, X: 1618790400, Y: 1622505600, Z: 1626134400, a: 1628553600, b: 1630972800, c: 1633392e3, d: 1635811200, e: 1638835200, f: 1641859200, g: 1644364800, h: 1646697600, i: 1649116800, j: 1651536e3, k: 1653955200, l: 1656374400, m: 1658793600, n: 1661212800, o: 1663632e3, p: 1666051200, q: 1668470400, r: 1670889600, x: 1673913600, y: 1676332800, z: 1678752e3, I: 1705968e3, s: 1708387200, CC: 1710806400, DC: null, EC: null, WC: null } }, D: { A: { "0": 0.053214, "1": 0.106428, "2": 0.102627, "3": 0.057015, "4": 0.250866, "5": 0.155841, "6": 0.273672, "7": 1.10229, "8": 2.08675, "9": 13.6988, J: 0, AB: 0, K: 0, D: 0, E: 0, F: 0, A: 0, B: 0, C: 0, L: 0, M: 0, G: 0, N: 0, O: 0, P: 0, BB: 0, t: 0, u: 0, v: 0, w: 0, CB: 0, DB: 0, EB: 0, FB: 0, GB: 0, HB: 0, IB: 0, JB: 0, KB: 0, LB: 0, MB: 3801e-6, NB: 0, OB: 0, PB: 0, QB: 0.015204, RB: 0, SB: 0, TB: 0, UB: 0, VB: 0, WB: 0, XB: 0, YB: 0, ZB: 7602e-6, aB: 0.030408, bB: 0.026607, cB: 0.011403, dB: 0, eB: 0, fB: 3801e-6, gB: 3801e-6, hB: 3801e-6, iB: 0.011403, jB: 7602e-6, kB: 0, "9B": 0, lB: 0.019005, AC: 0.011403, mB: 0, nB: 3801e-6, oB: 0, pB: 3801e-6, qB: 0.026607, rB: 3801e-6, sB: 3801e-6, tB: 0.034209, uB: 0.049413, vB: 7602e-6, wB: 3801e-6, xB: 7602e-6, yB: 7602e-6, zB: 7602e-6, "0B": 7602e-6, "1B": 0.011403, "2B": 0.015204, Q: 0.11403, H: 0.015204, R: 0.030408, S: 0.03801, T: 7602e-6, U: 0.022806, V: 0.03801, W: 0.079821, X: 0.019005, Y: 0.019005, Z: 0.015204, a: 0.057015, b: 0.026607, c: 0.049413, d: 0.045612, e: 0.011403, f: 0.011403, g: 0.019005, h: 0.072219, i: 0.034209, j: 0.030408, k: 0.041811, l: 0.034209, m: 0.144438, n: 0.03801, o: 0.030408, p: 0.041811, q: 0.034209, r: 0.060816, x: 1.62303, y: 0.049413, z: 0.057015, I: 1.87769, s: 0.019005, CC: 3801e-6, DC: 0, EC: 0 }, B: "webkit", C: ["", "", "", "", "", "", "J", "AB", "K", "D", "E", "F", "A", "B", "C", "L", "M", "G", "N", "O", "P", "BB", "t", "u", "v", "w", "CB", "DB", "EB", "FB", "GB", "HB", "IB", "JB", "KB", "LB", "MB", "NB", "OB", "PB", "QB", "RB", "SB", "TB", "UB", "VB", "WB", "XB", "YB", "ZB", "aB", "bB", "cB", "dB", "eB", "fB", "gB", "hB", "iB", "jB", "kB", "9B", "lB", "AC", "mB", "nB", "oB", "pB", "qB", "rB", "sB", "tB", "uB", "vB", "wB", "xB", "yB", "zB", "0B", "1B", "2B", "Q", "H", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "I", "s", "CC", "DC", "EC"], E: "Chrome", F: { "0": 1680566400, "1": 1682985600, "2": 1685404800, "3": 1689724800, "4": 1692057600, "5": 1694476800, "6": 1696896e3, "7": 1698710400, "8": 1701993600, "9": 1705968e3, J: 1264377600, AB: 1274745600, K: 1283385600, D: 1287619200, E: 1291248e3, F: 1296777600, A: 1299542400, B: 1303862400, C: 1307404800, L: 1312243200, M: 1316131200, G: 1316131200, N: 1319500800, O: 1323734400, P: 1328659200, BB: 1332892800, t: 133704e4, u: 1340668800, v: 1343692800, w: 1348531200, CB: 1352246400, DB: 1357862400, EB: 1361404800, FB: 1364428800, GB: 1369094400, HB: 1374105600, IB: 1376956800, JB: 1384214400, KB: 1389657600, LB: 1392940800, MB: 1397001600, NB: 1400544e3, OB: 1405468800, PB: 1409011200, QB: 141264e4, RB: 1416268800, SB: 1421798400, TB: 1425513600, UB: 1429401600, VB: 143208e4, WB: 1437523200, XB: 1441152e3, YB: 1444780800, ZB: 1449014400, aB: 1453248e3, bB: 1456963200, cB: 1460592e3, dB: 1464134400, eB: 1469059200, fB: 1472601600, gB: 1476230400, hB: 1480550400, iB: 1485302400, jB: 1489017600, kB: 149256e4, "9B": 1496707200, lB: 1500940800, AC: 1504569600, mB: 1508198400, nB: 1512518400, oB: 1516752e3, pB: 1520294400, qB: 1523923200, rB: 1527552e3, sB: 1532390400, tB: 1536019200, uB: 1539648e3, vB: 1543968e3, wB: 154872e4, xB: 1552348800, yB: 1555977600, zB: 1559606400, "0B": 1564444800, "1B": 1568073600, "2B": 1571702400, Q: 1575936e3, H: 1580860800, R: 1586304e3, S: 1589846400, T: 1594684800, U: 1598313600, V: 1601942400, W: 1605571200, X: 1611014400, Y: 1614556800, Z: 1618272e3, a: 1621987200, b: 1626739200, c: 1630368e3, d: 1632268800, e: 1634601600, f: 1637020800, g: 1641340800, h: 1643673600, i: 1646092800, j: 1648512e3, k: 1650931200, l: 1653350400, m: 1655769600, n: 1659398400, o: 1661817600, p: 1664236800, q: 1666656e3, r: 166968e4, x: 1673308800, y: 1675728e3, z: 1678147200, I: 1708387200, s: 1710806400, CC: null, DC: null, EC: null } }, E: { A: { J: 0, AB: 0, K: 0, D: 0, E: 3801e-6, F: 3801e-6, A: 0, B: 0, C: 0, L: 7602e-6, M: 0.03801, G: 7602e-6, ZC: 0, FC: 0, aC: 0, bC: 0, cC: 0, dC: 7602e-6, GC: 0, "3B": 0.011403, "4B": 0.015204, eC: 0.072219, fC: 0.106428, gC: 0.030408, HC: 0.011403, IC: 0.026607, "5B": 0.041811, hC: 0.273672, "6B": 0.030408, JC: 0.060816, KC: 0.053214, LC: 0.125433, MC: 0.049413, NC: 0.083622, iC: 0.440916, "7B": 0.07602, OC: 0.243264, PC: 0.919842, QC: 0.475125, RC: 0.011403, jC: 0 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "ZC", "FC", "J", "AB", "aC", "K", "bC", "D", "cC", "E", "F", "dC", "A", "GC", "B", "3B", "C", "4B", "L", "eC", "M", "fC", "G", "gC", "HC", "IC", "5B", "hC", "6B", "JC", "KC", "LC", "MC", "NC", "iC", "7B", "OC", "PC", "QC", "RC", "jC", "", ""], E: "Safari", F: { ZC: 1205798400, FC: 1226534400, J: 1244419200, AB: 1275868800, aC: 131112e4, K: 1343174400, bC: 13824e5, D: 13824e5, cC: 1410998400, E: 1413417600, F: 1443657600, dC: 1458518400, A: 1474329600, GC: 1490572800, B: 1505779200, "3B": 1522281600, C: 1537142400, "4B": 1553472e3, L: 1568851200, eC: 1585008e3, M: 1600214400, fC: 1619395200, G: 1632096e3, gC: 1635292800, HC: 1639353600, IC: 1647216e3, "5B": 1652745600, hC: 1658275200, "6B": 1662940800, JC: 1666569600, KC: 1670889600, LC: 1674432e3, MC: 1679875200, NC: 1684368e3, iC: 1690156800, "7B": 1695686400, OC: 1698192e3, PC: 1702252800, QC: 1705881600, RC: 1709596800, jC: null } }, F: { A: { F: 0, B: 0, C: 0, G: 0, N: 0, O: 0, P: 0, BB: 0, t: 0, u: 0, v: 0, w: 0, CB: 0, DB: 0, EB: 0, FB: 0, GB: 3801e-6, HB: 0, IB: 0, JB: 0, KB: 0, LB: 0, MB: 0, NB: 0, OB: 3801e-6, PB: 0, QB: 0, RB: 0, SB: 3801e-6, TB: 0, UB: 0, VB: 0, WB: 0, XB: 0, YB: 0.015204, ZB: 0, aB: 0, bB: 0, cB: 0, dB: 0, eB: 0, fB: 0, gB: 0, hB: 0, iB: 0, jB: 0, kB: 0, lB: 0, mB: 0, nB: 0, oB: 0, pB: 0, qB: 0, rB: 0, sB: 0, tB: 0, uB: 0, vB: 0, wB: 0, xB: 0, yB: 0, zB: 0, "0B": 0, "1B": 0, "2B": 0, Q: 0, H: 0, R: 0, BC: 0, S: 0, T: 0, U: 0, V: 0, W: 0, X: 0, Y: 0, Z: 0, a: 0, b: 0, c: 0, d: 0, e: 0.045612, f: 0, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0.049413, m: 0, n: 0, o: 7602e-6, p: 0.661374, q: 0, r: 0, kC: 0, lC: 0, mC: 0, nC: 0, "3B": 0, SC: 0, oC: 0, "4B": 0 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "F", "kC", "lC", "mC", "nC", "B", "3B", "SC", "oC", "C", "4B", "G", "N", "O", "P", "BB", "t", "u", "v", "w", "CB", "DB", "EB", "FB", "GB", "HB", "IB", "JB", "KB", "LB", "MB", "NB", "OB", "PB", "QB", "RB", "SB", "TB", "UB", "VB", "WB", "XB", "YB", "ZB", "aB", "bB", "cB", "dB", "eB", "fB", "gB", "hB", "iB", "jB", "kB", "lB", "mB", "nB", "oB", "pB", "qB", "rB", "sB", "tB", "uB", "vB", "wB", "xB", "yB", "zB", "0B", "1B", "2B", "Q", "H", "R", "BC", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "", "", ""], E: "Opera", F: { F: 1150761600, kC: 1223424e3, lC: 1251763200, mC: 1267488e3, nC: 1277942400, B: 1292457600, "3B": 1302566400, SC: 1309219200, oC: 1323129600, C: 1323129600, "4B": 1352073600, G: 1372723200, N: 1377561600, O: 1381104e3, P: 1386288e3, BB: 1390867200, t: 1393891200, u: 1399334400, v: 1401753600, w: 1405987200, CB: 1409616e3, DB: 1413331200, EB: 1417132800, FB: 1422316800, GB: 1425945600, HB: 1430179200, IB: 1433808e3, JB: 1438646400, KB: 1442448e3, LB: 1445904e3, MB: 1449100800, NB: 1454371200, OB: 1457308800, PB: 146232e4, QB: 1465344e3, RB: 1470096e3, SB: 1474329600, TB: 1477267200, UB: 1481587200, VB: 1486425600, WB: 1490054400, XB: 1494374400, YB: 1498003200, ZB: 1502236800, aB: 1506470400, bB: 1510099200, cB: 1515024e3, dB: 1517961600, eB: 1521676800, fB: 1525910400, gB: 1530144e3, hB: 1534982400, iB: 1537833600, jB: 1543363200, kB: 1548201600, lB: 1554768e3, mB: 1561593600, nB: 1566259200, oB: 1570406400, pB: 1573689600, qB: 1578441600, rB: 1583971200, sB: 1587513600, tB: 1592956800, uB: 1595894400, vB: 1600128e3, wB: 1603238400, xB: 161352e4, yB: 1612224e3, zB: 1616544e3, "0B": 1619568e3, "1B": 1623715200, "2B": 1627948800, Q: 1631577600, H: 1633392e3, R: 1635984e3, BC: 1638403200, S: 1642550400, T: 1644969600, U: 1647993600, V: 1650412800, W: 1652745600, X: 1654646400, Y: 1657152e3, Z: 1660780800, a: 1663113600, b: 1668816e3, c: 1668643200, d: 1671062400, e: 1675209600, f: 1677024e3, g: 1679529600, h: 1681948800, i: 1684195200, j: 1687219200, k: 1690329600, l: 1692748800, m: 1696204800, n: 169992e4, o: 169992e4, p: 1702944e3, q: 1707264e3, r: 1710115200 }, D: { F: "o", B: "o", C: "o", kC: "o", lC: "o", mC: "o", nC: "o", "3B": "o", SC: "o", oC: "o", "4B": "o" } }, G: { A: { E: 0, FC: 0, pC: 0, TC: 293537e-8, qC: 293537e-8, rC: 880612e-8, sC: 0.0102738, tC: 146769e-8, uC: 733843e-8, vC: 0.0352245, wC: 587075e-8, xC: 0.0587075, yC: 0.0264184, zC: 0.0190799, "0C": 0.0102738, "1C": 0.265651, "2C": 440306e-8, "3C": 0.0425629, "4C": 0.0132092, "5C": 0.0572398, "6C": 0.121818, "7C": 0.15851, "8C": 0.0675136, HC: 0.0792551, IC: 0.0895289, "5B": 0.118883, "9C": 0.978947, "6B": 0.25391, JC: 0.540109, KC: 0.250974, LC: 0.457918, MC: 0.102738, NC: 0.214282, AD: 1.65702, "7B": 0.237765, OC: 0.725037, PC: 5.42163, QC: 2.54497, RC: 0.0733843 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "FC", "pC", "TC", "qC", "rC", "sC", "E", "tC", "uC", "vC", "wC", "xC", "yC", "zC", "0C", "1C", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "HC", "IC", "5B", "9C", "6B", "JC", "KC", "LC", "MC", "NC", "AD", "7B", "OC", "PC", "QC", "RC", "", "", ""], E: "Safari on iOS", F: { FC: 1270252800, pC: 1283904e3, TC: 1299628800, qC: 1331078400, rC: 1359331200, sC: 1394409600, E: 1410912e3, tC: 1413763200, uC: 1442361600, vC: 1458518400, wC: 1473724800, xC: 1490572800, yC: 1505779200, zC: 1522281600, "0C": 1537142400, "1C": 1553472e3, "2C": 1568851200, "3C": 1572220800, "4C": 1580169600, "5C": 1585008e3, "6C": 1600214400, "7C": 1619395200, "8C": 1632096e3, HC: 1639353600, IC: 1647216e3, "5B": 1652659200, "9C": 1658275200, "6B": 1662940800, JC: 1666569600, KC: 1670889600, LC: 1674432e3, MC: 1679875200, NC: 1684368e3, AD: 1690156800, "7B": 1694995200, OC: 1698192e3, PC: 1702252800, QC: 1705881600, RC: 1709596800 } }, H: { A: { BD: 0.09 }, B: "o", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "BD", "", "", ""], E: "Opera Mini", F: { BD: 1426464e3 } }, I: { A: { "8B": 0, J: 582612e-10, I: 0.580223, CD: 0, DD: 582612e-10, ED: 0, FD: 582612e-10, TC: 349567e-9, GD: 0, HD: 139827e-8 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "CD", "DD", "ED", "8B", "J", "FD", "TC", "GD", "HD", "I", "", "", ""], E: "Android Browser", F: { CD: 1256515200, DD: 1274313600, ED: 1291593600, "8B": 1298332800, J: 1318896e3, FD: 1341792e3, TC: 1374624e3, GD: 1386547200, HD: 1401667200, I: 1709078400 } }, J: { A: { D: 0, A: 0 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "D", "A", "", "", ""], E: "Blackberry Browser", F: { D: 1325376e3, A: 1359504e3 } }, K: { A: { A: 0, B: 0, C: 0, H: 1.23017, "3B": 0, SC: 0, "4B": 0 }, B: "o", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "A", "B", "3B", "SC", "C", "4B", "H", "", "", ""], E: "Opera Mobile", F: { A: 1287100800, B: 1300752e3, "3B": 1314835200, SC: 1318291200, C: 1330300800, "4B": 1349740800, H: 1709769600 }, D: { H: "webkit" } }, L: { A: { I: 42.4244 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "I", "", "", ""], E: "Chrome for Android", F: { I: 1709078400 } }, M: { A: { s: 0.291306 }, B: "moz", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "s", "", "", ""], E: "Firefox for Android", F: { s: 1708387200 } }, N: { A: { A: 0, B: 0 }, B: "ms", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "A", "B", "", "", ""], E: "IE Mobile", F: { A: 1340150400, B: 1353456e3 } }, O: { A: { "5B": 0.818136 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "5B", "", "", ""], E: "UC Browser for Android", F: { "5B": 1710115200 }, D: { "5B": "webkit" } }, P: { A: { J: 0.13981, t: 0.0322639, u: 0.0752824, v: 0.0860371, w: 2.04338, ID: 0.0107546, JD: 0, KD: 0.0537732, LD: 0, MD: 0, GC: 0, ND: 0.0107546, OD: 0, PD: 0.0107546, QD: 0, RD: 0, "6B": 0.0107546, "7B": 0.0322639, SD: 0.0215093, TD: 0.0430185 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "J", "ID", "JD", "KD", "LD", "MD", "GC", "ND", "OD", "PD", "QD", "RD", "6B", "7B", "SD", "TD", "t", "u", "v", "w", "", "", ""], E: "Samsung Internet", F: { J: 1461024e3, ID: 1481846400, JD: 1509408e3, KD: 1528329600, LD: 1546128e3, MD: 1554163200, GC: 1567900800, ND: 1582588800, OD: 1593475200, PD: 1605657600, QD: 1618531200, RD: 1629072e3, "6B": 1640736e3, "7B": 1651708800, SD: 1659657600, TD: 1667260800, t: 1677369600, u: 1684454400, v: 1689292800, w: 1697587200 } }, Q: { A: { UD: 0.241722 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "UD", "", "", ""], E: "QQ Browser", F: { UD: 1710288e3 } }, R: { A: { VD: 0 }, B: "webkit", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "VD", "", "", ""], E: "Baidu Browser", F: { VD: 1710201600 } }, S: { A: { WD: 0.086772, XD: 0 }, B: "moz", C: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "WD", "XD", "", "", ""], E: "KaiOS Browser", F: { WD: 1527811200, XD: 1631664e3 } } };
const browsers$2 = browsers$4.browsers;
const versions$2 = browserVersions$1.browserVersions;
const agentsData = agents$2;
function unpackBrowserVersions(versionsData) {
  return Object.keys(versionsData).reduce((usage, version) => {
    usage[versions$2[version]] = versionsData[version];
    return usage;
  }, {});
}
agents$3.agents = Object.keys(agentsData).reduce((map, key) => {
  let versionsData = agentsData[key];
  map[browsers$2[key]] = Object.keys(versionsData).reduce((data2, entry) => {
    if (entry === "A") {
      data2.usage_global = unpackBrowserVersions(versionsData[entry]);
    } else if (entry === "C") {
      data2.versions = versionsData[entry].reduce((list2, version) => {
        if (version === "") {
          list2.push(null);
        } else {
          list2.push(versions$2[version]);
        }
        return list2;
      }, []);
    } else if (entry === "D") {
      data2.prefix_exceptions = unpackBrowserVersions(versionsData[entry]);
    } else if (entry === "E") {
      data2.browser = versionsData[entry];
    } else if (entry === "F") {
      data2.release_date = Object.keys(versionsData[entry]).reduce(
        (map2, key2) => {
          map2[versions$2[key2]] = versionsData[entry][key2];
          return map2;
        },
        {}
      );
    } else {
      data2.prefix = versionsData[entry];
    }
    return data2;
  }, {});
  return map;
}, {});
const v4 = {
  start: "2015-09-08",
  lts: "2015-10-12",
  maintenance: "2017-04-01",
  end: "2018-04-30",
  codename: "Argon"
};
const v5 = {
  start: "2015-10-29",
  maintenance: "2016-04-30",
  end: "2016-06-30"
};
const v6 = {
  start: "2016-04-26",
  lts: "2016-10-18",
  maintenance: "2018-04-30",
  end: "2019-04-30",
  codename: "Boron"
};
const v7 = {
  start: "2016-10-25",
  maintenance: "2017-04-30",
  end: "2017-06-30"
};
const v8 = {
  start: "2017-05-30",
  lts: "2017-10-31",
  maintenance: "2019-01-01",
  end: "2019-12-31",
  codename: "Carbon"
};
const v9 = {
  start: "2017-10-01",
  maintenance: "2018-04-01",
  end: "2018-06-30"
};
const v10 = {
  start: "2018-04-24",
  lts: "2018-10-30",
  maintenance: "2020-05-19",
  end: "2021-04-30",
  codename: "Dubnium"
};
const v11 = {
  start: "2018-10-23",
  maintenance: "2019-04-22",
  end: "2019-06-01"
};
const v12 = {
  start: "2019-04-23",
  lts: "2019-10-21",
  maintenance: "2020-11-30",
  end: "2022-04-30",
  codename: "Erbium"
};
const v13 = {
  start: "2019-10-22",
  maintenance: "2020-04-01",
  end: "2020-06-01"
};
const v14 = {
  start: "2020-04-21",
  lts: "2020-10-27",
  maintenance: "2021-10-19",
  end: "2023-04-30",
  codename: "Fermium"
};
const v15 = {
  start: "2020-10-20",
  maintenance: "2021-04-01",
  end: "2021-06-01"
};
const v16 = {
  start: "2021-04-20",
  lts: "2021-10-26",
  maintenance: "2022-10-18",
  end: "2023-09-11",
  codename: "Gallium"
};
const v17 = {
  start: "2021-10-19",
  maintenance: "2022-04-01",
  end: "2022-06-01"
};
const v18 = {
  start: "2022-04-19",
  lts: "2022-10-25",
  maintenance: "2023-10-18",
  end: "2025-04-30",
  codename: "Hydrogen"
};
const v19 = {
  start: "2022-10-18",
  maintenance: "2023-04-01",
  end: "2023-06-01"
};
const v20 = {
  start: "2023-04-18",
  lts: "2023-10-24",
  maintenance: "2024-10-22",
  end: "2026-04-30",
  codename: "Iron"
};
const v21 = {
  start: "2023-10-17",
  maintenance: "2024-04-01",
  end: "2024-06-01"
};
const v22 = {
  start: "2024-04-23",
  lts: "2024-10-29",
  maintenance: "2025-10-21",
  end: "2027-04-30",
  codename: ""
};
const v23 = {
  start: "2024-10-15",
  maintenance: "2025-04-01",
  end: "2025-06-01"
};
const v24 = {
  start: "2025-04-22",
  lts: "2025-10-28",
  maintenance: "2026-10-20",
  end: "2028-04-30",
  codename: ""
};
const require$$2$1 = {
  "v0.8": {
    start: "2012-06-25",
    end: "2014-07-31"
  },
  "v0.10": {
    start: "2013-03-11",
    end: "2016-10-31"
  },
  "v0.12": {
    start: "2015-02-06",
    end: "2016-12-31"
  },
  v4,
  v5,
  v6,
  v7,
  v8,
  v9,
  v10,
  v11,
  v12,
  v13,
  v14,
  v15,
  v16,
  v17,
  v18,
  v19,
  v20,
  v21,
  v22,
  v23,
  v24
};
const __viteBrowserExternal = {};
const __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: __viteBrowserExternal
}, Symbol.toStringTag, { value: "Module" }));
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
var versions$1 = {
  "0.20": "39",
  "0.21": "41",
  "0.22": "41",
  "0.23": "41",
  "0.24": "41",
  "0.25": "42",
  "0.26": "42",
  "0.27": "43",
  "0.28": "43",
  "0.29": "43",
  "0.30": "44",
  "0.31": "45",
  "0.32": "45",
  "0.33": "45",
  "0.34": "45",
  "0.35": "45",
  "0.36": "47",
  "0.37": "49",
  "1.0": "49",
  "1.1": "50",
  "1.2": "51",
  "1.3": "52",
  "1.4": "53",
  "1.5": "54",
  "1.6": "56",
  "1.7": "58",
  "1.8": "59",
  "2.0": "61",
  "2.1": "61",
  "3.0": "66",
  "3.1": "66",
  "4.0": "69",
  "4.1": "69",
  "4.2": "69",
  "5.0": "73",
  "6.0": "76",
  "6.1": "76",
  "7.0": "78",
  "7.1": "78",
  "7.2": "78",
  "7.3": "78",
  "8.0": "80",
  "8.1": "80",
  "8.2": "80",
  "8.3": "80",
  "8.4": "80",
  "8.5": "80",
  "9.0": "83",
  "9.1": "83",
  "9.2": "83",
  "9.3": "83",
  "9.4": "83",
  "10.0": "85",
  "10.1": "85",
  "10.2": "85",
  "10.3": "85",
  "10.4": "85",
  "11.0": "87",
  "11.1": "87",
  "11.2": "87",
  "11.3": "87",
  "11.4": "87",
  "11.5": "87",
  "12.0": "89",
  "12.1": "89",
  "12.2": "89",
  "13.0": "91",
  "13.1": "91",
  "13.2": "91",
  "13.3": "91",
  "13.4": "91",
  "13.5": "91",
  "13.6": "91",
  "14.0": "93",
  "14.1": "93",
  "14.2": "93",
  "15.0": "94",
  "15.1": "94",
  "15.2": "94",
  "15.3": "94",
  "15.4": "94",
  "15.5": "94",
  "16.0": "96",
  "16.1": "96",
  "16.2": "96",
  "17.0": "98",
  "17.1": "98",
  "17.2": "98",
  "17.3": "98",
  "17.4": "98",
  "18.0": "100",
  "18.1": "100",
  "18.2": "100",
  "18.3": "100",
  "19.0": "102",
  "19.1": "102",
  "20.0": "104",
  "20.1": "104",
  "20.2": "104",
  "20.3": "104",
  "21.0": "106",
  "21.1": "106",
  "21.2": "106",
  "21.3": "106",
  "21.4": "106",
  "22.0": "108",
  "22.1": "108",
  "22.2": "108",
  "22.3": "108",
  "23.0": "110",
  "23.1": "110",
  "23.2": "110",
  "23.3": "110",
  "24.0": "112",
  "24.1": "112",
  "24.2": "112",
  "24.3": "112",
  "24.4": "112",
  "24.5": "112",
  "24.6": "112",
  "24.7": "112",
  "24.8": "112",
  "25.0": "114",
  "25.1": "114",
  "25.2": "114",
  "25.3": "114",
  "25.4": "114",
  "25.5": "114",
  "25.6": "114",
  "25.7": "114",
  "25.8": "114",
  "25.9": "114",
  "26.0": "116",
  "26.1": "116",
  "26.2": "116",
  "26.3": "116",
  "26.4": "116",
  "26.5": "116",
  "26.6": "116",
  "27.0": "118",
  "27.1": "118",
  "27.2": "118",
  "27.3": "118",
  "28.0": "120",
  "28.1": "120",
  "28.2": "120",
  "29.0": "122",
  "29.1": "122",
  "30.0": "124"
};
function BrowserslistError$2(message) {
  this.name = "BrowserslistError";
  this.message = message;
  this.browserslist = true;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, BrowserslistError$2);
  }
}
BrowserslistError$2.prototype = Error.prototype;
var error = BrowserslistError$2;
var AND_REGEXP = /^\s+and\s+(.*)/i;
var OR_REGEXP = /^(?:,\s*|\s+or\s+)(.*)/i;
function flatten(array) {
  if (!Array.isArray(array))
    return [array];
  return array.reduce(function(a, b) {
    return a.concat(flatten(b));
  }, []);
}
function find(string, predicate) {
  for (var n = 1, max = string.length; n <= max; n++) {
    var parsed = string.substr(-n, n);
    if (predicate(parsed, n, max)) {
      return string.slice(0, -n);
    }
  }
  return "";
}
function matchQuery(all, query) {
  var node2 = { query };
  if (query.indexOf("not ") === 0) {
    node2.not = true;
    query = query.slice(4);
  }
  for (var name2 in all) {
    var type = all[name2];
    var match = query.match(type.regexp);
    if (match) {
      node2.type = name2;
      for (var i = 0; i < type.matches.length; i++) {
        node2[type.matches[i]] = match[i + 1];
      }
      return node2;
    }
  }
  node2.type = "unknown";
  return node2;
}
function matchBlock(all, string, qs) {
  var node2;
  return find(string, function(parsed, n, max) {
    if (AND_REGEXP.test(parsed)) {
      node2 = matchQuery(all, parsed.match(AND_REGEXP)[1]);
      node2.compose = "and";
      qs.unshift(node2);
      return true;
    } else if (OR_REGEXP.test(parsed)) {
      node2 = matchQuery(all, parsed.match(OR_REGEXP)[1]);
      node2.compose = "or";
      qs.unshift(node2);
      return true;
    } else if (n === max) {
      node2 = matchQuery(all, parsed.trim());
      node2.compose = "or";
      qs.unshift(node2);
      return true;
    }
    return false;
  });
}
var parse$9 = function parse(all, queries) {
  if (!Array.isArray(queries))
    queries = [queries];
  return flatten(
    queries.map(function(block) {
      var qs = [];
      do {
        block = matchBlock(all, block, qs);
      } while (block);
      return qs;
    })
  );
};
var BrowserslistError$1 = error;
function noop() {
}
var browser = {
  loadQueries: function loadQueries() {
    throw new BrowserslistError$1(
      "Sharable configs are not supported in client-side build of Browserslist"
    );
  },
  getStat: function getStat(opts) {
    return opts.stats;
  },
  loadConfig: function loadConfig(opts) {
    if (opts.config) {
      throw new BrowserslistError$1(
        "Browserslist config are not supported in client-side build"
      );
    }
  },
  loadCountry: function loadCountry() {
    throw new BrowserslistError$1(
      "Country statistics are not supported in client-side build of Browserslist"
    );
  },
  loadFeature: function loadFeature() {
    throw new BrowserslistError$1(
      "Supports queries are not available in client-side build of Browserslist"
    );
  },
  currentNode: function currentNode(resolve2, context) {
    return resolve2(["maintained node versions"], context)[0];
  },
  parseConfig: noop,
  readConfig: noop,
  findConfig: noop,
  clearCaches: noop,
  oldDataWarning: noop,
  env: {}
};
var jsReleases = require$$0;
var agents$1 = agents$3.agents;
var jsEOL = require$$2$1;
var path = require$$2;
var e2c = versions$1;
var BrowserslistError = error;
var parse$8 = parse$9;
var env = browser;
var YEAR = 365.259641 * 24 * 60 * 60 * 1e3;
var ANDROID_EVERGREEN_FIRST = "37";
var OP_MOB_BLINK_FIRST = 14;
function isVersionsMatch(versionA, versionB) {
  return (versionA + ".").indexOf(versionB + ".") === 0;
}
function isEolReleased(name2) {
  var version = name2.slice(1);
  return browserslist$2.nodeVersions.some(function(i) {
    return isVersionsMatch(i, version);
  });
}
function normalize(versions2) {
  return versions2.filter(function(version) {
    return typeof version === "string";
  });
}
function normalizeElectron(version) {
  var versionToUse = version;
  if (version.split(".").length === 3) {
    versionToUse = version.split(".").slice(0, -1).join(".");
  }
  return versionToUse;
}
function nameMapper(name2) {
  return function mapName(version) {
    return name2 + " " + version;
  };
}
function getMajor(version) {
  return parseInt(version.split(".")[0]);
}
function getMajorVersions(released, number) {
  if (released.length === 0)
    return [];
  var majorVersions = uniq$1(released.map(getMajor));
  var minimum = majorVersions[majorVersions.length - number];
  if (!minimum) {
    return released;
  }
  var selected = [];
  for (var i = released.length - 1; i >= 0; i--) {
    if (minimum > getMajor(released[i]))
      break;
    selected.unshift(released[i]);
  }
  return selected;
}
function uniq$1(array) {
  var filtered = [];
  for (var i = 0; i < array.length; i++) {
    if (filtered.indexOf(array[i]) === -1)
      filtered.push(array[i]);
  }
  return filtered;
}
function fillUsage(result2, name2, data2) {
  for (var i in data2) {
    result2[name2 + " " + i] = data2[i];
  }
}
function generateFilter(sign, version) {
  version = parseFloat(version);
  if (sign === ">") {
    return function(v) {
      return parseFloat(v) > version;
    };
  } else if (sign === ">=") {
    return function(v) {
      return parseFloat(v) >= version;
    };
  } else if (sign === "<") {
    return function(v) {
      return parseFloat(v) < version;
    };
  } else {
    return function(v) {
      return parseFloat(v) <= version;
    };
  }
}
function generateSemverFilter(sign, version) {
  version = version.split(".").map(parseSimpleInt);
  version[1] = version[1] || 0;
  version[2] = version[2] || 0;
  if (sign === ">") {
    return function(v) {
      v = v.split(".").map(parseSimpleInt);
      return compareSemver(v, version) > 0;
    };
  } else if (sign === ">=") {
    return function(v) {
      v = v.split(".").map(parseSimpleInt);
      return compareSemver(v, version) >= 0;
    };
  } else if (sign === "<") {
    return function(v) {
      v = v.split(".").map(parseSimpleInt);
      return compareSemver(version, v) > 0;
    };
  } else {
    return function(v) {
      v = v.split(".").map(parseSimpleInt);
      return compareSemver(version, v) >= 0;
    };
  }
}
function parseSimpleInt(x2) {
  return parseInt(x2);
}
function compare(a, b) {
  if (a < b)
    return -1;
  if (a > b)
    return 1;
  return 0;
}
function compareSemver(a, b) {
  return compare(parseInt(a[0]), parseInt(b[0])) || compare(parseInt(a[1] || "0"), parseInt(b[1] || "0")) || compare(parseInt(a[2] || "0"), parseInt(b[2] || "0"));
}
function semverFilterLoose(operator, range2) {
  range2 = range2.split(".").map(parseSimpleInt);
  if (typeof range2[1] === "undefined") {
    range2[1] = "x";
  }
  switch (operator) {
    case "<=":
      return function(version) {
        version = version.split(".").map(parseSimpleInt);
        return compareSemverLoose(version, range2) <= 0;
      };
    case ">=":
    default:
      return function(version) {
        version = version.split(".").map(parseSimpleInt);
        return compareSemverLoose(version, range2) >= 0;
      };
  }
}
function compareSemverLoose(version, range2) {
  if (version[0] !== range2[0]) {
    return version[0] < range2[0] ? -1 : 1;
  }
  if (range2[1] === "x") {
    return 0;
  }
  if (version[1] !== range2[1]) {
    return version[1] < range2[1] ? -1 : 1;
  }
  return 0;
}
function resolveVersion(data2, version) {
  if (data2.versions.indexOf(version) !== -1) {
    return version;
  } else if (browserslist$2.versionAliases[data2.name][version]) {
    return browserslist$2.versionAliases[data2.name][version];
  } else {
    return false;
  }
}
function normalizeVersion(data2, version) {
  var resolved = resolveVersion(data2, version);
  if (resolved) {
    return resolved;
  } else if (data2.versions.length === 1) {
    return data2.versions[0];
  } else {
    return false;
  }
}
function filterByYear(since, context) {
  since = since / 1e3;
  return Object.keys(agents$1).reduce(function(selected, name2) {
    var data2 = byName(name2, context);
    if (!data2)
      return selected;
    var versions2 = Object.keys(data2.releaseDate).filter(function(v) {
      var date = data2.releaseDate[v];
      return date !== null && date >= since;
    });
    return selected.concat(versions2.map(nameMapper(data2.name)));
  }, []);
}
function cloneData(data2) {
  return {
    name: data2.name,
    versions: data2.versions,
    released: data2.released,
    releaseDate: data2.releaseDate
  };
}
function byName(name2, context) {
  name2 = name2.toLowerCase();
  name2 = browserslist$2.aliases[name2] || name2;
  if (context.mobileToDesktop && browserslist$2.desktopNames[name2]) {
    var desktop = browserslist$2.data[browserslist$2.desktopNames[name2]];
    if (name2 === "android") {
      return normalizeAndroidData(cloneData(browserslist$2.data[name2]), desktop);
    } else {
      var cloned = cloneData(desktop);
      cloned.name = name2;
      return cloned;
    }
  }
  return browserslist$2.data[name2];
}
function normalizeAndroidVersions(androidVersions, chromeVersions) {
  var iFirstEvergreen = chromeVersions.indexOf(ANDROID_EVERGREEN_FIRST);
  return androidVersions.filter(function(version) {
    return /^(?:[2-4]\.|[34]$)/.test(version);
  }).concat(chromeVersions.slice(iFirstEvergreen));
}
function copyObject(obj) {
  var copy = {};
  for (var key in obj) {
    copy[key] = obj[key];
  }
  return copy;
}
function normalizeAndroidData(android, chrome) {
  android.released = normalizeAndroidVersions(android.released, chrome.released);
  android.versions = normalizeAndroidVersions(android.versions, chrome.versions);
  android.releaseDate = copyObject(android.releaseDate);
  android.released.forEach(function(v) {
    if (android.releaseDate[v] === void 0) {
      android.releaseDate[v] = chrome.releaseDate[v];
    }
  });
  return android;
}
function checkName(name2, context) {
  var data2 = byName(name2, context);
  if (!data2)
    throw new BrowserslistError("Unknown browser " + name2);
  return data2;
}
function unknownQuery(query) {
  return new BrowserslistError(
    "Unknown browser query `" + query + "`. Maybe you are using old Browserslist or made typo in query."
  );
}
function filterJumps(list2, name2, nVersions, context) {
  var jump = 1;
  switch (name2) {
    case "android":
      if (context.mobileToDesktop)
        return list2;
      var released = browserslist$2.data.chrome.released;
      jump = released.length - released.indexOf(ANDROID_EVERGREEN_FIRST);
      break;
    case "op_mob":
      var latest = browserslist$2.data.op_mob.released.slice(-1)[0];
      jump = getMajor(latest) - OP_MOB_BLINK_FIRST + 1;
      break;
    default:
      return list2;
  }
  if (nVersions <= jump) {
    return list2.slice(-1);
  }
  return list2.slice(jump - 1 - nVersions);
}
function isSupported(flags, withPartial) {
  return typeof flags === "string" && (flags.indexOf("y") >= 0 || withPartial && flags.indexOf("a") >= 0);
}
function resolve$2(queries, context) {
  return parse$8(QUERIES, queries).reduce(function(result2, node2, index) {
    if (node2.not && index === 0) {
      throw new BrowserslistError(
        "Write any browsers query (for instance, `defaults`) before `" + node2.query + "`"
      );
    }
    var type = QUERIES[node2.type];
    var array = type.select.call(browserslist$2, context, node2).map(function(j) {
      var parts = j.split(" ");
      if (parts[1] === "0") {
        return parts[0] + " " + byName(parts[0], context).versions[0];
      } else {
        return j;
      }
    });
    if (node2.compose === "and") {
      if (node2.not) {
        return result2.filter(function(j) {
          return array.indexOf(j) === -1;
        });
      } else {
        return result2.filter(function(j) {
          return array.indexOf(j) !== -1;
        });
      }
    } else {
      if (node2.not) {
        var filter2 = {};
        array.forEach(function(j) {
          filter2[j] = true;
        });
        return result2.filter(function(j) {
          return !filter2[j];
        });
      }
      return result2.concat(array);
    }
  }, []);
}
function prepareOpts(opts) {
  if (typeof opts === "undefined")
    opts = {};
  if (typeof opts.path === "undefined") {
    opts.path = path.resolve ? path.resolve(".") : ".";
  }
  return opts;
}
function prepareQueries(queries, opts) {
  if (typeof queries === "undefined" || queries === null) {
    var config = browserslist$2.loadConfig(opts);
    if (config) {
      queries = config;
    } else {
      queries = browserslist$2.defaults;
    }
  }
  return queries;
}
function checkQueries(queries) {
  if (!(typeof queries === "string" || Array.isArray(queries))) {
    throw new BrowserslistError(
      "Browser queries must be an array or string. Got " + typeof queries + "."
    );
  }
}
var cache = {};
function browserslist$2(queries, opts) {
  opts = prepareOpts(opts);
  queries = prepareQueries(queries, opts);
  checkQueries(queries);
  var context = {
    ignoreUnknownVersions: opts.ignoreUnknownVersions,
    dangerousExtend: opts.dangerousExtend,
    mobileToDesktop: opts.mobileToDesktop,
    path: opts.path,
    env: opts.env
  };
  env.oldDataWarning(browserslist$2.data);
  var stats = env.getStat(opts, browserslist$2.data);
  if (stats) {
    context.customUsage = {};
    for (var browser2 in stats) {
      fillUsage(context.customUsage, browser2, stats[browser2]);
    }
  }
  var cacheKey = JSON.stringify([queries, context]);
  if (cache[cacheKey])
    return cache[cacheKey];
  var result2 = uniq$1(resolve$2(queries, context)).sort(function(name1, name2) {
    name1 = name1.split(" ");
    name2 = name2.split(" ");
    if (name1[0] === name2[0]) {
      var version1 = name1[1].split("-")[0];
      var version2 = name2[1].split("-")[0];
      return compareSemver(version2.split("."), version1.split("."));
    } else {
      return compare(name1[0], name2[0]);
    }
  });
  if (!env.env.BROWSERSLIST_DISABLE_CACHE) {
    cache[cacheKey] = result2;
  }
  return result2;
}
browserslist$2.parse = function(queries, opts) {
  opts = prepareOpts(opts);
  queries = prepareQueries(queries, opts);
  checkQueries(queries);
  return parse$8(QUERIES, queries);
};
browserslist$2.cache = {};
browserslist$2.data = {};
browserslist$2.usage = {
  global: {},
  custom: null
};
browserslist$2.defaults = ["> 0.5%", "last 2 versions", "Firefox ESR", "not dead"];
browserslist$2.aliases = {
  fx: "firefox",
  ff: "firefox",
  ios: "ios_saf",
  explorer: "ie",
  blackberry: "bb",
  explorermobile: "ie_mob",
  operamini: "op_mini",
  operamobile: "op_mob",
  chromeandroid: "and_chr",
  firefoxandroid: "and_ff",
  ucandroid: "and_uc",
  qqandroid: "and_qq"
};
browserslist$2.desktopNames = {
  and_chr: "chrome",
  and_ff: "firefox",
  ie_mob: "ie",
  android: "chrome"
  // has extra processing logic
};
browserslist$2.versionAliases = {};
browserslist$2.clearCaches = env.clearCaches;
browserslist$2.parseConfig = env.parseConfig;
browserslist$2.readConfig = env.readConfig;
browserslist$2.findConfig = env.findConfig;
browserslist$2.loadConfig = env.loadConfig;
browserslist$2.coverage = function(browsers2, stats) {
  var data2;
  if (typeof stats === "undefined") {
    data2 = browserslist$2.usage.global;
  } else if (stats === "my stats") {
    var opts = {};
    opts.path = path.resolve ? path.resolve(".") : ".";
    var customStats = env.getStat(opts);
    if (!customStats) {
      throw new BrowserslistError("Custom usage statistics was not provided");
    }
    data2 = {};
    for (var browser2 in customStats) {
      fillUsage(data2, browser2, customStats[browser2]);
    }
  } else if (typeof stats === "string") {
    if (stats.length > 2) {
      stats = stats.toLowerCase();
    } else {
      stats = stats.toUpperCase();
    }
    env.loadCountry(browserslist$2.usage, stats, browserslist$2.data);
    data2 = browserslist$2.usage[stats];
  } else {
    if ("dataByBrowser" in stats) {
      stats = stats.dataByBrowser;
    }
    data2 = {};
    for (var name2 in stats) {
      for (var version in stats[name2]) {
        data2[name2 + " " + version] = stats[name2][version];
      }
    }
  }
  return browsers2.reduce(function(all, i) {
    var usage = data2[i];
    if (usage === void 0) {
      usage = data2[i.replace(/ \S+$/, " 0")];
    }
    return all + (usage || 0);
  }, 0);
};
function nodeQuery(context, node2) {
  var matched = browserslist$2.nodeVersions.filter(function(i) {
    return isVersionsMatch(i, node2.version);
  });
  if (matched.length === 0) {
    if (context.ignoreUnknownVersions) {
      return [];
    } else {
      throw new BrowserslistError(
        "Unknown version " + node2.version + " of Node.js"
      );
    }
  }
  return ["node " + matched[matched.length - 1]];
}
function sinceQuery(context, node2) {
  var year = parseInt(node2.year);
  var month = parseInt(node2.month || "01") - 1;
  var day = parseInt(node2.day || "01");
  return filterByYear(Date.UTC(year, month, day, 0, 0, 0), context);
}
function coverQuery(context, node2) {
  var coverage = parseFloat(node2.coverage);
  var usage = browserslist$2.usage.global;
  if (node2.place) {
    if (node2.place.match(/^my\s+stats$/i)) {
      if (!context.customUsage) {
        throw new BrowserslistError("Custom usage statistics was not provided");
      }
      usage = context.customUsage;
    } else {
      var place;
      if (node2.place.length === 2) {
        place = node2.place.toUpperCase();
      } else {
        place = node2.place.toLowerCase();
      }
      env.loadCountry(browserslist$2.usage, place, browserslist$2.data);
      usage = browserslist$2.usage[place];
    }
  }
  var versions2 = Object.keys(usage).sort(function(a, b) {
    return usage[b] - usage[a];
  });
  var coveraged = 0;
  var result2 = [];
  var version;
  for (var i = 0; i < versions2.length; i++) {
    version = versions2[i];
    if (usage[version] === 0)
      break;
    coveraged += usage[version];
    result2.push(version);
    if (coveraged >= coverage)
      break;
  }
  return result2;
}
var QUERIES = {
  last_major_versions: {
    matches: ["versions"],
    regexp: /^last\s+(\d+)\s+major\s+versions?$/i,
    select: function(context, node2) {
      return Object.keys(agents$1).reduce(function(selected, name2) {
        var data2 = byName(name2, context);
        if (!data2)
          return selected;
        var list2 = getMajorVersions(data2.released, node2.versions);
        list2 = list2.map(nameMapper(data2.name));
        list2 = filterJumps(list2, data2.name, node2.versions, context);
        return selected.concat(list2);
      }, []);
    }
  },
  last_versions: {
    matches: ["versions"],
    regexp: /^last\s+(\d+)\s+versions?$/i,
    select: function(context, node2) {
      return Object.keys(agents$1).reduce(function(selected, name2) {
        var data2 = byName(name2, context);
        if (!data2)
          return selected;
        var list2 = data2.released.slice(-node2.versions);
        list2 = list2.map(nameMapper(data2.name));
        list2 = filterJumps(list2, data2.name, node2.versions, context);
        return selected.concat(list2);
      }, []);
    }
  },
  last_electron_major_versions: {
    matches: ["versions"],
    regexp: /^last\s+(\d+)\s+electron\s+major\s+versions?$/i,
    select: function(context, node2) {
      var validVersions = getMajorVersions(Object.keys(e2c), node2.versions);
      return validVersions.map(function(i) {
        return "chrome " + e2c[i];
      });
    }
  },
  last_node_major_versions: {
    matches: ["versions"],
    regexp: /^last\s+(\d+)\s+node\s+major\s+versions?$/i,
    select: function(context, node2) {
      return getMajorVersions(browserslist$2.nodeVersions, node2.versions).map(
        function(version) {
          return "node " + version;
        }
      );
    }
  },
  last_browser_major_versions: {
    matches: ["versions", "browser"],
    regexp: /^last\s+(\d+)\s+(\w+)\s+major\s+versions?$/i,
    select: function(context, node2) {
      var data2 = checkName(node2.browser, context);
      var validVersions = getMajorVersions(data2.released, node2.versions);
      var list2 = validVersions.map(nameMapper(data2.name));
      list2 = filterJumps(list2, data2.name, node2.versions, context);
      return list2;
    }
  },
  last_electron_versions: {
    matches: ["versions"],
    regexp: /^last\s+(\d+)\s+electron\s+versions?$/i,
    select: function(context, node2) {
      return Object.keys(e2c).slice(-node2.versions).map(function(i) {
        return "chrome " + e2c[i];
      });
    }
  },
  last_node_versions: {
    matches: ["versions"],
    regexp: /^last\s+(\d+)\s+node\s+versions?$/i,
    select: function(context, node2) {
      return browserslist$2.nodeVersions.slice(-node2.versions).map(function(version) {
        return "node " + version;
      });
    }
  },
  last_browser_versions: {
    matches: ["versions", "browser"],
    regexp: /^last\s+(\d+)\s+(\w+)\s+versions?$/i,
    select: function(context, node2) {
      var data2 = checkName(node2.browser, context);
      var list2 = data2.released.slice(-node2.versions).map(nameMapper(data2.name));
      list2 = filterJumps(list2, data2.name, node2.versions, context);
      return list2;
    }
  },
  unreleased_versions: {
    matches: [],
    regexp: /^unreleased\s+versions$/i,
    select: function(context) {
      return Object.keys(agents$1).reduce(function(selected, name2) {
        var data2 = byName(name2, context);
        if (!data2)
          return selected;
        var list2 = data2.versions.filter(function(v) {
          return data2.released.indexOf(v) === -1;
        });
        list2 = list2.map(nameMapper(data2.name));
        return selected.concat(list2);
      }, []);
    }
  },
  unreleased_electron_versions: {
    matches: [],
    regexp: /^unreleased\s+electron\s+versions?$/i,
    select: function() {
      return [];
    }
  },
  unreleased_browser_versions: {
    matches: ["browser"],
    regexp: /^unreleased\s+(\w+)\s+versions?$/i,
    select: function(context, node2) {
      var data2 = checkName(node2.browser, context);
      return data2.versions.filter(function(v) {
        return data2.released.indexOf(v) === -1;
      }).map(nameMapper(data2.name));
    }
  },
  last_years: {
    matches: ["years"],
    regexp: /^last\s+(\d*.?\d+)\s+years?$/i,
    select: function(context, node2) {
      return filterByYear(Date.now() - YEAR * node2.years, context);
    }
  },
  since_y: {
    matches: ["year"],
    regexp: /^since (\d+)$/i,
    select: sinceQuery
  },
  since_y_m: {
    matches: ["year", "month"],
    regexp: /^since (\d+)-(\d+)$/i,
    select: sinceQuery
  },
  since_y_m_d: {
    matches: ["year", "month", "day"],
    regexp: /^since (\d+)-(\d+)-(\d+)$/i,
    select: sinceQuery
  },
  popularity: {
    matches: ["sign", "popularity"],
    regexp: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%$/,
    select: function(context, node2) {
      var popularity = parseFloat(node2.popularity);
      var usage = browserslist$2.usage.global;
      return Object.keys(usage).reduce(function(result2, version) {
        if (node2.sign === ">") {
          if (usage[version] > popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<") {
          if (usage[version] < popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<=") {
          if (usage[version] <= popularity) {
            result2.push(version);
          }
        } else if (usage[version] >= popularity) {
          result2.push(version);
        }
        return result2;
      }, []);
    }
  },
  popularity_in_my_stats: {
    matches: ["sign", "popularity"],
    regexp: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%\s+in\s+my\s+stats$/,
    select: function(context, node2) {
      var popularity = parseFloat(node2.popularity);
      if (!context.customUsage) {
        throw new BrowserslistError("Custom usage statistics was not provided");
      }
      var usage = context.customUsage;
      return Object.keys(usage).reduce(function(result2, version) {
        var percentage = usage[version];
        if (percentage == null) {
          return result2;
        }
        if (node2.sign === ">") {
          if (percentage > popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<") {
          if (percentage < popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<=") {
          if (percentage <= popularity) {
            result2.push(version);
          }
        } else if (percentage >= popularity) {
          result2.push(version);
        }
        return result2;
      }, []);
    }
  },
  popularity_in_config_stats: {
    matches: ["sign", "popularity", "config"],
    regexp: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%\s+in\s+(\S+)\s+stats$/,
    select: function(context, node2) {
      var popularity = parseFloat(node2.popularity);
      var stats = env.loadStat(context, node2.config, browserslist$2.data);
      if (stats) {
        context.customUsage = {};
        for (var browser2 in stats) {
          fillUsage(context.customUsage, browser2, stats[browser2]);
        }
      }
      if (!context.customUsage) {
        throw new BrowserslistError("Custom usage statistics was not provided");
      }
      var usage = context.customUsage;
      return Object.keys(usage).reduce(function(result2, version) {
        var percentage = usage[version];
        if (percentage == null) {
          return result2;
        }
        if (node2.sign === ">") {
          if (percentage > popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<") {
          if (percentage < popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<=") {
          if (percentage <= popularity) {
            result2.push(version);
          }
        } else if (percentage >= popularity) {
          result2.push(version);
        }
        return result2;
      }, []);
    }
  },
  popularity_in_place: {
    matches: ["sign", "popularity", "place"],
    regexp: /^(>=?|<=?)\s*(\d+|\d+\.\d+|\.\d+)%\s+in\s+((alt-)?\w\w)$/,
    select: function(context, node2) {
      var popularity = parseFloat(node2.popularity);
      var place = node2.place;
      if (place.length === 2) {
        place = place.toUpperCase();
      } else {
        place = place.toLowerCase();
      }
      env.loadCountry(browserslist$2.usage, place, browserslist$2.data);
      var usage = browserslist$2.usage[place];
      return Object.keys(usage).reduce(function(result2, version) {
        var percentage = usage[version];
        if (percentage == null) {
          return result2;
        }
        if (node2.sign === ">") {
          if (percentage > popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<") {
          if (percentage < popularity) {
            result2.push(version);
          }
        } else if (node2.sign === "<=") {
          if (percentage <= popularity) {
            result2.push(version);
          }
        } else if (percentage >= popularity) {
          result2.push(version);
        }
        return result2;
      }, []);
    }
  },
  cover: {
    matches: ["coverage"],
    regexp: /^cover\s+(\d+|\d+\.\d+|\.\d+)%$/i,
    select: coverQuery
  },
  cover_in: {
    matches: ["coverage", "place"],
    regexp: /^cover\s+(\d+|\d+\.\d+|\.\d+)%\s+in\s+(my\s+stats|(alt-)?\w\w)$/i,
    select: coverQuery
  },
  supports: {
    matches: ["supportType", "feature"],
    regexp: /^(?:(fully|partially)\s+)?supports\s+([\w-]+)$/,
    select: function(context, node2) {
      env.loadFeature(browserslist$2.cache, node2.feature);
      var withPartial = node2.supportType !== "fully";
      var features = browserslist$2.cache[node2.feature];
      var result2 = [];
      for (var name2 in features) {
        var data2 = byName(name2, context);
        var checkDesktop = context.mobileToDesktop && name2 in browserslist$2.desktopNames && isSupported(features[name2][data2.released.slice(-1)[0]], withPartial);
        data2.versions.forEach(function(version) {
          var flags = features[name2][version];
          if (flags === void 0 && checkDesktop) {
            flags = features[browserslist$2.desktopNames[name2]][version];
          }
          if (isSupported(flags, withPartial)) {
            result2.push(name2 + " " + version);
          }
        });
      }
      return result2;
    }
  },
  electron_range: {
    matches: ["from", "to"],
    regexp: /^electron\s+([\d.]+)\s*-\s*([\d.]+)$/i,
    select: function(context, node2) {
      var fromToUse = normalizeElectron(node2.from);
      var toToUse = normalizeElectron(node2.to);
      var from = parseFloat(node2.from);
      var to = parseFloat(node2.to);
      if (!e2c[fromToUse]) {
        throw new BrowserslistError("Unknown version " + from + " of electron");
      }
      if (!e2c[toToUse]) {
        throw new BrowserslistError("Unknown version " + to + " of electron");
      }
      return Object.keys(e2c).filter(function(i) {
        var parsed = parseFloat(i);
        return parsed >= from && parsed <= to;
      }).map(function(i) {
        return "chrome " + e2c[i];
      });
    }
  },
  node_range: {
    matches: ["from", "to"],
    regexp: /^node\s+([\d.]+)\s*-\s*([\d.]+)$/i,
    select: function(context, node2) {
      return browserslist$2.nodeVersions.filter(semverFilterLoose(">=", node2.from)).filter(semverFilterLoose("<=", node2.to)).map(function(v) {
        return "node " + v;
      });
    }
  },
  browser_range: {
    matches: ["browser", "from", "to"],
    regexp: /^(\w+)\s+([\d.]+)\s*-\s*([\d.]+)$/i,
    select: function(context, node2) {
      var data2 = checkName(node2.browser, context);
      var from = parseFloat(normalizeVersion(data2, node2.from) || node2.from);
      var to = parseFloat(normalizeVersion(data2, node2.to) || node2.to);
      function filter2(v) {
        var parsed = parseFloat(v);
        return parsed >= from && parsed <= to;
      }
      return data2.released.filter(filter2).map(nameMapper(data2.name));
    }
  },
  electron_ray: {
    matches: ["sign", "version"],
    regexp: /^electron\s*(>=?|<=?)\s*([\d.]+)$/i,
    select: function(context, node2) {
      var versionToUse = normalizeElectron(node2.version);
      return Object.keys(e2c).filter(generateFilter(node2.sign, versionToUse)).map(function(i) {
        return "chrome " + e2c[i];
      });
    }
  },
  node_ray: {
    matches: ["sign", "version"],
    regexp: /^node\s*(>=?|<=?)\s*([\d.]+)$/i,
    select: function(context, node2) {
      return browserslist$2.nodeVersions.filter(generateSemverFilter(node2.sign, node2.version)).map(function(v) {
        return "node " + v;
      });
    }
  },
  browser_ray: {
    matches: ["browser", "sign", "version"],
    regexp: /^(\w+)\s*(>=?|<=?)\s*([\d.]+)$/,
    select: function(context, node2) {
      var version = node2.version;
      var data2 = checkName(node2.browser, context);
      var alias = browserslist$2.versionAliases[data2.name][version];
      if (alias)
        version = alias;
      return data2.released.filter(generateFilter(node2.sign, version)).map(function(v) {
        return data2.name + " " + v;
      });
    }
  },
  firefox_esr: {
    matches: [],
    regexp: /^(firefox|ff|fx)\s+esr$/i,
    select: function() {
      return ["firefox 115"];
    }
  },
  opera_mini_all: {
    matches: [],
    regexp: /(operamini|op_mini)\s+all/i,
    select: function() {
      return ["op_mini all"];
    }
  },
  electron_version: {
    matches: ["version"],
    regexp: /^electron\s+([\d.]+)$/i,
    select: function(context, node2) {
      var versionToUse = normalizeElectron(node2.version);
      var chrome = e2c[versionToUse];
      if (!chrome) {
        throw new BrowserslistError(
          "Unknown version " + node2.version + " of electron"
        );
      }
      return ["chrome " + chrome];
    }
  },
  node_major_version: {
    matches: ["version"],
    regexp: /^node\s+(\d+)$/i,
    select: nodeQuery
  },
  node_minor_version: {
    matches: ["version"],
    regexp: /^node\s+(\d+\.\d+)$/i,
    select: nodeQuery
  },
  node_patch_version: {
    matches: ["version"],
    regexp: /^node\s+(\d+\.\d+\.\d+)$/i,
    select: nodeQuery
  },
  current_node: {
    matches: [],
    regexp: /^current\s+node$/i,
    select: function(context) {
      return [env.currentNode(resolve$2, context)];
    }
  },
  maintained_node: {
    matches: [],
    regexp: /^maintained\s+node\s+versions$/i,
    select: function(context) {
      var now = Date.now();
      var queries = Object.keys(jsEOL).filter(function(key) {
        return now < Date.parse(jsEOL[key].end) && now > Date.parse(jsEOL[key].start) && isEolReleased(key);
      }).map(function(key) {
        return "node " + key.slice(1);
      });
      return resolve$2(queries, context);
    }
  },
  phantomjs_1_9: {
    matches: [],
    regexp: /^phantomjs\s+1.9$/i,
    select: function() {
      return ["safari 5"];
    }
  },
  phantomjs_2_1: {
    matches: [],
    regexp: /^phantomjs\s+2.1$/i,
    select: function() {
      return ["safari 6"];
    }
  },
  browser_version: {
    matches: ["browser", "version"],
    regexp: /^(\w+)\s+(tp|[\d.]+)$/i,
    select: function(context, node2) {
      var version = node2.version;
      if (/^tp$/i.test(version))
        version = "TP";
      var data2 = checkName(node2.browser, context);
      var alias = normalizeVersion(data2, version);
      if (alias) {
        version = alias;
      } else {
        if (version.indexOf(".") === -1) {
          alias = version + ".0";
        } else {
          alias = version.replace(/\.0$/, "");
        }
        alias = normalizeVersion(data2, alias);
        if (alias) {
          version = alias;
        } else if (context.ignoreUnknownVersions) {
          return [];
        } else {
          throw new BrowserslistError(
            "Unknown version " + version + " of " + node2.browser
          );
        }
      }
      return [data2.name + " " + version];
    }
  },
  browserslist_config: {
    matches: [],
    regexp: /^browserslist config$/i,
    select: function(context) {
      return browserslist$2(void 0, context);
    }
  },
  extends: {
    matches: ["config"],
    regexp: /^extends (.+)$/i,
    select: function(context, node2) {
      return resolve$2(env.loadQueries(context, node2.config), context);
    }
  },
  defaults: {
    matches: [],
    regexp: /^defaults$/i,
    select: function(context) {
      return resolve$2(browserslist$2.defaults, context);
    }
  },
  dead: {
    matches: [],
    regexp: /^dead$/i,
    select: function(context) {
      var dead = [
        "Baidu >= 0",
        "ie <= 11",
        "ie_mob <= 11",
        "bb <= 10",
        "op_mob <= 12.1",
        "samsung 4"
      ];
      return resolve$2(dead, context);
    }
  },
  unknown: {
    matches: [],
    regexp: /^(\w+)$/i,
    select: function(context, node2) {
      if (byName(node2.query, context)) {
        throw new BrowserslistError(
          "Specify versions in Browserslist query for browser " + node2.query
        );
      } else {
        throw unknownQuery(node2.query);
      }
    }
  }
};
(function() {
  for (var name2 in agents$1) {
    var browser2 = agents$1[name2];
    browserslist$2.data[name2] = {
      name: name2,
      versions: normalize(agents$1[name2].versions),
      released: normalize(agents$1[name2].versions.slice(0, -3)),
      releaseDate: agents$1[name2].release_date
    };
    fillUsage(browserslist$2.usage.global, name2, browser2.usage_global);
    browserslist$2.versionAliases[name2] = {};
    for (var i = 0; i < browser2.versions.length; i++) {
      var full = browser2.versions[i];
      if (!full)
        continue;
      if (full.indexOf("-") !== -1) {
        var interval = full.split("-");
        for (var j = 0; j < interval.length; j++) {
          browserslist$2.versionAliases[name2][interval[j]] = full;
        }
      }
    }
  }
  browserslist$2.nodeVersions = jsReleases.map(function(release) {
    return release.version;
  });
})();
var browserslist_1 = browserslist$2;
var picocolors_browser = { exports: {} };
var x = String;
var create = function() {
  return { isColorSupported: false, reset: x, bold: x, dim: x, italic: x, underline: x, inverse: x, hidden: x, strikethrough: x, black: x, red: x, green: x, yellow: x, blue: x, magenta: x, cyan: x, white: x, gray: x, bgBlack: x, bgRed: x, bgGreen: x, bgYellow: x, bgBlue: x, bgMagenta: x, bgCyan: x, bgWhite: x };
};
picocolors_browser.exports = create();
picocolors_browser.exports.createColors = create;
var picocolors_browserExports = picocolors_browser.exports;
var utils$f = {};
let pico = picocolors_browserExports;
let terminalHighlight$1 = require$$2;
let CssSyntaxError$3 = class CssSyntaxError extends Error {
  constructor(message, line, column, source2, file, plugin2) {
    super(message);
    this.name = "CssSyntaxError";
    this.reason = message;
    if (file) {
      this.file = file;
    }
    if (source2) {
      this.source = source2;
    }
    if (plugin2) {
      this.plugin = plugin2;
    }
    if (typeof line !== "undefined" && typeof column !== "undefined") {
      if (typeof line === "number") {
        this.line = line;
        this.column = column;
      } else {
        this.line = line.line;
        this.column = line.column;
        this.endLine = column.line;
        this.endColumn = column.column;
      }
    }
    this.setMessage();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CssSyntaxError);
    }
  }
  setMessage() {
    this.message = this.plugin ? this.plugin + ": " : "";
    this.message += this.file ? this.file : "<css input>";
    if (typeof this.line !== "undefined") {
      this.message += ":" + this.line + ":" + this.column;
    }
    this.message += ": " + this.reason;
  }
  showSourceCode(color) {
    if (!this.source)
      return "";
    let css = this.source;
    if (color == null)
      color = pico.isColorSupported;
    if (terminalHighlight$1) {
      if (color)
        css = terminalHighlight$1(css);
    }
    let lines = css.split(/\r?\n/);
    let start = Math.max(this.line - 3, 0);
    let end = Math.min(this.line + 2, lines.length);
    let maxWidth = String(end).length;
    let mark, aside;
    if (color) {
      let { bold, gray, red } = pico.createColors(true);
      mark = (text) => bold(red(text));
      aside = (text) => gray(text);
    } else {
      mark = aside = (str) => str;
    }
    return lines.slice(start, end).map((line, index) => {
      let number = start + 1 + index;
      let gutter = " " + (" " + number).slice(-maxWidth) + " | ";
      if (number === this.line) {
        let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, this.column - 1).replace(/[^\t]/g, " ");
        return mark(">") + aside(gutter) + line + "\n " + spacing + mark("^");
      }
      return " " + aside(gutter) + line;
    }).join("\n");
  }
  toString() {
    let code = this.showSourceCode();
    if (code) {
      code = "\n\n" + code + "\n";
    }
    return this.name + ": " + this.message + code;
  }
};
var cssSyntaxError = CssSyntaxError$3;
CssSyntaxError$3.default = CssSyntaxError$3;
var symbols = {};
symbols.isClean = Symbol("isClean");
symbols.my = Symbol("my");
const DEFAULT_RAW = {
  after: "\n",
  beforeClose: "\n",
  beforeComment: "\n",
  beforeDecl: "\n",
  beforeOpen: " ",
  beforeRule: "\n",
  colon: ": ",
  commentLeft: " ",
  commentRight: " ",
  emptyBody: "",
  indent: "    ",
  semicolon: false
};
function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}
let Stringifier$2 = class Stringifier {
  constructor(builder) {
    this.builder = builder;
  }
  atrule(node2, semicolon) {
    let name2 = "@" + node2.name;
    let params = node2.params ? this.rawValue(node2, "params") : "";
    if (typeof node2.raws.afterName !== "undefined") {
      name2 += node2.raws.afterName;
    } else if (params) {
      name2 += " ";
    }
    if (node2.nodes) {
      this.block(node2, name2 + params);
    } else {
      let end = (node2.raws.between || "") + (semicolon ? ";" : "");
      this.builder(name2 + params + end, node2);
    }
  }
  beforeAfter(node2, detect) {
    let value2;
    if (node2.type === "decl") {
      value2 = this.raw(node2, null, "beforeDecl");
    } else if (node2.type === "comment") {
      value2 = this.raw(node2, null, "beforeComment");
    } else if (detect === "before") {
      value2 = this.raw(node2, null, "beforeRule");
    } else {
      value2 = this.raw(node2, null, "beforeClose");
    }
    let buf = node2.parent;
    let depth = 0;
    while (buf && buf.type !== "root") {
      depth += 1;
      buf = buf.parent;
    }
    if (value2.includes("\n")) {
      let indent = this.raw(node2, null, "indent");
      if (indent.length) {
        for (let step = 0; step < depth; step++)
          value2 += indent;
      }
    }
    return value2;
  }
  block(node2, start) {
    let between = this.raw(node2, "between", "beforeOpen");
    this.builder(start + between + "{", node2, "start");
    let after;
    if (node2.nodes && node2.nodes.length) {
      this.body(node2);
      after = this.raw(node2, "after");
    } else {
      after = this.raw(node2, "after", "emptyBody");
    }
    if (after)
      this.builder(after);
    this.builder("}", node2, "end");
  }
  body(node2) {
    let last = node2.nodes.length - 1;
    while (last > 0) {
      if (node2.nodes[last].type !== "comment")
        break;
      last -= 1;
    }
    let semicolon = this.raw(node2, "semicolon");
    for (let i = 0; i < node2.nodes.length; i++) {
      let child2 = node2.nodes[i];
      let before = this.raw(child2, "before");
      if (before)
        this.builder(before);
      this.stringify(child2, last !== i || semicolon);
    }
  }
  comment(node2) {
    let left = this.raw(node2, "left", "commentLeft");
    let right = this.raw(node2, "right", "commentRight");
    this.builder("/*" + left + node2.text + right + "*/", node2);
  }
  decl(node2, semicolon) {
    let between = this.raw(node2, "between", "colon");
    let string = node2.prop + between + this.rawValue(node2, "value");
    if (node2.important) {
      string += node2.raws.important || " !important";
    }
    if (semicolon)
      string += ";";
    this.builder(string, node2);
  }
  document(node2) {
    this.body(node2);
  }
  raw(node2, own, detect) {
    let value2;
    if (!detect)
      detect = own;
    if (own) {
      value2 = node2.raws[own];
      if (typeof value2 !== "undefined")
        return value2;
    }
    let parent = node2.parent;
    if (detect === "before") {
      if (!parent || parent.type === "root" && parent.first === node2) {
        return "";
      }
      if (parent && parent.type === "document") {
        return "";
      }
    }
    if (!parent)
      return DEFAULT_RAW[detect];
    let root2 = node2.root();
    if (!root2.rawCache)
      root2.rawCache = {};
    if (typeof root2.rawCache[detect] !== "undefined") {
      return root2.rawCache[detect];
    }
    if (detect === "before" || detect === "after") {
      return this.beforeAfter(node2, detect);
    } else {
      let method = "raw" + capitalize(detect);
      if (this[method]) {
        value2 = this[method](root2, node2);
      } else {
        root2.walk((i) => {
          value2 = i.raws[own];
          if (typeof value2 !== "undefined")
            return false;
        });
      }
    }
    if (typeof value2 === "undefined")
      value2 = DEFAULT_RAW[detect];
    root2.rawCache[detect] = value2;
    return value2;
  }
  rawBeforeClose(root2) {
    let value2;
    root2.walk((i) => {
      if (i.nodes && i.nodes.length > 0) {
        if (typeof i.raws.after !== "undefined") {
          value2 = i.raws.after;
          if (value2.includes("\n")) {
            value2 = value2.replace(/[^\n]+$/, "");
          }
          return false;
        }
      }
    });
    if (value2)
      value2 = value2.replace(/\S/g, "");
    return value2;
  }
  rawBeforeComment(root2, node2) {
    let value2;
    root2.walkComments((i) => {
      if (typeof i.raws.before !== "undefined") {
        value2 = i.raws.before;
        if (value2.includes("\n")) {
          value2 = value2.replace(/[^\n]+$/, "");
        }
        return false;
      }
    });
    if (typeof value2 === "undefined") {
      value2 = this.raw(node2, null, "beforeDecl");
    } else if (value2) {
      value2 = value2.replace(/\S/g, "");
    }
    return value2;
  }
  rawBeforeDecl(root2, node2) {
    let value2;
    root2.walkDecls((i) => {
      if (typeof i.raws.before !== "undefined") {
        value2 = i.raws.before;
        if (value2.includes("\n")) {
          value2 = value2.replace(/[^\n]+$/, "");
        }
        return false;
      }
    });
    if (typeof value2 === "undefined") {
      value2 = this.raw(node2, null, "beforeRule");
    } else if (value2) {
      value2 = value2.replace(/\S/g, "");
    }
    return value2;
  }
  rawBeforeOpen(root2) {
    let value2;
    root2.walk((i) => {
      if (i.type !== "decl") {
        value2 = i.raws.between;
        if (typeof value2 !== "undefined")
          return false;
      }
    });
    return value2;
  }
  rawBeforeRule(root2) {
    let value2;
    root2.walk((i) => {
      if (i.nodes && (i.parent !== root2 || root2.first !== i)) {
        if (typeof i.raws.before !== "undefined") {
          value2 = i.raws.before;
          if (value2.includes("\n")) {
            value2 = value2.replace(/[^\n]+$/, "");
          }
          return false;
        }
      }
    });
    if (value2)
      value2 = value2.replace(/\S/g, "");
    return value2;
  }
  rawColon(root2) {
    let value2;
    root2.walkDecls((i) => {
      if (typeof i.raws.between !== "undefined") {
        value2 = i.raws.between.replace(/[^\s:]/g, "");
        return false;
      }
    });
    return value2;
  }
  rawEmptyBody(root2) {
    let value2;
    root2.walk((i) => {
      if (i.nodes && i.nodes.length === 0) {
        value2 = i.raws.after;
        if (typeof value2 !== "undefined")
          return false;
      }
    });
    return value2;
  }
  rawIndent(root2) {
    if (root2.raws.indent)
      return root2.raws.indent;
    let value2;
    root2.walk((i) => {
      let p = i.parent;
      if (p && p !== root2 && p.parent && p.parent === root2) {
        if (typeof i.raws.before !== "undefined") {
          let parts = i.raws.before.split("\n");
          value2 = parts[parts.length - 1];
          value2 = value2.replace(/\S/g, "");
          return false;
        }
      }
    });
    return value2;
  }
  rawSemicolon(root2) {
    let value2;
    root2.walk((i) => {
      if (i.nodes && i.nodes.length && i.last.type === "decl") {
        value2 = i.raws.semicolon;
        if (typeof value2 !== "undefined")
          return false;
      }
    });
    return value2;
  }
  rawValue(node2, prop) {
    let value2 = node2[prop];
    let raw = node2.raws[prop];
    if (raw && raw.value === value2) {
      return raw.raw;
    }
    return value2;
  }
  root(node2) {
    this.body(node2);
    if (node2.raws.after)
      this.builder(node2.raws.after);
  }
  rule(node2) {
    this.block(node2, this.rawValue(node2, "selector"));
    if (node2.raws.ownSemicolon) {
      this.builder(node2.raws.ownSemicolon, node2, "end");
    }
  }
  stringify(node2, semicolon) {
    if (!this[node2.type]) {
      throw new Error(
        "Unknown AST node type " + node2.type + ". Maybe you need to change PostCSS stringifier."
      );
    }
    this[node2.type](node2, semicolon);
  }
};
var stringifier = Stringifier$2;
Stringifier$2.default = Stringifier$2;
let Stringifier$1 = stringifier;
function stringify$6(node2, builder) {
  let str = new Stringifier$1(builder);
  str.stringify(node2);
}
var stringify_1$1 = stringify$6;
stringify$6.default = stringify$6;
let { isClean: isClean$2, my: my$2 } = symbols;
let CssSyntaxError$2 = cssSyntaxError;
let Stringifier2 = stringifier;
let stringify$5 = stringify_1$1;
function cloneNode(obj, parent) {
  let cloned = new obj.constructor();
  for (let i in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      continue;
    }
    if (i === "proxyCache")
      continue;
    let value2 = obj[i];
    let type = typeof value2;
    if (i === "parent" && type === "object") {
      if (parent)
        cloned[i] = parent;
    } else if (i === "source") {
      cloned[i] = value2;
    } else if (Array.isArray(value2)) {
      cloned[i] = value2.map((j) => cloneNode(j, cloned));
    } else {
      if (type === "object" && value2 !== null)
        value2 = cloneNode(value2);
      cloned[i] = value2;
    }
  }
  return cloned;
}
let Node$5 = class Node2 {
  constructor(defaults = {}) {
    this.raws = {};
    this[isClean$2] = false;
    this[my$2] = true;
    for (let name2 in defaults) {
      if (name2 === "nodes") {
        this.nodes = [];
        for (let node2 of defaults[name2]) {
          if (typeof node2.clone === "function") {
            this.append(node2.clone());
          } else {
            this.append(node2);
          }
        }
      } else {
        this[name2] = defaults[name2];
      }
    }
  }
  addToError(error2) {
    error2.postcssNode = this;
    if (error2.stack && this.source && /\n\s{4}at /.test(error2.stack)) {
      let s = this.source;
      error2.stack = error2.stack.replace(
        /\n\s{4}at /,
        `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
      );
    }
    return error2;
  }
  after(add2) {
    this.parent.insertAfter(this, add2);
    return this;
  }
  assign(overrides = {}) {
    for (let name2 in overrides) {
      this[name2] = overrides[name2];
    }
    return this;
  }
  before(add2) {
    this.parent.insertBefore(this, add2);
    return this;
  }
  cleanRaws(keepBetween) {
    delete this.raws.before;
    delete this.raws.after;
    if (!keepBetween)
      delete this.raws.between;
  }
  clone(overrides = {}) {
    let cloned = cloneNode(this);
    for (let name2 in overrides) {
      cloned[name2] = overrides[name2];
    }
    return cloned;
  }
  cloneAfter(overrides = {}) {
    let cloned = this.clone(overrides);
    this.parent.insertAfter(this, cloned);
    return cloned;
  }
  cloneBefore(overrides = {}) {
    let cloned = this.clone(overrides);
    this.parent.insertBefore(this, cloned);
    return cloned;
  }
  error(message, opts = {}) {
    if (this.source) {
      let { end, start } = this.rangeBy(opts);
      return this.source.input.error(
        message,
        { column: start.column, line: start.line },
        { column: end.column, line: end.line },
        opts
      );
    }
    return new CssSyntaxError$2(message);
  }
  getProxyProcessor() {
    return {
      get(node2, prop) {
        if (prop === "proxyOf") {
          return node2;
        } else if (prop === "root") {
          return () => node2.root().toProxy();
        } else {
          return node2[prop];
        }
      },
      set(node2, prop, value2) {
        if (node2[prop] === value2)
          return true;
        node2[prop] = value2;
        if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || /* c8 ignore next */
        prop === "text") {
          node2.markDirty();
        }
        return true;
      }
    };
  }
  markDirty() {
    if (this[isClean$2]) {
      this[isClean$2] = false;
      let next = this;
      while (next = next.parent) {
        next[isClean$2] = false;
      }
    }
  }
  next() {
    if (!this.parent)
      return void 0;
    let index = this.parent.index(this);
    return this.parent.nodes[index + 1];
  }
  positionBy(opts, stringRepresentation) {
    let pos = this.source.start;
    if (opts.index) {
      pos = this.positionInside(opts.index, stringRepresentation);
    } else if (opts.word) {
      stringRepresentation = this.toString();
      let index = stringRepresentation.indexOf(opts.word);
      if (index !== -1)
        pos = this.positionInside(index, stringRepresentation);
    }
    return pos;
  }
  positionInside(index, stringRepresentation) {
    let string = stringRepresentation || this.toString();
    let column = this.source.start.column;
    let line = this.source.start.line;
    for (let i = 0; i < index; i++) {
      if (string[i] === "\n") {
        column = 1;
        line += 1;
      } else {
        column += 1;
      }
    }
    return { column, line };
  }
  prev() {
    if (!this.parent)
      return void 0;
    let index = this.parent.index(this);
    return this.parent.nodes[index - 1];
  }
  rangeBy(opts) {
    let start = {
      column: this.source.start.column,
      line: this.source.start.line
    };
    let end = this.source.end ? {
      column: this.source.end.column + 1,
      line: this.source.end.line
    } : {
      column: start.column + 1,
      line: start.line
    };
    if (opts.word) {
      let stringRepresentation = this.toString();
      let index = stringRepresentation.indexOf(opts.word);
      if (index !== -1) {
        start = this.positionInside(index, stringRepresentation);
        end = this.positionInside(index + opts.word.length, stringRepresentation);
      }
    } else {
      if (opts.start) {
        start = {
          column: opts.start.column,
          line: opts.start.line
        };
      } else if (opts.index) {
        start = this.positionInside(opts.index);
      }
      if (opts.end) {
        end = {
          column: opts.end.column,
          line: opts.end.line
        };
      } else if (typeof opts.endIndex === "number") {
        end = this.positionInside(opts.endIndex);
      } else if (opts.index) {
        end = this.positionInside(opts.index + 1);
      }
    }
    if (end.line < start.line || end.line === start.line && end.column <= start.column) {
      end = { column: start.column + 1, line: start.line };
    }
    return { end, start };
  }
  raw(prop, defaultType) {
    let str = new Stringifier2();
    return str.raw(this, prop, defaultType);
  }
  remove() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.parent = void 0;
    return this;
  }
  replaceWith(...nodes) {
    if (this.parent) {
      let bookmark = this;
      let foundSelf = false;
      for (let node2 of nodes) {
        if (node2 === this) {
          foundSelf = true;
        } else if (foundSelf) {
          this.parent.insertAfter(bookmark, node2);
          bookmark = node2;
        } else {
          this.parent.insertBefore(bookmark, node2);
        }
      }
      if (!foundSelf) {
        this.remove();
      }
    }
    return this;
  }
  root() {
    let result2 = this;
    while (result2.parent && result2.parent.type !== "document") {
      result2 = result2.parent;
    }
    return result2;
  }
  toJSON(_, inputs) {
    let fixed = {};
    let emitInputs = inputs == null;
    inputs = inputs || /* @__PURE__ */ new Map();
    let inputsNextIndex = 0;
    for (let name2 in this) {
      if (!Object.prototype.hasOwnProperty.call(this, name2)) {
        continue;
      }
      if (name2 === "parent" || name2 === "proxyCache")
        continue;
      let value2 = this[name2];
      if (Array.isArray(value2)) {
        fixed[name2] = value2.map((i) => {
          if (typeof i === "object" && i.toJSON) {
            return i.toJSON(null, inputs);
          } else {
            return i;
          }
        });
      } else if (typeof value2 === "object" && value2.toJSON) {
        fixed[name2] = value2.toJSON(null, inputs);
      } else if (name2 === "source") {
        let inputId = inputs.get(value2.input);
        if (inputId == null) {
          inputId = inputsNextIndex;
          inputs.set(value2.input, inputsNextIndex);
          inputsNextIndex++;
        }
        fixed[name2] = {
          end: value2.end,
          inputId,
          start: value2.start
        };
      } else {
        fixed[name2] = value2;
      }
    }
    if (emitInputs) {
      fixed.inputs = [...inputs.keys()].map((input2) => input2.toJSON());
    }
    return fixed;
  }
  toProxy() {
    if (!this.proxyCache) {
      this.proxyCache = new Proxy(this, this.getProxyProcessor());
    }
    return this.proxyCache;
  }
  toString(stringifier2 = stringify$5) {
    if (stringifier2.stringify)
      stringifier2 = stringifier2.stringify;
    let result2 = "";
    stringifier2(this, (i) => {
      result2 += i;
    });
    return result2;
  }
  warn(result2, text, opts) {
    let data2 = { node: this };
    for (let i in opts)
      data2[i] = opts[i];
    return result2.warn(text, data2);
  }
  get proxyOf() {
    return this;
  }
};
var node = Node$5;
Node$5.default = Node$5;
let Node$4 = node;
let Declaration$O = class Declaration extends Node$4 {
  constructor(defaults) {
    if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") {
      defaults = { ...defaults, value: String(defaults.value) };
    }
    super(defaults);
    this.type = "decl";
  }
  get variable() {
    return this.prop.startsWith("--") || this.prop[0] === "$";
  }
};
var declaration$1 = Declaration$O;
Declaration$O.default = Declaration$O;
let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let customAlphabet = (alphabet, defaultSize = 21) => {
  return (size = defaultSize) => {
    let id = "";
    let i = size;
    while (i--) {
      id += alphabet[Math.random() * alphabet.length | 0];
    }
    return id;
  };
};
let nanoid$1 = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};
var nonSecure = { nanoid: nanoid$1, customAlphabet };
let { SourceMapConsumer: SourceMapConsumer$2, SourceMapGenerator: SourceMapGenerator$2 } = require$$2;
let { existsSync, readFileSync } = require$$2;
let { dirname: dirname$1, join } = require$$2;
function fromBase64(str) {
  if (Buffer) {
    return Buffer.from(str, "base64").toString();
  } else {
    return window.atob(str);
  }
}
let PreviousMap$2 = class PreviousMap {
  constructor(css, opts) {
    if (opts.map === false)
      return;
    this.loadAnnotation(css);
    this.inline = this.startWith(this.annotation, "data:");
    let prev = opts.map ? opts.map.prev : void 0;
    let text = this.loadMap(opts.from, prev);
    if (!this.mapFile && opts.from) {
      this.mapFile = opts.from;
    }
    if (this.mapFile)
      this.root = dirname$1(this.mapFile);
    if (text)
      this.text = text;
  }
  consumer() {
    if (!this.consumerCache) {
      this.consumerCache = new SourceMapConsumer$2(this.text);
    }
    return this.consumerCache;
  }
  decodeInline(text) {
    let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
    let baseUri = /^data:application\/json;base64,/;
    let charsetUri = /^data:application\/json;charset=utf-?8,/;
    let uri = /^data:application\/json,/;
    if (charsetUri.test(text) || uri.test(text)) {
      return decodeURIComponent(text.substr(RegExp.lastMatch.length));
    }
    if (baseCharsetUri.test(text) || baseUri.test(text)) {
      return fromBase64(text.substr(RegExp.lastMatch.length));
    }
    let encoding = text.match(/data:application\/json;([^,]+),/)[1];
    throw new Error("Unsupported source map encoding " + encoding);
  }
  getAnnotationURL(sourceMapString) {
    return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
  }
  isMap(map) {
    if (typeof map !== "object")
      return false;
    return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
  }
  loadAnnotation(css) {
    let comments = css.match(/\/\*\s*# sourceMappingURL=/gm);
    if (!comments)
      return;
    let start = css.lastIndexOf(comments.pop());
    let end = css.indexOf("*/", start);
    if (start > -1 && end > -1) {
      this.annotation = this.getAnnotationURL(css.substring(start, end));
    }
  }
  loadFile(path2) {
    this.root = dirname$1(path2);
    if (existsSync(path2)) {
      this.mapFile = path2;
      return readFileSync(path2, "utf-8").toString().trim();
    }
  }
  loadMap(file, prev) {
    if (prev === false)
      return false;
    if (prev) {
      if (typeof prev === "string") {
        return prev;
      } else if (typeof prev === "function") {
        let prevPath = prev(file);
        if (prevPath) {
          let map = this.loadFile(prevPath);
          if (!map) {
            throw new Error(
              "Unable to load previous source map: " + prevPath.toString()
            );
          }
          return map;
        }
      } else if (prev instanceof SourceMapConsumer$2) {
        return SourceMapGenerator$2.fromSourceMap(prev).toString();
      } else if (prev instanceof SourceMapGenerator$2) {
        return prev.toString();
      } else if (this.isMap(prev)) {
        return JSON.stringify(prev);
      } else {
        throw new Error(
          "Unsupported previous source map format: " + prev.toString()
        );
      }
    } else if (this.inline) {
      return this.decodeInline(this.annotation);
    } else if (this.annotation) {
      let map = this.annotation;
      if (file)
        map = join(dirname$1(file), map);
      return this.loadFile(map);
    }
  }
  startWith(string, start) {
    if (!string)
      return false;
    return string.substr(0, start.length) === start;
  }
  withContent() {
    return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
  }
};
var previousMap = PreviousMap$2;
PreviousMap$2.default = PreviousMap$2;
let { SourceMapConsumer: SourceMapConsumer$1, SourceMapGenerator: SourceMapGenerator$1 } = require$$2;
let { fileURLToPath, pathToFileURL: pathToFileURL$1 } = require$$2;
let { isAbsolute, resolve: resolve$1 } = require$$2;
let { nanoid } = nonSecure;
let terminalHighlight = require$$2;
let CssSyntaxError$1 = cssSyntaxError;
let PreviousMap$1 = previousMap;
let fromOffsetCache = Symbol("fromOffsetCache");
let sourceMapAvailable$1 = Boolean(SourceMapConsumer$1 && SourceMapGenerator$1);
let pathAvailable$1 = Boolean(resolve$1 && isAbsolute);
let Input$4 = class Input {
  constructor(css, opts = {}) {
    if (css === null || typeof css === "undefined" || typeof css === "object" && !css.toString) {
      throw new Error(`PostCSS received ${css} instead of CSS string`);
    }
    this.css = css.toString();
    if (this.css[0] === "\uFEFF" || this.css[0] === "￾") {
      this.hasBOM = true;
      this.css = this.css.slice(1);
    } else {
      this.hasBOM = false;
    }
    if (opts.from) {
      if (!pathAvailable$1 || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) {
        this.file = opts.from;
      } else {
        this.file = resolve$1(opts.from);
      }
    }
    if (pathAvailable$1 && sourceMapAvailable$1) {
      let map = new PreviousMap$1(this.css, opts);
      if (map.text) {
        this.map = map;
        let file = map.consumer().file;
        if (!this.file && file)
          this.file = this.mapResolve(file);
      }
    }
    if (!this.file) {
      this.id = "<input css " + nanoid(6) + ">";
    }
    if (this.map)
      this.map.file = this.from;
  }
  error(message, line, column, opts = {}) {
    let result2, endLine, endColumn;
    if (line && typeof line === "object") {
      let start = line;
      let end = column;
      if (typeof start.offset === "number") {
        let pos = this.fromOffset(start.offset);
        line = pos.line;
        column = pos.col;
      } else {
        line = start.line;
        column = start.column;
      }
      if (typeof end.offset === "number") {
        let pos = this.fromOffset(end.offset);
        endLine = pos.line;
        endColumn = pos.col;
      } else {
        endLine = end.line;
        endColumn = end.column;
      }
    } else if (!column) {
      let pos = this.fromOffset(line);
      line = pos.line;
      column = pos.col;
    }
    let origin = this.origin(line, column, endLine, endColumn);
    if (origin) {
      result2 = new CssSyntaxError$1(
        message,
        origin.endLine === void 0 ? origin.line : { column: origin.column, line: origin.line },
        origin.endLine === void 0 ? origin.column : { column: origin.endColumn, line: origin.endLine },
        origin.source,
        origin.file,
        opts.plugin
      );
    } else {
      result2 = new CssSyntaxError$1(
        message,
        endLine === void 0 ? line : { column, line },
        endLine === void 0 ? column : { column: endColumn, line: endLine },
        this.css,
        this.file,
        opts.plugin
      );
    }
    result2.input = { column, endColumn, endLine, line, source: this.css };
    if (this.file) {
      if (pathToFileURL$1) {
        result2.input.url = pathToFileURL$1(this.file).toString();
      }
      result2.input.file = this.file;
    }
    return result2;
  }
  fromOffset(offset) {
    let lastLine, lineToIndex;
    if (!this[fromOffsetCache]) {
      let lines = this.css.split("\n");
      lineToIndex = new Array(lines.length);
      let prevIndex = 0;
      for (let i = 0, l = lines.length; i < l; i++) {
        lineToIndex[i] = prevIndex;
        prevIndex += lines[i].length + 1;
      }
      this[fromOffsetCache] = lineToIndex;
    } else {
      lineToIndex = this[fromOffsetCache];
    }
    lastLine = lineToIndex[lineToIndex.length - 1];
    let min = 0;
    if (offset >= lastLine) {
      min = lineToIndex.length - 1;
    } else {
      let max = lineToIndex.length - 2;
      let mid;
      while (min < max) {
        mid = min + (max - min >> 1);
        if (offset < lineToIndex[mid]) {
          max = mid - 1;
        } else if (offset >= lineToIndex[mid + 1]) {
          min = mid + 1;
        } else {
          min = mid;
          break;
        }
      }
    }
    return {
      col: offset - lineToIndex[min] + 1,
      line: min + 1
    };
  }
  mapResolve(file) {
    if (/^\w+:\/\//.test(file)) {
      return file;
    }
    return resolve$1(this.map.consumer().sourceRoot || this.map.root || ".", file);
  }
  origin(line, column, endLine, endColumn) {
    if (!this.map)
      return false;
    let consumer = this.map.consumer();
    let from = consumer.originalPositionFor({ column, line });
    if (!from.source)
      return false;
    let to;
    if (typeof endLine === "number") {
      to = consumer.originalPositionFor({ column: endColumn, line: endLine });
    }
    let fromUrl;
    if (isAbsolute(from.source)) {
      fromUrl = pathToFileURL$1(from.source);
    } else {
      fromUrl = new URL(
        from.source,
        this.map.consumer().sourceRoot || pathToFileURL$1(this.map.mapFile)
      );
    }
    let result2 = {
      column: from.column,
      endColumn: to && to.column,
      endLine: to && to.line,
      line: from.line,
      url: fromUrl.toString()
    };
    if (fromUrl.protocol === "file:") {
      if (fileURLToPath) {
        result2.file = fileURLToPath(fromUrl);
      } else {
        throw new Error(`file: protocol is not available in this PostCSS build`);
      }
    }
    let source2 = consumer.sourceContentFor(from.source);
    if (source2)
      result2.source = source2;
    return result2;
  }
  toJSON() {
    let json = {};
    for (let name2 of ["hasBOM", "css", "file", "id"]) {
      if (this[name2] != null) {
        json[name2] = this[name2];
      }
    }
    if (this.map) {
      json.map = { ...this.map };
      if (json.map.consumerCache) {
        json.map.consumerCache = void 0;
      }
    }
    return json;
  }
  get from() {
    return this.file || this.id;
  }
};
var input = Input$4;
Input$4.default = Input$4;
if (terminalHighlight && terminalHighlight.registerInput) {
  terminalHighlight.registerInput(Input$4);
}
let { SourceMapConsumer, SourceMapGenerator } = require$$2;
let { dirname, relative, resolve, sep } = require$$2;
let { pathToFileURL } = require$$2;
let Input$3 = input;
let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
let pathAvailable = Boolean(dirname && resolve && relative && sep);
let MapGenerator$2 = class MapGenerator {
  constructor(stringify2, root2, opts, cssString) {
    this.stringify = stringify2;
    this.mapOpts = opts.map || {};
    this.root = root2;
    this.opts = opts;
    this.css = cssString;
    this.originalCSS = cssString;
    this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
    this.memoizedFileURLs = /* @__PURE__ */ new Map();
    this.memoizedPaths = /* @__PURE__ */ new Map();
    this.memoizedURLs = /* @__PURE__ */ new Map();
  }
  addAnnotation() {
    let content;
    if (this.isInline()) {
      content = "data:application/json;base64," + this.toBase64(this.map.toString());
    } else if (typeof this.mapOpts.annotation === "string") {
      content = this.mapOpts.annotation;
    } else if (typeof this.mapOpts.annotation === "function") {
      content = this.mapOpts.annotation(this.opts.to, this.root);
    } else {
      content = this.outputFile() + ".map";
    }
    let eol = "\n";
    if (this.css.includes("\r\n"))
      eol = "\r\n";
    this.css += eol + "/*# sourceMappingURL=" + content + " */";
  }
  applyPrevMaps() {
    for (let prev of this.previous()) {
      let from = this.toUrl(this.path(prev.file));
      let root2 = prev.root || dirname(prev.file);
      let map;
      if (this.mapOpts.sourcesContent === false) {
        map = new SourceMapConsumer(prev.text);
        if (map.sourcesContent) {
          map.sourcesContent = null;
        }
      } else {
        map = prev.consumer();
      }
      this.map.applySourceMap(map, from, this.toUrl(this.path(root2)));
    }
  }
  clearAnnotation() {
    if (this.mapOpts.annotation === false)
      return;
    if (this.root) {
      let node2;
      for (let i = this.root.nodes.length - 1; i >= 0; i--) {
        node2 = this.root.nodes[i];
        if (node2.type !== "comment")
          continue;
        if (node2.text.indexOf("# sourceMappingURL=") === 0) {
          this.root.removeChild(i);
        }
      }
    } else if (this.css) {
      this.css = this.css.replace(/\n*?\/\*#[\S\s]*?\*\/$/gm, "");
    }
  }
  generate() {
    this.clearAnnotation();
    if (pathAvailable && sourceMapAvailable && this.isMap()) {
      return this.generateMap();
    } else {
      let result2 = "";
      this.stringify(this.root, (i) => {
        result2 += i;
      });
      return [result2];
    }
  }
  generateMap() {
    if (this.root) {
      this.generateString();
    } else if (this.previous().length === 1) {
      let prev = this.previous()[0].consumer();
      prev.file = this.outputFile();
      this.map = SourceMapGenerator.fromSourceMap(prev, {
        ignoreInvalidMapping: true
      });
    } else {
      this.map = new SourceMapGenerator({
        file: this.outputFile(),
        ignoreInvalidMapping: true
      });
      this.map.addMapping({
        generated: { column: 0, line: 1 },
        original: { column: 0, line: 1 },
        source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
      });
    }
    if (this.isSourcesContent())
      this.setSourcesContent();
    if (this.root && this.previous().length > 0)
      this.applyPrevMaps();
    if (this.isAnnotation())
      this.addAnnotation();
    if (this.isInline()) {
      return [this.css];
    } else {
      return [this.css, this.map];
    }
  }
  generateString() {
    this.css = "";
    this.map = new SourceMapGenerator({
      file: this.outputFile(),
      ignoreInvalidMapping: true
    });
    let line = 1;
    let column = 1;
    let noSource = "<no source>";
    let mapping = {
      generated: { column: 0, line: 0 },
      original: { column: 0, line: 0 },
      source: ""
    };
    let lines, last;
    this.stringify(this.root, (str, node2, type) => {
      this.css += str;
      if (node2 && type !== "end") {
        mapping.generated.line = line;
        mapping.generated.column = column - 1;
        if (node2.source && node2.source.start) {
          mapping.source = this.sourcePath(node2);
          mapping.original.line = node2.source.start.line;
          mapping.original.column = node2.source.start.column - 1;
          this.map.addMapping(mapping);
        } else {
          mapping.source = noSource;
          mapping.original.line = 1;
          mapping.original.column = 0;
          this.map.addMapping(mapping);
        }
      }
      lines = str.match(/\n/g);
      if (lines) {
        line += lines.length;
        last = str.lastIndexOf("\n");
        column = str.length - last;
      } else {
        column += str.length;
      }
      if (node2 && type !== "start") {
        let p = node2.parent || { raws: {} };
        let childless = node2.type === "decl" || node2.type === "atrule" && !node2.nodes;
        if (!childless || node2 !== p.last || p.raws.semicolon) {
          if (node2.source && node2.source.end) {
            mapping.source = this.sourcePath(node2);
            mapping.original.line = node2.source.end.line;
            mapping.original.column = node2.source.end.column - 1;
            mapping.generated.line = line;
            mapping.generated.column = column - 2;
            this.map.addMapping(mapping);
          } else {
            mapping.source = noSource;
            mapping.original.line = 1;
            mapping.original.column = 0;
            mapping.generated.line = line;
            mapping.generated.column = column - 1;
            this.map.addMapping(mapping);
          }
        }
      }
    });
  }
  isAnnotation() {
    if (this.isInline()) {
      return true;
    }
    if (typeof this.mapOpts.annotation !== "undefined") {
      return this.mapOpts.annotation;
    }
    if (this.previous().length) {
      return this.previous().some((i) => i.annotation);
    }
    return true;
  }
  isInline() {
    if (typeof this.mapOpts.inline !== "undefined") {
      return this.mapOpts.inline;
    }
    let annotation = this.mapOpts.annotation;
    if (typeof annotation !== "undefined" && annotation !== true) {
      return false;
    }
    if (this.previous().length) {
      return this.previous().some((i) => i.inline);
    }
    return true;
  }
  isMap() {
    if (typeof this.opts.map !== "undefined") {
      return !!this.opts.map;
    }
    return this.previous().length > 0;
  }
  isSourcesContent() {
    if (typeof this.mapOpts.sourcesContent !== "undefined") {
      return this.mapOpts.sourcesContent;
    }
    if (this.previous().length) {
      return this.previous().some((i) => i.withContent());
    }
    return true;
  }
  outputFile() {
    if (this.opts.to) {
      return this.path(this.opts.to);
    } else if (this.opts.from) {
      return this.path(this.opts.from);
    } else {
      return "to.css";
    }
  }
  path(file) {
    if (this.mapOpts.absolute)
      return file;
    if (file.charCodeAt(0) === 60)
      return file;
    if (/^\w+:\/\//.test(file))
      return file;
    let cached = this.memoizedPaths.get(file);
    if (cached)
      return cached;
    let from = this.opts.to ? dirname(this.opts.to) : ".";
    if (typeof this.mapOpts.annotation === "string") {
      from = dirname(resolve(from, this.mapOpts.annotation));
    }
    let path2 = relative(from, file);
    this.memoizedPaths.set(file, path2);
    return path2;
  }
  previous() {
    if (!this.previousMaps) {
      this.previousMaps = [];
      if (this.root) {
        this.root.walk((node2) => {
          if (node2.source && node2.source.input.map) {
            let map = node2.source.input.map;
            if (!this.previousMaps.includes(map)) {
              this.previousMaps.push(map);
            }
          }
        });
      } else {
        let input2 = new Input$3(this.originalCSS, this.opts);
        if (input2.map)
          this.previousMaps.push(input2.map);
      }
    }
    return this.previousMaps;
  }
  setSourcesContent() {
    let already = {};
    if (this.root) {
      this.root.walk((node2) => {
        if (node2.source) {
          let from = node2.source.input.from;
          if (from && !already[from]) {
            already[from] = true;
            let fromUrl = this.usesFileUrls ? this.toFileUrl(from) : this.toUrl(this.path(from));
            this.map.setSourceContent(fromUrl, node2.source.input.css);
          }
        }
      });
    } else if (this.css) {
      let from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
      this.map.setSourceContent(from, this.css);
    }
  }
  sourcePath(node2) {
    if (this.mapOpts.from) {
      return this.toUrl(this.mapOpts.from);
    } else if (this.usesFileUrls) {
      return this.toFileUrl(node2.source.input.from);
    } else {
      return this.toUrl(this.path(node2.source.input.from));
    }
  }
  toBase64(str) {
    if (Buffer) {
      return Buffer.from(str).toString("base64");
    } else {
      return window.btoa(unescape(encodeURIComponent(str)));
    }
  }
  toFileUrl(path2) {
    let cached = this.memoizedFileURLs.get(path2);
    if (cached)
      return cached;
    if (pathToFileURL) {
      let fileURL = pathToFileURL(path2).toString();
      this.memoizedFileURLs.set(path2, fileURL);
      return fileURL;
    } else {
      throw new Error(
        "`map.absolute` option is not available in this PostCSS build"
      );
    }
  }
  toUrl(path2) {
    let cached = this.memoizedURLs.get(path2);
    if (cached)
      return cached;
    if (sep === "\\") {
      path2 = path2.replace(/\\/g, "/");
    }
    let url = encodeURI(path2).replace(/[#?]/g, encodeURIComponent);
    this.memoizedURLs.set(path2, url);
    return url;
  }
};
var mapGenerator = MapGenerator$2;
let Node$3 = node;
let Comment$4 = class Comment extends Node$3 {
  constructor(defaults) {
    super(defaults);
    this.type = "comment";
  }
};
var comment = Comment$4;
Comment$4.default = Comment$4;
let { isClean: isClean$1, my: my$1 } = symbols;
let Declaration$N = declaration$1;
let Comment$3 = comment;
let Node$2 = node;
let parse$7, Rule$4, AtRule$4, Root$6;
function cleanSource(nodes) {
  return nodes.map((i) => {
    if (i.nodes)
      i.nodes = cleanSource(i.nodes);
    delete i.source;
    return i;
  });
}
function markDirtyUp(node2) {
  node2[isClean$1] = false;
  if (node2.proxyOf.nodes) {
    for (let i of node2.proxyOf.nodes) {
      markDirtyUp(i);
    }
  }
}
let Container$7 = class Container extends Node$2 {
  append(...children) {
    for (let child2 of children) {
      let nodes = this.normalize(child2, this.last);
      for (let node2 of nodes)
        this.proxyOf.nodes.push(node2);
    }
    this.markDirty();
    return this;
  }
  cleanRaws(keepBetween) {
    super.cleanRaws(keepBetween);
    if (this.nodes) {
      for (let node2 of this.nodes)
        node2.cleanRaws(keepBetween);
    }
  }
  each(callback) {
    if (!this.proxyOf.nodes)
      return void 0;
    let iterator = this.getIterator();
    let index, result2;
    while (this.indexes[iterator] < this.proxyOf.nodes.length) {
      index = this.indexes[iterator];
      result2 = callback(this.proxyOf.nodes[index], index);
      if (result2 === false)
        break;
      this.indexes[iterator] += 1;
    }
    delete this.indexes[iterator];
    return result2;
  }
  every(condition) {
    return this.nodes.every(condition);
  }
  getIterator() {
    if (!this.lastEach)
      this.lastEach = 0;
    if (!this.indexes)
      this.indexes = {};
    this.lastEach += 1;
    let iterator = this.lastEach;
    this.indexes[iterator] = 0;
    return iterator;
  }
  getProxyProcessor() {
    return {
      get(node2, prop) {
        if (prop === "proxyOf") {
          return node2;
        } else if (!node2[prop]) {
          return node2[prop];
        } else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) {
          return (...args) => {
            return node2[prop](
              ...args.map((i) => {
                if (typeof i === "function") {
                  return (child2, index) => i(child2.toProxy(), index);
                } else {
                  return i;
                }
              })
            );
          };
        } else if (prop === "every" || prop === "some") {
          return (cb) => {
            return node2[prop](
              (child2, ...other) => cb(child2.toProxy(), ...other)
            );
          };
        } else if (prop === "root") {
          return () => node2.root().toProxy();
        } else if (prop === "nodes") {
          return node2.nodes.map((i) => i.toProxy());
        } else if (prop === "first" || prop === "last") {
          return node2[prop].toProxy();
        } else {
          return node2[prop];
        }
      },
      set(node2, prop, value2) {
        if (node2[prop] === value2)
          return true;
        node2[prop] = value2;
        if (prop === "name" || prop === "params" || prop === "selector") {
          node2.markDirty();
        }
        return true;
      }
    };
  }
  index(child2) {
    if (typeof child2 === "number")
      return child2;
    if (child2.proxyOf)
      child2 = child2.proxyOf;
    return this.proxyOf.nodes.indexOf(child2);
  }
  insertAfter(exist, add2) {
    let existIndex = this.index(exist);
    let nodes = this.normalize(add2, this.proxyOf.nodes[existIndex]).reverse();
    existIndex = this.index(exist);
    for (let node2 of nodes)
      this.proxyOf.nodes.splice(existIndex + 1, 0, node2);
    let index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (existIndex < index) {
        this.indexes[id] = index + nodes.length;
      }
    }
    this.markDirty();
    return this;
  }
  insertBefore(exist, add2) {
    let existIndex = this.index(exist);
    let type = existIndex === 0 ? "prepend" : false;
    let nodes = this.normalize(add2, this.proxyOf.nodes[existIndex], type).reverse();
    existIndex = this.index(exist);
    for (let node2 of nodes)
      this.proxyOf.nodes.splice(existIndex, 0, node2);
    let index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (existIndex <= index) {
        this.indexes[id] = index + nodes.length;
      }
    }
    this.markDirty();
    return this;
  }
  normalize(nodes, sample) {
    if (typeof nodes === "string") {
      nodes = cleanSource(parse$7(nodes).nodes);
    } else if (typeof nodes === "undefined") {
      nodes = [];
    } else if (Array.isArray(nodes)) {
      nodes = nodes.slice(0);
      for (let i of nodes) {
        if (i.parent)
          i.parent.removeChild(i, "ignore");
      }
    } else if (nodes.type === "root" && this.type !== "document") {
      nodes = nodes.nodes.slice(0);
      for (let i of nodes) {
        if (i.parent)
          i.parent.removeChild(i, "ignore");
      }
    } else if (nodes.type) {
      nodes = [nodes];
    } else if (nodes.prop) {
      if (typeof nodes.value === "undefined") {
        throw new Error("Value field is missed in node creation");
      } else if (typeof nodes.value !== "string") {
        nodes.value = String(nodes.value);
      }
      nodes = [new Declaration$N(nodes)];
    } else if (nodes.selector) {
      nodes = [new Rule$4(nodes)];
    } else if (nodes.name) {
      nodes = [new AtRule$4(nodes)];
    } else if (nodes.text) {
      nodes = [new Comment$3(nodes)];
    } else {
      throw new Error("Unknown node type in node creation");
    }
    let processed = nodes.map((i) => {
      if (!i[my$1])
        Container.rebuild(i);
      i = i.proxyOf;
      if (i.parent)
        i.parent.removeChild(i);
      if (i[isClean$1])
        markDirtyUp(i);
      if (typeof i.raws.before === "undefined") {
        if (sample && typeof sample.raws.before !== "undefined") {
          i.raws.before = sample.raws.before.replace(/\S/g, "");
        }
      }
      i.parent = this.proxyOf;
      return i;
    });
    return processed;
  }
  prepend(...children) {
    children = children.reverse();
    for (let child2 of children) {
      let nodes = this.normalize(child2, this.first, "prepend").reverse();
      for (let node2 of nodes)
        this.proxyOf.nodes.unshift(node2);
      for (let id in this.indexes) {
        this.indexes[id] = this.indexes[id] + nodes.length;
      }
    }
    this.markDirty();
    return this;
  }
  push(child2) {
    child2.parent = this;
    this.proxyOf.nodes.push(child2);
    return this;
  }
  removeAll() {
    for (let node2 of this.proxyOf.nodes)
      node2.parent = void 0;
    this.proxyOf.nodes = [];
    this.markDirty();
    return this;
  }
  removeChild(child2) {
    child2 = this.index(child2);
    this.proxyOf.nodes[child2].parent = void 0;
    this.proxyOf.nodes.splice(child2, 1);
    let index;
    for (let id in this.indexes) {
      index = this.indexes[id];
      if (index >= child2) {
        this.indexes[id] = index - 1;
      }
    }
    this.markDirty();
    return this;
  }
  replaceValues(pattern, opts, callback) {
    if (!callback) {
      callback = opts;
      opts = {};
    }
    this.walkDecls((decl) => {
      if (opts.props && !opts.props.includes(decl.prop))
        return;
      if (opts.fast && !decl.value.includes(opts.fast))
        return;
      decl.value = decl.value.replace(pattern, callback);
    });
    this.markDirty();
    return this;
  }
  some(condition) {
    return this.nodes.some(condition);
  }
  walk(callback) {
    return this.each((child2, i) => {
      let result2;
      try {
        result2 = callback(child2, i);
      } catch (e) {
        throw child2.addToError(e);
      }
      if (result2 !== false && child2.walk) {
        result2 = child2.walk(callback);
      }
      return result2;
    });
  }
  walkAtRules(name2, callback) {
    if (!callback) {
      callback = name2;
      return this.walk((child2, i) => {
        if (child2.type === "atrule") {
          return callback(child2, i);
        }
      });
    }
    if (name2 instanceof RegExp) {
      return this.walk((child2, i) => {
        if (child2.type === "atrule" && name2.test(child2.name)) {
          return callback(child2, i);
        }
      });
    }
    return this.walk((child2, i) => {
      if (child2.type === "atrule" && child2.name === name2) {
        return callback(child2, i);
      }
    });
  }
  walkComments(callback) {
    return this.walk((child2, i) => {
      if (child2.type === "comment") {
        return callback(child2, i);
      }
    });
  }
  walkDecls(prop, callback) {
    if (!callback) {
      callback = prop;
      return this.walk((child2, i) => {
        if (child2.type === "decl") {
          return callback(child2, i);
        }
      });
    }
    if (prop instanceof RegExp) {
      return this.walk((child2, i) => {
        if (child2.type === "decl" && prop.test(child2.prop)) {
          return callback(child2, i);
        }
      });
    }
    return this.walk((child2, i) => {
      if (child2.type === "decl" && child2.prop === prop) {
        return callback(child2, i);
      }
    });
  }
  walkRules(selector2, callback) {
    if (!callback) {
      callback = selector2;
      return this.walk((child2, i) => {
        if (child2.type === "rule") {
          return callback(child2, i);
        }
      });
    }
    if (selector2 instanceof RegExp) {
      return this.walk((child2, i) => {
        if (child2.type === "rule" && selector2.test(child2.selector)) {
          return callback(child2, i);
        }
      });
    }
    return this.walk((child2, i) => {
      if (child2.type === "rule" && child2.selector === selector2) {
        return callback(child2, i);
      }
    });
  }
  get first() {
    if (!this.proxyOf.nodes)
      return void 0;
    return this.proxyOf.nodes[0];
  }
  get last() {
    if (!this.proxyOf.nodes)
      return void 0;
    return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
  }
};
Container$7.registerParse = (dependant) => {
  parse$7 = dependant;
};
Container$7.registerRule = (dependant) => {
  Rule$4 = dependant;
};
Container$7.registerAtRule = (dependant) => {
  AtRule$4 = dependant;
};
Container$7.registerRoot = (dependant) => {
  Root$6 = dependant;
};
var container = Container$7;
Container$7.default = Container$7;
Container$7.rebuild = (node2) => {
  if (node2.type === "atrule") {
    Object.setPrototypeOf(node2, AtRule$4.prototype);
  } else if (node2.type === "rule") {
    Object.setPrototypeOf(node2, Rule$4.prototype);
  } else if (node2.type === "decl") {
    Object.setPrototypeOf(node2, Declaration$N.prototype);
  } else if (node2.type === "comment") {
    Object.setPrototypeOf(node2, Comment$3.prototype);
  } else if (node2.type === "root") {
    Object.setPrototypeOf(node2, Root$6.prototype);
  }
  node2[my$1] = true;
  if (node2.nodes) {
    node2.nodes.forEach((child2) => {
      Container$7.rebuild(child2);
    });
  }
};
let Container$6 = container;
let LazyResult$4, Processor$5;
let Document$3 = class Document extends Container$6 {
  constructor(defaults) {
    super({ type: "document", ...defaults });
    if (!this.nodes) {
      this.nodes = [];
    }
  }
  toResult(opts = {}) {
    let lazy = new LazyResult$4(new Processor$5(), this, opts);
    return lazy.stringify();
  }
};
Document$3.registerLazyResult = (dependant) => {
  LazyResult$4 = dependant;
};
Document$3.registerProcessor = (dependant) => {
  Processor$5 = dependant;
};
var document$1 = Document$3;
Document$3.default = Document$3;
let printed = {};
var warnOnce$2 = function warnOnce(message) {
  if (printed[message])
    return;
  printed[message] = true;
  if (typeof console !== "undefined" && console.warn) {
    console.warn(message);
  }
};
let Warning$2 = class Warning {
  constructor(text, opts = {}) {
    this.type = "warning";
    this.text = text;
    if (opts.node && opts.node.source) {
      let range2 = opts.node.rangeBy(opts);
      this.line = range2.start.line;
      this.column = range2.start.column;
      this.endLine = range2.end.line;
      this.endColumn = range2.end.column;
    }
    for (let opt in opts)
      this[opt] = opts[opt];
  }
  toString() {
    if (this.node) {
      return this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message;
    }
    if (this.plugin) {
      return this.plugin + ": " + this.text;
    }
    return this.text;
  }
};
var warning = Warning$2;
Warning$2.default = Warning$2;
let Warning$1 = warning;
let Result$3 = class Result {
  constructor(processor2, root2, opts) {
    this.processor = processor2;
    this.messages = [];
    this.root = root2;
    this.opts = opts;
    this.css = void 0;
    this.map = void 0;
  }
  toString() {
    return this.css;
  }
  warn(text, opts = {}) {
    if (!opts.plugin) {
      if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
        opts.plugin = this.lastPlugin.postcssPlugin;
      }
    }
    let warning2 = new Warning$1(text, opts);
    this.messages.push(warning2);
    return warning2;
  }
  warnings() {
    return this.messages.filter((i) => i.type === "warning");
  }
  get content() {
    return this.css;
  }
};
var result$1 = Result$3;
Result$3.default = Result$3;
const SINGLE_QUOTE = "'".charCodeAt(0);
const DOUBLE_QUOTE = '"'.charCodeAt(0);
const BACKSLASH = "\\".charCodeAt(0);
const SLASH = "/".charCodeAt(0);
const NEWLINE = "\n".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const FEED = "\f".charCodeAt(0);
const TAB = "	".charCodeAt(0);
const CR = "\r".charCodeAt(0);
const OPEN_SQUARE = "[".charCodeAt(0);
const CLOSE_SQUARE = "]".charCodeAt(0);
const OPEN_PARENTHESES = "(".charCodeAt(0);
const CLOSE_PARENTHESES = ")".charCodeAt(0);
const OPEN_CURLY = "{".charCodeAt(0);
const CLOSE_CURLY = "}".charCodeAt(0);
const SEMICOLON = ";".charCodeAt(0);
const ASTERISK = "*".charCodeAt(0);
const COLON = ":".charCodeAt(0);
const AT = "@".charCodeAt(0);
const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
const RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
const RE_HEX_ESCAPE = /[\da-f]/i;
var tokenize = function tokenizer(input2, options = {}) {
  let css = input2.css.valueOf();
  let ignore = options.ignoreErrors;
  let code, next, quote, content, escape;
  let escaped, escapePos, prev, n, currentToken;
  let length = css.length;
  let pos = 0;
  let buffer = [];
  let returned = [];
  function position() {
    return pos;
  }
  function unclosed(what) {
    throw input2.error("Unclosed " + what, pos);
  }
  function endOfFile() {
    return returned.length === 0 && pos >= length;
  }
  function nextToken(opts) {
    if (returned.length)
      return returned.pop();
    if (pos >= length)
      return;
    let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
    code = css.charCodeAt(pos);
    switch (code) {
      case NEWLINE:
      case SPACE:
      case TAB:
      case CR:
      case FEED: {
        next = pos;
        do {
          next += 1;
          code = css.charCodeAt(next);
        } while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
        currentToken = ["space", css.slice(pos, next)];
        pos = next - 1;
        break;
      }
      case OPEN_SQUARE:
      case CLOSE_SQUARE:
      case OPEN_CURLY:
      case CLOSE_CURLY:
      case COLON:
      case SEMICOLON:
      case CLOSE_PARENTHESES: {
        let controlChar = String.fromCharCode(code);
        currentToken = [controlChar, controlChar, pos];
        break;
      }
      case OPEN_PARENTHESES: {
        prev = buffer.length ? buffer.pop()[1] : "";
        n = css.charCodeAt(pos + 1);
        if (prev === "url" && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE && n !== SPACE && n !== NEWLINE && n !== TAB && n !== FEED && n !== CR) {
          next = pos;
          do {
            escaped = false;
            next = css.indexOf(")", next + 1);
            if (next === -1) {
              if (ignore || ignoreUnclosed) {
                next = pos;
                break;
              } else {
                unclosed("bracket");
              }
            }
            escapePos = next;
            while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
              escapePos -= 1;
              escaped = !escaped;
            }
          } while (escaped);
          currentToken = ["brackets", css.slice(pos, next + 1), pos, next];
          pos = next;
        } else {
          next = css.indexOf(")", pos + 1);
          content = css.slice(pos, next + 1);
          if (next === -1 || RE_BAD_BRACKET.test(content)) {
            currentToken = ["(", "(", pos];
          } else {
            currentToken = ["brackets", content, pos, next];
            pos = next;
          }
        }
        break;
      }
      case SINGLE_QUOTE:
      case DOUBLE_QUOTE: {
        quote = code === SINGLE_QUOTE ? "'" : '"';
        next = pos;
        do {
          escaped = false;
          next = css.indexOf(quote, next + 1);
          if (next === -1) {
            if (ignore || ignoreUnclosed) {
              next = pos + 1;
              break;
            } else {
              unclosed("string");
            }
          }
          escapePos = next;
          while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
            escapePos -= 1;
            escaped = !escaped;
          }
        } while (escaped);
        currentToken = ["string", css.slice(pos, next + 1), pos, next];
        pos = next;
        break;
      }
      case AT: {
        RE_AT_END.lastIndex = pos + 1;
        RE_AT_END.test(css);
        if (RE_AT_END.lastIndex === 0) {
          next = css.length - 1;
        } else {
          next = RE_AT_END.lastIndex - 2;
        }
        currentToken = ["at-word", css.slice(pos, next + 1), pos, next];
        pos = next;
        break;
      }
      case BACKSLASH: {
        next = pos;
        escape = true;
        while (css.charCodeAt(next + 1) === BACKSLASH) {
          next += 1;
          escape = !escape;
        }
        code = css.charCodeAt(next + 1);
        if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
          next += 1;
          if (RE_HEX_ESCAPE.test(css.charAt(next))) {
            while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) {
              next += 1;
            }
            if (css.charCodeAt(next + 1) === SPACE) {
              next += 1;
            }
          }
        }
        currentToken = ["word", css.slice(pos, next + 1), pos, next];
        pos = next;
        break;
      }
      default: {
        if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
          next = css.indexOf("*/", pos + 2) + 1;
          if (next === 0) {
            if (ignore || ignoreUnclosed) {
              next = css.length;
            } else {
              unclosed("comment");
            }
          }
          currentToken = ["comment", css.slice(pos, next + 1), pos, next];
          pos = next;
        } else {
          RE_WORD_END.lastIndex = pos + 1;
          RE_WORD_END.test(css);
          if (RE_WORD_END.lastIndex === 0) {
            next = css.length - 1;
          } else {
            next = RE_WORD_END.lastIndex - 2;
          }
          currentToken = ["word", css.slice(pos, next + 1), pos, next];
          buffer.push(currentToken);
          pos = next;
        }
        break;
      }
    }
    pos++;
    return currentToken;
  }
  function back(token) {
    returned.push(token);
  }
  return {
    back,
    endOfFile,
    nextToken,
    position
  };
};
let Container$5 = container;
let AtRule$3 = class AtRule extends Container$5 {
  constructor(defaults) {
    super(defaults);
    this.type = "atrule";
  }
  append(...children) {
    if (!this.proxyOf.nodes)
      this.nodes = [];
    return super.append(...children);
  }
  prepend(...children) {
    if (!this.proxyOf.nodes)
      this.nodes = [];
    return super.prepend(...children);
  }
};
var atRule = AtRule$3;
AtRule$3.default = AtRule$3;
Container$5.registerAtRule(AtRule$3);
let Container$4 = container;
let LazyResult$3, Processor$4;
let Root$5 = class Root extends Container$4 {
  constructor(defaults) {
    super(defaults);
    this.type = "root";
    if (!this.nodes)
      this.nodes = [];
  }
  normalize(child2, sample, type) {
    let nodes = super.normalize(child2);
    if (sample) {
      if (type === "prepend") {
        if (this.nodes.length > 1) {
          sample.raws.before = this.nodes[1].raws.before;
        } else {
          delete sample.raws.before;
        }
      } else if (this.first !== sample) {
        for (let node2 of nodes) {
          node2.raws.before = sample.raws.before;
        }
      }
    }
    return nodes;
  }
  removeChild(child2, ignore) {
    let index = this.index(child2);
    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before;
    }
    return super.removeChild(child2);
  }
  toResult(opts = {}) {
    let lazy = new LazyResult$3(new Processor$4(), this, opts);
    return lazy.stringify();
  }
};
Root$5.registerLazyResult = (dependant) => {
  LazyResult$3 = dependant;
};
Root$5.registerProcessor = (dependant) => {
  Processor$4 = dependant;
};
var root = Root$5;
Root$5.default = Root$5;
Container$4.registerRoot(Root$5);
let list$7 = {
  comma(string) {
    return list$7.split(string, [","], true);
  },
  space(string) {
    let spaces = [" ", "\n", "	"];
    return list$7.split(string, spaces);
  },
  split(string, separators, last) {
    let array = [];
    let current = "";
    let split = false;
    let func = 0;
    let inQuote = false;
    let prevQuote = "";
    let escape = false;
    for (let letter of string) {
      if (escape) {
        escape = false;
      } else if (letter === "\\") {
        escape = true;
      } else if (inQuote) {
        if (letter === prevQuote) {
          inQuote = false;
        }
      } else if (letter === '"' || letter === "'") {
        inQuote = true;
        prevQuote = letter;
      } else if (letter === "(") {
        func += 1;
      } else if (letter === ")") {
        if (func > 0)
          func -= 1;
      } else if (func === 0) {
        if (separators.includes(letter))
          split = true;
      }
      if (split) {
        if (current !== "")
          array.push(current.trim());
        current = "";
        split = false;
      } else {
        current += letter;
      }
    }
    if (last || current !== "")
      array.push(current.trim());
    return array;
  }
};
var list_1 = list$7;
list$7.default = list$7;
let Container$3 = container;
let list$6 = list_1;
let Rule$3 = class Rule extends Container$3 {
  constructor(defaults) {
    super(defaults);
    this.type = "rule";
    if (!this.nodes)
      this.nodes = [];
  }
  get selectors() {
    return list$6.comma(this.selector);
  }
  set selectors(values) {
    let match = this.selector ? this.selector.match(/,\s*/) : null;
    let sep2 = match ? match[0] : "," + this.raw("between", "beforeOpen");
    this.selector = values.join(sep2);
  }
};
var rule = Rule$3;
Rule$3.default = Rule$3;
Container$3.registerRule(Rule$3);
let Declaration$M = declaration$1;
let tokenizer2 = tokenize;
let Comment$2 = comment;
let AtRule$2 = atRule;
let Root$4 = root;
let Rule$2 = rule;
const SAFE_COMMENT_NEIGHBOR = {
  empty: true,
  space: true
};
function findLastWithPosition(tokens) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    let token = tokens[i];
    let pos = token[3] || token[2];
    if (pos)
      return pos;
  }
}
let Parser$1 = class Parser {
  constructor(input2) {
    this.input = input2;
    this.root = new Root$4();
    this.current = this.root;
    this.spaces = "";
    this.semicolon = false;
    this.createTokenizer();
    this.root.source = { input: input2, start: { column: 1, line: 1, offset: 0 } };
  }
  atrule(token) {
    let node2 = new AtRule$2();
    node2.name = token[1].slice(1);
    if (node2.name === "") {
      this.unnamedAtrule(node2, token);
    }
    this.init(node2, token[2]);
    let type;
    let prev;
    let shift;
    let last = false;
    let open = false;
    let params = [];
    let brackets = [];
    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken();
      type = token[0];
      if (type === "(" || type === "[") {
        brackets.push(type === "(" ? ")" : "]");
      } else if (type === "{" && brackets.length > 0) {
        brackets.push("}");
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop();
      }
      if (brackets.length === 0) {
        if (type === ";") {
          node2.source.end = this.getPosition(token[2]);
          node2.source.end.offset++;
          this.semicolon = true;
          break;
        } else if (type === "{") {
          open = true;
          break;
        } else if (type === "}") {
          if (params.length > 0) {
            shift = params.length - 1;
            prev = params[shift];
            while (prev && prev[0] === "space") {
              prev = params[--shift];
            }
            if (prev) {
              node2.source.end = this.getPosition(prev[3] || prev[2]);
              node2.source.end.offset++;
            }
          }
          this.end(token);
          break;
        } else {
          params.push(token);
        }
      } else {
        params.push(token);
      }
      if (this.tokenizer.endOfFile()) {
        last = true;
        break;
      }
    }
    node2.raws.between = this.spacesAndCommentsFromEnd(params);
    if (params.length) {
      node2.raws.afterName = this.spacesAndCommentsFromStart(params);
      this.raw(node2, "params", params);
      if (last) {
        token = params[params.length - 1];
        node2.source.end = this.getPosition(token[3] || token[2]);
        node2.source.end.offset++;
        this.spaces = node2.raws.between;
        node2.raws.between = "";
      }
    } else {
      node2.raws.afterName = "";
      node2.params = "";
    }
    if (open) {
      node2.nodes = [];
      this.current = node2;
    }
  }
  checkMissedSemicolon(tokens) {
    let colon2 = this.colon(tokens);
    if (colon2 === false)
      return;
    let founded = 0;
    let token;
    for (let j = colon2 - 1; j >= 0; j--) {
      token = tokens[j];
      if (token[0] !== "space") {
        founded += 1;
        if (founded === 2)
          break;
      }
    }
    throw this.input.error(
      "Missed semicolon",
      token[0] === "word" ? token[3] + 1 : token[2]
    );
  }
  colon(tokens) {
    let brackets = 0;
    let token, type, prev;
    for (let [i, element] of tokens.entries()) {
      token = element;
      type = token[0];
      if (type === "(") {
        brackets += 1;
      }
      if (type === ")") {
        brackets -= 1;
      }
      if (brackets === 0 && type === ":") {
        if (!prev) {
          this.doubleColon(token);
        } else if (prev[0] === "word" && prev[1] === "progid") {
          continue;
        } else {
          return i;
        }
      }
      prev = token;
    }
    return false;
  }
  comment(token) {
    let node2 = new Comment$2();
    this.init(node2, token[2]);
    node2.source.end = this.getPosition(token[3] || token[2]);
    node2.source.end.offset++;
    let text = token[1].slice(2, -2);
    if (/^\s*$/.test(text)) {
      node2.text = "";
      node2.raws.left = text;
      node2.raws.right = "";
    } else {
      let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
      node2.text = match[2];
      node2.raws.left = match[1];
      node2.raws.right = match[3];
    }
  }
  createTokenizer() {
    this.tokenizer = tokenizer2(this.input);
  }
  decl(tokens, customProperty) {
    let node2 = new Declaration$M();
    this.init(node2, tokens[0][2]);
    let last = tokens[tokens.length - 1];
    if (last[0] === ";") {
      this.semicolon = true;
      tokens.pop();
    }
    node2.source.end = this.getPosition(
      last[3] || last[2] || findLastWithPosition(tokens)
    );
    node2.source.end.offset++;
    while (tokens[0][0] !== "word") {
      if (tokens.length === 1)
        this.unknownWord(tokens);
      node2.raws.before += tokens.shift()[1];
    }
    node2.source.start = this.getPosition(tokens[0][2]);
    node2.prop = "";
    while (tokens.length) {
      let type = tokens[0][0];
      if (type === ":" || type === "space" || type === "comment") {
        break;
      }
      node2.prop += tokens.shift()[1];
    }
    node2.raws.between = "";
    let token;
    while (tokens.length) {
      token = tokens.shift();
      if (token[0] === ":") {
        node2.raws.between += token[1];
        break;
      } else {
        if (token[0] === "word" && /\w/.test(token[1])) {
          this.unknownWord([token]);
        }
        node2.raws.between += token[1];
      }
    }
    if (node2.prop[0] === "_" || node2.prop[0] === "*") {
      node2.raws.before += node2.prop[0];
      node2.prop = node2.prop.slice(1);
    }
    let firstSpaces = [];
    let next;
    while (tokens.length) {
      next = tokens[0][0];
      if (next !== "space" && next !== "comment")
        break;
      firstSpaces.push(tokens.shift());
    }
    this.precheckMissedSemicolon(tokens);
    for (let i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];
      if (token[1].toLowerCase() === "!important") {
        node2.important = true;
        let string = this.stringFrom(tokens, i);
        string = this.spacesFromEnd(tokens) + string;
        if (string !== " !important")
          node2.raws.important = string;
        break;
      } else if (token[1].toLowerCase() === "important") {
        let cache2 = tokens.slice(0);
        let str = "";
        for (let j = i; j > 0; j--) {
          let type = cache2[j][0];
          if (str.trim().indexOf("!") === 0 && type !== "space") {
            break;
          }
          str = cache2.pop()[1] + str;
        }
        if (str.trim().indexOf("!") === 0) {
          node2.important = true;
          node2.raws.important = str;
          tokens = cache2;
        }
      }
      if (token[0] !== "space" && token[0] !== "comment") {
        break;
      }
    }
    let hasWord = tokens.some((i) => i[0] !== "space" && i[0] !== "comment");
    if (hasWord) {
      node2.raws.between += firstSpaces.map((i) => i[1]).join("");
      firstSpaces = [];
    }
    this.raw(node2, "value", firstSpaces.concat(tokens), customProperty);
    if (node2.value.includes(":") && !customProperty) {
      this.checkMissedSemicolon(tokens);
    }
  }
  doubleColon(token) {
    throw this.input.error(
      "Double colon",
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    );
  }
  emptyRule(token) {
    let node2 = new Rule$2();
    this.init(node2, token[2]);
    node2.selector = "";
    node2.raws.between = "";
    this.current = node2;
  }
  end(token) {
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon;
    }
    this.semicolon = false;
    this.current.raws.after = (this.current.raws.after || "") + this.spaces;
    this.spaces = "";
    if (this.current.parent) {
      this.current.source.end = this.getPosition(token[2]);
      this.current.source.end.offset++;
      this.current = this.current.parent;
    } else {
      this.unexpectedClose(token);
    }
  }
  endFile() {
    if (this.current.parent)
      this.unclosedBlock();
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon;
    }
    this.current.raws.after = (this.current.raws.after || "") + this.spaces;
    this.root.source.end = this.getPosition(this.tokenizer.position());
  }
  freeSemicolon(token) {
    this.spaces += token[1];
    if (this.current.nodes) {
      let prev = this.current.nodes[this.current.nodes.length - 1];
      if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
        prev.raws.ownSemicolon = this.spaces;
        this.spaces = "";
      }
    }
  }
  // Helpers
  getPosition(offset) {
    let pos = this.input.fromOffset(offset);
    return {
      column: pos.col,
      line: pos.line,
      offset
    };
  }
  init(node2, offset) {
    this.current.push(node2);
    node2.source = {
      input: this.input,
      start: this.getPosition(offset)
    };
    node2.raws.before = this.spaces;
    this.spaces = "";
    if (node2.type !== "comment")
      this.semicolon = false;
  }
  other(start) {
    let end = false;
    let type = null;
    let colon2 = false;
    let bracket = null;
    let brackets = [];
    let customProperty = start[1].startsWith("--");
    let tokens = [];
    let token = start;
    while (token) {
      type = token[0];
      tokens.push(token);
      if (type === "(" || type === "[") {
        if (!bracket)
          bracket = token;
        brackets.push(type === "(" ? ")" : "]");
      } else if (customProperty && colon2 && type === "{") {
        if (!bracket)
          bracket = token;
        brackets.push("}");
      } else if (brackets.length === 0) {
        if (type === ";") {
          if (colon2) {
            this.decl(tokens, customProperty);
            return;
          } else {
            break;
          }
        } else if (type === "{") {
          this.rule(tokens);
          return;
        } else if (type === "}") {
          this.tokenizer.back(tokens.pop());
          end = true;
          break;
        } else if (type === ":") {
          colon2 = true;
        }
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop();
        if (brackets.length === 0)
          bracket = null;
      }
      token = this.tokenizer.nextToken();
    }
    if (this.tokenizer.endOfFile())
      end = true;
    if (brackets.length > 0)
      this.unclosedBracket(bracket);
    if (end && colon2) {
      if (!customProperty) {
        while (tokens.length) {
          token = tokens[tokens.length - 1][0];
          if (token !== "space" && token !== "comment")
            break;
          this.tokenizer.back(tokens.pop());
        }
      }
      this.decl(tokens, customProperty);
    } else {
      this.unknownWord(tokens);
    }
  }
  parse() {
    let token;
    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken();
      switch (token[0]) {
        case "space":
          this.spaces += token[1];
          break;
        case ";":
          this.freeSemicolon(token);
          break;
        case "}":
          this.end(token);
          break;
        case "comment":
          this.comment(token);
          break;
        case "at-word":
          this.atrule(token);
          break;
        case "{":
          this.emptyRule(token);
          break;
        default:
          this.other(token);
          break;
      }
    }
    this.endFile();
  }
  precheckMissedSemicolon() {
  }
  raw(node2, prop, tokens, customProperty) {
    let token, type;
    let length = tokens.length;
    let value2 = "";
    let clean = true;
    let next, prev;
    for (let i = 0; i < length; i += 1) {
      token = tokens[i];
      type = token[0];
      if (type === "space" && i === length - 1 && !customProperty) {
        clean = false;
      } else if (type === "comment") {
        prev = tokens[i - 1] ? tokens[i - 1][0] : "empty";
        next = tokens[i + 1] ? tokens[i + 1][0] : "empty";
        if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
          if (value2.slice(-1) === ",") {
            clean = false;
          } else {
            value2 += token[1];
          }
        } else {
          clean = false;
        }
      } else {
        value2 += token[1];
      }
    }
    if (!clean) {
      let raw = tokens.reduce((all, i) => all + i[1], "");
      node2.raws[prop] = { raw, value: value2 };
    }
    node2[prop] = value2;
  }
  rule(tokens) {
    tokens.pop();
    let node2 = new Rule$2();
    this.init(node2, tokens[0][2]);
    node2.raws.between = this.spacesAndCommentsFromEnd(tokens);
    this.raw(node2, "selector", tokens);
    this.current = node2;
  }
  spacesAndCommentsFromEnd(tokens) {
    let lastTokenType;
    let spaces = "";
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0];
      if (lastTokenType !== "space" && lastTokenType !== "comment")
        break;
      spaces = tokens.pop()[1] + spaces;
    }
    return spaces;
  }
  // Errors
  spacesAndCommentsFromStart(tokens) {
    let next;
    let spaces = "";
    while (tokens.length) {
      next = tokens[0][0];
      if (next !== "space" && next !== "comment")
        break;
      spaces += tokens.shift()[1];
    }
    return spaces;
  }
  spacesFromEnd(tokens) {
    let lastTokenType;
    let spaces = "";
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0];
      if (lastTokenType !== "space")
        break;
      spaces = tokens.pop()[1] + spaces;
    }
    return spaces;
  }
  stringFrom(tokens, from) {
    let result2 = "";
    for (let i = from; i < tokens.length; i++) {
      result2 += tokens[i][1];
    }
    tokens.splice(from, tokens.length - from);
    return result2;
  }
  unclosedBlock() {
    let pos = this.current.source.start;
    throw this.input.error("Unclosed block", pos.line, pos.column);
  }
  unclosedBracket(bracket) {
    throw this.input.error(
      "Unclosed bracket",
      { offset: bracket[2] },
      { offset: bracket[2] + 1 }
    );
  }
  unexpectedClose(token) {
    throw this.input.error(
      "Unexpected }",
      { offset: token[2] },
      { offset: token[2] + 1 }
    );
  }
  unknownWord(tokens) {
    throw this.input.error(
      "Unknown word",
      { offset: tokens[0][2] },
      { offset: tokens[0][2] + tokens[0][1].length }
    );
  }
  unnamedAtrule(node2, token) {
    throw this.input.error(
      "At-rule without name",
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    );
  }
};
var parser$3 = Parser$1;
let Container$2 = container;
let Parser2 = parser$3;
let Input$2 = input;
function parse$6(css, opts) {
  let input2 = new Input$2(css, opts);
  let parser2 = new Parser2(input2);
  try {
    parser2.parse();
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      if (e.name === "CssSyntaxError" && opts && opts.from) {
        if (/\.scss$/i.test(opts.from)) {
          e.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
        } else if (/\.sass/i.test(opts.from)) {
          e.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
        } else if (/\.less$/i.test(opts.from)) {
          e.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
        }
      }
    }
    throw e;
  }
  return parser2.root;
}
var parse_1 = parse$6;
parse$6.default = parse$6;
Container$2.registerParse(parse$6);
let { isClean, my } = symbols;
let MapGenerator$1 = mapGenerator;
let stringify$4 = stringify_1$1;
let Container$1 = container;
let Document$2 = document$1;
let warnOnce$1 = warnOnce$2;
let Result$2 = result$1;
let parse$5 = parse_1;
let Root$3 = root;
const TYPE_TO_CLASS_NAME = {
  atrule: "AtRule",
  comment: "Comment",
  decl: "Declaration",
  document: "Document",
  root: "Root",
  rule: "Rule"
};
const PLUGIN_PROPS = {
  AtRule: true,
  AtRuleExit: true,
  Comment: true,
  CommentExit: true,
  Declaration: true,
  DeclarationExit: true,
  Document: true,
  DocumentExit: true,
  Once: true,
  OnceExit: true,
  postcssPlugin: true,
  prepare: true,
  Root: true,
  RootExit: true,
  Rule: true,
  RuleExit: true
};
const NOT_VISITORS = {
  Once: true,
  postcssPlugin: true,
  prepare: true
};
const CHILDREN = 0;
function isPromise(obj) {
  return typeof obj === "object" && typeof obj.then === "function";
}
function getEvents(node2) {
  let key = false;
  let type = TYPE_TO_CLASS_NAME[node2.type];
  if (node2.type === "decl") {
    key = node2.prop.toLowerCase();
  } else if (node2.type === "atrule") {
    key = node2.name.toLowerCase();
  }
  if (key && node2.append) {
    return [
      type,
      type + "-" + key,
      CHILDREN,
      type + "Exit",
      type + "Exit-" + key
    ];
  } else if (key) {
    return [type, type + "-" + key, type + "Exit", type + "Exit-" + key];
  } else if (node2.append) {
    return [type, CHILDREN, type + "Exit"];
  } else {
    return [type, type + "Exit"];
  }
}
function toStack(node2) {
  let events;
  if (node2.type === "document") {
    events = ["Document", CHILDREN, "DocumentExit"];
  } else if (node2.type === "root") {
    events = ["Root", CHILDREN, "RootExit"];
  } else {
    events = getEvents(node2);
  }
  return {
    eventIndex: 0,
    events,
    iterator: 0,
    node: node2,
    visitorIndex: 0,
    visitors: []
  };
}
function cleanMarks(node2) {
  node2[isClean] = false;
  if (node2.nodes)
    node2.nodes.forEach((i) => cleanMarks(i));
  return node2;
}
let postcss$1 = {};
let LazyResult$2 = class LazyResult {
  constructor(processor2, css, opts) {
    this.stringified = false;
    this.processed = false;
    let root2;
    if (typeof css === "object" && css !== null && (css.type === "root" || css.type === "document")) {
      root2 = cleanMarks(css);
    } else if (css instanceof LazyResult || css instanceof Result$2) {
      root2 = cleanMarks(css.root);
      if (css.map) {
        if (typeof opts.map === "undefined")
          opts.map = {};
        if (!opts.map.inline)
          opts.map.inline = false;
        opts.map.prev = css.map;
      }
    } else {
      let parser2 = parse$5;
      if (opts.syntax)
        parser2 = opts.syntax.parse;
      if (opts.parser)
        parser2 = opts.parser;
      if (parser2.parse)
        parser2 = parser2.parse;
      try {
        root2 = parser2(css, opts);
      } catch (error2) {
        this.processed = true;
        this.error = error2;
      }
      if (root2 && !root2[my]) {
        Container$1.rebuild(root2);
      }
    }
    this.result = new Result$2(processor2, root2, opts);
    this.helpers = { ...postcss$1, postcss: postcss$1, result: this.result };
    this.plugins = this.processor.plugins.map((plugin2) => {
      if (typeof plugin2 === "object" && plugin2.prepare) {
        return { ...plugin2, ...plugin2.prepare(this.result) };
      } else {
        return plugin2;
      }
    });
  }
  async() {
    if (this.error)
      return Promise.reject(this.error);
    if (this.processed)
      return Promise.resolve(this.result);
    if (!this.processing) {
      this.processing = this.runAsync();
    }
    return this.processing;
  }
  catch(onRejected) {
    return this.async().catch(onRejected);
  }
  finally(onFinally) {
    return this.async().then(onFinally, onFinally);
  }
  getAsyncError() {
    throw new Error("Use process(css).then(cb) to work with async plugins");
  }
  handleError(error2, node2) {
    let plugin2 = this.result.lastPlugin;
    try {
      if (node2)
        node2.addToError(error2);
      this.error = error2;
      if (error2.name === "CssSyntaxError" && !error2.plugin) {
        error2.plugin = plugin2.postcssPlugin;
        error2.setMessage();
      } else if (plugin2.postcssVersion) {
        if (process.env.NODE_ENV !== "production") {
          let pluginName = plugin2.postcssPlugin;
          let pluginVer = plugin2.postcssVersion;
          let runtimeVer = this.result.processor.version;
          let a = pluginVer.split(".");
          let b = runtimeVer.split(".");
          if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) {
            console.error(
              "Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below."
            );
          }
        }
      }
    } catch (err) {
      if (console && console.error)
        console.error(err);
    }
    return error2;
  }
  prepareVisitors() {
    this.listeners = {};
    let add2 = (plugin2, type, cb) => {
      if (!this.listeners[type])
        this.listeners[type] = [];
      this.listeners[type].push([plugin2, cb]);
    };
    for (let plugin2 of this.plugins) {
      if (typeof plugin2 === "object") {
        for (let event2 in plugin2) {
          if (!PLUGIN_PROPS[event2] && /^[A-Z]/.test(event2)) {
            throw new Error(
              `Unknown event ${event2} in ${plugin2.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`
            );
          }
          if (!NOT_VISITORS[event2]) {
            if (typeof plugin2[event2] === "object") {
              for (let filter2 in plugin2[event2]) {
                if (filter2 === "*") {
                  add2(plugin2, event2, plugin2[event2][filter2]);
                } else {
                  add2(
                    plugin2,
                    event2 + "-" + filter2.toLowerCase(),
                    plugin2[event2][filter2]
                  );
                }
              }
            } else if (typeof plugin2[event2] === "function") {
              add2(plugin2, event2, plugin2[event2]);
            }
          }
        }
      }
    }
    this.hasListener = Object.keys(this.listeners).length > 0;
  }
  async runAsync() {
    this.plugin = 0;
    for (let i = 0; i < this.plugins.length; i++) {
      let plugin2 = this.plugins[i];
      let promise = this.runOnRoot(plugin2);
      if (isPromise(promise)) {
        try {
          await promise;
        } catch (error2) {
          throw this.handleError(error2);
        }
      }
    }
    this.prepareVisitors();
    if (this.hasListener) {
      let root2 = this.result.root;
      while (!root2[isClean]) {
        root2[isClean] = true;
        let stack = [toStack(root2)];
        while (stack.length > 0) {
          let promise = this.visitTick(stack);
          if (isPromise(promise)) {
            try {
              await promise;
            } catch (e) {
              let node2 = stack[stack.length - 1].node;
              throw this.handleError(e, node2);
            }
          }
        }
      }
      if (this.listeners.OnceExit) {
        for (let [plugin2, visitor] of this.listeners.OnceExit) {
          this.result.lastPlugin = plugin2;
          try {
            if (root2.type === "document") {
              let roots = root2.nodes.map(
                (subRoot) => visitor(subRoot, this.helpers)
              );
              await Promise.all(roots);
            } else {
              await visitor(root2, this.helpers);
            }
          } catch (e) {
            throw this.handleError(e);
          }
        }
      }
    }
    this.processed = true;
    return this.stringify();
  }
  runOnRoot(plugin2) {
    this.result.lastPlugin = plugin2;
    try {
      if (typeof plugin2 === "object" && plugin2.Once) {
        if (this.result.root.type === "document") {
          let roots = this.result.root.nodes.map(
            (root2) => plugin2.Once(root2, this.helpers)
          );
          if (isPromise(roots[0])) {
            return Promise.all(roots);
          }
          return roots;
        }
        return plugin2.Once(this.result.root, this.helpers);
      } else if (typeof plugin2 === "function") {
        return plugin2(this.result.root, this.result);
      }
    } catch (error2) {
      throw this.handleError(error2);
    }
  }
  stringify() {
    if (this.error)
      throw this.error;
    if (this.stringified)
      return this.result;
    this.stringified = true;
    this.sync();
    let opts = this.result.opts;
    let str = stringify$4;
    if (opts.syntax)
      str = opts.syntax.stringify;
    if (opts.stringifier)
      str = opts.stringifier;
    if (str.stringify)
      str = str.stringify;
    let map = new MapGenerator$1(str, this.result.root, this.result.opts);
    let data2 = map.generate();
    this.result.css = data2[0];
    this.result.map = data2[1];
    return this.result;
  }
  sync() {
    if (this.error)
      throw this.error;
    if (this.processed)
      return this.result;
    this.processed = true;
    if (this.processing) {
      throw this.getAsyncError();
    }
    for (let plugin2 of this.plugins) {
      let promise = this.runOnRoot(plugin2);
      if (isPromise(promise)) {
        throw this.getAsyncError();
      }
    }
    this.prepareVisitors();
    if (this.hasListener) {
      let root2 = this.result.root;
      while (!root2[isClean]) {
        root2[isClean] = true;
        this.walkSync(root2);
      }
      if (this.listeners.OnceExit) {
        if (root2.type === "document") {
          for (let subRoot of root2.nodes) {
            this.visitSync(this.listeners.OnceExit, subRoot);
          }
        } else {
          this.visitSync(this.listeners.OnceExit, root2);
        }
      }
    }
    return this.result;
  }
  then(onFulfilled, onRejected) {
    if (process.env.NODE_ENV !== "production") {
      if (!("from" in this.opts)) {
        warnOnce$1(
          "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
        );
      }
    }
    return this.async().then(onFulfilled, onRejected);
  }
  toString() {
    return this.css;
  }
  visitSync(visitors, node2) {
    for (let [plugin2, visitor] of visitors) {
      this.result.lastPlugin = plugin2;
      let promise;
      try {
        promise = visitor(node2, this.helpers);
      } catch (e) {
        throw this.handleError(e, node2.proxyOf);
      }
      if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
        return true;
      }
      if (isPromise(promise)) {
        throw this.getAsyncError();
      }
    }
  }
  visitTick(stack) {
    let visit = stack[stack.length - 1];
    let { node: node2, visitors } = visit;
    if (node2.type !== "root" && node2.type !== "document" && !node2.parent) {
      stack.pop();
      return;
    }
    if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
      let [plugin2, visitor] = visitors[visit.visitorIndex];
      visit.visitorIndex += 1;
      if (visit.visitorIndex === visitors.length) {
        visit.visitors = [];
        visit.visitorIndex = 0;
      }
      this.result.lastPlugin = plugin2;
      try {
        return visitor(node2.toProxy(), this.helpers);
      } catch (e) {
        throw this.handleError(e, node2);
      }
    }
    if (visit.iterator !== 0) {
      let iterator = visit.iterator;
      let child2;
      while (child2 = node2.nodes[node2.indexes[iterator]]) {
        node2.indexes[iterator] += 1;
        if (!child2[isClean]) {
          child2[isClean] = true;
          stack.push(toStack(child2));
          return;
        }
      }
      visit.iterator = 0;
      delete node2.indexes[iterator];
    }
    let events = visit.events;
    while (visit.eventIndex < events.length) {
      let event2 = events[visit.eventIndex];
      visit.eventIndex += 1;
      if (event2 === CHILDREN) {
        if (node2.nodes && node2.nodes.length) {
          node2[isClean] = true;
          visit.iterator = node2.getIterator();
        }
        return;
      } else if (this.listeners[event2]) {
        visit.visitors = this.listeners[event2];
        return;
      }
    }
    stack.pop();
  }
  walkSync(node2) {
    node2[isClean] = true;
    let events = getEvents(node2);
    for (let event2 of events) {
      if (event2 === CHILDREN) {
        if (node2.nodes) {
          node2.each((child2) => {
            if (!child2[isClean])
              this.walkSync(child2);
          });
        }
      } else {
        let visitors = this.listeners[event2];
        if (visitors) {
          if (this.visitSync(visitors, node2.toProxy()))
            return;
        }
      }
    }
  }
  warnings() {
    return this.sync().warnings();
  }
  get content() {
    return this.stringify().content;
  }
  get css() {
    return this.stringify().css;
  }
  get map() {
    return this.stringify().map;
  }
  get messages() {
    return this.sync().messages;
  }
  get opts() {
    return this.result.opts;
  }
  get processor() {
    return this.result.processor;
  }
  get root() {
    return this.sync().root;
  }
  get [Symbol.toStringTag]() {
    return "LazyResult";
  }
};
LazyResult$2.registerPostcss = (dependant) => {
  postcss$1 = dependant;
};
var lazyResult = LazyResult$2;
LazyResult$2.default = LazyResult$2;
Root$3.registerLazyResult(LazyResult$2);
Document$2.registerLazyResult(LazyResult$2);
let MapGenerator2 = mapGenerator;
let stringify$3 = stringify_1$1;
let warnOnce2 = warnOnce$2;
let parse$4 = parse_1;
const Result$1 = result$1;
let NoWorkResult$1 = class NoWorkResult {
  constructor(processor2, css, opts) {
    css = css.toString();
    this.stringified = false;
    this._processor = processor2;
    this._css = css;
    this._opts = opts;
    this._map = void 0;
    let root2;
    let str = stringify$3;
    this.result = new Result$1(this._processor, root2, this._opts);
    this.result.css = css;
    let self = this;
    Object.defineProperty(this.result, "root", {
      get() {
        return self.root;
      }
    });
    let map = new MapGenerator2(str, root2, this._opts, css);
    if (map.isMap()) {
      let [generatedCSS, generatedMap] = map.generate();
      if (generatedCSS) {
        this.result.css = generatedCSS;
      }
      if (generatedMap) {
        this.result.map = generatedMap;
      }
    } else {
      map.clearAnnotation();
      this.result.css = map.css;
    }
  }
  async() {
    if (this.error)
      return Promise.reject(this.error);
    return Promise.resolve(this.result);
  }
  catch(onRejected) {
    return this.async().catch(onRejected);
  }
  finally(onFinally) {
    return this.async().then(onFinally, onFinally);
  }
  sync() {
    if (this.error)
      throw this.error;
    return this.result;
  }
  then(onFulfilled, onRejected) {
    if (process.env.NODE_ENV !== "production") {
      if (!("from" in this._opts)) {
        warnOnce2(
          "Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning."
        );
      }
    }
    return this.async().then(onFulfilled, onRejected);
  }
  toString() {
    return this._css;
  }
  warnings() {
    return [];
  }
  get content() {
    return this.result.css;
  }
  get css() {
    return this.result.css;
  }
  get map() {
    return this.result.map;
  }
  get messages() {
    return [];
  }
  get opts() {
    return this.result.opts;
  }
  get processor() {
    return this.result.processor;
  }
  get root() {
    if (this._root) {
      return this._root;
    }
    let root2;
    let parser2 = parse$4;
    try {
      root2 = parser2(this._css, this._opts);
    } catch (error2) {
      this.error = error2;
    }
    if (this.error) {
      throw this.error;
    } else {
      this._root = root2;
      return root2;
    }
  }
  get [Symbol.toStringTag]() {
    return "NoWorkResult";
  }
};
var noWorkResult = NoWorkResult$1;
NoWorkResult$1.default = NoWorkResult$1;
let NoWorkResult2 = noWorkResult;
let LazyResult$1 = lazyResult;
let Document$1 = document$1;
let Root$2 = root;
let Processor$3 = class Processor {
  constructor(plugins = []) {
    this.version = "8.4.38";
    this.plugins = this.normalize(plugins);
  }
  normalize(plugins) {
    let normalized = [];
    for (let i of plugins) {
      if (i.postcss === true) {
        i = i();
      } else if (i.postcss) {
        i = i.postcss;
      }
      if (typeof i === "object" && Array.isArray(i.plugins)) {
        normalized = normalized.concat(i.plugins);
      } else if (typeof i === "object" && i.postcssPlugin) {
        normalized.push(i);
      } else if (typeof i === "function") {
        normalized.push(i);
      } else if (typeof i === "object" && (i.parse || i.stringify)) {
        if (process.env.NODE_ENV !== "production") {
          throw new Error(
            "PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation."
          );
        }
      } else {
        throw new Error(i + " is not a PostCSS plugin");
      }
    }
    return normalized;
  }
  process(css, opts = {}) {
    if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) {
      return new NoWorkResult2(this, css, opts);
    } else {
      return new LazyResult$1(this, css, opts);
    }
  }
  use(plugin2) {
    this.plugins = this.plugins.concat(this.normalize([plugin2]));
    return this;
  }
};
var processor$1 = Processor$3;
Processor$3.default = Processor$3;
Root$2.registerProcessor(Processor$3);
Document$1.registerProcessor(Processor$3);
let Declaration$L = declaration$1;
let PreviousMap2 = previousMap;
let Comment$1 = comment;
let AtRule$1 = atRule;
let Input$1 = input;
let Root$1 = root;
let Rule$1 = rule;
function fromJSON$1(json, inputs) {
  if (Array.isArray(json))
    return json.map((n) => fromJSON$1(n));
  let { inputs: ownInputs, ...defaults } = json;
  if (ownInputs) {
    inputs = [];
    for (let input2 of ownInputs) {
      let inputHydrated = { ...input2, __proto__: Input$1.prototype };
      if (inputHydrated.map) {
        inputHydrated.map = {
          ...inputHydrated.map,
          __proto__: PreviousMap2.prototype
        };
      }
      inputs.push(inputHydrated);
    }
  }
  if (defaults.nodes) {
    defaults.nodes = json.nodes.map((n) => fromJSON$1(n, inputs));
  }
  if (defaults.source) {
    let { inputId, ...source2 } = defaults.source;
    defaults.source = source2;
    if (inputId != null) {
      defaults.source.input = inputs[inputId];
    }
  }
  if (defaults.type === "root") {
    return new Root$1(defaults);
  } else if (defaults.type === "decl") {
    return new Declaration$L(defaults);
  } else if (defaults.type === "rule") {
    return new Rule$1(defaults);
  } else if (defaults.type === "comment") {
    return new Comment$1(defaults);
  } else if (defaults.type === "atrule") {
    return new AtRule$1(defaults);
  } else {
    throw new Error("Unknown node type: " + json.type);
  }
}
var fromJSON_1 = fromJSON$1;
fromJSON$1.default = fromJSON$1;
let CssSyntaxError2 = cssSyntaxError;
let Declaration$K = declaration$1;
let LazyResult2 = lazyResult;
let Container2 = container;
let Processor$2 = processor$1;
let stringify$2 = stringify_1$1;
let fromJSON = fromJSON_1;
let Document2 = document$1;
let Warning2 = warning;
let Comment2 = comment;
let AtRule2 = atRule;
let Result2 = result$1;
let Input2 = input;
let parse$3 = parse_1;
let list$5 = list_1;
let Rule2 = rule;
let Root2 = root;
let Node$1 = node;
function postcss(...plugins) {
  if (plugins.length === 1 && Array.isArray(plugins[0])) {
    plugins = plugins[0];
  }
  return new Processor$2(plugins);
}
postcss.plugin = function plugin(name2, initializer) {
  let warningPrinted = false;
  function creator(...args) {
    if (console && console.warn && !warningPrinted) {
      warningPrinted = true;
      console.warn(
        name2 + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration"
      );
      if (process.env.LANG && process.env.LANG.startsWith("cn")) {
        console.warn(
          name2 + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226"
        );
      }
    }
    let transformer = initializer(...args);
    transformer.postcssPlugin = name2;
    transformer.postcssVersion = new Processor$2().version;
    return transformer;
  }
  let cache2;
  Object.defineProperty(creator, "postcss", {
    get() {
      if (!cache2)
        cache2 = creator();
      return cache2;
    }
  });
  creator.process = function(css, processOpts, pluginOpts) {
    return postcss([creator(pluginOpts)]).process(css, processOpts);
  };
  return creator;
};
postcss.stringify = stringify$2;
postcss.parse = parse$3;
postcss.fromJSON = fromJSON;
postcss.list = list$5;
postcss.comment = (defaults) => new Comment2(defaults);
postcss.atRule = (defaults) => new AtRule2(defaults);
postcss.decl = (defaults) => new Declaration$K(defaults);
postcss.rule = (defaults) => new Rule2(defaults);
postcss.root = (defaults) => new Root2(defaults);
postcss.document = (defaults) => new Document2(defaults);
postcss.CssSyntaxError = CssSyntaxError2;
postcss.Declaration = Declaration$K;
postcss.Container = Container2;
postcss.Processor = Processor$2;
postcss.Document = Document2;
postcss.Comment = Comment2;
postcss.Warning = Warning2;
postcss.AtRule = AtRule2;
postcss.Result = Result2;
postcss.Input = Input2;
postcss.Rule = Rule2;
postcss.Root = Root2;
postcss.Node = Node$1;
LazyResult2.registerPostcss(postcss);
var postcss_1 = postcss;
postcss.default = postcss;
let { list: list$4 } = postcss_1;
utils$f.error = function(text) {
  let err = new Error(text);
  err.autoprefixer = true;
  throw err;
};
utils$f.uniq = function(array) {
  return [...new Set(array)];
};
utils$f.removeNote = function(string) {
  if (!string.includes(" ")) {
    return string;
  }
  return string.split(" ")[0];
};
utils$f.escapeRegexp = function(string) {
  return string.replace(/[$()*+-.?[\\\]^{|}]/g, "\\$&");
};
utils$f.regexp = function(word, escape = true) {
  if (escape) {
    word = this.escapeRegexp(word);
  }
  return new RegExp(`(^|[\\s,(])(${word}($|[\\s(,]))`, "gi");
};
utils$f.editList = function(value2, callback) {
  let origin = list$4.comma(value2);
  let changed = callback(origin, []);
  if (origin === changed) {
    return value2;
  }
  let join2 = value2.match(/,\s*/);
  join2 = join2 ? join2[0] : ", ";
  return changed.join(join2);
};
utils$f.splitSelector = function(selector2) {
  return list$4.comma(selector2).map((i) => {
    return list$4.space(i).map((k) => {
      return k.split(/(?=\.|#)/g);
    });
  });
};
utils$f.isPureNumber = function(value2) {
  if (typeof value2 === "number") {
    return true;
  }
  if (typeof value2 === "string") {
    return /^[0-9]+$/.test(value2);
  }
  return false;
};
let browserslist$1 = browserslist_1;
let { agents } = agents$3;
let utils$e = utils$f;
let Browsers$3 = class Browsers {
  constructor(data2, requirements, options, browserslistOpts) {
    this.data = data2;
    this.options = options || {};
    this.browserslistOpts = browserslistOpts || {};
    this.selected = this.parse(requirements);
  }
  /**
   * Return all prefixes for default browser data
   */
  static prefixes() {
    if (this.prefixesCache) {
      return this.prefixesCache;
    }
    this.prefixesCache = [];
    for (let name2 in agents) {
      this.prefixesCache.push(`-${agents[name2].prefix}-`);
    }
    this.prefixesCache = utils$e.uniq(this.prefixesCache).sort((a, b) => b.length - a.length);
    return this.prefixesCache;
  }
  /**
   * Check is value contain any possible prefix
   */
  static withPrefix(value2) {
    if (!this.prefixesRegexp) {
      this.prefixesRegexp = new RegExp(this.prefixes().join("|"));
    }
    return this.prefixesRegexp.test(value2);
  }
  /**
   * Is browser is selected by requirements
   */
  isSelected(browser2) {
    return this.selected.includes(browser2);
  }
  /**
   * Return browsers selected by requirements
   */
  parse(requirements) {
    let opts = {};
    for (let i in this.browserslistOpts) {
      opts[i] = this.browserslistOpts[i];
    }
    opts.path = this.options.from;
    return browserslist$1(requirements, opts);
  }
  /**
   * Return prefix for selected browser
   */
  prefix(browser2) {
    let [name2, version] = browser2.split(" ");
    let data2 = this.data[name2];
    let prefix2 = data2.prefix_exceptions && data2.prefix_exceptions[version];
    if (!prefix2) {
      prefix2 = data2.prefix;
    }
    return `-${prefix2}-`;
  }
};
var browsers$1 = Browsers$3;
var vendor$2 = {
  prefix(prop) {
    let match = prop.match(/^(-\w+-)/);
    if (match) {
      return match[0];
    }
    return "";
  },
  unprefixed(prop) {
    return prop.replace(/^-\w+-/, "");
  }
};
let Browsers$2 = browsers$1;
let vendor$1 = vendor$2;
let utils$d = utils$f;
function clone(obj, parent) {
  let cloned = new obj.constructor();
  for (let i of Object.keys(obj || {})) {
    let value2 = obj[i];
    if (i === "parent" && typeof value2 === "object") {
      if (parent) {
        cloned[i] = parent;
      }
    } else if (i === "source" || i === null) {
      cloned[i] = value2;
    } else if (Array.isArray(value2)) {
      cloned[i] = value2.map((x2) => clone(x2, cloned));
    } else if (i !== "_autoprefixerPrefix" && i !== "_autoprefixerValues" && i !== "proxyCache") {
      if (typeof value2 === "object" && value2 !== null) {
        value2 = clone(value2, cloned);
      }
      cloned[i] = value2;
    }
  }
  return cloned;
}
let Prefixer$3 = class Prefixer {
  constructor(name2, prefixes, all) {
    this.prefixes = prefixes;
    this.name = name2;
    this.all = all;
  }
  /**
   * Clone node and clean autprefixer custom caches
   */
  static clone(node2, overrides) {
    let cloned = clone(node2);
    for (let name2 in overrides) {
      cloned[name2] = overrides[name2];
    }
    return cloned;
  }
  /**
   * Add hack to selected names
   */
  static hack(klass) {
    if (!this.hacks) {
      this.hacks = {};
    }
    return klass.names.map((name2) => {
      this.hacks[name2] = klass;
      return this.hacks[name2];
    });
  }
  /**
   * Load hacks for some names
   */
  static load(name2, prefixes, all) {
    let Klass = this.hacks && this.hacks[name2];
    if (Klass) {
      return new Klass(name2, prefixes, all);
    } else {
      return new this(name2, prefixes, all);
    }
  }
  /**
   * Shortcut for Prefixer.clone
   */
  clone(node2, overrides) {
    return Prefixer.clone(node2, overrides);
  }
  /**
   * Find prefix in node parents
   */
  parentPrefix(node2) {
    let prefix2;
    if (typeof node2._autoprefixerPrefix !== "undefined") {
      prefix2 = node2._autoprefixerPrefix;
    } else if (node2.type === "decl" && node2.prop[0] === "-") {
      prefix2 = vendor$1.prefix(node2.prop);
    } else if (node2.type === "root") {
      prefix2 = false;
    } else if (node2.type === "rule" && node2.selector.includes(":-") && /:(-\w+-)/.test(node2.selector)) {
      prefix2 = node2.selector.match(/:(-\w+-)/)[1];
    } else if (node2.type === "atrule" && node2.name[0] === "-") {
      prefix2 = vendor$1.prefix(node2.name);
    } else {
      prefix2 = this.parentPrefix(node2.parent);
    }
    if (!Browsers$2.prefixes().includes(prefix2)) {
      prefix2 = false;
    }
    node2._autoprefixerPrefix = prefix2;
    return node2._autoprefixerPrefix;
  }
  /**
   * Clone node with prefixes
   */
  process(node2, result2) {
    if (!this.check(node2)) {
      return void 0;
    }
    let parent = this.parentPrefix(node2);
    let prefixes = this.prefixes.filter(
      (prefix2) => !parent || parent === utils$d.removeNote(prefix2)
    );
    let added = [];
    for (let prefix2 of prefixes) {
      if (this.add(node2, prefix2, added.concat([prefix2]), result2)) {
        added.push(prefix2);
      }
    }
    return added;
  }
};
var prefixer = Prefixer$3;
let Prefixer$2 = prefixer;
let Browsers$1 = browsers$1;
let utils$c = utils$f;
let Declaration$J = class Declaration2 extends Prefixer$2 {
  /**
   * Clone and add prefixes for declaration
   */
  add(decl, prefix2, prefixes, result2) {
    let prefixed = this.prefixed(decl.prop, prefix2);
    if (this.isAlready(decl, prefixed) || this.otherPrefixes(decl.value, prefix2)) {
      return void 0;
    }
    return this.insert(decl, prefix2, prefixes, result2);
  }
  /**
   * Calculate indentation to create visual cascade
   */
  calcBefore(prefixes, decl, prefix2 = "") {
    let max = this.maxPrefixed(prefixes, decl);
    let diff = max - utils$c.removeNote(prefix2).length;
    let before = decl.raw("before");
    if (diff > 0) {
      before += Array(diff).fill(" ").join("");
    }
    return before;
  }
  /**
   * Always true, because we already get prefixer by property name
   */
  check() {
    return true;
  }
  /**
   * Clone and insert new declaration
   */
  insert(decl, prefix2, prefixes) {
    let cloned = this.set(this.clone(decl), prefix2);
    if (!cloned)
      return void 0;
    let already = decl.parent.some(
      (i) => i.prop === cloned.prop && i.value === cloned.value
    );
    if (already) {
      return void 0;
    }
    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix2);
    }
    return decl.parent.insertBefore(decl, cloned);
  }
  /**
   * Did this declaration has this prefix above
   */
  isAlready(decl, prefixed) {
    let already = this.all.group(decl).up((i) => i.prop === prefixed);
    if (!already) {
      already = this.all.group(decl).down((i) => i.prop === prefixed);
    }
    return already;
  }
  /**
   * Return maximum length of possible prefixed property
   */
  maxPrefixed(prefixes, decl) {
    if (decl._autoprefixerMax) {
      return decl._autoprefixerMax;
    }
    let max = 0;
    for (let prefix2 of prefixes) {
      prefix2 = utils$c.removeNote(prefix2);
      if (prefix2.length > max) {
        max = prefix2.length;
      }
    }
    decl._autoprefixerMax = max;
    return decl._autoprefixerMax;
  }
  /**
   * Should we use visual cascade for prefixes
   */
  needCascade(decl) {
    if (!decl._autoprefixerCascade) {
      decl._autoprefixerCascade = this.all.options.cascade !== false && decl.raw("before").includes("\n");
    }
    return decl._autoprefixerCascade;
  }
  /**
   * Return unprefixed version of property
   */
  normalize(prop) {
    return prop;
  }
  /**
   * Return list of prefixed properties to clean old prefixes
   */
  old(prop, prefix2) {
    return [this.prefixed(prop, prefix2)];
  }
  /**
   * Check `value`, that it contain other prefixes, rather than `prefix`
   */
  otherPrefixes(value2, prefix2) {
    for (let other of Browsers$1.prefixes()) {
      if (other === prefix2) {
        continue;
      }
      if (value2.includes(other)) {
        return value2.replace(/var\([^)]+\)/, "").includes(other);
      }
    }
    return false;
  }
  /**
   * Return prefixed version of property
   */
  prefixed(prop, prefix2) {
    return prefix2 + prop;
  }
  /**
   * Add spaces for visual cascade
   */
  process(decl, result2) {
    if (!this.needCascade(decl)) {
      super.process(decl, result2);
      return;
    }
    let prefixes = super.process(decl, result2);
    if (!prefixes || !prefixes.length) {
      return;
    }
    this.restoreBefore(decl);
    decl.raws.before = this.calcBefore(prefixes, decl);
  }
  /**
   * Remove visual cascade
   */
  restoreBefore(decl) {
    let lines = decl.raw("before").split("\n");
    let min = lines[lines.length - 1];
    this.all.group(decl).up((prefixed) => {
      let array = prefixed.raw("before").split("\n");
      let last = array[array.length - 1];
      if (last.length < min.length) {
        min = last;
      }
    });
    lines[lines.length - 1] = min;
    decl.raws.before = lines.join("\n");
  }
  /**
   * Set prefix to declaration
   */
  set(decl, prefix2) {
    decl.prop = this.prefixed(decl.prop, prefix2);
    return decl;
  }
};
var declaration = Declaration$J;
var fraction = { exports: {} };
/**
 * @license Fraction.js v4.3.7 31/08/2023
 * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2023, Robert Eisele (robert@raw.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
(function(module, exports) {
  (function(root2) {
    var MAX_CYCLE_LEN = 2e3;
    var P = {
      "s": 1,
      "n": 0,
      "d": 1
    };
    function assign(n, s) {
      if (isNaN(n = parseInt(n, 10))) {
        throw InvalidParameter();
      }
      return n * s;
    }
    function newFraction(n, d) {
      if (d === 0) {
        throw DivisionByZero();
      }
      var f2 = Object.create(Fraction.prototype);
      f2["s"] = n < 0 ? -1 : 1;
      n = n < 0 ? -n : n;
      var a = gcd(n, d);
      f2["n"] = n / a;
      f2["d"] = d / a;
      return f2;
    }
    function factorize(num) {
      var factors = {};
      var n = num;
      var i = 2;
      var s = 4;
      while (s <= n) {
        while (n % i === 0) {
          n /= i;
          factors[i] = (factors[i] || 0) + 1;
        }
        s += 1 + 2 * i++;
      }
      if (n !== num) {
        if (n > 1)
          factors[n] = (factors[n] || 0) + 1;
      } else {
        factors[num] = (factors[num] || 0) + 1;
      }
      return factors;
    }
    var parse3 = function(p1, p2) {
      var n = 0, d = 1, s = 1;
      var v = 0, w = 0, x2 = 0, y = 1, z = 1;
      var A = 0, B = 1;
      var C = 1, D = 1;
      var N = 1e7;
      var M;
      if (p1 === void 0 || p1 === null)
        ;
      else if (p2 !== void 0) {
        n = p1;
        d = p2;
        s = n * d;
        if (n % 1 !== 0 || d % 1 !== 0) {
          throw NonIntegerParameter();
        }
      } else
        switch (typeof p1) {
          case "object": {
            if ("d" in p1 && "n" in p1) {
              n = p1["n"];
              d = p1["d"];
              if ("s" in p1)
                n *= p1["s"];
            } else if (0 in p1) {
              n = p1[0];
              if (1 in p1)
                d = p1[1];
            } else {
              throw InvalidParameter();
            }
            s = n * d;
            break;
          }
          case "number": {
            if (p1 < 0) {
              s = p1;
              p1 = -p1;
            }
            if (p1 % 1 === 0) {
              n = p1;
            } else if (p1 > 0) {
              if (p1 >= 1) {
                z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                p1 /= z;
              }
              while (B <= N && D <= N) {
                M = (A + C) / (B + D);
                if (p1 === M) {
                  if (B + D <= N) {
                    n = A + C;
                    d = B + D;
                  } else if (D > B) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                  break;
                } else {
                  if (p1 > M) {
                    A += C;
                    B += D;
                  } else {
                    C += A;
                    D += B;
                  }
                  if (B > N) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                }
              }
              n *= z;
            } else if (isNaN(p1) || isNaN(p2)) {
              d = n = NaN;
            }
            break;
          }
          case "string": {
            B = p1.match(/\d+|./g);
            if (B === null)
              throw InvalidParameter();
            if (B[A] === "-") {
              s = -1;
              A++;
            } else if (B[A] === "+") {
              A++;
            }
            if (B.length === A + 1) {
              w = assign(B[A++], s);
            } else if (B[A + 1] === "." || B[A] === ".") {
              if (B[A] !== ".") {
                v = assign(B[A++], s);
              }
              A++;
              if (A + 1 === B.length || B[A + 1] === "(" && B[A + 3] === ")" || B[A + 1] === "'" && B[A + 3] === "'") {
                w = assign(B[A], s);
                y = Math.pow(10, B[A].length);
                A++;
              }
              if (B[A] === "(" && B[A + 2] === ")" || B[A] === "'" && B[A + 2] === "'") {
                x2 = assign(B[A + 1], s);
                z = Math.pow(10, B[A + 1].length) - 1;
                A += 3;
              }
            } else if (B[A + 1] === "/" || B[A + 1] === ":") {
              w = assign(B[A], s);
              y = assign(B[A + 2], 1);
              A += 3;
            } else if (B[A + 3] === "/" && B[A + 1] === " ") {
              v = assign(B[A], s);
              w = assign(B[A + 2], s);
              y = assign(B[A + 4], 1);
              A += 5;
            }
            if (B.length <= A) {
              d = y * z;
              s = /* void */
              n = x2 + d * v + z * w;
              break;
            }
          }
          default:
            throw InvalidParameter();
        }
      if (d === 0) {
        throw DivisionByZero();
      }
      P["s"] = s < 0 ? -1 : 1;
      P["n"] = Math.abs(n);
      P["d"] = Math.abs(d);
    };
    function modpow(b, e, m) {
      var r = 1;
      for (; e > 0; b = b * b % m, e >>= 1) {
        if (e & 1) {
          r = r * b % m;
        }
      }
      return r;
    }
    function cycleLen(n, d) {
      for (; d % 2 === 0; d /= 2) {
      }
      for (; d % 5 === 0; d /= 5) {
      }
      if (d === 1)
        return 0;
      var rem = 10 % d;
      var t = 1;
      for (; rem !== 1; t++) {
        rem = rem * 10 % d;
        if (t > MAX_CYCLE_LEN)
          return 0;
      }
      return t;
    }
    function cycleStart(n, d, len) {
      var rem1 = 1;
      var rem2 = modpow(10, len, d);
      for (var t = 0; t < 300; t++) {
        if (rem1 === rem2)
          return t;
        rem1 = rem1 * 10 % d;
        rem2 = rem2 * 10 % d;
      }
      return 0;
    }
    function gcd(a, b) {
      if (!a)
        return b;
      if (!b)
        return a;
      while (1) {
        a %= b;
        if (!a)
          return b;
        b %= a;
        if (!b)
          return a;
      }
    }
    function Fraction(a, b) {
      parse3(a, b);
      if (this instanceof Fraction) {
        a = gcd(P["d"], P["n"]);
        this["s"] = P["s"];
        this["n"] = P["n"] / a;
        this["d"] = P["d"] / a;
      } else {
        return newFraction(P["s"] * P["n"], P["d"]);
      }
    }
    var DivisionByZero = function() {
      return new Error("Division by Zero");
    };
    var InvalidParameter = function() {
      return new Error("Invalid argument");
    };
    var NonIntegerParameter = function() {
      return new Error("Parameters must be integer");
    };
    Fraction.prototype = {
      "s": 1,
      "n": 0,
      "d": 1,
      /**
       * Calculates the absolute value
       *
       * Ex: new Fraction(-4).abs() => 4
       **/
      "abs": function() {
        return newFraction(this["n"], this["d"]);
      },
      /**
       * Inverts the sign of the current fraction
       *
       * Ex: new Fraction(-4).neg() => 4
       **/
      "neg": function() {
        return newFraction(-this["s"] * this["n"], this["d"]);
      },
      /**
       * Adds two rational numbers
       *
       * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
       **/
      "add": function(a, b) {
        parse3(a, b);
        return newFraction(
          this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
          this["d"] * P["d"]
        );
      },
      /**
       * Subtracts two rational numbers
       *
       * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
       **/
      "sub": function(a, b) {
        parse3(a, b);
        return newFraction(
          this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
          this["d"] * P["d"]
        );
      },
      /**
       * Multiplies two rational numbers
       *
       * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
       **/
      "mul": function(a, b) {
        parse3(a, b);
        return newFraction(
          this["s"] * P["s"] * this["n"] * P["n"],
          this["d"] * P["d"]
        );
      },
      /**
       * Divides two rational numbers
       *
       * Ex: new Fraction("-17.(345)").inverse().div(3)
       **/
      "div": function(a, b) {
        parse3(a, b);
        return newFraction(
          this["s"] * P["s"] * this["n"] * P["d"],
          this["d"] * P["n"]
        );
      },
      /**
       * Clones the actual object
       *
       * Ex: new Fraction("-17.(345)").clone()
       **/
      "clone": function() {
        return newFraction(this["s"] * this["n"], this["d"]);
      },
      /**
       * Calculates the modulo of two rational numbers - a more precise fmod
       *
       * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
       **/
      "mod": function(a, b) {
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction(NaN);
        }
        if (a === void 0) {
          return newFraction(this["s"] * this["n"] % this["d"], 1);
        }
        parse3(a, b);
        if (0 === P["n"] && 0 === this["d"]) {
          throw DivisionByZero();
        }
        return newFraction(
          this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
          P["d"] * this["d"]
        );
      },
      /**
       * Calculates the fractional gcd of two rational numbers
       *
       * Ex: new Fraction(5,8).gcd(3,7) => 1/56
       */
      "gcd": function(a, b) {
        parse3(a, b);
        return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
      },
      /**
       * Calculates the fractional lcm of two rational numbers
       *
       * Ex: new Fraction(5,8).lcm(3,7) => 15
       */
      "lcm": function(a, b) {
        parse3(a, b);
        if (P["n"] === 0 && this["n"] === 0) {
          return newFraction(0, 1);
        }
        return newFraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
      },
      /**
       * Calculates the ceil of a rational number
       *
       * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
       **/
      "ceil": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction(NaN);
        }
        return newFraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
      },
      /**
       * Calculates the floor of a rational number
       *
       * Ex: new Fraction('4.(3)').floor() => (4 / 1)
       **/
      "floor": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction(NaN);
        }
        return newFraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
      },
      /**
       * Rounds a rational numbers
       *
       * Ex: new Fraction('4.(3)').round() => (4 / 1)
       **/
      "round": function(places) {
        places = Math.pow(10, places || 0);
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return new Fraction(NaN);
        }
        return newFraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
      },
      /**
       * Rounds a rational number to a multiple of another rational number
       *
       * Ex: new Fraction('0.9').roundTo("1/8") => 7 / 8
       **/
      "roundTo": function(a, b) {
        parse3(a, b);
        return newFraction(this["s"] * Math.round(this["n"] * P["d"] / (this["d"] * P["n"])) * P["n"], P["d"]);
      },
      /**
       * Gets the inverse of the fraction, means numerator and denominator are exchanged
       *
       * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
       **/
      "inverse": function() {
        return newFraction(this["s"] * this["d"], this["n"]);
      },
      /**
       * Calculates the fraction to some rational exponent, if possible
       *
       * Ex: new Fraction(-1,2).pow(-3) => -8
       */
      "pow": function(a, b) {
        parse3(a, b);
        if (P["d"] === 1) {
          if (P["s"] < 0) {
            return newFraction(Math.pow(this["s"] * this["d"], P["n"]), Math.pow(this["n"], P["n"]));
          } else {
            return newFraction(Math.pow(this["s"] * this["n"], P["n"]), Math.pow(this["d"], P["n"]));
          }
        }
        if (this["s"] < 0)
          return null;
        var N = factorize(this["n"]);
        var D = factorize(this["d"]);
        var n = 1;
        var d = 1;
        for (var k in N) {
          if (k === "1")
            continue;
          if (k === "0") {
            n = 0;
            break;
          }
          N[k] *= P["n"];
          if (N[k] % P["d"] === 0) {
            N[k] /= P["d"];
          } else
            return null;
          n *= Math.pow(k, N[k]);
        }
        for (var k in D) {
          if (k === "1")
            continue;
          D[k] *= P["n"];
          if (D[k] % P["d"] === 0) {
            D[k] /= P["d"];
          } else
            return null;
          d *= Math.pow(k, D[k]);
        }
        if (P["s"] < 0) {
          return newFraction(d, n);
        }
        return newFraction(n, d);
      },
      /**
       * Check if two rational numbers are the same
       *
       * Ex: new Fraction(19.6).equals([98, 5]);
       **/
      "equals": function(a, b) {
        parse3(a, b);
        return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
      },
      /**
       * Check if two rational numbers are the same
       *
       * Ex: new Fraction(19.6).equals([98, 5]);
       **/
      "compare": function(a, b) {
        parse3(a, b);
        var t = this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"];
        return (0 < t) - (t < 0);
      },
      "simplify": function(eps) {
        if (isNaN(this["n"]) || isNaN(this["d"])) {
          return this;
        }
        eps = eps || 1e-3;
        var thisABS = this["abs"]();
        var cont = thisABS["toContinued"]();
        for (var i = 1; i < cont.length; i++) {
          var s = newFraction(cont[i - 1], 1);
          for (var k = i - 2; k >= 0; k--) {
            s = s["inverse"]()["add"](cont[k]);
          }
          if (Math.abs(s["sub"](thisABS).valueOf()) < eps) {
            return s["mul"](this["s"]);
          }
        }
        return this;
      },
      /**
       * Check if two rational numbers are divisible
       *
       * Ex: new Fraction(19.6).divisible(1.5);
       */
      "divisible": function(a, b) {
        parse3(a, b);
        return !(!(P["n"] * this["d"]) || this["n"] * P["d"] % (P["n"] * this["d"]));
      },
      /**
       * Returns a decimal representation of the fraction
       *
       * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
       **/
      "valueOf": function() {
        return this["s"] * this["n"] / this["d"];
      },
      /**
       * Returns a string-fraction representation of a Fraction object
       *
       * Ex: new Fraction("1.'3'").toFraction(true) => "4 1/3"
       **/
      "toFraction": function(excludeWhole) {
        var whole, str = "";
        var n = this["n"];
        var d = this["d"];
        if (this["s"] < 0) {
          str += "-";
        }
        if (d === 1) {
          str += n;
        } else {
          if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
            str += whole;
            str += " ";
            n %= d;
          }
          str += n;
          str += "/";
          str += d;
        }
        return str;
      },
      /**
       * Returns a latex representation of a Fraction object
       *
       * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
       **/
      "toLatex": function(excludeWhole) {
        var whole, str = "";
        var n = this["n"];
        var d = this["d"];
        if (this["s"] < 0) {
          str += "-";
        }
        if (d === 1) {
          str += n;
        } else {
          if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
            str += whole;
            n %= d;
          }
          str += "\\frac{";
          str += n;
          str += "}{";
          str += d;
          str += "}";
        }
        return str;
      },
      /**
       * Returns an array of continued fraction elements
       *
       * Ex: new Fraction("7/8").toContinued() => [0,1,7]
       */
      "toContinued": function() {
        var t;
        var a = this["n"];
        var b = this["d"];
        var res = [];
        if (isNaN(a) || isNaN(b)) {
          return res;
        }
        do {
          res.push(Math.floor(a / b));
          t = a % b;
          a = b;
          b = t;
        } while (a !== 1);
        return res;
      },
      /**
       * Creates a string representation of a fraction with all digits
       *
       * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
       **/
      "toString": function(dec) {
        var N = this["n"];
        var D = this["d"];
        if (isNaN(N) || isNaN(D)) {
          return "NaN";
        }
        dec = dec || 15;
        var cycLen = cycleLen(N, D);
        var cycOff = cycleStart(N, D, cycLen);
        var str = this["s"] < 0 ? "-" : "";
        str += N / D | 0;
        N %= D;
        N *= 10;
        if (N)
          str += ".";
        if (cycLen) {
          for (var i = cycOff; i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
          str += "(";
          for (var i = cycLen; i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
          str += ")";
        } else {
          for (var i = dec; N && i--; ) {
            str += N / D | 0;
            N %= D;
            N *= 10;
          }
        }
        return str;
      }
    };
    {
      Object.defineProperty(exports, "__esModule", { "value": true });
      exports["default"] = Fraction;
      module["exports"] = Fraction;
    }
  })();
})(fraction, fraction.exports);
var openParentheses = "(".charCodeAt(0);
var closeParentheses = ")".charCodeAt(0);
var singleQuote = "'".charCodeAt(0);
var doubleQuote = '"'.charCodeAt(0);
var backslash = "\\".charCodeAt(0);
var slash = "/".charCodeAt(0);
var comma = ",".charCodeAt(0);
var colon = ":".charCodeAt(0);
var star = "*".charCodeAt(0);
var uLower = "u".charCodeAt(0);
var uUpper = "U".charCodeAt(0);
var plus = "+".charCodeAt(0);
var isUnicodeRange = /^[a-f0-9?-]+$/i;
var parse$2 = function(input2) {
  var tokens = [];
  var value2 = input2;
  var next, quote, prev, token, escape, escapePos, whitespacePos, parenthesesOpenPos;
  var pos = 0;
  var code = value2.charCodeAt(pos);
  var max = value2.length;
  var stack = [{ nodes: tokens }];
  var balanced = 0;
  var parent;
  var name2 = "";
  var before = "";
  var after = "";
  while (pos < max) {
    if (code <= 32) {
      next = pos;
      do {
        next += 1;
        code = value2.charCodeAt(next);
      } while (code <= 32);
      token = value2.slice(pos, next);
      prev = tokens[tokens.length - 1];
      if (code === closeParentheses && balanced) {
        after = token;
      } else if (prev && prev.type === "div") {
        prev.after = token;
        prev.sourceEndIndex += token.length;
      } else if (code === comma || code === colon || code === slash && value2.charCodeAt(next + 1) !== star && (!parent || parent && parent.type === "function" && parent.value !== "calc")) {
        before = token;
      } else {
        tokens.push({
          type: "space",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      }
      pos = next;
    } else if (code === singleQuote || code === doubleQuote) {
      next = pos;
      quote = code === singleQuote ? "'" : '"';
      token = {
        type: "string",
        sourceIndex: pos,
        quote
      };
      do {
        escape = false;
        next = value2.indexOf(quote, next + 1);
        if (~next) {
          escapePos = next;
          while (value2.charCodeAt(escapePos - 1) === backslash) {
            escapePos -= 1;
            escape = !escape;
          }
        } else {
          value2 += quote;
          next = value2.length - 1;
          token.unclosed = true;
        }
      } while (escape);
      token.value = value2.slice(pos + 1, next);
      token.sourceEndIndex = token.unclosed ? next : next + 1;
      tokens.push(token);
      pos = next + 1;
      code = value2.charCodeAt(pos);
    } else if (code === slash && value2.charCodeAt(pos + 1) === star) {
      next = value2.indexOf("*/", pos);
      token = {
        type: "comment",
        sourceIndex: pos,
        sourceEndIndex: next + 2
      };
      if (next === -1) {
        token.unclosed = true;
        next = value2.length;
        token.sourceEndIndex = next;
      }
      token.value = value2.slice(pos + 2, next);
      tokens.push(token);
      pos = next + 2;
      code = value2.charCodeAt(pos);
    } else if ((code === slash || code === star) && parent && parent.type === "function" && parent.value === "calc") {
      token = value2[pos];
      tokens.push({
        type: "word",
        sourceIndex: pos - before.length,
        sourceEndIndex: pos + token.length,
        value: token
      });
      pos += 1;
      code = value2.charCodeAt(pos);
    } else if (code === slash || code === comma || code === colon) {
      token = value2[pos];
      tokens.push({
        type: "div",
        sourceIndex: pos - before.length,
        sourceEndIndex: pos + token.length,
        value: token,
        before,
        after: ""
      });
      before = "";
      pos += 1;
      code = value2.charCodeAt(pos);
    } else if (openParentheses === code) {
      next = pos;
      do {
        next += 1;
        code = value2.charCodeAt(next);
      } while (code <= 32);
      parenthesesOpenPos = pos;
      token = {
        type: "function",
        sourceIndex: pos - name2.length,
        value: name2,
        before: value2.slice(parenthesesOpenPos + 1, next)
      };
      pos = next;
      if (name2 === "url" && code !== singleQuote && code !== doubleQuote) {
        next -= 1;
        do {
          escape = false;
          next = value2.indexOf(")", next + 1);
          if (~next) {
            escapePos = next;
            while (value2.charCodeAt(escapePos - 1) === backslash) {
              escapePos -= 1;
              escape = !escape;
            }
          } else {
            value2 += ")";
            next = value2.length - 1;
            token.unclosed = true;
          }
        } while (escape);
        whitespacePos = next;
        do {
          whitespacePos -= 1;
          code = value2.charCodeAt(whitespacePos);
        } while (code <= 32);
        if (parenthesesOpenPos < whitespacePos) {
          if (pos !== whitespacePos + 1) {
            token.nodes = [
              {
                type: "word",
                sourceIndex: pos,
                sourceEndIndex: whitespacePos + 1,
                value: value2.slice(pos, whitespacePos + 1)
              }
            ];
          } else {
            token.nodes = [];
          }
          if (token.unclosed && whitespacePos + 1 !== next) {
            token.after = "";
            token.nodes.push({
              type: "space",
              sourceIndex: whitespacePos + 1,
              sourceEndIndex: next,
              value: value2.slice(whitespacePos + 1, next)
            });
          } else {
            token.after = value2.slice(whitespacePos + 1, next);
            token.sourceEndIndex = next;
          }
        } else {
          token.after = "";
          token.nodes = [];
        }
        pos = next + 1;
        token.sourceEndIndex = token.unclosed ? next : pos;
        code = value2.charCodeAt(pos);
        tokens.push(token);
      } else {
        balanced += 1;
        token.after = "";
        token.sourceEndIndex = pos + 1;
        tokens.push(token);
        stack.push(token);
        tokens = token.nodes = [];
        parent = token;
      }
      name2 = "";
    } else if (closeParentheses === code && balanced) {
      pos += 1;
      code = value2.charCodeAt(pos);
      parent.after = after;
      parent.sourceEndIndex += after.length;
      after = "";
      balanced -= 1;
      stack[stack.length - 1].sourceEndIndex = pos;
      stack.pop();
      parent = stack[balanced];
      tokens = parent.nodes;
    } else {
      next = pos;
      do {
        if (code === backslash) {
          next += 1;
        }
        next += 1;
        code = value2.charCodeAt(next);
      } while (next < max && !(code <= 32 || code === singleQuote || code === doubleQuote || code === comma || code === colon || code === slash || code === openParentheses || code === star && parent && parent.type === "function" && parent.value === "calc" || code === slash && parent.type === "function" && parent.value === "calc" || code === closeParentheses && balanced));
      token = value2.slice(pos, next);
      if (openParentheses === code) {
        name2 = token;
      } else if ((uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) && plus === token.charCodeAt(1) && isUnicodeRange.test(token.slice(2))) {
        tokens.push({
          type: "unicode-range",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      } else {
        tokens.push({
          type: "word",
          sourceIndex: pos,
          sourceEndIndex: next,
          value: token
        });
      }
      pos = next;
    }
  }
  for (pos = stack.length - 1; pos; pos -= 1) {
    stack[pos].unclosed = true;
    stack[pos].sourceEndIndex = value2.length;
  }
  return stack[0].nodes;
};
var walk$1 = function walk(nodes, cb, bubble) {
  var i, max, node2, result2;
  for (i = 0, max = nodes.length; i < max; i += 1) {
    node2 = nodes[i];
    if (!bubble) {
      result2 = cb(node2, i, nodes);
    }
    if (result2 !== false && node2.type === "function" && Array.isArray(node2.nodes)) {
      walk(node2.nodes, cb, bubble);
    }
    if (bubble) {
      cb(node2, i, nodes);
    }
  }
};
function stringifyNode(node2, custom) {
  var type = node2.type;
  var value2 = node2.value;
  var buf;
  var customResult;
  if (custom && (customResult = custom(node2)) !== void 0) {
    return customResult;
  } else if (type === "word" || type === "space") {
    return value2;
  } else if (type === "string") {
    buf = node2.quote || "";
    return buf + value2 + (node2.unclosed ? "" : buf);
  } else if (type === "comment") {
    return "/*" + value2 + (node2.unclosed ? "" : "*/");
  } else if (type === "div") {
    return (node2.before || "") + value2 + (node2.after || "");
  } else if (Array.isArray(node2.nodes)) {
    buf = stringify$1(node2.nodes, custom);
    if (type !== "function") {
      return buf;
    }
    return value2 + "(" + (node2.before || "") + buf + (node2.after || "") + (node2.unclosed ? "" : ")");
  }
  return value2;
}
function stringify$1(nodes, custom) {
  var result2, i;
  if (Array.isArray(nodes)) {
    result2 = "";
    for (i = nodes.length - 1; ~i; i -= 1) {
      result2 = stringifyNode(nodes[i], custom) + result2;
    }
    return result2;
  }
  return stringifyNode(nodes, custom);
}
var stringify_1 = stringify$1;
var unit;
var hasRequiredUnit;
function requireUnit() {
  if (hasRequiredUnit)
    return unit;
  hasRequiredUnit = 1;
  var minus = "-".charCodeAt(0);
  var plus2 = "+".charCodeAt(0);
  var dot = ".".charCodeAt(0);
  var exp = "e".charCodeAt(0);
  var EXP = "E".charCodeAt(0);
  function likeNumber(value2) {
    var code = value2.charCodeAt(0);
    var nextCode;
    if (code === plus2 || code === minus) {
      nextCode = value2.charCodeAt(1);
      if (nextCode >= 48 && nextCode <= 57) {
        return true;
      }
      var nextNextCode = value2.charCodeAt(2);
      if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) {
        return true;
      }
      return false;
    }
    if (code === dot) {
      nextCode = value2.charCodeAt(1);
      if (nextCode >= 48 && nextCode <= 57) {
        return true;
      }
      return false;
    }
    if (code >= 48 && code <= 57) {
      return true;
    }
    return false;
  }
  unit = function(value2) {
    var pos = 0;
    var length = value2.length;
    var code;
    var nextCode;
    var nextNextCode;
    if (length === 0 || !likeNumber(value2)) {
      return false;
    }
    code = value2.charCodeAt(pos);
    if (code === plus2 || code === minus) {
      pos++;
    }
    while (pos < length) {
      code = value2.charCodeAt(pos);
      if (code < 48 || code > 57) {
        break;
      }
      pos += 1;
    }
    code = value2.charCodeAt(pos);
    nextCode = value2.charCodeAt(pos + 1);
    if (code === dot && nextCode >= 48 && nextCode <= 57) {
      pos += 2;
      while (pos < length) {
        code = value2.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
    }
    code = value2.charCodeAt(pos);
    nextCode = value2.charCodeAt(pos + 1);
    nextNextCode = value2.charCodeAt(pos + 2);
    if ((code === exp || code === EXP) && (nextCode >= 48 && nextCode <= 57 || (nextCode === plus2 || nextCode === minus) && nextNextCode >= 48 && nextNextCode <= 57)) {
      pos += nextCode === plus2 || nextCode === minus ? 3 : 2;
      while (pos < length) {
        code = value2.charCodeAt(pos);
        if (code < 48 || code > 57) {
          break;
        }
        pos += 1;
      }
    }
    return {
      number: value2.slice(0, pos),
      unit: value2.slice(pos)
    };
  };
  return unit;
}
var parse$1 = parse$2;
var walk2 = walk$1;
var stringify = stringify_1;
function ValueParser(value2) {
  if (this instanceof ValueParser) {
    this.nodes = parse$1(value2);
    return this;
  }
  return new ValueParser(value2);
}
ValueParser.prototype.toString = function() {
  return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
};
ValueParser.prototype.walk = function(cb, bubble) {
  walk2(this.nodes, cb, bubble);
  return this;
};
ValueParser.unit = requireUnit();
ValueParser.walk = walk2;
ValueParser.stringify = stringify;
var lib = ValueParser;
let utils$b = utils$f;
let OldValue$5 = class OldValue {
  constructor(unprefixed, prefixed, string, regexp2) {
    this.unprefixed = unprefixed;
    this.prefixed = prefixed;
    this.string = string || prefixed;
    this.regexp = regexp2 || utils$b.regexp(prefixed);
  }
  /**
   * Check, that value contain old value
   */
  check(value2) {
    if (value2.includes(this.string)) {
      return !!value2.match(this.regexp);
    }
    return false;
  }
};
var oldValue = OldValue$5;
let Prefixer$1 = prefixer;
let OldValue$4 = oldValue;
let vendor = vendor$2;
let utils$a = utils$f;
let Value$a = class Value extends Prefixer$1 {
  /**
   * Clone decl for each prefixed values
   */
  static save(prefixes, decl) {
    let prop = decl.prop;
    let result2 = [];
    for (let prefix2 in decl._autoprefixerValues) {
      let value2 = decl._autoprefixerValues[prefix2];
      if (value2 === decl.value) {
        continue;
      }
      let item;
      let propPrefix = vendor.prefix(prop);
      if (propPrefix === "-pie-") {
        continue;
      }
      if (propPrefix === prefix2) {
        item = decl.value = value2;
        result2.push(item);
        continue;
      }
      let prefixed = prefixes.prefixed(prop, prefix2);
      let rule2 = decl.parent;
      if (!rule2.every((i) => i.prop !== prefixed)) {
        result2.push(item);
        continue;
      }
      let trimmed = value2.replace(/\s+/, " ");
      let already = rule2.some(
        (i) => i.prop === decl.prop && i.value.replace(/\s+/, " ") === trimmed
      );
      if (already) {
        result2.push(item);
        continue;
      }
      let cloned = this.clone(decl, { value: value2 });
      item = decl.parent.insertBefore(decl, cloned);
      result2.push(item);
    }
    return result2;
  }
  /**
   * Save values with next prefixed token
   */
  add(decl, prefix2) {
    if (!decl._autoprefixerValues) {
      decl._autoprefixerValues = {};
    }
    let value2 = decl._autoprefixerValues[prefix2] || this.value(decl);
    let before;
    do {
      before = value2;
      value2 = this.replace(value2, prefix2);
      if (value2 === false)
        return;
    } while (value2 !== before);
    decl._autoprefixerValues[prefix2] = value2;
  }
  /**
   * Is declaration need to be prefixed
   */
  check(decl) {
    let value2 = decl.value;
    if (!value2.includes(this.name)) {
      return false;
    }
    return !!value2.match(this.regexp());
  }
  /**
   * Return function to fast find prefixed value
   */
  old(prefix2) {
    return new OldValue$4(this.name, prefix2 + this.name);
  }
  /**
   * Lazy regexp loading
   */
  regexp() {
    return this.regexpCache || (this.regexpCache = utils$a.regexp(this.name));
  }
  /**
   * Add prefix to values in string
   */
  replace(string, prefix2) {
    return string.replace(this.regexp(), `$1${prefix2}$2`);
  }
  /**
   * Get value with comments if it was not changed
   */
  value(decl) {
    if (decl.raws.value && decl.raws.value.value === decl.value) {
      return decl.raws.value.raw;
    } else {
      return decl.value;
    }
  }
};
var value = Value$a;
var gridUtils = {};
let parser$2 = lib;
let list$3 = postcss_1.list;
let uniq = utils$f.uniq;
let escapeRegexp = utils$f.escapeRegexp;
let splitSelector = utils$f.splitSelector;
function convert(value2) {
  if (value2 && value2.length === 2 && value2[0] === "span" && parseInt(value2[1], 10) > 0) {
    return [false, parseInt(value2[1], 10)];
  }
  if (value2 && value2.length === 1 && parseInt(value2[0], 10) > 0) {
    return [parseInt(value2[0], 10), false];
  }
  return [false, false];
}
gridUtils.translate = translate;
function translate(values, startIndex, endIndex) {
  let startValue = values[startIndex];
  let endValue = values[endIndex];
  if (!startValue) {
    return [false, false];
  }
  let [start, spanStart] = convert(startValue);
  let [end, spanEnd] = convert(endValue);
  if (start && !endValue) {
    return [start, false];
  }
  if (spanStart && end) {
    return [end - spanStart, spanStart];
  }
  if (start && spanEnd) {
    return [start, spanEnd];
  }
  if (start && end) {
    return [start, end - start];
  }
  return [false, false];
}
gridUtils.parse = parse2;
function parse2(decl) {
  let node2 = parser$2(decl.value);
  let values = [];
  let current = 0;
  values[current] = [];
  for (let i of node2.nodes) {
    if (i.type === "div") {
      current += 1;
      values[current] = [];
    } else if (i.type === "word") {
      values[current].push(i.value);
    }
  }
  return values;
}
gridUtils.insertDecl = insertDecl;
function insertDecl(decl, prop, value2) {
  if (value2 && !decl.parent.some((i) => i.prop === `-ms-${prop}`)) {
    decl.cloneBefore({
      prop: `-ms-${prop}`,
      value: value2.toString()
    });
  }
}
gridUtils.prefixTrackProp = prefixTrackProp$2;
function prefixTrackProp$2({ prefix: prefix2, prop }) {
  return prefix2 + prop.replace("template-", "");
}
function transformRepeat({ nodes }, { gap }) {
  let { count, size } = nodes.reduce(
    (result2, node2) => {
      if (node2.type === "div" && node2.value === ",") {
        result2.key = "size";
      } else {
        result2[result2.key].push(parser$2.stringify(node2));
      }
      return result2;
    },
    {
      count: [],
      key: "count",
      size: []
    }
  );
  if (gap) {
    size = size.filter((i) => i.trim());
    let val = [];
    for (let i = 1; i <= count; i++) {
      size.forEach((item, index) => {
        if (index > 0 || i > 1) {
          val.push(gap);
        }
        val.push(item);
      });
    }
    return val.join(" ");
  }
  return `(${size.join("")})[${count.join("")}]`;
}
gridUtils.prefixTrackValue = prefixTrackValue$2;
function prefixTrackValue$2({ gap, value: value2 }) {
  let result2 = parser$2(value2).nodes.reduce((nodes, node2) => {
    if (node2.type === "function" && node2.value === "repeat") {
      return nodes.concat({
        type: "word",
        value: transformRepeat(node2, { gap })
      });
    }
    if (gap && node2.type === "space") {
      return nodes.concat(
        {
          type: "space",
          value: " "
        },
        {
          type: "word",
          value: gap
        },
        node2
      );
    }
    return nodes.concat(node2);
  }, []);
  return parser$2.stringify(result2);
}
let DOTS = /^\.+$/;
function track(start, end) {
  return { end, span: end - start, start };
}
function getColumns(line) {
  return line.trim().split(/\s+/g);
}
gridUtils.parseGridAreas = parseGridAreas$1;
function parseGridAreas$1({ gap, rows }) {
  return rows.reduce((areas, line, rowIndex) => {
    if (gap.row)
      rowIndex *= 2;
    if (line.trim() === "")
      return areas;
    getColumns(line).forEach((area, columnIndex) => {
      if (DOTS.test(area))
        return;
      if (gap.column)
        columnIndex *= 2;
      if (typeof areas[area] === "undefined") {
        areas[area] = {
          column: track(columnIndex + 1, columnIndex + 2),
          row: track(rowIndex + 1, rowIndex + 2)
        };
      } else {
        let { column, row } = areas[area];
        column.start = Math.min(column.start, columnIndex + 1);
        column.end = Math.max(column.end, columnIndex + 2);
        column.span = column.end - column.start;
        row.start = Math.min(row.start, rowIndex + 1);
        row.end = Math.max(row.end, rowIndex + 2);
        row.span = row.end - row.start;
      }
    });
    return areas;
  }, {});
}
function testTrack(node2) {
  return node2.type === "word" && /^\[.+]$/.test(node2.value);
}
function verifyRowSize(result2) {
  if (result2.areas.length > result2.rows.length) {
    result2.rows.push("auto");
  }
  return result2;
}
gridUtils.parseTemplate = parseTemplate$1;
function parseTemplate$1({ decl, gap }) {
  let gridTemplate2 = parser$2(decl.value).nodes.reduce(
    (result2, node2) => {
      let { type, value: value2 } = node2;
      if (testTrack(node2) || type === "space")
        return result2;
      if (type === "string") {
        result2 = verifyRowSize(result2);
        result2.areas.push(value2);
      }
      if (type === "word" || type === "function") {
        result2[result2.key].push(parser$2.stringify(node2));
      }
      if (type === "div" && value2 === "/") {
        result2.key = "columns";
        result2 = verifyRowSize(result2);
      }
      return result2;
    },
    {
      areas: [],
      columns: [],
      key: "rows",
      rows: []
    }
  );
  return {
    areas: parseGridAreas$1({
      gap,
      rows: gridTemplate2.areas
    }),
    columns: prefixTrackValue$2({
      gap: gap.column,
      value: gridTemplate2.columns.join(" ")
    }),
    rows: prefixTrackValue$2({
      gap: gap.row,
      value: gridTemplate2.rows.join(" ")
    })
  };
}
function getMSDecls(area, addRowSpan = false, addColumnSpan = false) {
  let result2 = [
    {
      prop: "-ms-grid-row",
      value: String(area.row.start)
    }
  ];
  if (area.row.span > 1 || addRowSpan) {
    result2.push({
      prop: "-ms-grid-row-span",
      value: String(area.row.span)
    });
  }
  result2.push({
    prop: "-ms-grid-column",
    value: String(area.column.start)
  });
  if (area.column.span > 1 || addColumnSpan) {
    result2.push({
      prop: "-ms-grid-column-span",
      value: String(area.column.span)
    });
  }
  return result2;
}
function getParentMedia(parent) {
  if (parent.type === "atrule" && parent.name === "media") {
    return parent;
  }
  if (!parent.parent) {
    return false;
  }
  return getParentMedia(parent.parent);
}
function changeDuplicateAreaSelectors(ruleSelectors, templateSelectors) {
  ruleSelectors = ruleSelectors.map((selector2) => {
    let selectorBySpace = list$3.space(selector2);
    let selectorByComma = list$3.comma(selector2);
    if (selectorBySpace.length > selectorByComma.length) {
      selector2 = selectorBySpace.slice(-1).join("");
    }
    return selector2;
  });
  return ruleSelectors.map((ruleSelector) => {
    let newSelector = templateSelectors.map((tplSelector, index) => {
      let space = index === 0 ? "" : " ";
      return `${space}${tplSelector} > ${ruleSelector}`;
    });
    return newSelector;
  });
}
function selectorsEqual(ruleA, ruleB) {
  return ruleA.selectors.some((sel) => {
    return ruleB.selectors.includes(sel);
  });
}
function parseGridTemplatesData(css) {
  let parsed = [];
  css.walkDecls(/grid-template(-areas)?$/, (d) => {
    let rule2 = d.parent;
    let media = getParentMedia(rule2);
    let gap = getGridGap$3(d);
    let inheritedGap = inheritGridGap$3(d, gap);
    let { areas } = parseTemplate$1({ decl: d, gap: inheritedGap || gap });
    let areaNames = Object.keys(areas);
    if (areaNames.length === 0) {
      return true;
    }
    let index = parsed.reduce((acc, { allAreas }, idx) => {
      let hasAreas = allAreas && areaNames.some((area) => allAreas.includes(area));
      return hasAreas ? idx : acc;
    }, null);
    if (index !== null) {
      let { allAreas, rules } = parsed[index];
      let hasNoDuplicates = rules.some((r) => {
        return r.hasDuplicates === false && selectorsEqual(r, rule2);
      });
      let duplicatesFound = false;
      let duplicateAreaNames = rules.reduce((acc, r) => {
        if (!r.params && selectorsEqual(r, rule2)) {
          duplicatesFound = true;
          return r.duplicateAreaNames;
        }
        if (!duplicatesFound) {
          areaNames.forEach((name2) => {
            if (r.areas[name2]) {
              acc.push(name2);
            }
          });
        }
        return uniq(acc);
      }, []);
      rules.forEach((r) => {
        areaNames.forEach((name2) => {
          let area = r.areas[name2];
          if (area && area.row.span !== areas[name2].row.span) {
            areas[name2].row.updateSpan = true;
          }
          if (area && area.column.span !== areas[name2].column.span) {
            areas[name2].column.updateSpan = true;
          }
        });
      });
      parsed[index].allAreas = uniq([...allAreas, ...areaNames]);
      parsed[index].rules.push({
        areas,
        duplicateAreaNames,
        hasDuplicates: !hasNoDuplicates,
        node: rule2,
        params: media.params,
        selectors: rule2.selectors
      });
    } else {
      parsed.push({
        allAreas: areaNames,
        areasCount: 0,
        rules: [
          {
            areas,
            duplicateAreaNames: [],
            duplicateRules: [],
            hasDuplicates: false,
            node: rule2,
            params: media.params,
            selectors: rule2.selectors
          }
        ]
      });
    }
    return void 0;
  });
  return parsed;
}
gridUtils.insertAreas = insertAreas$1;
function insertAreas$1(css, isDisabled) {
  let gridTemplatesData = parseGridTemplatesData(css);
  if (gridTemplatesData.length === 0) {
    return void 0;
  }
  let rulesToInsert = {};
  css.walkDecls("grid-area", (gridArea2) => {
    let gridAreaRule = gridArea2.parent;
    let hasPrefixedRow = gridAreaRule.first.prop === "-ms-grid-row";
    let gridAreaMedia = getParentMedia(gridAreaRule);
    if (isDisabled(gridArea2)) {
      return void 0;
    }
    let gridAreaRuleIndex = css.index(gridAreaMedia || gridAreaRule);
    let value2 = gridArea2.value;
    let data2 = gridTemplatesData.filter((d) => d.allAreas.includes(value2))[0];
    if (!data2) {
      return true;
    }
    let lastArea = data2.allAreas[data2.allAreas.length - 1];
    let selectorBySpace = list$3.space(gridAreaRule.selector);
    let selectorByComma = list$3.comma(gridAreaRule.selector);
    let selectorIsComplex = selectorBySpace.length > 1 && selectorBySpace.length > selectorByComma.length;
    if (hasPrefixedRow) {
      return false;
    }
    if (!rulesToInsert[lastArea]) {
      rulesToInsert[lastArea] = {};
    }
    let lastRuleIsSet = false;
    for (let rule2 of data2.rules) {
      let area = rule2.areas[value2];
      let hasDuplicateName = rule2.duplicateAreaNames.includes(value2);
      if (!area) {
        let lastRule = rulesToInsert[lastArea].lastRule;
        let lastRuleIndex;
        if (lastRule) {
          lastRuleIndex = css.index(lastRule);
        } else {
          lastRuleIndex = -1;
        }
        if (gridAreaRuleIndex > lastRuleIndex) {
          rulesToInsert[lastArea].lastRule = gridAreaMedia || gridAreaRule;
        }
        continue;
      }
      if (rule2.params && !rulesToInsert[lastArea][rule2.params]) {
        rulesToInsert[lastArea][rule2.params] = [];
      }
      if ((!rule2.hasDuplicates || !hasDuplicateName) && !rule2.params) {
        getMSDecls(area, false, false).reverse().forEach(
          (i) => gridAreaRule.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea2.raws.between
              }
            })
          )
        );
        rulesToInsert[lastArea].lastRule = gridAreaRule;
        lastRuleIsSet = true;
      } else if (rule2.hasDuplicates && !rule2.params && !selectorIsComplex) {
        let cloned = gridAreaRule.clone();
        cloned.removeAll();
        getMSDecls(area, area.row.updateSpan, area.column.updateSpan).reverse().forEach(
          (i) => cloned.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea2.raws.between
              }
            })
          )
        );
        cloned.selectors = changeDuplicateAreaSelectors(
          cloned.selectors,
          rule2.selectors
        );
        if (rulesToInsert[lastArea].lastRule) {
          rulesToInsert[lastArea].lastRule.after(cloned);
        }
        rulesToInsert[lastArea].lastRule = cloned;
        lastRuleIsSet = true;
      } else if (rule2.hasDuplicates && !rule2.params && selectorIsComplex && gridAreaRule.selector.includes(rule2.selectors[0])) {
        gridAreaRule.walkDecls(/-ms-grid-(row|column)/, (d) => d.remove());
        getMSDecls(area, area.row.updateSpan, area.column.updateSpan).reverse().forEach(
          (i) => gridAreaRule.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea2.raws.between
              }
            })
          )
        );
      } else if (rule2.params) {
        let cloned = gridAreaRule.clone();
        cloned.removeAll();
        getMSDecls(area, area.row.updateSpan, area.column.updateSpan).reverse().forEach(
          (i) => cloned.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea2.raws.between
              }
            })
          )
        );
        if (rule2.hasDuplicates && hasDuplicateName) {
          cloned.selectors = changeDuplicateAreaSelectors(
            cloned.selectors,
            rule2.selectors
          );
        }
        cloned.raws = rule2.node.raws;
        if (css.index(rule2.node.parent) > gridAreaRuleIndex) {
          rule2.node.parent.append(cloned);
        } else {
          rulesToInsert[lastArea][rule2.params].push(cloned);
        }
        if (!lastRuleIsSet) {
          rulesToInsert[lastArea].lastRule = gridAreaMedia || gridAreaRule;
        }
      }
    }
    return void 0;
  });
  Object.keys(rulesToInsert).forEach((area) => {
    let data2 = rulesToInsert[area];
    let lastRule = data2.lastRule;
    Object.keys(data2).reverse().filter((p) => p !== "lastRule").forEach((params) => {
      if (data2[params].length > 0 && lastRule) {
        lastRule.after({ name: "media", params });
        lastRule.next().append(data2[params]);
      }
    });
  });
  return void 0;
}
gridUtils.warnMissedAreas = warnMissedAreas$2;
function warnMissedAreas$2(areas, decl, result2) {
  let missed = Object.keys(areas);
  decl.root().walkDecls("grid-area", (gridArea2) => {
    missed = missed.filter((e) => e !== gridArea2.value);
  });
  if (missed.length > 0) {
    decl.warn(result2, "Can not find grid areas: " + missed.join(", "));
  }
  return void 0;
}
gridUtils.warnTemplateSelectorNotFound = warnTemplateSelectorNotFound;
function warnTemplateSelectorNotFound(decl, result2) {
  let rule2 = decl.parent;
  let root2 = decl.root();
  let duplicatesFound = false;
  let slicedSelectorArr = list$3.space(rule2.selector).filter((str) => str !== ">").slice(0, -1);
  if (slicedSelectorArr.length > 0) {
    let gridTemplateFound = false;
    let foundAreaSelector = null;
    root2.walkDecls(/grid-template(-areas)?$/, (d) => {
      let parent = d.parent;
      let templateSelectors = parent.selectors;
      let { areas } = parseTemplate$1({ decl: d, gap: getGridGap$3(d) });
      let hasArea = areas[decl.value];
      for (let tplSelector of templateSelectors) {
        if (gridTemplateFound) {
          break;
        }
        let tplSelectorArr = list$3.space(tplSelector).filter((str) => str !== ">");
        gridTemplateFound = tplSelectorArr.every(
          (item, idx) => item === slicedSelectorArr[idx]
        );
      }
      if (gridTemplateFound || !hasArea) {
        return true;
      }
      if (!foundAreaSelector) {
        foundAreaSelector = parent.selector;
      }
      if (foundAreaSelector && foundAreaSelector !== parent.selector) {
        duplicatesFound = true;
      }
      return void 0;
    });
    if (!gridTemplateFound && duplicatesFound) {
      decl.warn(
        result2,
        `Autoprefixer cannot find a grid-template containing the duplicate grid-area "${decl.value}" with full selector matching: ${slicedSelectorArr.join(" ")}`
      );
    }
  }
}
gridUtils.warnIfGridRowColumnExists = warnIfGridRowColumnExists;
function warnIfGridRowColumnExists(decl, result2) {
  let rule2 = decl.parent;
  let decls = [];
  rule2.walkDecls(/^grid-(row|column)/, (d) => {
    if (!d.prop.endsWith("-end") && !d.value.startsWith("span") && !d.prop.endsWith("-gap")) {
      decls.push(d);
    }
  });
  if (decls.length > 0) {
    decls.forEach((d) => {
      d.warn(
        result2,
        `You already have a grid-area declaration present in the rule. You should use either grid-area or ${d.prop}, not both`
      );
    });
  }
  return void 0;
}
gridUtils.getGridGap = getGridGap$3;
function getGridGap$3(decl) {
  let gap = {};
  let testGap = /^(grid-)?((row|column)-)?gap$/;
  decl.parent.walkDecls(testGap, ({ prop, value: value2 }) => {
    if (/^(grid-)?gap$/.test(prop)) {
      let [row, , column] = parser$2(value2).nodes;
      gap.row = row && parser$2.stringify(row);
      gap.column = column ? parser$2.stringify(column) : gap.row;
    }
    if (/^(grid-)?row-gap$/.test(prop))
      gap.row = value2;
    if (/^(grid-)?column-gap$/.test(prop))
      gap.column = value2;
  });
  return gap;
}
function parseMediaParams(params) {
  if (!params) {
    return [];
  }
  let parsed = parser$2(params);
  let prop;
  let value2;
  parsed.walk((node2) => {
    if (node2.type === "word" && /min|max/g.test(node2.value)) {
      prop = node2.value;
    } else if (node2.value.includes("px")) {
      value2 = parseInt(node2.value.replace(/\D/g, ""));
    }
  });
  return [prop, value2];
}
function shouldInheritGap(selA, selB) {
  let result2;
  let splitSelectorArrA = splitSelector(selA);
  let splitSelectorArrB = splitSelector(selB);
  if (splitSelectorArrA[0].length < splitSelectorArrB[0].length) {
    return false;
  } else if (splitSelectorArrA[0].length > splitSelectorArrB[0].length) {
    let idx = splitSelectorArrA[0].reduce((res, [item], index) => {
      let firstSelectorPart = splitSelectorArrB[0][0][0];
      if (item === firstSelectorPart) {
        return index;
      }
      return false;
    }, false);
    if (idx) {
      result2 = splitSelectorArrB[0].every((arr, index) => {
        return arr.every(
          (part, innerIndex) => (
            // because selectorA has more space elements, we need to slice
            // selectorA array by 'idx' number to compare them
            splitSelectorArrA[0].slice(idx)[index][innerIndex] === part
          )
        );
      });
    }
  } else {
    result2 = splitSelectorArrB.some((byCommaArr) => {
      return byCommaArr.every((bySpaceArr, index) => {
        return bySpaceArr.every(
          (part, innerIndex) => splitSelectorArrA[0][index][innerIndex] === part
        );
      });
    });
  }
  return result2;
}
gridUtils.inheritGridGap = inheritGridGap$3;
function inheritGridGap$3(decl, gap) {
  let rule2 = decl.parent;
  let mediaRule = getParentMedia(rule2);
  let root2 = rule2.root();
  let splitSelectorArr = splitSelector(rule2.selector);
  if (Object.keys(gap).length > 0) {
    return false;
  }
  let [prop] = parseMediaParams(mediaRule.params);
  let lastBySpace = splitSelectorArr[0];
  let escaped = escapeRegexp(lastBySpace[lastBySpace.length - 1][0]);
  let regexp2 = new RegExp(`(${escaped}$)|(${escaped}[,.])`);
  let closestRuleGap;
  root2.walkRules(regexp2, (r) => {
    let gridGap;
    if (rule2.toString() === r.toString()) {
      return false;
    }
    r.walkDecls("grid-gap", (d) => gridGap = getGridGap$3(d));
    if (!gridGap || Object.keys(gridGap).length === 0) {
      return true;
    }
    if (!shouldInheritGap(rule2.selector, r.selector)) {
      return true;
    }
    let media = getParentMedia(r);
    if (media) {
      let propToCompare = parseMediaParams(media.params)[0];
      if (propToCompare === prop) {
        closestRuleGap = gridGap;
        return true;
      }
    } else {
      closestRuleGap = gridGap;
      return true;
    }
    return void 0;
  });
  if (closestRuleGap && Object.keys(closestRuleGap).length > 0) {
    return closestRuleGap;
  }
  return false;
}
gridUtils.warnGridGap = warnGridGap$2;
function warnGridGap$2({ decl, gap, hasColumns, result: result2 }) {
  let hasBothGaps = gap.row && gap.column;
  if (!hasColumns && (hasBothGaps || gap.column && !gap.row)) {
    delete gap.column;
    decl.warn(
      result2,
      "Can not implement grid-gap without grid-template-columns"
    );
  }
}
function normalizeRowColumn(str) {
  let normalized = parser$2(str).nodes.reduce((result2, node2) => {
    if (node2.type === "function" && node2.value === "repeat") {
      let key = "count";
      let [count, value2] = node2.nodes.reduce(
        (acc, n) => {
          if (n.type === "word" && key === "count") {
            acc[0] = Math.abs(parseInt(n.value));
            return acc;
          }
          if (n.type === "div" && n.value === ",") {
            key = "value";
            return acc;
          }
          if (key === "value") {
            acc[1] += parser$2.stringify(n);
          }
          return acc;
        },
        [0, ""]
      );
      if (count) {
        for (let i = 0; i < count; i++) {
          result2.push(value2);
        }
      }
      return result2;
    }
    if (node2.type === "space") {
      return result2;
    }
    return result2.concat(parser$2.stringify(node2));
  }, []);
  return normalized;
}
gridUtils.autoplaceGridItems = autoplaceGridItems$1;
function autoplaceGridItems$1(decl, result2, gap, autoflowValue = "row") {
  let { parent } = decl;
  let rowDecl = parent.nodes.find((i) => i.prop === "grid-template-rows");
  let rows = normalizeRowColumn(rowDecl.value);
  let columns = normalizeRowColumn(decl.value);
  let filledRows = rows.map((_, rowIndex) => {
    return Array.from(
      { length: columns.length },
      (v, k) => k + rowIndex * columns.length + 1
    ).join(" ");
  });
  let areas = parseGridAreas$1({ gap, rows: filledRows });
  let keys = Object.keys(areas);
  let items = keys.map((i) => areas[i]);
  if (autoflowValue.includes("column")) {
    items = items.sort((a, b) => a.column.start - b.column.start);
  }
  items.reverse().forEach((item, index) => {
    let { column, row } = item;
    let nodeSelector = parent.selectors.map((sel) => sel + ` > *:nth-child(${keys.length - index})`).join(", ");
    let node2 = parent.clone().removeAll();
    node2.selector = nodeSelector;
    node2.append({ prop: "-ms-grid-row", value: row.start });
    node2.append({ prop: "-ms-grid-column", value: column.start });
    parent.after(node2);
  });
  return void 0;
}
let parser$1 = lib;
let Value$9 = value;
let insertAreas = gridUtils.insertAreas;
const OLD_LINEAR = /(^|[^-])linear-gradient\(\s*(top|left|right|bottom)/i;
const OLD_RADIAL = /(^|[^-])radial-gradient\(\s*\d+(\w*|%)\s+\d+(\w*|%)\s*,/i;
const IGNORE_NEXT = /(!\s*)?autoprefixer:\s*ignore\s+next/i;
const GRID_REGEX = /(!\s*)?autoprefixer\s*grid:\s*(on|off|(no-)?autoplace)/i;
const SIZES = [
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "inline-size",
  "min-inline-size",
  "max-inline-size",
  "block-size",
  "min-block-size",
  "max-block-size"
];
function hasGridTemplate(decl) {
  return decl.parent.some(
    (i) => i.prop === "grid-template" || i.prop === "grid-template-areas"
  );
}
function hasRowsAndColumns(decl) {
  let hasRows = decl.parent.some((i) => i.prop === "grid-template-rows");
  let hasColumns = decl.parent.some((i) => i.prop === "grid-template-columns");
  return hasRows && hasColumns;
}
let Processor$1 = class Processor2 {
  constructor(prefixes) {
    this.prefixes = prefixes;
  }
  /**
   * Add necessary prefixes
   */
  add(css, result2) {
    let resolution = this.prefixes.add["@resolution"];
    let keyframes = this.prefixes.add["@keyframes"];
    let viewport = this.prefixes.add["@viewport"];
    let supports = this.prefixes.add["@supports"];
    css.walkAtRules((rule2) => {
      if (rule2.name === "keyframes") {
        if (!this.disabled(rule2, result2)) {
          return keyframes && keyframes.process(rule2);
        }
      } else if (rule2.name === "viewport") {
        if (!this.disabled(rule2, result2)) {
          return viewport && viewport.process(rule2);
        }
      } else if (rule2.name === "supports") {
        if (this.prefixes.options.supports !== false && !this.disabled(rule2, result2)) {
          return supports.process(rule2);
        }
      } else if (rule2.name === "media" && rule2.params.includes("-resolution")) {
        if (!this.disabled(rule2, result2)) {
          return resolution && resolution.process(rule2);
        }
      }
      return void 0;
    });
    css.walkRules((rule2) => {
      if (this.disabled(rule2, result2))
        return void 0;
      return this.prefixes.add.selectors.map((selector2) => {
        return selector2.process(rule2, result2);
      });
    });
    function insideGrid(decl) {
      return decl.parent.nodes.some((node2) => {
        if (node2.type !== "decl")
          return false;
        let displayGrid2 = node2.prop === "display" && /(inline-)?grid/.test(node2.value);
        let gridTemplate2 = node2.prop.startsWith("grid-template");
        let gridGap = /^grid-([A-z]+-)?gap/.test(node2.prop);
        return displayGrid2 || gridTemplate2 || gridGap;
      });
    }
    let gridPrefixes = this.gridStatus(css, result2) && this.prefixes.add["grid-area"] && this.prefixes.add["grid-area"].prefixes;
    css.walkDecls((decl) => {
      if (this.disabledDecl(decl, result2))
        return void 0;
      let parent = decl.parent;
      let prop = decl.prop;
      let value2 = decl.value;
      if (prop === "color-adjust") {
        if (parent.every((i) => i.prop !== "print-color-adjust")) {
          result2.warn(
            "Replace color-adjust to print-color-adjust. The color-adjust shorthand is currently deprecated.",
            { node: decl }
          );
        }
      } else if (prop === "grid-row-span") {
        result2.warn(
          "grid-row-span is not part of final Grid Layout. Use grid-row.",
          { node: decl }
        );
        return void 0;
      } else if (prop === "grid-column-span") {
        result2.warn(
          "grid-column-span is not part of final Grid Layout. Use grid-column.",
          { node: decl }
        );
        return void 0;
      } else if (prop === "display" && value2 === "box") {
        result2.warn(
          "You should write display: flex by final spec instead of display: box",
          { node: decl }
        );
        return void 0;
      } else if (prop === "text-emphasis-position") {
        if (value2 === "under" || value2 === "over") {
          result2.warn(
            "You should use 2 values for text-emphasis-position For example, `under left` instead of just `under`.",
            { node: decl }
          );
        }
      } else if (prop === "text-decoration-skip" && value2 === "ink") {
        result2.warn(
          "Replace text-decoration-skip: ink to text-decoration-skip-ink: auto, because spec had been changed",
          { node: decl }
        );
      } else {
        if (gridPrefixes && this.gridStatus(decl, result2)) {
          if (decl.value === "subgrid") {
            result2.warn("IE does not support subgrid", { node: decl });
          }
          if (/^(align|justify|place)-items$/.test(prop) && insideGrid(decl)) {
            let fixed = prop.replace("-items", "-self");
            result2.warn(
              `IE does not support ${prop} on grid containers. Try using ${fixed} on child elements instead: ${decl.parent.selector} > * { ${fixed}: ${decl.value} }`,
              { node: decl }
            );
          } else if (/^(align|justify|place)-content$/.test(prop) && insideGrid(decl)) {
            result2.warn(`IE does not support ${decl.prop} on grid containers`, {
              node: decl
            });
          } else if (prop === "display" && decl.value === "contents") {
            result2.warn(
              "Please do not use display: contents; if you have grid setting enabled",
              { node: decl }
            );
            return void 0;
          } else if (decl.prop === "grid-gap") {
            let status = this.gridStatus(decl, result2);
            if (status === "autoplace" && !hasRowsAndColumns(decl) && !hasGridTemplate(decl)) {
              result2.warn(
                "grid-gap only works if grid-template(-areas) is being used or both rows and columns have been declared and cells have not been manually placed inside the explicit grid",
                { node: decl }
              );
            } else if ((status === true || status === "no-autoplace") && !hasGridTemplate(decl)) {
              result2.warn(
                "grid-gap only works if grid-template(-areas) is being used",
                { node: decl }
              );
            }
          } else if (prop === "grid-auto-columns") {
            result2.warn("grid-auto-columns is not supported by IE", {
              node: decl
            });
            return void 0;
          } else if (prop === "grid-auto-rows") {
            result2.warn("grid-auto-rows is not supported by IE", { node: decl });
            return void 0;
          } else if (prop === "grid-auto-flow") {
            let hasRows = parent.some((i) => i.prop === "grid-template-rows");
            let hasCols = parent.some((i) => i.prop === "grid-template-columns");
            if (hasGridTemplate(decl)) {
              result2.warn("grid-auto-flow is not supported by IE", {
                node: decl
              });
            } else if (value2.includes("dense")) {
              result2.warn("grid-auto-flow: dense is not supported by IE", {
                node: decl
              });
            } else if (!hasRows && !hasCols) {
              result2.warn(
                "grid-auto-flow works only if grid-template-rows and grid-template-columns are present in the same rule",
                { node: decl }
              );
            }
            return void 0;
          } else if (value2.includes("auto-fit")) {
            result2.warn("auto-fit value is not supported by IE", {
              node: decl,
              word: "auto-fit"
            });
            return void 0;
          } else if (value2.includes("auto-fill")) {
            result2.warn("auto-fill value is not supported by IE", {
              node: decl,
              word: "auto-fill"
            });
            return void 0;
          } else if (prop.startsWith("grid-template") && value2.includes("[")) {
            result2.warn(
              "Autoprefixer currently does not support line names. Try using grid-template-areas instead.",
              { node: decl, word: "[" }
            );
          }
        }
        if (value2.includes("radial-gradient")) {
          if (OLD_RADIAL.test(decl.value)) {
            result2.warn(
              "Gradient has outdated direction syntax. New syntax is like `closest-side at 0 0` instead of `0 0, closest-side`.",
              { node: decl }
            );
          } else {
            let ast = parser$1(value2);
            for (let i of ast.nodes) {
              if (i.type === "function" && i.value === "radial-gradient") {
                for (let word of i.nodes) {
                  if (word.type === "word") {
                    if (word.value === "cover") {
                      result2.warn(
                        "Gradient has outdated direction syntax. Replace `cover` to `farthest-corner`.",
                        { node: decl }
                      );
                    } else if (word.value === "contain") {
                      result2.warn(
                        "Gradient has outdated direction syntax. Replace `contain` to `closest-side`.",
                        { node: decl }
                      );
                    }
                  }
                }
              }
            }
          }
        }
        if (value2.includes("linear-gradient")) {
          if (OLD_LINEAR.test(value2)) {
            result2.warn(
              "Gradient has outdated direction syntax. New syntax is like `to left` instead of `right`.",
              { node: decl }
            );
          }
        }
      }
      if (SIZES.includes(decl.prop)) {
        if (!decl.value.includes("-fill-available")) {
          if (decl.value.includes("fill-available")) {
            result2.warn(
              "Replace fill-available to stretch, because spec had been changed",
              { node: decl }
            );
          } else if (decl.value.includes("fill")) {
            let ast = parser$1(value2);
            if (ast.nodes.some((i) => i.type === "word" && i.value === "fill")) {
              result2.warn(
                "Replace fill to stretch, because spec had been changed",
                { node: decl }
              );
            }
          }
        }
      }
      let prefixer2;
      if (decl.prop === "transition" || decl.prop === "transition-property") {
        return this.prefixes.transition.add(decl, result2);
      } else if (decl.prop === "align-self") {
        let display = this.displayType(decl);
        if (display !== "grid" && this.prefixes.options.flexbox !== false) {
          prefixer2 = this.prefixes.add["align-self"];
          if (prefixer2 && prefixer2.prefixes) {
            prefixer2.process(decl);
          }
        }
        if (this.gridStatus(decl, result2) !== false) {
          prefixer2 = this.prefixes.add["grid-row-align"];
          if (prefixer2 && prefixer2.prefixes) {
            return prefixer2.process(decl, result2);
          }
        }
      } else if (decl.prop === "justify-self") {
        if (this.gridStatus(decl, result2) !== false) {
          prefixer2 = this.prefixes.add["grid-column-align"];
          if (prefixer2 && prefixer2.prefixes) {
            return prefixer2.process(decl, result2);
          }
        }
      } else if (decl.prop === "place-self") {
        prefixer2 = this.prefixes.add["place-self"];
        if (prefixer2 && prefixer2.prefixes && this.gridStatus(decl, result2) !== false) {
          return prefixer2.process(decl, result2);
        }
      } else {
        prefixer2 = this.prefixes.add[decl.prop];
        if (prefixer2 && prefixer2.prefixes) {
          return prefixer2.process(decl, result2);
        }
      }
      return void 0;
    });
    if (this.gridStatus(css, result2)) {
      insertAreas(css, this.disabled);
    }
    return css.walkDecls((decl) => {
      if (this.disabledValue(decl, result2))
        return;
      let unprefixed = this.prefixes.unprefixed(decl.prop);
      let list2 = this.prefixes.values("add", unprefixed);
      if (Array.isArray(list2)) {
        for (let value2 of list2) {
          if (value2.process)
            value2.process(decl, result2);
        }
      }
      Value$9.save(this.prefixes, decl);
    });
  }
  /**
   * Check for control comment and global options
   */
  disabled(node2, result2) {
    if (!node2)
      return false;
    if (node2._autoprefixerDisabled !== void 0) {
      return node2._autoprefixerDisabled;
    }
    if (node2.parent) {
      let p = node2.prev();
      if (p && p.type === "comment" && IGNORE_NEXT.test(p.text)) {
        node2._autoprefixerDisabled = true;
        node2._autoprefixerSelfDisabled = true;
        return true;
      }
    }
    let value2 = null;
    if (node2.nodes) {
      let status;
      node2.each((i) => {
        if (i.type !== "comment")
          return;
        if (/(!\s*)?autoprefixer:\s*(off|on)/i.test(i.text)) {
          if (typeof status !== "undefined") {
            result2.warn(
              "Second Autoprefixer control comment was ignored. Autoprefixer applies control comment to whole block, not to next rules.",
              { node: i }
            );
          } else {
            status = /on/i.test(i.text);
          }
        }
      });
      if (status !== void 0) {
        value2 = !status;
      }
    }
    if (!node2.nodes || value2 === null) {
      if (node2.parent) {
        let isParentDisabled = this.disabled(node2.parent, result2);
        if (node2.parent._autoprefixerSelfDisabled === true) {
          value2 = false;
        } else {
          value2 = isParentDisabled;
        }
      } else {
        value2 = false;
      }
    }
    node2._autoprefixerDisabled = value2;
    return value2;
  }
  /**
   * Check for grid/flexbox options.
   */
  disabledDecl(node2, result2) {
    if (node2.type === "decl" && this.gridStatus(node2, result2) === false) {
      if (node2.prop.includes("grid") || node2.prop === "justify-items") {
        return true;
      }
    }
    if (node2.type === "decl" && this.prefixes.options.flexbox === false) {
      let other = ["order", "justify-content", "align-items", "align-content"];
      if (node2.prop.includes("flex") || other.includes(node2.prop)) {
        return true;
      }
    }
    return this.disabled(node2, result2);
  }
  /**
   * Check for grid/flexbox options.
   */
  disabledValue(node2, result2) {
    if (this.gridStatus(node2, result2) === false && node2.type === "decl") {
      if (node2.prop === "display" && node2.value.includes("grid")) {
        return true;
      }
    }
    if (this.prefixes.options.flexbox === false && node2.type === "decl") {
      if (node2.prop === "display" && node2.value.includes("flex")) {
        return true;
      }
    }
    if (node2.type === "decl" && node2.prop === "content") {
      return true;
    }
    return this.disabled(node2, result2);
  }
  /**
   * Is it flebox or grid rule
   */
  displayType(decl) {
    for (let i of decl.parent.nodes) {
      if (i.prop !== "display") {
        continue;
      }
      if (i.value.includes("flex")) {
        return "flex";
      }
      if (i.value.includes("grid")) {
        return "grid";
      }
    }
    return false;
  }
  /**
   * Set grid option via control comment
   */
  gridStatus(node2, result2) {
    if (!node2)
      return false;
    if (node2._autoprefixerGridStatus !== void 0) {
      return node2._autoprefixerGridStatus;
    }
    let value2 = null;
    if (node2.nodes) {
      let status;
      node2.each((i) => {
        if (i.type !== "comment")
          return;
        if (GRID_REGEX.test(i.text)) {
          let hasAutoplace = /:\s*autoplace/i.test(i.text);
          let noAutoplace = /no-autoplace/i.test(i.text);
          if (typeof status !== "undefined") {
            result2.warn(
              "Second Autoprefixer grid control comment was ignored. Autoprefixer applies control comments to the whole block, not to the next rules.",
              { node: i }
            );
          } else if (hasAutoplace) {
            status = "autoplace";
          } else if (noAutoplace) {
            status = true;
          } else {
            status = /on/i.test(i.text);
          }
        }
      });
      if (status !== void 0) {
        value2 = status;
      }
    }
    if (node2.type === "atrule" && node2.name === "supports") {
      let params = node2.params;
      if (params.includes("grid") && params.includes("auto")) {
        value2 = false;
      }
    }
    if (!node2.nodes || value2 === null) {
      if (node2.parent) {
        let isParentGrid = this.gridStatus(node2.parent, result2);
        if (node2.parent._autoprefixerSelfDisabled === true) {
          value2 = false;
        } else {
          value2 = isParentGrid;
        }
      } else if (typeof this.prefixes.options.grid !== "undefined") {
        value2 = this.prefixes.options.grid;
      } else if (typeof process.env.AUTOPREFIXER_GRID !== "undefined") {
        if (process.env.AUTOPREFIXER_GRID === "autoplace") {
          value2 = "autoplace";
        } else {
          value2 = true;
        }
      } else {
        value2 = false;
      }
    }
    node2._autoprefixerGridStatus = value2;
    return value2;
  }
  /**
   * Normalize spaces in cascade declaration group
   */
  reduceSpaces(decl) {
    let stop = false;
    this.prefixes.group(decl).up(() => {
      stop = true;
      return true;
    });
    if (stop) {
      return;
    }
    let parts = decl.raw("before").split("\n");
    let prevMin = parts[parts.length - 1].length;
    let diff = false;
    this.prefixes.group(decl).down((other) => {
      parts = other.raw("before").split("\n");
      let last = parts.length - 1;
      if (parts[last].length > prevMin) {
        if (diff === false) {
          diff = parts[last].length - prevMin;
        }
        parts[last] = parts[last].slice(0, -diff);
        other.raws.before = parts.join("\n");
      }
    });
  }
  /**
   * Remove unnecessary pefixes
   */
  remove(css, result2) {
    let resolution = this.prefixes.remove["@resolution"];
    css.walkAtRules((rule2, i) => {
      if (this.prefixes.remove[`@${rule2.name}`]) {
        if (!this.disabled(rule2, result2)) {
          rule2.parent.removeChild(i);
        }
      } else if (rule2.name === "media" && rule2.params.includes("-resolution") && resolution) {
        resolution.clean(rule2);
      }
    });
    css.walkRules((rule2, i) => {
      if (this.disabled(rule2, result2))
        return;
      for (let checker of this.prefixes.remove.selectors) {
        if (checker.check(rule2)) {
          rule2.parent.removeChild(i);
          return;
        }
      }
    });
    return css.walkDecls((decl, i) => {
      if (this.disabled(decl, result2))
        return;
      let rule2 = decl.parent;
      let unprefixed = this.prefixes.unprefixed(decl.prop);
      if (decl.prop === "transition" || decl.prop === "transition-property") {
        this.prefixes.transition.remove(decl);
      }
      if (this.prefixes.remove[decl.prop] && this.prefixes.remove[decl.prop].remove) {
        let notHack = this.prefixes.group(decl).down((other) => {
          return this.prefixes.normalize(other.prop) === unprefixed;
        });
        if (unprefixed === "flex-flow") {
          notHack = true;
        }
        if (decl.prop === "-webkit-box-orient") {
          let hacks = { "flex-direction": true, "flex-flow": true };
          if (!decl.parent.some((j) => hacks[j.prop]))
            return;
        }
        if (notHack && !this.withHackValue(decl)) {
          if (decl.raw("before").includes("\n")) {
            this.reduceSpaces(decl);
          }
          rule2.removeChild(i);
          return;
        }
      }
      for (let checker of this.prefixes.values("remove", unprefixed)) {
        if (!checker.check)
          continue;
        if (!checker.check(decl.value))
          continue;
        unprefixed = checker.unprefixed;
        let notHack = this.prefixes.group(decl).down((other) => {
          return other.value.includes(unprefixed);
        });
        if (notHack) {
          rule2.removeChild(i);
          return;
        }
      }
    });
  }
  /**
   * Some rare old values, which is not in standard
   */
  withHackValue(decl) {
    return decl.prop === "-webkit-background-clip" && decl.value === "text" || // Do not remove -webkit-box-orient when -webkit-line-clamp is present.
    // https://github.com/postcss/autoprefixer/issues/1510
    decl.prop === "-webkit-box-orient" && decl.parent.some((d) => d.prop === "-webkit-line-clamp");
  }
};
var processor = Processor$1;
var cssFeaturequeries = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D E ZC FC aC bC cC" }, F: { "1": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F B C kC lC mC nC 3B SC oC" }, G: { "1": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC" }, H: { "1": "BD" }, I: { "1": "I GD HD", "2": "8B J CD DD ED FD TC" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS Feature Queries", D: true };
var feature$1 = { exports: {} };
var statuses$1 = {
  1: "ls",
  // WHATWG Living Standard
  2: "rec",
  // W3C Recommendation
  3: "pr",
  // W3C Proposed Recommendation
  4: "cr",
  // W3C Candidate Recommendation
  5: "wd",
  // W3C Working Draft
  6: "other",
  // Non-W3C, but reputable
  7: "unoff"
  // Unofficial, Editor's Draft or W3C "Note"
};
var supported$1 = {
  y: 1 << 0,
  n: 1 << 1,
  a: 1 << 2,
  p: 1 << 3,
  u: 1 << 4,
  x: 1 << 5,
  d: 1 << 6
};
const statuses = statuses$1;
const supported = supported$1;
const browsers = browsers$4.browsers;
const versions = browserVersions$1.browserVersions;
const MATH2LOG = Math.log(2);
function unpackSupport(cipher) {
  let stats = Object.keys(supported).reduce((list2, support) => {
    if (cipher & supported[support])
      list2.push(support);
    return list2;
  }, []);
  let notes = cipher >> 7;
  let notesArray = [];
  while (notes) {
    let note = Math.floor(Math.log(notes) / MATH2LOG) + 1;
    notesArray.unshift(`#${note}`);
    notes -= Math.pow(2, note - 1);
  }
  return stats.concat(notesArray).join(" ");
}
function unpackFeature(packed) {
  let unpacked = {
    status: statuses[packed.B],
    title: packed.C,
    shown: packed.D
  };
  unpacked.stats = Object.keys(packed.A).reduce((browserStats, key) => {
    let browser2 = packed.A[key];
    browserStats[browsers[key]] = Object.keys(browser2).reduce(
      (stats, support) => {
        let packedVersions = browser2[support].split(" ");
        let unpacked2 = unpackSupport(support);
        packedVersions.forEach((v) => stats[versions[v]] = unpacked2);
        return stats;
      },
      {}
    );
    return browserStats;
  }, {});
  return unpacked;
}
feature$1.exports = unpackFeature;
feature$1.exports.default = unpackFeature;
var featureExports = feature$1.exports;
let featureQueries = cssFeaturequeries;
let feature = featureExports;
let data = feature(featureQueries);
for (let browser2 in data.stats) {
  let versions2 = data.stats[browser2];
  for (let version in versions2) {
    versions2[version];
  }
}
let OldSelector$1 = class OldSelector {
  constructor(selector2, prefix2) {
    this.prefix = prefix2;
    this.prefixed = selector2.prefixed(this.prefix);
    this.regexp = selector2.regexp(this.prefix);
    this.prefixeds = selector2.possible().map((x2) => [selector2.prefixed(x2), selector2.regexp(x2)]);
    this.unprefixed = selector2.name;
    this.nameRegexp = selector2.regexp();
  }
  /**
   * Does rule contain an unnecessary prefixed selector
   */
  check(rule2) {
    if (!rule2.selector.includes(this.prefixed)) {
      return false;
    }
    if (!rule2.selector.match(this.regexp)) {
      return false;
    }
    if (this.isHack(rule2)) {
      return false;
    }
    return true;
  }
  /**
   * Is rule a hack without unprefixed version bottom
   */
  isHack(rule2) {
    let index = rule2.parent.index(rule2) + 1;
    let rules = rule2.parent.nodes;
    while (index < rules.length) {
      let before = rules[index].selector;
      if (!before) {
        return true;
      }
      if (before.includes(this.unprefixed) && before.match(this.nameRegexp)) {
        return false;
      }
      let some = false;
      for (let [string, regexp2] of this.prefixeds) {
        if (before.includes(string) && before.match(regexp2)) {
          some = true;
          break;
        }
      }
      if (!some) {
        return true;
      }
      index += 1;
    }
    return true;
  }
};
var oldSelector = OldSelector$1;
let { list: list$2 } = postcss_1;
let OldSelector2 = oldSelector;
let Prefixer2 = prefixer;
let Browsers2 = browsers$1;
let utils$9 = utils$f;
let Selector$6 = class Selector extends Prefixer2 {
  constructor(name2, prefixes, all) {
    super(name2, prefixes, all);
    this.regexpCache = /* @__PURE__ */ new Map();
  }
  /**
   * Clone and add prefixes for at-rule
   */
  add(rule2, prefix2) {
    let prefixeds = this.prefixeds(rule2);
    if (this.already(rule2, prefixeds, prefix2)) {
      return;
    }
    let cloned = this.clone(rule2, { selector: prefixeds[this.name][prefix2] });
    rule2.parent.insertBefore(rule2, cloned);
  }
  /**
   * Is rule already prefixed before
   */
  already(rule2, prefixeds, prefix2) {
    let index = rule2.parent.index(rule2) - 1;
    while (index >= 0) {
      let before = rule2.parent.nodes[index];
      if (before.type !== "rule") {
        return false;
      }
      let some = false;
      for (let key in prefixeds[this.name]) {
        let prefixed = prefixeds[this.name][key];
        if (before.selector === prefixed) {
          if (prefix2 === key) {
            return true;
          } else {
            some = true;
            break;
          }
        }
      }
      if (!some) {
        return false;
      }
      index -= 1;
    }
    return false;
  }
  /**
   * Is rule selectors need to be prefixed
   */
  check(rule2) {
    if (rule2.selector.includes(this.name)) {
      return !!rule2.selector.match(this.regexp());
    }
    return false;
  }
  /**
   * Return function to fast find prefixed selector
   */
  old(prefix2) {
    return new OldSelector2(this, prefix2);
  }
  /**
   * All possible prefixes
   */
  possible() {
    return Browsers2.prefixes();
  }
  /**
   * Return prefixed version of selector
   */
  prefixed(prefix2) {
    return this.name.replace(/^(\W*)/, `$1${prefix2}`);
  }
  /**
   * Return all possible selector prefixes
   */
  prefixeds(rule2) {
    if (rule2._autoprefixerPrefixeds) {
      if (rule2._autoprefixerPrefixeds[this.name]) {
        return rule2._autoprefixerPrefixeds;
      }
    } else {
      rule2._autoprefixerPrefixeds = {};
    }
    let prefixeds = {};
    if (rule2.selector.includes(",")) {
      let ruleParts = list$2.comma(rule2.selector);
      let toProcess = ruleParts.filter((el) => el.includes(this.name));
      for (let prefix2 of this.possible()) {
        prefixeds[prefix2] = toProcess.map((el) => this.replace(el, prefix2)).join(", ");
      }
    } else {
      for (let prefix2 of this.possible()) {
        prefixeds[prefix2] = this.replace(rule2.selector, prefix2);
      }
    }
    rule2._autoprefixerPrefixeds[this.name] = prefixeds;
    return rule2._autoprefixerPrefixeds;
  }
  /**
   * Lazy loadRegExp for name
   */
  regexp(prefix2) {
    if (!this.regexpCache.has(prefix2)) {
      let name2 = prefix2 ? this.prefixed(prefix2) : this.name;
      this.regexpCache.set(
        prefix2,
        new RegExp(`(^|[^:"'=])${utils$9.escapeRegexp(name2)}`, "gi")
      );
    }
    return this.regexpCache.get(prefix2);
  }
  /**
   * Replace selectors by prefixed one
   */
  replace(selector2, prefix2) {
    return selector2.replace(this.regexp(), `$1${this.prefixed(prefix2)}`);
  }
};
var selector = Selector$6;
let Selector$5 = selector;
class Fullscreen extends Selector$5 {
  /**
   * Return different selectors depend on prefix
   */
  prefixed(prefix2) {
    if (prefix2 === "-webkit-") {
      return ":-webkit-full-screen";
    }
    if (prefix2 === "-moz-") {
      return ":-moz-full-screen";
    }
    return `:${prefix2}fullscreen`;
  }
}
Fullscreen.names = [":fullscreen"];
var fullscreen$1 = Fullscreen;
let Selector$4 = selector;
class Placeholder extends Selector$4 {
  /**
   * Add old mozilla to possible prefixes
   */
  possible() {
    return super.possible().concat(["-moz- old", "-ms- old"]);
  }
  /**
   * Return different selectors depend on prefix
   */
  prefixed(prefix2) {
    if (prefix2 === "-webkit-") {
      return "::-webkit-input-placeholder";
    }
    if (prefix2 === "-ms-") {
      return "::-ms-input-placeholder";
    }
    if (prefix2 === "-ms- old") {
      return ":-ms-input-placeholder";
    }
    if (prefix2 === "-moz- old") {
      return ":-moz-placeholder";
    }
    return `::${prefix2}placeholder`;
  }
}
Placeholder.names = ["::placeholder"];
var placeholder = Placeholder;
let Selector$3 = selector;
class PlaceholderShown extends Selector$3 {
  /**
   * Return different selectors depend on prefix
   */
  prefixed(prefix2) {
    if (prefix2 === "-ms-") {
      return ":-ms-input-placeholder";
    }
    return `:${prefix2}placeholder-shown`;
  }
}
PlaceholderShown.names = [":placeholder-shown"];
var placeholderShown = PlaceholderShown;
let Selector$2 = selector;
let utils$8 = utils$f;
class FileSelectorButton extends Selector$2 {
  constructor(name2, prefixes, all) {
    super(name2, prefixes, all);
    if (this.prefixes) {
      this.prefixes = utils$8.uniq(this.prefixes.map(() => "-webkit-"));
    }
  }
  /**
   * Return different selectors depend on prefix
   */
  prefixed(prefix2) {
    if (prefix2 === "-webkit-") {
      return "::-webkit-file-upload-button";
    }
    return `::${prefix2}file-selector-button`;
  }
}
FileSelectorButton.names = ["::file-selector-button"];
var fileSelectorButton = FileSelectorButton;
var flexSpec$d = function(prefix2) {
  let spec;
  if (prefix2 === "-webkit- 2009" || prefix2 === "-moz-") {
    spec = 2009;
  } else if (prefix2 === "-ms-") {
    spec = 2012;
  } else if (prefix2 === "-webkit-") {
    spec = "final";
  }
  if (prefix2 === "-webkit- 2009") {
    prefix2 = "-webkit-";
  }
  return [spec, prefix2];
};
let list$1 = postcss_1.list;
let flexSpec$c = flexSpec$d;
let Declaration$I = declaration;
let Flex$1 = class Flex extends Declaration$I {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "flex";
  }
  /**
   * Change property name for 2009 spec
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$c(prefix2);
    if (spec === 2009) {
      return prefix2 + "box-flex";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Spec 2009 supports only first argument
   * Spec 2012 disallows unitless basis
   */
  set(decl, prefix2) {
    let spec = flexSpec$c(prefix2)[0];
    if (spec === 2009) {
      decl.value = list$1.space(decl.value)[0];
      decl.value = Flex.oldValues[decl.value] || decl.value;
      return super.set(decl, prefix2);
    }
    if (spec === 2012) {
      let components = list$1.space(decl.value);
      if (components.length === 3 && components[2] === "0") {
        decl.value = components.slice(0, 2).concat("0px").join(" ");
      }
    }
    return super.set(decl, prefix2);
  }
};
Flex$1.names = ["flex", "box-flex"];
Flex$1.oldValues = {
  auto: "1",
  none: "0"
};
var flex = Flex$1;
let flexSpec$b = flexSpec$d;
let Declaration$H = declaration;
class Order extends Declaration$H {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "order";
  }
  /**
   * Change property name for 2009 and 2012 specs
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$b(prefix2);
    if (spec === 2009) {
      return prefix2 + "box-ordinal-group";
    }
    if (spec === 2012) {
      return prefix2 + "flex-order";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Fix value for 2009 spec
   */
  set(decl, prefix2) {
    let spec = flexSpec$b(prefix2)[0];
    if (spec === 2009 && /\d/.test(decl.value)) {
      decl.value = (parseInt(decl.value) + 1).toString();
      return super.set(decl, prefix2);
    }
    return super.set(decl, prefix2);
  }
}
Order.names = ["order", "flex-order", "box-ordinal-group"];
var order = Order;
let Declaration$G = declaration;
class Filter extends Declaration$G {
  /**
   * Check is it Internet Explorer filter
   */
  check(decl) {
    let v = decl.value;
    return !v.toLowerCase().includes("alpha(") && !v.includes("DXImageTransform.Microsoft") && !v.includes("data:image/svg+xml");
  }
}
Filter.names = ["filter"];
var filter = Filter;
let Declaration$F = declaration;
let { isPureNumber } = utils$f;
class GridEnd extends Declaration$F {
  /**
   * Change repeating syntax for IE
   */
  insert(decl, prefix2, prefixes, result2) {
    if (prefix2 !== "-ms-")
      return super.insert(decl, prefix2, prefixes);
    let clonedDecl = this.clone(decl);
    let startProp = decl.prop.replace(/end$/, "start");
    let spanProp = prefix2 + decl.prop.replace(/end$/, "span");
    if (decl.parent.some((i) => i.prop === spanProp)) {
      return void 0;
    }
    clonedDecl.prop = spanProp;
    if (decl.value.includes("span")) {
      clonedDecl.value = decl.value.replace(/span\s/i, "");
    } else {
      let startDecl;
      decl.parent.walkDecls(startProp, (d) => {
        startDecl = d;
      });
      if (startDecl) {
        if (isPureNumber(startDecl.value)) {
          let value2 = Number(decl.value) - Number(startDecl.value) + "";
          clonedDecl.value = value2;
        } else {
          return void 0;
        }
      } else {
        decl.warn(
          result2,
          `Can not prefix ${decl.prop} (${startProp} is not found)`
        );
      }
    }
    decl.cloneBefore(clonedDecl);
    return void 0;
  }
}
GridEnd.names = ["grid-row-end", "grid-column-end"];
var gridEnd = GridEnd;
let Declaration$E = declaration;
class Animation extends Declaration$E {
  /**
   * Don’t add prefixes for modern values.
   */
  check(decl) {
    return !decl.value.split(/\s+/).some((i) => {
      let lower = i.toLowerCase();
      return lower === "reverse" || lower === "alternate-reverse";
    });
  }
}
Animation.names = ["animation", "animation-direction"];
var animation = Animation;
let flexSpec$a = flexSpec$d;
let Declaration$D = declaration;
class FlexFlow extends Declaration$D {
  /**
   * Use two properties for 2009 spec
   */
  insert(decl, prefix2, prefixes) {
    let spec;
    [spec, prefix2] = flexSpec$a(prefix2);
    if (spec !== 2009) {
      return super.insert(decl, prefix2, prefixes);
    }
    let values = decl.value.split(/\s+/).filter((i) => i !== "wrap" && i !== "nowrap" && "wrap-reverse");
    if (values.length === 0) {
      return void 0;
    }
    let already = decl.parent.some(
      (i) => i.prop === prefix2 + "box-orient" || i.prop === prefix2 + "box-direction"
    );
    if (already) {
      return void 0;
    }
    let value2 = values[0];
    let orient = value2.includes("row") ? "horizontal" : "vertical";
    let dir = value2.includes("reverse") ? "reverse" : "normal";
    let cloned = this.clone(decl);
    cloned.prop = prefix2 + "box-orient";
    cloned.value = orient;
    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix2);
    }
    decl.parent.insertBefore(decl, cloned);
    cloned = this.clone(decl);
    cloned.prop = prefix2 + "box-direction";
    cloned.value = dir;
    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix2);
    }
    return decl.parent.insertBefore(decl, cloned);
  }
}
FlexFlow.names = ["flex-flow", "box-direction", "box-orient"];
var flexFlow = FlexFlow;
let flexSpec$9 = flexSpec$d;
let Declaration$C = declaration;
class Flex2 extends Declaration$C {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "flex";
  }
  /**
   * Return flex property for 2009 and 2012 specs
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$9(prefix2);
    if (spec === 2009) {
      return prefix2 + "box-flex";
    }
    if (spec === 2012) {
      return prefix2 + "flex-positive";
    }
    return super.prefixed(prop, prefix2);
  }
}
Flex2.names = ["flex-grow", "flex-positive"];
var flexGrow = Flex2;
let flexSpec$8 = flexSpec$d;
let Declaration$B = declaration;
class FlexWrap extends Declaration$B {
  /**
   * Don't add prefix for 2009 spec
   */
  set(decl, prefix2) {
    let spec = flexSpec$8(prefix2)[0];
    if (spec !== 2009) {
      return super.set(decl, prefix2);
    }
    return void 0;
  }
}
FlexWrap.names = ["flex-wrap"];
var flexWrap = FlexWrap;
let Declaration$A = declaration;
let utils$7 = gridUtils;
class GridArea extends Declaration$A {
  /**
   * Translate grid-area to separate -ms- prefixed properties
   */
  insert(decl, prefix2, prefixes, result2) {
    if (prefix2 !== "-ms-")
      return super.insert(decl, prefix2, prefixes);
    let values = utils$7.parse(decl);
    let [rowStart, rowSpan] = utils$7.translate(values, 0, 2);
    let [columnStart, columnSpan] = utils$7.translate(values, 1, 3);
    [
      ["grid-row", rowStart],
      ["grid-row-span", rowSpan],
      ["grid-column", columnStart],
      ["grid-column-span", columnSpan]
    ].forEach(([prop, value2]) => {
      utils$7.insertDecl(decl, prop, value2);
    });
    utils$7.warnTemplateSelectorNotFound(decl, result2);
    utils$7.warnIfGridRowColumnExists(decl, result2);
    return void 0;
  }
}
GridArea.names = ["grid-area"];
var gridArea = GridArea;
let Declaration$z = declaration;
let utils$6 = gridUtils;
class PlaceSelf extends Declaration$z {
  /**
   * Translate place-self to separate -ms- prefixed properties
   */
  insert(decl, prefix2, prefixes) {
    if (prefix2 !== "-ms-")
      return super.insert(decl, prefix2, prefixes);
    if (decl.parent.some((i) => i.prop === "-ms-grid-row-align")) {
      return void 0;
    }
    let [[first, second]] = utils$6.parse(decl);
    if (second) {
      utils$6.insertDecl(decl, "grid-row-align", first);
      utils$6.insertDecl(decl, "grid-column-align", second);
    } else {
      utils$6.insertDecl(decl, "grid-row-align", first);
      utils$6.insertDecl(decl, "grid-column-align", first);
    }
    return void 0;
  }
}
PlaceSelf.names = ["place-self"];
var placeSelf = PlaceSelf;
let Declaration$y = declaration;
class GridStart extends Declaration$y {
  /**
   * Do not add prefix for unsupported value in IE
   */
  check(decl) {
    let value2 = decl.value;
    return !value2.includes("/") && !value2.includes("span");
  }
  /**
   * Return a final spec property
   */
  normalize(prop) {
    return prop.replace("-start", "");
  }
  /**
   * Change property name for IE
   */
  prefixed(prop, prefix2) {
    let result2 = super.prefixed(prop, prefix2);
    if (prefix2 === "-ms-") {
      result2 = result2.replace("-start", "");
    }
    return result2;
  }
}
GridStart.names = ["grid-row-start", "grid-column-start"];
var gridStart = GridStart;
let flexSpec$7 = flexSpec$d;
let Declaration$x = declaration;
class AlignSelf extends Declaration$x {
  check(decl) {
    return decl.parent && !decl.parent.some((i) => {
      return i.prop && i.prop.startsWith("grid-");
    });
  }
  /**
   * Return property name by final spec
   */
  normalize() {
    return "align-self";
  }
  /**
   * Change property name for 2012 specs
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$7(prefix2);
    if (spec === 2012) {
      return prefix2 + "flex-item-align";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Change value for 2012 spec and ignore prefix for 2009
   */
  set(decl, prefix2) {
    let spec = flexSpec$7(prefix2)[0];
    if (spec === 2012) {
      decl.value = AlignSelf.oldValues[decl.value] || decl.value;
      return super.set(decl, prefix2);
    }
    if (spec === "final") {
      return super.set(decl, prefix2);
    }
    return void 0;
  }
}
AlignSelf.names = ["align-self", "flex-item-align"];
AlignSelf.oldValues = {
  "flex-end": "end",
  "flex-start": "start"
};
var alignSelf = AlignSelf;
let Declaration$w = declaration;
let utils$5 = utils$f;
class Appearance extends Declaration$w {
  constructor(name2, prefixes, all) {
    super(name2, prefixes, all);
    if (this.prefixes) {
      this.prefixes = utils$5.uniq(
        this.prefixes.map((i) => {
          if (i === "-ms-") {
            return "-webkit-";
          }
          return i;
        })
      );
    }
  }
}
Appearance.names = ["appearance"];
var appearance = Appearance;
let flexSpec$6 = flexSpec$d;
let Declaration$v = declaration;
class FlexBasis extends Declaration$v {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "flex-basis";
  }
  /**
   * Return flex property for 2012 spec
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$6(prefix2);
    if (spec === 2012) {
      return prefix2 + "flex-preferred-size";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Ignore 2009 spec and use flex property for 2012
   */
  set(decl, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$6(prefix2);
    if (spec === 2012 || spec === "final") {
      return super.set(decl, prefix2);
    }
    return void 0;
  }
}
FlexBasis.names = ["flex-basis", "flex-preferred-size"];
var flexBasis = FlexBasis;
let Declaration$u = declaration;
class MaskBorder extends Declaration$u {
  /**
   * Return property name by final spec
   */
  normalize() {
    return this.name.replace("box-image", "border");
  }
  /**
   * Return flex property for 2012 spec
   */
  prefixed(prop, prefix2) {
    let result2 = super.prefixed(prop, prefix2);
    if (prefix2 === "-webkit-") {
      result2 = result2.replace("border", "box-image");
    }
    return result2;
  }
}
MaskBorder.names = [
  "mask-border",
  "mask-border-source",
  "mask-border-slice",
  "mask-border-width",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-box-image",
  "mask-box-image-source",
  "mask-box-image-slice",
  "mask-box-image-width",
  "mask-box-image-outset",
  "mask-box-image-repeat"
];
var maskBorder = MaskBorder;
let Declaration$t = declaration;
class MaskComposite extends Declaration$t {
  /**
   * Prefix mask-composite for webkit
   */
  insert(decl, prefix2, prefixes) {
    let isCompositeProp = decl.prop === "mask-composite";
    let compositeValues;
    if (isCompositeProp) {
      compositeValues = decl.value.split(",");
    } else {
      compositeValues = decl.value.match(MaskComposite.regexp) || [];
    }
    compositeValues = compositeValues.map((el) => el.trim()).filter((el) => el);
    let hasCompositeValues = compositeValues.length;
    let compositeDecl;
    if (hasCompositeValues) {
      compositeDecl = this.clone(decl);
      compositeDecl.value = compositeValues.map((value2) => MaskComposite.oldValues[value2] || value2).join(", ");
      if (compositeValues.includes("intersect")) {
        compositeDecl.value += ", xor";
      }
      compositeDecl.prop = prefix2 + "mask-composite";
    }
    if (isCompositeProp) {
      if (!hasCompositeValues) {
        return void 0;
      }
      if (this.needCascade(decl)) {
        compositeDecl.raws.before = this.calcBefore(prefixes, decl, prefix2);
      }
      return decl.parent.insertBefore(decl, compositeDecl);
    }
    let cloned = this.clone(decl);
    cloned.prop = prefix2 + cloned.prop;
    if (hasCompositeValues) {
      cloned.value = cloned.value.replace(MaskComposite.regexp, "");
    }
    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix2);
    }
    decl.parent.insertBefore(decl, cloned);
    if (!hasCompositeValues) {
      return decl;
    }
    if (this.needCascade(decl)) {
      compositeDecl.raws.before = this.calcBefore(prefixes, decl, prefix2);
    }
    return decl.parent.insertBefore(decl, compositeDecl);
  }
}
MaskComposite.names = ["mask", "mask-composite"];
MaskComposite.oldValues = {
  add: "source-over",
  exclude: "xor",
  intersect: "source-in",
  subtract: "source-out"
};
MaskComposite.regexp = new RegExp(
  `\\s+(${Object.keys(MaskComposite.oldValues).join(
    "|"
  )})\\b(?!\\))\\s*(?=[,])`,
  "ig"
);
var maskComposite = MaskComposite;
let flexSpec$5 = flexSpec$d;
let Declaration$s = declaration;
class AlignItems extends Declaration$s {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "align-items";
  }
  /**
   * Change property name for 2009 and 2012 specs
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$5(prefix2);
    if (spec === 2009) {
      return prefix2 + "box-align";
    }
    if (spec === 2012) {
      return prefix2 + "flex-align";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Change value for 2009 and 2012 specs
   */
  set(decl, prefix2) {
    let spec = flexSpec$5(prefix2)[0];
    if (spec === 2009 || spec === 2012) {
      decl.value = AlignItems.oldValues[decl.value] || decl.value;
    }
    return super.set(decl, prefix2);
  }
}
AlignItems.names = ["align-items", "flex-align", "box-align"];
AlignItems.oldValues = {
  "flex-end": "end",
  "flex-start": "start"
};
var alignItems = AlignItems;
let Declaration$r = declaration;
class UserSelect extends Declaration$r {
  /**
   * Avoid prefixing all in IE
   */
  insert(decl, prefix2, prefixes) {
    if (decl.value === "all" && prefix2 === "-ms-") {
      return void 0;
    } else if (decl.value === "contain" && (prefix2 === "-moz-" || prefix2 === "-webkit-")) {
      return void 0;
    } else {
      return super.insert(decl, prefix2, prefixes);
    }
  }
  /**
   * Change prefixed value for IE
   */
  set(decl, prefix2) {
    if (prefix2 === "-ms-" && decl.value === "contain") {
      decl.value = "element";
    }
    return super.set(decl, prefix2);
  }
}
UserSelect.names = ["user-select"];
var userSelect = UserSelect;
let flexSpec$4 = flexSpec$d;
let Declaration$q = declaration;
class FlexShrink extends Declaration$q {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "flex-shrink";
  }
  /**
   * Return flex property for 2012 spec
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$4(prefix2);
    if (spec === 2012) {
      return prefix2 + "flex-negative";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Ignore 2009 spec and use flex property for 2012
   */
  set(decl, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$4(prefix2);
    if (spec === 2012 || spec === "final") {
      return super.set(decl, prefix2);
    }
    return void 0;
  }
}
FlexShrink.names = ["flex-shrink", "flex-negative"];
var flexShrink = FlexShrink;
let Declaration$p = declaration;
class BreakProps extends Declaration$p {
  /**
   * Don’t prefix some values
   */
  insert(decl, prefix2, prefixes) {
    if (decl.prop !== "break-inside") {
      return super.insert(decl, prefix2, prefixes);
    }
    if (/region/i.test(decl.value) || /page/i.test(decl.value)) {
      return void 0;
    }
    return super.insert(decl, prefix2, prefixes);
  }
  /**
   * Return property name by final spec
   */
  normalize(prop) {
    if (prop.includes("inside")) {
      return "break-inside";
    }
    if (prop.includes("before")) {
      return "break-before";
    }
    return "break-after";
  }
  /**
   * Change name for -webkit- and -moz- prefix
   */
  prefixed(prop, prefix2) {
    return `${prefix2}column-${prop}`;
  }
  /**
   * Change prefixed value for avoid-column and avoid-page
   */
  set(decl, prefix2) {
    if (decl.prop === "break-inside" && decl.value === "avoid-column" || decl.value === "avoid-page") {
      decl.value = "avoid";
    }
    return super.set(decl, prefix2);
  }
}
BreakProps.names = [
  "break-inside",
  "page-break-inside",
  "column-break-inside",
  "break-before",
  "page-break-before",
  "column-break-before",
  "break-after",
  "page-break-after",
  "column-break-after"
];
var breakProps = BreakProps;
let Declaration$o = declaration;
class WritingMode extends Declaration$o {
  insert(decl, prefix2, prefixes) {
    if (prefix2 === "-ms-") {
      let cloned = this.set(this.clone(decl), prefix2);
      if (this.needCascade(decl)) {
        cloned.raws.before = this.calcBefore(prefixes, decl, prefix2);
      }
      let direction = "ltr";
      decl.parent.nodes.forEach((i) => {
        if (i.prop === "direction") {
          if (i.value === "rtl" || i.value === "ltr")
            direction = i.value;
        }
      });
      cloned.value = WritingMode.msValues[direction][decl.value] || decl.value;
      return decl.parent.insertBefore(decl, cloned);
    }
    return super.insert(decl, prefix2, prefixes);
  }
}
WritingMode.names = ["writing-mode"];
WritingMode.msValues = {
  ltr: {
    "horizontal-tb": "lr-tb",
    "vertical-lr": "tb-lr",
    "vertical-rl": "tb-rl"
  },
  rtl: {
    "horizontal-tb": "rl-tb",
    "vertical-lr": "bt-lr",
    "vertical-rl": "bt-rl"
  }
};
var writingMode = WritingMode;
let Declaration$n = declaration;
class BorderImage extends Declaration$n {
  /**
   * Remove fill parameter for prefixed declarations
   */
  set(decl, prefix2) {
    decl.value = decl.value.replace(/\s+fill(\s)/, "$1");
    return super.set(decl, prefix2);
  }
}
BorderImage.names = ["border-image"];
var borderImage$1 = BorderImage;
let flexSpec$3 = flexSpec$d;
let Declaration$m = declaration;
class AlignContent extends Declaration$m {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "align-content";
  }
  /**
   * Change property name for 2012 spec
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$3(prefix2);
    if (spec === 2012) {
      return prefix2 + "flex-line-pack";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Change value for 2012 spec and ignore prefix for 2009
   */
  set(decl, prefix2) {
    let spec = flexSpec$3(prefix2)[0];
    if (spec === 2012) {
      decl.value = AlignContent.oldValues[decl.value] || decl.value;
      return super.set(decl, prefix2);
    }
    if (spec === "final") {
      return super.set(decl, prefix2);
    }
    return void 0;
  }
}
AlignContent.names = ["align-content", "flex-line-pack"];
AlignContent.oldValues = {
  "flex-end": "end",
  "flex-start": "start",
  "space-around": "distribute",
  "space-between": "justify"
};
var alignContent = AlignContent;
let Declaration$l = declaration;
class BorderRadius extends Declaration$l {
  /**
   * Return unprefixed version of property
   */
  normalize(prop) {
    return BorderRadius.toNormal[prop] || prop;
  }
  /**
   * Change syntax, when add Mozilla prefix
   */
  prefixed(prop, prefix2) {
    if (prefix2 === "-moz-") {
      return prefix2 + (BorderRadius.toMozilla[prop] || prop);
    }
    return super.prefixed(prop, prefix2);
  }
}
BorderRadius.names = ["border-radius"];
BorderRadius.toMozilla = {};
BorderRadius.toNormal = {};
for (let ver of ["top", "bottom"]) {
  for (let hor of ["left", "right"]) {
    let normal = `border-${ver}-${hor}-radius`;
    let mozilla = `border-radius-${ver}${hor}`;
    BorderRadius.names.push(normal);
    BorderRadius.names.push(mozilla);
    BorderRadius.toMozilla[normal] = mozilla;
    BorderRadius.toNormal[mozilla] = normal;
  }
}
var borderRadius$1 = BorderRadius;
let Declaration$k = declaration;
class BlockLogical extends Declaration$k {
  /**
   * Return property name by spec
   */
  normalize(prop) {
    if (prop.includes("-before")) {
      return prop.replace("-before", "-block-start");
    }
    return prop.replace("-after", "-block-end");
  }
  /**
   * Use old syntax for -moz- and -webkit-
   */
  prefixed(prop, prefix2) {
    if (prop.includes("-start")) {
      return prefix2 + prop.replace("-block-start", "-before");
    }
    return prefix2 + prop.replace("-block-end", "-after");
  }
}
BlockLogical.names = [
  "border-block-start",
  "border-block-end",
  "margin-block-start",
  "margin-block-end",
  "padding-block-start",
  "padding-block-end",
  "border-before",
  "border-after",
  "margin-before",
  "margin-after",
  "padding-before",
  "padding-after"
];
var blockLogical = BlockLogical;
let Declaration$j = declaration;
let {
  getGridGap: getGridGap$2,
  inheritGridGap: inheritGridGap$2,
  parseTemplate,
  warnGridGap: warnGridGap$1,
  warnMissedAreas: warnMissedAreas$1
} = gridUtils;
class GridTemplate extends Declaration$j {
  /**
   * Translate grid-template to separate -ms- prefixed properties
   */
  insert(decl, prefix2, prefixes, result2) {
    if (prefix2 !== "-ms-")
      return super.insert(decl, prefix2, prefixes);
    if (decl.parent.some((i) => i.prop === "-ms-grid-rows")) {
      return void 0;
    }
    let gap = getGridGap$2(decl);
    let inheritedGap = inheritGridGap$2(decl, gap);
    let { areas, columns, rows } = parseTemplate({
      decl,
      gap: inheritedGap || gap
    });
    let hasAreas = Object.keys(areas).length > 0;
    let hasRows = Boolean(rows);
    let hasColumns = Boolean(columns);
    warnGridGap$1({
      decl,
      gap,
      hasColumns,
      result: result2
    });
    warnMissedAreas$1(areas, decl, result2);
    if (hasRows && hasColumns || hasAreas) {
      decl.cloneBefore({
        prop: "-ms-grid-rows",
        raws: {},
        value: rows
      });
    }
    if (hasColumns) {
      decl.cloneBefore({
        prop: "-ms-grid-columns",
        raws: {},
        value: columns
      });
    }
    return decl;
  }
}
GridTemplate.names = ["grid-template"];
var gridTemplate = GridTemplate;
let Declaration$i = declaration;
class InlineLogical extends Declaration$i {
  /**
   * Return property name by spec
   */
  normalize(prop) {
    return prop.replace(/(margin|padding|border)-(start|end)/, "$1-inline-$2");
  }
  /**
   * Use old syntax for -moz- and -webkit-
   */
  prefixed(prop, prefix2) {
    return prefix2 + prop.replace("-inline", "");
  }
}
InlineLogical.names = [
  "border-inline-start",
  "border-inline-end",
  "margin-inline-start",
  "margin-inline-end",
  "padding-inline-start",
  "padding-inline-end",
  "border-start",
  "border-end",
  "margin-start",
  "margin-end",
  "padding-start",
  "padding-end"
];
var inlineLogical = InlineLogical;
let Declaration$h = declaration;
class GridRowAlign extends Declaration$h {
  /**
   * Do not prefix flexbox values
   */
  check(decl) {
    return !decl.value.includes("flex-") && decl.value !== "baseline";
  }
  /**
   * Change IE property back
   */
  normalize() {
    return "align-self";
  }
  /**
   * Change property name for IE
   */
  prefixed(prop, prefix2) {
    return prefix2 + "grid-row-align";
  }
}
GridRowAlign.names = ["grid-row-align"];
var gridRowAlign = GridRowAlign;
let Declaration$g = declaration;
class TransformDecl extends Declaration$g {
  /**
   * Is transform contain 3D commands
   */
  contain3d(decl) {
    if (decl.prop === "transform-origin") {
      return false;
    }
    for (let func of TransformDecl.functions3d) {
      if (decl.value.includes(`${func}(`)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Don't add prefix for IE in keyframes
   */
  insert(decl, prefix2, prefixes) {
    if (prefix2 === "-ms-") {
      if (!this.contain3d(decl) && !this.keyframeParents(decl)) {
        return super.insert(decl, prefix2, prefixes);
      }
    } else if (prefix2 === "-o-") {
      if (!this.contain3d(decl)) {
        return super.insert(decl, prefix2, prefixes);
      }
    } else {
      return super.insert(decl, prefix2, prefixes);
    }
    return void 0;
  }
  /**
   * Recursively check all parents for @keyframes
   */
  keyframeParents(decl) {
    let { parent } = decl;
    while (parent) {
      if (parent.type === "atrule" && parent.name === "keyframes") {
        return true;
      }
      ({ parent } = parent);
    }
    return false;
  }
  /**
   * Replace rotateZ to rotate for IE 9
   */
  set(decl, prefix2) {
    decl = super.set(decl, prefix2);
    if (prefix2 === "-ms-") {
      decl.value = decl.value.replace(/rotatez/gi, "rotate");
    }
    return decl;
  }
}
TransformDecl.names = ["transform", "transform-origin"];
TransformDecl.functions3d = [
  "matrix3d",
  "translate3d",
  "translateZ",
  "scale3d",
  "scaleZ",
  "rotate3d",
  "rotateX",
  "rotateY",
  "perspective"
];
var transformDecl = TransformDecl;
let flexSpec$2 = flexSpec$d;
let Declaration$f = declaration;
class FlexDirection extends Declaration$f {
  /**
   * Use two properties for 2009 spec
   */
  insert(decl, prefix2, prefixes) {
    let spec;
    [spec, prefix2] = flexSpec$2(prefix2);
    if (spec !== 2009) {
      return super.insert(decl, prefix2, prefixes);
    }
    let already = decl.parent.some(
      (i) => i.prop === prefix2 + "box-orient" || i.prop === prefix2 + "box-direction"
    );
    if (already) {
      return void 0;
    }
    let v = decl.value;
    let orient, dir;
    if (v === "inherit" || v === "initial" || v === "unset") {
      orient = v;
      dir = v;
    } else {
      orient = v.includes("row") ? "horizontal" : "vertical";
      dir = v.includes("reverse") ? "reverse" : "normal";
    }
    let cloned = this.clone(decl);
    cloned.prop = prefix2 + "box-orient";
    cloned.value = orient;
    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix2);
    }
    decl.parent.insertBefore(decl, cloned);
    cloned = this.clone(decl);
    cloned.prop = prefix2 + "box-direction";
    cloned.value = dir;
    if (this.needCascade(decl)) {
      cloned.raws.before = this.calcBefore(prefixes, decl, prefix2);
    }
    return decl.parent.insertBefore(decl, cloned);
  }
  /**
   * Return property name by final spec
   */
  normalize() {
    return "flex-direction";
  }
  /**
   * Clean two properties for 2009 spec
   */
  old(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$2(prefix2);
    if (spec === 2009) {
      return [prefix2 + "box-orient", prefix2 + "box-direction"];
    } else {
      return super.old(prop, prefix2);
    }
  }
}
FlexDirection.names = ["flex-direction", "box-direction", "box-orient"];
var flexDirection = FlexDirection;
let Declaration$e = declaration;
class ImageRendering extends Declaration$e {
  /**
   * Add hack only for crisp-edges
   */
  check(decl) {
    return decl.value === "pixelated";
  }
  /**
   * Return property name by spec
   */
  normalize() {
    return "image-rendering";
  }
  /**
   * Change property name for IE
   */
  prefixed(prop, prefix2) {
    if (prefix2 === "-ms-") {
      return "-ms-interpolation-mode";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Warn on old value
   */
  process(node2, result2) {
    return super.process(node2, result2);
  }
  /**
   * Change property and value for IE
   */
  set(decl, prefix2) {
    if (prefix2 !== "-ms-")
      return super.set(decl, prefix2);
    decl.prop = "-ms-interpolation-mode";
    decl.value = "nearest-neighbor";
    return decl;
  }
}
ImageRendering.names = ["image-rendering", "interpolation-mode"];
var imageRendering = ImageRendering;
let Declaration$d = declaration;
let utils$4 = utils$f;
class BackdropFilter extends Declaration$d {
  constructor(name2, prefixes, all) {
    super(name2, prefixes, all);
    if (this.prefixes) {
      this.prefixes = utils$4.uniq(
        this.prefixes.map((i) => {
          return i === "-ms-" ? "-webkit-" : i;
        })
      );
    }
  }
}
BackdropFilter.names = ["backdrop-filter"];
var backdropFilter = BackdropFilter;
let Declaration$c = declaration;
let utils$3 = utils$f;
class BackgroundClip extends Declaration$c {
  constructor(name2, prefixes, all) {
    super(name2, prefixes, all);
    if (this.prefixes) {
      this.prefixes = utils$3.uniq(
        this.prefixes.map((i) => {
          return i === "-ms-" ? "-webkit-" : i;
        })
      );
    }
  }
  check(decl) {
    return decl.value.toLowerCase() === "text";
  }
}
BackgroundClip.names = ["background-clip"];
var backgroundClip = BackgroundClip;
let Declaration$b = declaration;
const BASIC = [
  "none",
  "underline",
  "overline",
  "line-through",
  "blink",
  "inherit",
  "initial",
  "unset"
];
class TextDecoration extends Declaration$b {
  /**
   * Do not add prefixes for basic values.
   */
  check(decl) {
    return decl.value.split(/\s+/).some((i) => !BASIC.includes(i));
  }
}
TextDecoration.names = ["text-decoration"];
var textDecoration$1 = TextDecoration;
let flexSpec$1 = flexSpec$d;
let Declaration$a = declaration;
class JustifyContent extends Declaration$a {
  /**
   * Return property name by final spec
   */
  normalize() {
    return "justify-content";
  }
  /**
   * Change property name for 2009 and 2012 specs
   */
  prefixed(prop, prefix2) {
    let spec;
    [spec, prefix2] = flexSpec$1(prefix2);
    if (spec === 2009) {
      return prefix2 + "box-pack";
    }
    if (spec === 2012) {
      return prefix2 + "flex-pack";
    }
    return super.prefixed(prop, prefix2);
  }
  /**
   * Change value for 2009 and 2012 specs
   */
  set(decl, prefix2) {
    let spec = flexSpec$1(prefix2)[0];
    if (spec === 2009 || spec === 2012) {
      let value2 = JustifyContent.oldValues[decl.value] || decl.value;
      decl.value = value2;
      if (spec !== 2009 || value2 !== "distribute") {
        return super.set(decl, prefix2);
      }
    } else if (spec === "final") {
      return super.set(decl, prefix2);
    }
    return void 0;
  }
}
JustifyContent.names = ["justify-content", "flex-pack", "box-pack"];
JustifyContent.oldValues = {
  "flex-end": "end",
  "flex-start": "start",
  "space-around": "distribute",
  "space-between": "justify"
};
var justifyContent = JustifyContent;
let Declaration$9 = declaration;
class BackgroundSize extends Declaration$9 {
  /**
   * Duplication parameter for -webkit- browsers
   */
  set(decl, prefix2) {
    let value2 = decl.value.toLowerCase();
    if (prefix2 === "-webkit-" && !value2.includes(" ") && value2 !== "contain" && value2 !== "cover") {
      decl.value = decl.value + " " + decl.value;
    }
    return super.set(decl, prefix2);
  }
}
BackgroundSize.names = ["background-size"];
var backgroundSize = BackgroundSize;
let Declaration$8 = declaration;
let utils$2 = gridUtils;
class GridRowColumn extends Declaration$8 {
  /**
   * Translate grid-row / grid-column to separate -ms- prefixed properties
   */
  insert(decl, prefix2, prefixes) {
    if (prefix2 !== "-ms-")
      return super.insert(decl, prefix2, prefixes);
    let values = utils$2.parse(decl);
    let [start, span] = utils$2.translate(values, 0, 1);
    let hasStartValueSpan = values[0] && values[0].includes("span");
    if (hasStartValueSpan) {
      span = values[0].join("").replace(/\D/g, "");
    }
    [
      [decl.prop, start],
      [`${decl.prop}-span`, span]
    ].forEach(([prop, value2]) => {
      utils$2.insertDecl(decl, prop, value2);
    });
    return void 0;
  }
}
GridRowColumn.names = ["grid-row", "grid-column"];
var gridRowColumn = GridRowColumn;
let Declaration$7 = declaration;
let {
  autoplaceGridItems,
  getGridGap: getGridGap$1,
  inheritGridGap: inheritGridGap$1,
  prefixTrackProp: prefixTrackProp$1,
  prefixTrackValue: prefixTrackValue$1
} = gridUtils;
let Processor3 = processor;
class GridRowsColumns extends Declaration$7 {
  insert(decl, prefix2, prefixes, result2) {
    if (prefix2 !== "-ms-")
      return super.insert(decl, prefix2, prefixes);
    let { parent, prop, value: value2 } = decl;
    let isRowProp = prop.includes("rows");
    let isColumnProp = prop.includes("columns");
    let hasGridTemplate2 = parent.some(
      (i) => i.prop === "grid-template" || i.prop === "grid-template-areas"
    );
    if (hasGridTemplate2 && isRowProp) {
      return false;
    }
    let processor2 = new Processor3({ options: {} });
    let status = processor2.gridStatus(parent, result2);
    let gap = getGridGap$1(decl);
    gap = inheritGridGap$1(decl, gap) || gap;
    let gapValue = isRowProp ? gap.row : gap.column;
    if ((status === "no-autoplace" || status === true) && !hasGridTemplate2) {
      gapValue = null;
    }
    let prefixValue = prefixTrackValue$1({
      gap: gapValue,
      value: value2
    });
    decl.cloneBefore({
      prop: prefixTrackProp$1({ prefix: prefix2, prop }),
      value: prefixValue
    });
    let autoflow = parent.nodes.find((i) => i.prop === "grid-auto-flow");
    let autoflowValue = "row";
    if (autoflow && !processor2.disabled(autoflow, result2)) {
      autoflowValue = autoflow.value.trim();
    }
    if (status === "autoplace") {
      let rowDecl = parent.nodes.find((i) => i.prop === "grid-template-rows");
      if (!rowDecl && hasGridTemplate2) {
        return void 0;
      } else if (!rowDecl && !hasGridTemplate2) {
        decl.warn(
          result2,
          "Autoplacement does not work without grid-template-rows property"
        );
        return void 0;
      }
      let columnDecl = parent.nodes.find((i) => {
        return i.prop === "grid-template-columns";
      });
      if (!columnDecl && !hasGridTemplate2) {
        decl.warn(
          result2,
          "Autoplacement does not work without grid-template-columns property"
        );
      }
      if (isColumnProp && !hasGridTemplate2) {
        autoplaceGridItems(decl, result2, gap, autoflowValue);
      }
    }
    return void 0;
  }
  /**
   * Change IE property back
   */
  normalize(prop) {
    return prop.replace(/^grid-(rows|columns)/, "grid-template-$1");
  }
  /**
   * Change property name for IE
   */
  prefixed(prop, prefix2) {
    if (prefix2 === "-ms-") {
      return prefixTrackProp$1({ prefix: prefix2, prop });
    }
    return super.prefixed(prop, prefix2);
  }
}
GridRowsColumns.names = [
  "grid-template-rows",
  "grid-template-columns",
  "grid-rows",
  "grid-columns"
];
var gridRowsColumns = GridRowsColumns;
let Declaration$6 = declaration;
class GridColumnAlign extends Declaration$6 {
  /**
   * Do not prefix flexbox values
   */
  check(decl) {
    return !decl.value.includes("flex-") && decl.value !== "baseline";
  }
  /**
   * Change IE property back
   */
  normalize() {
    return "justify-self";
  }
  /**
   * Change property name for IE
   */
  prefixed(prop, prefix2) {
    return prefix2 + "grid-column-align";
  }
}
GridColumnAlign.names = ["grid-column-align"];
var gridColumnAlign = GridColumnAlign;
let Declaration$5 = declaration;
class PrintColorAdjust extends Declaration$5 {
  /**
   * Return property name by spec
   */
  normalize() {
    return "print-color-adjust";
  }
  /**
   * Change property name for WebKit-based browsers
   */
  prefixed(prop, prefix2) {
    if (prefix2 === "-moz-") {
      return "color-adjust";
    } else {
      return prefix2 + "print-color-adjust";
    }
  }
}
PrintColorAdjust.names = ["print-color-adjust", "color-adjust"];
var printColorAdjust = PrintColorAdjust;
let Declaration$4 = declaration;
class OverscrollBehavior extends Declaration$4 {
  /**
   * Return property name by spec
   */
  normalize() {
    return "overscroll-behavior";
  }
  /**
   * Change property name for IE
   */
  prefixed(prop, prefix2) {
    return prefix2 + "scroll-chaining";
  }
  /**
   * Change value for IE
   */
  set(decl, prefix2) {
    if (decl.value === "auto") {
      decl.value = "chained";
    } else if (decl.value === "none" || decl.value === "contain") {
      decl.value = "none";
    }
    return super.set(decl, prefix2);
  }
}
OverscrollBehavior.names = ["overscroll-behavior", "scroll-chaining"];
var overscrollBehavior = OverscrollBehavior;
let Declaration$3 = declaration;
let {
  getGridGap,
  inheritGridGap,
  parseGridAreas,
  prefixTrackProp,
  prefixTrackValue,
  warnGridGap,
  warnMissedAreas
} = gridUtils;
function getGridRows(tpl) {
  return tpl.trim().slice(1, -1).split(/["']\s*["']?/g);
}
class GridTemplateAreas extends Declaration$3 {
  /**
   * Translate grid-template-areas to separate -ms- prefixed properties
   */
  insert(decl, prefix2, prefixes, result2) {
    if (prefix2 !== "-ms-")
      return super.insert(decl, prefix2, prefixes);
    let hasColumns = false;
    let hasRows = false;
    let parent = decl.parent;
    let gap = getGridGap(decl);
    gap = inheritGridGap(decl, gap) || gap;
    parent.walkDecls(/-ms-grid-rows/, (i) => i.remove());
    parent.walkDecls(/grid-template-(rows|columns)/, (trackDecl) => {
      if (trackDecl.prop === "grid-template-rows") {
        hasRows = true;
        let { prop, value: value2 } = trackDecl;
        trackDecl.cloneBefore({
          prop: prefixTrackProp({ prefix: prefix2, prop }),
          value: prefixTrackValue({ gap: gap.row, value: value2 })
        });
      } else {
        hasColumns = true;
      }
    });
    let gridRows = getGridRows(decl.value);
    if (hasColumns && !hasRows && gap.row && gridRows.length > 1) {
      decl.cloneBefore({
        prop: "-ms-grid-rows",
        raws: {},
        value: prefixTrackValue({
          gap: gap.row,
          value: `repeat(${gridRows.length}, auto)`
        })
      });
    }
    warnGridGap({
      decl,
      gap,
      hasColumns,
      result: result2
    });
    let areas = parseGridAreas({
      gap,
      rows: gridRows
    });
    warnMissedAreas(areas, decl, result2);
    return decl;
  }
}
GridTemplateAreas.names = ["grid-template-areas"];
var gridTemplateAreas = GridTemplateAreas;
let Declaration$2 = declaration;
class TextEmphasisPosition extends Declaration$2 {
  set(decl, prefix2) {
    if (prefix2 === "-webkit-") {
      decl.value = decl.value.replace(/\s*(right|left)\s*/i, "");
    }
    return super.set(decl, prefix2);
  }
}
TextEmphasisPosition.names = ["text-emphasis-position"];
var textEmphasisPosition = TextEmphasisPosition;
let Declaration$1 = declaration;
class TextDecorationSkipInk extends Declaration$1 {
  /**
   * Change prefix for ink value
   */
  set(decl, prefix2) {
    if (decl.prop === "text-decoration-skip-ink" && decl.value === "auto") {
      decl.prop = prefix2 + "text-decoration-skip";
      decl.value = "ink";
      return decl;
    } else {
      return super.set(decl, prefix2);
    }
  }
}
TextDecorationSkipInk.names = [
  "text-decoration-skip-ink",
  "text-decoration-skip"
];
var textDecorationSkipInk = TextDecorationSkipInk;
var normalizeRange = {
  wrap: wrapRange,
  limit: limitRange,
  validate: validateRange,
  test: testRange,
  curry,
  name
};
function wrapRange(min, max, value2) {
  var maxLessMin = max - min;
  return ((value2 - min) % maxLessMin + maxLessMin) % maxLessMin + min;
}
function limitRange(min, max, value2) {
  return Math.max(min, Math.min(max, value2));
}
function validateRange(min, max, value2, minExclusive, maxExclusive) {
  if (!testRange(min, max, value2, minExclusive, maxExclusive)) {
    throw new Error(value2 + " is outside of range [" + min + "," + max + ")");
  }
  return value2;
}
function testRange(min, max, value2, minExclusive, maxExclusive) {
  return !(value2 < min || value2 > max || maxExclusive && value2 === max || minExclusive && value2 === min);
}
function name(min, max, minExcl, maxExcl) {
  return (minExcl ? "(" : "[") + min + "," + max + (maxExcl ? ")" : "]");
}
function curry(min, max, minExclusive, maxExclusive) {
  var boundNameFn = name.bind(null, min, max, minExclusive, maxExclusive);
  return {
    wrap: wrapRange.bind(null, min, max),
    limit: limitRange.bind(null, min, max),
    validate: function(value2) {
      return validateRange(min, max, value2, minExclusive, maxExclusive);
    },
    test: function(value2) {
      return testRange(min, max, value2, minExclusive, maxExclusive);
    },
    toString: boundNameFn,
    name: boundNameFn
  };
}
let parser = lib;
let range = normalizeRange;
let OldValue$3 = oldValue;
let Value$8 = value;
let utils$1 = utils$f;
let IS_DIRECTION = /top|left|right|bottom/gi;
class Gradient extends Value$8 {
  /**
   * Do not add non-webkit prefixes for list-style and object
   */
  add(decl, prefix2) {
    let p = decl.prop;
    if (p.includes("mask")) {
      if (prefix2 === "-webkit-" || prefix2 === "-webkit- old") {
        return super.add(decl, prefix2);
      }
    } else if (p === "list-style" || p === "list-style-image" || p === "content") {
      if (prefix2 === "-webkit-" || prefix2 === "-webkit- old") {
        return super.add(decl, prefix2);
      }
    } else {
      return super.add(decl, prefix2);
    }
    return void 0;
  }
  /**
   * Get div token from exists parameters
   */
  cloneDiv(params) {
    for (let i of params) {
      if (i.type === "div" && i.value === ",") {
        return i;
      }
    }
    return { after: " ", type: "div", value: "," };
  }
  /**
   * Change colors syntax to old webkit
   */
  colorStops(params) {
    let result2 = [];
    for (let i = 0; i < params.length; i++) {
      let pos;
      let param = params[i];
      let item;
      if (i === 0) {
        continue;
      }
      let color = parser.stringify(param[0]);
      if (param[1] && param[1].type === "word") {
        pos = param[1].value;
      } else if (param[2] && param[2].type === "word") {
        pos = param[2].value;
      }
      let stop;
      if (i === 1 && (!pos || pos === "0%")) {
        stop = `from(${color})`;
      } else if (i === params.length - 1 && (!pos || pos === "100%")) {
        stop = `to(${color})`;
      } else if (pos) {
        stop = `color-stop(${pos}, ${color})`;
      } else {
        stop = `color-stop(${color})`;
      }
      let div = param[param.length - 1];
      params[i] = [{ type: "word", value: stop }];
      if (div.type === "div" && div.value === ",") {
        item = params[i].push(div);
      }
      result2.push(item);
    }
    return result2;
  }
  /**
   * Change new direction to old
   */
  convertDirection(params) {
    if (params.length > 0) {
      if (params[0].value === "to") {
        this.fixDirection(params);
      } else if (params[0].value.includes("deg")) {
        this.fixAngle(params);
      } else if (this.isRadial(params)) {
        this.fixRadial(params);
      }
    }
    return params;
  }
  /**
   * Add 90 degrees
   */
  fixAngle(params) {
    let first = params[0].value;
    first = parseFloat(first);
    first = Math.abs(450 - first) % 360;
    first = this.roundFloat(first, 3);
    params[0].value = `${first}deg`;
  }
  /**
   * Replace `to top left` to `bottom right`
   */
  fixDirection(params) {
    params.splice(0, 2);
    for (let param of params) {
      if (param.type === "div") {
        break;
      }
      if (param.type === "word") {
        param.value = this.revertDirection(param.value);
      }
    }
  }
  /**
   * Fix radial direction syntax
   */
  fixRadial(params) {
    let first = [];
    let second = [];
    let a, b, c, i, next;
    for (i = 0; i < params.length - 2; i++) {
      a = params[i];
      b = params[i + 1];
      c = params[i + 2];
      if (a.type === "space" && b.value === "at" && c.type === "space") {
        next = i + 3;
        break;
      } else {
        first.push(a);
      }
    }
    let div;
    for (i = next; i < params.length; i++) {
      if (params[i].type === "div") {
        div = params[i];
        break;
      } else {
        second.push(params[i]);
      }
    }
    params.splice(0, i, ...second, div, ...first);
  }
  /**
   * Look for at word
   */
  isRadial(params) {
    let state = "before";
    for (let param of params) {
      if (state === "before" && param.type === "space") {
        state = "at";
      } else if (state === "at" && param.value === "at") {
        state = "after";
      } else if (state === "after" && param.type === "space") {
        return true;
      } else if (param.type === "div") {
        break;
      } else {
        state = "before";
      }
    }
    return false;
  }
  /**
   * Replace old direction to new
   */
  newDirection(params) {
    if (params[0].value === "to") {
      return params;
    }
    IS_DIRECTION.lastIndex = 0;
    if (!IS_DIRECTION.test(params[0].value)) {
      return params;
    }
    params.unshift(
      {
        type: "word",
        value: "to"
      },
      {
        type: "space",
        value: " "
      }
    );
    for (let i = 2; i < params.length; i++) {
      if (params[i].type === "div") {
        break;
      }
      if (params[i].type === "word") {
        params[i].value = this.revertDirection(params[i].value);
      }
    }
    return params;
  }
  /**
   * Normalize angle
   */
  normalize(nodes, gradientName) {
    if (!nodes[0])
      return nodes;
    if (/-?\d+(.\d+)?grad/.test(nodes[0].value)) {
      nodes[0].value = this.normalizeUnit(nodes[0].value, 400);
    } else if (/-?\d+(.\d+)?rad/.test(nodes[0].value)) {
      nodes[0].value = this.normalizeUnit(nodes[0].value, 2 * Math.PI);
    } else if (/-?\d+(.\d+)?turn/.test(nodes[0].value)) {
      nodes[0].value = this.normalizeUnit(nodes[0].value, 1);
    } else if (nodes[0].value.includes("deg")) {
      let num = parseFloat(nodes[0].value);
      num = range.wrap(0, 360, num);
      nodes[0].value = `${num}deg`;
    }
    if (gradientName === "linear-gradient" || gradientName === "repeating-linear-gradient") {
      let direction = nodes[0].value;
      if (direction === "0deg" || direction === "0") {
        nodes = this.replaceFirst(nodes, "to", " ", "top");
      } else if (direction === "90deg") {
        nodes = this.replaceFirst(nodes, "to", " ", "right");
      } else if (direction === "180deg") {
        nodes = this.replaceFirst(nodes, "to", " ", "bottom");
      } else if (direction === "270deg") {
        nodes = this.replaceFirst(nodes, "to", " ", "left");
      }
    }
    return nodes;
  }
  /**
   * Convert angle unit to deg
   */
  normalizeUnit(str, full) {
    let num = parseFloat(str);
    let deg = num / full * 360;
    return `${deg}deg`;
  }
  /**
   * Remove old WebKit gradient too
   */
  old(prefix2) {
    if (prefix2 === "-webkit-") {
      let type;
      if (this.name === "linear-gradient") {
        type = "linear";
      } else if (this.name === "repeating-linear-gradient") {
        type = "repeating-linear";
      } else if (this.name === "repeating-radial-gradient") {
        type = "repeating-radial";
      } else {
        type = "radial";
      }
      let string = "-gradient";
      let regexp2 = utils$1.regexp(
        `-webkit-(${type}-gradient|gradient\\(\\s*${type})`,
        false
      );
      return new OldValue$3(this.name, prefix2 + this.name, string, regexp2);
    } else {
      return super.old(prefix2);
    }
  }
  /**
   * Change direction syntax to old webkit
   */
  oldDirection(params) {
    let div = this.cloneDiv(params[0]);
    if (params[0][0].value !== "to") {
      return params.unshift([
        { type: "word", value: Gradient.oldDirections.bottom },
        div
      ]);
    } else {
      let words = [];
      for (let node2 of params[0].slice(2)) {
        if (node2.type === "word") {
          words.push(node2.value.toLowerCase());
        }
      }
      words = words.join(" ");
      let old = Gradient.oldDirections[words] || words;
      params[0] = [{ type: "word", value: old }, div];
      return params[0];
    }
  }
  /**
   * Convert to old webkit syntax
   */
  oldWebkit(node2) {
    let { nodes } = node2;
    let string = parser.stringify(node2.nodes);
    if (this.name !== "linear-gradient") {
      return false;
    }
    if (nodes[0] && nodes[0].value.includes("deg")) {
      return false;
    }
    if (string.includes("px") || string.includes("-corner") || string.includes("-side")) {
      return false;
    }
    let params = [[]];
    for (let i of nodes) {
      params[params.length - 1].push(i);
      if (i.type === "div" && i.value === ",") {
        params.push([]);
      }
    }
    this.oldDirection(params);
    this.colorStops(params);
    node2.nodes = [];
    for (let param of params) {
      node2.nodes = node2.nodes.concat(param);
    }
    node2.nodes.unshift(
      { type: "word", value: "linear" },
      this.cloneDiv(node2.nodes)
    );
    node2.value = "-webkit-gradient";
    return true;
  }
  /**
   * Change degrees for webkit prefix
   */
  replace(string, prefix2) {
    let ast = parser(string);
    for (let node2 of ast.nodes) {
      let gradientName = this.name;
      if (node2.type === "function" && node2.value === gradientName) {
        node2.nodes = this.newDirection(node2.nodes);
        node2.nodes = this.normalize(node2.nodes, gradientName);
        if (prefix2 === "-webkit- old") {
          let changes = this.oldWebkit(node2);
          if (!changes) {
            return false;
          }
        } else {
          node2.nodes = this.convertDirection(node2.nodes);
          node2.value = prefix2 + node2.value;
        }
      }
    }
    return ast.toString();
  }
  /**
   * Replace first token
   */
  replaceFirst(params, ...words) {
    let prefix2 = words.map((i) => {
      if (i === " ") {
        return { type: "space", value: i };
      }
      return { type: "word", value: i };
    });
    return prefix2.concat(params.slice(1));
  }
  revertDirection(word) {
    return Gradient.directions[word.toLowerCase()] || word;
  }
  /**
   * Round float and save digits under dot
   */
  roundFloat(float, digits) {
    return parseFloat(float.toFixed(digits));
  }
}
Gradient.names = [
  "linear-gradient",
  "repeating-linear-gradient",
  "radial-gradient",
  "repeating-radial-gradient"
];
Gradient.directions = {
  bottom: "top",
  left: "right",
  right: "left",
  top: "bottom"
  // default value
};
Gradient.oldDirections = {
  "bottom": "left top, left bottom",
  "bottom left": "right top, left bottom",
  "bottom right": "left top, right bottom",
  "left": "right top, left top",
  "left bottom": "right top, left bottom",
  "left top": "right bottom, left top",
  "right": "left top, right top",
  "right bottom": "left top, right bottom",
  "right top": "left bottom, right top",
  "top": "left bottom, left top",
  "top left": "right bottom, left top",
  "top right": "left bottom, right top"
};
var gradient = Gradient;
let OldValue$2 = oldValue;
let Value$7 = value;
function regexp(name2) {
  return new RegExp(`(^|[\\s,(])(${name2}($|[\\s),]))`, "gi");
}
class Intrinsic extends Value$7 {
  add(decl, prefix2) {
    if (decl.prop.includes("grid") && prefix2 !== "-webkit-") {
      return void 0;
    }
    return super.add(decl, prefix2);
  }
  isStretch() {
    return this.name === "stretch" || this.name === "fill" || this.name === "fill-available";
  }
  old(prefix2) {
    let prefixed = prefix2 + this.name;
    if (this.isStretch()) {
      if (prefix2 === "-moz-") {
        prefixed = "-moz-available";
      } else if (prefix2 === "-webkit-") {
        prefixed = "-webkit-fill-available";
      }
    }
    return new OldValue$2(this.name, prefixed, prefixed, regexp(prefixed));
  }
  regexp() {
    if (!this.regexpCache)
      this.regexpCache = regexp(this.name);
    return this.regexpCache;
  }
  replace(string, prefix2) {
    if (prefix2 === "-moz-" && this.isStretch()) {
      return string.replace(this.regexp(), "$1-moz-available$3");
    }
    if (prefix2 === "-webkit-" && this.isStretch()) {
      return string.replace(this.regexp(), "$1-webkit-fill-available$3");
    }
    return super.replace(string, prefix2);
  }
}
Intrinsic.names = [
  "max-content",
  "min-content",
  "fit-content",
  "fill",
  "fill-available",
  "stretch"
];
var intrinsic = Intrinsic;
let OldValue$1 = oldValue;
let Value$6 = value;
class Pixelated extends Value$6 {
  /**
   * Different name for WebKit and Firefox
   */
  old(prefix2) {
    if (prefix2 === "-webkit-") {
      return new OldValue$1(this.name, "-webkit-optimize-contrast");
    }
    if (prefix2 === "-moz-") {
      return new OldValue$1(this.name, "-moz-crisp-edges");
    }
    return super.old(prefix2);
  }
  /**
   * Use non-standard name for WebKit and Firefox
   */
  replace(string, prefix2) {
    if (prefix2 === "-webkit-") {
      return string.replace(this.regexp(), "$1-webkit-optimize-contrast");
    }
    if (prefix2 === "-moz-") {
      return string.replace(this.regexp(), "$1-moz-crisp-edges");
    }
    return super.replace(string, prefix2);
  }
}
Pixelated.names = ["pixelated"];
var pixelated = Pixelated;
let Value$5 = value;
class ImageSet extends Value$5 {
  /**
   * Use non-standard name for WebKit and Firefox
   */
  replace(string, prefix2) {
    let fixed = super.replace(string, prefix2);
    if (prefix2 === "-webkit-") {
      fixed = fixed.replace(/("[^"]+"|'[^']+')(\s+\d+\w)/gi, "url($1)$2");
    }
    return fixed;
  }
}
ImageSet.names = ["image-set"];
var imageSet = ImageSet;
let list = postcss_1.list;
let Value$4 = value;
class CrossFade extends Value$4 {
  replace(string, prefix2) {
    return list.space(string).map((value2) => {
      if (value2.slice(0, +this.name.length + 1) !== this.name + "(") {
        return value2;
      }
      let close = value2.lastIndexOf(")");
      let after = value2.slice(close + 1);
      let args = value2.slice(this.name.length + 1, close);
      if (prefix2 === "-webkit-") {
        let match = args.match(/\d*.?\d+%?/);
        if (match) {
          args = args.slice(match[0].length).trim();
          args += `, ${match[0]}`;
        } else {
          args += ", 0.5";
        }
      }
      return prefix2 + this.name + "(" + args + ")" + after;
    }).join(" ");
  }
}
CrossFade.names = ["cross-fade"];
var crossFade = CrossFade;
let flexSpec = flexSpec$d;
let OldValue2 = oldValue;
let Value$3 = value;
class DisplayFlex extends Value$3 {
  constructor(name2, prefixes) {
    super(name2, prefixes);
    if (name2 === "display-flex") {
      this.name = "flex";
    }
  }
  /**
   * Faster check for flex value
   */
  check(decl) {
    return decl.prop === "display" && decl.value === this.name;
  }
  /**
   * Change value for old specs
   */
  old(prefix2) {
    let prefixed = this.prefixed(prefix2);
    if (!prefixed)
      return void 0;
    return new OldValue2(this.name, prefixed);
  }
  /**
   * Return value by spec
   */
  prefixed(prefix2) {
    let spec, value2;
    [spec, prefix2] = flexSpec(prefix2);
    if (spec === 2009) {
      if (this.name === "flex") {
        value2 = "box";
      } else {
        value2 = "inline-box";
      }
    } else if (spec === 2012) {
      if (this.name === "flex") {
        value2 = "flexbox";
      } else {
        value2 = "inline-flexbox";
      }
    } else if (spec === "final") {
      value2 = this.name;
    }
    return prefix2 + value2;
  }
  /**
   * Add prefix to value depend on flebox spec version
   */
  replace(string, prefix2) {
    return this.prefixed(prefix2);
  }
}
DisplayFlex.names = ["display-flex", "inline-flex"];
var displayFlex = DisplayFlex;
let Value$2 = value;
class DisplayGrid extends Value$2 {
  constructor(name2, prefixes) {
    super(name2, prefixes);
    if (name2 === "display-grid") {
      this.name = "grid";
    }
  }
  /**
   * Faster check for flex value
   */
  check(decl) {
    return decl.prop === "display" && decl.value === this.name;
  }
}
DisplayGrid.names = ["display-grid", "inline-grid"];
var displayGrid = DisplayGrid;
let Value$1 = value;
class FilterValue extends Value$1 {
  constructor(name2, prefixes) {
    super(name2, prefixes);
    if (name2 === "filter-function") {
      this.name = "filter";
    }
  }
}
FilterValue.names = ["filter", "filter-function"];
var filterValue = FilterValue;
let Selector$1 = selector;
let utils = utils$f;
class Autofill extends Selector$1 {
  constructor(name2, prefixes, all) {
    super(name2, prefixes, all);
    if (this.prefixes) {
      this.prefixes = utils.uniq(this.prefixes.map(() => "-webkit-"));
    }
  }
  /**
   * Return different selectors depend on prefix
   */
  prefixed(prefix2) {
    if (prefix2 === "-webkit-") {
      return ":-webkit-autofill";
    }
    return `:${prefix2}autofill`;
  }
}
Autofill.names = [":autofill"];
var autofill = Autofill;
let Declaration3 = declaration;
let Selector2 = selector;
let Value2 = value;
let hackFullscreen = fullscreen$1;
let hackPlaceholder = placeholder;
let hackPlaceholderShown = placeholderShown;
let hackFileSelectorButton = fileSelectorButton;
let hackFlex = flex;
let hackOrder = order;
let hackFilter = filter;
let hackGridEnd = gridEnd;
let hackAnimation = animation;
let hackFlexFlow = flexFlow;
let hackFlexGrow = flexGrow;
let hackFlexWrap = flexWrap;
let hackGridArea = gridArea;
let hackPlaceSelf = placeSelf;
let hackGridStart = gridStart;
let hackAlignSelf = alignSelf;
let hackAppearance = appearance;
let hackFlexBasis = flexBasis;
let hackMaskBorder = maskBorder;
let hackMaskComposite = maskComposite;
let hackAlignItems = alignItems;
let hackUserSelect = userSelect;
let hackFlexShrink = flexShrink;
let hackBreakProps = breakProps;
let hackWritingMode = writingMode;
let hackBorderImage = borderImage$1;
let hackAlignContent = alignContent;
let hackBorderRadius = borderRadius$1;
let hackBlockLogical = blockLogical;
let hackGridTemplate = gridTemplate;
let hackInlineLogical = inlineLogical;
let hackGridRowAlign = gridRowAlign;
let hackTransformDecl = transformDecl;
let hackFlexDirection = flexDirection;
let hackImageRendering = imageRendering;
let hackBackdropFilter = backdropFilter;
let hackBackgroundClip = backgroundClip;
let hackTextDecoration = textDecoration$1;
let hackJustifyContent = justifyContent;
let hackBackgroundSize = backgroundSize;
let hackGridRowColumn = gridRowColumn;
let hackGridRowsColumns = gridRowsColumns;
let hackGridColumnAlign = gridColumnAlign;
let hackPrintColorAdjust = printColorAdjust;
let hackOverscrollBehavior = overscrollBehavior;
let hackGridTemplateAreas = gridTemplateAreas;
let hackTextEmphasisPosition = textEmphasisPosition;
let hackTextDecorationSkipInk = textDecorationSkipInk;
let hackGradient = gradient;
let hackIntrinsic = intrinsic;
let hackPixelated = pixelated;
let hackImageSet = imageSet;
let hackCrossFade = crossFade;
let hackDisplayFlex = displayFlex;
let hackDisplayGrid = displayGrid;
let hackFilterValue = filterValue;
let hackAutofill = autofill;
Selector2.hack(hackAutofill);
Selector2.hack(hackFullscreen);
Selector2.hack(hackPlaceholder);
Selector2.hack(hackPlaceholderShown);
Selector2.hack(hackFileSelectorButton);
Declaration3.hack(hackFlex);
Declaration3.hack(hackOrder);
Declaration3.hack(hackFilter);
Declaration3.hack(hackGridEnd);
Declaration3.hack(hackAnimation);
Declaration3.hack(hackFlexFlow);
Declaration3.hack(hackFlexGrow);
Declaration3.hack(hackFlexWrap);
Declaration3.hack(hackGridArea);
Declaration3.hack(hackPlaceSelf);
Declaration3.hack(hackGridStart);
Declaration3.hack(hackAlignSelf);
Declaration3.hack(hackAppearance);
Declaration3.hack(hackFlexBasis);
Declaration3.hack(hackMaskBorder);
Declaration3.hack(hackMaskComposite);
Declaration3.hack(hackAlignItems);
Declaration3.hack(hackUserSelect);
Declaration3.hack(hackFlexShrink);
Declaration3.hack(hackBreakProps);
Declaration3.hack(hackWritingMode);
Declaration3.hack(hackBorderImage);
Declaration3.hack(hackAlignContent);
Declaration3.hack(hackBorderRadius);
Declaration3.hack(hackBlockLogical);
Declaration3.hack(hackGridTemplate);
Declaration3.hack(hackInlineLogical);
Declaration3.hack(hackGridRowAlign);
Declaration3.hack(hackTransformDecl);
Declaration3.hack(hackFlexDirection);
Declaration3.hack(hackImageRendering);
Declaration3.hack(hackBackdropFilter);
Declaration3.hack(hackBackgroundClip);
Declaration3.hack(hackTextDecoration);
Declaration3.hack(hackJustifyContent);
Declaration3.hack(hackBackgroundSize);
Declaration3.hack(hackGridRowColumn);
Declaration3.hack(hackGridRowsColumns);
Declaration3.hack(hackGridColumnAlign);
Declaration3.hack(hackOverscrollBehavior);
Declaration3.hack(hackGridTemplateAreas);
Declaration3.hack(hackPrintColorAdjust);
Declaration3.hack(hackTextEmphasisPosition);
Declaration3.hack(hackTextDecorationSkipInk);
Value2.hack(hackGradient);
Value2.hack(hackIntrinsic);
Value2.hack(hackPixelated);
Value2.hack(hackImageSet);
Value2.hack(hackCrossFade);
Value2.hack(hackDisplayFlex);
Value2.hack(hackDisplayGrid);
Value2.hack(hackFilterValue);
var borderRadius;
var hasRequiredBorderRadius;
function requireBorderRadius() {
  if (hasRequiredBorderRadius)
    return borderRadius;
  hasRequiredBorderRadius = 1;
  borderRadius = { A: { A: { "1": "F A B", "2": "K D E UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "257": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB", "289": "8B XC YC", "292": "VC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J" }, E: { "1": "AB D E F A B C L M G cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "J ZC FC", "129": "K aC bC" }, F: { "1": "B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r mC nC 3B SC oC 4B", "2": "F kC lC" }, G: { "1": "E pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "FC" }, H: { "2": "BD" }, I: { "1": "8B J I DD ED FD TC GD HD", "33": "CD" }, J: { "1": "D A" }, K: { "1": "B C H 3B SC 4B", "2": "A" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "257": "WD" } }, B: 4, C: "CSS3 Border-radius (rounded corners)", D: true };
  return borderRadius;
}
var cssBoxshadow;
var hasRequiredCssBoxshadow;
function requireCssBoxshadow() {
  if (hasRequiredCssBoxshadow)
    return cssBoxshadow;
  hasRequiredCssBoxshadow = 1;
  cssBoxshadow = { A: { A: { "1": "F A B", "2": "K D E UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B", "33": "XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F" }, E: { "1": "K D E F A B C L M G aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "AB", "164": "J ZC FC" }, F: { "1": "B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r mC nC 3B SC oC 4B", "2": "F kC lC" }, G: { "1": "E qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "pC TC", "164": "FC" }, H: { "2": "BD" }, I: { "1": "J I FD TC GD HD", "164": "8B CD DD ED" }, J: { "1": "A", "33": "D" }, K: { "1": "B C H 3B SC 4B", "2": "A" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS3 Box-shadow", D: true };
  return cssBoxshadow;
}
var cssAnimation;
var hasRequiredCssAnimation;
function requireCssAnimation() {
  if (hasRequiredCssAnimation)
    return cssAnimation;
  hasRequiredCssAnimation = 1;
  cssAnimation = { A: { A: { "1": "A B", "2": "K D E F UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J XC YC", "33": "AB K D E F A B C L M G" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "ZC FC", "33": "K D E aC bC cC", "292": "J AB" }, F: { "1": "IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F B kC lC mC nC 3B SC oC", "33": "C G N O P BB t u v w CB DB EB FB GB HB" }, G: { "1": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "E rC sC tC", "164": "FC pC TC qC" }, H: { "2": "BD" }, I: { "1": "I", "33": "J FD TC GD HD", "164": "8B CD DD ED" }, J: { "33": "D A" }, K: { "1": "H 4B", "2": "A B C 3B SC" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 5, C: "CSS Animation", D: true };
  return cssAnimation;
}
var cssTransitions;
var hasRequiredCssTransitions;
function requireCssTransitions() {
  if (hasRequiredCssTransitions)
    return cssTransitions;
  hasRequiredCssTransitions = 1;
  cssTransitions = { A: { A: { "1": "A B", "2": "K D E F UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC YC", "33": "AB K D E F A B C L M G", "164": "J" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB" }, E: { "1": "D E F A B C L M G bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "K aC", "164": "J AB ZC FC" }, F: { "1": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F kC lC", "33": "C", "164": "B mC nC 3B SC oC" }, G: { "1": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "rC", "164": "FC pC TC qC" }, H: { "2": "BD" }, I: { "1": "I GD HD", "33": "8B J CD DD ED FD TC" }, J: { "1": "A", "33": "D" }, K: { "1": "H 4B", "33": "C", "164": "A B 3B SC" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 5, C: "CSS3 Transitions", D: true };
  return cssTransitions;
}
var transforms2d;
var hasRequiredTransforms2d;
function requireTransforms2d() {
  if (hasRequiredTransforms2d)
    return transforms2d;
  hasRequiredTransforms2d = 1;
  transforms2d = { A: { A: { "2": "UC", "8": "K D E", "129": "A B", "161": "F" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "129": "C L M G N" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B", "33": "J AB K D E F A B C L M G XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "J AB K D E ZC FC aC bC cC" }, F: { "1": "w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F kC lC", "33": "B C G N O P BB t u v mC nC 3B SC oC" }, G: { "1": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "E FC pC TC qC rC sC tC" }, H: { "2": "BD" }, I: { "1": "I", "33": "8B J CD DD ED FD TC GD HD" }, J: { "33": "D A" }, K: { "1": "B C H 3B SC 4B", "2": "A" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS3 2D Transforms", D: true };
  return transforms2d;
}
var transforms3d;
var hasRequiredTransforms3d;
function requireTransforms3d() {
  if (hasRequiredTransforms3d)
    return transforms3d;
  hasRequiredTransforms3d = 1;
  transforms3d = { A: { A: { "2": "K D E F UC", "132": "A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F XC YC", "33": "A B C L M G" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B", "33": "C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB" }, E: { "1": "IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "ZC FC", "33": "J AB K D E aC bC cC", "257": "F A B C L M G dC GC 3B 4B eC fC gC HC" }, F: { "1": "w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v" }, G: { "1": "IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "E FC pC TC qC rC sC tC", "257": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC" }, H: { "2": "BD" }, I: { "1": "I", "2": "CD DD ED", "33": "8B J FD TC GD HD" }, J: { "33": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "132": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 5, C: "CSS3 3D Transforms", D: true };
  return transforms3d;
}
var cssGradients;
var hasRequiredCssGradients;
function requireCssGradients() {
  if (hasRequiredCssGradients)
    return cssGradients;
  hasRequiredCssGradients = 1;
  cssGradients = { A: { A: { "1": "A B", "2": "K D E F UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC", "260": "N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB", "292": "J AB K D E F A B C L M G YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "A B C L M G N O P BB t u v w CB DB", "548": "J AB K D E F" }, E: { "1": "IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "ZC FC", "260": "D E F A B C L M G bC cC dC GC 3B 4B eC fC gC HC", "292": "K aC", "804": "J AB" }, F: { "1": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F B kC lC mC nC", "33": "C oC", "164": "3B SC" }, G: { "1": "IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "260": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC", "292": "qC rC", "804": "FC pC TC" }, H: { "2": "BD" }, I: { "1": "I GD HD", "33": "J FD TC", "548": "8B CD DD ED" }, J: { "1": "A", "548": "D" }, K: { "1": "H 4B", "2": "A B", "33": "C", "164": "3B SC" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS Gradients", D: true };
  return cssGradients;
}
var css3Boxsizing;
var hasRequiredCss3Boxsizing;
function requireCss3Boxsizing() {
  if (hasRequiredCss3Boxsizing)
    return css3Boxsizing;
  hasRequiredCss3Boxsizing = 1;
  css3Boxsizing = { A: { A: { "1": "E F A B", "8": "K D UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "33": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F" }, E: { "1": "K D E F A B C L M G aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "J AB ZC FC" }, F: { "1": "B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r kC lC mC nC 3B SC oC 4B", "2": "F" }, G: { "1": "E qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "FC pC TC" }, H: { "1": "BD" }, I: { "1": "J I FD TC GD HD", "33": "8B CD DD ED" }, J: { "1": "A", "33": "D" }, K: { "1": "A B C H 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 5, C: "CSS3 Box-sizing", D: true };
  return css3Boxsizing;
}
var cssFilters;
var hasRequiredCssFilters;
function requireCssFilters() {
  if (hasRequiredCssFilters)
    return cssFilters;
  hasRequiredCssFilters = 1;
  cssFilters = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "1028": "L M G N O P", "1346": "C" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC", "196": "MB", "516": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O", "33": "P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB" }, E: { "1": "A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB ZC FC aC", "33": "K D E F bC cC" }, F: { "1": "SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB" }, G: { "1": "vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC", "33": "E rC sC tC uC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "33": "GD HD" }, J: { "2": "D", "33": "A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "33": "J ID JD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 5, C: "CSS Filter Effects", D: true };
  return cssFilters;
}
var cssFilterFunction;
var hasRequiredCssFilterFunction;
function requireCssFilterFunction() {
  if (hasRequiredCssFilterFunction)
    return cssFilterFunction;
  hasRequiredCssFilterFunction = 1;
  cssFilterFunction = { A: { A: { "2": "K D E F A B UC" }, B: { "2": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "2": "0 1 2 3 4 5 6 7 8 9 VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC XC YC" }, D: { "2": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "1": "A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D E ZC FC aC bC cC", "33": "F" }, F: { "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r kC lC mC nC 3B SC oC 4B" }, G: { "1": "wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC", "33": "uC vC" }, H: { "2": "BD" }, I: { "2": "8B J I CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "2": "A B C H 3B SC 4B" }, L: { "2": "I" }, M: { "2": "s" }, N: { "2": "A B" }, O: { "2": "5B" }, P: { "2": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "2": "UD" }, R: { "2": "VD" }, S: { "2": "WD XD" } }, B: 5, C: "CSS filter() function", D: true };
  return cssFilterFunction;
}
var cssBackdropFilter;
var hasRequiredCssBackdropFilter;
function requireCssBackdropFilter() {
  if (hasRequiredCssBackdropFilter)
    return cssBackdropFilter;
  hasRequiredCssBackdropFilter = 1;
  cssBackdropFilter = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N", "257": "O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB XC YC", "578": "uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB", "194": "ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB" }, E: { "2": "J AB K D E ZC FC aC bC cC", "33": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC" }, F: { "1": "oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB kC lC mC nC 3B SC oC 4B", "194": "MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB" }, G: { "2": "E FC pC TC qC rC sC tC", "33": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w OD PD QD RD 6B 7B SD TD", "2": "J", "194": "ID JD KD LD MD GC ND" }, Q: { "2": "UD" }, R: { "1": "VD" }, S: { "2": "WD XD" } }, B: 7, C: "CSS Backdrop Filter", D: true };
  return cssBackdropFilter;
}
var cssElementFunction;
var hasRequiredCssElementFunction;
function requireCssElementFunction() {
  if (hasRequiredCssElementFunction)
    return cssElementFunction;
  hasRequiredCssElementFunction = 1;
  cssElementFunction = { A: { A: { "2": "K D E F A B UC" }, B: { "2": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "33": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "164": "VC 8B XC YC" }, D: { "2": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "2": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC" }, F: { "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r kC lC mC nC 3B SC oC 4B" }, G: { "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "2": "8B J I CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "2": "A B C H 3B SC 4B" }, L: { "2": "I" }, M: { "33": "s" }, N: { "2": "A B" }, O: { "2": "5B" }, P: { "2": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "2": "UD" }, R: { "2": "VD" }, S: { "33": "WD XD" } }, B: 5, C: "CSS element() function", D: true };
  return cssElementFunction;
}
var multicolumn;
var hasRequiredMulticolumn;
function requireMulticolumn() {
  if (hasRequiredMulticolumn)
    return multicolumn;
  hasRequiredMulticolumn = 1;
  multicolumn = { A: { A: { "1": "A B", "2": "K D E F UC" }, B: { "1": "C L M G N O P", "516": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "132": "eB fB gB hB iB jB kB 9B lB AC mB nB oB", "164": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB XC YC", "516": "pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a", "1028": "0 1 2 3 4 5 6 7 8 9 b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC" }, D: { "420": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB", "516": "0 1 2 3 4 5 6 7 8 9 cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "1": "A B C L M G GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "132": "F dC", "164": "D E cC", "420": "J AB K ZC FC aC bC" }, F: { "1": "C 3B SC oC 4B", "2": "F B kC lC mC nC", "420": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB", "516": "PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, G: { "1": "wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "132": "uC vC", "164": "E sC tC", "420": "FC pC TC qC rC" }, H: { "1": "BD" }, I: { "420": "8B J CD DD ED FD TC GD HD", "516": "I" }, J: { "420": "D A" }, K: { "1": "C 3B SC 4B", "2": "A B", "516": "H" }, L: { "516": "I" }, M: { "1028": "s" }, N: { "1": "A B" }, O: { "516": "5B" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "420": "J" }, Q: { "516": "UD" }, R: { "516": "VD" }, S: { "164": "WD XD" } }, B: 4, C: "CSS3 Multiple column layout", D: true };
  return multicolumn;
}
var userSelectNone;
var hasRequiredUserSelectNone;
function requireUserSelectNone() {
  if (hasRequiredUserSelectNone)
    return userSelectNone;
  hasRequiredUserSelectNone = 1;
  userSelectNone = { A: { A: { "2": "K D E F UC", "33": "A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "33": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "33": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB" }, E: { "1": "jC", "33": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC" }, F: { "1": "TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB" }, G: { "33": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "1": "I", "33": "8B J CD DD ED FD TC GD HD" }, J: { "33": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "33": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "33": "J ID" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "33": "WD" } }, B: 5, C: "CSS user-select: none", D: true };
  return userSelectNone;
}
var flexbox;
var hasRequiredFlexbox;
function requireFlexbox() {
  if (hasRequiredFlexbox)
    return flexbox;
  hasRequiredFlexbox = 1;
  flexbox = { A: { A: { "2": "K D E F UC", "1028": "B", "1316": "A" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "164": "VC 8B J AB K D E F A B C L M G N O P BB t u XC YC", "516": "v w CB DB EB FB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "u v w CB DB EB FB GB", "164": "J AB K D E F A B C L M G N O P BB t" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "D E bC cC", "164": "J AB K ZC FC aC" }, F: { "1": "O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F B C kC lC mC nC 3B SC oC", "33": "G N" }, G: { "1": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "E sC tC", "164": "FC pC TC qC rC" }, H: { "1": "BD" }, I: { "1": "I GD HD", "164": "8B J CD DD ED FD TC" }, J: { "1": "A", "164": "D" }, K: { "1": "H 4B", "2": "A B C 3B SC" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "B", "292": "A" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS Flexible Box Layout Module", D: true };
  return flexbox;
}
var calc;
var hasRequiredCalc;
function requireCalc() {
  if (hasRequiredCalc)
    return calc;
  hasRequiredCalc = 1;
  calc = { A: { A: { "2": "K D E UC", "260": "F", "516": "A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC YC", "33": "J AB K D E F A B C L M G" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P", "33": "BB t u v w CB DB" }, E: { "1": "D E F A B C L M G bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB ZC FC aC", "33": "K" }, F: { "1": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B" }, G: { "1": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC", "33": "rC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "132": "GD HD" }, J: { "1": "A", "2": "D" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "calc() as CSS unit value", D: true };
  return calc;
}
var backgroundImgOpts;
var hasRequiredBackgroundImgOpts;
function requireBackgroundImgOpts() {
  if (hasRequiredBackgroundImgOpts)
    return backgroundImgOpts;
  hasRequiredBackgroundImgOpts = 1;
  backgroundImgOpts = { A: { A: { "1": "F A B", "2": "K D E UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC", "36": "YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "516": "J AB K D E F A B C L M" }, E: { "1": "D E F A B C L M G cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "772": "J AB K ZC FC aC bC" }, F: { "1": "B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r mC nC 3B SC oC 4B", "2": "F kC", "36": "lC" }, G: { "1": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "4": "FC pC TC rC", "516": "qC" }, H: { "132": "BD" }, I: { "1": "I GD HD", "36": "CD", "516": "8B J FD TC", "548": "DD ED" }, J: { "1": "D A" }, K: { "1": "A B C H 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS3 Background-image options", D: true };
  return backgroundImgOpts;
}
var backgroundClipText;
var hasRequiredBackgroundClipText;
function requireBackgroundClipText() {
  if (hasRequiredBackgroundClipText)
    return backgroundClipText;
  hasRequiredBackgroundClipText = 1;
  backgroundClipText = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "G N O P", "33": "C L M", "132": "8 9 I s", "164": "0 1 2 3 4 5 6 7 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB XC YC" }, D: { "132": "8 9 I s CC DC EC", "164": "0 1 2 3 4 5 6 7 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z" }, E: { "16": "ZC FC", "132": "5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "388": "M G fC gC HC IC", "420": "J AB K D E F A B C L aC bC cC dC GC 3B 4B eC" }, F: { "2": "F B C kC lC mC nC 3B SC oC 4B", "132": "p q r", "164": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o" }, G: { "16": "FC pC TC qC", "132": "5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "388": "6C 7C 8C HC IC", "420": "E rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C" }, H: { "2": "BD" }, I: { "16": "8B CD DD ED", "132": "I", "164": "J FD TC GD HD" }, J: { "164": "D A" }, K: { "16": "A B C 3B SC 4B", "132": "H" }, L: { "132": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "164": "5B" }, P: { "164": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "164": "UD" }, R: { "164": "VD" }, S: { "1": "WD XD" } }, B: 7, C: "Background-clip: text", D: true };
  return backgroundClipText;
}
var fontFeature;
var hasRequiredFontFeature;
function requireFontFeature() {
  if (hasRequiredFontFeature)
    return fontFeature;
  hasRequiredFontFeature = 1;
  fontFeature = { A: { A: { "1": "A B", "2": "K D E F UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC YC", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB", "164": "J AB K D E F A B C L M" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G", "33": "u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB", "292": "N O P BB t" }, E: { "1": "A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "D E F ZC FC bC cC", "4": "J AB K aC" }, F: { "1": "NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB" }, G: { "1": "vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E sC tC uC", "4": "FC pC TC qC rC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "33": "GD HD" }, J: { "2": "D", "33": "A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "33": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 2, C: "CSS font-feature-settings", D: true };
  return fontFeature;
}
var fontKerning;
var hasRequiredFontKerning;
function requireFontKerning() {
  if (hasRequiredFontKerning)
    return fontKerning;
  hasRequiredFontKerning = 1;
  fontKerning = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w XC YC", "194": "CB DB EB FB GB HB IB JB KB LB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB", "33": "HB IB JB KB" }, E: { "1": "A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K ZC FC aC bC", "33": "D E F cC" }, F: { "1": "t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G kC lC mC nC 3B SC oC 4B", "33": "N O P BB" }, G: { "1": "0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC sC", "33": "E tC uC vC wC xC yC zC" }, H: { "2": "BD" }, I: { "1": "I HD", "2": "8B J CD DD ED FD TC", "33": "GD" }, J: { "2": "D", "33": "A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS3 font-kerning", D: true };
  return fontKerning;
}
var borderImage;
var hasRequiredBorderImage;
function requireBorderImage() {
  if (hasRequiredBorderImage)
    return borderImage;
  hasRequiredBorderImage = 1;
  borderImage = { A: { A: { "1": "B", "2": "K D E F A UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "129": "C L" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B", "260": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB", "804": "J AB K D E F A B C L M XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "260": "dB eB fB gB hB", "388": "IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB", "1412": "G N O P BB t u v w CB DB EB FB GB HB", "1956": "J AB K D E F A B C L M" }, E: { "1": "IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "129": "A B C L M G dC GC 3B 4B eC fC gC HC", "1412": "K D E F bC cC", "1956": "J AB ZC FC aC" }, F: { "1": "VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F kC lC", "260": "QB RB SB TB UB", "388": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB", "1796": "mC nC", "1828": "B C 3B SC oC 4B" }, G: { "1": "IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "129": "vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC", "1412": "E rC sC tC uC", "1956": "FC pC TC qC" }, H: { "1828": "BD" }, I: { "1": "I", "388": "GD HD", "1956": "8B J CD DD ED FD TC" }, J: { "1412": "A", "1924": "D" }, K: { "1": "H", "2": "A", "1828": "B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "B", "2": "A" }, O: { "1": "5B" }, P: { "1": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "260": "ID JD", "388": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "260": "WD" } }, B: 4, C: "CSS3 Border images", D: true };
  return borderImage;
}
var cssSelection;
var hasRequiredCssSelection;
function requireCssSelection() {
  if (hasRequiredCssSelection)
    return cssSelection;
  hasRequiredCssSelection = 1;
  cssSelection = { A: { A: { "1": "F A B", "2": "K D E UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "33": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "1": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC" }, F: { "1": "B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r kC lC mC nC 3B SC oC 4B", "2": "F" }, G: { "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "1": "I GD HD", "2": "8B J CD DD ED FD TC" }, J: { "1": "A", "2": "D" }, K: { "1": "C H SC 4B", "16": "A B 3B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "33": "WD" } }, B: 5, C: "::selection CSS pseudo-element", D: true };
  return cssSelection;
}
var cssPlaceholder;
var hasRequiredCssPlaceholder;
function requireCssPlaceholder() {
  if (hasRequiredCssPlaceholder)
    return cssPlaceholder;
  hasRequiredCssPlaceholder = 1;
  cssPlaceholder = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "36": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "33": "BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB", "130": "VC 8B J AB K D E F A B C L M G N O P XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "36": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB" }, E: { "1": "B C L M G GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J ZC FC", "36": "AB K D E F A aC bC cC dC" }, F: { "1": "WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "36": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB" }, G: { "1": "xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC", "36": "E TC qC rC sC tC uC vC wC" }, H: { "2": "BD" }, I: { "1": "I", "36": "8B J CD DD ED FD TC GD HD" }, J: { "36": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "36": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "36": "J ID JD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "33": "WD" } }, B: 5, C: "::placeholder CSS pseudo-element", D: true };
  return cssPlaceholder;
}
var cssPlaceholderShown;
var hasRequiredCssPlaceholderShown;
function requireCssPlaceholderShown() {
  if (hasRequiredCssPlaceholderShown)
    return cssPlaceholderShown;
  hasRequiredCssPlaceholderShown = 1;
  cssPlaceholderShown = { A: { A: { "2": "K D E F UC", "292": "A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC YC", "164": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D E ZC FC aC bC cC" }, F: { "1": "MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB kC lC mC nC 3B SC oC 4B" }, G: { "1": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "164": "WD" } }, B: 5, C: ":placeholder-shown CSS pseudo-class", D: true };
  return cssPlaceholderShown;
}
var cssHyphens;
var hasRequiredCssHyphens;
function requireCssHyphens() {
  if (hasRequiredCssHyphens)
    return cssHyphens;
  hasRequiredCssHyphens = 1;
  cssHyphens = { A: { A: { "2": "K D E F UC", "33": "A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 o p q r x y z I s", "33": "C L M G N O P", "132": "Q H R S T U V W", "260": "X Y Z a b c d e f g h i j k l m n" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB XC YC", "33": "K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB", "132": "hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W" }, E: { "1": "7B OC PC QC RC jC", "2": "J AB ZC FC", "33": "K D E F A B C L M G aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC" }, F: { "1": "a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB kC lC mC nC 3B SC oC 4B", "132": "UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z" }, G: { "1": "7B OC PC QC RC", "2": "FC pC", "33": "E TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J", "132": "ID" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS Hyphenation", D: true };
  return cssHyphens;
}
var fullscreen;
var hasRequiredFullscreen;
function requireFullscreen() {
  if (hasRequiredFullscreen)
    return fullscreen;
  hasRequiredFullscreen = 1;
  fullscreen = { A: { A: { "2": "K D E F A UC", "548": "B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "516": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F XC YC", "676": "A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB", "1700": "ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M", "676": "G N O P BB", "804": "t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB" }, E: { "1": "MC NC iC 7B OC PC QC RC jC", "2": "J AB ZC FC", "548": "IC 5B hC 6B JC KC LC", "676": "aC", "804": "K D E F A B C L M G bC cC dC GC 3B 4B eC fC gC HC" }, F: { "1": "oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F B C kC lC mC nC 3B SC oC", "804": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB" }, G: { "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC", "2052": "0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "2": "8B J I CD DD ED FD TC GD HD" }, J: { "2": "D", "292": "A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A", "548": "B" }, O: { "1": "5B" }, P: { "1": "t u v w GC ND OD PD QD RD 6B 7B SD TD", "804": "J ID JD KD LD MD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 1, C: "Fullscreen API", D: true };
  return fullscreen;
}
var mdnCssBackdropPseudoElement;
var hasRequiredMdnCssBackdropPseudoElement;
function requireMdnCssBackdropPseudoElement() {
  if (hasRequiredMdnCssBackdropPseudoElement)
    return mdnCssBackdropPseudoElement;
  hasRequiredMdnCssBackdropPseudoElement = 1;
  mdnCssBackdropPseudoElement = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB", "33": "KB LB MB NB OB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "33": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB XC YC" }, M: { "1": "s" }, A: { "2": "K D E F A UC", "33": "B" }, F: { "1": "CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P kC lC mC nC 3B SC oC 4B", "33": "BB t u v w" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC jC" }, G: { "1": "IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "33": "GD HD" } }, B: 6, C: "CSS ::backdrop pseudo-element", D: void 0 };
  return mdnCssBackdropPseudoElement;
}
var cssFileSelectorButton;
var hasRequiredCssFileSelectorButton;
function requireCssFileSelectorButton() {
  if (hasRequiredCssFileSelectorButton)
    return cssFileSelectorButton;
  hasRequiredCssFileSelectorButton = 1;
  cssFileSelectorButton = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Y Z a b c d e f g h i j k l m n o p q r x y z I s", "33": "C L M G N O P Q H R S T U V W X" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R XC YC" }, M: { "1": "s" }, A: { "2": "K D E F UC", "33": "A B" }, F: { "1": "zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "G fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "jC", "33": "J AB K D E F A B C L M ZC FC aC bC cC dC GC 3B 4B eC" }, G: { "1": "7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C" }, P: { "1": "t u v w RD 6B 7B SD TD", "33": "J ID JD KD LD MD GC ND OD PD QD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "33": "GD HD" } }, B: 6, C: "::file-selector-button CSS pseudo-element", D: void 0 };
  return cssFileSelectorButton;
}
var cssAutofill;
var hasRequiredCssAutofill;
function requireCssAutofill() {
  if (hasRequiredCssAutofill)
    return cssAutofill;
  hasRequiredCssAutofill = 1;
  cssAutofill = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 y z I s", "2": "C L M G N O P", "33": "Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U XC YC" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "G gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "jC", "33": "J AB K D E F A B C L M ZC FC aC bC cC dC GC 3B 4B eC fC" }, G: { "1": "8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C" }, P: { "1": "u v w", "33": "J t ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "33": "GD HD" } }, B: 6, C: ":autofill CSS pseudo-class", D: void 0 };
  return cssAutofill;
}
var css3Tabsize;
var hasRequiredCss3Tabsize;
function requireCss3Tabsize() {
  if (hasRequiredCss3Tabsize)
    return css3Tabsize;
  hasRequiredCss3Tabsize = 1;
  css3Tabsize = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC YC", "33": "fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z", "164": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t", "132": "u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB" }, E: { "1": "M G eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K ZC FC aC", "132": "D E F A B C L bC cC dC GC 3B 4B" }, F: { "1": "HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F kC lC mC", "132": "G N O P BB t u v w CB DB EB FB GB", "164": "B C nC 3B SC oC 4B" }, G: { "1": "5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC", "132": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C" }, H: { "164": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "132": "GD HD" }, J: { "132": "D A" }, K: { "1": "H", "2": "A", "164": "B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "164": "WD XD" } }, B: 4, C: "CSS3 tab-size", D: true };
  return css3Tabsize;
}
var intrinsicWidth;
var hasRequiredIntrinsicWidth;
function requireIntrinsicWidth() {
  if (hasRequiredIntrinsicWidth)
    return intrinsicWidth;
  hasRequiredIntrinsicWidth = 1;
  intrinsicWidth = { A: { A: { "2": "K D E F A B UC" }, B: { "2": "C L M G N O P", "1025": "0 1 2 3 4 5 6 7 8 9 d e f g h i j k l m n o p q r x y z I s", "1537": "Q H R S T U V W X Y Z a b c" }, C: { "2": "VC", "932": "8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB XC YC", "2308": "0 1 2 3 4 5 6 7 8 9 qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC" }, D: { "2": "J AB K D E F A B C L M G N O P BB t u", "545": "v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB", "1025": "0 1 2 3 4 5 6 7 8 9 d e f g h i j k l m n o p q r x y z I s CC DC EC", "1537": "YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c" }, E: { "1": "6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K ZC FC aC", "516": "B C L M G 3B 4B eC fC gC HC IC 5B hC", "548": "F A dC GC", "676": "D E bC cC" }, F: { "2": "F B C kC lC mC nC 3B SC oC 4B", "513": "MB", "545": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB", "1025": "e f g h i j k l m n o p q r", "1537": "LB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d" }, G: { "1": "6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC", "516": "6C 7C 8C HC IC 5B 9C", "548": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C", "676": "E sC tC" }, H: { "2": "BD" }, I: { "2": "8B J CD DD ED FD TC", "545": "GD HD", "1025": "I" }, J: { "2": "D", "545": "A" }, K: { "2": "A B C 3B SC 4B", "1025": "H" }, L: { "1025": "I" }, M: { "2308": "s" }, N: { "2": "A B" }, O: { "1537": "5B" }, P: { "545": "J", "1025": "t u v w 7B SD TD", "1537": "ID JD KD LD MD GC ND OD PD QD RD 6B" }, Q: { "1537": "UD" }, R: { "1537": "VD" }, S: { "932": "WD", "2308": "XD" } }, B: 5, C: "Intrinsic & Extrinsic Sizing", D: true };
  return intrinsicWidth;
}
var cssWidthStretch;
var hasRequiredCssWidthStretch;
function requireCssWidthStretch() {
  if (hasRequiredCssWidthStretch)
    return cssWidthStretch;
  hasRequiredCssWidthStretch = 1;
  cssWidthStretch = { A: { D: { "2": "J AB K D E F A B C L M G N O P BB t u", "33": "0 1 2 3 4 5 6 7 8 9 v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, L: { "33": "I" }, B: { "2": "C L M G N O P", "33": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "2": "VC", "33": "0 1 2 3 4 5 6 7 8 9 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC XC YC" }, M: { "33": "s" }, A: { "2": "K D E F A B UC" }, F: { "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, K: { "2": "A B C 3B SC 4B", "33": "H" }, E: { "2": "J AB K ZC FC aC bC jC", "33": "D E F A B C L M G cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC" }, G: { "2": "FC pC TC qC rC", "33": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, P: { "2": "J", "33": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, I: { "2": "8B J CD DD ED FD TC", "33": "I GD HD" } }, B: 6, C: "width: stretch property", D: void 0 };
  return cssWidthStretch;
}
var css3CursorsNewer;
var hasRequiredCss3CursorsNewer;
function requireCss3CursorsNewer() {
  if (hasRequiredCss3CursorsNewer)
    return css3CursorsNewer;
  hasRequiredCss3CursorsNewer = 1;
  css3CursorsNewer = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "33": "VC 8B J AB K D E F A B C L M G N O P BB t u v w XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "J AB K D E ZC FC aC bC cC" }, F: { "1": "C CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r oC 4B", "2": "F B kC lC mC nC 3B SC", "33": "G N O P BB t u v w" }, G: { "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "33": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "2": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "2": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "2": "WD XD" } }, B: 2, C: "CSS3 Cursors: zoom-in & zoom-out", D: true };
  return css3CursorsNewer;
}
var css3CursorsGrab;
var hasRequiredCss3CursorsGrab;
function requireCss3CursorsGrab() {
  if (hasRequiredCss3CursorsGrab)
    return css3CursorsGrab;
  hasRequiredCss3CursorsGrab = 1;
  css3CursorsGrab = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "33": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB" }, E: { "1": "B C L M G 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "J AB K D E F A ZC FC aC bC cC dC GC" }, F: { "1": "C hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r oC 4B", "2": "F B kC lC mC nC 3B SC", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB" }, G: { "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "33": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "2": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "2": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "2": "WD XD" } }, B: 2, C: "CSS grab & grabbing cursors", D: true };
  return css3CursorsGrab;
}
var cssSticky;
var hasRequiredCssSticky;
function requireCssSticky() {
  if (hasRequiredCssSticky)
    return cssSticky;
  hasRequiredCssSticky = 1;
  cssSticky = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G", "1028": "Q H R S T U V W X Y Z", "4100": "N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB XC YC", "194": "EB FB GB HB IB JB", "516": "KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB", "322": "w CB DB EB FB GB HB IB JB KB LB MB NB OB eB fB gB hB", "1028": "iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z" }, E: { "1": "L M G eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K ZC FC aC", "33": "E F A B C cC dC GC 3B 4B", "2084": "D bC" }, F: { "1": "2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB kC lC mC nC 3B SC oC 4B", "322": "RB SB TB", "1028": "UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B" }, G: { "1": "2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC", "33": "E tC uC vC wC xC yC zC 0C 1C", "2084": "rC sC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J ID" }, Q: { "1028": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "516": "WD" } }, B: 5, C: "CSS position:sticky", D: true };
  return cssSticky;
}
var pointer;
var hasRequiredPointer;
function requirePointer() {
  if (hasRequiredPointer)
    return pointer;
  hasRequiredPointer = 1;
  pointer = { A: { A: { "1": "B", "2": "K D E F UC", "164": "A" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB XC YC", "8": "K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB", "328": "TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u", "8": "v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB", "584": "eB fB gB" }, E: { "1": "L M G eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K ZC FC aC", "8": "D E F A B C bC cC dC GC 3B", "1096": "4B" }, F: { "1": "UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "8": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB", "584": "RB SB TB" }, G: { "1": "3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "8": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C", "6148": "2C" }, H: { "2": "BD" }, I: { "1": "I", "8": "8B J CD DD ED FD TC GD HD" }, J: { "8": "D A" }, K: { "1": "H", "2": "A", "8": "B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "B", "36": "A" }, O: { "1": "5B" }, P: { "1": "t u v w JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "ID", "8": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "328": "WD" } }, B: 2, C: "Pointer events", D: true };
  return pointer;
}
var textDecoration;
var hasRequiredTextDecoration;
function requireTextDecoration() {
  if (hasRequiredTextDecoration)
    return textDecoration;
  hasRequiredTextDecoration = 1;
  textDecoration = { A: { A: { "2": "K D E F A B UC" }, B: { "2": "C L M G N O P", "2052": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "2": "VC 8B J AB XC YC", "1028": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "1060": "K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB" }, D: { "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB", "226": "EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB", "2052": "0 1 2 3 4 5 6 7 8 9 jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "2": "J AB K D ZC FC aC bC", "772": "L M G 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "804": "E F A B C dC GC 3B", "1316": "cC" }, F: { "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB kC lC mC nC 3B SC oC 4B", "226": "NB OB PB QB RB SB TB UB VB", "2052": "WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, G: { "2": "FC pC TC qC rC sC", "292": "E tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "2": "A B C 3B SC 4B", "2052": "H" }, L: { "2052": "I" }, M: { "1028": "s" }, N: { "2": "A B" }, O: { "2052": "5B" }, P: { "2": "J ID JD", "2052": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "2052": "UD" }, R: { "2052": "VD" }, S: { "1028": "WD XD" } }, B: 4, C: "text-decoration styling", D: true };
  return textDecoration;
}
var mdnTextDecorationShorthand;
var hasRequiredMdnTextDecorationShorthand;
function requireMdnTextDecorationShorthand() {
  if (hasRequiredMdnTextDecorationShorthand)
    return mdnTextDecorationShorthand;
  hasRequiredMdnTextDecorationShorthand = 1;
  mdnTextDecorationShorthand = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB XC YC" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB kC lC mC nC 3B SC oC 4B" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "2": "J AB K D ZC FC aC bC cC jC", "33": "E F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC" }, G: { "2": "FC pC TC qC rC sC", "33": "E tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, P: { "1": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J ID JD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" } }, B: 6, C: "text-decoration shorthand property", D: void 0 };
  return mdnTextDecorationShorthand;
}
var mdnTextDecorationColor;
var hasRequiredMdnTextDecorationColor;
function requireMdnTextDecorationColor() {
  if (hasRequiredMdnTextDecorationColor)
    return mdnTextDecorationColor;
  hasRequiredMdnTextDecorationColor = 1;
  mdnTextDecorationColor = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB XC YC", "33": "K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB kC lC mC nC 3B SC oC 4B" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "L M G 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB K D ZC FC aC bC cC jC", "33": "E F A B C dC GC 3B" }, G: { "1": "1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC sC", "33": "E tC uC vC wC xC yC zC 0C" }, P: { "1": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J ID JD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" } }, B: 6, C: "text-decoration-color property", D: void 0 };
  return mdnTextDecorationColor;
}
var mdnTextDecorationLine;
var hasRequiredMdnTextDecorationLine;
function requireMdnTextDecorationLine() {
  if (hasRequiredMdnTextDecorationLine)
    return mdnTextDecorationLine;
  hasRequiredMdnTextDecorationLine = 1;
  mdnTextDecorationLine = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB XC YC", "33": "K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB kC lC mC nC 3B SC oC 4B" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "L M G 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB K D ZC FC aC bC cC jC", "33": "E F A B C dC GC 3B" }, G: { "1": "1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC sC", "33": "E tC uC vC wC xC yC zC 0C" }, P: { "1": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J ID JD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" } }, B: 6, C: "text-decoration-line property", D: void 0 };
  return mdnTextDecorationLine;
}
var mdnTextDecorationStyle;
var hasRequiredMdnTextDecorationStyle;
function requireMdnTextDecorationStyle() {
  if (hasRequiredMdnTextDecorationStyle)
    return mdnTextDecorationStyle;
  hasRequiredMdnTextDecorationStyle = 1;
  mdnTextDecorationStyle = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB XC YC", "33": "K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB kC lC mC nC 3B SC oC 4B" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "L M G 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB K D ZC FC aC bC cC jC", "33": "E F A B C dC GC 3B" }, G: { "1": "1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC sC", "33": "E tC uC vC wC xC yC zC 0C" }, P: { "1": "t u v w KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J ID JD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" } }, B: 6, C: "text-decoration-style property", D: void 0 };
  return mdnTextDecorationStyle;
}
var textSizeAdjust;
var hasRequiredTextSizeAdjust;
function requireTextSizeAdjust() {
  if (hasRequiredTextSizeAdjust)
    return textSizeAdjust;
  hasRequiredTextSizeAdjust = 1;
  textSizeAdjust = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "33": "C L M G N O P" }, C: { "2": "0 1 2 3 4 5 6 7 8 9 VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB", "258": "EB" }, E: { "2": "J AB K D E F A B C L M G ZC FC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "258": "aC" }, F: { "1": "VB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB WB kC lC mC nC 3B SC oC 4B" }, G: { "2": "FC pC TC", "33": "E qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "33": "s" }, N: { "161": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "2": "WD XD" } }, B: 7, C: "CSS text-size-adjust", D: true };
  return textSizeAdjust;
}
var cssMasks;
var hasRequiredCssMasks;
function requireCssMasks() {
  if (hasRequiredCssMasks)
    return cssMasks;
  hasRequiredCssMasks = 1;
  cssMasks = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "8 9 I s", "2": "C L M G N", "164": "0 1 2 3 4 5 6 7 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z", "3138": "O", "12292": "P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B", "260": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB XC YC" }, D: { "1": "8 9 I s CC DC EC", "164": "0 1 2 3 4 5 6 7 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z" }, E: { "1": "IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "ZC FC", "164": "J AB K D E F A B C L M G aC bC cC dC GC 3B 4B eC fC gC HC" }, F: { "1": "p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "164": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o" }, G: { "1": "IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "164": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC" }, H: { "2": "BD" }, I: { "1": "I", "164": "GD HD", "676": "8B J CD DD ED FD TC" }, J: { "164": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "164": "5B" }, P: { "164": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "164": "UD" }, R: { "164": "VD" }, S: { "1": "XD", "260": "WD" } }, B: 4, C: "CSS Masks", D: true };
  return cssMasks;
}
var cssClipPath;
var hasRequiredCssClipPath;
function requireCssClipPath() {
  if (hasRequiredCssClipPath)
    return cssClipPath;
  hasRequiredCssClipPath = 1;
  cssClipPath = { A: { A: { "2": "K D E F A B UC" }, B: { "2": "C L M G N O", "260": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "3138": "P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B", "132": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB XC YC", "644": "ZB aB bB cB dB eB fB" }, D: { "2": "J AB K D E F A B C L M G N O P BB t u v w", "260": "0 1 2 3 4 5 6 7 8 9 hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "292": "CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB" }, E: { "2": "J AB K ZC FC aC bC", "260": "M G eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "292": "D E F A B C L cC dC GC 3B 4B" }, F: { "2": "F B C kC lC mC nC 3B SC oC 4B", "260": "UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "292": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB" }, G: { "2": "FC pC TC qC rC", "260": "2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "292": "E sC tC uC vC wC xC yC zC 0C 1C" }, H: { "2": "BD" }, I: { "2": "8B J CD DD ED FD TC", "260": "I", "292": "GD HD" }, J: { "2": "D A" }, K: { "2": "A B C 3B SC 4B", "260": "H" }, L: { "260": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "260": "5B" }, P: { "292": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "260": "UD" }, R: { "260": "VD" }, S: { "1": "XD", "644": "WD" } }, B: 4, C: "CSS clip-path property (for HTML)", D: true };
  return cssClipPath;
}
var cssBoxdecorationbreak;
var hasRequiredCssBoxdecorationbreak;
function requireCssBoxdecorationbreak() {
  if (hasRequiredCssBoxdecorationbreak)
    return cssBoxdecorationbreak;
  hasRequiredCssBoxdecorationbreak = 1;
  cssBoxdecorationbreak = { A: { A: { "2": "K D E F A B UC" }, B: { "2": "C L M G N O P", "164": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB XC YC" }, D: { "2": "J AB K D E F A B C L M G N O P BB t u", "164": "0 1 2 3 4 5 6 7 8 9 v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "2": "J AB K ZC FC aC", "164": "D E F A B C L M G bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC" }, F: { "2": "F kC lC mC nC", "129": "B C 3B SC oC 4B", "164": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, G: { "2": "FC pC TC qC rC", "164": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "132": "BD" }, I: { "2": "8B J CD DD ED FD TC", "164": "I GD HD" }, J: { "2": "D", "164": "A" }, K: { "2": "A", "129": "B C 3B SC 4B", "164": "H" }, L: { "164": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "164": "5B" }, P: { "164": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "164": "UD" }, R: { "164": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS box-decoration-break", D: true };
  return cssBoxdecorationbreak;
}
var objectFit;
var hasRequiredObjectFit;
function requireObjectFit() {
  if (hasRequiredObjectFit)
    return objectFit;
  hasRequiredObjectFit = 1;
  objectFit = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G", "260": "N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB" }, E: { "1": "A B C L M G GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D ZC FC aC bC", "132": "E F cC dC" }, F: { "1": "BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F G N O P kC lC mC", "33": "B C nC 3B SC oC 4B" }, G: { "1": "wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC sC", "132": "E tC uC vC" }, H: { "33": "BD" }, I: { "1": "I HD", "2": "8B J CD DD ED FD TC GD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A", "33": "B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS3 object-fit/object-position", D: true };
  return objectFit;
}
var cssShapes;
var hasRequiredCssShapes;
function requireCssShapes() {
  if (hasRequiredCssShapes)
    return cssShapes;
  hasRequiredCssShapes = 1;
  cssShapes = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB XC YC", "322": "dB eB fB gB hB iB jB kB 9B lB AC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB", "194": "MB NB OB" }, E: { "1": "B C L M G GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D ZC FC aC bC", "33": "E F A cC dC" }, F: { "1": "CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w kC lC mC nC 3B SC oC 4B" }, G: { "1": "xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC sC", "33": "E tC uC vC wC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "2": "WD" } }, B: 4, C: "CSS Shapes Level 1", D: true };
  return cssShapes;
}
var textOverflow;
var hasRequiredTextOverflow;
function requireTextOverflow() {
  if (hasRequiredTextOverflow)
    return textOverflow;
  hasRequiredTextOverflow = 1;
  textOverflow = { A: { A: { "1": "K D E F A B", "2": "UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "8": "VC 8B J AB K XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "1": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC" }, F: { "1": "B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 3B SC oC 4B", "33": "F kC lC mC nC" }, G: { "1": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "1": "BD" }, I: { "1": "8B J I CD DD ED FD TC GD HD" }, J: { "1": "D A" }, K: { "1": "H 4B", "33": "A B C 3B SC" }, L: { "1": "I" }, M: { "1": "s" }, N: { "1": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 2, C: "CSS3 Text-overflow", D: true };
  return textOverflow;
}
var cssDeviceadaptation;
var hasRequiredCssDeviceadaptation;
function requireCssDeviceadaptation() {
  if (hasRequiredCssDeviceadaptation)
    return cssDeviceadaptation;
  hasRequiredCssDeviceadaptation = 1;
  cssDeviceadaptation = { A: { A: { "2": "K D E F UC", "164": "A B" }, B: { "66": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "164": "C L M G N O P" }, C: { "2": "0 1 2 3 4 5 6 7 8 9 VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC XC YC" }, D: { "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB", "66": "0 1 2 3 4 5 6 7 8 9 HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "2": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC" }, F: { "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB kC lC mC nC 3B SC oC 4B", "66": "SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, G: { "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "292": "BD" }, I: { "2": "8B J I CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "2": "A H", "292": "B C 3B SC 4B" }, L: { "2": "I" }, M: { "2": "s" }, N: { "164": "A B" }, O: { "2": "5B" }, P: { "2": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "66": "UD" }, R: { "2": "VD" }, S: { "2": "WD XD" } }, B: 5, C: "CSS Device Adaptation", D: true };
  return cssDeviceadaptation;
}
var cssMediaResolution;
var hasRequiredCssMediaResolution;
function requireCssMediaResolution() {
  if (hasRequiredCssMediaResolution)
    return cssMediaResolution;
  hasRequiredCssMediaResolution = 1;
  cssMediaResolution = { A: { A: { "2": "K D E UC", "132": "F A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "1028": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B", "260": "J AB K D E F A B C L M G XC YC", "1028": "N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "548": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB", "1028": "HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB" }, E: { "1": "6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "ZC FC", "548": "J AB K D E F A B C L M G aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC" }, F: { "1": "hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r 4B", "2": "F", "548": "B C kC lC mC nC 3B SC oC", "1028": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB" }, G: { "1": "6B JC KC LC MC NC AD 7B OC PC QC RC", "16": "FC", "548": "E pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C" }, H: { "132": "BD" }, I: { "1": "I", "16": "CD DD", "548": "8B J ED FD TC", "1028": "GD HD" }, J: { "548": "D A" }, K: { "1": "H 4B", "548": "A B C 3B SC" }, L: { "1": "I" }, M: { "1": "s" }, N: { "132": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w GC ND OD PD QD RD 6B 7B SD TD", "1028": "J ID JD KD LD MD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "Media Queries: resolution feature", D: true };
  return cssMediaResolution;
}
var cssTextAlignLast;
var hasRequiredCssTextAlignLast;
function requireCssTextAlignLast() {
  if (hasRequiredCssTextAlignLast)
    return cssTextAlignLast;
  hasRequiredCssTextAlignLast = 1;
  cssTextAlignLast = { A: { A: { "132": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "4": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B XC YC", "33": "C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB", "322": "NB OB PB QB RB SB TB UB VB WB XB YB" }, E: { "1": "6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC" }, F: { "1": "MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u kC lC mC nC 3B SC oC 4B", "578": "v w CB DB EB FB GB HB IB JB KB LB" }, G: { "1": "6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "132": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "33": "WD" } }, B: 4, C: "CSS3 text-align-last", D: true };
  return cssTextAlignLast;
}
var cssCrispEdges;
var hasRequiredCssCrispEdges;
function requireCssCrispEdges() {
  if (hasRequiredCssCrispEdges)
    return cssCrispEdges;
  hasRequiredCssCrispEdges = 1;
  cssCrispEdges = { A: { A: { "2": "K UC", "2340": "D E F A B" }, B: { "2": "C L M G N O P", "1025": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B XC", "513": "pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b", "545": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB YC" }, D: { "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB", "1025": "0 1 2 3 4 5 6 7 8 9 TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "1": "A B C L M G GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB ZC FC aC", "164": "K", "4644": "D E F bC cC dC" }, F: { "2": "F B G N O P BB t u v w CB DB EB FB kC lC mC nC 3B SC", "545": "C oC 4B", "1025": "GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, G: { "1": "wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC", "4260": "qC rC", "4644": "E sC tC uC vC" }, H: { "2": "BD" }, I: { "2": "8B J CD DD ED FD TC GD HD", "1025": "I" }, J: { "2": "D", "4260": "A" }, K: { "2": "A B 3B SC", "545": "C 4B", "1025": "H" }, L: { "1025": "I" }, M: { "1": "s" }, N: { "2340": "A B" }, O: { "1025": "5B" }, P: { "1025": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1025": "UD" }, R: { "1025": "VD" }, S: { "1": "XD", "4097": "WD" } }, B: 4, C: "Crisp edges/pixelated images", D: true };
  return cssCrispEdges;
}
var cssLogicalProps;
var hasRequiredCssLogicalProps;
function requireCssLogicalProps() {
  if (hasRequiredCssLogicalProps)
    return cssLogicalProps;
  hasRequiredCssLogicalProps = 1;
  cssLogicalProps = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P", "1028": "W X", "1540": "Q H R S T U V" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC", "164": "8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB XC YC", "1540": "TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "292": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB", "1028": "W X", "1540": "tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V" }, E: { "1": "G gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "292": "J AB K D E F A B C ZC FC aC bC cC dC GC 3B", "1540": "L M 4B eC", "3076": "fC" }, F: { "1": "0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "292": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB", "1028": "yB zB", "1540": "iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB" }, G: { "1": "8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "292": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C", "1540": "1C 2C 3C 4C 5C 6C", "3076": "7C" }, H: { "2": "BD" }, I: { "1": "I", "292": "8B J CD DD ED FD TC GD HD" }, J: { "292": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w RD 6B 7B SD TD", "292": "J ID JD KD LD MD", "1540": "GC ND OD PD QD" }, Q: { "1540": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "1540": "WD" } }, B: 5, C: "CSS Logical Properties", D: true };
  return cssLogicalProps;
}
var cssAppearance;
var hasRequiredCssAppearance;
function requireCssAppearance() {
  if (hasRequiredCssAppearance)
    return cssAppearance;
  hasRequiredCssAppearance = 1;
  cssAppearance = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "33": "S", "164": "Q H R", "388": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "164": "NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q", "676": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "33": "S", "164": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R" }, E: { "1": "IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "164": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC" }, F: { "1": "xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "uB vB wB", "164": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB" }, G: { "1": "IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "164": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC" }, H: { "2": "BD" }, I: { "1": "I", "164": "8B J CD DD ED FD TC GD HD" }, J: { "164": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A", "388": "B" }, O: { "1": "5B" }, P: { "164": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "164": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "164": "WD" } }, B: 5, C: "CSS Appearance", D: true };
  return cssAppearance;
}
var cssSnappoints;
var hasRequiredCssSnappoints;
function requireCssSnappoints() {
  if (hasRequiredCssSnappoints)
    return cssSnappoints;
  hasRequiredCssSnappoints = 1;
  cssSnappoints = { A: { A: { "2": "K D E F UC", "6308": "A", "6436": "B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "6436": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB XC YC", "2052": "RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB", "8258": "qB rB sB" }, E: { "1": "B C L M G 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D E ZC FC aC bC cC", "3108": "F A dC GC" }, F: { "1": "oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB kC lC mC nC 3B SC oC 4B", "8258": "gB hB iB jB kB lB mB nB" }, G: { "1": "yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC", "3108": "uC vC wC xC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w GC ND OD PD QD RD 6B 7B SD TD", "2": "J ID JD KD LD MD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "2052": "WD" } }, B: 4, C: "CSS Scroll Snap", D: true };
  return cssSnappoints;
}
var cssRegions;
var hasRequiredCssRegions;
function requireCssRegions() {
  if (hasRequiredCssRegions)
    return cssRegions;
  hasRequiredCssRegions = 1;
  cssRegions = { A: { A: { "2": "K D E F UC", "420": "A B" }, B: { "2": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "420": "C L M G N O P" }, C: { "2": "0 1 2 3 4 5 6 7 8 9 VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC XC YC" }, D: { "2": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "36": "G N O P", "66": "BB t u v w CB DB EB FB GB HB IB JB KB LB MB" }, E: { "2": "J AB K C L M G ZC FC aC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "33": "D E F A B bC cC dC GC" }, F: { "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r kC lC mC nC 3B SC oC 4B" }, G: { "2": "FC pC TC qC rC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "33": "E sC tC uC vC wC xC yC" }, H: { "2": "BD" }, I: { "2": "8B J I CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "2": "A B C H 3B SC 4B" }, L: { "2": "I" }, M: { "2": "s" }, N: { "420": "A B" }, O: { "2": "5B" }, P: { "2": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "2": "UD" }, R: { "2": "VD" }, S: { "2": "WD XD" } }, B: 5, C: "CSS Regions", D: true };
  return cssRegions;
}
var cssImageSet;
var hasRequiredCssImageSet;
function requireCssImageSet() {
  if (hasRequiredCssImageSet)
    return cssImageSet;
  hasRequiredCssImageSet = 1;
  cssImageSet = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "2 3 4 5 6 7 8 9 I s", "2": "C L M G N O P", "164": "0 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z", "2049": "1" }, C: { "1": "1 2 3 4 5 6 7 8 9 I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U XC YC", "66": "V W", "2305": "0 Y Z a b c d e f g h i j k l m n o p q r x y z", "2820": "X" }, D: { "1": "2 3 4 5 6 7 8 9 I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t", "164": "0 u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z", "2049": "1" }, E: { "1": "7B OC PC QC RC jC", "2": "J AB ZC FC aC", "132": "A B C L GC 3B 4B eC", "164": "K D E F bC cC dC", "1540": "M G fC gC HC IC 5B hC 6B JC KC LC MC NC iC" }, F: { "1": "j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "164": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h", "2049": "i" }, G: { "1": "7B OC PC QC RC", "2": "FC pC TC qC", "132": "wC xC yC zC 0C 1C 2C 3C 4C 5C", "164": "E rC sC tC uC vC", "1540": "6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "164": "GD HD" }, J: { "2": "D", "164": "A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "164": "5B" }, P: { "164": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "164": "UD" }, R: { "164": "VD" }, S: { "2": "WD XD" } }, B: 5, C: "CSS image-set", D: true };
  return cssImageSet;
}
var cssWritingMode;
var hasRequiredCssWritingMode;
function requireCssWritingMode() {
  if (hasRequiredCssWritingMode)
    return cssWritingMode;
  hasRequiredCssWritingMode = 1;
  cssWritingMode = { A: { A: { "132": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 C L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB XC YC", "322": "OB PB QB RB SB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K", "16": "D", "33": "E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB" }, E: { "1": "B C L M G 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J ZC FC", "16": "AB", "33": "K D E F A aC bC cC dC GC" }, F: { "1": "NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB" }, G: { "1": "yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "16": "FC pC TC", "33": "E qC rC sC tC uC vC wC xC" }, H: { "2": "BD" }, I: { "1": "I", "2": "CD DD ED", "33": "8B J FD TC GD HD" }, J: { "33": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "36": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "33": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 2, C: "CSS writing-mode property", D: true };
  return cssWritingMode;
}
var cssCrossFade;
var hasRequiredCssCrossFade;
function requireCssCrossFade() {
  if (hasRequiredCssCrossFade)
    return cssCrossFade;
  hasRequiredCssCrossFade = 1;
  cssCrossFade = { A: { A: { "2": "K D E F A B UC" }, B: { "2": "C L M G N O P", "33": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "2": "0 1 2 3 4 5 6 7 8 9 VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC XC YC" }, D: { "2": "J AB K D E F A B C L M G N", "33": "0 1 2 3 4 5 6 7 8 9 O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "1": "A B C L M G GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB ZC FC", "33": "K D E F aC bC cC dC" }, F: { "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, G: { "1": "wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC", "33": "E qC rC sC tC uC vC" }, H: { "2": "BD" }, I: { "2": "8B J CD DD ED FD TC", "33": "I GD HD" }, J: { "2": "D A" }, K: { "2": "A B C 3B SC 4B", "33": "H" }, L: { "33": "I" }, M: { "2": "s" }, N: { "2": "A B" }, O: { "33": "5B" }, P: { "33": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "33": "UD" }, R: { "33": "VD" }, S: { "2": "WD XD" } }, B: 4, C: "CSS Cross-Fade Function", D: true };
  return cssCrossFade;
}
var cssReadOnlyWrite;
var hasRequiredCssReadOnlyWrite;
function requireCssReadOnlyWrite() {
  if (hasRequiredCssReadOnlyWrite)
    return cssReadOnlyWrite;
  hasRequiredCssReadOnlyWrite = 1;
  cssReadOnlyWrite = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 L M G N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "16": "VC", "33": "8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "16": "J AB K D E F A B C L M", "132": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "16": "ZC FC", "132": "J AB K D E aC bC cC" }, F: { "1": "w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "16": "F B kC lC mC nC 3B", "132": "C G N O P BB t u v SC oC 4B" }, G: { "1": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "16": "FC pC", "132": "E TC qC rC sC tC" }, H: { "2": "BD" }, I: { "1": "I", "16": "CD DD", "132": "8B J ED FD TC GD HD" }, J: { "1": "A", "132": "D" }, K: { "1": "H", "2": "A B 3B", "132": "C SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "33": "WD" } }, B: 1, C: "CSS :read-only and :read-write selectors", D: true };
  return cssReadOnlyWrite;
}
var textEmphasis;
var hasRequiredTextEmphasis;
function requireTextEmphasis() {
  if (hasRequiredTextEmphasis)
    return textEmphasis;
  hasRequiredTextEmphasis = 1;
  textEmphasis = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 i j k l m n o p q r x y z I s", "2": "C L M G N O P", "164": "Q H R S T U V W X Y Z a b c d e f g h" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XC YC", "322": "XB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB", "164": "DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h" }, E: { "1": "E F A B C L M G cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K ZC FC aC", "164": "D bC" }, F: { "1": "V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "164": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U" }, G: { "1": "E sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC", "164": "GD HD" }, J: { "2": "D", "164": "A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w SD TD", "164": "J ID JD KD LD MD GC ND OD PD QD RD 6B 7B" }, Q: { "164": "UD" }, R: { "164": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "text-emphasis styling", D: true };
  return textEmphasis;
}
var cssGrid;
var hasRequiredCssGrid;
function requireCssGrid() {
  if (hasRequiredCssGrid)
    return cssGrid;
  hasRequiredCssGrid = 1;
  cssGrid = { A: { A: { "2": "K D E UC", "8": "F", "292": "A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 N O P Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "292": "C L M G" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P XC YC", "8": "BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB", "584": "SB TB UB VB WB XB YB ZB aB bB cB dB", "1025": "eB fB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB", "8": "DB EB FB GB", "200": "HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB", "1025": "jB" }, E: { "1": "B C L M G GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB ZC FC aC", "8": "K D E F A bC cC dC" }, F: { "1": "WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB kC lC mC nC 3B SC oC 4B", "200": "GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB" }, G: { "1": "xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC", "8": "E rC sC tC uC vC wC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD", "8": "TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "292": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "ID", "8": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 4, C: "CSS Grid Layout (level 1)", D: true };
  return cssGrid;
}
var cssTextSpacing;
var hasRequiredCssTextSpacing;
function requireCssTextSpacing() {
  if (hasRequiredCssTextSpacing)
    return cssTextSpacing;
  hasRequiredCssTextSpacing = 1;
  cssTextSpacing = { A: { A: { "2": "K D UC", "161": "E F A B" }, B: { "2": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "161": "C L M G N O P" }, C: { "2": "0 1 2 3 4 5 6 7 8 9 VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC XC YC" }, D: { "2": "0 1 2 3 4 5 6 7 8 9 J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, E: { "2": "J AB K D E F A B C L M G ZC FC aC bC cC dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC" }, F: { "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r kC lC mC nC 3B SC oC 4B" }, G: { "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC" }, H: { "2": "BD" }, I: { "2": "8B J I CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "2": "A B C H 3B SC 4B" }, L: { "2": "I" }, M: { "2": "s" }, N: { "16": "A B" }, O: { "2": "5B" }, P: { "2": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, Q: { "2": "UD" }, R: { "2": "VD" }, S: { "2": "WD XD" } }, B: 5, C: "CSS Text 4 text-spacing", D: false };
  return cssTextSpacing;
}
var cssAnyLink;
var hasRequiredCssAnyLink;
function requireCssAnyLink() {
  if (hasRequiredCssAnyLink)
    return cssAnyLink;
  hasRequiredCssAnyLink = 1;
  cssAnyLink = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "16": "VC", "33": "8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "16": "J AB K D E F A B C L M", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB" }, E: { "1": "F A B C L M G dC GC 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "16": "J AB K ZC FC aC", "33": "D E bC cC" }, F: { "1": "eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB" }, G: { "1": "uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "16": "FC pC TC qC", "33": "E rC sC tC" }, H: { "2": "BD" }, I: { "1": "I", "16": "8B J CD DD ED FD TC", "33": "GD HD" }, J: { "16": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w MD GC ND OD PD QD RD 6B 7B SD TD", "16": "J", "33": "ID JD KD LD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "33": "WD" } }, B: 5, C: "CSS :any-link selector", D: true };
  return cssAnyLink;
}
var mdnCssUnicodeBidiIsolate;
var hasRequiredMdnCssUnicodeBidiIsolate;
function requireMdnCssUnicodeBidiIsolate() {
  if (hasRequiredMdnCssUnicodeBidiIsolate)
    return mdnCssUnicodeBidiIsolate;
  hasRequiredMdnCssUnicodeBidiIsolate = 1;
  mdnCssUnicodeBidiIsolate = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G", "33": "N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F XC YC", "33": "A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "B C L M G 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB ZC FC aC jC", "33": "K D E F A bC cC dC GC" }, G: { "1": "yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC", "33": "E rC sC tC uC vC wC xC" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" } }, B: 6, C: "isolate from unicode-bidi", D: void 0 };
  return mdnCssUnicodeBidiIsolate;
}
var mdnCssUnicodeBidiPlaintext;
var hasRequiredMdnCssUnicodeBidiPlaintext;
function requireMdnCssUnicodeBidiPlaintext() {
  if (hasRequiredMdnCssUnicodeBidiPlaintext)
    return mdnCssUnicodeBidiPlaintext;
  hasRequiredMdnCssUnicodeBidiPlaintext = 1;
  mdnCssUnicodeBidiPlaintext = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F XC YC", "33": "A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB kC lC mC nC 3B SC oC 4B" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "B C L M G 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB ZC FC aC jC", "33": "K D E F A bC cC dC GC" }, G: { "1": "yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC", "33": "E rC sC tC uC vC wC xC" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" } }, B: 6, C: "plaintext from unicode-bidi", D: void 0 };
  return mdnCssUnicodeBidiPlaintext;
}
var mdnCssUnicodeBidiIsolateOverride;
var hasRequiredMdnCssUnicodeBidiIsolateOverride;
function requireMdnCssUnicodeBidiIsolateOverride() {
  if (hasRequiredMdnCssUnicodeBidiIsolateOverride)
    return mdnCssUnicodeBidiIsolateOverride;
  hasRequiredMdnCssUnicodeBidiIsolateOverride = 1;
  mdnCssUnicodeBidiIsolateOverride = { A: { D: { "1": "0 1 2 3 4 5 6 7 8 9 aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB" }, L: { "1": "I" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N XC YC", "33": "O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "1": "NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB kC lC mC nC 3B SC oC 4B" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, E: { "1": "B C L M G 3B 4B eC fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB K ZC FC aC bC jC", "33": "D E F A cC dC GC" }, G: { "1": "yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC rC", "33": "E sC tC uC vC wC xC" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" } }, B: 6, C: "isolate-override from unicode-bidi", D: void 0 };
  return mdnCssUnicodeBidiIsolateOverride;
}
var cssOverscrollBehavior;
var hasRequiredCssOverscrollBehavior;
function requireCssOverscrollBehavior() {
  if (hasRequiredCssOverscrollBehavior)
    return cssOverscrollBehavior;
  hasRequiredCssOverscrollBehavior = 1;
  cssOverscrollBehavior = { A: { A: { "2": "K D E F UC", "132": "A B" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "132": "C L M G N O", "516": "P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB XC YC" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB", "260": "nB oB" }, E: { "1": "6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D E F A B C L M ZC FC aC bC cC dC GC 3B 4B eC", "1090": "G fC gC HC IC 5B hC" }, F: { "1": "eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB kC lC mC nC 3B SC oC 4B", "260": "cB dB" }, G: { "1": "6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C", "1090": "7C 8C HC IC 5B 9C" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "132": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J ID JD KD" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "XD", "2": "WD" } }, B: 5, C: "CSS overscroll-behavior", D: true };
  return cssOverscrollBehavior;
}
var cssTextOrientation;
var hasRequiredCssTextOrientation;
function requireCssTextOrientation() {
  if (hasRequiredCssTextOrientation)
    return cssTextOrientation;
  hasRequiredCssTextOrientation = 1;
  cssTextOrientation = { A: { A: { "2": "K D E F A B UC" }, B: { "1": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s", "2": "C L M G N O P" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB XC YC", "194": "QB RB SB" }, D: { "1": "0 1 2 3 4 5 6 7 8 9 aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC", "2": "J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB" }, E: { "1": "M G fC gC HC IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC jC", "2": "J AB K D E F ZC FC aC bC cC dC", "16": "A", "33": "B C L GC 3B 4B eC" }, F: { "1": "NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r", "2": "F B C G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB kC lC mC nC 3B SC oC 4B" }, G: { "1": "wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "E FC pC TC qC rC sC tC uC vC" }, H: { "2": "BD" }, I: { "1": "I", "2": "8B J CD DD ED FD TC GD HD" }, J: { "2": "D A" }, K: { "1": "H", "2": "A B C 3B SC 4B" }, L: { "1": "I" }, M: { "1": "s" }, N: { "2": "A B" }, O: { "1": "5B" }, P: { "1": "t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD", "2": "J" }, Q: { "1": "UD" }, R: { "1": "VD" }, S: { "1": "WD XD" } }, B: 2, C: "CSS text-orientation", D: true };
  return cssTextOrientation;
}
var cssPrintColorAdjust;
var hasRequiredCssPrintColorAdjust;
function requireCssPrintColorAdjust() {
  if (hasRequiredCssPrintColorAdjust)
    return cssPrintColorAdjust;
  hasRequiredCssPrintColorAdjust = 1;
  cssPrintColorAdjust = { A: { D: { "2": "J AB K D E F A B C L M G N", "33": "0 1 2 3 4 5 6 7 8 9 O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s CC DC EC" }, L: { "33": "I" }, B: { "2": "C L M G N O P", "33": "0 1 2 3 4 5 6 7 8 9 Q H R S T U V W X Y Z a b c d e f g h i j k l m n o p q r x y z I s" }, C: { "1": "0 1 2 3 4 5 6 7 8 9 g h i j k l m n o p q r x y z I s CC DC EC WC", "2": "VC 8B J AB K D E F A B C L M G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB XC YC", "33": "aB bB cB dB eB fB gB hB iB jB kB 9B lB AC mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f" }, M: { "1": "s" }, A: { "2": "K D E F A B UC" }, F: { "2": "F B C kC lC mC nC 3B SC oC 4B", "33": "G N O P BB t u v w CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB pB qB rB sB tB uB vB wB xB yB zB 0B 1B 2B Q H R BC S T U V W X Y Z a b c d e f g h i j k l m n o p q r" }, K: { "2": "A B C 3B SC 4B", "33": "H" }, E: { "1": "IC 5B hC 6B JC KC LC MC NC iC 7B OC PC QC RC", "2": "J AB ZC FC aC jC", "33": "K D E F A B C L M G bC cC dC GC 3B 4B eC fC gC HC" }, G: { "1": "IC 5B 9C 6B JC KC LC MC NC AD 7B OC PC QC RC", "2": "FC pC TC qC", "33": "E rC sC tC uC vC wC xC yC zC 0C 1C 2C 3C 4C 5C 6C 7C 8C HC" }, P: { "33": "J t u v w ID JD KD LD MD GC ND OD PD QD RD 6B 7B SD TD" }, I: { "2": "8B J CD DD ED FD TC", "33": "I GD HD" } }, B: 6, C: "print-color-adjust property", D: void 0 };
  return cssPrintColorAdjust;
}
let unpack = featureExports;
function browsersSort(a, b) {
  a = a.split(" ");
  b = b.split(" ");
  if (a[0] > b[0]) {
    return 1;
  } else if (a[0] < b[0]) {
    return -1;
  } else {
    return Math.sign(parseFloat(a[1]) - parseFloat(b[1]));
  }
}
function f(data2, opts, callback) {
  data2 = unpack(data2);
  if (!callback) {
    [callback, opts] = [opts, {}];
  }
  let match = opts.match || /\sx($|\s)/;
  let need = [];
  for (let browser2 in data2.stats) {
    let versions2 = data2.stats[browser2];
    for (let version in versions2) {
      let support = versions2[version];
      if (support.match(match)) {
        need.push(browser2 + " " + version);
      }
    }
  }
  callback(need.sort(browsersSort));
}
let result = {};
function prefix(names, data2) {
  for (let name2 of names) {
    result[name2] = Object.assign({}, data2);
  }
}
function add(names, data2) {
  for (let name2 of names) {
    result[name2].browsers = result[name2].browsers.concat(data2.browsers).sort(browsersSort);
  }
}
let prefixBorderRadius = requireBorderRadius();
f(
  prefixBorderRadius,
  (browsers2) => prefix(
    [
      "border-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius"
    ],
    {
      browsers: browsers2,
      feature: "border-radius",
      mistakes: ["-khtml-", "-ms-", "-o-"]
    }
  )
);
let prefixBoxshadow = requireCssBoxshadow();
f(
  prefixBoxshadow,
  (browsers2) => prefix(["box-shadow"], {
    browsers: browsers2,
    feature: "css-boxshadow",
    mistakes: ["-khtml-"]
  })
);
let prefixAnimation = requireCssAnimation();
f(
  prefixAnimation,
  (browsers2) => prefix(
    [
      "animation",
      "animation-name",
      "animation-duration",
      "animation-delay",
      "animation-direction",
      "animation-fill-mode",
      "animation-iteration-count",
      "animation-play-state",
      "animation-timing-function",
      "@keyframes"
    ],
    {
      browsers: browsers2,
      feature: "css-animation",
      mistakes: ["-khtml-", "-ms-"]
    }
  )
);
let prefixTransition = requireCssTransitions();
f(
  prefixTransition,
  (browsers2) => prefix(
    [
      "transition",
      "transition-property",
      "transition-duration",
      "transition-delay",
      "transition-timing-function"
    ],
    {
      browsers: browsers2,
      feature: "css-transitions",
      mistakes: ["-khtml-", "-ms-"]
    }
  )
);
let prefixTransform2d = requireTransforms2d();
f(
  prefixTransform2d,
  (browsers2) => prefix(["transform", "transform-origin"], {
    browsers: browsers2,
    feature: "transforms2d"
  })
);
let prefixTransforms3d = requireTransforms3d();
f(prefixTransforms3d, (browsers2) => {
  prefix(["perspective", "perspective-origin"], {
    browsers: browsers2,
    feature: "transforms3d"
  });
  return prefix(["transform-style"], {
    browsers: browsers2,
    feature: "transforms3d",
    mistakes: ["-ms-", "-o-"]
  });
});
f(
  prefixTransforms3d,
  { match: /y\sx|y\s#2/ },
  (browsers2) => prefix(["backface-visibility"], {
    browsers: browsers2,
    feature: "transforms3d",
    mistakes: ["-ms-", "-o-"]
  })
);
let prefixGradients = requireCssGradients();
f(
  prefixGradients,
  { match: /y\sx/ },
  (browsers2) => prefix(
    [
      "linear-gradient",
      "repeating-linear-gradient",
      "radial-gradient",
      "repeating-radial-gradient"
    ],
    {
      browsers: browsers2,
      feature: "css-gradients",
      mistakes: ["-ms-"],
      props: [
        "background",
        "background-image",
        "border-image",
        "mask",
        "list-style",
        "list-style-image",
        "content",
        "mask-image"
      ]
    }
  )
);
f(prefixGradients, { match: /a\sx/ }, (browsers2) => {
  browsers2 = browsers2.map((i) => {
    if (/firefox|op/.test(i)) {
      return i;
    } else {
      return `${i} old`;
    }
  });
  return add(
    [
      "linear-gradient",
      "repeating-linear-gradient",
      "radial-gradient",
      "repeating-radial-gradient"
    ],
    {
      browsers: browsers2,
      feature: "css-gradients"
    }
  );
});
let prefixBoxsizing = requireCss3Boxsizing();
f(
  prefixBoxsizing,
  (browsers2) => prefix(["box-sizing"], {
    browsers: browsers2,
    feature: "css3-boxsizing"
  })
);
let prefixFilters = requireCssFilters();
f(
  prefixFilters,
  (browsers2) => prefix(["filter"], {
    browsers: browsers2,
    feature: "css-filters"
  })
);
let prefixFilterFunction = requireCssFilterFunction();
f(
  prefixFilterFunction,
  (browsers2) => prefix(["filter-function"], {
    browsers: browsers2,
    feature: "css-filter-function",
    props: [
      "background",
      "background-image",
      "border-image",
      "mask",
      "list-style",
      "list-style-image",
      "content",
      "mask-image"
    ]
  })
);
let prefixBackdropFilter = requireCssBackdropFilter();
f(
  prefixBackdropFilter,
  { match: /y\sx|y\s#2/ },
  (browsers2) => prefix(["backdrop-filter"], {
    browsers: browsers2,
    feature: "css-backdrop-filter"
  })
);
let prefixElementFunction = requireCssElementFunction();
f(
  prefixElementFunction,
  (browsers2) => prefix(["element"], {
    browsers: browsers2,
    feature: "css-element-function",
    props: [
      "background",
      "background-image",
      "border-image",
      "mask",
      "list-style",
      "list-style-image",
      "content",
      "mask-image"
    ]
  })
);
let prefixMulticolumns = requireMulticolumn();
f(prefixMulticolumns, (browsers2) => {
  prefix(
    [
      "columns",
      "column-width",
      "column-gap",
      "column-rule",
      "column-rule-color",
      "column-rule-width",
      "column-count",
      "column-rule-style",
      "column-span",
      "column-fill"
    ],
    {
      browsers: browsers2,
      feature: "multicolumn"
    }
  );
  let noff = browsers2.filter((i) => !/firefox/.test(i));
  prefix(["break-before", "break-after", "break-inside"], {
    browsers: noff,
    feature: "multicolumn"
  });
});
let prefixUserSelect = requireUserSelectNone();
f(
  prefixUserSelect,
  (browsers2) => prefix(["user-select"], {
    browsers: browsers2,
    feature: "user-select-none",
    mistakes: ["-khtml-"]
  })
);
let prefixFlexbox = requireFlexbox();
f(prefixFlexbox, { match: /a\sx/ }, (browsers2) => {
  browsers2 = browsers2.map((i) => {
    if (/ie|firefox/.test(i)) {
      return i;
    } else {
      return `${i} 2009`;
    }
  });
  prefix(["display-flex", "inline-flex"], {
    browsers: browsers2,
    feature: "flexbox",
    props: ["display"]
  });
  prefix(["flex", "flex-grow", "flex-shrink", "flex-basis"], {
    browsers: browsers2,
    feature: "flexbox"
  });
  prefix(
    [
      "flex-direction",
      "flex-wrap",
      "flex-flow",
      "justify-content",
      "order",
      "align-items",
      "align-self",
      "align-content"
    ],
    {
      browsers: browsers2,
      feature: "flexbox"
    }
  );
});
f(prefixFlexbox, { match: /y\sx/ }, (browsers2) => {
  add(["display-flex", "inline-flex"], {
    browsers: browsers2,
    feature: "flexbox"
  });
  add(["flex", "flex-grow", "flex-shrink", "flex-basis"], {
    browsers: browsers2,
    feature: "flexbox"
  });
  add(
    [
      "flex-direction",
      "flex-wrap",
      "flex-flow",
      "justify-content",
      "order",
      "align-items",
      "align-self",
      "align-content"
    ],
    {
      browsers: browsers2,
      feature: "flexbox"
    }
  );
});
let prefixCalc = requireCalc();
f(
  prefixCalc,
  (browsers2) => prefix(["calc"], {
    browsers: browsers2,
    feature: "calc",
    props: ["*"]
  })
);
let prefixBackgroundOptions = requireBackgroundImgOpts();
f(
  prefixBackgroundOptions,
  (browsers2) => prefix(["background-origin", "background-size"], {
    browsers: browsers2,
    feature: "background-img-opts"
  })
);
let prefixBackgroundClipText = requireBackgroundClipText();
f(
  prefixBackgroundClipText,
  (browsers2) => prefix(["background-clip"], {
    browsers: browsers2,
    feature: "background-clip-text"
  })
);
let prefixFontFeature = requireFontFeature();
f(
  prefixFontFeature,
  (browsers2) => prefix(
    [
      "font-feature-settings",
      "font-variant-ligatures",
      "font-language-override"
    ],
    {
      browsers: browsers2,
      feature: "font-feature"
    }
  )
);
let prefixFontKerning = requireFontKerning();
f(
  prefixFontKerning,
  (browsers2) => prefix(["font-kerning"], {
    browsers: browsers2,
    feature: "font-kerning"
  })
);
let prefixBorderImage = requireBorderImage();
f(
  prefixBorderImage,
  (browsers2) => prefix(["border-image"], {
    browsers: browsers2,
    feature: "border-image"
  })
);
let prefixSelection = requireCssSelection();
f(
  prefixSelection,
  (browsers2) => prefix(["::selection"], {
    browsers: browsers2,
    feature: "css-selection",
    selector: true
  })
);
let prefixPlaceholder = requireCssPlaceholder();
f(prefixPlaceholder, (browsers2) => {
  prefix(["::placeholder"], {
    browsers: browsers2.concat(["ie 10 old", "ie 11 old", "firefox 18 old"]),
    feature: "css-placeholder",
    selector: true
  });
});
let prefixPlaceholderShown = requireCssPlaceholderShown();
f(prefixPlaceholderShown, (browsers2) => {
  prefix([":placeholder-shown"], {
    browsers: browsers2,
    feature: "css-placeholder-shown",
    selector: true
  });
});
let prefixHyphens = requireCssHyphens();
f(
  prefixHyphens,
  (browsers2) => prefix(["hyphens"], {
    browsers: browsers2,
    feature: "css-hyphens"
  })
);
let prefixFullscreen = requireFullscreen();
f(
  prefixFullscreen,
  (browsers2) => prefix([":fullscreen"], {
    browsers: browsers2,
    feature: "fullscreen",
    selector: true
  })
);
let prefixBackdrop = requireMdnCssBackdropPseudoElement();
f(
  prefixBackdrop,
  (browsers2) => prefix(["::backdrop"], {
    browsers: browsers2,
    feature: "backdrop",
    selector: true
  })
);
let prefixFileSelectorButton = requireCssFileSelectorButton();
f(
  prefixFileSelectorButton,
  (browsers2) => prefix(["::file-selector-button"], {
    browsers: browsers2,
    feature: "file-selector-button",
    selector: true
  })
);
let prefixAutofill = requireCssAutofill();
f(
  prefixAutofill,
  (browsers2) => prefix([":autofill"], {
    browsers: browsers2,
    feature: "css-autofill",
    selector: true
  })
);
let prefixTabsize = requireCss3Tabsize();
f(
  prefixTabsize,
  (browsers2) => prefix(["tab-size"], {
    browsers: browsers2,
    feature: "css3-tabsize"
  })
);
let prefixIntrinsic = requireIntrinsicWidth();
let sizeProps = [
  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",
  "inline-size",
  "min-inline-size",
  "max-inline-size",
  "block-size",
  "min-block-size",
  "max-block-size",
  "grid",
  "grid-template",
  "grid-template-rows",
  "grid-template-columns",
  "grid-auto-columns",
  "grid-auto-rows"
];
f(
  prefixIntrinsic,
  (browsers2) => prefix(["max-content", "min-content"], {
    browsers: browsers2,
    feature: "intrinsic-width",
    props: sizeProps
  })
);
f(
  prefixIntrinsic,
  { match: /x|\s#4/ },
  (browsers2) => prefix(["fill", "fill-available"], {
    browsers: browsers2,
    feature: "intrinsic-width",
    props: sizeProps
  })
);
f(
  prefixIntrinsic,
  { match: /x|\s#5/ },
  (browsers2) => prefix(["fit-content"], {
    browsers: browsers2,
    feature: "intrinsic-width",
    props: sizeProps
  })
);
let prefixStretch = requireCssWidthStretch();
f(
  prefixStretch,
  (browsers2) => prefix(["stretch"], {
    browsers: browsers2,
    feature: "css-width-stretch",
    props: sizeProps
  })
);
let prefixCursorsNewer = requireCss3CursorsNewer();
f(
  prefixCursorsNewer,
  (browsers2) => prefix(["zoom-in", "zoom-out"], {
    browsers: browsers2,
    feature: "css3-cursors-newer",
    props: ["cursor"]
  })
);
let prefixCursorsGrab = requireCss3CursorsGrab();
f(
  prefixCursorsGrab,
  (browsers2) => prefix(["grab", "grabbing"], {
    browsers: browsers2,
    feature: "css3-cursors-grab",
    props: ["cursor"]
  })
);
let prefixSticky = requireCssSticky();
f(
  prefixSticky,
  (browsers2) => prefix(["sticky"], {
    browsers: browsers2,
    feature: "css-sticky",
    props: ["position"]
  })
);
let prefixPointer = requirePointer();
f(
  prefixPointer,
  (browsers2) => prefix(["touch-action"], {
    browsers: browsers2,
    feature: "pointer"
  })
);
let prefixDecoration = requireTextDecoration();
f(
  prefixDecoration,
  { match: /x.*#[235]/ },
  (browsers2) => prefix(["text-decoration-skip", "text-decoration-skip-ink"], {
    browsers: browsers2,
    feature: "text-decoration"
  })
);
let prefixDecorationShorthand = requireMdnTextDecorationShorthand();
f(
  prefixDecorationShorthand,
  (browsers2) => prefix(["text-decoration"], {
    browsers: browsers2,
    feature: "text-decoration"
  })
);
let prefixDecorationColor = requireMdnTextDecorationColor();
f(
  prefixDecorationColor,
  (browsers2) => prefix(["text-decoration-color"], {
    browsers: browsers2,
    feature: "text-decoration"
  })
);
let prefixDecorationLine = requireMdnTextDecorationLine();
f(
  prefixDecorationLine,
  (browsers2) => prefix(["text-decoration-line"], {
    browsers: browsers2,
    feature: "text-decoration"
  })
);
let prefixDecorationStyle = requireMdnTextDecorationStyle();
f(
  prefixDecorationStyle,
  (browsers2) => prefix(["text-decoration-style"], {
    browsers: browsers2,
    feature: "text-decoration"
  })
);
let prefixTextSizeAdjust = requireTextSizeAdjust();
f(
  prefixTextSizeAdjust,
  (browsers2) => prefix(["text-size-adjust"], {
    browsers: browsers2,
    feature: "text-size-adjust"
  })
);
let prefixCssMasks = requireCssMasks();
f(prefixCssMasks, (browsers2) => {
  prefix(
    [
      "mask-clip",
      "mask-composite",
      "mask-image",
      "mask-origin",
      "mask-repeat",
      "mask-border-repeat",
      "mask-border-source"
    ],
    {
      browsers: browsers2,
      feature: "css-masks"
    }
  );
  prefix(
    [
      "mask",
      "mask-position",
      "mask-size",
      "mask-border",
      "mask-border-outset",
      "mask-border-width",
      "mask-border-slice"
    ],
    {
      browsers: browsers2,
      feature: "css-masks"
    }
  );
});
let prefixClipPath = requireCssClipPath();
f(
  prefixClipPath,
  (browsers2) => prefix(["clip-path"], {
    browsers: browsers2,
    feature: "css-clip-path"
  })
);
let prefixBoxdecoration = requireCssBoxdecorationbreak();
f(
  prefixBoxdecoration,
  (browsers2) => prefix(["box-decoration-break"], {
    browsers: browsers2,
    feature: "css-boxdecorationbreak"
  })
);
let prefixObjectFit = requireObjectFit();
f(
  prefixObjectFit,
  (browsers2) => prefix(["object-fit", "object-position"], {
    browsers: browsers2,
    feature: "object-fit"
  })
);
let prefixShapes = requireCssShapes();
f(
  prefixShapes,
  (browsers2) => prefix(["shape-margin", "shape-outside", "shape-image-threshold"], {
    browsers: browsers2,
    feature: "css-shapes"
  })
);
let prefixTextOverflow = requireTextOverflow();
f(
  prefixTextOverflow,
  (browsers2) => prefix(["text-overflow"], {
    browsers: browsers2,
    feature: "text-overflow"
  })
);
let prefixDeviceadaptation = requireCssDeviceadaptation();
f(
  prefixDeviceadaptation,
  (browsers2) => prefix(["@viewport"], {
    browsers: browsers2,
    feature: "css-deviceadaptation"
  })
);
let prefixResolut = requireCssMediaResolution();
f(
  prefixResolut,
  { match: /( x($| )|a #2)/ },
  (browsers2) => prefix(["@resolution"], {
    browsers: browsers2,
    feature: "css-media-resolution"
  })
);
let prefixTextAlignLast = requireCssTextAlignLast();
f(
  prefixTextAlignLast,
  (browsers2) => prefix(["text-align-last"], {
    browsers: browsers2,
    feature: "css-text-align-last"
  })
);
let prefixCrispedges = requireCssCrispEdges();
f(
  prefixCrispedges,
  { match: /y x|a x #1/ },
  (browsers2) => prefix(["pixelated"], {
    browsers: browsers2,
    feature: "css-crisp-edges",
    props: ["image-rendering"]
  })
);
f(
  prefixCrispedges,
  { match: /a x #2/ },
  (browsers2) => prefix(["image-rendering"], {
    browsers: browsers2,
    feature: "css-crisp-edges"
  })
);
let prefixLogicalProps = requireCssLogicalProps();
f(
  prefixLogicalProps,
  (browsers2) => prefix(
    [
      "border-inline-start",
      "border-inline-end",
      "margin-inline-start",
      "margin-inline-end",
      "padding-inline-start",
      "padding-inline-end"
    ],
    {
      browsers: browsers2,
      feature: "css-logical-props"
    }
  )
);
f(
  prefixLogicalProps,
  { match: /x\s#2/ },
  (browsers2) => prefix(
    [
      "border-block-start",
      "border-block-end",
      "margin-block-start",
      "margin-block-end",
      "padding-block-start",
      "padding-block-end"
    ],
    {
      browsers: browsers2,
      feature: "css-logical-props"
    }
  )
);
let prefixAppearance = requireCssAppearance();
f(
  prefixAppearance,
  { match: /#2|x/ },
  (browsers2) => prefix(["appearance"], {
    browsers: browsers2,
    feature: "css-appearance"
  })
);
let prefixSnappoints = requireCssSnappoints();
f(
  prefixSnappoints,
  (browsers2) => prefix(
    [
      "scroll-snap-type",
      "scroll-snap-coordinate",
      "scroll-snap-destination",
      "scroll-snap-points-x",
      "scroll-snap-points-y"
    ],
    {
      browsers: browsers2,
      feature: "css-snappoints"
    }
  )
);
let prefixRegions = requireCssRegions();
f(
  prefixRegions,
  (browsers2) => prefix(["flow-into", "flow-from", "region-fragment"], {
    browsers: browsers2,
    feature: "css-regions"
  })
);
let prefixImageSet = requireCssImageSet();
f(
  prefixImageSet,
  (browsers2) => prefix(["image-set"], {
    browsers: browsers2,
    feature: "css-image-set",
    props: [
      "background",
      "background-image",
      "border-image",
      "cursor",
      "mask",
      "mask-image",
      "list-style",
      "list-style-image",
      "content"
    ]
  })
);
let prefixWritingMode = requireCssWritingMode();
f(
  prefixWritingMode,
  { match: /a|x/ },
  (browsers2) => prefix(["writing-mode"], {
    browsers: browsers2,
    feature: "css-writing-mode"
  })
);
let prefixCrossFade = requireCssCrossFade();
f(
  prefixCrossFade,
  (browsers2) => prefix(["cross-fade"], {
    browsers: browsers2,
    feature: "css-cross-fade",
    props: [
      "background",
      "background-image",
      "border-image",
      "mask",
      "list-style",
      "list-style-image",
      "content",
      "mask-image"
    ]
  })
);
let prefixReadOnly = requireCssReadOnlyWrite();
f(
  prefixReadOnly,
  (browsers2) => prefix([":read-only", ":read-write"], {
    browsers: browsers2,
    feature: "css-read-only-write",
    selector: true
  })
);
let prefixTextEmphasis = requireTextEmphasis();
f(
  prefixTextEmphasis,
  (browsers2) => prefix(
    [
      "text-emphasis",
      "text-emphasis-position",
      "text-emphasis-style",
      "text-emphasis-color"
    ],
    {
      browsers: browsers2,
      feature: "text-emphasis"
    }
  )
);
let prefixGrid = requireCssGrid();
f(prefixGrid, (browsers2) => {
  prefix(["display-grid", "inline-grid"], {
    browsers: browsers2,
    feature: "css-grid",
    props: ["display"]
  });
  prefix(
    [
      "grid-template-columns",
      "grid-template-rows",
      "grid-row-start",
      "grid-column-start",
      "grid-row-end",
      "grid-column-end",
      "grid-row",
      "grid-column",
      "grid-area",
      "grid-template",
      "grid-template-areas",
      "place-self"
    ],
    {
      browsers: browsers2,
      feature: "css-grid"
    }
  );
});
f(
  prefixGrid,
  { match: /a x/ },
  (browsers2) => prefix(["grid-column-align", "grid-row-align"], {
    browsers: browsers2,
    feature: "css-grid"
  })
);
let prefixTextSpacing = requireCssTextSpacing();
f(
  prefixTextSpacing,
  (browsers2) => prefix(["text-spacing"], {
    browsers: browsers2,
    feature: "css-text-spacing"
  })
);
let prefixAnyLink = requireCssAnyLink();
f(
  prefixAnyLink,
  (browsers2) => prefix([":any-link"], {
    browsers: browsers2,
    feature: "css-any-link",
    selector: true
  })
);
let bidiIsolate = requireMdnCssUnicodeBidiIsolate();
f(
  bidiIsolate,
  (browsers2) => prefix(["isolate"], {
    browsers: browsers2,
    feature: "css-unicode-bidi",
    props: ["unicode-bidi"]
  })
);
let bidiPlaintext = requireMdnCssUnicodeBidiPlaintext();
f(
  bidiPlaintext,
  (browsers2) => prefix(["plaintext"], {
    browsers: browsers2,
    feature: "css-unicode-bidi",
    props: ["unicode-bidi"]
  })
);
let bidiOverride = requireMdnCssUnicodeBidiIsolateOverride();
f(
  bidiOverride,
  { match: /y x/ },
  (browsers2) => prefix(["isolate-override"], {
    browsers: browsers2,
    feature: "css-unicode-bidi",
    props: ["unicode-bidi"]
  })
);
let prefixOverscroll = requireCssOverscrollBehavior();
f(
  prefixOverscroll,
  { match: /a #1/ },
  (browsers2) => prefix(["overscroll-behavior"], {
    browsers: browsers2,
    feature: "css-overscroll-behavior"
  })
);
let prefixTextOrientation = requireCssTextOrientation();
f(
  prefixTextOrientation,
  (browsers2) => prefix(["text-orientation"], {
    browsers: browsers2,
    feature: "css-text-orientation"
  })
);
let prefixPrintAdjust = requireCssPrintColorAdjust();
f(
  prefixPrintAdjust,
  (browsers2) => prefix(["print-color-adjust", "color-adjust"], {
    browsers: browsers2,
    feature: "css-print-color-adjust"
  })
);
let browserslist = browserslist_1;
browserslist.defaults;
class TtbActor extends Actor {
  constructor(data2, context) {
    super(data2, context);
  }
  /** @override */
  prepareData() {
    super.prepareData();
  }
  /** @override */
  prepareBaseData() {
  }
  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    actorData.system;
    actorData.flags.boilerplate || {};
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }
  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== "character")
      return;
    const systemData = actorData.system;
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      ability.mod = Math.floor((ability.value - 10) / 2);
    }
  }
  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== "npc")
      return;
    const systemData = actorData.system;
    systemData.xp = systemData.cr * systemData.cr * 100;
  }
  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data2 = super.getRollData();
    this._getCharacterRollData(data2);
    this._getNpcRollData(data2);
    data2.testField = "hello from getRollData()";
    this.items;
    return data2;
  }
  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data2) {
    if (this.type !== "character")
      return;
    if (data2.abilities) {
      for (let [k, v] of Object.entries(data2.abilities)) {
        data2[k] = foundry.utils.deepClone(v);
      }
    }
    if (data2.attributes.level) {
      data2.lvl = data2.attributes.level.value ?? 0;
    }
  }
  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data2) {
    if (this.type !== "npc")
      return;
  }
  _onUpdate(data2, options, userId) {
    return super._onUpdate(data2, options, userId);
  }
  _initializeSource(data2, options = {}) {
    data2 = super._initializeSource(data2, options);
    data2.system.cards.deck.name = "Twist Deck";
    return data2;
  }
}
const TTB2E = {};
class FatedData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      wounds: new fields.SchemaField({
        max: this._intField(5),
        value: this._intField(5)
      }),
      aspects: new fields.SchemaField(
        this.aspects.reduce((obj, aspect) => ({ ...obj, [aspect]: this._intField(0) }), {})
      ),
      derived: new fields.SchemaField({
        defense: this._intField(2),
        willpower: this._intField(2),
        initiative: this._intField(0),
        walk: this._intField(4),
        charge: this._intField(4),
        height: this._intField(2)
      }),
      xp: this._intField(0),
      characteristics: new fields.ArrayField(new fields.StringField({
        required: true,
        nullable: false
      }), {
        required: true,
        nullable: false,
        initial: ["Living", "Fated"]
      }),
      cards: new fields.SchemaField({
        deck: new fields.EmbeddedDocumentField(foundry.documents.BaseCards)
      })
    };
  }
  static _intField(initial, options = {}) {
    return new foundry.data.fields.NumberField({
      required: true,
      nullable: false,
      initial,
      integer: true,
      ...options
    });
  }
}
__publicField(FatedData, "aspects", [
  "might",
  "grace",
  "speed",
  "resilience",
  "intellect",
  "charm",
  "cunning",
  "tenacity"
]);
Hooks.once("init", async () => {
  game[SYSTEM_ID] = TTB2E;
  CONFIG.Actor.documentClass = TtbActor;
  CONFIG.Actor.dataModels.fated = FatedData;
  CONFIG.Actor.trackableAttributes = {
    fated: {
      bar: ["wounds"],
      value: []
    }
  };
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("TtbActorSheet", TtbActorSheetSvelte, { makeDefault: true });
  await preloadTemplates();
});
async function preloadTemplates() {
  const templatePaths = [`systems/${SYSTEM_ID}/templates/svelte_form.hbs`];
  return loadTemplates(templatePaths);
}
//# sourceMappingURL=ttb2e.js.map
