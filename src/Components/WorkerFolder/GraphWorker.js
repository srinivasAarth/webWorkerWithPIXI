/* eslint-disable no-restricted-globals */

import * as d3 from "d3";
import data from "../../Data/data.json";

self.onmessage = (ev) => {
  const recieveData = ev.data.message;
  console.log(ev.data.rectWidth);
  let width = ev.data.width;
  let height = ev.data.height;
  console.log(width);
  console.log(height);
  // let links = ev.data.links;
  // let nodes = ev.data.nodes;

  // console.log(nodes);

  // const links = data.links.map((d) => Object.assign({}, d));
  // const nodes = data.nodes.map((d) => Object.assign({}, d));

  let initial = false;
  // let actualData = data;

  const simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3.forceLink(data.links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody().strength(-1000))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", () => {
      self.postMessage({ data: data });
    });

  console.log(recieveData);

  let node = ev.data.node;
  console.log(node);
};
