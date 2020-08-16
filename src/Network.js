import React, { useEffect } from 'react';
import * as d3 from "d3";

import './Network.css'
import { cloneDeep } from 'lodash'



var node,
  link;



const chart = function (data, onClick, size) {
  var diameter = Math.min(size.width, size.height),
    padding = 120,
    radius = diameter / 2 - padding;

  var stratify = d3.stratify()
    .id(d => d.username);

  var cluster = d3.cluster()
    .size([Math.PI * 2, radius]);

  var line = d3.line()
    .x(d => getX(d))
    .y(d => getY(d))
    // .curve(d3.curveBasis); //bug: d3.curveBasis doesn't have beta
    .curve(d3.curveBundle);

  data = cloneDeep(data)

  // console.log(data)

  data = addParentNode(data);
  var root = stratify(data);
  cluster(root);
  var leaves = root.leaves();

  var svg = d3.create('svg')
    .attr("width", diameter)
    .attr("height", diameter);

  var g = svg.append("g")
    .attr("transform", "translate(" + [diameter / 2, diameter / 2] + ")");

  // console.log(leaves)

  node = g.append("g")
    .selectAll("text")
    .data(leaves)
    .enter()

    .append("image")
    .attr("xlink:href", d => d.data.profile_pic_url)
    .attr('width', 20)
    .attr('height', 20)


    // .append("text")
    // .text(d => d.data.username)

    .attr("transform", d => "translate(" + [getX(d), getY(d)] + ") " //if not translate, rotate will behave strange
      // + "rotate(" + (d.x * 180 / Math.PI - (isLeft(d) ? 180 : 0)) + ")"
    )
    // .attr("text-anchor", d => isLeft(d) ? "end" : "start")
    // .attr("dx", d => isLeft(d) ? "-0.7em" : "0.7em")
    // .attr("dy", "0.3em")

    .on("mouseover", mouseovered)
    .on("mouseout", mouseouted)
    .on("click", function (d) {
      onClick(d.data.pk, d.data.path)
    })


  // svg.append("g")
  //   .attr("class", "photo")
  //   .selectAll("text")
  //   .data(leaves)
  //   .enter()
  //   .append("image")
  //   .attr("xlink:href", d => d.data.profile_pic_url)
  //   .attr('width', 20)
  //   .attr('height', 20)
  //   .attr("transform", d => console.log(d.x, d.y) || `
  //     translate(${getX(d)},${getY(d)})
  //   `)
  //   .on("click", function (d) {
  //     onClick(d.data.pk, d.data.path)
  //   })

  link = g.append("g")
    .selectAll("path")
    .data(getPaths(leaves))
    .enter().append("path")
    .each(d => { d.source = d[0]; d.target = d[d.length - 1]; })
    .attr("d", line);

  return svg.node()
}

function addParentNode(data) {
  // var map = {};
  // data.forEach(node => { map[node.username] = node; });

  // var node,
  //   newNode,
  //   index,
  //   id;
  // for (var i = 0; i < data.length; i++) {
  //   node = data[i];
  //   // index = node.name.lastIndexOf(".");
  //   // id = node.name.substring(0, index);
  //   node.parentId = 'z';
  //   node.shortName = node.username;
  //   if (!map[id]) {
  //     newNode = { name: id };
  //     // data.push(newNode);
  //     map[id] = newNode;
  //   }
  // }
  // data.pop(); //remove the one with name "", since it causes multi-root error.

  for (var i = 0; i < data.length; i++) {
    node = data[i];
    node.parentId = 'z';
  }

  if (data.findIndex(i => i.username === 'z') < 0) {
    data.push({
      username: "z",
      parentId: "",
      shortName: "z"
    })
  }


  // console.log(data[data.length - 2])

  return data
}

function getPaths(leaves) {
  var map = {};
  leaves.forEach(leaf => { map[leaf.data.username] = leaf; });

  var paths = [];
  leaves.forEach(leaf => {
    if (leaf.data.children) {
      // console.log('children', leaf.data.children)
      leaf.data.children.forEach(name => {
        // console.log(name)
        paths.push(leaf.path(map[name]));
      });
    }
  });
  return paths;
}

function mouseovered(d) {
  node.each(n => { n.target = n.source = false; });
  link.classed("link--target", l => { if (l.target === d) return l.source.source = true; })
    .classed("link--source", l => { if (l.source === d) return l.target.target = true; })
    .filter(l => l.target === d || l.source === d)
    .raise();
  node.classed("node--source", n => n.source)
    .classed("node--target", n => n.target)
}

function mouseouted(d) {
  link.classed("link--source", false)
    .classed("link--target", false);
  node.classed("node--source", false)
    .classed("node--target", false);
}

function getX(d) {
  return d.y * Math.cos(d.x);
}

function getY(d) {
  return d.y * Math.sin(d.x);
}

function isLeft(d) {
  return d.x > Math.PI * 0.5 && d.x < Math.PI * 1.5;
}

export default function Network({ data, update }) {
  const svg = React.useRef(null);
  const size = useWindowSize();

  useEffect(() => {
    if (svg.current && data.length) {
      const result = chart(data, update, size)

      if (!svg.current.childElementCount) {
        svg.current.appendChild(result)
      } else {
        svg.current.replaceChild(result, svg.current.children[0])
      }
    }
  }, [data, size, update])

  return <div><div ref={svg}></div></div>
}

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = React.useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}