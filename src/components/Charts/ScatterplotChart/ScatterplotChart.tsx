import { ICountry, IYears } from "../../../InterfacesAndConstants/Interfaces";
import "./ScatterplotChart.css";
import { useState, useEffect, useRef } from "react";
import { select, scaleLinear, max, min, axisBottom, axisLeft, schemeCategory10, scaleOrdinal, selectAll } from "d3";

function ScatterplotChart(props: any) {
  const svgRef = useRef(null);
  const [data, setData] = useState<IYears[]>(props.data);
  const isMobile = props.windowSize.width <= 720 ? true : false;

  const chartWidth = isMobile ? 300 : 700;
  const chartHeight = isMobile ? 300 : 500;

  useEffect(() => {
    if (svgRef.current) {
      const svg = select(svgRef.current);
      svg.selectAll("*").remove();
      svg.append("g").classed("x-axis", true);
      svg.append("g").classed("y-axis", true);
      svg.append("g").classed("scatter", true);

      const tickLabels = 12;
      const legend = 20;

      const width = +svg.attr("width");
      const height = +svg.attr("height");
      const margin = { top: 20, right: 5, bottom: 10, left: 10 };
      const innerWidth = width - margin.left - margin.right - tickLabels;
      const innerHeight = height - margin.top - margin.bottom - tickLabels - legend;

      //Find the Selected Year
      const selectedYearData = data.find((year) => year.year === props.selectedYear);
      const listOfCountries = selectedYearData?.countries.sort((a, b) => b.population - a.population)!;

      const populationDensityMax = max(listOfCountries, (d) => d.populationDensity)!;
      const populatoinGrowthMax = Math.ceil(max(listOfCountries, (d) => d.populatoinGrowth)!);
      const populatoinGrowthMin = Math.floor(min(listOfCountries, (d) => d.populatoinGrowth)!);
      const populatoinSizeMax = max(listOfCountries, (d) => d.population)!;

      const xScale = scaleLinear()
        .domain([0, populationDensityMax])
        .range([margin.left, innerWidth - margin.right]);

      const yScale = scaleLinear()
        .domain([populatoinGrowthMin, populatoinGrowthMax])
        .range([innerHeight - margin.bottom - tickLabels, margin.top]);

      const bubbleMin = isMobile ? 5 : 5;
      const bubbleMax = isMobile ? 30 : 80;
      const bubbleScale = scaleLinear().domain([0, populatoinSizeMax]).range([bubbleMin, bubbleMax]);

      const colorScale = scaleOrdinal(schemeCategory10);

      const xAxis = axisBottom(xScale).ticks(5);
      const yAxis = axisLeft(yScale);

      const xAxisGroup = svg
        .select<SVGGElement>(".x-axis")
        .style("transform", `translate(${margin.left + tickLabels + 2}px,${innerHeight - (margin.bottom - tickLabels + 2)}px`)
        .call(xAxis);

      xAxisGroup.selectAll(".tick line").attr("stroke", "gray"); // Example style for tick lines
      xAxisGroup.selectAll(".tick text").attr("fill", "#000").attr("opacity", "1"); // Example style for tick text

      xAxisGroup.select(".domain").attr("stroke", "black"); // Example style for axis line

      //Yaxis Label
      svg
        .append("text")
        .classed("yAxisLabel", true)
        .attr("color", "#000")
        .style("transform", `translate(${tickLabels}px,${margin.top + innerHeight / 2}px) rotate(-90deg)`)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .text("Population Growth %");

     
        //Xaxis Label
      svg
        .append("text")
        .classed("yAxisLabel", true)
        .attr("color", "#000")
        .attr("dy", "0.5em")
        .style("transform", `translate(${tickLabels + innerWidth / 2}px,${margin.top + tickLabels + innerHeight}px) `)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "600")
        .text("Population Density");

      const yAxisGroup = svg
        .select<SVGGElement>(".y-axis")
        .style("transform", `translate(${margin.left + tickLabels * 2}px, ${margin.top + 2}px)`)
        .call(yAxis);

      yAxisGroup.selectAll(".tick line").attr("stroke", "gray"); // Example style for tick lines
      yAxisGroup.selectAll(".tick text").attr("fill", "#000").attr("opacity", "1"); // Example style for tick text

      yAxisGroup.select(".domain").attr("stroke", "black"); // Example style for axis line

      //Plot Scatter Chart

      const scatterGroup = svg.select<SVGGElement>(".scatter").style("transform", `translate(${margin.left + tickLabels}px, ${margin.top}px)`);

      scatterGroup
        .append("defs")
        .append("clipPath")
        .attr("id", "circle-clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("transform", `translate(${tickLabels}px, ${margin.top}px)`);

      const dots = scatterGroup.attr("clip-path", "url(#circle-clip)").selectAll(".dot").data(listOfCountries).enter();

      dots
        .append("circle")
        .classed("dot", true)
        .attr("cx", (d) => xScale(d.populationDensity))
        .attr("cy", (d) => yScale(d.populatoinGrowth))
        .attr("r", (d) => bubbleScale(d.population))
        .attr("opacity", (d) => "0.8")
        .attr("fill", (d) => colorScale(d.countryName))
        .on("mouseover", (e: MouseEvent, d: ICountry) => {
          e.preventDefault();
          const mouseX = e.offsetX;
          const mouseY = e.offsetY;
          // selectAll(".dot").on("mouseover",null)
          const tooltipMainContainer = select(".scatterPlotSVGContainer")
            .append("div")
            .classed("tooltip", true)
            .style("position", "absolute")
            .style("width", "150px")
            .style("height", "50px")
            .style("border-radius", "5px")
            .style("transform", `translate(${mouseX + 20}px,${mouseY + 10}px)`);

          tooltipMainContainer
            .append("div")
            .classed("tooltipTitle", true)
            .style("width", "100%")
            .style("height", "20px")
            .style("padding", "5px")
            .style("background", "#000")
            .style("border-top-left-radius", "10px")
            .style("border-top-right-radius", "10px")
            .style("font-size", "12px")
            .text(d.countryName);

          const tooltipValuesContainer = tooltipMainContainer
            .append("div")
            .classed("tooltipValuesContainer", true)
            .style("border-bottom-left-radius", "10px")
            .style("border-bottom-right-radius", "10px")
            .style("border-color", "#000")

            .style("width", "100%")
            .style("height", "50px")
            .style("padding", "5px")
            .style("background", "#f9f9f9")
            .style("color", "#000")
            .style("font-size", "10px");

          tooltipValuesContainer.append("div").text(`Population Density - ${d.populationDensity}`);
          tooltipValuesContainer.append("div").text(`Population Growth - ${d.populatoinGrowth}`);
          tooltipValuesContainer.append("div").text(`Population - ${(d.population / 1000000).toFixed(1)} M`);
        })
        .on("mouseleave", (e, d) => {
          selectAll(".tooltip").remove();
        });

      //Legend
      svg.append("g").classed("legend", true);

      const legendChart = svg
        .select<SVGGElement>(".legend")
        //        .attr("transform", `translate(${margin.left + tickLabels}px, ${margin.top + height}px)`)
        .attr("width", 500)
        .attr("height", 50)
        .style("fill", "#000");

      const legendGroup = legendChart.selectAll(".legendGroup").data(listOfCountries).enter();
      const groups = legendGroup
        .append("g")
        .classed("legendGroup", true)
        .attr("transform", `translate(${margin.left + tickLabels}, ${margin.top + innerHeight + tickLabels + 5 + margin.bottom + legend / 2})`);
      groups
        .append("circle")
        .attr("cx", (d, i) => i * 75)
        .attr("cy", (d) => -4)
        .attr("r", (d) => 4)
        .attr("fill", (d) => colorScale(d.countryName));

      const legendText = groups
        .append("text")
        .text((d) => d.countryName)
        .attr("color", "#000")
        .attr("x", (d, i) => i * 75 + 8)
        .call(wrapText, 75); // Wrap the text if it exceeds a certain width;

      legendText.append("title").text((d) => d.countryName);
    }
  }, [props.selectedYear, props.windowSize.width]);

  return (
    <div className="scatterplotChart">
      <div className="scatterplotChartTitle"> Population Growth vs Density Correlation</div>
      <div className="scatterPlotSVGContainer">
        <svg className="scatterPlotSVG" ref={svgRef} width={chartWidth} height={chartHeight}>
          <g className="x-axis" />
          <g className="y-axis" />
          <g className="scatter" />
          <g className="legend" />
        </svg>
      </div>
    </div>
  );
}

function wrapText(texts: d3.Selection<SVGTextElement, any, any, any>, width: number) {
  texts.each(function () {
    const textElement = select<SVGTextElement, any>(this);
    const words = textElement.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // Adjust as needed
    const y = textElement.attr("y");
    const dy = parseFloat(textElement.attr("dy"));

    const tspan = textElement
      .text(null)
      .append("tspan")
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node()?.getComputedTextLength()! >= width) {
        line.pop();
        tspan.text(line.join(" ") + "...");
        break;
      }
    }
  });
}

export default ScatterplotChart;
