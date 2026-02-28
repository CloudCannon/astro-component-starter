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

  // Event listeners
  private _listeners: Map<string, Set<() => void>> = new Map();

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

    // Initialize with root component
    this.initializeRootComponent();

    // Run initial validation
    this.runValidation();
  }

  /** Initialize the default root component (custom-section) */
  private initializeRootComponent(): void {
    const customSectionInfo = this._components.find((c) => c.path === ROOT_COMPONENT_PATH);

    if (!customSectionInfo) {
      throw new Error(
        `[ComponentBuilder] Root component not found: ${ROOT_COMPONENT_PATH}. ` +
          `Available components: ${this._components.map((c) => c.path).join(", ")}`
      );
    }

    const customSection = this.createComponentNode(customSectionInfo);

    customSection._isRootComponent = true;
    this._componentTree.push(customSection);
    this.emit("treeChange");
  }

  /** Create a new component node with default props */
  createComponentNode(componentInfo: ComponentInfo): ComponentNode {
    const id = `component-${this._componentIdCounter++}`;
    const node: ComponentNode = {
      id,
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
    const nodeToAdd = addComponentToSlotOperation(
      componentInfo,
      parentId,
      slotName,
      index,
      (id, tree) => this.findComponentNode(id, tree),
      (path) => this.getComponentInfo(path),
      (info) => this.createComponentNode(info)
    );

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

  /** Update a property value on a node */
  updateNodeProperty(nodeId: string, propName: string, value: unknown): void {
    const changed = updateNodePropertyOperation(nodeId, propName, value, (id, tree) =>
      this.findComponentNode(id, tree)
    );

    if (changed) {
      this.emit("treeChange");
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
    this._listeners.get(event)?.forEach((callback) => callback());

    // Run validation whenever tree changes
    if (event === "treeChange") {
      this.forceExposeUniformSlots(this._componentTree);
      this.runValidation();
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

            // Force-expose non-slot child component props (e.g. title) on each child node
            const childProps = metadata.childComponent.props || [];
            const regularProps = childProps.filter((p) => !p.endsWith("/slot"));
            const children = node[slot.propName] as ComponentNode[] | undefined;

            if (regularProps.length > 0 && children) {
              for (const child of children) {
                if (child && typeof child === "object") {
                  for (const prop of regularProps) {
                    child[`_hardcoded_${prop}`] = false;
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
