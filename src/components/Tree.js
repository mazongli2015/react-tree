import React , { useState, useEffect } from "react";
import { createTreeNodesArray, changeExpandStatus } from "./tree.api";
import './Tree.css';
import '../css/iconfont.css';


const TreeNodes = props => {
  const { treeNodes, rootNodeIndex, onNodeClick, render } = props;
  console.info("Tree.js--TreeNodes--", { treeNodes, rootNodeIndex });
  const rootNode = treeNodes[rootNodeIndex];
  if (!treeNodes || treeNodes.length === 0) return "";
  return (
    <BranchNode onNodeClick={onNodeClick} render={render}
        level={0} treeNodes={treeNodes} branch={rootNode}
  />);
};

const BranchNode = ({ branch, onNodeClick, treeNodes, level, render }) => {
  console.info("Tree.js---BranchNode--",{treeNodes, branch});
  const { children, hidden = false, expanded = false } = branch || {};
  if (hidden) return '';
  if (!children || children.length === 0) {
    return (
      <LeafNode treeNodes={treeNodes} node={branch} 
        onNodeClick={onNodeClick} render={render} level={level}
    />);
  }
  const iconClass = expanded ? 'icon-jiantou_xia' : 'icon-jiantou_you' ;
  return (
      <li onClick={e => onNodeClick(e, branch)} className="tree-li">
        <span className={`branch-icon-text-container level${level}`}>
          <span className={`iconfont ${iconClass} branch-icon`}></span>
          <span>
          {
            (render && typeof render === 'function') ?
            render({node: branch, level, treeNodes }) : branch.name
          }
          </span>
        </span>
        {
          expanded &&
          <ul className="tree-branch-node">
            {
              children.map((item) => {
                const newBranch = treeNodes[item];
                if (!newBranch) return '';
                return (
                    <BranchNode 
                      key={`branch-${newBranch.id}`}       
                      branch={newBranch}
                      onNodeClick={onNodeClick}
                      treeNodes={treeNodes}
                      level={level + 1}
                      render={render}
                    />
                );
              })
            }
          </ul>
        }
      </li>
  );
};

const LeafNode = ({ node, onNodeClick, level, render, treeNodes }) => {
  const { hidden = false } = node || {};
  if (hidden) return '';

  return (
    <li onClick={e => onNodeClick(e, node)} className="tree-leaf-node tree-li">
      <span>
        {
          (render && typeof render === 'function') ?
          render({node, level, treeNodes}) : node.name
        }
      </span>
    </li>
  );
};

const Tree = (props) => {
  const  { treeNodes, onNodeClick, render } = props;
  // const nodesArrObj = createTreeNodesArray(treeNodes);
  const [ nodesArrObj, setNodesArrObj] = useState(null)
  const [ originNodes, setOriginNodes ] = useState(null);
  console.log('Tree.js---', {originNodes, nodesArrObj})
  useEffect(() => {
    console.log('Tree.js---', {originNodes, treeNodes, same: originNodes === treeNodes })
    if (originNodes === treeNodes) return;
    const nodesObject = createTreeNodesArray(treeNodes);
    setOriginNodes(treeNodes);
    setNodesArrObj(nodesObject);
  })
  const { rootNodeIndex, treeNodeArr } = nodesArrObj || {};
  

  const nodeClickHandler = (e, node) => {
      e.stopPropagation();
      onNodeClick(e, node);
      const newNodesArr = changeExpandStatus(node, treeNodeArr);
      console.info('Tree.js---nodeClickHandler---', {rootNodeIndex, treeNodeArr: newNodesArr })
      if (newNodesArr && newNodesArr.length > 0) {
        setNodesArrObj({rootNodeIndex, treeNodeArr: newNodesArr });
      }
  };

  if ((!rootNodeIndex && rootNodeIndex !== 0) || !treeNodeArr || !treeNodeArr.length) return '';

  return (
    <ul className="tree-container">
      <TreeNodes 
        rootNodeIndex={rootNodeIndex} 
        treeNodes={treeNodeArr}
        onNodeClick={nodeClickHandler}
        render={render}
      />
    </ul>
  );
}

export default Tree;