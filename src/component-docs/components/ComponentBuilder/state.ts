/**
 * ComponentBuilder State Management
 *
 * Provides a singleton {@link BuilderState} that holds the component tree,
 * selection state, drag state, and server-provided configuration. All
 * mutations are performed through methods that emit typed events so the
 * rest of the UI can react.
 *
 * @module state
 */

import { debugLog, DEFAULT_EXPOSED_PROPS, ROOT_COMPONENT_PATH } from "./constants";
import {
  addComponentToSlotOperation,
  deleteComponentOperation,
  moveComponentOperation,
} from "./state/componentOperations";
import { toggleSlotModeOperation, updateNodePropertyOperation } from "./state/propertyOperations";
import {
  findComponentNodeInTree,
  findNodeLocationInTree,
  isNodeAncestorOfInTree,
  removeNodeFromTree as removeNodeFromTreeOperation,
} from "./state/treeOperations";
import type {
  BuilderData,
  ComponentInfo,
  ComponentMetadata,
  ComponentNode,
  DragSource,
  NodeLocation,
} from "./types";
import { slotHasSameComponentInEveryItem } from "./utils/shared";
import { validateComponentTree, type ValidationResult } from "./utils/validation";

/** Builder state singleton */
class BuilderState {
  private static STORAGE_KEY = "componentBuilder_state";
  private static MAX_HISTORY = 50;

  private _componentTree: ComponentNode[] = [];
  private _selectedComponentId: string | null = null;
  private _componentIdCounter = 0;
  private _dragSource: DragSource | null = null;

  // Data from server
  private _components: ComponentInfo[] = [];
  private _metadataMap: Record<string, ComponentMetadata> = {};
  private _nestedBlockProperties: string[] = [];
  private _pageSectionCategories: string[] = [];

  // Validation
  private _validationResult: ValidationResult = { isValid: true, duplicateProps: [] };

  // When true, the next treeChange handler should skip rebuilding the sidebar.
  // Set by updateNodeProperty so prop-editor inputs don't lose focus.
  private _propEditInProgress = false;

  // Event listeners
  private _listeners: Map<string, Set<() => void>> = new Map();

  // Undo/redo
  private _history: string[] = [];
  private _redoStack: string[] = [];
  private _lastTreeSnapshot = "[]";
  private _isUndoRedoOp = false;

  /** Initialize state from builder data */
  initialize(data: BuilderData): void {
    this._components = data.components;
    this._metadataMap = data.metadataMap;
    this._nestedBlockProperties = data.nestedBlockProperties;
    this._pageSectionCategories = data.pageSectionCategories;

    debugLog("State initialized with:", {
      componentsCount: this._components.length,
      categories: Object.keys(data.componentsByCategory),
    });

    try {
      const restored = this.loadFromLocalStorage();

      if (!restored) {
        this.initializeRootComponent();
      }

      this._lastTreeSnapshot = JSON.stringify(this._componentTree);
      this.runValidation();
    } catch (error) {
      // Recover from stale/invalid persisted state after upgrades.
      console.warn("[ComponentBuilder] Failed to initialize from saved state. Resetting.", error);
      this.resetState();
      this.clearPersistedState();
      this.initializeRootComponent();
      this._lastTreeSnapshot = JSON.stringify(this._componentTree);
      this.runValidation();
    }
  }

  /** Initialize the default root component (custom-section) */
  private initializeRootComponent(): void {
    const customSectionInfo = this._components.find((c) => c.path === ROOT_COMPONENT_PATH);
    const fallbackRoot = this._components.find((c) => c.category === "page-builders");
    const rootInfo = customSectionInfo || fallbackRoot;

    if (!rootInfo) {
      throw new Error(
        `[ComponentBuilder] Root component not found: ${ROOT_COMPONENT_PATH}. ` +
          `Available components: ${this._components.map((c) => c.path).join(", ")}`
      );
    }

    const customSection = this.createComponentNode(rootInfo);

    customSection._isRootComponent = true;
    this._componentTree.push(customSection);
    this.emit("treeChange");
  }

  /** Clear in-memory state so builder can recover cleanly. */
  private resetState(): void {
    this._componentTree = [];
    this._selectedComponentId = null;
    this._componentIdCounter = 0;
    this._dragSource = null;
    this._history = [];
    this._redoStack = [];
    this._lastTreeSnapshot = "[]";
  }

  /** Reset everything back to the initial state (empty tree with root component). */
  reset(): void {
    this.resetState();
    this.clearPersistedState();
    this.initializeRootComponent();
    this._lastTreeSnapshot = JSON.stringify(this._componentTree);
    this.runValidation();
    this.emit("selectionChange");
    this.saveToLocalStorage();
  }

  /** Best-effort clear of persisted builder state. */
  private clearPersistedState(): void {
    try {
      localStorage.removeItem(BuilderState.STORAGE_KEY);
    } catch {
      // Storage may be unavailable in private mode.
    }
  }

  /** Create a new component node with default props */
  createComponentNode(componentInfo: ComponentInfo): ComponentNode {
    const _nodeId = `component-${this._componentIdCounter++}`;
    const node: ComponentNode = {
      _nodeId,
      _component: componentInfo.path,
      ...this.getDefaultProps(componentInfo),
    };

    // Initialize slots if the component has them
    if (componentInfo.slots && componentInfo.slots.length > 0) {
      for (const slot of componentInfo.slots) {
        node[slot.propName] = [];
      }
    }

    // Initialize _hardcoded_ flags for all input props based on DEFAULT_EXPOSED_PROPS
    if (componentInfo.inputs) {
      const componentName = componentInfo.name;
      const exposedProps = DEFAULT_EXPOSED_PROPS[componentName] || [];

      Object.keys(componentInfo.inputs).forEach((propName) => {
        // Set to exposed (false) if in the auto-expose list, otherwise hardcoded (true)
        node[`_hardcoded_${propName}`] = !exposedProps.includes(propName);
      });
    }

    return node;
  }

  /** Get default props from structure value */
  private getDefaultProps(componentInfo: ComponentInfo): Record<string, unknown> {
    const props: Record<string, unknown> = {};

    if (componentInfo.structureValue?.value) {
      Object.entries(componentInfo.structureValue.value).forEach(([key, value]) => {
        if (key !== "_component" && !Array.isArray(value)) {
          props[key] = value;
        }
      });
    }

    return props;
  }

  // Getters
  get componentTree(): ComponentNode[] {
    return this._componentTree;
  }

  get selectedComponentId(): string | null {
    return this._selectedComponentId;
  }

  get dragSource(): DragSource | null {
    return this._dragSource;
  }

  get components(): ComponentInfo[] {
    return this._components;
  }

  get metadataMap(): Record<string, ComponentMetadata> {
    return this._metadataMap;
  }

  get nestedBlockProperties(): string[] {
    return this._nestedBlockProperties;
  }

  get pageSectionCategories(): string[] {
    return this._pageSectionCategories;
  }

  get validationResult(): ValidationResult {
    return this._validationResult;
  }

  /** Run validation on the component tree */
  private runValidation(): void {
    this._validationResult = validateComponentTree(
      this._componentTree,
      (componentPath: string) => {
        const info = this.getComponentInfo(componentPath);

        return info?.displayName || componentPath;
      },
      this._metadataMap
    );
    this.emit("validationChange");
  }

  // Setters
  set selectedComponentId(id: string | null) {
    this._selectedComponentId = id;
    this.emit("selectionChange");
  }

  set dragSource(source: DragSource | null) {
    this._dragSource = source;
  }

  /** Get component metadata by path */
  getMetadata(path: string): ComponentMetadata | undefined {
    return this._metadataMap[path];
  }

  /** Get component info by path */
  getComponentInfo(path: string): ComponentInfo | undefined {
    return this._components.find((c) => c.path === path);
  }

  /** Find a component node by ID in the tree */
  findComponentNode(id: string, tree: ComponentNode[] = this._componentTree): ComponentNode | null {
    return findComponentNodeInTree(
      id,
      tree,
      (path) => this.getComponentInfo(path),
      this._metadataMap
    );
  }

  /** Check if a node is an ancestor of or the same as another node */
  isNodeAncestorOf(ancestorId: string, descendantId: string): boolean {
    return isNodeAncestorOfInTree(
      ancestorId,
      descendantId,
      this._componentTree,
      (path) => this.getComponentInfo(path),
      this._metadataMap
    );
  }

  /** Find node location in tree */
  findNodeLocation(
    nodeId: string,
    tree: ComponentNode[] = this._componentTree,
    parentId: string | null = null,
    slotName: string | null = null
  ): NodeLocation | null {
    return findNodeLocationInTree(
      nodeId,
      tree,
      (path) => this.getComponentInfo(path),
      this._metadataMap,
      parentId,
      slotName
    );
  }

  /** Remove a node from the tree and return it */
  removeNodeFromTree(
    nodeId: string,
    tree: ComponentNode[] = this._componentTree
  ): ComponentNode | null {
    return removeNodeFromTreeOperation(
      nodeId,
      tree,
      (path) => this.getComponentInfo(path),
      this._metadataMap
    );
  }

  /** Add a component to a slot */
  addComponentToSlot(
    componentInfo: ComponentInfo,
    parentId: string,
    slotName: string,
    index: number
  ): ComponentNode {
    const existingNames = this.collectExposedPropNames();

    const nodeToAdd = addComponentToSlotOperation(
      componentInfo,
      parentId,
      slotName,
      index,
      (id, tree) => this.findComponentNode(id, tree),
      (path) => this.getComponentInfo(path),
      (info) => this.createComponentNode(info)
    );

    this.autoRenameConflictingProps(nodeToAdd, existingNames);
    this.emit("treeChange");

    return nodeToAdd;
  }

  /** Delete a component from the tree */
  deleteComponent(id: string): void {
    const result = deleteComponentOperation(id, this._selectedComponentId, (nodeId, tree) =>
      this.removeNodeFromTree(nodeId, tree)
    );

    if (result.shouldClearSelection) {
      this._selectedComponentId = null;
      this.emit("selectionChange");
    }
    if (result.removed) {
      this.emit("treeChange");
    }
  }

  /** Move a component to a new location (reorder) */
  moveComponent(
    nodeId: string,
    targetParentId: string | null,
    targetSlot: string | null,
    targetIndex: number
  ): void {
    const moved = moveComponentOperation(
      nodeId,
      targetParentId,
      targetSlot,
      targetIndex,
      this._componentTree,
      (id, tree, parentId, slotName) => this.findNodeLocation(id, tree, parentId, slotName),
      (id, tree) => this.removeNodeFromTree(id, tree),
      (id, tree) => this.findComponentNode(id, tree)
    );

    if (moved) {
      this.emit("treeChange");
    }
  }

  /** Toggle slot mode between 'components' and 'prop' */
  toggleSlotMode(nodeId: string, slotPropName: string): void {
    const changed = toggleSlotModeOperation(nodeId, slotPropName, (id, tree) =>
      this.findComponentNode(id, tree)
    );

    if (changed) this.emit("treeChange");
  }

  /** True when a prop-editor input triggered the current treeChange (sidebar should not re-render). */
  get propEditInProgress(): boolean {
    return this._propEditInProgress;
  }

  /** Update a property value on a node */
  updateNodeProperty(nodeId: string, propName: string, value: unknown): void {
    const changed = updateNodePropertyOperation(nodeId, propName, value, (id, tree) =>
      this.findComponentNode(id, tree)
    );

    if (changed) {
      const isContentProp = !propName.startsWith("_");

      this._propEditInProgress = isContentProp;
      this.emit("treeChange");
      this._propEditInProgress = false;
    }
  }

  /** Update a metadata-only property (e.g. _renamed_) without triggering a full re-render.
   *  Only runs validation and emits validationChange. */
  updateNodeMetaProperty(nodeId: string, propName: string, value: unknown): void {
    const changed = updateNodePropertyOperation(nodeId, propName, value, (id, tree) =>
      this.findComponentNode(id, tree)
    );

    if (changed) {
      this.runValidation();
    }
  }

  // Event system
  on(event: string, callback: () => void): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this._listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string): void {
    if (event === "treeChange" && !this._isUndoRedoOp) {
      this._redoStack = [];
      this._history.push(this._lastTreeSnapshot);

      if (this._history.length > BuilderState.MAX_HISTORY) {
        this._history.shift();
      }
    }

    this._listeners.get(event)?.forEach((callback) => callback());

    if (event === "treeChange") {
      this.forceExposeUniformSlots(this._componentTree);
      this.runValidation();
      this._lastTreeSnapshot = JSON.stringify(this._componentTree);
    }
  }

  /** Undo the last change */
  undo(): boolean {
    if (this._history.length === 0) return false;

    const snapshot = this._history.pop()!;

    this._redoStack.push(JSON.stringify(this._componentTree));
    this._isUndoRedoOp = true;
    this._componentTree = JSON.parse(snapshot);
    this._lastTreeSnapshot = snapshot;
    this._selectedComponentId = null;
    this.emit("treeChange");
    this.emit("selectionChange");
    this._isUndoRedoOp = false;

    return true;
  }

  /** Redo a previously undone change */
  redo(): boolean {
    if (this._redoStack.length === 0) return false;

    const snapshot = this._redoStack.pop()!;

    this._history.push(JSON.stringify(this._componentTree));
    this._isUndoRedoOp = true;
    this._componentTree = JSON.parse(snapshot);
    this._lastTreeSnapshot = snapshot;
    this._selectedComponentId = null;
    this.emit("treeChange");
    this.emit("selectionChange");
    this._isUndoRedoOp = false;

    return true;
  }

  get canUndo(): boolean {
    return this._history.length > 0;
  }

  get canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  /** Save the current tree to localStorage */
  saveToLocalStorage(): void {
    try {
      const data = {
        tree: this._componentTree,
        counter: this._componentIdCounter,
      };

      localStorage.setItem(BuilderState.STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Quota exceeded or storage unavailable
    }
  }

  /** Load a saved tree from localStorage. Returns true if restored successfully. */
  private loadFromLocalStorage(): boolean {
    try {
      const raw = localStorage.getItem(BuilderState.STORAGE_KEY);

      if (!raw) return false;

      const data = JSON.parse(raw);

      if (!data.tree || !Array.isArray(data.tree) || data.tree.length === 0) return false;

      const rootComponent = data.tree[0]?._component;

      if (!rootComponent || !this._components.find((c) => c.path === rootComponent)) {
        return false;
      }

      this._componentTree = data.tree;
      this._componentIdCounter = Math.max(data.counter || 0, this._componentIdCounter);

      this.migrateNodeIds(this._componentTree);

      debugLog("Restored state from localStorage");

      return true;
    } catch {
      return false;
    }
  }

  /** Migrate old `id` property to `_nodeId` on persisted/template trees */
  private migrateNodeIds(tree: ComponentNode[]): void {
    for (const node of tree) {
      if (!node._nodeId && (node as Record<string, unknown>).id) {
        node._nodeId = (node as Record<string, unknown>).id as string;
        delete (node as Record<string, unknown>).id;
      }

      for (const value of Object.values(node)) {
        if (Array.isArray(value) && value.length > 0 && value[0]?._component) {
          this.migrateNodeIds(value as ComponentNode[]);
        }
      }
    }
  }

  /**
   * Walk the component tree and collect every currently exposed prop name.
   * A prop is exposed when `_hardcoded_<name>` is falsy or when a slot is
   * in page-building mode (`_<name>_mode === "prop"`).
   */
  private collectExposedPropNames(
    tree: ComponentNode[] = this._componentTree,
    names: Set<string> = new Set()
  ): Set<string> {
    for (const node of tree) {
      for (const key of Object.keys(node)) {
        if (key.startsWith("_hardcoded_") && !node[key]) {
          const original = key.replace("_hardcoded_", "");

          names.add((node[`_renamed_${original}`] as string) || original);
        }

        if (key.endsWith("_mode") && node[key] === "prop") {
          const original = key.replace("_mode", "").substring(1);

          names.add((node[`_renamed_${original}`] as string) || original);
        }
      }

      for (const value of Object.values(node)) {
        if (Array.isArray(value) && value.length > 0 && value[0]?._component) {
          this.collectExposedPropNames(value as ComponentNode[], names);
        }
      }
    }

    return names;
  }

  /**
   * Rename any exposed props on `node` (and its nested children) whose name
   * already exists in `existingNames`, appending `_2`, `_3`, etc.
   */
  private autoRenameConflictingProps(node: ComponentNode, existingNames: Set<string>): void {
    for (const key of Object.keys(node)) {
      if (!key.startsWith("_hardcoded_") || node[key]) continue;

      const original = key.replace("_hardcoded_", "");
      const currentName = (node[`_renamed_${original}`] as string) || original;

      if (existingNames.has(currentName)) {
        let suffix = 2;
        let candidate = `${original}_${suffix}`;

        while (existingNames.has(candidate)) {
          suffix++;
          candidate = `${original}_${suffix}`;
        }
        node[`_renamed_${original}`] = candidate;
        existingNames.add(candidate);
      } else {
        existingNames.add(currentName);
      }
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value as ComponentNode[]) {
          if (child && typeof child === "object" && child._component) {
            this.autoRenameConflictingProps(child, existingNames);
          }
        }
      }
    }
  }

  /**
   * Force-expose a slot prop when the component has a `childComponent` metadata pattern
   * (e.g. Accordion → accordion-item) AND every item has the same component.
   * Also force-expose non-slot child component props (e.g. title on accordion-item).
   * General-purpose content slots (like Custom Section's contentSections) are not affected.
   */
  private forceExposeUniformSlots(tree: ComponentNode[]): void {
    for (const node of tree) {
      const componentInfo = this.getComponentInfo(node._component);
      const metadata = this._metadataMap[node._component];

      // Only force-expose on components that have a childComponent wrapper pattern
      if (componentInfo?.slots && metadata?.childComponent) {
        for (const slot of componentInfo.slots) {
          if (slotHasSameComponentInEveryItem(node, slot.propName)) {
            node[`_hardcoded_${slot.propName}`] = false;

            // Force-expose non-slot child component props (e.g. title) on each child node,
            // but respect DEFAULT_EXPOSED_PROPS when an entry exists for the child.
            const childProps = metadata.childComponent.props || [];
            const regularProps = childProps.filter((p) => !p.endsWith("/slot"));
            const children = node[slot.propName] as ComponentNode[] | undefined;

            if (regularProps.length > 0 && children) {
              for (const child of children) {
                if (child && typeof child === "object") {
                  const childInfo = this.getComponentInfo(child._component);
                  const allowedProps = childInfo
                    ? DEFAULT_EXPOSED_PROPS[childInfo.name]
                    : undefined;

                  for (const prop of regularProps) {
                    if (!allowedProps || allowedProps.includes(prop)) {
                      child[`_hardcoded_${prop}`] = false;
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Recurse into all slots
      const fallbackProp = metadata?.fallbackFor;
      const slotsToRecurse = componentInfo?.slots
        ? componentInfo.slots.map((s) => s.propName)
        : fallbackProp
          ? [fallbackProp]
          : [];

      for (const slotPropName of slotsToRecurse) {
        const children = node[slotPropName];

        if (Array.isArray(children)) {
          this.forceExposeUniformSlots(children as ComponentNode[]);
        }
      }
    }
  }
}

/** Singleton instance */
export const builderState = new BuilderState();
