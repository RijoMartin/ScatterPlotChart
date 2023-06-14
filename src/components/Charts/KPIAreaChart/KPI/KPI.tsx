import "./KPI.css";

function Kpi(props: any) { 
  const billion = 1000000000; 
  return (  
    <div className="kpiMainContainer">
      <div className="kpiTitle"> World Population : ({props.selectedYear})</div>
      <div className="kpiValue"> {(props.totalPopulation/billion).toFixed(1)} Bn</div>
    </div>
  );
}

export default Kpi;
