/**
 * çº¦å®ï¼æ ¹èç¹çidä¸º-1
 *
 */

export const isEmpty = data => {
    if (
      data === null ||
      data === undefined ||
      `${data}`.trim() === "" ||
      (data !== 0 && !data)
    ) {
      return true;
    }
    return false;
  };
  
  export const treeNode = ({ id, pid, name, ...extra }) => {
    const empty = isEmpty(id) || isEmpty(pid);
    if (empty) {
      console.error(
        { id, pid },
        "idåpidä¸è½ä¸ºnull, undefinedï¼NaNï¼ä»¥åç©ºå­ç¬¦ä¸²."
      );
      return;
    }
  
    return {
      id,
      name,
      pid,
      ...extra
    };
  };
  
  /**
   *
   * @param {object[]} arr åå§èç¹æ°ç»
   * @returns {Object[]} æ¹é åçèç¹æ°ç»å¢å chilrenãparentIndex
   * åindexå±æ§æ°ç»çç¬¬ä¸ä¸ªåç´ ä¸ºæ ¹èç¹
   */
  export const arrayToTreeNodesArray = arr => {
    if (!Array.isArray(arr)) {
      console.error("åæ°å¿é¡»æ¯æ°ç»");
      return;
    }
  
    const nodes = {};
  
    // è½¬æ¢ææ®éObjectå½¢å¼, è®°å½index
    arr.forEach((item, index) => {
      const nodeItem = treeNode(item);
      if (!nodeItem) return;
      nodes[nodeItem.id] = index;
    });
  
    const treeNodeArr = [...arr];
    //  console.info("tree.api----arrayToTreeNodesArray---not run--", { nodes, treeNodeArr });
  
    let rootNodeIndex;
    Object.keys(nodes).find(key => {
      const index = nodes[key];
      const currentNode = arr[index];
      const { pid } = currentNode;
      if (`${pid}` === "-1" && (rootNodeIndex || rootNodeIndex === 0)) {
        console.error("ä¸æ­¢ä¸ä¸ªæ ¹èç¹", {
          rootNodeIndexes: [rootNodeIndex, index]
        });
        return true;
      } else if (`${pid}` === "-1") {
        rootNodeIndex = index;
      }
      let parentIndex = nodes[pid];
  
      treeNodeArr[index] = { ...treeNodeArr[index], parentIndex, index };
      if ((!parentIndex && parentIndex !== 0) || `${parentIndex}` === "-1") return false;
      // console.info("tree.api----arrayToTreeNodesArray---", {
      //   parentIndex,
      //   index,
      //   arr,
      //   currentNode
      // });

      // console.info({ node: treeNodeArr[parentIndex], parentIndex });
      if (!treeNodeArr[parentIndex].children) {
        treeNodeArr[parentIndex] = { ...treeNodeArr[parentIndex], children: [] };
      }
      treeNodeArr[parentIndex].children.push(index);
      return false;
    });
  
    if (rootNodeIndex || rootNodeIndex === 0) {
      treeNodeArr[rootNodeIndex].hidden = false;
      return { treeNodeArr, rootNodeIndex };
    }
    console.error("æ²¡ææ ¹èç¹");
    return;
  };
  
  /**
   *
   * @param {object} treeObject å°å½¢å¦{id, name, pid, children}çobjectæ°æ®è½¬æ¢
   * ä¸ºæ å½¢ç»ææ°ç»
   */
  export const objectToTreeNodesArray = treeObject => {
    const treeNodeArr = []; 
    function objectToTreeArr(sourceObject, parentIndex) {
      if (!sourceObject.children || sourceObject.children.length === 0) {
        treeNodeArr.push({
          ...sourceObject,
          parentIndex,
          index: treeNodeArr.length
        });
        return;
      }
  
      const { children, ...rest } = sourceObject;
      const currentNode = { ...rest, children: [], parentIndex, index: treeNodeArr.length };
      treeNodeArr.push(currentNode);
      for (let i = 0, len = children.length; i < len; i++) {
        currentNode.children.push(treeNodeArr.length);
        objectToTreeArr(children[i], currentNode.index);
      }
    }
    objectToTreeArr(treeObject);
    return { treeNodeArr, rootNodeIndex: 0 };
  };
  
  export const createTreeNodesArray = treeNodes => {
    if (Array.isArray(treeNodes)) {
      console.info("tree.api---createTreeNodesArray---", { treeNodes });
      return arrayToTreeNodesArray(treeNodes);
    }
    if (typeof treeNodes === "object") {
      return objectToTreeNodesArray(treeNodes);
    }
  };
  
  export const changeExpandStatus = (node, treeNodes) => {
    const { children, expanded = false } = node || {};
    if (!children || children.length === 0) return;
    const nodes = [...treeNodes];
    nodes[node.index] = { ...node, expanded: !expanded };
    return nodes;
  }

  export const deleteObjectTreeNode = (node, treeNodes) => {
    const root = findRootNode(node, treeNodes);
    const newNodes = [...treeNodes];
    newNodes[node.index] = null;
    return generateObj(root, newNodes);
  }

  export const generateArray = (treeNodes) => {
    const newArr = [];
    treeNodes.forEach((item) => {
      if (item !== null) {
        newArr.push(filterNode(item));
      }
    });
    console.info('tree.api----generateArray----', newArr)
    return (newArr && newArr.length) ? newArr : null;
  }

  export const deleteArrayTreeNode = (node, treeNodes) => {
    const root = findRootNode(node, treeNodes);
    const newNodes = [...treeNodes];
    newNodes[node.index] = null;
    
    const deleteChildren = (children) => {
      if (!children || children.length ===0)return;
      children.forEach((item) => {
        const child = newNodes[item];
        if (!child) return;
        newNodes[item] = null;
        deleteChildren(child.children);
      });
    }
    deleteChildren(node.children);
    console.log('tree.api---deleteArrayTreeNode---', { node, root, treeNodes: newNodes });
    return generateArray( newNodes);
  }

  export const generateObj = (root, treeNodes) => {
    const result = filterNode(root);
    let currentNode = result;
    const generate = (node) => {
      if (!node) return;
      if (!node.children || !node.children.length) {
        return;
      }
      currentNode.children = [];
      node.children.forEach((item) => {
        const nodeItem = treeNodes[item];
        const pureNode = filterNode(nodeItem);
        currentNode.children.push(pureNode);
        const temp = currentNode;
        currentNode = pureNode;
        generate(nodeItem);
        currentNode = temp;
      })

    }
    generate(root);
    return result;
  }

  const filterNode = (node) => {
    const { parentIndex, children, index, ...result } = node;
    return result;
  }

  const findRootNode = (startNode, treeNodes) => {
    let { parentIndex } = startNode;
    let parentNode = startNode;
    console.info('tree.api---findRootNode---', {parentNode, parentIndex, treeNodes})
    while(parentIndex || parentIndex === 0) {
      parentNode = treeNodes[parentIndex];
      console.info('tree.api---findRootNode---', {parentNode, parentIndex, treeNodes})
      parentIndex = parentNode ? parentNode.parentIndex : null;
    }
    return parentNode;
  }

export const updateArrayNode = (newNode, treeNodes) => {
  // if (!newNode) return;
  const newNodes = [...treeNodes];
  if (Array.isArray(newNode)) {
    newNode.forEach((item) => {
      newNodes[item.index] = item;
    });
  } else {
    newNodes[newNode.index] = newNode;
  }
  console.log('tree.api---updateArrayNodeName---', { newNode, treeNodes: newNodes });
  return generateArray(newNodes);

}
  
export const updateObjectNode = (newNode, treeNodes) => {
  const root = treeNodes[0];
  const newNodes = [...treeNodes];
  if (Array.isArray(newNode)) {
    newNode.forEach((item) => {
      newNodes[item.index] = item;
    });
  } else {
    newNodes[newNode.index] = newNode;
  }
  console.log('tree.api---updateObjectNodeName---', { newNode, root, treeNodes: newNodes });
  return generateObj(root, newNodes);
}

export const getRandomStrId = (len = 10) => {
  const str = '1234567890qwertyuiopasdfghjklzxcvbnm-_=@#&';
  const n = str.length;
  const chars = [];
  for (let i = 0; i<len; i++) {
      const index = parseInt(Math.random() * n);
      chars.push(str[index]);
  }
  return chars.join('');
}