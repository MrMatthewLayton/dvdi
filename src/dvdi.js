export class VDom {
    constructor(type, props, childNodes) {
        this.type = type;
        this.props = props;
        this.parentVNode = null;
        this.childNodes = childNodes;
        this.domElement = null;
        this.isMounted = false;
        this.mountCallback = null;
        this.unmountCallback = null;
    }

    appendChild(vNode) {
        this.childNodes.push(vNode);
        if (typeof vNode === 'string') {
            return;
        }

        vNode.parentVNode = this;
    }

    removeChild(vNode) {
        const index = this.childNodes.indexOf(vNode);
        this.childNodes = this.childNodes.slice(0, index).concat(this.childNodes.slice(index + 1));
        if (typeof vNode === 'string') {
            return;
        }

        vNode.parentVNode = null;
    }

    replaceChild(newVNode, oldVNode) {
        const index = this.childNodes.indexOf(oldVNode);
        this.childNodes[index] = newVNode;
        if (typeof newVNode !== 'string') {
            newVNode.parentVNode = this;
        }

        if (typeof oldVNode !== 'string') {
            oldVNode.parentVNode = null;
        }
    }
}

export function mountVNode(vNode) {
    if (typeof vNode === 'string') {
        return;
    }

    if (vNode.mountCallback && !vNode.isMounted) {
        vNode.mountCallback();
        vNode.isMounted = true;
    }

    for (let i of vNode.childNodes) {
        mountVNode(i);
    }
}

export function unmountVNode(vNode) {
    if (typeof vNode === 'string') {
        return;
    }

    if (vNode.unmountCallback && vNode.isMounted) {
        vNode.unmountCallback();
        vNode.isMounted = false;
    }

    for (let i of vNode.childNodes) {
        unmountVNode(i);
    }
}

// Enhanced render function to attach events
function render(vNode) {
    if (typeof vNode === 'string') {
        const element = document.createTextNode(vNode);
        return element;
    }

    const { type, props, childNodes } = vNode;
    const element = document.createElement(type);
    vNode.domElement = element;

    for (const key in props) {
        if (key.startsWith('on')) {
            element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else {
            element[key] = props[key];
        }
    }

    const len = childNodes.length;
    for (let i = 0; i < len; i++) {
        const vn = childNodes[i];
        element.appendChild(render(vn));
    }

    return element;
}

// Enhanced unrender function to detach events
function unrender(vNode) {
    if (typeof vNode === 'string') {
        return;
    }

    const { type, props, childNodes, domElement } = vNode;
    const len = childNodes.length;
    for (let i = len - 1; i >= 0; i--) {
        const vn = childNodes[i];
        vNode.removeChild(vn);
        unrender(vn);
    }

    for (const key in props) {
        if (key.startsWith('on')) {
            domElement.removeEventListener(key.substring(2).toLowerCase(), props[key]);
        } else {
            domElement[key] = '';
        }
    }

    vNode.domElement = null;
}

function changed(vnode1, vnode2) {
    return typeof vnode1 !== typeof vnode2 ||
           (typeof vnode1 === 'string' && vnode1 !== vnode2) ||
           vnode1.type !== vnode2.type;
}

function updateProps(element, oldProps, newProps) {
    // Iterate over all the old properties and remove any that are not in the new properties.
    for (const prop in oldProps) {
        if (!(prop in newProps)) {
            if (prop.startsWith('on')) {
                element.removeEventListener(prop.substring(2).toLowerCase(), oldProps[prop]);
            } else {
                element[prop] = '';
            }
        }
    }

    // Iterate over all the new properties and add any that are not in the old properties.
    for (const prop in newProps) {
        if (!(prop in oldProps)) {
            if (prop.startsWith('on')) {
                element.addEventListener(prop.substring(2).toLowerCase(), newProps[prop]);
            } else {
                element[prop] = newProps[prop];
            }
        }
    }
}

export function updateElement(parent, parentVNode, oldVNode, newVNode, index) {
    if (!oldVNode && !newVNode) {
        console.log('WTAF?');
        debugger;
    }

    // Did we add a new node?
    if (!oldVNode && newVNode) {
        if (parentVNode) {
            parentVNode.appendChild(newVNode);
        }

        parent.appendChild(render(newVNode));
        mountVNode(newVNode);
        return;
    }

    // Did we remove an old node?
    if (oldVNode && !newVNode) {
        unmountVNode(oldVNode);
        unrender(oldVNode);
        if (parentVNode) {
            parentVNode.removeChild(oldVNode);
        }

        parent.removeChild(parent.childNodes[index]);
        return;
    }

    // Did our node change?
    if (changed(oldVNode, newVNode)) {
        unmountVNode(oldVNode);
        unrender(oldVNode);
        if (parentVNode) {
            parentVNode.replaceChild(newVNode, oldVNode);
        }

        parent.replaceChild(render(newVNode), parent.childNodes[index]);
        mountVNode(newVNode);
        return;
    }

    // If this is a string VNode we can't have anything else to do.
    if (typeof oldVNode === 'string') {
        return;
    }

    // Our new VDOM node is the same as our old VDOM node we need to scan the children
    // and update them.  To keep things sane, don't forget we need to record DOM element
    // in the new VDOM node.
    newVNode.domElement = oldVNode.domElement;
    updateProps(parent.childNodes[index], oldVNode.props, newVNode.props);

    // We iterate backwards to remove any nodes to keep the child lists correct.
    for (let i = oldVNode.childNodes.length - 1; i > (newVNode.childNodes.length - 1); i--) {
        updateElement(parent.childNodes[index], oldVNode, oldVNode.childNodes[i], null, i);
    }

    // We iterate forwards to update and add nodes.
    const maxLength = Math.max(oldVNode.childNodes.length, newVNode.childNodes.length);
    for (let i = 0; i < maxLength; i++) {
        updateElement(parent.childNodes[index], oldVNode, oldVNode.childNodes[i], newVNode.childNodes[i], i);
    }
}

const updateQueue = new Set();

/**
 * Enqueues updates and executes them in a batch using requestAnimationFrame.
 * @param {Function} update The update function to enqueue.
 */
export function enqueueUpdate(update) {
    updateQueue.add(update);
    if (updateQueue.size === 1) {
        requestAnimationFrame(runUpdates);
    }
}

/**
 * Runs all updates that have been enqueued.
 */
export function runUpdates() {
    updateQueue.forEach(update => update());
    updateQueue.clear();
}

/**
 * Creates a virtual DOM element.
 * @param {string} type The element type.
 * @param {Object} props The properties and attributes of the element.
 * @param {Array} childNodes The child elements or strings.
 * @returns {Object} A virtual DOM element.
 */
export function h(type, props, ...childNodes) {
    let v = new VDom(type, props || {}, [])
    for (let i of childNodes) {
        v.appendChild(i);
    }

    return v;
}
