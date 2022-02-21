import React from "react";
import data from "./Data/data.json";
import { ForceGraph } from "./Components/forceGraph";
import "./App.css";

function App() {
  const nodeHoverTooltip = React.useCallback((node) => {
    return `<div>${node.name}</div>`;
  }, []);

  return (
    <div className="App">
      <section className="Main">
        <ForceGraph
          linksData={data.links}
          nodesData={data.nodes}
          nodeHoverTooltip={nodeHoverTooltip}
        />
      </section>
    </div>
  );
}

export default App;
