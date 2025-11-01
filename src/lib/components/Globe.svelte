<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import * as topojson from 'topojson-client';

  let svgElement;

  onMount(() => {
    // Set up dimensions
    const width = 400;
    const height = 400;

    // Create the SVG
    const svg = d3.select(svgElement);

    // Define the projection (Orthographic for 3D globe effect)
    const projection = d3.geoOrthographic()
      .scale(180) // Adjust scale for globe size
      .center([0, 0])
      .translate([width / 2, height / 2]);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Load world data
    d3.json("https://unpkg.com/world-atlas@1/world/110m.json").then(function(world) {
      // Convert TopoJSON to GeoJSON
      const land = topojson.feature(world, world.objects.land);

      // Draw outer atmospheric glow
      svg.append("circle")
        .attr("class", "globe-atmosphere")
        .attr("fill", "rgba(201, 184, 150, 0.05)")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale() + 30);

      // Draw the globe sphere (dark neutral background)
      svg.append("circle")
        .attr("class", "globe-sphere")
        .attr("fill", "#1a1a1a")
        .attr("stroke", "rgba(201, 184, 150, 0.3)")
        .attr("stroke-width", 1.5)
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale())
        .style("filter", "drop-shadow(0 0 40px rgba(201, 184, 150, 0.15))");

      // Draw the landmasses (muted beige/wheat tones)
      svg.append("path")
        .datum(land)
        .attr("class", "land")
        .attr("fill", "rgba(201, 184, 150, 0.4)")
        .attr("stroke", "rgba(212, 205, 180, 0.3)")
        .attr("stroke-width", 0.5)
        .attr("d", path);

      // Add graticule (subtle neutral lines)
      const graticule = d3.geoGraticule();
      svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("fill", "none")
        .attr("stroke", "rgba(201, 184, 150, 0.1)")
        .attr("stroke-width", 0.5)
        .attr("d", path);

      // Set up rotation animation
      let rotation = 0;
      d3.timer(function() {
        rotation += 0.08; // Slow, elegant rotation
        projection.rotate([rotation, -10, 0]); // Rotate around y-axis with slight tilt
        svg.selectAll("path").attr("d", path);
      });
    }).catch(error => {
      console.error("Error loading world data:", error);
    });

    return () => {
      // Cleanup
      svg.selectAll("*").remove();
    };
  });
</script>

<svg bind:this={svgElement} class="globe" width="400" height="400" viewBox="0 0 400 400"></svg>

<style lang="scss">
  .globe {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
</style>
