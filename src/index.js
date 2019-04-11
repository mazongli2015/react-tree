import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import TreeTest from "./components/TreeTest";

import "./styles.css";

function App() {
  return <TreeTest />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
