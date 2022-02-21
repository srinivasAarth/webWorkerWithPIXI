import * as d3 from "d3";
import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import styles from "./forceGraph.module.css";

export function runForceGraphPixi(
  container,
  linksData,
  nodesData,
  nodeHoverTooltip
) {
  const links = linksData.map((d) => Object.assign({}, d));
  const nodes = nodesData.map((d) => Object.assign({}, d));

  const containerRect = container.getBoundingClientRect();
  const height = containerRect.height;
  const width = containerRect.width;
  let dragged = false;

  container.innerHTML = "";

  const color = () => {
    return "#f0f8ff";
  };

  // Add the tooltip element to the graph
  const tooltip = document.querySelector("#graph-tooltip");
  if (!tooltip) {
    const tooltipDiv = document.createElement("div");
    tooltipDiv.classList.add(styles.tooltip);
    tooltipDiv.style.opacity = "0";
    tooltipDiv.id = "graph-tooltip";
    document.body.appendChild(tooltipDiv);
  }
  const div = d3.select("#graph-tooltip");

  const addTooltip = (hoverTooltip, d, x, y) => {
    div.transition().duration(200).style("opacity", 0.9);
    div
      .html(hoverTooltip(d))
      .style("left", `${x}px`)
      .style("top", `${y - 28}px`);
  };

  const removeTooltip = () => {
    div.transition().duration(200).style("opacity", 0);
  };

  const colorScale = (num) => parseInt(color().slice(1), 16);

  const app = new PIXI.Application({
    width,
    height,
    antialias: !0,
    transparent: !0,
    resolution: 1,
  });
  container.appendChild(app.view);

  // create viewport
  const viewport = new Viewport({
    screenWidth: width,
    screenHeight: height,
    worldWidth: width * 4,
    worldHeight: height * 4,
    passiveWheel: false,

    interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
  });

  app.stage.addChild(viewport);

  // activate plugins
  viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()
    .clampZoom({ minWidth: width / 4, minHeight: height / 4 });

  /*
   Implementation
   */
  console.log(nodes);

  let visualLinks = new PIXI.Graphics();
  viewport.addChild(visualLinks);
  const worker = new Worker(
    new URL("../../src/Components/WorkerFolder/GraphWorker.js", import.meta.url)
  );
  const hint = "hello world";

  let initial = false;

  nodes.forEach((node) => {
    console.log(node);
    const { name, gender } = node;
    node.gfx = new PIXI.Graphics();
    node.gfx.lineStyle(1, 0xd3d3d3);
    node.gfx.beginFill(colorScale(node.id));
    node.gfx.drawCircle(0, 0, 24);
    node.gfx.endFill();
    node.gfx
      // events for click
      .on("click", (e) => {
        if (!dragged) {
          e.stopPropagation();
        }
        dragged = false;
      });

    // events for drag move

    viewport.addChild(node.gfx);

    node.gfx.interactive = true;
    node.gfx.buttonMode = true;

    // create hit area, needed for interactivity
    node.gfx.hitArea = new PIXI.Circle(0, 0, 24);

    // show tooltip when mouse is over node
    node.gfx.on("mouseover", (mouseData) => {
      addTooltip(
        nodeHoverTooltip,
        { name },
        mouseData.data.originalEvent.pageX,
        mouseData.data.originalEvent.pageY
      );
    });

    // make circle half-transparent when mouse leaves
    node.gfx.on("mouseout", () => {
      removeTooltip();
    });

    const text = new PIXI.Text(name, {
      fontSize: 12,
      fill: "#000",
    });
    text.anchor.set(0.5);
    text.resolution = 2;
    node.gfx.addChild(text);
  });
  // console.log(nodes);

  worker.postMessage({
    //   message: hint,
    width: width,
    height: height,
  });

  worker.onmessage = (msg) => {
    // console.log(msg.data.data.nodes);

    // const r = msg.data.data.nodes.map((el) => {
    //   return el.x, el.y;
    // });

    // console.log(r);
    nodes.forEach((node, i) => {
      console.log(node);
      let { x, y, gfx } = node;
      gfx.position = new PIXI.Point(
        msg.data.data.nodes[i].x,
        msg.data.data.nodes[i].y
      );
    });

    for (let i = visualLinks.children.length - 1; i >= 0; i--) {
      visualLinks.children[i].destroy();
    }

    visualLinks.clear();
    visualLinks.removeChildren();
    visualLinks.alpha = 1;

    links.forEach((link, i) => {
      let { source, target, number } = link;
      visualLinks.lineStyle(2, 0xd3d3d3);
      visualLinks.moveTo(
        msg.data.data.links[i].source.x,
        msg.data.data.links[i].source.y
      );
      visualLinks.lineTo(
        msg.data.data.links[i].target.x,
        msg.data.data.links[i].target.y
      );
    });

    visualLinks.endFill();
  };

  return {
    destroy: () => {},
  };
}
