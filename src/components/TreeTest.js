import React, { useEffect } from "react";
import Tree from "./Tree";
import Modal from "./Modal";
import {
  deleteArrayTreeNode,
  deleteObjectTreeNode,
  updateArrayNode,
  updateObjectNode,
  getRandomStrId
} from "./tree.api";
import "./TreeTest.css";

const AutoFocusInput = props => {
  const { inputRef, node, updateNodeName, error, required } = props;

  useEffect(() => {
    inputRef && inputRef.current && inputRef.current.focus();
  });

  return (
    <span className={error ? "input-error" : "node-input"}>
      <input
        onClick={e => e.stopPropagation()}
        ref={inputRef}
        placeholder={required ? "不能为空" : ""}
        defaultValue={node.name || ""}
        className="text-input"
        onBlur={e => updateNodeName(e, node)}
      />
    </span>
  );
};

const OP_TYPE = {
  DELETE: "delete",
  ADD_CHILD: "addChild",
  ADD_BROTHER: "addBrother",
  RENAME: "rename"
};

export default class TreeTest extends React.PureComponent {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.modalHeight = 1.6;
    this.modalWidth = 1.36;
    this.state = {
      editType: null,
      inputErr: false,
      visible: false,
      editNode: null,
      top: 0,
      left: 0,
      objectData: {
        id: 0,
        name: "一级内容",
        pid: -1,
        children: [
          {
            id: 1,
            name: "",
            pid: 0,
            children: [
              {
                id: 6,
                name: "二级内容",
                pid: 1
              }
            ]
          },
          {
            id: 2,
            name: "二级内容",
            pid: 0
          },
          {
            id: 3,
            name: "二级内容-3",
            pid: 0,
            children: [
              {
                id: 4,
                name: "三级内容",
                pid: 3
              },
              {
                id: 5,
                name: "三级内容",
                pid: 3
              }
            ]
          }
        ]
      },
      arrayData: [
        {
          id: 5,
          name: "三级内容",
          pid: 3
        },
        {
          id: 4,
          name: "三级内容",
          pid: 3
        },
        {
          id: 0,
          name: "一级内容",
          pid: -1
        },
        {
          id: 6,
          name: "三级内容",
          pid: 1
        },
        {
          id: 2,
          name: "二级内容",
          pid: 0
        },
        {
          id: 3,
          name: "二级内容",
          pid: 0
        },
        {
          id: 1,
          name: "二级内容",
          pid: 0
        }
      ]
    };
  }
  onNodeClick = (e, node) => {
    console.info("node clicked:", node);
  };

  getRealRemUnit = () => {
    const div = document.createElement("div");
    div.style = "display: inline-block; height: 0.1rem";
    document.body.appendChild(div);
    const height = div.getBoundingClientRect().height;
    document.body.removeChild(div);
    console.info("TreeTest---getRealRemUnit---", { height });
    return height / 0.1;
  };

  onEditClick = (e, { node, treeNodes }, type) => {
    e.stopPropagation();
    const box = e.target.getBoundingClientRect();
    let { top, left, height, width } = box;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    let { modalHeight, modalWidth } = this;
    const rem = this.getRealRemUnit();
    modalHeight *= rem;
    modalWidth *= rem;
    console.info(
      "edit button clicked",
      left + width + modalWidth + 10 > winWidth
    );
    if (left + width + modalWidth + 30 > winWidth) {
      left = `${(left - modalWidth - 30) / rem}rem`;
    } else {
      left = `${(left + width + 30) / rem}rem`;
    }
    if (top + height + modalHeight + 30 > winHeight) {
      top = `${(top + modalHeight - winHeight - 30) / rem}rem`;
    } else {
      top = `${top / rem}rem`;
    }
    console.info("edit button clicked", {
      box,
      left,
      top,
      winWidth,
      winHeight,
      modalWidth,
      modalHeight
    });

    this.setState({
      editNode: node,
      treeNodes,
      top,
      left,
      type,
      visible: !this.state.visible
    });
  };

  nodeRender = (type, { node, level, treeNodes }) => {
    console.info("TreeTest.js--nodeRender--", { node, level });
    let containerClass = "";
    let editSpan = "";
    if (level === 1 && node.children && node.children.length) {
      containerClass = "leve1-node";
      editSpan = (
        <span
          className="edit-btn"
          onClick={e => this.onEditClick(e, { node, level, treeNodes }, type)}
        >
          编辑
        </span>
      );
    }

    const { editable = false } = node;

    return (
      <span className={`${containerClass}`}>
        {!editable ? (
          <span className="node-text">{node.name}</span>
        ) : (
          <AutoFocusInput
            error={this.state.inputErr}
            inputRef={this.inputRef}
            node={node}
            required={this.state.editType === OP_TYPE.RENAME}
            updateNodeName={this.updateNodeName}
          />
        )}
        {editSpan}
      </span>
    );
  };

  updateNodeName = (e, node) => {
    e.stopPropagation();
    const name = this.inputRef.current.value;
    // console.info('TreeTest----updateNodeName---', this.inputRef, name);
    const { type, treeNodes, editType } = this.state;
    let newNode = { ...node, name, editable: false };
    const emptyName = !name || !name.trim();
    let newTreeNodes = treeNodes;
    if (
      emptyName &&
      (editType === OP_TYPE.ADD_BROTHER || editType === OP_TYPE.ADD_CHILD)
    ) {
      if (type === "arrayData") {
        newNode = {};
      } else {
        let parentNode = treeNodes[node.parentIndex];
        newTreeNodes = [...newTreeNodes];
        const newChildren = parentNode.children.filter(
          item => item !== node.index
        );
        parentNode = { ...parentNode, children: newChildren };
        newTreeNodes[parentNode.index] = parentNode;
      }
    } else if (
      emptyName &&
      editType === OP_TYPE.RENAME &&
      this.inputRef.current
    ) {
      this.inputRef.current.focus();
      this.setState({ inputErr: true });
      return;
    }

    console.log("TreeTest---updateNodeName----", {
      type,
      newNode,
      newTreeNodes
    });
    let newData = this.updateNodesData(type, newNode, newTreeNodes);
    this.resetOperationNode(type, newData, { inputErr: false });
  };

  arrayDataRender = params => {
    return this.nodeRender("arrayData", params);
  };

  objectDataRender = params => {
    return this.nodeRender("objectData", params);
  };

  renameNode = () => {
    const { type, editNode, treeNodes } = this.state;
    const newNode = { ...editNode, editable: true };
    const newData = this.updateNodesData(type, newNode, treeNodes);
    console.info("TreeTest---renameNode===", { newData, treeNodes, newNode });
    this.setState({
      [type]: newData,
      visible: false,
      editType: OP_TYPE.RENAME
    });
  };

  // commitValidNode = (type, newNode, treeNodes) => {
  //   debugger;
  //   if (!newNode || !newNode.name || !newNode.name.trim()) {
  //     return this.state[type].slice(0, treeNodes.length-1);
  //   }
  //   return this.updateNodesData(type, newNode, treeNodes);
  // }

  updateNodesData = (type, newNode, treeNodes) => {
    if (type === "arrayData") {
      return updateArrayNode(newNode, treeNodes);
    }
    return updateObjectNode(newNode, treeNodes);
  };

  addSameLeveNode = () => {
    const { type, editNode, treeNodes } = this.state;
    let newNode = {
      id: getRandomStrId(),
      pid: editNode.pid,
      editable: true,
      index: treeNodes.length,
      parentIndex: editNode.parentIndex
    };

    if (type === "objectData") {
      const parentNode = { ...treeNodes[newNode.parentIndex] };
      parentNode.children.push(newNode.index);
      newNode = [newNode, parentNode];
    }

    const newData = this.updateNodesData(type, newNode, treeNodes);

    console.info("TreeTest---addSameLeveNode===", { newData, treeNodes });
    this.setState({
      [type]: newData,
      visible: false,
      editType: OP_TYPE.ADD_BROTHER
    });
  };

  addChildNode = () => {
    const { type, editNode, treeNodes } = this.state;
    const newNode = [
      {
        id: getRandomStrId(),
        pid: editNode.id,
        editable: true,
        index: treeNodes.length,
        parentIndex: editNode.index
      },
      {
        ...editNode,
        expanded: true,
        children: [...editNode.children, treeNodes.length]
      }
    ];
    const newData = this.updateNodesData(type, newNode, treeNodes);
    const newTreeNodes = [...treeNodes];
    newTreeNodes[editNode.index].expanded = true;

    console.info("TreeTest---addSameLeveNode===", {
      newNode,
      newData,
      treeNodes
    });
    this.setState({
      [type]: newData,
      visible: false,
      treeNodes: newTreeNodes,
      editType: OP_TYPE.ADD_CHILD
    });
  };

  deleteNode = () => {
    const { type, editNode, treeNodes } = this.state;
    const newData = this.deleteTreeNode(type, editNode, treeNodes);
    console.log("TreeTest----deleteNode---after---", newData);
    this.resetOperationNode(type, newData, { editType: OP_TYPE.DELETE });
  };

  resetOperationNode = (type, newData, extra) => {
    this.setState({
      [type]: newData,
      ...extra,
      treeNodes: undefined,
      editNode: undefined,
      visible: false
    });
  };

  deleteTreeNode = (type, node, treeNodes) => {
    if (type === "arrayData") {
      return deleteArrayTreeNode(node, treeNodes);
    }
    return deleteObjectTreeNode(node, treeNodes);
  };

  onVisibleChange = visible => {
    this.setState({ visible });
  };

  render() {
    return (
      <div id="tree">
        <h3>array形式的节点数据</h3>
        <Tree
          onNodeClick={this.onNodeClick}
          treeNodes={this.state.arrayData}
          render={this.arrayDataRender}
        />
        {/* <h3>Object形式的节点数据</h3>
        <Tree
          onNodeClick={this.onNodeClick}
          render={this.objectDataRender}
          treeNodes={this.state.objectData}
        /> */}
        <Modal
          visible={this.state.visible}
          left={this.state.left}
          top={this.state.top}
          height={`${this.modalHeight}rem`}
          width={`${this.modalWidth}rem`}
          onVisibleChange={this.onVisibleChange}
        >
          <p className="rename-btn" onClick={this.renameNode}>
            重命名
          </p>
          <p onClick={this.addSameLeveNode}>新增同级</p>
          <p onClick={this.addChildNode}>新增子集</p>
          <p className="delete-btn" onClick={this.deleteNode}>
            删除
          </p>
        </Modal>
      </div>
    );
  }
}
