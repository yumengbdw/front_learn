/**
 * Creates a renderer function with the given options.
 *
 * @param {Object} options - The options object.
 * @param {function} options.createElement - The function used to create DOM elements.
 * @param {function} options.insert - The function used to insert elements into the DOM.
 * @param {function} options.setElementText - The function used to set the text content of an element.
 * @param {function} options.patchProp - The function used to patch element properties.
 * @return {function} The render function.
 */
function createRenderer(options){
    const { createElement, insert, setElementText, patchProp } = options
    function mountElement(vnode, container){
        const el = createElement(vnode.type)
        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children)
        } 
        insert(el, container)

    }
    function patch(n1, n2, container) {

    }
    function render(vnode, container) {

    }


    // const renderer = {
    //     createElement,
    //     patchProp
    // }
    return render

}


/**
 * 创建渲染器
 */
const renderer = createRenderer({
    createElement(tag) {
        
    },
    setElementText(el, text){

    },
    insert(el, parent, anchor = null) {
        console.log(`将 ${JSON.stringify(el)} 添加到${JSON.stringify(parent)} 下`)
         parent.children = el
    },

    patchProp() {

    }
    
})

renderer.render(vnode, document.querySelector('#app'))