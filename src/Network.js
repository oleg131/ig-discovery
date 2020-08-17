import React, { useEffect } from 'react';
import * as d3 from "d3";

import './Network.css';


const height = 600;
const width = 600;
const scale = d3.scaleOrdinal(d3.schemeCategory10);
const color = d => scale(d.group);
const avatar = d => d.profile_pic_url;
const drag = simulation => {

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

function getXY(d) {
  console.log(d);
  // return [d.y * Math.cos(d.x), d.y * Math.sin(d.x)];
  return [width / 2 + d.x, height / 2 + d.y];
}

const chart = (data) => {

  // data = data0;

  var width = 960,
    height = 500;

  console.log(data);

  const svg = d3.create("svg")
    .attr("viewBox", "0 0 " + width + " " + height);
  svg.classed('hidden', true);

  var link = svg.selectAll(".link")
    .data(data.links)
    .enter().append("line")
    .attr("class", "link");

  var node = svg.selectAll(".node")
    .data(data.nodes)
    .enter().append("g")
    .attr("class", "node");
  // .call(force.drag);


  // const links = data.links.map(d => Object.create(d));
  // const nodes = data.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.pk))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on('end', function () {
      svg.classed('hidden', false);
    });

  // var force = d3.force()
  //   .gravity(0.05)
  //   .distance(100)
  //   .charge(-100)
  //   .size([width, height]);

  // const svg = d3.create("svg")
  //   .attr("viewBox", [0, 0, width, height]);

  // const link = svg.append("g")
  //   .attr("stroke", "#999")
  //   .attr("stroke-opacity", 0.6)
  //   .selectAll("line")
  //   .data(links)
  //   .join("line")
  //   .attr("stroke-width", d => Math.sqrt(1));

  // const node = svg.append("g")
  //   .attr("stroke", "#fff")
  //   .attr("stroke-width", 1.5)
  //   .selectAll("circle")
  //   .data(nodes)

  //   // .enter()
  //   .enter().append("g")
  //   .attr("class", "node")
  //   // .call(force.drag);


  //   // .join("circle")
  //   // .attr("r", 5)
  //   // .attr("fill", color)


  node.append("image")
    .attr("xlink:href", avatar)
    .attr("x", -8)
    .attr("y", -8)
    .attr("width", 16)
    .attr("height", 16)
    .call(drag(simulation));

  // // node.append("image")
  // //   .attr("xlink:href", avatar)
  // //   .attr('width', 20)
  // //   .attr('height', 20)
  // //   .attr('x', -8)
  // //   .attr('y', -8);
  // // .attr("transform", d => "translate(" + getXY(d) + ") ")



  // node.append("title")
  //   .text(d => d.pk);

  simulation.on("tick", () => {
    link.attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

  // // invalidation.then(() => simulation.stop());

  return svg.node();
};

export default function Network({ data, update }) {
  const svg = React.useRef(null);
  // const size = useWindowSize();

  useEffect(() => {
    if (svg.current) {
      const result = chart(data, update);

      if (!svg.current.childElementCount) {
        svg.current.appendChild(result);
      } else {
        svg.current.replaceChild(result, svg.current.children[0]);
      }
    }
  }, [data, update]);

  return <div><div ref={svg}></div></div>;
}