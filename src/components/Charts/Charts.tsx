import "./Charts.css";
import { useState, useEffect } from "react";
import { visualTransform } from "../../visualTransform.ts/visualTranform";
import { IViewmodel } from "../../InterfacesAndConstants/Interfaces";
import { csv } from "d3";
import Kpi from "./KPIAreaChart/KPI/KPI";
import AreaChart from "./KPIAreaChart/AreaChart/AreaChart";
import ScatterplotChart from "./ScatterplotChart/ScatterplotChart";
function Charts() {
  const [data, setData] = useState<IViewmodel>();
  const [isDataPresent, setIsDataPresent] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const listOfYears = data?.years?.map((el) => el?.year);

  if (selectedYear === "" && listOfYears && listOfYears?.length > 0) {
    setSelectedYear(listOfYears[0]);
  }

  const handleChange = (event: any) => {
    setSelectedYear(event.target.value);
  };

  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  useEffect(() => {
    async function readCsvFile(): Promise<void> {
      try {
        const filePath = "../../../population.csv"; // Update with the actual file path and name

        const csvData = await csv(filePath, (d) => {
          return d;
        });

        if (csvData && csvData.length > 0) {
          setData(visualTransform(csvData));
          setIsDataPresent(true);
        }
      } catch (error) {
        // Handle any errors that occur during file reading or parsing
        console.error("Error reading CSV file:", error);
      }
    }
    readCsvFile();

    // Update window size when the component mounts
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Add event listener to update window size on resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  //const selectedDataYear = data?.years.find((el) => el.year === selectedYear)
  const isMobile = windowSize.width <= 720 ? true : false;


  return (
    <div className="chartsMainContainer">
      <div className="dropDownContainer">
        <div className="selectContainer">
          <select className="selectElement" placeholder={"Select Year"} onChange={handleChange}>
            {isDataPresent && listOfYears?.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      <div className="kpiAreaChartContainer">
        <div className="kpiAreaChartInlineContainer" style={{width:isMobile?"350px":"700px"}}>
          {isDataPresent && data && (
            <>
              <Kpi totalPopulation={data.years.find((el) => el.year === selectedYear)?.totalPopulationPerYear} selectedYear={selectedYear} />
              <AreaChart data={data.years} selectedYear={selectedYear} windowSize = {windowSize}/>
            </>
          )}
        </div>
      </div>
      {isDataPresent && data && (
        <div className="bubbleChartContainer">
          <ScatterplotChart data={data.years} selectedYear={selectedYear}  windowSize = {windowSize}/>
        </div>
      )}
    </div>
  );
}

export default Charts;
