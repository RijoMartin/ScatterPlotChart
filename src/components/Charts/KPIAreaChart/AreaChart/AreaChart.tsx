import "./AreaChart.css";
import { useState, useEffect, useRef } from "react";
import { area, select, scaleLinear, scaleBand, axisBottom, axisLeft, curveLinear } from "d3";
import { IYears } from "../../../../InterfacesAndConstants/Interfaces";
const billion = 1000000000;
function AreaChart(props: any) {
  const svgRef = useRef(null);
  const [data, setData] = useState<IYears[]>(props.data);
  const isMobile = props.windowSize.width <= 720 ? true : false;

  useEffect(() => {
    if (svgRef.current) {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();
      svg.append("g").classed("x-axis", true);
      svg.append("g").classed("y-axis", true);

      const width = +svg.attr("width") - 5;
      const height = +svg.attr("height");
      const margin = { top: 20, right: 5, bottom: 15, left: 10 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const selectedYearIndex = data.findIndex((el: IYears) => el.year === props.selectedYear);
      const selectedYearDataArray = data.slice(0, selectedYearIndex + 1);

      const yearDomain = selectedYearDataArray.map((d) => d.year);
      const populationDomain = Math.max(...selectedYearDataArray.map((d) => d.totalPopulationPerYear));

      const xScale = scaleBand().domain(yearDomain).range([0, innerWidth]);
      const yScale = scaleLinear().domain([0, populationDomain]).range([innerHeight, 0]);

      const xAxis = axisBottom(xScale).ticks(2);
      const yAxis = axisLeft(yScale);
      const tickLabels = 12;

      const xAxisGroup = svg
        .select<SVGGElement>(".x-axis")
        .style("transform", `translate(${margin.left}px,${innerHeight + margin.top}px`)
        .call(xAxis);

      xAxisGroup.selectAll(".tick line").attr("opacity", "0"); // Example style for tick lines

      xAxisGroup
        .selectAll(".tick text")
        .attr("fill", "#000")
        .attr("dy", "0.2em")
        .attr("font-size", "10px")
        .attr("opacity", (d, i) => (i === 0 || i === yearDomain.length - 1 ? "1" : "0")); // Example style for tick text

      xAxisGroup.select(".domain").attr("display", "none"); // Example style for axis line

      const yAxisGroup = svg
        .select<SVGGElement>(".y-axis")
        .style("transform", `translate(${margin.left + tickLabels * 2}px, ${margin.top}px)`)
        .call(yAxis.tickValues([yScale.domain()[0], yScale.domain()[1]]));

      yAxisGroup.selectAll(".tick line").attr("opacity", "0"); // Example style for tick lines
      yAxisGroup
        .selectAll(".tick text")
        .attr("fill", "#000")
        .attr("x", "0")
        .attr("opacity", (d, i) => (i === 0 ? "0" : "1"))
        .text((d: any) => `${Math.ceil(d / 1000000000).toFixed(1)} Bn`); // Example style for tick text

      yAxisGroup.select(".domain").attr("display", "none"); // Example style for axis line

      const areas = area<IYears>()
        .x((d) => xScale(d.year) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.totalPopulationPerYear))
        .curve(curveLinear);

      svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .append("path")
        .datum(selectedYearDataArray)
        .attr("fill", "#ffd151")
        .attr("d", areas);
    }
  }, [props.selectedYear, props.windowSize.width]);

  return (
    <>
      {!isMobile && (
        <div className="areaChartMainContainer" style={{ display: isMobile ? "none" : "inline" }}>
          <div className="areaChartTitle">Population Growth</div>
          <svg ref={svgRef} width={400} height={130}>
            <g className="x-axis" />
            <g className="y-axis" />
          </svg>
        </div>
      )}
    </>
  );
}

export default AreaChart;
